from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app import ai
from app.routers import admin, auth, bookings, categories, listings, messages, providers, reviews, search_log, uploads
from app.storage import UPLOAD_DIR

app = FastAPI(title="ServLink API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(listings.router)
app.include_router(providers.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(uploads.router)
app.include_router(admin.router)
app.include_router(search_log.router)
app.include_router(messages.router)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


class ClassifyRequest(BaseModel):
    text: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/ai/classify")
def classify(payload: ClassifyRequest):
    labels = ai.classifier.named_steps["clf"].classes_
    proba = ai.classifier.predict_proba([payload.text])[0]
    ranked = sorted(zip(labels, proba), key=lambda pair: -pair[1])
    return {
        "category": ranked[0][0],
        "confidence": round(float(ranked[0][1]), 4),
        "scores": [{"category": c, "score": round(float(p), 4)} for c, p in ranked],
    }


@app.get("/api/ai/metrics")
def metrics():
    return ai.classifier_metrics


@app.get("/api/ai/recommend")
def recommend(category: str, limit: int = Query(default=5, ge=1, le=8)):
    ranked = ai.top_companions(category, limit)
    if ranked is None:
        raise HTTPException(status_code=404, detail=f"Unknown category '{category}'")
    return {"category": category, "suggestions": ai.format_suggestions(category, ranked)}


@app.get("/api/ai/recommend/metrics")
def recommend_metrics():
    return ai.recommend_metrics
