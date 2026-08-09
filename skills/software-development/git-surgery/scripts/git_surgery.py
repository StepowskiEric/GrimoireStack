#!/usr/bin/env python3
"""git-surgery companion script — diagnose repo state and suggest recovery protocols."""

import argparse
import re
import subprocess
import sys
from datetime import datetime, timezone


def run(cmd: list[str], check: bool = True) -> str:
    """Run a git command and return stdout."""
    result = subprocess.run(
        cmd, capture_output=True, text=True, check=False,
    )
    if result.returncode != 0 and check:
        if "not a git repository" in result.stderr.lower():
            print("fatal: not a git repository (or any of the parent directories)")
            sys.exit(128)
        raise subprocess.CalledProcessError(
            result.returncode, cmd, output=result.stdout, stderr=result.stderr,
        )
    return result.stdout.strip()


def is_clean(status_lines: list[str]) -> bool:
    return not any(line for line in status_lines if line.strip())


def branch_name_from_status(branch_line: str) -> str | None:
    """Parse branch from '## branch...upstream' or '## HEAD (no branch)'."""
    match = re.match(r"## (.+?)(?:\.\.\.|$)", branch_line)
    if not match:
        return None
    raw = match.group(1).strip()
    if raw.startswith("HEAD"):
        return "HEAD (no branch)"
    return raw


def diagnose() -> dict:
    """Collect git state into a structured dict."""
    raw_status = run(["git", "status", "--short", "--branch", "--untracked-files=all"], check=False)
    status_lines = raw_status.splitlines()
    branch_line = status_lines[0] if status_lines else ""
    branch = branch_name_from_status(branch_line)

    entry_lines = status_lines[1:] if branch_line.startswith("##") else status_lines
    staged = [l for l in entry_lines if l.startswith(("A ", "M ", "D ", "R ", "C "))]
    unstaged = [l for l in entry_lines if l.startswith((" M", " D", " R", " C", "??"))]
    unmerged = [l for l in entry_lines if l.startswith(("UU", "AA", "DD", "AU", "UA", "DU", "UD"))]
    untracked = [l for l in entry_lines if l.startswith("??")]

    # Determine operation in progress
    # Check for rebase/merge/cherry-pick/bisect/am
    operations = []
    rebase_head = run(["git", "rev-parse", "--git-path", "rebase-apply"], check=False)
    rebase_merge = run(["git", "rev-parse", "--git-path", "rebase-merge"], check=False)
    merge_head = run(["git", "rev-parse", "--git-path", "MERGE_HEAD"], check=False)
    cherry_head = run(["git", "rev-parse", "--git-path", "CHERRY_PICK_HEAD"], check=False)
    bisect_log = run(["git", "rev-parse", "--git-path", "BISECT_LOG"], check=False)
    am_path = run(["git", "rev-parse", "--git-path", "rebase-apply/applying"], check=False)

    import os
    if os.path.isdir(rebase_head) or os.path.isdir(rebase_merge):
        operations.append("rebase")
    if os.path.isfile(merge_head):
        operations.append("merge")
    if os.path.isfile(cherry_head):
        operations.append("cherry-pick")
    if os.path.isfile(bisect_log):
        operations.append("bisect")
    if os.path.isfile(am_path):
        operations.append("am")

    # Relative commit count
    ahead_behind = None
    if branch and "..." in branch_line:
        m = re.search(r"\[(ahead (\d+))?(, )?(behind (\d+))?\]", branch_line)
        if m:
            ahead = int(m.group(2)) if m.group(2) else 0
            behind = int(m.group(5)) if m.group(5) else 0
            ahead_behind = {"ahead": ahead, "behind": behind}

    # Detached head
    detached = branch == "HEAD (no branch)"

    # Recent reflog
    try:
        reflog_raw = run(["git", "reflog", "--oneline"], check=False)
        reflog = reflog_raw.splitlines()[:20]
    except subprocess.CalledProcessError:
        reflog = []

    # Recent log
    try:
        log_raw = run(["git", "log", "--oneline", "-5"], check=False)
        recent_log = log_raw.splitlines()
    except subprocess.CalledProcessError:
        recent_log = []

    return {
        "branch": branch,
        "detached": detached,
        "operations": operations,
        "staged": len(staged),
        "unstaged": len(unstaged),
        "unmerged": len(unmerged),
        "untracked": len(untracked),
        "ahead_behind": ahead_behind,
        "status_lines": entry_lines,
        "reflog": reflog,
        "recent_log": recent_log,
    }


def suggest_protocols(state: dict) -> list[str]:
    """Map diagnosed state to protocol names."""
    protocols = []

    if state["operations"]:
        if "rebase" in state["operations"]:
            if state["unmerged"]:
                protocols.append("Protocol 3: Botched Rebase (Continue)")
            else:
                protocols.append("Protocol 2: Botched Rebase (Abort)")
        if "merge" in state["operations"]:
            protocols.append("Protocol 7: Merge Conflict Hell")
        if "cherry-pick" in state["operations"]:
            protocols.append("Protocol 8: Cherry-Pick Gone Wrong")
        return protocols

    if state["detached"]:
        protocols.append("Protocol 1: Detached HEAD")

    if state["unmerged"]:
        protocols.append("Protocol 7: Merge Conflict Hell")

    if state["staged"] and state["branch"] and state["branch"] in ("main", "master"):
        ahead = (state["ahead_behind"] or {}).get("ahead", 0)
        if ahead > 0:
            protocols.append("Protocol 4: Accidental Commit to Main")

    if not protocols and not state["staged"] and not state["unstaged"] and not state["untracked"]:
        protocols.append("Repo is clean. No recovery needed.")

    if not protocols:
        protocols.append("No specific disaster detected. Review 'Golden Rule' section for safe commands.")

    return protocols


def print_diagnosis(state: dict) -> None:
    """Pretty-print diagnosis to terminal."""
    print("=" * 60)
    print("GIT SURGERY DIAGNOSIS")
    print("=" * 60)

    print(f"\nBranch:          {state['branch'] or 'unknown'}")
    print(f"Detached HEAD:   {state['detached']}")
    print(f"Operations:      {', '.join(state['operations']) or 'none'}")
    print(f"Staged files:    {state['staged']}")
    print(f"Unstaged files:  {state['unstaged']}")
    print(f"Unmerged files:  {state['unmerged']}")
    print(f"Untracked files: {state['untracked']}")
    if state["ahead_behind"]:
        print(f"Ahead/Behind:    +{state['ahead_behind']['ahead']} / -{state['ahead_behind']['behind']}")

    print("\n" + "-" * 60)
    print("Status entries:")
    for line in state["status_lines"]:
        print(f"  {line}")

    if state["recent_log"]:
        print("\n" + "-" * 60)
        print("Recent commits:")
        for line in state["recent_log"]:
            print(f"  {line}")

    if state["reflog"]:
        print("\n" + "-" * 60)
        print("Recent reflog:")
        for line in state["reflog"]:
            print(f"  {line}")

    print("\n" + "=" * 60)
    print("SUGGESTED PROTOCOL(S)")
    print("=" * 60)
    for protocol in suggest_protocols(state):
        print(f"  → {protocol}")

    print("\n" + "=" * 60)


def print_reflog() -> None:
    """Print recent reflog with helpful annotations."""
    reflog_raw = run(["git", "reflog", "--format=%h %gd %gs"], check=False)
    lines = reflog_raw.splitlines()
    print("=" * 60)
    print("RECENT REFLOG")
    print("=" * 60)
    print(f"{'Hash':<10} {'Entry':<12} {'Description'}")
    print("-" * 60)
    for line in lines[:30]:
        parts = line.split(" ", 2)
        if len(parts) >= 3:
            print(f"{parts[0]:<10} {parts[1]:<12} {parts[2]}")
        else:
            print(line)
    print("\nTip: HEAD@{n} syntax refers to the nth entry. Use `git checkout HEAD@{2}` to jump back.")
    print("Tip: `git reflog | grep 'commit:'` to find lost commits.")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Diagnose git repo state and suggest recovery protocols.",
    )
    parser.add_argument(
        "command",
        choices=["diagnose", "reflog", "recommend"],
        default="diagnose",
        nargs="?",
        help="Action to perform",
    )
    parser.add_argument("--dry-run", action="store_true", help="No effect for this script; always safe.")
    args = parser.parse_args()

    # Validate we're inside a repo
    try:
        run(["git", "rev-parse", "--is-inside-work-tree"])
    except subprocess.CalledProcessError:
        print("fatal: not a git repository")
        sys.exit(128)

    if args.command in ("diagnose", "recommend"):
        state = diagnose()
        print_diagnosis(state)
    elif args.command == "reflog":
        print_reflog()


if __name__ == "__main__":
    main()
