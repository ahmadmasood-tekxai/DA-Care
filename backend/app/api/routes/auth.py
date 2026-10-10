import re
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
import urllib.parse

from app.api.deps import get_current_user
from app.constants import AuthProvider, UserRole
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.core.config import settings
from app.constants import AuthProvider, UserRole
from app.models.user import User
from app.schemas.user import (
    GoogleVerifyRequest,
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserOut,
    UserUpdateMe,
)
from app.services import email_service

router = APIRouter(prefix="/auth", tags=["Auth"])

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


def _issue_tokens(user: User) -> TokenResponse:
    access_token = create_access_token(subject=user.username, extra_claims={"role": user.role.value})
    refresh_token = create_refresh_token(subject=user.username)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


def _unique_username(db: Session, seed: str) -> str:
    base = re.sub(r"[^a-z0-9_.]", "", seed.lower())[:50] or "customer"
    if len(base) < 3:
        base = f"{base}user"
    candidate, n = base, 1
    while db.query(User.id).filter(User.username == candidate).first():
        n += 1
        candidate = f"{base}{n}"
    return candidate


class AuthProviders(BaseModel):
    google_client_id: str


@router.get("/providers", response_model=AuthProviders)
def auth_providers():
    """Lets the storefront show 'Continue with Google' only when it's configured."""
    return AuthProviders(google_client_id=settings.GOOGLE_CLIENT_ID)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Public storefront sign-up. Always creates a CUSTOMER and signs them in."""
    if db.query(User.id).filter(func.lower(User.email) == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")
    if payload.username and db.query(User.id).filter(User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This username is taken")

    user = User(
        username=payload.username or _unique_username(db, payload.email.split("@")[0]),
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        phone=payload.phone,
        role=UserRole.CUSTOMER,
        auth_provider=AuthProvider.LOCAL,
        last_login=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    background_tasks.add_task(email_service.send_welcome_email, user.full_name or user.username, user.email)
    return _issue_tokens(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Sign in with either username or email address."""
    identifier = payload.username.strip()
    user = db.query(User).filter(
        (User.username == identifier) | (func.lower(User.email) == identifier.lower())
    ).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        if user and not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This account uses Google sign-in. Please continue with Google.",
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email/username or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return _issue_tokens(user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdateMe, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip() or None
    if payload.new_password:
        # Google-only accounts may set a first password; everyone else must confirm the current one.
        if current_user.hashed_password and not (
            payload.current_password and verify_password(payload.current_password, current_user.hashed_password)
        ):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your current password is incorrect")
        current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/google/verify", response_model=TokenResponse)
def google_verify(payload: GoogleVerifyRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Exchange a Google ID token (from the Google Identity Services popup) for
    our own JWT. No redirect URI needed — works from any authorized JS origin.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google sign-in is not configured")

    try:
        resp = httpx.get(GOOGLE_TOKENINFO_URL, params={"id_token": payload.id_token}, timeout=10)
    except httpx.HTTPError:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach Google. Please try again.")
    if resp.status_code != 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Google token")
    info = resp.json()

    if info.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token not issued for this application")
    email = (info.get("email") or "").lower()
    if not email or str(info.get("email_verified")).lower() != "true":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your Google email address isn't verified")

    google_id = info.get("sub")
    name = info.get("name") or ""
    picture = info.get("picture") or None

    is_new = False
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if user:
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
        if not user.google_id:
            user.google_id = google_id
        if picture and not user.profile_image:
            user.profile_image = picture
        if not user.full_name and name:
            user.full_name = name
    else:
        is_new = True
        user = User(
            username=_unique_username(db, email.split("@")[0]),
            email=email,
            full_name=name,
            role=UserRole.CUSTOMER,
            auth_provider=AuthProvider.GOOGLE,
            google_id=google_id,
            profile_image=picture,
        )
        db.add(user)

    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    if is_new:
        background_tasks.add_task(email_service.send_welcome_email, user.full_name or user.username, user.email)
    return _issue_tokens(user)
