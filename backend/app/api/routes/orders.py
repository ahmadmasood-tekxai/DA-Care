from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
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
from app.schemas.order import (
    BankDetailsOut,
    BankTransferConfirm,
    OrderCreate,
    OrderOut,
    OrderStatusUpdate,
    PaymentVerificationAction,
)
from app.services import email_service
from app.services.upload_service import save_upload
from datetime import datetime, timezone

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
    )


def _build_items_payload(order: Order) -> list:
    return [
        {
            "name": i.product_name_snapshot,
            "qty": i.quantity,
            "price": f"{Decimal(i.unit_price) * i.quantity:.2f}",
        }
        for i in order.items
    ]


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
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """
    Public — used by the storefront's cart checkout.
    Supports both Cash-on-Delivery and Bank Transfer payment methods.
    """
    order = Order(
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_address=payload.customer_address or "",
        note=payload.note or "",
        payment_method=payload.payment_method,
        payment_status=PaymentStatus.UNPAID,
    )
    db.add(order)
    db.flush()

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
            
        # Decrease stock and explicitly mark the product as modified
        product.stock = product.stock - line.quantity
        db.add(product)  # ensure SQLAlchemy tracks the change
        
        # Trigger low stock email if it hits 5 or below
        if product.stock <= 5:
            email_service.fire_and_forget(
                email_service.send_low_stock_email(
                    product_name=product.name,
                    remaining_stock=product.stock,
                    product_id=product.id
                )
            )

        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name_snapshot=product.name,
                unit_price=product.price,
                quantity=line.quantity,
            )
        )

    db.commit()
    db.refresh(order)
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order.id).first()

    total = sum((Decimal(item.unit_price) * item.quantity for item in order.items), Decimal("0"))
    items_payload = _build_items_payload(order)

    if payload.payment_method == PaymentMethod.CASH_ON_DELIVERY:
        email_service.fire_and_forget(
            email_service.send_cod_order_email(
                order_id=order.id,
                customer_name=order.customer_name,
                customer_phone=order.customer_phone,
                customer_address=order.customer_address,
                items=items_payload,
                total=total,
            )
        )

    return _to_order_out(order)


# ---------------------------------------------------------------------------
# Public: Customer marks bank transfer as done
# ---------------------------------------------------------------------------

@router.post("/{order_id}/mark-transferred", response_model=OrderOut)
async def mark_transferred(
    order_id: int,
    transaction_ref: Optional[str] = Form(default=None),
    receipt: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
):
    """
    Customer submits 'I've Made the Transfer'.
    Optionally attaches a receipt image and/or transaction reference.
    Moves payment_status to PENDING_VERIFICATION.
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
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
    order.transferred_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(order)

    total = sum((Decimal(i.unit_price) * i.quantity for i in order.items), Decimal("0"))
    email_service.fire_and_forget(
        email_service.send_bank_transfer_pending_email(
            order_id=order.id,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            customer_address=order.customer_address or "",
            items=_build_items_payload(order),
            total=total,
            transaction_ref=transaction_ref,
            receipt_image_url=receipt_url,
        )
    )

    return _to_order_out(order)


# ---------------------------------------------------------------------------
# Admin: List Orders
# ---------------------------------------------------------------------------

@router.get("", response_model=List[OrderOut])
def list_orders(
    status_filter: Optional[OrderStatus] = Query(default=None, alias="status"),
    payment_status_filter: Optional[PaymentStatus] = Query(default=None, alias="payment_status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order).options(joinedload(Order.items))
    if status_filter:
        query = query.filter(Order.status == status_filter)
    if payment_status_filter:
        query = query.filter(Order.payment_status == payment_status_filter)
    orders = query.order_by(Order.created_at.desc()).all()
    return [_to_order_out(o) for o in orders]


# ---------------------------------------------------------------------------
# Admin: Update Order Status
# ---------------------------------------------------------------------------

@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    old_status = order.status
    new_status = payload.status

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
    return _to_order_out(order)



# ---------------------------------------------------------------------------
# Admin: Confirm / Reject Bank Transfer Payment
# ---------------------------------------------------------------------------

@router.post("/{order_id}/verify-payment", response_model=OrderOut)
def verify_payment(
    order_id: int,
    payload: PaymentVerificationAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Admin confirms or rejects a pending bank transfer.
    - confirm → payment_status = PAID, order status = CONFIRMED
    - reject  → payment_status = UNPAID, rejection_reason set
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.payment_status != PaymentStatus.PENDING_VERIFICATION:
        raise HTTPException(status_code=400, detail="Order is not pending verification")

    if payload.action == "confirm":
        order.payment_status = PaymentStatus.PAID
        order.status = OrderStatus.CONFIRMED
        order.confirmed_at = datetime.now(timezone.utc)
        order.rejection_reason = None
    else:
        order.payment_status = PaymentStatus.UNPAID
        order.rejection_reason = payload.rejection_reason

    db.commit()
    db.refresh(order)
    return _to_order_out(order)
