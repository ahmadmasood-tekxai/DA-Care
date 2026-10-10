from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import require_staff
from app.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, ProductBadge
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.product import ProductCreate, ProductDetailOut, ProductOut, ProductUpdate
from app.services.product_query import SORT_PATTERN, apply_search, apply_sort
from app.services.slug_service import generate_unique_slug
from app.services.cloudinary_service import delete_image_from_cloudinary, upload_image_to_cloudinary, upload_multiple_images_to_cloudinary

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=PaginatedResponse[ProductOut])
def list_products(
    category_slug: Optional[str] = Query(default=None),
    subcategory_id: Optional[int] = Query(default=None),
    search: Optional[str] = Query(default=None),
    is_featured: Optional[bool] = Query(default=None),
    on_sale: Optional[bool] = Query(default=None, description="Only products with an old_price above the current price"),
    badge: Optional[ProductBadge] = Query(default=None),
    sort: str = Query(default="newest", pattern=SORT_PATTERN),
    include_inactive: bool = Query(default=False, description="Admin-only view of inactive products"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    db: Session = Depends(get_db),
):
    """Public — powers the storefront's Products page & category filters."""
    query = db.query(Product).options(joinedload(Product.images))
    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))
    if category_slug:
        query = query.join(Category, Product.category_id == Category.id).filter(Category.slug == category_slug)
    if subcategory_id:
        query = query.filter(Product.subcategory_id == subcategory_id)
    query = apply_search(query, search)
    if is_featured is not None:
        query = query.filter(Product.is_featured.is_(is_featured))
    if on_sale:
        query = query.filter(Product.old_price.is_not(None), Product.old_price > Product.price)
    if badge:
        query = query.filter(Product.badge == badge)

    total = query.count()
    items = (
        apply_sort(query, sort)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.get("/{slug}", response_model=ProductDetailOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    """Public — the individual product detail page."""
    product = (
        db.query(Product)
        .options(joinedload(Product.category))
        .options(joinedload(Product.subcategory))
        .options(joinedload(Product.images))
        .filter(Product.slug == slug)
        .first()
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(require_staff)):
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # Validate subcategory if provided
    if payload.subcategory_id:
        subcategory = db.query(Category).filter(Category.id == payload.subcategory_id).first()
        if not subcategory:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")
        if subcategory.parent_id != payload.category_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subcategory does not belong to the selected category")

    slug = generate_unique_slug(db, Product, payload.name)
    product = Product(
        category_id=payload.category_id, subcategory_id=payload.subcategory_id,
        name=payload.name, slug=slug,
        short_description=payload.short_description, description=payload.description or "",
        price=payload.price, old_price=payload.old_price, stock=payload.stock,
        image_color=payload.image_color, badge=payload.badge,
        is_featured=payload.is_featured, is_active=payload.is_active,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_staff)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "category_id" in update_data:
        category = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if "subcategory_id" in update_data and update_data["subcategory_id"]:
        subcategory = db.query(Category).filter(Category.id == update_data["subcategory_id"]).first()
        if not subcategory:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")
    if "name" in update_data and update_data["name"] != product.name:
        product.slug = generate_unique_slug(db, Product, update_data["name"], exclude_id=product.id)

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.post("/{product_id}/image", response_model=ProductOut)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    """Uploads/replaces a product's primary image via Cloudinary."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    old_image_url = product.image_url
    old_public_id = product.image_public_id
    new_image_url, new_public_id = await upload_image_to_cloudinary(file)

    product.image_url = new_image_url
    product.image_public_id = new_public_id
    db.commit()
    db.refresh(product)

    if old_public_id:
        delete_image_from_cloudinary(old_public_id)

    return product


@router.post("/{product_id}/images", response_model=ProductOut)
async def upload_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    """Uploads multiple gallery images to Cloudinary for a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    uploaded = await upload_multiple_images_to_cloudinary(files, product_id)
    
    for secure_url, public_id in uploaded:
        new_img = ProductImage(product_id=product_id, url=secure_url, public_id=public_id)
        db.add(new_img)
    
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    """Deletes a single gallery image from a product (removes from Cloudinary + DB)."""
    image = db.query(ProductImage).filter(
        ProductImage.id == image_id,
        ProductImage.product_id == product_id
    ).first()
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    
    public_id = image.public_id
    db.delete(image)
    db.commit()
    
    # Delete from Cloudinary after DB commit succeeds
    if public_id:
        delete_image_from_cloudinary(public_id)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_staff)):
    product = db.query(Product).options(joinedload(Product.images)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    if product.image_public_id:
        delete_image_from_cloudinary(product.image_public_id)
        
    for image in product.images:
        delete_image_from_cloudinary(image.public_id)
        
    db.delete(product)
    db.commit()
