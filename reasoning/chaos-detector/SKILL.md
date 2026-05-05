---
name: chaos-detector
category: reasoning
description: Detect when LLM agent reasoning is collapsing into chaos using Lyapunov exponent analysis over token trajectories. Based on "Chaotic Dynamics in Multi-LLM Deliberation" (arXiv:2603.09127).
version: 1.0
tags: [reasoning, chaos-theory, dynamical-systems, divergence-detection, Lyapunov]
---

# Chaos Detector

Detect reasoning collapse in LLM agents before it happens. Model agent reasoning as a dynamical system, compute empirical Lyapunov exponents over token sequences, and flag when small perturbations are amplifying into divergent conclusions.

**Grounded in:** "Chaotic Dynamics in Multi-LLM Deliberation" (arXiv:2603.09127) — treats multi-agent deliberation as a random dynamical system and measures inter-run sensitivity via Lyapunov exponents.

## Core Mechanism

LLM reasoning trajectories are sequences in a high-dimensional embedding space. Small prompt differences → divergent outputs in chaotic systems. Lyapunov exponent (λ) quantifies this divergence rate:

- **λ > 0**: Chaotic divergence — reasoning is amplifying small differences, collapse imminent
- **λ ≈ 0**: Neutral — reasoning stable but not converging
- **λ < 0**: Converging — reasoning is making progress, stable execution

## When to Use

- Multi-round agent conversations where you suspect looping or contradiction building
- After `n` reasoning steps and you're not sure if the agent is converging or spiraling
- Pre-commitment: before a high-stakes decision, check if the reasoning attractor is stable
- Debugging: understand why the same prompt produces different outputs on different runs

## Workflow

### Step 1: Collect Token Trajectory

Extract the reasoning/assistant message sequence from the conversation:

```python
trajectory = [
    "Let me think about this bug...",
    "The issue is in the loop at line 42...",
    "I need to check if the array is sorted before iterating...",
    # ... continued reasoning
]
```

### Step 2: Run lyapunov.py

```bash
python ~/Documents/Jerrys-agent-skills/reasoning/chaos-detector/scripts/lyapunov.py \
  --tokens "tokenized_conversation.json" \
  --embedding-model text-embedding-3-small \
  --window-size 20 \
  --verbose
```

Or inline:
```bash
python ~/Documents/Jerrys-agent-skills/reasoning/chaos-detector/scripts/lyapunov.py \
  --text "Let me think about this bug... The issue is in the loop... I need to check..."
```

### Step 3: Interpret Output

```json
{
  "lyapunov_exponent": 0.073,
  "attractor_state": "diverging",
  "divergence_alert": true,
  "recovery_suggestion": "Restart reasoning from scratch with a more constrained prompt. Current trajectory has entered a contradiction loop between step 4 and step 7.",
  "trajectory_stability": 0.34,
  "confidence": 0.81
}
```

### Step 4: Act on the Alert

If `divergence_alert: true`:
- Halt the current reasoning thread
- Restart with a more constrained prompt
- Consider breaking the problem into smaller sub-problems
- Use `recovery_suggestion` to identify the conflicting steps

## Three Modes

### Lite Mode (No Embeddings)
Use perplexity of a simple n-gram model as a proxy for divergence. No API calls.

```bash
python ~/Documents/Jerrys-agent-skills/reasoning/chaos-detector/scripts/lyapunov.py \
  --text "conversation text here" \
  --method perplexity
```

### Standard Mode (Embeddings)
Uses OpenAI `text-embedding-3-small` (or configurable). Computes true Lyapunov exponent over embedding trajectories.

```bash
python ~/Documents/Jerrys-agent-skills/reasoning/chaos-detector/scripts/lyapunov.py \
  --text "conversation text here" \
  --embedding-model text-embedding-3-small
```

### Agentic Mode (Full Dynamical Analysis)
For multi-agent systems. Computes Lyapunov exponent across multiple agent reasoning traces simultaneously to detect cross-agent divergence.

```bash
python ~/Documents/Jerrys-agent-skills/reasoning/chaos-detector/scripts/lyapunov.py \
  --multi-agent "agent_a_trajectory.json" "agent_b_trajectory.json" \
  --embedding-model text-embedding-3-small
```

## MCP Tool Interface (via terminal)

```
lyapunov_detect(conversation: list[str], method: "perplexity" | "embedding" = "embedding")
  → { lyapunov_exponent, attractor_state, divergence_alert, recovery_suggestion, confidence }
```

## Token Budget

| Mode | API Calls | Latency | Accuracy |
|------|-----------|---------|----------|
| Lite (perplexity) | 0 | <1s | Low — proxy signal only |
| Standard | ~N/512 embeddings | ~2-5s | Medium — valid Lyapunov estimate |
| Agentic | ~M*N/512 | ~10-20s | High — full dynamical system |

N = token count, M = number of agents.

## Companion Script

**`scripts/lyapunov.py`** — pure stdlib (no external deps for Lite mode). Standard/Agentic modes use OpenAI embeddings API.

### Installation (optional)

```bash
# Install embeddings deps if you want Standard/Agentic modes
pip install openai tiktoken
export OPENAI_API_KEY=sk-...
```

### Quick Test

```bash
# Test with known chaotic text
python ~/Documents/Jerrys-agent-skills/reasoning/chaos-detector/scripts/lyapunov.py \
  --text "The bug is in the code. No wait, the bug is in my analysis. Actually the bug is in the code. Let me reconsider. The bug is definitely in the code. But maybe my analysis is wrong. Actually I think the bug is in my understanding of the code." \
  --method perplexity
```

Should return `lyapunov_exponent > 0` (diverging).

---

## Limitations

- **Embedding quality**: Low-quality embeddings degrade Lyapunov estimates. Use `text-embedding-3-small` or better.
- **Short trajectories**: Need at least 30+ tokens to compute a meaningful exponent. Below that, returns `insufficient_data`.
- **Single-agent vs multi-agent**: Single-agent Lyapunov is a lower bound on true system chaos; multi-agent is more accurate but slower.
- **Not a silver bullet**: A positive Lyapunov exponent means divergence is *possible*, not that collapse is *certain*. Use as one signal among many.

## Research Basis

- "Chaotic Dynamics in Multi-LLM Deliberation" — arXiv:2603.09127
- E. Ott, "Chaos in Dynamical Systems" (Cambridge University Press, 2002)
- Benettin algorithm for Lyapunov exponent estimation
