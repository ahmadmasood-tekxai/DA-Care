"""order customer_email + user phone

Order confirmations and status follow-ups are emailed to the customer, so
orders now record an email address. Customers can also save a phone number
on their account so checkout is pre-filled.

Revision ID: 0007
Revises: 0006
Create Date: 2026-10-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0007'
down_revision: Union[str, None] = '0006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('customer_email', sa.String(length=128), nullable=True))
        batch_op.create_index(batch_op.f('ix_orders_customer_email'), ['customer_email'], unique=False)
        batch_op.create_index(batch_op.f('ix_orders_created_by_id'), ['created_by_id'], unique=False)

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phone', sa.String(length=32), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('phone')

    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_orders_created_by_id'))
        batch_op.drop_index(batch_op.f('ix_orders_customer_email'))
        batch_op.drop_column('customer_email')
