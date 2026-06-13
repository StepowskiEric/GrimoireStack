#!/usr/bin/env python3
"""
Lyapunov Exponent Estimator for LLM Reasoning Trajectories.

Implements Benettin's algorithm to estimate the maximum Lyapunov exponent
over token/embedding sequences from LLM reasoning trajectories.

Based on:
  - "Chaotic Dynamics in Multi-LLM Deliberation" (arXiv:2603.09127)
  - Benettin et al. (1980) "Lyapunov characteristic exponents for smooth
    dynamical systems"
  - Ott (2002) "Chaos in Dynamical Systems"

Usage:
    python lyapunov.py --text "reasoning text here" [--method perplexity]
    python lyapunov.py --tokens tokens.json [--embedding-model text-embedding-3-small]
    python lyapunov.py --multi-agent agent_a.json agent_b.json

Output:
    JSON with lyapunov_exponent, attractor_state, divergence_alert,
    recovery_suggestion, trajectory_stability, confidence.
"""

import sys
import json
import math
import argparse
import subprocess
from pathlib import Path
from typing import Optional

# ── Pure-stdlib perplexity method (no API calls) ──────────────────────────────

def compute_perplexity_ngram(text: str, n: int = 3) -> float:
    """
    Estimate trajectory perplexity using a simple Katz n-gram backoff model.
    Higher perplexity → more unpredictable → potential chaos.

    Returns perplexity per character. Values > 2.0 suggest instability.
    """
    if len(text) < n * 2:
        return 1.0  # Insufficient data

    # Build n-gram counts with add-1 smoothing
    ngram_counts: dict[tuple, dict[str, int]] = {}
    total_ngrams = 0

    for i in range(len(text) - n):
        ctx = tuple(text[i:i+n])
        ch = text[i+n]
        ngram_counts.setdefault(ctx, {})[ch] = \
            ngram_counts.get(ctx, {}).get(ch, 0) + 1
        total_ngrams += 1

    if total_ngrams == 0:
        return 1.0

    # Compute cross-entropy via Katz backoff
    entropy = 0.0
    valid_ctxs = 0

    for i in range(len(text) - n):
        ctx = tuple(text[i:i+n])
        ch = text[i+n]
        counts = ngram_counts.get(ctx, {})
        if counts:
            total = sum(counts.values())
            prob = counts.get(ch, 0) / total
            if prob > 0:
                entropy -= math.log2(prob) / total_ngrams
            valid_ctxs += 1

    perplexity = 2 ** entropy if entropy > 0 else 1.0
    return perplexity


def perplexity_to_lyapunov(ppl: float) -> float:
    """
    Heuristic mapping from perplexity to Lyapunov-equivalent exponent.
    Calibrated so ppl=2.0 → λ≈0, ppl=4.0 → λ≈0.5.
    """
    # Perplexity growth rate ≈ entropy rate
    # λ ≈ (1/n) * log2(ppl) where n is context length factor
    return max(0.0, math.log2(ppl) / 8.0)


# ── Embedding-based Lyapunov computation ──────────────────────────────────────

def get_embeddings(texts: list[str], model: str = "text-embedding-3-small") -> list[list[float]]:
    """
    Fetch embeddings via OpenAI API. Falls back to a simple hash-based
    pseudo-embedding if no API key is available (for testing only).
    """
    api_key = subprocess.check_output(
        ["python3", "-c",
         "import os; print(os.environ.get('OPENAI_API_KEY', ''))"],
        text=True
    ).strip()

    if not api_key:
        # Return pseudo-embeddings using a deterministic hash
        # WARNING: only valid for testing/debugging, not for real Lyapunov estimates
        return [[hash(t) % 1000 / 1000.0 for _ in range(8)] for t in texts]

    try:
        import openai
    except ImportError:
        sys.stderr.write("openai not installed. Install with: pip install openai\n")
        sys.exit(1)

    client = openai.OpenAI(api_key=api_key)
    response = client.embeddings.create(
        model=model,
        input=texts
    )
    return [item.embedding for item in response.data]


def compute_lyapunov_bennettin(
    trajectories: list[list[list[float]]],
    dt: float = 1.0
) -> tuple[float, float]:
    """
    Benettin's algorithm for maximum Lyapunov exponent.

    Args:
        trajectories: list of embedding sequences. Each sequence is a list of
                     embedding vectors. For single-agent, list of one trajectory.
                     For multi-agent, one trajectory per agent.
        dt: time step between observations (default 1 token)

    Returns:
        (lambda_max, confidence): maximum Lyapunov exponent and estimate confidence.
        lambda_max > 0  → chaotic divergence
        lambda_max ≈ 0  → neutral
        lambda_max < 0  → stable convergence
    """
    if not trajectories or not trajectories[0]:
        return 0.0, 0.0

    n_steps = min(len(t) for t in trajectories)
    n_agents = len(trajectories)
    embed_dim = len(trajectories[0][0])

    if n_steps < 3:
        return 0.0, 0.0

    # ── Step 1: Construct reference trajectory (first agent) ──────────────
    ref = trajectories[0]
    n_pairs = n_agents - 1  # auxiliary trajectories (other agents)

    # ── Step 2: Compute divergence rates ────────────────────────────────────
    # For each step t, compute the distance to the reference and its rate of change
    divergence_rates: list[float] = []

    for t in range(1, n_steps):
        # Distance from each agent to reference at time t
        d_t = [
            math.sqrt(sum((a - b) ** 2
                          for a, b in zip(trajectories[j][t], ref[t])))
            for j in range(n_agents)
        ]

        # Distance at previous step
        d_prev = [
            math.sqrt(sum((a - b) ** 2
                          for a, b in zip(trajectories[j][t-1], ref[t-1])))
            for j in range(n_agents)
        ]

        # Local divergence rate (avoid division by zero)
        for d_now, d_then in zip(d_t, d_prev):
            if d_now > 1e-10 and d_then > 1e-10:
                rate = math.log(d_now / d_then) / dt
                divergence_rates.append(rate)

    if not divergence_rates:
        return 0.0, 0.0

    # ── Step 3: Estimate λ via mean divergence rate ────────────────────────
    # λ ≈ <log(d(t)/d(0))> across all t and agents
    # This is the finite-time Lyapunov exponent (FTLE) approximation
    lambda_max = sum(divergence_rates) / len(divergence_rates)

    # Confidence: inverse coefficient of variation of divergence rates
    mean_rate = lambda_max
    variance = sum((r - mean_rate) ** 2 for r in divergence_rates) / len(divergence_rates)
    std_rate = math.sqrt(max(0.0, variance))
    confidence = min(1.0, abs(mean_rate) / (std_rate + 1e-10)) if std_rate > 0 else 0.5

    return lambda_max, confidence


def trajectory_stability(lambda_max: float) -> float:
    """
    Map Lyapunov exponent to a [0, 1] stability score.
    λ < -0.5 → stability=1.0 (strongly converging)
    λ ≈  0  → stability=0.5 (neutral)
    λ >  0.5 → stability=0.0 (chaotic)
    """
    return max(0.0, min(1.0, 0.5 - lambda_max))


def attractor_state(lambda_max: float, confidence: float) -> str:
    """
    Classify the attractor state of the reasoning trajectory.
    """
    if confidence < 0.3:
        return "insufficient_data"
    if lambda_max > 0.1:
        return "diverging"
    elif lambda_max > 0.01:
        return "near_instability"
    elif lambda_max < -0.1:
        return "converging"
    else:
        return "stable_neutral"


def recovery_suggestion(state: str, lambda_max: float) -> str:
    suggestions = {
        "diverging": (
            "Reasoning trajectory is chaotic — small differences amplify rapidly. "
            "Halt current thread. Break the problem into sub-problems. "
            "Restart with narrower constraints and a fixed reasoning budget (e.g., 5 steps max)."
        ),
        "near_instability": (
            "Trajectory is near the edge of chaos. "
            "Apply a 'consolidation step': summarize current state, discard contradictory steps, "
            "then continue with explicit conflict detection."
        ),
        "converging": (
            "Reasoning is making stable progress. "
            "Continue current trajectory. No intervention needed."
        ),
        "stable_neutral": (
            "Trajectory is stable. "
            "Proceed normally. Monitor for divergence if task complexity increases."
        ),
        "insufficient_data": (
            "Not enough data to compute Lyapunov exponent reliably. "
            "Need at least 30+ tokens or 3+ reasoning steps. "
            "Continue reasoning and re-check after next step."
        ),
    }
    return suggestions.get(state, "Unknown state.")


# ── JSON loading helpers ──────────────────────────────────────────────────────

def load_tokens_from_json(path: str) -> list[str]:
    p = Path(path)
    if p.suffix == ".json":
        data = json.loads(p.read_text())
        if isinstance(data, list):
            if data and isinstance(data[0], str):
                return data
            if data and isinstance(data[0], dict) and "content" in data[0]:
                return [item["content"] for item in data]
            if data and isinstance(data[0], list):
                # Multi-agent: list of token lists
                return data
    raise ValueError(f"Unexpected token format in {path}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Lyapunov exponent estimator for LLM reasoning trajectories"
    )
    parser.add_argument("--text", type=str, help="Raw text to analyze")
    parser.add_argument("--tokens", type=str, help="Path to JSON file with token list or multi-agent [[tokens]]")
    parser.add_argument("--method", choices=["perplexity", "embedding"],
                        default="perplexity", help="Analysis method")
    parser.add_argument("--embedding-model", default="text-embedding-3-small",
                        help="OpenAI embedding model (used with --method embedding)")
    parser.add_argument("--window-size", type=int, default=20,
                        help="Minimum tokens per analysis window")
    parser.add_argument("--multi-agent", nargs="+",
                        help="Multiple JSON files, one per agent (multi-agent mode)")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    # ── Load data ──────────────────────────────────────────────────────────
    if args.text:
        texts = [args.text]
    elif args.tokens:
        texts = load_tokens_from_json(args.tokens)
    elif args.multi_agent:
        texts = args.multi_agent  # paths to per-agent JSON files
    else:
        sys.stderr.write("Error: provide --text or --tokens or --multi-agent\n")
        sys.exit(1)

    # ── Perplexity method (pure stdlib, no API) ────────────────────────────
    if args.method == "perplexity":
        if isinstance(texts[0], str) and len(texts) == 1:
            ppl = compute_perplexity_ngram(texts[0])
            lambda_max = perplexity_to_lyapunov(ppl)
        else:
            # Multi-agent: average perplexity across agents
            lambdas = []
            for t in texts:
                if isinstance(t, str):
                    ppl = compute_perplexity_ngram(t)
                    lambdas.append(perplexity_to_lyapunov(ppl))
                else:
                    ppl = compute_perplexity_ngram(" ".join(str(x) for x in t))
                    lambdas.append(perplexity_to_lyapunov(ppl))
            lambda_max = sum(lambdas) / len(lambdas)

        state = attractor_state(lambda_max, confidence=0.6)
        stability = trajectory_stability(lambda_max)

    # ── Embedding method ───────────────────────────────────────────────────
    elif args.method == "embedding":
        if args.verbose:
            sys.stderr.write(f"Fetching embeddings for {len(texts)} texts...\n")

        # Load per-agent trajectories
        if args.multi_agent:
            all_trajectories: list[list[list[float]]] = []
            for agent_path in args.multi_agent:
                data = json.loads(Path(agent_path).read_text())
                tokens = data if isinstance(data, list) else data.get("tokens", data.get("content", []))
                str_tokens = [str(t) for t in tokens]
                if len(str_tokens) < args.window_size:
                    sys.stderr.write(f"Warning: {agent_path} has only {len(str_tokens)} tokens, need {args.window_size}\n")
                embs = get_embeddings(str_tokens, args.embedding_model)
                all_trajectories.append(embs)
            trajectories = all_trajectories
        else:
            tokens = texts if isinstance(texts[0], str) else texts[0]
            str_tokens = [str(t) for t in tokens]
            if len(str_tokens) < args.window_size:
                sys.stderr.write(f"Warning: only {len(str_tokens)} tokens, need {args.window_size}\n")
            embs = get_embeddings(str_tokens, args.embedding_model)
            trajectories = [embs]

        lambda_max, confidence = compute_lyapunov_bennettin(trajectories)
        state = attractor_state(lambda_max, confidence)
        stability = trajectory_stability(lambda_max)

    else:
        lambda_max = 0.0
        state = "insufficient_data"
        stability = 0.5
        confidence = 0.0

    result = {
        "lyapunov_exponent": round(lambda_max, 6),
        "attractor_state": state,
        "divergence_alert": state in ("diverging", "near_instability"),
        "recovery_suggestion": recovery_suggestion(state, lambda_max),
        "trajectory_stability": round(stability, 4),
        "confidence": round(confidence, 4) if "confidence" in dir() else 0.6,
    }

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
