"""
Trains a TF-IDF + Logistic Regression classifier that maps a free-text
search query to one of ServLink's 8 service categories, replacing the naive
keyword-matching (e.g. `if query.includes("electric")`) previously used
client-side. Evaluates on a held-out stratified test split and saves both
the fitted pipeline and the evaluation metrics.
"""
import json

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer

DATA_PATH = "data/queries.csv"
MODEL_PATH = "model/classifier.joblib"
METRICS_PATH = "model/metrics.json"


def main():
    df = pd.read_csv(DATA_PATH)

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["category"],
        test_size=0.2, random_state=42, stratify=df["category"],
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ])
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    labels = sorted(df["category"].unique())
    report = classification_report(y_test, y_pred, labels=labels, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=labels)

    print(f"Test accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred, labels=labels, zero_division=0))
    print("Confusion matrix (rows=actual, cols=predicted):")
    print("labels:", labels)
    print(cm)

    joblib.dump(pipeline, MODEL_PATH)

    metrics = {
        "accuracy": accuracy,
        "n_train": len(X_train),
        "n_test": len(X_test),
        "labels": labels,
        "classification_report": report,
        "confusion_matrix": cm.tolist(),
    }
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nSaved model to {MODEL_PATH}")
    print(f"Saved metrics to {METRICS_PATH}")


if __name__ == "__main__":
    main()
