"""
Product image upload handling.

Images are saved under `uploads/products/` (served statically at
`/uploads/products/...` by FastAPI's StaticFiles). This is intentionally a
local-disk "temp uploads" folder for development/small deployments — for
production at scale, swap this module's `save_product_image` for an S3 /
cloud-storage backed implementation without touching any route code.
"""
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"
PRODUCT_UPLOAD_DIR = UPLOAD_ROOT / "products"
PRODUCT_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _extension_for(content_type: str) -> str:
    return {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }[content_type]


async def save_product_image(file: UploadFile) -> str:
    """Validates and saves an uploaded product image; returns its public URL path."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, WEBP or GIF images are allowed.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image is too large — max size is 5 MB.",
        )

    filename = f"{uuid.uuid4().hex}{_extension_for(file.content_type)}"
    destination = PRODUCT_UPLOAD_DIR / filename
    destination.write_bytes(contents)

    return f"/uploads/products/{filename}"


def delete_product_image(image_url: str) -> None:
    """Best-effort cleanup when a product's image is replaced or the product is deleted."""
    if not image_url or not image_url.startswith("/uploads/products/"):
        return
    filename = image_url.split("/uploads/products/")[-1]
    path = PRODUCT_UPLOAD_DIR / filename
    if path.exists() and path.is_file():
        path.unlink(missing_ok=True)
