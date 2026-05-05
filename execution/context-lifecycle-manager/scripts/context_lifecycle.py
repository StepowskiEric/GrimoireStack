#!/usr/bin/env python3
"""context-lifecycle-manager companion script — combine 3 context skills into one lifecycle."""

import argparse
import json
import math
import os
import re
import sys
from datetime import datetime, timezone


CONTEXT_STATE = "context_state.jsonl"


def _load_state(path: str) -> list[dict]:
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


def _save_state(path: str, msgs: list[dict]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for m in msgs:
            f.write(json.dumps(m, sort_keys=True) + "\n")


def _initial_weight(msg_type: str) -> float:
    return {"user": 1.0, "tool": 0.8, "agent": 0.6, "system": 1.0}.get(msg_type, 0.5)


def _estimate_tokens(text: str) -> int:
    """Rough token estimate: 1 token ≈ 4 chars."""
    return max(1, len(text) // 4)


def cmd_init(args: argparse.Namespace) -> None:
    path = args.output or CONTEXT_STATE
    if os.path.exists(path):
        print(f"  ! {path} already exists.")
        sys.exit(1)
    _save_state(path, [])
    print(f"  ✓ Created context state: {path}")


def cmd_add(args: argparse.Namespace) -> None:
    """Phase 1: Register new message."""
    path = args.output or CONTEXT_STATE
    msgs = _load_state(path)

    content = args.content
    if not content and args.file:
        if not os.path.exists(args.file):
            print(f"  ! File not found: {args.file}")
            sys.exit(1)
        with open(args.file, encoding="utf-8") as f:
            content = f.read()

    msg = {
        "msg_id": args.msg_id,
        "content": content[:200],  # preview only
        "born_turn": args.turn,
        "weight": _initial_weight(args.type),
        "tokens": _estimate_tokens(content),
        "type": args.type,
        "last_referenced": args.turn,
        "compressed": False,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    msgs.append(msg)
    _save_state(path, msgs)

    total_tokens = sum(m.get("tokens", 0) for m in msgs)
    print(f"  ✓ Added {args.msg_id} (type={args.type}, ~{msg['tokens']} tokens)")
    print(f"    Total context: ~{total_tokens} tokens")

    # Budget warning (Phase 1)
    budget = args.budget or 100000
    if total_tokens > budget * 0.8:
        print(f"  ⚠ WARNING: Context at {total_tokens/budget*100:.1f}% of budget ({budget})")


def cmd_update(args: argparse.Namespace) -> None:
    """Phase 2: Apply decay + update references."""
    path = args.output or CONTEXT_STATE
    msgs = _load_state(path)
    current_turn = args.turn
    decay_rate = args.decay_rate or 0.9
    referenced_ids = set(args.referenced or [])

    updated = 0
    for m in msgs:
        mid = m.get("msg_id", "")
        if mid in referenced_ids:
            # Reset weight to initial
            m["weight"] = _initial_weight(m.get("type", "agent"))
            m["last_referenced"] = current_turn
            updated += 1
        else:
            # Apply decay
            m["weight"] = round(m.get("weight", 0.5) * decay_rate, 4)

    _save_state(path, msgs)
    print(f"  ✓ Updated {len(msgs)} messages ({updated} referenced, {len(msgs)-updated} decayed)")


def cmd_prune(args: argparse.Namespace) -> None:
    """Phase 2: Prune low-weight messages."""
    path = args.output or CONTEXT_STATE
    msgs = _load_state(path)
    budget = args.budget or 100000

    # Sort by weight (ascending — prune lowest first)
    msgs.sort(key=lambda m: m.get("weight", 0))

    kept = []
    pruned = []
    current_tokens = 0

    for m in msgs:
        weight = m.get("weight", 0)
        protected = m.get("type") == "user"  # Never prune user messages
        est_tokens = m.get("tokens", 200)

        if (current_tokens + est_tokens > budget) and (not protected) and (weight < 0.5):
            pruned.append(m)
        else:
            kept.append(m)
            current_tokens += est_tokens

    # Save pruned log
    if pruned:
        pruned_log = args.pruned_log or "pruned_log.jsonl"
        with open(pruned_log, "a", encoding="utf-8") as f:
            for m in pruned:
                f.write(json.dumps(m, sort_keys=True) + "\n")

    _save_state(path, kept)
    print(f"  ✓ Pruned {len(pruned)} messages (kept {len(kept)}, ~{current_tokens} tokens)")
    if pruned:
        print(f"    Pruned IDs: {[m.get('msg_id') for m in pruned[:5]]}")


def cmd_optimize(args: argparse.Namespace) -> None:
    """Phase 3: Compress + prioritize remaining messages."""
    path = args.output or CONTEXT_STATE
    msgs = _load_state(path)

    compressed_count = 0
    for m in msgs:
        weight = m.get("weight", 1.0)
        # Compress messages with weight < 0.8 (but not user messages)
        if weight < 0.8 and m.get("type") != "user" and not m.get("compressed"):
            # Simple compression: keep first 100 chars + last 100 chars
            content = m.get("content", "")
            if len(content) > 200:
                m["content"] = content[:100] + " ... [compressed] ... " + content[-100:]
                m["compressed"] = True
                m["tokens"] = _estimate_tokens(m["content"])
                compressed_count += 1

    # Sort by weight * token relevance (prioritize high-weight, low-token)
    msgs.sort(key=lambda m: m.get("weight", 0) * (1.0 / max(m.get("tokens", 1), 1)), reverse=True)

    _save_state(path, msgs)
    total_tokens = sum(m.get("tokens", 0) for m in msgs)
    print(f"  ✓ Optimized: compressed {compressed_count} messages, ~{total_tokens} tokens remaining")
    print(f"    Messages sorted by (weight / tokens) priority")


def cmd_report(args: argparse.Namespace) -> None:
    """Phase 4: Health check + lifecycle statistics."""
    path = args.output or CONTEXT_STATE
    msgs = _load_state(path)

    if not msgs:
        print("  No context state stored.")
        return

    total_tokens = sum(m.get("tokens", 0) for m in msgs)
    weights = [m.get("weight", 0) for m in msgs]
    compressed = sum(1 for m in msgs if m.get("compressed"))

    buckets = {"high (0.8-1.0)": 0, "med (0.5-0.8)": 0, "low (<0.5)": 0}
    for w in weights:
        if w >= 0.8:
            buckets["high (0.8-1.0)"] += 1
        elif w >= 0.5:
            buckets["med (0.5-0.8)"] += 1
        else:
            buckets["low (<0.5)"] += 1

    print(f"  Context Lifecycle Report ({len(msgs)} messages)")
    print(f"  {'─' * 40}")
    print(f"  Total tokens:      ~{total_tokens}")
    print(f"  Compressed:        {compressed}")
    print(f"  Weight distribution:")
    for bucket, count in buckets.items():
        print(f"    {bucket}: {count}")

    # Estimate savings from pruning + compression
    pruned_log = args.pruned_log or "pruned_log.jsonl"
    if os.path.exists(pruned_log):
        pruned_msgs = _load_state(pruned_log)
        pruned_tokens = sum(m.get("tokens", 0) for m in pruned_msgs)
        print(f"  Tokens saved by pruning: ~{pruned_tokens}")


def cmd_simulate(args: argparse.Namespace) -> None:
    """Simulate context lifecycle over N turns."""
    decay = args.decay_rate or 0.9
    turns = args.turns or 30
    budget = args.budget or 100000

    # Sample messages
    msgs = [
        {"msg_id": "m1", "type": "user", "weight": 1.0, "tokens": 200, "last_referenced": 0},
        {"msg_id": "m2", "type": "agent", "weight": 0.6, "tokens": 300, "last_referenced": 0},
        {"msg_id": "m3", "type": "tool", "weight": 0.8, "tokens": 150, "last_referenced": 0},
    ]

    print(f"  Context Lifecycle Simulation ({turns} turns, decay={decay}, budget={budget})")
    print(f"  {'─' * 60}")
    print(f"  Turn | " + " | ".join(m["msg_id"] for m in msgs) + " | Total Tokens")
    print(f"  INIT | " + " | ".join(f"{m['weight']:.2f}" for m in msgs) + f" | {sum(m['tokens'] for m in msgs)}")

    for turn in range(1, turns + 1):
        for m in msgs:
            # Every 5th turn, reference m1
            if turn % 5 == 0 and m["msg_id"] == "m1":
                m["weight"] = _initial_weight(m["type"])
                m["last_referenced"] = turn
            else:
                m["weight"] = round(m.get("weight", 0.5) * decay, 4)

        total = sum(m["tokens"] for m in msgs)
        if turn <= 10 or turn == turns:
            print(f"  T{turn:02d}  | " + " | ".join(f"{m['weight']:.3f}" for m in msgs) + f" | {total}")

    low_count = sum(1 for m in msgs if m["weight"] < 0.5)
    print(f"\n  After {turns} turns: {low_count} messages below 0.5 (eligible for pruning)")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Context Lifecycle Manager — insane hybrid of 3 context skills."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # init
    p_init = sub.add_parser("init", help="Create context_state.jsonl")
    p_init.add_argument("--output", default=CONTEXT_STATE)

    # add
    p_add = sub.add_parser("add", help="Add new message (Phase 1)")
    p_add.add_argument("msg_id")
    p_add.add_argument("type", choices=["user", "agent", "tool", "system"])
    p_add.add_argument("content", nargs="?", default="")
    p_add.add_argument("--file", default="", help="Read content from file")
    p_add.add_argument("--turn", type=int, required=True)
    p_add.add_argument("--budget", type=int, default=100000)
    p_add.add_argument("--output", default=CONTEXT_STATE)

    # update
    p_update = sub.add_parser("update", help="Apply decay (Phase 2)")
    p_update.add_argument("--output", default=CONTEXT_STATE)
    p_update.add_argument("--turn", type=int, required=True)
    p_update.add_argument("--decay-rate", type=float, default=0.9)
    p_update.add_argument("--referenced", nargs="*", default=[], help="msg_ids referenced this turn")

    # prune
    p_prune = sub.add_parser("prune", help="Prune low-weight messages (Phase 2)")
    p_prune.add_argument("--output", default=CONTEXT_STATE)
    p_prune.add_argument("--budget", type=int, default=100000)
    p_prune.add_argument("--pruned-log", default="pruned_log.jsonl")

    # optimize
    p_opt = sub.add_parser("optimize", help="Compress + prioritize (Phase 3)")
    p_opt.add_argument("--output", default=CONTEXT_STATE)

    # report
    p_report = sub.add_parser("report", help="Health check + statistics")
    p_report.add_argument("--output", default=CONTEXT_STATE)
    p_report.add_argument("--pruned-log", default="pruned_log.jsonl")

    # simulate
    p_sim = sub.add_parser("simulate", help="Simulate lifecycle over N turns")
    p_sim.add_argument("--turns", type=int, default=30)
    p_sim.add_argument("--decay-rate", type=float, default=0.9)
    p_sim.add_argument("--budget", type=int, default=100000)

    args = parser.parse_args()

    commands = {
        "init": cmd_init,
        "add": cmd_add,
        "update": cmd_update,
        "prune": cmd_prune,
        "optimize": cmd_optimize,
        "report": cmd_report,
        "simulate": cmd_simulate,
    }
    fn = commands.get(args.command)
    if fn:
        fn(args)


if __name__ == "__main__":
    main()
