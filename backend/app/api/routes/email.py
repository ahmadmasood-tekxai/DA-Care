from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.api.deps import require_admin
from app.core.config import settings
from app.models.user import User
from app.schemas.common import Message
from app.services import email_service

router = APIRouter(prefix="/email", tags=["Email"])


class EmailStatus(BaseModel):
    enabled: bool
    host: str
    port: int
    from_email: str
    from_name: str
    admin_email: str


class TestEmailRequest(BaseModel):
    to: Optional[EmailStr] = None


@router.get("/status", response_model=EmailStatus)
def email_status(admin: User = Depends(require_admin)):
    """Admin-only: is outgoing email configured, and from which address."""
    from_email = settings.FROM_EMAIL or settings.SMTP_USERNAME
    return EmailStatus(
        enabled=settings.smtp_enabled,
        host=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        from_email=from_email,
        from_name=settings.FROM_NAME,
        admin_email=settings.ADMIN_EMAIL or from_email,
    )


@router.post("/test", response_model=Message)
def send_test_email(payload: TestEmailRequest, admin: User = Depends(require_admin)):
    """Admin-only: send a test email (to the admin inbox by default) and report SMTP errors."""
    if not settings.smtp_enabled:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="SMTP username/password are not set on the server")
    to = payload.to or settings.ADMIN_EMAIL or settings.FROM_EMAIL or settings.SMTP_USERNAME
    try:
        email_service.send_test_email(to)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"SMTP error: {exc}")
    return Message(message=f"Test email sent to {to}")
