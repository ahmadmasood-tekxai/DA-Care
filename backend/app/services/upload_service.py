"""
File upload handling for OKIRA store.

Files are saved under `uploads/<subfolder>/` (served statically at
`/uploads/<subfolder>/...` by FastAPI's StaticFiles). This is intentionally a
local-disk folder for development/small deployments — for production at scale,
swap for an S3/cloud-storage backed implementation without touching route code.

On serverless environments (e.g. Vercel), file writes will fail gracefully
since the filesystem is read-only. In that case, upload via a cloud provider.
"""
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"
PRODUCT_UPLOAD_DIR = UPLOAD_ROOT / "products"
RECEIPT_UPLOAD_DIR = UPLOAD_ROOT / "receipts"

# --- NOTE: Directories are created lazily (on first use), NOT at import time.
# This prevents crashes on read-only serverless filesystems (Vercel, etc.).

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _extension_for(content_type: str) -> str:
    return {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }[content_type]


def _ensure_dir(path: Path) -> bool:
    """Try to create a directory. Returns False on read-only filesystems."""
    try:
        path.mkdir(parents=True, exist_ok=True)
        return True
    except OSError:
        return False


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

    if not _ensure_dir(PRODUCT_UPLOAD_DIR):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage is not available in this environment. Use a cloud storage provider.",
        )

    filename = f"{uuid.uuid4().hex}{_extension_for(file.content_type)}"
    destination = PRODUCT_UPLOAD_DIR / filename
    destination.write_bytes(contents)

    return f"/uploads/products/{filename}"


async def save_upload(file: UploadFile, subfolder: str = "products") -> str:
    """Generic upload handler that saves to any subfolder under uploads/."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, WEBP or GIF images are allowed.",
        )
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too large — max size is 5 MB.",
        )

    dest_dir = UPLOAD_ROOT / subfolder
    if not _ensure_dir(dest_dir):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="File storage is not available in this environment. Use a cloud storage provider.",
        )

    filename = f"{uuid.uuid4().hex}{_extension_for(file.content_type)}"
    (dest_dir / filename).write_bytes(contents)
    return f"/uploads/{subfolder}/{filename}"


def delete_product_image(image_url: str) -> None:
    """Best-effort cleanup when a product's image is replaced or the product is deleted."""
    if not image_url or not image_url.startswith("/uploads/products/"):
        return
    filename = image_url.split("/uploads/products/")[-1]
    path = PRODUCT_UPLOAD_DIR / filename
    try:
        if path.exists() and path.is_file():
            path.unlink(missing_ok=True)
    except OSError:
        pass  # Read-only filesystem — skip silently
