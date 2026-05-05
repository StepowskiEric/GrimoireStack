---
source: "jerry-skills"
name: active-inference-agent
category: mcp-servers
description: >
  An MCP server implementing a practical Active Inference agent based on Friston's Free Energy Principle.
  The agent maintains hierarchical beliefs about system states, computes Expected Free Energy (EFE) for each
  action, selects policies that minimize predicted surprise, and updates beliefs on observation. Pure stdlib —
  zero external dependencies.
---

# Active Inference Agent

Active Inference is a unified theory of brain and agent function from computational neuroscience (Karl Friston, 2006-present). The core idea: **all behavior emerges from minimizing Variational Free Energy** — an upper bound on surprise.

This MCP server implements a practical Active Inference agent for software engineering and operations tasks:

1. **Perception:** Maintain beliefs about hidden system states given observations
2. **Action:** Select actions that minimize Expected Free Energy (EFE) — trading off reward-seeking and information-gathering
3. **Learning:** Update beliefs when new evidence arrives

**Use it when:** The agent needs a principled,Bayesian theory of decision-making — not just heuristics, but a formal account of why one action is better than another based on predicted surprise and information value.

**Skill type:** MCP server (pure stdlib Python).

---

## The Core Math

```
Variational Free Energy:  F = KL(q(θ|o,m) || p(θ|o,m))
  — How surprised are we by observations given our model?

Expected Free Energy:    G(π) = E_q[ KL(q(s|π,m) || p(s|m)) ]
  — Predicted future surprise of following policy π

Action selection:        π* = argmin_π G(π)
  — Do the thing that will surprise you least while getting what you want
```

The agent has two goals:
- **Exploiting:** Take actions that lead to preferred outcomes (minimize risk)
- **Exploring:** Take actions that reduce uncertainty about the world (maximize information gain)

---

## Tools

| Tool | Purpose |
|------|---------|
| `init_beliefs` | Initialize the belief model: states, actions, outcomes, preferences |
| `add_outcome` | Observe a result and update beliefs about the hidden state |
| `compute_efe` | See EFE breakdown for all actions without committing to one |
| `select_policy` | Choose the action with minimum EFE (the active inference decision) |
| `get_beliefs` | Inspect current belief state |
| `get_history` | View full observation/action history |
| `set_hyperparams` | Tune learning rate, temperature,EFE weighting |
| `reset` | Clear all state |

---

## Setup: init_beliefs

Before anything else, call `init_beliefs` to define the problem space.

```
init_beliefs(
  state_labels=["healthy", "degraded", "down"],
  action_labels=["check_health", "run_diag", "restart_service", "scale_up"],
  outcome_labels=["ok", "warning", "error", "timeout"],
  outcome_preferences=[3.0, 0.0, -5.0, -4.0],   # reward signal: ok=best, error=worst
)
```

**outcome_preferences:** This is the reward signal — the agent will prefer actions that lead to outcomes with higher preference scores. It's the only domain knowledge you provide.

---

## Example: Incident Triage

```
1. init_beliefs
   state_labels: ["healthy", "memory_leak", "network_issue", "down"]
   action_labels: ["check_logs", "run_diag", "restart_pod", "scale_replicas"]
   outcome_labels: ["ok", "warning", "error", "timeout"]
   outcome_preferences: [3.0, 0.5, -5.0, -3.0]

2. select_policy()
   → chooses the first action based on initial beliefs

3. [agent executes the chosen action in the real system]

4. add_outcome(outcome="error")   # or outcome=2 (index)
   → updates beliefs: "error" observation makes "down" and "memory_leak" more likely

5. select_policy()
   → now biased toward actions that resolve memory leaks/network issues

6. [repeat until state_belief shows "healthy" with high probability]
```

## Example: Database Query Optimization

```
1. init_beliefs(
     state_labels=["fast_query", "slow_query", "timeout_query"],
     action_labels=["add_index", "rewrite_query", "increase_timeout", "partition_table"],
     outcome_labels=["fast", "slow", "timeout", "error"],
     outcome_preferences: [3.0, 0.5, -4.0, -5.0],
   )

2. [agent runs each action, observes outcome, calls add_outcome]

3. After N rounds: get_beliefs()
   → shows which state is most likely and which actions are most informative
```

---

## Hyperparameters

| Parameter | Default | Effect |
|-----------|---------|--------|
| `learning_rate` | 0.5 | How fast beliefs update on new evidence (0=slow, 1=fast) |
| `temperature` | 1.0 | Softmax randomness in policy selection (>1=more random, <1=more deterministic) |
| `efe_weight` | 0.7 | How much weight on information gain vs. reward in EFE |
| `prior_weight` | 0.3 | How much weight on outcome preferences in EFE |

**Tuning guide:**
- High `efe_weight` (0.9): Agent prefers actions that reduce uncertainty — good for diagnosis
- High `prior_weight` (0.9): Agent prefers actions that get good outcomes — good for exploitation
- High `temperature`: More exploration; useful when beliefs are uncertain

---

## Limitations

- This is a **categorical** Active Inference model (discrete states, actions, outcomes). For continuous state spaces, a different formulation is needed.
- The likelihood matrix `p(o | s, a)` is initialized as uniform and updated through a simplified variational rule. For real scientific use, implement proper variational message passing.
- For complex decision trees, provide explicit multi-step policies via `policies` parameter rather than relying on single-step greedy selection.

---

## References

- [The Free Energy Principle (Friston, 2010)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3114634/)
- [Active Inference: A Process Theory (Friston, 2017)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5341080/)
- [Active Inference Podcast (Pezzulo, Buckley, Parr](http://www.activeinference.org/))
- [Active Inference in LLMs (recent work)](https://arxiv.org/abs/2404.09387)
