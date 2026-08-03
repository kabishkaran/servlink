"""
Loads the trained AI artifacts (query classifier + service co-occurrence
graph) once at import time and exposes them for the AI endpoints in
main.py and the personalized recommendation endpoint in
routers/search_log.py to share, without those routers importing from
main.py (which would be circular).
"""
import json

import joblib
import networkx as nx

from app.config import BASE_DIR

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

classifier = joblib.load(ML_DIR / "model" / "classifier.joblib")
with open(ML_DIR / "model" / "metrics.json", encoding="utf-8") as f:
    classifier_metrics = json.load(f)

with open(ML_DIR / "model" / "recommend_graph.json", encoding="utf-8") as f:
    recommend_graph = nx.node_link_graph(json.load(f), edges="edges")
with open(ML_DIR / "model" / "recommend_metrics.json", encoding="utf-8") as f:
    recommend_metrics = json.load(f)


def graph_edge_weight(source: str, target: str) -> float:
    if source not in recommend_graph or target not in recommend_graph[source]:
        return 0.0
    return recommend_graph[source][target]["weight"]


def top_companions(category: str, limit: int = 5):
    """Ranked (target, weight) pairs for a category, or None if unknown."""
    if category not in recommend_graph:
        return None
    ranked = sorted(recommend_graph[category].items(), key=lambda item: -item[1]["weight"])
    return [(target, edge["weight"]) for target, edge in ranked[:limit]]


def format_suggestions(category: str, ranked: list[tuple[str, float]], reason_fn=None) -> list[dict]:
    source_label = CATEGORY_LABELS.get(category, category)
    default_reason = (
        lambda target, weight: f"{round(weight * 100)}% of customers who booked "
                                f"{source_label} also booked {CATEGORY_LABELS.get(target, target)}"
    )
    reason_fn = reason_fn or default_reason
    return [
        {
            "category": target,
            "label": CATEGORY_LABELS.get(target, target),
            "score": round(weight, 4),
            "reason": reason_fn(target, weight),
        }
        for target, weight in ranked
    ]
