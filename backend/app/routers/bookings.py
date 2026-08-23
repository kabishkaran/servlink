from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_role
from app.models import Booking, BookingStatus, Listing, Provider, User, UserRole
from app.schemas import BookingCreate, BookingListingOut, BookingOut, BookingStatusUpdate

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

PROVIDER_ALLOWED_TRANSITIONS = {
    BookingStatus.pending: {BookingStatus.confirmed, BookingStatus.cancelled},
    BookingStatus.confirmed: {BookingStatus.completed, BookingStatus.cancelled},
}
CUSTOMER_ALLOWED_TRANSITIONS = {
    BookingStatus.pending: {BookingStatus.cancelled},
    BookingStatus.confirmed: {BookingStatus.cancelled},
}


def to_booking_out(booking: Booking) -> BookingOut:
    return BookingOut(
        id=booking.id,
        listing=BookingListingOut(
            id=booking.listing.id,
            title=booking.listing.title,
            image_url=booking.listing.image_url,
            provider_name=booking.listing.provider.business_name,
            provider_user_id=booking.listing.provider.user_id,
        ),
        customer_id=booking.customer_id,
        customer_name=booking.customer.name,
        booking_date=booking.booking_date,
        time_slot=booking.time_slot,
        notes=booking.notes,
        status=booking.status,
        created_at=booking.created_at,
    )


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    listing = db.get(Listing, payload.listing_id)
    if listing is None or not listing.available:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found or unavailable")

    booking = Booking(
        listing_id=listing.id,
        customer_id=current_user.id,
        booking_date=payload.booking_date,
        time_slot=payload.time_slot,
        notes=payload.notes,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return to_booking_out(booking)


@router.get("/me", response_model=list[BookingOut])
def list_my_bookings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    bookings = (
        db.query(Booking)
        .filter(Booking.customer_id == current_user.id)
        .order_by(Booking.id.desc())
        .all()
    )
    return [to_booking_out(b) for b in bookings]


@router.get("/provider", response_model=list[BookingOut])
def list_provider_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.provider)),
):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if provider is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No provider profile for this account")

    bookings = (
        db.query(Booking)
        .join(Listing)
        .filter(Listing.provider_id == provider.id)
        .order_by(Booking.id.desc())
        .all()
    )
    return [to_booking_out(b) for b in bookings]


@router.patch("/{booking_id}", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    is_owning_provider = provider is not None and booking.listing.provider_id == provider.id
    is_owning_customer = booking.customer_id == current_user.id

    if is_owning_provider:
        allowed = PROVIDER_ALLOWED_TRANSITIONS.get(booking.status, set())
    elif is_owning_customer:
        allowed = CUSTOMER_ALLOWED_TRANSITIONS.get(booking.status, set())
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")

    if payload.status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from {booking.status.value} to {payload.status.value}",
        )

    booking.status = payload.status
    db.commit()
    db.refresh(booking)
    return to_booking_out(booking)
