"""add product images

Revision ID: 0004_add_product_images
Revises: 0003
Create Date: 2026-09-16
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0004_add_product_images'
down_revision = '0003'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Create the product_images table
    op.create_table(
        'product_images',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('public_id', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_images_id'), 'product_images', ['id'], unique=False)
    op.create_index(op.f('ix_product_images_product_id'), 'product_images', ['product_id'], unique=False)

    # 2. Data Migration: Copy existing non-empty image_urls into the new product_images table
    # This ensures existing single-images are immediately available in the multi-image gallery
    op.execute(
        """
        INSERT INTO product_images (product_id, url, public_id)
        SELECT id, image_url, image_public_id
        FROM products
        WHERE image_url IS NOT NULL AND image_url != '' AND image_public_id IS NOT NULL
        """
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_product_images_product_id'), table_name='product_images')
    op.drop_index(op.f('ix_product_images_id'), table_name='product_images')
    op.drop_table('product_images')
