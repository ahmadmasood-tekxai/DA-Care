"""add_customer_role_and_userrole_enum

Revision ID: 0006
Revises: 0005
Create Date: 2026-10-06 14:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0006'
down_revision: Union[str, None] = '0005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL: add CUSTOMER to the userrole enum
    # This is a raw SQL approach — safe for PostgreSQL
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'CUSTOMER'")


def downgrade() -> None:
    # PostgreSQL enums cannot remove values without recreating the type.
    # Safest downgrade: do nothing (CUSTOMER simply won't be used if rolled back)
    pass
