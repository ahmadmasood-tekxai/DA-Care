from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.constants import AuthProvider, OrderStatus, UserRole
from app.core.database import get_db
from app.core.security import hash_password
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.user import AdminUserOut, AdminUserUpdate, StaffCreate

router = APIRouter(prefix="/users", tags=["Users"])


def _order_stats(db: Session, user_ids: list[int]) -> dict[int, tuple[int, Decimal, object]]:
    """{user_id: (orders_count, total_spent, last_order_at)} — cancelled orders don't count as spend."""
    if not user_ids:
        return {}
    counts = dict(
        db.query(Order.created_by_id, func.count(Order.id))
        .filter(Order.created_by_id.in_(user_ids))
        .group_by(Order.created_by_id)
        .all()
    )
    last = dict(
        db.query(Order.created_by_id, func.max(Order.created_at))
        .filter(Order.created_by_id.in_(user_ids))
        .group_by(Order.created_by_id)
        .all()
    )
    spent = dict(
        db.query(Order.created_by_id, func.sum(OrderItem.unit_price * OrderItem.quantity))
        .join(OrderItem, OrderItem.order_id == Order.id)
        .filter(Order.created_by_id.in_(user_ids), Order.status != OrderStatus.CANCELLED)
        .group_by(Order.created_by_id)
        .all()
    )
    return {
        uid: (counts.get(uid, 0), Decimal(str(spent.get(uid) or 0)), last.get(uid))
        for uid in user_ids
    }


def _with_stats(user: User, stats: tuple[int, Decimal, object]) -> AdminUserOut:
    out = AdminUserOut.model_validate(user)
    out.orders_count, out.total_spent, out.last_order_at = stats
    return out


@router.get("", response_model=List[AdminUserOut])
def list_users(
    role: Optional[UserRole] = Query(default=None),
    search: Optional[str] = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin-only: every account with purchase stats, newest first."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(func.lower(User.full_name).like(term), func.lower(User.email).like(term), func.lower(User.username).like(term))
        )
    users = query.order_by(User.created_at.desc()).all()
    stats = _order_stats(db, [u.id for u in users])
    return [_with_stats(u, stats[u.id]) for u in users]


@router.post("", response_model=AdminUserOut, status_code=status.HTTP_201_CREATED)
def create_staff(payload: StaffCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Admin-only: add another admin or staff member."""
    if payload.role == UserRole.CUSTOMER:
        raise HTTPException(status_code=400, detail="Customers sign up on the storefront")
    exists = db.query(User.id).filter(
        (User.username == payload.username) | (func.lower(User.email) == payload.email)
    ).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username or email already registered")
    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        auth_provider=AuthProvider.LOCAL,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _with_stats(user, (0, Decimal("0"), None))


@router.patch("/{user_id}", response_model=AdminUserOut)
def update_user(
    user_id: int, payload: AdminUserUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)
):
    """Admin-only: activate/deactivate an account or change its role."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id and (payload.is_active is False or (payload.role and payload.role != UserRole.ADMIN)):
        raise HTTPException(status_code=400, detail="You can't deactivate or demote your own account")

    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role is not None:
        user.role = payload.role
    db.commit()
    db.refresh(user)
    return _with_stats(user, _order_stats(db, [user.id])[user.id])


# Kept for the earlier admin UI, which toggled status via this path.
@router.patch("/{user_id}/status", response_model=AdminUserOut)
def update_user_status(
    user_id: int, payload: AdminUserUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)
):
    return update_user(user_id, AdminUserUpdate(is_active=payload.is_active), db, admin)
