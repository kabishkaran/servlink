import json
from pathlib import Path

import joblib
import networkx as nx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
ML_DIR = BASE_DIR / "ml"

CATEGORY_LABELS = {
    "house-rental": "House Rental",
    "electrician": "Electrician",
    "plumber": "Plumber",
    "movers": "Movers",
    "cleaner": "Cleaner",
    "carpenter": "Carpenter",
    "internet-setup": "Internet Setup",
    "painter": "Painter",
}

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

with open(ML_DIR / "model" / "recommend_graph.json", encoding="utf-8") as f:
    _recommend_graph = nx.node_link_graph(json.load(f), edges="edges")
with open(ML_DIR / "model" / "recommend_metrics.json", encoding="utf-8") as f:
    _recommend_metrics = json.load(f)


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


@app.get("/api/ai/recommend")
def recommend(category: str, limit: int = Query(default=5, ge=1, le=8)):
    if category not in _recommend_graph:
        raise HTTPException(status_code=404, detail=f"Unknown category '{category}'")

    ranked = sorted(
        _recommend_graph[category].items(), key=lambda item: -item[1]["weight"]
    )[:limit]

    source_label = CATEGORY_LABELS.get(category, category)
    suggestions = [
        {
            "category": target,
            "label": CATEGORY_LABELS.get(target, target),
            "score": edge["weight"],
            "reason": f"{round(edge['weight'] * 100)}% of customers who booked "
                      f"{source_label} also booked {CATEGORY_LABELS.get(target, target)}",
        }
        for target, edge in ranked
    ]
    return {"category": category, "suggestions": suggestions}


@app.get("/api/ai/recommend/metrics")
def recommend_metrics():
    return _recommend_metrics
