import json
from pathlib import Path

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
ML_DIR = BASE_DIR / "ml"

app = FastAPI(title="ServLink API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_classifier = joblib.load(ML_DIR / "model" / "classifier.joblib")
with open(ML_DIR / "model" / "metrics.json", encoding="utf-8") as f:
    _metrics = json.load(f)


class ClassifyRequest(BaseModel):
    text: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/ai/classify")
def classify(payload: ClassifyRequest):
    labels = _classifier.named_steps["clf"].classes_
    proba = _classifier.predict_proba([payload.text])[0]
    ranked = sorted(zip(labels, proba), key=lambda pair: -pair[1])
    return {
        "category": ranked[0][0],
        "confidence": round(float(ranked[0][1]), 4),
        "scores": [{"category": c, "score": round(float(p), 4)} for c, p in ranked],
    }


@app.get("/api/ai/metrics")
def metrics():
    return _metrics
