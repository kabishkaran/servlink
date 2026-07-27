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
