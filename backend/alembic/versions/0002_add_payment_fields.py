"""Add payment fields to orders table

Revision ID: 0002_add_payment_fields
Revises: 0001_initial_schema
Create Date: 2026-09-15
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002_add_payment_fields"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add payment_method enum + column
    payment_method_enum = sa.Enum(
        "CASH_ON_DELIVERY", "BANK_TRANSFER",
        name="paymentmethod"
    )
    payment_method_enum.create(op.get_bind(), checkfirst=True)

    # Add payment_status enum + column
    payment_status_enum = sa.Enum(
        "UNPAID", "PENDING_VERIFICATION", "PAID",
        name="paymentstatus"
    )
    payment_status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "orders",
        sa.Column(
            "payment_method",
            sa.Enum("CASH_ON_DELIVERY", "BANK_TRANSFER", name="paymentmethod"),
            nullable=False,
            server_default="CASH_ON_DELIVERY",
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "payment_status",
            sa.Enum("UNPAID", "PENDING_VERIFICATION", "PAID", name="paymentstatus"),
            nullable=False,
            server_default="UNPAID",
        ),
    )
    op.add_column("orders", sa.Column("transaction_ref", sa.String(255), nullable=True))
    op.add_column("orders", sa.Column("receipt_image_url", sa.String(500), nullable=True))
    op.add_column("orders", sa.Column("rejection_reason", sa.String(500), nullable=True))
    op.add_column("orders", sa.Column("transferred_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "confirmed_at")
    op.drop_column("orders", "transferred_at")
    op.drop_column("orders", "rejection_reason")
    op.drop_column("orders", "receipt_image_url")
    op.drop_column("orders", "transaction_ref")
    op.drop_column("orders", "payment_status")
    op.drop_column("orders", "payment_method")

    sa.Enum(name="paymentstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="paymentmethod").drop(op.get_bind(), checkfirst=True)
