from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Booking, BookingStatus, Review, User
from app.schemas import ReviewCreate, ReviewOut

router = APIRouter(prefix="/api", tags=["reviews"])


def to_review_out(review: Review) -> ReviewOut:
    return ReviewOut(
        id=review.id,
        author_name=review.author.name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )


@router.get("/listings/{listing_id}/reviews", response_model=list[ReviewOut])
def list_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.listing_id == listing_id)
        .order_by(Review.id.desc())
        .all()
    )
    return [to_review_out(r) for r in reviews]


@router.post("/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.get(Booking, payload.booking_id)
    if booking is None or booking.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.listing_id != payload.listing_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking does not match listing")
    if booking.status != BookingStatus.completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking is not completed yet")
    if db.query(Review).filter(Review.booking_id == booking.id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Booking already reviewed")

    review = Review(
        listing_id=payload.listing_id,
        author_id=current_user.id,
        booking_id=booking.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return to_review_out(review)
