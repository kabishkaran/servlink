const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function classifyQuery(text) {
  const res = await fetch(`${BASE_URL}/ai/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`classify failed: ${res.status}`);
  return res.json();
}

export async function getModelMetrics() {
  const res = await fetch(`${BASE_URL}/ai/metrics`);
  if (!res.ok) throw new Error(`metrics failed: ${res.status}`);
  return res.json();
}
