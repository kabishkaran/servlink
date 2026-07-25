"""
Builds the service co-occurrence graph that powers ServLink's cross-category
AI suggestions (e.g. "customers who booked a house rental also booked an
electrician"). This replaces the hand-authored static suggestion lookup with
a graph learned from data, following the same generate-data -> train ->
evaluate -> serve pattern used for the query classifier in train.py.

Each session from data/bookings.csv contributes directed edges between every
pair of categories it contains. Edge weight source->target is the conditional
probability P(target in session | source in session), estimated only from the
training split. The trained graph is evaluated on held-out sessions with a
precision@5 / recall@5 metric: for each category in a test session, does the
graph's top-5 recommended companions overlap with the session's other
categories?

Output: model/recommend_graph.json (networkx node-link format)
        model/recommend_metrics.json
"""
import json
import random
from collections import defaultdict

import networkx as nx
import pandas as pd

DATA_PATH = "data/bookings.csv"
GRAPH_PATH = "model/recommend_graph.json"
METRICS_PATH = "model/recommend_metrics.json"

TOP_K = 5
MIN_EDGE_WEIGHT = 0.05  # drop noise edges below this conditional probability
TEST_FRACTION = 0.2


def load_sessions(df: pd.DataFrame) -> dict[int, list[str]]:
    sessions = defaultdict(list)
    for row in df.itertuples():
        sessions[row.session_id].append(row.category)
    return sessions


def build_graph(sessions: dict[int, list[str]]) -> nx.DiGraph:
    source_counts = defaultdict(int)
    pair_counts = defaultdict(int)

    for categories in sessions.values():
        unique = set(categories)
        for source in unique:
            source_counts[source] += 1
            for target in unique:
                if source != target:
                    pair_counts[(source, target)] += 1

    graph = nx.DiGraph()
    graph.add_nodes_from(source_counts.keys())

    for (source, target), count in pair_counts.items():
        weight = count / source_counts[source]
        if weight >= MIN_EDGE_WEIGHT:
            graph.add_edge(source, target, weight=round(weight, 4))

    return graph


def recommend(graph: nx.DiGraph, category: str, k: int = TOP_K) -> list[str]:
    if category not in graph:
        return []
    ranked = sorted(graph[category].items(), key=lambda item: -item[1]["weight"])
    return [target for target, _ in ranked[:k]]


def evaluate(graph: nx.DiGraph, test_sessions: dict[int, list[str]]) -> dict:
    hits, recommended_total, relevant_total, evaluated = 0, 0, 0, 0

    for categories in test_sessions.values():
        unique = set(categories)
        for source in unique:
            true_companions = unique - {source}
            if not true_companions:
                continue
            top_k = set(recommend(graph, source))
            if not top_k:
                continue
            evaluated += 1
            hits += len(top_k & true_companions)
            recommended_total += len(top_k)
            relevant_total += len(true_companions)

    precision_at_k = hits / recommended_total if recommended_total else 0.0
    recall_at_k = hits / relevant_total if relevant_total else 0.0
    return {
        "precision_at_5": round(precision_at_k, 4),
        "recall_at_5": round(recall_at_k, 4),
        "evaluated_category_instances": evaluated,
    }


def main():
    df = pd.read_csv(DATA_PATH)
    sessions = load_sessions(df)

    session_ids = list(sessions.keys())
    random.Random(42).shuffle(session_ids)
    split = int(len(session_ids) * (1 - TEST_FRACTION))
    train_ids, test_ids = session_ids[:split], session_ids[split:]

    train_sessions = {sid: sessions[sid] for sid in train_ids}
    test_sessions = {sid: sessions[sid] for sid in test_ids}

    graph = build_graph(train_sessions)
    eval_metrics = evaluate(graph, test_sessions)

    print(f"Graph: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges")
    print(f"precision@5: {eval_metrics['precision_at_5']:.4f}  recall@5: {eval_metrics['recall_at_5']:.4f}")
    for category in sorted(graph.nodes):
        companions = recommend(graph, category)
        print(f"  {category:15s} -> {companions}")

    with open(GRAPH_PATH, "w", encoding="utf-8") as f:
        json.dump(nx.node_link_data(graph, edges="edges"), f, indent=2)

    metrics = {
        **eval_metrics,
        "n_sessions_train": len(train_sessions),
        "n_sessions_test": len(test_sessions),
        "n_nodes": graph.number_of_nodes(),
        "n_edges": graph.number_of_edges(),
        "top_k": TOP_K,
        "min_edge_weight": MIN_EDGE_WEIGHT,
    }
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nSaved graph to {GRAPH_PATH}")
    print(f"Saved metrics to {METRICS_PATH}")


if __name__ == "__main__":
    main()
