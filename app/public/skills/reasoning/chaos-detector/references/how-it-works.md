# Chaos Detector — How It Works

## Lyapunov Exponents in Plain English

A Lyapunov exponent (λ) measures how quickly tiny differences between two nearly-identical system states grow over time. In a stable system, small differences fade. In a chaotic system, they amplify exponentially.

**For LLM reasoning:** If two reasoning trajectories start from almost the same prompt but end up at completely different conclusions, the system is chaotic. λ quantifies how fast they diverge.

λ > 0 → chaos (divergence)
λ < 0 → order (convergence)
λ ≈ 0 → neutral (random walk)

## Benettin's Algorithm (Simplified)

The algorithm estimates λ from observed trajectory data:

1. **Reference trajectory**: The actual reasoning output from the agent
2. **Auxiliary trajectories**: Other agents reasoning on the same problem (or re-runs of the same prompt)
3. **Divergence rate**: At each step, measure how far the auxiliary trajectories have drifted from the reference
4. **λ estimate**: Average of log-divergence rates across all steps

```python
λ ≈ (1/T) * Σ_t log(d(t+1) / d(t))

where d(t) = Euclidean distance between trajectories at step t
```

## Why Embeddings?

Text → embedding space → treat as a dynamical system state. The embedding captures semantic meaning, so divergence in embedding space = genuine semantic divergence in reasoning.

Without embeddings (perplexity method): Uses n-gram predictability as a proxy. Lower accuracy but zero API calls.

## Limitations and Calibration

- **Minimum data**: Need 30+ tokens to get any estimate, 100+ for reliable estimates
- **Embedding model matters**: text-embedding-3-small is fast and sufficient; larger models may give smoother trajectories
- **Single vs multi-agent**: Multi-agent is more accurate but requires multiple agents reasoning in parallel
- **λ is a rate, not a certainty**: λ > 0 means divergence is *possible*, not that it *will* happen

## Calibration Guide

| λ Range | Attractor State | Interpretation |
|---------|-----------------|---------------|
| λ > 0.3 | Diverging | Reasoning is chaotic. Restart immediately. |
| 0.1 < λ ≤ 0.3 | Near-instability | Reasoning is fragile. Apply consolidation step. |
| 0.01 < λ ≤ 0.1 | Stable neutral | Normal reasoning. No intervention needed. |
| λ < -0.01 | Converging | Making clear progress. |
| confidence < 0.3 | Insufficient data | Not enough tokens/steps to estimate. |

## Mathematical References

- Benettin, G., et al. (1980). "Lyapunov characteristic exponents for smooth dynamical systems." *J. Stat. Phys.*
- Ott, E. (2002). "Chaos in Dynamical Systems." Cambridge University Press.
- Rosenstein, M. T., et al. (1993). "A practical method for calculating largest Lyapunov exponent from small data sets."
- arXiv:2603.09127 — "Chaotic Dynamics in Multi-LLM Deliberation"
