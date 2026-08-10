"""
Seeds the servlink database with the 8 service categories, a demo admin and
customer account, and a set of demo providers/listings/reviews mirroring the
frontend's previous mock data (src/data/mockData.js), so the app isn't empty
once pages are switched from mock data to real API calls.

Run from backend/: python seed.py
"""
import bcrypt

from app.database import SessionLocal
from app.models import Category, User, UserRole, Provider, PricingModel, VerificationStatus, Listing, Review

DEMO_PASSWORD = "password123"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


CATEGORIES = [
    {"name": "House Rental", "slug": "house-rental", "icon": "🏠"},
    {"name": "Electrician", "slug": "electrician", "icon": "⚡"},
    {"name": "Plumber", "slug": "plumber", "icon": "🔧"},
    {"name": "Movers", "slug": "movers", "icon": "🚚"},
    {"name": "Cleaner", "slug": "cleaner", "icon": "🧹"},
    {"name": "Carpenter", "slug": "carpenter", "icon": "🪚"},
    {"name": "Internet Setup", "slug": "internet-setup", "icon": "📶"},
    {"name": "Painter", "slug": "painter", "icon": "🖌️"},
]

PROVIDERS = [
    {
        "email": "rohan.perera@servlink.lk", "name": "Rohan Perera",
        "business_name": "Rohan Perera", "category_slug": "house-rental",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "3BR Apartment, Bambalapitiya",
            "description": "Spacious 3-bedroom apartment in central Bambalapitiya. Fully furnished with modern amenities, parking, and 24hr security.",
            "price": 85000, "unit": "month", "location": "Colombo 4",
            "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
        },
    },
    {
        "email": "saman.bandara@servlink.lk", "name": "Saman Bandara",
        "business_name": "Saman Bandara", "category_slug": "house-rental",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "2BR House, Nugegoda",
            "description": "Clean 2-bedroom house with garden in quiet Nugegoda neighbourhood. Near bus routes and schools.",
            "price": 62000, "unit": "month", "location": "Nugegoda",
            "image_url": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80",
        },
    },
    {
        "email": "nimal.jayasuriya@servlink.lk", "name": "Nimal Jayasuriya",
        "business_name": "Nimal Jayasuriya", "category_slug": "electrician",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Certified Electrician — Colombo",
            "description": "10+ years experience. Wiring, installation, fault-finding, safety checks. Available 7 days.",
            "price": 2500, "unit": "hour", "location": "Colombo 5",
            "image_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
        },
    },
    {
        "email": "suresh.fernando@servlink.lk", "name": "Suresh Fernando",
        "business_name": "Suresh Fernando", "category_slug": "plumber",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Licensed Plumber — Fast Response",
            "description": "Emergency plumbing, pipe repair, bathroom fitting, water heater installation. Same-day service.",
            "price": 2000, "unit": "hour", "location": "Colombo 6",
            "image_url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80",
        },
    },
    {
        "email": "contact@quickmove.lk", "name": "QuickMove Admin",
        "business_name": "QuickMove Ltd.", "category_slug": "movers",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "QuickMove Transport Services",
            "description": "Full home and office relocation. Packing, loading, transport, unloading. Insured team.",
            "price": 15000, "unit": "move", "location": "Colombo",
            "image_url": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
        },
    },
    {
        "email": "contact@cleanco.lk", "name": "CleanCo Admin",
        "business_name": "CleanCo Services", "category_slug": "cleaner",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Professional Home Cleaning",
            "description": "Deep cleaning, move-in/out cleaning, regular maintenance. Eco-friendly products. Insured staff.",
            "price": 5000, "unit": "session", "location": "Colombo",
            "image_url": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
        },
    },
    {
        "email": "ajith.woodworks@servlink.lk", "name": "Ajith Fernando",
        "business_name": "Ajith Woodworks", "category_slug": "carpenter",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Custom Furniture & Repairs",
            "description": "Custom furniture, door fitting, wardrobes, cabinet installation. Quality guaranteed.",
            "price": 3000, "unit": "hour", "location": "Ratmalana",
            "image_url": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80",
        },
    },
    {
        "email": "contact@netfix.lk", "name": "NetFix Admin",
        "business_name": "NetFix Solutions", "category_slug": "internet-setup",
        "verification_status": VerificationStatus.pending,
        "listing": {
            "title": "Home Broadband Installation",
            "description": "Router setup, fibre connection, WiFi optimisation. All ISPs supported.",
            "price": 3500, "unit": "setup", "location": "Colombo",
            "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80",
        },
    },
    {
        "email": "priyantha.wickrama@servlink.lk", "name": "Priyantha Wickrama",
        "business_name": "Priyantha Wickrama", "category_slug": "electrician",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "24/7 Emergency Electrician",
            "description": "Round-the-clock callout for urgent electrical faults, tripping breakers, and power outages. Fully licensed.",
            "price": 3000, "unit": "hour", "location": "Colombo 3",
            "image_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
        },
    },
    {
        "email": "kasun.silva@servlink.lk", "name": "Kasun Silva",
        "business_name": "Kasun Silva", "category_slug": "plumber",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Bathroom & Kitchen Plumbing Specialist",
            "description": "Bathroom renovations, kitchen sink fitting, leak repairs, and water heater servicing.",
            "price": 1800, "unit": "hour", "location": "Dehiwala",
            "image_url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80",
        },
    },
    {
        "email": "malith.perera@servlink.lk", "name": "Malith Perera",
        "business_name": "Malith Perera", "category_slug": "painter",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Interior & Exterior Painting",
            "description": "Wall painting, waterproofing, and colour consultation. Free quotation before starting work.",
            "price": 4000, "unit": "day", "location": "Colombo 7",
            "image_url": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80",
        },
    },
    {
        "email": "dinesh.kumar@servlink.lk", "name": "Dinesh Kumar",
        "business_name": "Dinesh Kumar", "category_slug": "carpenter",
        "verification_status": VerificationStatus.pending,
        "listing": {
            "title": "Custom Kitchen Cabinets",
            "description": "Made-to-measure kitchen cabinets, pantry cupboards, and wardrobes in your choice of finish.",
            "price": 3500, "unit": "hour", "location": "Moratuwa",
            "image_url": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80",
        },
    },
    {
        "email": "nadeesha.fonseka@servlink.lk", "name": "Nadeesha Fonseka",
        "business_name": "Nadeesha Fonseka", "category_slug": "internet-setup",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Fibre & WiFi Installation Experts",
            "description": "New fibre connections, mesh WiFi setup for large homes, and dead-zone troubleshooting.",
            "price": 4000, "unit": "setup", "location": "Colombo 4",
            "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80",
        },
    },
    {
        "email": "isuru.bandara@servlink.lk", "name": "Isuru Bandara",
        "business_name": "Isuru Bandara", "category_slug": "house-rental",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Modern Studio Apartment",
            "description": "Compact fully-furnished studio, ideal for a single professional. Close to public transport.",
            "price": 45000, "unit": "month", "location": "Rajagiriya",
            "image_url": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80",
        },
    },
    {
        "email": "ruwan.jayasinghe@servlink.lk", "name": "Ruwan Jayasinghe",
        "business_name": "Ruwan Jayasinghe", "category_slug": "cleaner",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Office & Commercial Cleaning",
            "description": "Daily, weekly, or one-off cleaning for offices, shops, and commercial spaces.",
            "price": 6000, "unit": "session", "location": "Colombo",
            "image_url": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
        },
    },
    {
        "email": "chathura.silva@servlink.lk", "name": "Chathura Silva",
        "business_name": "Chathura Silva", "category_slug": "movers",
        "verification_status": VerificationStatus.approved,
        "listing": {
            "title": "Budget Friendly House Movers",
            "description": "Affordable local moves for small homes and apartments. Small team, no hidden fees.",
            "price": 12000, "unit": "move", "location": "Colombo",
            "image_url": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
        },
    },
]

REVIEWS = [
    {"listing_title": "3BR Apartment, Bambalapitiya", "author_name": "Nimal S.", "author_email": "nimal.s@example.com", "rating": 5, "comment": "Excellent property, very responsive landlord. Highly recommend!"},
    {"listing_title": "3BR Apartment, Bambalapitiya", "author_name": "Priya K.", "author_email": "priya.k@example.com", "rating": 5, "comment": "Great location, clean and modern. Perfect for a small family."},
    {"listing_title": "3BR Apartment, Bambalapitiya", "author_name": "Harsha W.", "author_email": "harsha.w@example.com", "rating": 4, "comment": "Good apartment but parking can be tight. Otherwise excellent."},
    {"listing_title": "Certified Electrician — Colombo", "author_name": "Chamara R.", "author_email": "chamara.r@example.com", "rating": 5, "comment": "Nimal is very professional and fast. Fixed our wiring in 2 hours!"},
    {"listing_title": "Certified Electrician — Colombo", "author_name": "Dilani M.", "author_email": "dilani.m@example.com", "rating": 5, "comment": "Came same day. Very thorough safety inspection. Will use again."},
    {"listing_title": "Professional Home Cleaning", "author_name": "Tharindu P.", "author_email": "tharindu.p@example.com", "rating": 5, "comment": "Spotless. Team was on time and very thorough."},
    {"listing_title": "Professional Home Cleaning", "author_name": "Anusha D.", "author_email": "anusha.d@example.com", "rating": 5, "comment": "Best cleaning service I've used in Colombo. Booking again."},
    {"listing_title": "24/7 Emergency Electrician", "author_name": "Kavindu R.", "author_email": "kavindu.r@example.com", "rating": 5, "comment": "Called at midnight and Priyantha was here in 30 minutes. Lifesaver."},
    {"listing_title": "24/7 Emergency Electrician", "author_name": "Sanduni P.", "author_email": "sanduni.p@example.com", "rating": 4, "comment": "Fixed the tripping breaker quickly, a bit pricey for a weekday call though."},
    {"listing_title": "Bathroom & Kitchen Plumbing Specialist", "author_name": "Ruwanthi J.", "author_email": "ruwanthi.j@example.com", "rating": 5, "comment": "Redid our whole bathroom plumbing, neat work and cleaned up after."},
    {"listing_title": "Modern Studio Apartment", "author_name": "Yohan D.", "author_email": "yohan.d@example.com", "rating": 4, "comment": "Small but well laid out. Great location for commuting."},
    {"listing_title": "Modern Studio Apartment", "author_name": "Sachini W.", "author_email": "sachini.w@example.com", "rating": 5, "comment": "Isuru was very responsive and the apartment matched the photos exactly."},
]


def get_or_create_user(db, email, name, role):
    user = db.query(User).filter_by(email=email).first()
    if user:
        return user
    user = User(email=email, name=name, role=role, hashed_password=hash_password(DEMO_PASSWORD))
    db.add(user)
    db.flush()
    return user


def main():
    db = SessionLocal()
    try:
        category_by_slug = {}
        for cat in CATEGORIES:
            existing = db.query(Category).filter_by(slug=cat["slug"]).first()
            if existing:
                category_by_slug[cat["slug"]] = existing
                continue
            category = Category(**cat)
            db.add(category)
            db.flush()
            category_by_slug[cat["slug"]] = category

        get_or_create_user(db, "admin@servlink.lk", "ServLink Admin", UserRole.admin)
        get_or_create_user(db, "customer@servlink.lk", "Demo Customer", UserRole.customer)

        listing_by_title = {}
        for entry in PROVIDERS:
            user = get_or_create_user(db, entry["email"], entry["name"], UserRole.provider)

            provider = db.query(Provider).filter_by(user_id=user.id).first()
            if not provider:
                provider = Provider(
                    user_id=user.id,
                    business_name=entry["business_name"],
                    category_id=category_by_slug[entry["category_slug"]].id,
                    pricing_model=PricingModel.hourly,
                    verification_status=entry["verification_status"],
                )
                db.add(provider)
                db.flush()

            listing = db.query(Listing).filter_by(title=entry["listing"]["title"]).first()
            if not listing:
                listing = Listing(
                    provider_id=provider.id,
                    category_id=category_by_slug[entry["category_slug"]].id,
                    available=True,
                    **entry["listing"],
                )
                db.add(listing)
                db.flush()
            listing_by_title[listing.title] = listing

        for review in REVIEWS:
            listing = listing_by_title[review["listing_title"]]
            author = get_or_create_user(db, review["author_email"], review["author_name"], UserRole.customer)
            existing = db.query(Review).filter_by(listing_id=listing.id, author_id=author.id).first()
            if not existing:
                db.add(Review(
                    listing_id=listing.id, author_id=author.id,
                    rating=review["rating"], comment=review["comment"],
                ))

        db.commit()
        print(f"Seeded {len(CATEGORIES)} categories, {len(PROVIDERS)} providers/listings, {len(REVIEWS)} reviews.")
        print(f"Demo login password for all seeded accounts: {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
