# ServLink — AI-Powered Smart Local Services Platform

Individual Final Year Project · React.js + Vite + Tailwind CSS

## Getting Started

npm install
npm run dev        # http://localhost:5173
npm run build      # production build

## Pages & Routes

/ .............. Home (hero, categories, featured listings)
/search ........ Search results + filters + AI suggestion panel
/listing/:id ... Listing detail + booking CTA + reviews
/booking/:id ... 3-step booking flow
/login ......... Sign in (customer or provider)
/register ...... Create account
/profile ....... Customer bookings + account settings
/provider/register ... Provider onboarding wizard (3 steps)
/provider/dashboard .. Provider stats, bookings, listings, analytics
/admin ......... Admin verification queue + platform analytics

## Project Structure

src/
  components/
    Navbar.jsx              Sticky nav with auth state
    Footer.jsx              Site footer
    ListingCard.jsx         Reusable listing card
    AISuggestionPanel.jsx   AI recommendation sidebar
  context/
    AuthContext.jsx         Global auth (login/logout)
  data/
    mockData.js             Listings, categories, AI suggestions
  pages/
    Home.jsx
    Search.jsx
    ListingDetail.jsx
    Booking.jsx
    Login.jsx
    Register.jsx
    CustomerProfile.jsx
    ProviderRegister.jsx
    ProviderDashboard.jsx
    AdminDashboard.jsx
  App.jsx                   Router + layout
  main.jsx                  Entry point

## Demo credentials

Any email + any password works (mock auth).
Select "Provider" on login to access provider dashboard.
Visit /admin directly for the admin console.

## Connecting to FastAPI backend (next step)

1. Add VITE_API_URL=http://localhost:8000 in .env
2. Replace mockData calls with fetch(import.meta.env.VITE_API_URL + '/...')
3. Store JWT token in AuthContext and send as Authorization: Bearer <token>

## Tech stack

React 18 + Vite | React Router v6 | Tailwind CSS v3 | Lucide React | React Context API
