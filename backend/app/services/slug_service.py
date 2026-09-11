from slugify import slugify
from sqlalchemy.orm import Session


def generate_unique_slug(db: Session, model, name: str, exclude_id: int | None = None) -> str:
    """Generates a URL-safe slug from `name`, appending -2, -3, ... on collision."""
    base_slug = slugify(name)
    slug = base_slug
    counter = 2
    while True:
        query = db.query(model).filter(model.slug == slug)
        if exclude_id is not None:
            query = query.filter(model.id != exclude_id)
        if not query.first():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1
