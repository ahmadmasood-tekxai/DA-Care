from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_optional_user, require_staff
from app.constants import (
    BANK_ACCOUNT_NUMBER,
    BANK_ACCOUNT_TITLE,
    BANK_IBAN,
    BANK_NAME,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
)
from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.common import Message
from app.schemas.order import (
    BankDetailsOut,
    OrderCreate,
    OrderOut,
    OrderStatusUpdate,
    PaymentVerificationAction,
)
from app.services import email_service
from app.services.email_service import OrderEmail
from app.services.upload_service import save_upload

router = APIRouter(prefix="/orders", tags=["Orders"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_order_out(order: Order) -> OrderOut:
    total = sum((Decimal(item.unit_price) * item.quantity for item in order.items), Decimal("0"))
    return OrderOut(
        id=order.id,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_email=order.customer_email,
        customer_address=order.customer_address,
        status=order.status,
        note=order.note,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        transaction_ref=order.transaction_ref,
        receipt_image_url=order.receipt_image_url,
        rejection_reason=order.rejection_reason,
        transferred_at=order.transferred_at,
        confirmed_at=order.confirmed_at,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[
            {
                "id": i.id,
                "product_id": i.product_id,
                "product_name_snapshot": i.product_name_snapshot,
                "unit_price": i.unit_price,
                "quantity": i.quantity,
            }
            for i in order.items
        ],
        total_amount=total,
        created_by_id=order.created_by_id,
    )


def _get_order(db: Session, order_id: int) -> Order:
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


# ---------------------------------------------------------------------------
# Public: Bank Details
# ---------------------------------------------------------------------------

@router.get("/bank-details", response_model=BankDetailsOut, tags=["Orders"])
def get_bank_details():
    """Public endpoint — returns configured bank account info for checkout display."""
    return BankDetailsOut(
        account_title=BANK_ACCOUNT_TITLE,
        bank_name=BANK_NAME,
        account_number=BANK_ACCOUNT_NUMBER,
        iban=BANK_IBAN,
    )


# ---------------------------------------------------------------------------
# Public: Place Order
# ---------------------------------------------------------------------------

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Public — used by the storefront's cart checkout (guest or signed in).
    Supports both Cash-on-Delivery and Bank Transfer payment methods.
    Emails the customer a confirmation and the store an order alert.
    """
    order = Order(
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_email=payload.customer_email or (current_user.email if current_user else None),
        customer_address=payload.customer_address or "",
        note=payload.note or "",
        payment_method=payload.payment_method,
        payment_status=PaymentStatus.UNPAID,
        created_by_id=current_user.id if current_user else None,
    )
    db.add(order)
    db.flush()

    low_stock: list[tuple[str, int]] = []
    for line in payload.items:
        product = db.query(Product).filter(Product.id == line.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product id {line.product_id} not found",
            )

        if product.stock < line.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for '{product.name}'. Only {product.stock} available.",
            )

        previous_stock = product.stock
        product.stock = product.stock - line.quantity
        db.add(product)  # ensure SQLAlchemy tracks the change
        if email_service.should_alert_low_stock(previous_stock, product.stock):
            low_stock.append((product.name, product.stock))

        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name_snapshot=product.name,
                unit_price=product.price,
                quantity=line.quantity,
            )
        )

    # Keep the customer's phone on their account so the next checkout is pre-filled.
    if current_user and not current_user.phone and payload.customer_phone:
        current_user.phone = payload.customer_phone

    db.commit()
    order = _get_order(db, order.id)

    background_tasks.add_task(email_service.notify_order_placed, OrderEmail.from_order(order))
    for name, remaining in low_stock:
        background_tasks.add_task(email_service.send_low_stock_alert, name, remaining)

    return _to_order_out(order)


# ---------------------------------------------------------------------------
# Customer: own order history
# ---------------------------------------------------------------------------

@router.get("/mine", response_model=List[OrderOut])
def list_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Orders placed while signed in. Guest orders aren't matched by email —
    sign-up doesn't verify addresses, so that would leak other people's orders."""
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.created_by_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_to_order_out(o) for o in orders]


# ---------------------------------------------------------------------------
# Public: Customer marks bank transfer as done
# ---------------------------------------------------------------------------

@router.post("/{order_id}/mark-transferred", response_model=OrderOut)
async def mark_transferred(
    order_id: int,
    background_tasks: BackgroundTasks,
    transaction_ref: Optional[str] = Form(default=None),
    receipt: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
):
    """
    Customer submits 'I've Made the Transfer'.
    Optionally attaches a receipt image and/or transaction reference.
    Moves payment_status to PENDING_VERIFICATION.
    """
    order = _get_order(db, order_id)
    if order.payment_method != PaymentMethod.BANK_TRANSFER:
        raise HTTPException(status_code=400, detail="This order is not a bank transfer order")
    if order.payment_status == PaymentStatus.PAID:
        raise HTTPException(status_code=400, detail="Payment already confirmed")

    receipt_url = None
    if receipt and receipt.filename:
        receipt_url = await save_upload(receipt, subfolder="receipts")

    order.payment_status = PaymentStatus.PENDING_VERIFICATION
    order.transaction_ref = transaction_ref
    order.receipt_image_url = receipt_url
    order.rejection_reason = None
    order.transferred_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)

    background_tasks.add_task(email_service.notify_transfer_submitted, OrderEmail.from_order(order))
    return _to_order_out(order)


# ---------------------------------------------------------------------------
# Admin: List Orders
# ---------------------------------------------------------------------------

@router.get("", response_model=List[OrderOut])
def list_orders(
    status_filter: Optional[OrderStatus] = Query(default=None, alias="status"),
    payment_status_filter: Optional[PaymentStatus] = Query(default=None, alias="payment_status"),
    user_id: Optional[int] = Query(default=None, description="Only orders placed by this customer account"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    query = db.query(Order).options(joinedload(Order.items))
    if status_filter:
        query = query.filter(Order.status == status_filter)
    if payment_status_filter:
        query = query.filter(Order.payment_status == payment_status_filter)
    if user_id:
        query = query.filter(Order.created_by_id == user_id)
    orders = query.order_by(Order.created_at.desc()).all()
    return [_to_order_out(o) for o in orders]


# ---------------------------------------------------------------------------
# Admin: Update Order Status
# ---------------------------------------------------------------------------

@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    order = _get_order(db, order_id)

    old_status = order.status
    new_status = payload.status
    if old_status == new_status:
        return _to_order_out(order)

    # Stock adjustment logic:
    # If order is being CANCELLED → restore stock for each item
    if new_status == OrderStatus.CANCELLED and old_status != OrderStatus.CANCELLED:
        for item in order.items:
            if item.product_id:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    product.stock = product.stock + item.quantity
                    db.add(product)

    # If order is being UN-CANCELLED (moved back to active) → deduct stock again
    elif old_status == OrderStatus.CANCELLED and new_status != OrderStatus.CANCELLED:
        for item in order.items:
            if item.product_id:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    if product.stock < item.quantity:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Cannot reactivate: not enough stock for '{item.product_name_snapshot}' (only {product.stock} left).",
                        )
                    product.stock = product.stock - item.quantity
                    db.add(product)

    order.status = new_status
    db.commit()
    db.refresh(order)

    background_tasks.add_task(email_service.notify_status_changed, OrderEmail.from_order(order))
    return _to_order_out(order)


# ---------------------------------------------------------------------------
# Admin: Confirm / Reject Bank Transfer Payment
# ---------------------------------------------------------------------------

@router.post("/{order_id}/verify-payment", response_model=OrderOut)
def verify_payment(
    order_id: int,
    payload: PaymentVerificationAction,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    """
    Admin confirms or rejects a pending bank transfer.
    - confirm → payment_status = PAID, order status = CONFIRMED
    - reject  → payment_status = UNPAID, rejection_reason set
    The customer is emailed either way.
    """
    order = _get_order(db, order_id)
    if order.payment_status != PaymentStatus.PENDING_VERIFICATION:
        raise HTTPException(status_code=400, detail="Order is not pending verification")

    if payload.action == "confirm":
        order.payment_status = PaymentStatus.PAID
        order.status = OrderStatus.CONFIRMED
        order.confirmed_at = datetime.now(timezone.utc)
        order.rejection_reason = None
    else:
        order.payment_status = PaymentStatus.UNPAID
        order.rejection_reason = payload.rejection_reason or "The transfer could not be matched with our bank statement."

    db.commit()
    db.refresh(order)

    background_tasks.add_task(email_service.notify_payment_verified, OrderEmail.from_order(order))
    return _to_order_out(order)


# ---------------------------------------------------------------------------
# Admin: Send the customer a follow-up for the order's current state
# ---------------------------------------------------------------------------

@router.post("/{order_id}/follow-up", response_model=Message)
def send_follow_up(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    """Re-sends the email for where the order stands now — a payment reminder
    for unpaid transfers, otherwise the latest status update."""
    order = _get_order(db, order_id)
    if not order.customer_email:
        raise HTTPException(status_code=400, detail="This order has no customer email address")
    try:
        sent = email_service.send_order_follow_up(OrderEmail.from_order(order))
    except Exception as exc:  # surface SMTP problems to the admin
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Email could not be sent: {exc}")
    if not sent:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Email is not configured on the server")
    return Message(message=f"Follow-up sent to {order.customer_email}")
