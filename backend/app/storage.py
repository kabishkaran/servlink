import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import BASE_DIR, settings

UPLOAD_DIR = BASE_DIR / settings.upload_dir
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}


def save_upload(file: UploadFile, prefix: str) -> str:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".bin"
    filename = f"{prefix}_{uuid.uuid4().hex}{ext}"
    destination = UPLOAD_DIR / filename
    with destination.open("wb") as f:
        f.write(file.file.read())
    return f"/uploads/{filename}"
