import httpx
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import urllib.parse

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.core.config import settings
from app.constants import AuthProvider, UserRole
from app.models.user import User
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserOut
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username or email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=UserRole.CUSTOMER,  # Public registration always creates customers
        auth_provider=AuthProvider.LOCAL,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Support login with email or username
    user = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.username)
    ).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    from datetime import datetime, timezone
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.username, extra_claims={"role": user.role.value})
    refresh_token = create_refresh_token(subject=user.username)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None


@router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.password:
        current_user.hashed_password = hash_password(payload.password)
    db.commit()
    db.refresh(current_user)
    return current_user


class GoogleVerifyRequest(BaseModel):
    id_token: str


@router.post("/google/verify", response_model=TokenResponse)
async def google_verify(payload: GoogleVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify a Google ID token (from GIS popup) and return a local JWT.
    This endpoint does NOT need a redirect_uri — it works with any authorized JS origin.
    """
    from datetime import datetime, timezone
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.id_token},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        info = r.json()

    # Verify audience
    aud = info.get("aud", "")
    if aud != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Token not issued for this application")

    email = info.get("email")
    google_id = info.get("sub")
    name = info.get("name", "")
    picture = info.get("picture", "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    user = db.query(User).filter(User.email == email).first()
    if user:
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is disabled")
        if not user.google_id:
            user.google_id = google_id
            user.auth_provider = AuthProvider.GOOGLE
            if picture and not user.profile_image:
                user.profile_image = picture
    else:
        base_username = email.split("@")[0]
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            username=username,
            email=email,
            full_name=name or username,
            role=UserRole.CUSTOMER,
            auth_provider=AuthProvider.GOOGLE,
            google_id=google_id,
            profile_image=picture,
        )
        db.add(user)

    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.username, extra_claims={"role": user.role.value})
    refresh_token = create_refresh_token(subject=user.username)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.get("/google/login")
def google_login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    # Exchange code for token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
    }
    
    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=token_data)
        if token_res.status_code != 200:
            frontend_url = "https://okira.vercel.app/login?error=Failed+to+authenticate+with+Google"
            return RedirectResponse(url=frontend_url)
        
        token_json = token_res.json()
        access_token_google = token_json.get("access_token")
        
        # Get user info
        userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {access_token_google}"}
        userinfo_res = await client.get(userinfo_url, headers=headers)
        if userinfo_res.status_code != 200:
            frontend_url = "https://okira.vercel.app/login?error=Failed+to+fetch+user+info"
            return RedirectResponse(url=frontend_url)
            
        user_info = userinfo_res.json()
        
    google_id = user_info.get("id")
    email = user_info.get("email")
    name = user_info.get("name")
    picture = user_info.get("picture")
    
    if not email:
        frontend_url = "https://okira.vercel.app/login?error=Google+account+has+no+email"
        return RedirectResponse(url=frontend_url)
        
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        if not user.is_active:
            frontend_url = "https://okira.vercel.app/login?error=Account+is+disabled"
            return RedirectResponse(url=frontend_url)
        # Link google account if not linked
        if not user.google_id:
            user.google_id = google_id
            user.auth_provider = AuthProvider.GOOGLE
            if picture and not user.profile_image:
                user.profile_image = picture
    else:
        # Create new user
        base_username = email.split("@")[0]
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1
            
        user = User(
            username=username,
            email=email,
            full_name=name or username,
            role=UserRole.CUSTOMER,
            auth_provider=AuthProvider.GOOGLE,
            google_id=google_id,
            profile_image=picture,
        )
        db.add(user)
        
    from datetime import datetime, timezone
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
        
    # Generate token
    access_token = create_access_token(subject=user.username, extra_claims={"role": user.role.value})
    
    # Redirect back to frontend
    frontend_url = f"https://okira.vercel.app/login?access_token={access_token}"
    return RedirectResponse(url=frontend_url)
