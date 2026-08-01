import re
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.models import BookingStatus, PricingModel, UserRole, VerificationStatus

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: UserRole = UserRole.customer

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if not EMAIL_RE.match(value):
            raise ValueError("invalid email address")
        return value.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("password must be at least 8 characters")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str


class UserUpdateRequest(BaseModel):
    name: str | None = None


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    icon: str

    model_config = ConfigDict(from_attributes=True)


class ProviderPublicOut(BaseModel):
    id: int
    business_name: str
    verified: bool
    top_rated: bool = False


class ListingOut(BaseModel):
    id: int
    title: str
    description: str
    price: float | None
    unit: str
    location: str
    image_url: str
    available: bool
    views: int
    created_at: datetime
    category: CategoryOut
    provider: ProviderPublicOut
    rating: float
    review_count: int


class ListingCreate(BaseModel):
    title: str
    description: str = ""
    price: float | None = None
    unit: str = "hour"
    location: str = ""
    image_url: str = ""


class ListingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    unit: str | None = None
    location: str | None = None
    image_url: str | None = None
    available: bool | None = None


class ProviderOut(BaseModel):
    id: int
    business_name: str
    category: CategoryOut
    description: str
    service_area: str
    pricing_model: PricingModel
    verification_status: VerificationStatus
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingCreate(BaseModel):
    listing_id: int
    booking_date: date
    time_slot: str
    notes: str = ""


class BookingListingOut(BaseModel):
    id: int
    title: str
    image_url: str
    provider_name: str


class BookingOut(BaseModel):
    id: int
    listing: BookingListingOut
    customer_name: str
    booking_date: date
    time_slot: str
    notes: str
    status: BookingStatus
    created_at: datetime


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class ReviewCreate(BaseModel):
    listing_id: int
    booking_id: int
    rating: int
    comment: str = ""

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, value: int) -> int:
        if not 1 <= value <= 5:
            raise ValueError("rating must be between 1 and 5")
        return value


class ReviewOut(BaseModel):
    id: int
    author_name: str
    rating: int
    comment: str
    created_at: datetime


class ProviderPendingOut(BaseModel):
    id: int
    business_name: str
    category: CategoryOut
    user_name: str
    user_email: str
    nic_document_path: str | None
    cert_document_path: str | None
    submitted_at: datetime


class ProviderVerifyRequest(BaseModel):
    approve: bool


class ListingModerationRequest(BaseModel):
    available: bool


class AdminAnalyticsOut(BaseModel):
    total_users: int
    total_providers: int
    total_listings: int
    total_bookings: int
    listings_by_category: list[dict]
    bookings_by_status: dict[str, int]
