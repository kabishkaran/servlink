from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_role
from app.models import Category, Listing, Provider, User, UserRole, VerificationStatus
from app.schemas import CategoryOut, ListingCreate, ListingOut, ListingUpdate, ProviderPublicOut

router = APIRouter(prefix="/api/listings", tags=["listings"])


def to_listing_out(listing: Listing) -> ListingOut:
    reviews = listing.reviews
    review_count = len(reviews)
    rating = round(sum(r.rating for r in reviews) / review_count, 2) if review_count else 0.0

    return ListingOut(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        price=float(listing.price) if listing.price is not None else None,
        unit=listing.unit,
        location=listing.location,
        image_url=listing.image_url,
        available=listing.available,
        views=listing.views,
        created_at=listing.created_at,
        category=CategoryOut.model_validate(listing.category),
        provider=ProviderPublicOut(
            id=listing.provider.id,
            business_name=listing.provider.business_name,
            verified=listing.provider.verification_status == VerificationStatus.approved,
            top_rated=review_count >= 2 and rating >= 4.5,
        ),
        rating=rating,
        review_count=review_count,
    )


def get_own_provider(db: Session, user: User) -> Provider:
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    if provider is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No provider profile for this account")
    return provider


@router.get("", response_model=list[ListingOut])
def list_listings(
    category: str | None = None,
    location: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Listing).filter(Listing.available.is_(True))

    if category:
        query = query.join(Category).filter(Category.slug == category)
    if location:
        query = query.filter(Listing.location.ilike(f"%{location}%"))
    if min_price is not None:
        query = query.filter(Listing.price >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)
    if q:
        like = f"%{q}%"
        query = query.filter(Listing.title.ilike(like) | Listing.description.ilike(like))

    return [to_listing_out(listing) for listing in query.order_by(Listing.id).all()]


@router.get("/mine", response_model=list[ListingOut])
def list_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.provider)),
):
    provider = get_own_provider(db, current_user)
    listings = db.query(Listing).filter(Listing.provider_id == provider.id).order_by(Listing.id).all()
    return [to_listing_out(listing) for listing in listings]


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    listing.views += 1
    db.commit()
    return to_listing_out(listing)


@router.post("", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.provider)),
):
    provider = get_own_provider(db, current_user)
    listing = Listing(provider_id=provider.id, category_id=provider.category_id, **payload.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return to_listing_out(listing)


@router.patch("/{listing_id}", response_model=ListingOut)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.provider)),
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    provider = get_own_provider(db, current_user)
    if listing.provider_id != provider.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return to_listing_out(listing)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.provider)),
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    provider = get_own_provider(db, current_user)
    if listing.provider_id != provider.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")

    db.delete(listing)
    db.commit()
