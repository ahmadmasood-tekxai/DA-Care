from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter(prefix="/users", tags=["Users"])


class UserStatusUpdate(BaseModel):
    is_active: bool


@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Admin-only: list all users."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.patch("/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int, payload: UserStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)
):
    """Admin-only: activate or deactivate a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user
