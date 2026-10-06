"""add_google_oauth_fields

Revision ID: 0005
Revises: f2840b6e0eee
Create Date: 2026-10-06 14:18:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0005'
down_revision: Union[str, None] = 'f2840b6e0eee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # alter hashed_password to be nullable
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('hashed_password', existing_type=sa.VARCHAR(length=255), nullable=True)
        # Add new columns
        batch_op.add_column(sa.Column('auth_provider', sa.String(length=32), server_default='LOCAL', nullable=False))
        batch_op.add_column(sa.Column('google_id', sa.String(length=128), nullable=True))
        batch_op.add_column(sa.Column('profile_image', sa.String(length=512), nullable=True))
        batch_op.add_column(sa.Column('last_login', sa.DateTime(timezone=True), nullable=True))
        
        batch_op.create_index(batch_op.f('ix_users_google_id'), ['google_id'], unique=True)


def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_users_google_id'))
        batch_op.drop_column('last_login')
        batch_op.drop_column('profile_image')
        batch_op.drop_column('google_id')
        batch_op.drop_column('auth_provider')
        batch_op.alter_column('hashed_password', existing_type=sa.VARCHAR(length=255), nullable=False)
