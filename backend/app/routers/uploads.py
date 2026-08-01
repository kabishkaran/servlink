from fastapi import APIRouter, Depends, UploadFile

from app.deps import get_current_user
from app.models import User
from app.storage import save_upload

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("")
def upload_file(file: UploadFile, current_user: User = Depends(get_current_user)):
    url = save_upload(file, prefix=f"user{current_user.id}")
    return {"url": url}
