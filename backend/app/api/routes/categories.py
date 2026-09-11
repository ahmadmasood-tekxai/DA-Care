from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate, CategoryWithCountOut
from app.services.slug_service import generate_unique_slug

router = APIRouter(prefix="/categories", tags=["Categories"])


def _with_count(db: Session, category: Category) -> dict:
    count = db.query(Product).filter(Product.category_id == category.id, Product.is_active.is_(True)).count()
    return {
        "id": category.id, "name": category.name, "slug": category.slug,
        "description": category.description, "icon": category.icon,
        "display_order": category.display_order, "created_at": category.created_at,
        "updated_at": category.updated_at, "product_count": count,
    }


@router.get("", response_model=List[CategoryWithCountOut])
def list_categories(db: Session = Depends(get_db)):
    """Public — used by the storefront to render category navigation/sections."""
    categories = db.query(Category).order_by(Category.display_order, Category.name).all()
    return [_with_count(db, c) for c in categories]


@router.get("/{slug}", response_model=CategoryOut)
def get_category(slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == slug).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    slug = generate_unique_slug(db, Category, payload.name)
    category = Category(
        name=payload.name, slug=slug, description=payload.description or "",
        icon=payload.icon, display_order=payload.display_order,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
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
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    db.delete(category)
    db.commit()
