from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_role
from app.models import Category, Provider, User, UserRole
from app.schemas import CategoryOut, ProviderOut, ProviderRegisterRequest

router = APIRouter(prefix="/api/providers", tags=["providers"])


@router.post("/register", response_model=ProviderOut, status_code=status.HTTP_201_CREATED)
def register_provider(
    payload: ProviderRegisterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if db.query(Provider).filter(Provider.user_id == current_user.id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Provider profile already exists")

    category = db.query(Category).filter(Category.slug == payload.category_slug).first()
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown category")

    if current_user.role != UserRole.provider:
        current_user.role = UserRole.provider

    provider = Provider(
        user_id=current_user.id,
        business_name=payload.business_name,
        category_id=category.id,
        description=payload.description,
        service_area=payload.service_area,
        pricing_model=payload.pricing_model,
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
