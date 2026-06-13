#!/usr/bin/env python3
"""context-rot-pruner companion script — apply exponential decay and prune low-weight messages."""

import argparse
import json
import math
import os
import sys
from datetime import datetime, timezone


WEIGHTS_FILE = "context_weights.jsonl"
PRUNED_FILE = "pruned_log.jsonl"


def _load_weights(path: str) -> list[dict]:
    if not os.path.exists(path):
        return []
    msgs = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    msgs.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return msgs


def _save_weights(path: str, msgs: list[dict]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for m in msgs:
            f.write(json.dumps(m, sort_keys=True) + "\n")


def _initial_weight(msg_type: str) -> float:
    return {"user": 1.0, "tool": 0.8, "agent": 0.6}.get(msg_type, 0.5)


def cmd_init(args: argparse.Namespace) -> None:
    path = args.output or WEIGHTS_FILE
    if os.path.exists(path):
        print(f"  ! {path} already exists.")
        sys.exit(1)
    _save_weights(path, [])
    print(f"  ✓ Created empty context weights: {path}")


def cmd_update(args: argparse.Namespace) -> None:
    """Apply decay and update references for one turn."""
    path = args.output or WEIGHTS_FILE
    msgs = _load_weights(path)
    current_turn = args.turn
    decay_rate = args.decay_rate or 0.9
    referenced_ids = set(args.referenced or [])

    updated = 0
    for m in msgs:
        mid = m.get("msg_id", "")
        if mid in referenced_ids:
            # Reset weight to initial
            m["weight"] = _initial_weight(m.get("type", "agent"))
            m["last_referenced_turn"] = current_turn
            updated += 1
        else:
            # Apply decay
            m["weight"] = round(m.get("weight", 0.5) * decay_rate, 4)
        m["timestamp"] = datetime.now(timezone.utc).isoformat()

    _save_weights(path, msgs)
    print(f"  ✓ Updated {len(msgs)} messages ({updated} referenced, {len(msgs)-updated} decayed)")


def cmd_add(args: argparse.Namespace) -> None:
    """Add a new message from current turn."""
    path = args.output or WEIGHTS_FILE
    msgs = _load_weights(path)

    msg = {
        "msg_id": args.msg_id,
        "content_preview": args.preview[:100],
        "weight": _initial_weight(args.type),
        "last_referenced_turn": args.turn,
        "type": args.type,
        "protected": args.protected,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    msgs.append(msg)
    _save_weights(path, msgs)
    print(f"  ✓ Added {args.msg_id} (weight={msg['weight']}, type={args.type})")


def cmd_prune(args: argparse.Namespace) -> None:
    """Prune messages below budget, never drop protected or high-weight."""
    path = args.output or WEIGHTS_FILE
    msgs = _load_weights(path)
    budget = args.budget or 50000  # tokens
    token_per_msg = args.token_per_msg or 200  # rough average

    # Sort by weight (ascending — prune lowest first)
    msgs.sort(key=lambda m: m.get("weight", 0))

    kept = []
    pruned = []
    current_tokens = 0

    for m in msgs:
        weight = m.get("weight", 0)
        protected = m.get("protected", False)
        est_tokens = token_per_msg

        if (current_tokens + est_tokens > budget) and (not protected) and (weight < 0.5):
            pruned.append(m)
        else:
            kept.append(m)
            current_tokens += est_tokens

    # Save pruned log
    if pruned:
        with open(args.pruned_log or PRUNED_FILE, "a", encoding="utf-8") as f:
            for m in pruned:
                f.write(json.dumps(m, sort_keys=True) + "\n")

    _save_weights(path, kept)
    print(f"  ✓ Pruned {len(pruned)} messages (kept {len(kept)}, ~{current_tokens} tokens)")
    if pruned:
        print(f"    Pruned IDs: {[m.get('msg_id') for m in pruned[:5]]}")


def cmd_simulate(args: argparse.Namespace) -> None:
    """Simulate context degradation over N turns."""
    decay = args.decay_rate or 0.9
    turns = args.turns or 20
    types = ["user", "agent", "tool", "agent", "tool"]  # sample mix

    msgs = []
    for i, t in enumerate(types):
        msgs.append({
            "msg_id": f"m{i+1}",
            "weight": _initial_weight(t),
            "type": t,
            "last_referenced_turn": 0,
        })

    print(f"  Context Rot Simulation ({turns} turns, decay={decay})")
    print(f"  ──────────────────────────────────────────────")
    print(f"  Turn | " + " | ".join(m["msg_id"] for m in msgs))
    print(f"  INIT | " + " | ".join(f"{m['weight']:.2f}" for m in msgs))

    for turn in range(1, turns + 1):
        for m in msgs:
            # Simulate: every 5th turn, first message is referenced
            if turn % 5 == 0 and m["msg_id"] == "m1":
                m["weight"] = _initial_weight(m["type"])
                m["last_referenced_turn"] = turn
            else:
                m["weight"] = round(m.get("weight", 0.5) * decay, 4)
        if turn <= 10 or turn == turns:
            print(f"  T{turn:02d}  | " + " | ".join(f"{m['weight']:.3f}" for m in msgs))

    print(f"\n  After {turns} turns: {sum(1 for m in msgs if m['weight'] < 0.5)} messages below 0.5")


def cmd_audit(args: argparse.Namespace) -> None:
    path = args.output or WEIGHTS_FILE
    msgs = _load_weights(path)
    if not msgs:
        print("  No context weights stored.")
        return

    buckets = {"high (0.8-1.0)": 0, "med (0.5-0.8)": 0, "low (<0.5)": 0}
    zombies = []
    protected = 0

    for m in msgs:
        w = m.get("weight", 0)
        if w >= 0.8:
            buckets["high (0.8-1.0)"] += 1
        elif w >= 0.5:
            buckets["med (0.5-0.8)"] += 1
        else:
            buckets["low (<0.5)"] += 1
            zombies.append(m.get("msg_id", "?"))
        if m.get("protected"):
            protected += 1

    print(f"  Audit Report ({len(msgs)} messages)")
    print(f"  ────────────────────────────────")
    for bucket, count in buckets.items():
        print(f"  {bucket}: {count}")
    print(f"  Protected: {protected}")
    if zombies:
        print(f"  Zombie messages (low weight): {zombies[:5]}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Context Rot Pruner — exponential decay for context messages."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # init
    p_init = sub.add_parser("init", help="Create empty weights file")
    p_init.add_argument("--output", default=WEIGHTS_FILE)

    # update
    p_update = sub.add_parser("update", help="Apply decay after a turn")
    p_update.add_argument("--output", default=WEIGHTS_FILE)
    p_update.add_argument("--turn", type=int, required=True)
    p_update.add_argument("--decay-rate", type=float, default=0.9)
    p_update.add_argument("--referenced", nargs="*", default=[], help="msg_ids referenced this turn")

    # add
    p_add = sub.add_parser("add", help="Add a new message")
    p_add.add_argument("msg_id")
    p_add.add_argument("type", choices=["user", "agent", "tool"])
    p_add.add_argument("--preview", default="")
    p_add.add_argument("--turn", type=int, required=True)
    p_add.add_argument("--protected", action="store_true")
    p_add.add_argument("--output", default=WEIGHTS_FILE)

    # prune
    p_prune = sub.add_parser("prune", help="Prune low-weight messages")
    p_prune.add_argument("--output", default=WEIGHTS_FILE)
    p_prune.add_argument("--budget", type=int, default=50000, help="Token budget")
    p_prune.add_argument("--token-per-msg", type=int, default=200)
    p_prune.add_argument("--pruned-log", default=PRUNED_FILE)

    # simulate
    p_sim = sub.add_parser("simulate", help="Simulate decay over N turns")
    p_sim.add_argument("--turns", type=int, default=20)
    p_sim.add_argument("--decay-rate", type=float, default=0.9)

    # audit
    p_audit = sub.add_parser("audit", help="Show weight distribution")
    p_audit.add_argument("--output", default=WEIGHTS_FILE)

    args = parser.parse_args()
    commands = {
        "init": cmd_init,
        "update": cmd_update,
        "add": cmd_add,
        "prune": cmd_prune,
        "simulate": cmd_simulate,
        "audit": cmd_audit,
    }
    fn = commands.get(args.command)
    if fn:
        fn(args)


if __name__ == "__main__":
    main()
