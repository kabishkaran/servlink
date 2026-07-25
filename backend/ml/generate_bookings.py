"""
Generates a synthetic dataset of customer "service sessions" for training the
service co-occurrence recommender. There is no real booking/browsing history
yet (the platform hasn't launched), so sessions are sampled from hand-defined
companion probabilities per category (e.g. a house-rental session is likely
to also include an electrician, plumber, mover, cleaner) plus a small amount
of random noise so the graph has to recover the signal rather than trivially
memorize it.

Output: data/bookings.csv with columns [session_id, category], long format
(one row per category engaged within a session).
"""
import csv
import random

random.seed(42)

CATEGORIES = [
    "house-rental", "electrician", "plumber", "movers",
    "cleaner", "carpenter", "internet-setup", "painter",
]

# Relative likelihood a session is "seeded" by this category.
SEED_WEIGHTS = {
    "house-rental": 0.28,
    "electrician": 0.16,
    "plumber": 0.14,
    "movers": 0.10,
    "cleaner": 0.12,
    "carpenter": 0.08,
    "internet-setup": 0.06,
    "painter": 0.06,
}

# Given the seed category, probability that each companion category is also
# engaged within the same session. Asymmetric on purpose (renting a house
# strongly implies wanting an electrician, but hiring an electrician doesn't
# strongly imply renting a house).
COMPANION_PROBS = {
    "house-rental": {
        "electrician": 0.55, "plumber": 0.50, "movers": 0.60,
        "cleaner": 0.65, "internet-setup": 0.45, "carpenter": 0.20, "painter": 0.15,
    },
    "electrician": {
        "plumber": 0.35, "carpenter": 0.30, "painter": 0.25, "house-rental": 0.10,
    },
    "plumber": {
        "electrician": 0.35, "carpenter": 0.25, "cleaner": 0.20, "house-rental": 0.10,
    },
    "movers": {
        "cleaner": 0.50, "carpenter": 0.30, "internet-setup": 0.40, "house-rental": 0.30,
    },
    "cleaner": {
        "movers": 0.30, "house-rental": 0.25, "painter": 0.15,
    },
    "carpenter": {
        "painter": 0.40, "electrician": 0.20, "plumber": 0.15,
    },
    "internet-setup": {
        "movers": 0.25, "house-rental": 0.20,
    },
    "painter": {
        "carpenter": 0.35, "electrician": 0.15,
    },
}

NOISE_PROB = 0.03  # chance to add a category that has no defined relationship
MAX_SESSION_SIZE = 4
N_SESSIONS = 6000


def build_session(seed: str) -> list[str]:
    session = {seed}
    for companion, prob in COMPANION_PROBS.get(seed, {}).items():
        if len(session) >= MAX_SESSION_SIZE:
            break
        if random.random() < prob:
            session.add(companion)

    for category in CATEGORIES:
        if len(session) >= MAX_SESSION_SIZE:
            break
        if category not in session and random.random() < NOISE_PROB:
            session.add(category)

    return list(session)


def main():
    seeds = list(SEED_WEIGHTS.keys())
    weights = list(SEED_WEIGHTS.values())

    rows = []
    for session_id in range(1, N_SESSIONS + 1):
        seed = random.choices(seeds, weights=weights, k=1)[0]
        for category in build_session(seed):
            rows.append((session_id, category))

    with open("data/bookings.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["session_id", "category"])
        writer.writerows(rows)

    avg_size = len(rows) / N_SESSIONS
    print(f"Generated {N_SESSIONS} sessions, {len(rows)} rows, avg session size {avg_size:.2f}")


if __name__ == "__main__":
    main()
