import uuid
import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

# Debug prints to verify config loading (masked for security)
def mask_cred(val: str) -> str:
    if not val:
        return "EMPTY"
    if len(val) <= 4:
        return val
    return f"{val[:2]}...{val[-2:]} (len: {len(val)})"

print("--- CLOUDINARY CONFIG DEBUG ---")
print(f"CLOUD_NAME: {mask_cred(settings.CLOUDINARY_CLOUD_NAME)}")
print(f"API_KEY: {mask_cred(settings.CLOUDINARY_API_KEY)}")
print(f"API_SECRET: {mask_cred(settings.CLOUDINARY_API_SECRET)}")
print("-------------------------------")

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

async def upload_image_to_cloudinary(file: UploadFile, folder: str = "products/misc") -> tuple[str, str]:
    """
    Validates and uploads a single image to Cloudinary.
    Returns a tuple of (secure_url, public_id).
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only JPEG, PNG, WEBP or GIF images are allowed. Received: {file.content_type}",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image is too large — max size is 5 MB.",
        )

    # Generate a unique public ID
    unique_id = uuid.uuid4().hex
    
    try:
        response = cloudinary.uploader.upload(
            contents,
            folder=folder,
            public_id=unique_id,
            resource_type="image"
        )
        secure_url = response.get("secure_url")
        public_id = response.get("public_id")
        return secure_url, public_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image to Cloudinary: {str(e)}"
        )

async def upload_multiple_images_to_cloudinary(files: list[UploadFile], product_id: int) -> list[tuple[str, str]]:
    """
    Uploads multiple images to a specific product folder in Cloudinary.
    Returns a list of tuples: [(secure_url, public_id), ...]
    """
    uploaded_images = []
    folder = f"products/{product_id}" if product_id else "products/misc"
    
    for file in files:
        secure_url, public_id = await upload_image_to_cloudinary(file, folder=folder)
        uploaded_images.append((secure_url, public_id))
        
    return uploaded_images

def delete_image_from_cloudinary(public_id: str) -> None:
    """
    Deletes an image from Cloudinary using its public_id.
    """
    if not public_id:
        return
        
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception as e:
        # We don't raise an error here to prevent blocking deletion of resources
        pass
