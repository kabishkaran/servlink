from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_role
from app.models import Category, PricingModel, Provider, User, UserRole
from app.schemas import CategoryOut, ProviderOut
from app.storage import save_upload

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.post("/register", response_model=ProviderOut, status_code=status.HTTP_201_CREATED)
def register_provider(
    business_name: str = Form(...),
    category_slug: str = Form(...),
    description: str = Form(""),
    service_area: str = Form(""),
    pricing_model: PricingModel = Form(PricingModel.hourly),
    nic_document: UploadFile | None = None,
    cert_document: UploadFile | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if db.query(Provider).filter(Provider.user_id == current_user.id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Provider profile already exists")

    category = db.query(Category).filter(Category.slug == category_slug).first()
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown category")

    if current_user.role != UserRole.provider:
        current_user.role = UserRole.provider

    provider = Provider(
        user_id=current_user.id,
        business_name=business_name,
        category_id=category.id,
        description=description,
        service_area=service_area,
        pricing_model=pricing_model,
        nic_document_path=save_upload(nic_document, f"nic_{current_user.id}") if nic_document else None,
        cert_document_path=save_upload(cert_document, f"cert_{current_user.id}") if cert_document else None,
    )
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


@router.get("/me", response_model=ProviderOut)
def get_my_provider_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.provider)),
):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if provider is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No provider profile for this account")
    return provider
