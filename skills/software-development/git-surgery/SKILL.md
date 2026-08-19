---
name: git-surgery
description: "Recover from local git disasters: detached HEAD, botched rebase, accidental commits, merge conflicts."
triggers:
  - git-disaster-recovery
  - detached-head
  - botched-rebase
  - merge-conflict-hell
  - accidental-commit
---

# Git Surgery

Git disasters are state-machines. If you know the current state, the recovery path is deterministic. This skill provides a **diagnostic-first** recovery system.

## The Move

### 1. Diagnose
Run the **Diagnostic Quick-Check** to classify the state:
```bash
git status --short --branch
git log --oneline -5
git reflog --oneline | head -20
```

### 2. Map
Match the `git status` pattern to a protocol in the reference file.

### 3. Dry-Run
Before touching reflog or history, simulate the fix if possible. Use the companion script (`python3 git_surgery.py --dry-run`) or manual checks.

### 4. Recover
Execute the protocol. Use **escape hatches** (like `git branch backup-before-rebase`) at every step.

## Reference
For the 10 detailed recovery protocols (Detached HEAD, Botched Rebase, Force-Push Overwrite, etc.) and the "Dangerous vs Safe Commands" table, see [`references/git-surgery-protocols.md`](references/git-surgery-protocols.md).

## Rules
- **Do** run `git branch backup-$(date +%s)` before any destructive command.
- **Do** use `--force-with-lease` instead of `--force`.
- **Do not** use `git reset --hard` unless you are certain about the consequences.
- **Do not** force-push again to "undo" a force-push — use reflog.
