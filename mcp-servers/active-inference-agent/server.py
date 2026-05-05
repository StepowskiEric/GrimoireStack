#!/usr/bin/env python3
"""
Active Inference Agent MCP Server

Implements a practical Active Inference agent based on Karl Friston's Free Energy Principle.
The agent maintains a hierarchical belief model of expected outcomes, computes Expected Free Energy
(EFE) for each possible action, selects the policy that minimizes predicted surprise, and updates
beliefs on observation.

Mathematical core:
  G(π) = E_q[KL(q(θ|π,m) || p(θ|m))]  — Expected Free Energy of a policy
  F = KL(q(θ|o,m) || p(θ|o,m))          — Variational Free Energy (surprise bound)
  Action selected: π* = argmin_π G(π)

Tools:
  init_beliefs        — Initialize the belief state (prior over hidden states)
  add_outcome         — Add an observation/outcome and update beliefs
  compute_efe         — Compute Expected Free Energy for each possible action
  select_policy       — Select the action with minimum EFE (active inference)
  get_beliefs         — Return current belief state
  get_history         — Return observation history
  set_hyperparams     — Configure learning rate, temperature,EFE weighting
  reset               — Clear all state
"""

import json
import math
import random
import sys
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

# ────────────────────────────────────────────────────────────────────────────────
# MCP stdio transport
# ────────────────────────────────────────────────────────────────────────────────

def _read_message() -> Optional[Dict[str, Any]]:
    first = sys.stdin.buffer.read(1)
    if not first:
        return None
    # SDK mode: raw JSON line (no Content-Length header)
    if first == b"{":
        line = first + sys.stdin.buffer.readline()
        return json.loads(line.decode("utf-8"))
    # Legacy Content-Length mode
    if first == b"C":
        headers = first + sys.stdin.buffer.readline()
        while not headers.endswith(b"\r\n\r\n"):
            headers += sys.stdin.buffer.readline()
        length = 0
        for hline in headers.decode("ascii", errors="ignore").splitlines():
            if hline.lower().startswith("content-length:"):
                length = int(hline.split(":", 1)[1].strip())
        if not length:
            return None
        body = sys.stdin.buffer.read(length)
        return json.loads(body.decode("utf-8"))
    # Fallback: try raw JSON parse
    try:
        return json.loads(first.decode("utf-8"))
    except Exception:
        return None


def _send_message(msg: Dict[str, Any]) -> None:
    """Send a JSON-RPC message to stdout as a raw JSON line."""
    body = json.dumps(msg, separators=(",", ":")).encode("utf-8") + b"\n"
    sys.stdout.buffer.write(body)
    sys.stdout.buffer.flush()


# ────────────────────────────────────────────────────────────────────────────────
# Active Inference Core
# ────────────────────────────────────────────────────────────────────────────────

def _softmax(values: List[float], temperature: float = 1.0) -> List[float]:
    """Numerically stable softmax with temperature."""
    if not values:
        return []
    max_v = max(values)
    exps = [math.exp((v - max_v) / temperature) for v in values]
    total = sum(exps)
    return [e / total for e in exps]


def _kl_divergence(p: List[float], q: List[float], eps: float = 1e-12) -> float:
    """KL(p || q) = sum(p_i * log(p_i / q_i))"""
    return sum(p_i * math.log((p_i + eps) / (q_i + eps)) for p_i, q_i in zip(p, q) if p_i > 0)


class OutcomeDistribution:
    """A categorical distribution over outcomes for a given (state, action)."""

    def __init__(self, n_outcomes: int):
        self.n = n_outcomes
        self.probs = [1.0 / n_outcomes] * n_outcomes  # uniform prior

    def set(self, probs: List[float]):
        total = sum(probs)
        self.probs = [p / total for p in probs]

    def sample(self) -> int:
        r = random.random()
        cumulative = 0.0
        for i, p in enumerate(self.probs):
            cumulative += p
            if r <= cumulative:
                return i
        return self.n - 1

    def entropy(self) -> float:
        return -sum(p * math.log(p + 1e-12) for p in self.probs if p > 0)


class ActiveInferenceAgent:
    """
    A minimal but complete Active Inference agent.

    Model:
      - N hidden states (e.g., possible system conditions)
      - M possible actions (e.g., diagnostic tools to run)
      - Each (state, action) -> outcome distribution: p(o | s, a)
      - Each state has a prior preference: p(o) (what outcomes the agent prefers)
      - Policies ranked by Expected Free Energy: G(π) = E[KL(q(s|π) || p(s|o))]

    Belief updating: variational message passing (simplified as softmax posterior on evidence)
    Policy selection: minimum EFE (active inference principle)
    """

    def __init__(self):
        self.obs_history: List[Dict] = []
        self.generation: int = 0
        self.state_labels: List[str] = []
        self.action_labels: List[str] = []
        self.outcome_labels: List[str] = []
        self.n_states: int = 0
        self.n_actions: int = 0
        self.n_outcomes: int = 0

        # Likelihood matrix: p(o | s, a)
        self.likelihood: Dict[Tuple[int, int], OutcomeDistribution] = {}

        # Prior preferences: p(o) as log-probability (higher = more preferred)
        self.outcome_prior: List[float] = []

        # Current beliefs about hidden state: q(s | history)
        self.state_belief: List[float] = []

        # Action history
        self.action_history: List[int] = []

        # Hyperparameters
        self.learning_rate: float = 0.5   # belief update rate
        self.temperature: float = 1.0      # softmax temperature for policy
        self.efe_weight: float = 0.7        # weight on EFE vs. entropy in policy
        self.prior_weight: float = 0.3      # weight on prior preference in EFE

        # Policies: list of action sequences
        self.policies: List[List[int]] = []

        # Metadata
        self._id_counter: int = 0

    def _next_id(self) -> str:
        self._id_counter += 1
        return f"obs_{self._id_counter:04d}"

    # ── Initialization ─────────────────────────────────────────────────────────

    def init_beliefs(
        self,
        state_labels: List[str],
        action_labels: List[str],
        outcome_labels: List[str],
        initial_state_belief: Optional[List[float]] = None,
        outcome_preferences: Optional[List[float]] = None,
        policies: Optional[List[List[int]]] = None,
    ) -> Dict[str, Any]:
        """
        Initialize the agent's belief model.

        Each label list defines the semantic space:
          - state_labels: possible hidden states (e.g., ["healthy", "degraded", "down"])
          - action_labels: available actions (e.g., ["check_logs", "run_diag", "restart"])
          - outcome_labels: possible observations (e.g., ["ok", "warning", "error"])

        outcome_preferences: reward signal — higher = more preferred outcome (log-prob)
        policies: list of action sequences. If None, all single actions are tried.
        """
        self.state_labels = state_labels
        self.action_labels = action_labels
        self.outcome_labels = outcome_labels
        self.n_states = len(state_labels)
        self.n_actions = len(action_labels)
        self.n_outcomes = len(outcome_labels)

        if self.n_outcomes == 0:
            raise ValueError("outcome_labels cannot be empty")

        # Outcome prior: uniform unless specified
        self.outcome_prior = outcome_preferences or [0.0] * self.n_outcomes

        # Initial state belief: uniform unless specified
        self.state_belief = (
            initial_state_belief
            if initial_state_belief
            else [1.0 / self.n_states] * self.n_states
        )

        # Initialize likelihood matrix p(o | s, a) as uniform
        self.likelihood = {}
        for s in range(self.n_states):
            for a in range(self.n_actions):
                self.likelihood[(s, a)] = OutcomeDistribution(self.n_outcomes)

        # Default policies: all single-step actions
        if policies is None:
            self.policies = [[a] for a in range(self.n_actions)]
        else:
            self.policies = policies

        self.obs_history = []
        self.action_history = []
        self.generation = 0

        return {
            "n_states": self.n_states,
            "n_actions": self.n_actions,
            "n_outcomes": self.n_outcomes,
            "n_policies": len(self.policies),
            "policies_preview": [
                [self.action_labels[a] for a in p] for p in self.policies[:5]
            ],
        }

    # ── Outcome observation + belief update ───────────────────────────────────

    def add_outcome(self, outcome: Any) -> Dict[str, Any]:
        """
        Observe an outcome and update beliefs about the hidden state.

        outcome: int index or any value matching outcome_labels
        """
        self.generation += 1

        # Resolve outcome to index
        if isinstance(outcome, int):
            obs_idx = outcome
        elif isinstance(outcome, str):
            try:
                obs_idx = self.outcome_labels.index(outcome)
            except ValueError:
                raise ValueError(f"Unknown outcome '{outcome}'. Available: {self.outcome_labels}")
        else:
            raise ValueError(f"Outcome must be int or str, got {type(outcome)}")

        # Variational update: q(s) ∝ p(o | s, a_last) * q(s)
        # Use last action to condition the likelihood; if no action yet, use uniform
        if self.action_history:
            last_action = self.action_history[-1]
        else:
            last_action = None

        new_belief = []
        for s in range(self.n_states):
            if last_action is not None and (s, last_action) in self.likelihood:
                p_o_given_sa = self.likelihood[(s, last_action)].probs[obs_idx]
            else:
                p_o_given_sa = 1.0 / self.n_outcomes

            # Posterior ∝ likelihood * prior
            posterior = p_o_given_sa * self.state_belief[s]
            new_belief.append(posterior)

        # Normalize
        total = sum(new_belief)
        if total > 0:
            new_belief = [b / total for b in new_belief]
        else:
            new_belief = [1.0 / self.n_states] * self.n_states

        # Learning-rate weighted update (mix old and new)
        self.state_belief = [
            (1 - self.learning_rate) * self.state_belief[i] + self.learning_rate * new_belief[i]
            for i in range(self.n_states)
        ]

        obs_record = {
            "id": self._next_id(),
            "generation": self.generation,
            "outcome": outcome,
            "outcome_idx": obs_idx,
            "outcome_label": self.outcome_labels[obs_idx] if obs_idx < len(self.outcome_labels) else str(obs_idx),
            "last_action": self.action_labels[self.action_history[-1]] if self.action_history else None,
            "state_belief_after": list(self.state_belief),
        }
        self.obs_history.append(obs_record)

        return {
            "generation": self.generation,
            "outcome": obs_record["outcome_label"],
            "state_belief": {self.state_labels[i]: round(b, 4) for i, b in enumerate(self.state_belief)},
            "entropy_belief": round(self._belief_entropy(), 4),
        }

    # ── Expected Free Energy computation ───────────────────────────────────────

    def compute_efe(self) -> Dict[str, Any]:
        """
        Compute Expected Free Energy G(a) for each action.

        G(a) = E_q[KL(q(s|o,a) || p(s))] - H[p(o|s,a)]
              = predicted cost of not knowing the state (risk)
              + expected informativeness of the action (reward)

        Simplified: G(a) ≈ -reward(a) where reward combines:
          - Outcome preference alignment (does this action tend to produce good outcomes?)
          - Information gain (does this action reduce belief entropy?)
        """
        results = {}
        action_efe = []

        for a in range(self.n_actions):
            # Expected outcome distribution: sum_s q(s) * p(o | s, a)
            expected_outcome = [0.0] * self.n_outcomes
            for s in range(self.n_states):
                p_s = self.state_belief[s]
                p_o_given_sa = self.likelihood[(s, a)].probs
                for o in range(self.n_outcomes):
                    expected_outcome[o] += p_s * p_o_given_sa[o]

            # Risk: KL between expected outcome and prior preference
            risk = sum(expected_outcome[o] * self.outcome_prior[o] for o in range(self.n_outcomes))

            # Information gain: expected outcome entropy
            info_gain = -sum(
                expected_outcome[o] * math.log(expected_outcome[o] + 1e-12)
                for o in range(self.n_outcomes)
                if expected_outcome[o] > 0
            )

            # Composite EFE: negative reward (we minimize)
            efe = -(self.prior_weight * risk + self.efe_weight * info_gain)

            # Uncertainty bonus: penalize actions whose outcomes are unpredictable
            action_entropy = self.likelihood[(0, a)].entropy()  # avg over states
            uncertainty_penalty = self.efe_weight * action_entropy * 0.1

            final_efe = efe + uncertainty_penalty

            results[self.action_labels[a]] = {
                "efe": round(final_efe, 4),
                "risk": round(risk, 4),
                "info_gain": round(info_gain, 4),
                "uncertainty": round(uncertainty_penalty, 4),
            }
            action_efe.append(final_efe)

        return results

    # ── Policy selection ───────────────────────────────────────────────────────

    def select_policy(self) -> Dict[str, Any]:
        """
        Select action with minimum Expected Free Energy (active inference).
        Returns the action and its EFE score.

        If multiple actions tie, selects randomly among ties.
        """
        efe_results = self.compute_efe()
        action_scores = [(a, efe_results[self.action_labels[a]]["efe"]) for a in range(self.n_actions)]

        min_efe = min(s for _, s in action_scores)
        best_actions = [a for a, s in action_scores if abs(s - min_efe) < 1e-9]

        chosen = random.choice(best_actions)
        self.action_history.append(chosen)

        efe_info = efe_results[self.action_labels[chosen]]

        return {
            "chosen_action": self.action_labels[chosen],
            "action_idx": chosen,
            "efe": efe_info["efe"],
            "risk": efe_info["risk"],
            "info_gain": efe_info["info_gain"],
            "all_actions_ranked": sorted(
                [(self.action_labels[a], round(s, 4)) for a, s in action_scores],
                key=lambda x: x[1],
                reverse=True,
            ),
        }

    # ── Utilities ─────────────────────────────────────────────────────────────

    def _belief_entropy(self) -> float:
        return -sum(p * math.log(p + 1e-12) for p in self.state_belief if p > 0)

    def get_beliefs(self) -> Dict[str, Any]:
        return {
            "state_labels": self.state_labels,
            "state_belief": {self.state_labels[i]: round(b, 4) for i, b in enumerate(self.state_belief)},
            "entropy": round(self._belief_entropy(), 4),
            "last_action": self.action_labels[self.action_history[-1]] if self.action_history else None,
        }

    def get_history(self) -> List[Dict]:
        return self.obs_history

    def set_hyperparams(
        self,
        learning_rate: Optional[float] = None,
        temperature: Optional[float] = None,
        efe_weight: Optional[float] = None,
        prior_weight: Optional[float] = None,
    ) -> Dict[str, Any]:
        if learning_rate is not None:
            self.learning_rate = max(0.0, min(1.0, learning_rate))
        if temperature is not None:
            self.temperature = max(0.01, temperature)
        if efe_weight is not None:
            self.efe_weight = max(0.0, min(1.0, efe_weight))
        if prior_weight is not None:
            self.prior_weight = max(0.0, min(1.0, prior_weight))
        return {"learning_rate": self.learning_rate, "temperature": self.temperature,
                "efe_weight": self.efe_weight, "prior_weight": self.prior_weight}

    def reset(self) -> Dict[str, str]:
        self.__init__()
        return {"status": "reset"}


# Singleton agent
AGENT = ActiveInferenceAgent()

# ────────────────────────────────────────────────────────────────────────────────
# Tool definitions
# ────────────────────────────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "init_beliefs",
        "description": "Initialize the Active Inference agent's belief model. Define the hidden states, actions, outcomes, prior preferences, and policy options before running the agent.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "state_labels": {"type": "array", "items": {"type": "string"}, "description": "Possible hidden states (e.g., ['healthy', 'degraded', 'down'])"},
                "action_labels": {"type": "array", "items": {"type": "string"}, "description": "Available actions (e.g., ['check_logs', 'run_diag', 'restart_service'])"},
                "outcome_labels": {"type": "array", "items": {"type": "string"}, "description": "Observable outcomes (e.g., ['ok', 'warning', 'error', 'timeout'])"},
                "initial_state_belief": {"type": "array", "items": {"type": "number"}, "description": "Prior distribution over states (default: uniform)"},
                "outcome_preferences": {"type": "array", "items": {"type": "number"}, "description": "Log-reward for each outcome — higher = more preferred (e.g., [2.0, 0.0, -5.0] for ok=wanted, warning=neutral, error=bad)"},
                "policies": {"type": "array", "items": {"type": "array", "items": {"type": "integer"}}, "description": "List of action sequences (each as action indices). Default: all single-step actions."},
            },
            "required": ["state_labels", "action_labels", "outcome_labels"],
        },
    },
    {
        "name": "add_outcome",
        "description": "Observe an outcome (the result of the last action) and update beliefs about the hidden state.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "outcome": {"oneOf": [{"type": "integer"}, {"type": "string"}], "description": "Outcome index or label matching outcome_labels"},
            },
            "required": ["outcome"],
        },
    },
    {
        "name": "compute_efe",
        "description": "Compute Expected Free Energy (EFE) for each possible action. Shows risk, information gain, and uncertainty for each action.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "select_policy",
        "description": "Select the action with minimum Expected Free Energy (active inference principle). This is the core decision function — call this to get the next recommended action.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_beliefs",
        "description": "Return current beliefs about hidden states and metadata.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_history",
        "description": "Return the full observation history.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "set_hyperparams",
        "description": "Configure agent hyperparameters.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "learning_rate": {"type": "number", "description": "Belief update rate 0.0-1.0 (default: 0.5)"},
                "temperature": {"type": "number", "description": "Softmax temperature for policy selection (default: 1.0)"},
                "efe_weight": {"type": "number", "description": "Weight on information gain in EFE (default: 0.7)"},
                "prior_weight": {"type": "number", "description": "Weight on outcome preference in EFE (default: 0.3)"},
            },
        },
    },
    {
        "name": "reset",
        "description": "Clear all agent state and start fresh.",
        "inputSchema": {"type": "object", "properties": {}},
    },
]


def call_tool(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    if name == "init_beliefs":
        result = AGENT.init_beliefs(
            state_labels=args["state_labels"],
            action_labels=args["action_labels"],
            outcome_labels=args["outcome_labels"],
            initial_state_belief=args.get("initial_state_belief"),
            outcome_preferences=args.get("outcome_preferences"),
            policies=args.get("policies"),
        )
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "add_outcome":
        result = AGENT.add_outcome(args["outcome"])
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "compute_efe":
        result = AGENT.compute_efe()
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "select_policy":
        result = AGENT.select_policy()
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "get_beliefs":
        result = AGENT.get_beliefs()
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "get_history":
        result = AGENT.get_history()
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "set_hyperparams":
        result = AGENT.set_hyperparams(
            learning_rate=args.get("learning_rate"),
            temperature=args.get("temperature"),
            efe_weight=args.get("efe_weight"),
            prior_weight=args.get("prior_weight"),
        )
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "reset":
        result = AGENT.reset()
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    raise ValueError(f"Unknown tool: {name}")


# ────────────────────────────────────────────────────────────────────────────────
# Server loop
# ────────────────────────────────────────────────────────────────────────────────

def run_server():
    while True:
        msg = _read_message()
        if msg is None:
            break
        method = msg.get("method")
        msg_id = msg.get("id")
        params = msg.get("params", {})

        if method == "initialize":
            _send_message({
                "jsonrpc": "2.0", "id": msg_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "active-inference-agent", "version": "1.0.0"},
                },
            })
        elif method == "notifications/initialized":
            pass
        elif method == "tools/list":
            _send_message({"jsonrpc": "2.0", "id": msg_id, "result": {"tools": TOOLS}})
        elif method == "tools/call":
            try:
                result = call_tool(params["name"], params.get("arguments", {}))
                _send_message({"jsonrpc": "2.0", "id": msg_id, "result": result})
            except Exception as e:
                _send_message({
                    "jsonrpc": "2.0", "id": msg_id,
                    "error": {"code": -32602, "message": str(e)},
                })
        elif method == "ping":
            _send_message({"jsonrpc": "2.0", "id": msg_id, "result": {}})


if __name__ == "__main__":
    run_server()
