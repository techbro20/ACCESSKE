import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf"}
ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf"
}

UPLOAD_DIR = Path("uploads/posters")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def validate_file(file: UploadFile) -> None:
    """Validate that the uploaded file is a PNG, JPG, or PDF."""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: PNG, JPG, PDF"
        )
    
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file MIME type. Allowed types: PNG, JPG, PDF"
        )


async def save_uploaded_file(file: UploadFile, event_id: str) -> str:
    """Save uploaded file and return the relative path."""
    validate_file(file)
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    filename = f"{event_id}_{uuid.uuid4().hex[:8]}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Return relative path for storage in database
    return f"posters/{filename}"


def delete_file(file_path: str) -> None:
    """Delete a file if it exists."""
    if not file_path:
        return
    
    # Handle both relative and absolute paths
    if file_path.startswith("posters/"):
        full_path = UPLOAD_DIR.parent / file_path
    else:
        full_path = Path(file_path)
    
    if full_path.exists():
        try:
            full_path.unlink()
        except Exception:
            pass  # Ignore errors when deleting files

