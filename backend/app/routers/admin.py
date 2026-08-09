from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_role
from app.models import Booking, Category, Listing, Provider, User, UserRole, VerificationStatus
from app.schemas import (
    AdminAnalyticsOut,
    AdminUserOut,
    ListingModerationRequest,
    ListingOut,
    ProviderPendingOut,
    ProviderVerifyRequest,
    UserActiveUpdateRequest,
)
from app.routers.listings import to_listing_out

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_role(UserRole.admin))])


@router.get("/providers/pending", response_model=list[ProviderPendingOut])
def list_pending_providers(db: Session = Depends(get_db)):
    providers = db.query(Provider).filter(Provider.verification_status == VerificationStatus.pending).all()
    return [
        ProviderPendingOut(
            id=p.id,
            business_name=p.business_name,
            category=p.category,
            user_name=p.user.name,
            user_email=p.user.email,
            nic_document_path=p.nic_document_path,
            cert_document_path=p.cert_document_path,
            submitted_at=p.submitted_at,
        )
        for p in providers
    ]


@router.patch("/providers/{provider_id}/verify", response_model=ProviderPendingOut)
def verify_provider(provider_id: int, payload: ProviderVerifyRequest, db: Session = Depends(get_db)):
    provider = db.get(Provider, provider_id)
    if provider is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")

    provider.verification_status = VerificationStatus.approved if payload.approve else VerificationStatus.rejected
    provider.reviewed_at = func.now()
    db.commit()
    db.refresh(provider)
    return ProviderPendingOut(
        id=provider.id,
        business_name=provider.business_name,
        category=provider.category,
        user_name=provider.user.name,
        user_email=provider.user.email,
        nic_document_path=provider.nic_document_path,
        cert_document_path=provider.cert_document_path,
        submitted_at=provider.submitted_at,
    )


@router.patch("/listings/{listing_id}/moderate", response_model=ListingOut)
def moderate_listing(listing_id: int, payload: ListingModerationRequest, db: Session = Depends(get_db)):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")

    listing.available = payload.available
    db.commit()
    db.refresh(listing)
    return to_listing_out(listing)


@router.get("/users", response_model=list[AdminUserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id).all()


@router.patch("/users/{user_id}", response_model=AdminUserOut)
def set_user_active(
    user_id: int,
    payload: UserActiveUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin)),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot suspend your own account")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.get("/listings", response_model=list[ListingOut])
def list_all_listings(db: Session = Depends(get_db)):
    listings = db.query(Listing).order_by(Listing.id).all()
    return [to_listing_out(listing) for listing in listings]


@router.get("/analytics", response_model=AdminAnalyticsOut)
def get_analytics(db: Session = Depends(get_db)):
    listings_by_category = (
        db.query(Category.name, func.count(Listing.id))
        .join(Listing, Listing.category_id == Category.id)
        .group_by(Category.name)
        .all()
    )
    bookings_by_status = dict(
        db.query(Booking.status, func.count(Booking.id)).group_by(Booking.status).all()
    )

    return AdminAnalyticsOut(
        total_users=db.query(User).count(),
        total_providers=db.query(Provider).count(),
        total_listings=db.query(Listing).count(),
        total_bookings=db.query(Booking).count(),
        listings_by_category=[{"category": name, "count": count} for name, count in listings_by_category],
        bookings_by_status={status_.value: count for status_, count in bookings_by_status.items()},
    )
