from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload

from app.api.deps import require_staff
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate, CategoryWithCountOut
from app.schemas.product import ProductOut
from app.schemas.common import PaginatedResponse
from app.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from app.services.product_query import SORT_PATTERN, apply_search, apply_sort
from app.services.slug_service import generate_unique_slug
from app.services.cloudinary_service import upload_image_to_cloudinary

router = APIRouter(prefix="/categories", tags=["Categories"])


def _with_count(db: Session, category: Category) -> dict:
    count = db.query(Product).filter(Product.category_id == category.id, Product.is_active.is_(True)).count()
    subcategories = db.query(Category).filter(Category.parent_id == category.id).order_by(Category.display_order, Category.name).all()
    return {
        "id": category.id, "name": category.name, "slug": category.slug,
        "description": category.description, "icon": category.icon,
        "image_url": category.image_url,
        "display_order": category.display_order, "created_at": category.created_at,
        "updated_at": category.updated_at, "product_count": count,
        "parent_id": category.parent_id,
        "subcategories": [
            {
                "id": s.id, "name": s.name, "slug": s.slug, "description": s.description,
                "icon": s.icon, "image_url": s.image_url, "display_order": s.display_order,
                "parent_id": s.parent_id, "created_at": s.created_at, "updated_at": s.updated_at,
            }
            for s in subcategories
        ],
    }


@router.get("", response_model=List[CategoryWithCountOut])
def list_categories(
    parent_only: bool = Query(default=True, description="If true, only return top-level categories with their subcategories nested"),
    db: Session = Depends(get_db)
):
    """Public — used by the storefront to render category navigation/sections.
    By default returns only top-level categories (parent_id is NULL) with subcategories nested inside.
    Set parent_only=false to return all categories flat."""
    if parent_only:
        categories = db.query(Category).filter(Category.parent_id.is_(None)).order_by(Category.display_order, Category.name).all()
    else:
        categories = db.query(Category).order_by(Category.display_order, Category.name).all()
    return [_with_count(db, c) for c in categories]


@router.get("/{slug}", response_model=CategoryWithCountOut)
def get_category(slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == slug).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return _with_count(db, category)


@router.get("/{slug}/products", response_model=PaginatedResponse[ProductOut])
def get_category_products(
    slug: str,
    search: Optional[str] = Query(default=None),
    subcategory_id: Optional[int] = Query(default=None),
    sort: str = Query(default="newest", pattern=SORT_PATTERN),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    db: Session = Depends(get_db),
):
    """Get all products for a category (or subcategory) with search, filter, and pagination."""
    from sqlalchemy.orm import joinedload as jl
    category = db.query(Category).filter(Category.slug == slug).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    # If this is a parent category, also include products from all its subcategories (unless subcategory_id is specified)
    if subcategory_id:
        query = db.query(Product).options(jl(Product.images)).filter(
            Product.subcategory_id == subcategory_id,
            Product.is_active.is_(True)
        )
    elif category.parent_id is None:
        # Parent category: get products from this category AND all subcategories
        subcategory_ids = [s.id for s in db.query(Category).filter(Category.parent_id == category.id).all()]
        all_ids = [category.id] + subcategory_ids
        query = db.query(Product).options(jl(Product.images)).filter(
            Product.category_id.in_(all_ids),
            Product.is_active.is_(True)
        )
    else:
        query = db.query(Product).options(jl(Product.images)).filter(
            Product.category_id == category.id,
            Product.is_active.is_(True)
        )

    query = apply_search(query, search)

    total = query.count()
    items = (
        apply_sort(query, sort)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(require_staff)):
    # If parent_id is given, validate it
    if payload.parent_id:
        parent = db.query(Category).filter(Category.id == payload.parent_id).first()
        if not parent:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent category not found")
        # Prevent nesting beyond one level
        if parent.parent_id is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subcategories can only be one level deep")

    slug = generate_unique_slug(db, Category, payload.name)
    category = Category(
        name=payload.name, slug=slug, description=payload.description or "",
        icon=payload.icon, image_url=payload.image_url, display_order=payload.display_order,
        parent_id=payload.parent_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_staff)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != category.name:
        category.slug = generate_unique_slug(db, Category, update_data["name"], exclude_id=category.id)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_staff)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    db.delete(category)
    db.commit()

@router.post("/{category_id}/image", response_model=CategoryOut)
async def upload_category_image(
    category_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    new_image_url, _ = await upload_image_to_cloudinary(file)
    category.image_url = new_image_url
    
    db.commit()
    db.refresh(category)
    return category
