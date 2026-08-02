const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function extractErrorMessage(data, fallback) {
  if (!data?.detail) return fallback;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
  }
  return data.detail;
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {
      // response had no JSON body
    }
    throw new Error(extractErrorMessage(data, `${method} ${path} failed: ${res.status}`));
  }
  if (res.status === 204) return null;
  return res.json();
}

// Like request(), but sends a FormData body (multipart) instead of JSON —
// the browser sets the Content-Type boundary itself, so it's left unset here.
async function requestForm(path, { method = "POST", formData, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: formData });

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {
      // response had no JSON body
    }
    throw new Error(extractErrorMessage(data, `${method} ${path} failed: ${res.status}`));
  }
  return res.json();
}

export function classifyQuery(text) {
  return request("/ai/classify", { method: "POST", body: { text } });
}

export function getModelMetrics() {
  return request("/ai/metrics");
}

export function getRecommendations(category, limit = 5) {
  return request(`/ai/recommend?category=${encodeURIComponent(category)}&limit=${limit}`);
}

export function register(payload) {
  return request("/auth/register", { method: "POST", body: payload });
}

export function login(payload) {
  return request("/auth/login", { method: "POST", body: payload });
}

export function getMe(token) {
  return request("/auth/me", { token });
}

export function updateMe(payload, token) {
  return request("/auth/me", { method: "PATCH", body: payload, token });
}

let _categoriesCache = null;
export async function getCategories() {
  if (!_categoriesCache) _categoriesCache = await request("/categories");
  return _categoriesCache;
}

export function getListings(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") query.set(k, v);
  });
  const qs = query.toString();
  return request(`/listings${qs ? `?${qs}` : ""}`);
}

export function getListing(id) {
  return request(`/listings/${id}`);
}

export function getListingReviews(id) {
  return request(`/listings/${id}/reviews`);
}

export function createBooking(payload, token) {
  return request("/bookings", { method: "POST", body: payload, token });
}

export function getMyBookings(token) {
  return request("/bookings/me", { token });
}

export function createReview(payload, token) {
  return request("/reviews", { method: "POST", body: payload, token });
}

export function registerProvider(formData, token) {
  return requestForm("/providers/register", { formData, token });
}

export function getMyProviderProfile(token) {
  return request("/providers/me", { token });
}

export function getMyListings(token) {
  return request("/listings/mine", { token });
}

export function updateBookingStatus(id, status, token) {
  return request(`/bookings/${id}`, { method: "PATCH", body: { status }, token });
}

export function getProviderBookings(token) {
  return request("/bookings/provider", { token });
}

// Adapts the nested API listing shape to the flat shape ListingCard/pages expect.
export function mapListing(l) {
  return {
    id: l.id,
    categoryId: l.category.id,
    categorySlug: l.category.slug,
    category: l.category.name,
    categoryIcon: l.category.icon,
    title: l.title,
    provider: l.provider.business_name,
    providerId: l.provider.id,
    rating: l.rating,
    reviews: l.review_count,
    price: l.price,
    unit: l.unit,
    location: l.location,
    serviceArea: l.location,
    verified: l.provider.verified,
    topRated: l.provider.top_rated,
    image: l.image_url,
    description: l.description,
    available: l.available,
  };
}
