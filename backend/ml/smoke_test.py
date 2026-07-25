"""
Sanity check: predicts on hand-written queries that were NOT produced by any
generate_data.py template, to check the model generalizes beyond template
memorization rather than just pattern-matching the synthetic phrasing. This
is a stricter, more honest generalization check than the held-out split in
train.py, since that split shares template structure with training data.
"""
import joblib

pipeline = joblib.load("model/classifier.joblib")

novel_queries = [
    ("the switch board is sparking whenever it rains", "electrician"),
    ("none of the plug points in the bedroom are working", "electrician"),
    ("my inverter battery won't charge anymore", "electrician"),
    ("there's a burning smell coming from behind the TV unit", "electrician"),
    ("water is dripping from the ceiling below the bathroom", "plumber"),
    ("the toilet cistern overflows every time it's flushed", "plumber"),
    ("kitchen sink drain is completely clogged with grease", "plumber"),
    ("no hot water at all this morning", "plumber"),
    ("I'm moving from my rented flat to a new place next week and need a van", "movers"),
    ("relocating the whole office to a bigger building next month", "movers"),
    ("need help carrying a fridge and washing machine to the new place", "movers"),
    ("this place is filthy after the tenants left, need it spotless before we move in", "cleaner"),
    ("the curtains and sofa smell musty and need a proper wash", "cleaner"),
    ("carpets are stained after the party last week", "cleaner"),
    ("the hinges on my almirah are loose and one shelf collapsed", "carpenter"),
    ("dining table wobbles because a leg is cracked", "carpenter"),
    ("need someone to build built-in shelves for the study room", "carpenter"),
    ("my zoom calls keep freezing, think the connection speed is bad", "internet-setup"),
    ("the wifi doesn't reach the upstairs bedrooms at all", "internet-setup"),
    ("streaming keeps buffering even with a strong signal shown", "internet-setup"),
    ("the outside walls look faded and patchy, want a fresh coat", "painter"),
    ("ceiling has damp stains and the paint is peeling off", "painter"),
    ("want to change the living room colour to something brighter", "painter"),
    ("newly married couple looking for a small place close to the city center", "house-rental"),
    ("need a fully furnished flat for a short term stay", "house-rental"),
    ("single professional looking for a room close to the office", "house-rental"),
]

correct = 0
by_category = {}
for text, expected in novel_queries:
    pred = pipeline.predict([text])[0]
    proba = pipeline.predict_proba([text]).max()
    ok = pred == expected
    correct += ok
    by_category.setdefault(expected, [0, 0])
    by_category[expected][0] += ok
    by_category[expected][1] += 1
    status = "OK" if ok else "WRONG"
    print(f"[{status}] expected={expected:15s} predicted={pred:15s} conf={proba:.2f}  \"{text}\"")

print(f"\n{correct}/{len(novel_queries)} correct on hand-written novel queries ({correct/len(novel_queries):.1%})")
print("\nPer-category:")
for cat, (c, n) in sorted(by_category.items()):
    print(f"  {cat:15s} {c}/{n}")
