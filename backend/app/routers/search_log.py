"""
Personalization layer on top of the global co-occurrence graph (app/ai.py).

New users pick a few interest categories at signup (source="quiz"); every
real search a logged-in user makes is also logged (source="search"). Once a
user has REAL_SEARCH_THRESHOLD real searches, their suggestions for a given
category blend a frequency profile built from their own search history with
the global graph (70% personal / 30% global). Below that threshold there
isn't enough real behavior to trust yet, so quiz picks + search history are
blended lightly with the global graph instead (30% personal / 70% global).
This is computed live per request from search_logs - no separate offline
training job, unlike the graph itself.
"""
from collections import Counter

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import ai
from app.database import get_db
from app.deps import get_current_user
from app.models import Category, SearchLog, SearchLogSource, User

router = APIRouter(prefix="/api", tags=["personalization"])

REAL_SEARCH_THRESHOLD = 5
PERSONAL_WEIGHT_ESTABLISHED = 0.7
PERSONAL_WEIGHT_COLD_START = 0.3


class SearchLogRequest(BaseModel):
    category: str


class QuizRequest(BaseModel):
    categories: list[str]


@router.post("/search-log", status_code=status.HTTP_204_NO_CONTENT)
def log_search(
    payload: SearchLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Category).filter(Category.slug == payload.category).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown category")

    db.add(SearchLog(user_id=current_user.id, category=payload.category, source=SearchLogSource.search))
    db.commit()


@router.post("/onboarding/quiz", status_code=status.HTTP_204_NO_CONTENT)
def submit_quiz(
    payload: QuizRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valid_slugs = {c.slug for c in db.query(Category).filter(Category.slug.in_(payload.categories)).all()}
    already_picked = {
        row.category
        for row in db.query(SearchLog)
        .filter(SearchLog.user_id == current_user.id, SearchLog.source == SearchLogSource.quiz)
        .all()
    }
    for slug in payload.categories:
        if slug in valid_slugs and slug not in already_picked:
            db.add(SearchLog(user_id=current_user.id, category=slug, source=SearchLogSource.quiz))
    db.commit()


@router.get("/ai/recommend/personalized")
def recommend_personalized(
    category: str,
    limit: int = Query(default=5, ge=1, le=8),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    global_ranked = ai.top_companions(category, limit=8)
    if global_ranked is None:
        raise HTTPException(status_code=404, detail=f"Unknown category '{category}'")
    global_scores = dict(global_ranked)

    logs = db.query(SearchLog).filter(SearchLog.user_id == current_user.id).all()
    real_searches = [row for row in logs if row.source == SearchLogSource.search]
    established = len(real_searches) >= REAL_SEARCH_THRESHOLD

    personal_source_logs = real_searches if established else logs
    personal_weight = PERSONAL_WEIGHT_ESTABLISHED if established else PERSONAL_WEIGHT_COLD_START

    counts = Counter(row.category for row in personal_source_logs if row.category != category)
    total = sum(counts.values())
    personal_scores = {cat: n / total for cat, n in counts.items()} if total else {}

    blended = []
    for target in set(global_scores) | set(personal_scores):
        g = global_scores.get(target, 0.0)
        p = personal_scores.get(target, 0.0)
        blended.append((target, personal_weight * p + (1 - personal_weight) * g, g, p))
    blended.sort(key=lambda item: -item[1])

    source_label = ai.CATEGORY_LABELS.get(category, category)
    suggestions = []
    for target, score, g, p in blended[:limit]:
        label = ai.CATEGORY_LABELS.get(target, target)
        reason = (
            f"Because you often look for {label}"
            if p > g
            else f"{round(g * 100)}% of customers who booked {source_label} also booked {label}"
        )
        suggestions.append({"category": target, "label": label, "score": round(score, 4), "reason": reason})

    return {
        "category": category,
        "personalized": total > 0,
        "based_on": "search_history" if established and total else ("quiz" if total else "global"),
        "suggestions": suggestions,
    }
