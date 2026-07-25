"""
Interactive manual test: type a search query, see the predicted category
and the model's confidence across all 8 categories. Type 'exit' or 'quit' to stop.
"""
import joblib

pipeline = joblib.load("model/classifier.joblib")
labels = pipeline.named_steps["clf"].classes_

print("ServLink category classifier - manual test")
print("Type a search query (or 'exit' to quit)\n")

while True:
    text = input("> ").strip()
    if text.lower() in ("exit", "quit", ""):
        break

    proba = pipeline.predict_proba([text])[0]
    ranked = sorted(zip(labels, proba), key=lambda x: -x[1])

    print(f"  predicted: {ranked[0][0]}  (confidence {ranked[0][1]:.2f})")
    print("  full breakdown:")
    for label, p in ranked:
        bar = "#" * int(p * 30)
        print(f"    {label:15s} {p:.2f} {bar}")
    print()
