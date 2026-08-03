# ServLink — AI-Powered Smart Local Services Platform

Individual Final Year Project · React.js + Vite + Tailwind CSS · FastAPI + PostgreSQL

## Getting Started

### Frontend

npm install
npm run dev        # http://localhost:5173
npm run build      # production build

Add a `.env` with `VITE_API_URL=http://localhost:8000/api` (see `.env` for the current value).

### Backend

cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env      # fill in DATABASE_URL / JWT_SECRET for your machine
alembic upgrade head         # create the schema
python seed.py                # seed categories + demo users/providers/listings
uvicorn app.main:app --reload --port 8000

API docs: http://localhost:8000/docs

## Pages & Routes

/ .............. Home (hero, categories, featured listings)
/search ........ Search results + filters + AI suggestion panel
/listing/:id ... Listing detail + booking CTA + reviews
/booking/:id ... 3-step booking flow
/login ......... Sign in (customer or provider)
/register ...... Create account
/profile ....... Customer bookings + account settings
/provider/register ... Provider onboarding wizard (3 steps, real NIC/cert upload)
/provider/dashboard .. Provider stats, bookings, listings, analytics
/admin ......... Admin verification queue + platform analytics

## Project Structure

Frontend (`src/`):

src/
  components/
    Navbar.jsx              Sticky nav with auth state
    Footer.jsx              Site footer
    ListingCard.jsx         Reusable listing card
    AISuggestionPanel.jsx   AI recommendation sidebar
    AIModelPanel.jsx        Live query-classifier model info panel
  context/
    AuthContext.jsx         Real JWT auth (login/register/session restore)
  lib/
    api.js                  Fetch helpers for every backend endpoint
  pages/
    Home.jsx, Search.jsx, ListingDetail.jsx, Booking.jsx,
    Login.jsx, Register.jsx, CustomerProfile.jsx,
    ProviderRegister.jsx, ProviderDashboard.jsx, AdminDashboard.jsx
  App.jsx                   Router + layout
  main.jsx                  Entry point

Backend (`backend/`):

backend/
  app/
    main.py                 FastAPI app, AI endpoints, static /uploads mount
    config.py, database.py, models.py, schemas.py, deps.py, storage.py
    routers/                auth, categories, listings, providers, bookings,
                             reviews, admin, uploads
  ml/
    generate_data.py, train.py          query-classifier dataset + training
    generate_bookings.py, train_recommender.py   co-occurrence recommender
    model/                  trained classifier + recommendation graph + metrics
  migrations/                Alembic migrations
  seed.py                    Seeds categories + demo users/providers/listings
  uploads/                   Provider NIC/cert documents (served at /uploads)

## Testing

Backend smoke tests cover auth, both AI endpoints, and the full booking lifecycle:

cd backend
pytest -v

Requires the DB to be migrated and seeded first (see Getting Started above). Tests create and clean up their own throwaway data.

## AI components

- **Query classifier** (`backend/ml/train.py`): TF-IDF + Logistic Regression, maps free-text search queries to one of 8 service categories. 92.6% held-out accuracy. Served at `POST /api/ai/classify`.
- **Service recommendation graph** (`backend/ml/train_recommender.py`): a NetworkX co-occurrence graph learned from synthetic booking sessions — the core "customers who booked X also booked Y" feature. Served at `GET /api/ai/recommend`.

## Demo credentials

All seeded accounts use the password `password123`:

- Customer: `customer@servlink.lk`
- Provider (verified, has listings + reviews): `nimal.jayasuriya@servlink.lk`
- Provider (pending verification): `contact@netfix.lk`
- Admin: `admin@servlink.lk`

## Tech stack

React 18 + Vite | React Router v6 | Tailwind CSS v3 | Lucide React | React Context API
FastAPI | SQLAlchemy 2.0 | Alembic | PostgreSQL | JWT + bcrypt | scikit-learn | NetworkX
