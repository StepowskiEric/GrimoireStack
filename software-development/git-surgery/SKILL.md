---
name: git-surgery
category: software-development
description: Recover from common local git disasters fast. Diagnose repo state, apply the correct recovery protocol, and avoid making things worse.
version: 1.0.0
priority: high
tags: [git, recovery, disaster-recovery, version-control, cli]
---

## Overview

Git disasters are not intellectual problems — they are state-machines. If you know the current state, the recovery path is deterministic. The skill in git is recognizing which state you're in.

This skill provides a diagnostic-first recovery system:
1. **Diagnose** — use the companion script or manual checks to classify the disaster
2. **Map to protocol** — match the diagnosed state to the correct recovery path
3. **Execute dry-run first** — simulate the fix before touching reflog
4. **Recover** — run the protocol with escape hatches at every step

When to use: any time the repo is in a state you don't fully understand, or when `git status` output scares you.

When NOT to use: remote team coordination issues (use `github-operations`), or when you need to learn git concepts (read a book instead).

---

## Installation Notes

**This skill requires a companion Python script.**

When installing with `--with-scripts`, the script is copied alongside `SKILL.md` automatically.

```bash
npx jerry-skills install --agent pi --skill git-surgery --with-scripts
```

If installing manually, copy `git_surgery.py` to the same directory as `SKILL.md`.

---

## Companion Script

The script requires only Python 3 (stdlib only):

```bash
python3 git_surgery.py diagnose    # shows repo state + suggested protocol
python3 git_surgery.py reflog      # shows recent HEAD history with tips
python3 git_surgery.py --dry-run   # simulate but don't execute recovery
```

---

## Diagnostic Quick-Check

Run these THREE commands in order. Do not skip. The output decides everything.

```bash
git status --short --branch
git log --oneline -5
git reflog --oneline | head -20
```

Match the `git status` pattern to a protocol below.

---

## Protocol 1: Detached HEAD

**Symptoms:** `git status` says `HEAD detached at <hash>`.

```
git status --short --branch
  ## HEAD (no branch)
```

**Recovery path (choose one):**

A. You want to go back to where you were before detaching:
```bash
git checkout -
```

B. You made commits while detached and want to save them:
```bash
git checkout -b recovery-branch
git log --oneline -3  # confirm commits are there
```

C. You made commits while detached and want to reattach them to an existing branch (e.g. main):
```bash
# Identify the detached commits
git log --oneline  # note the hash range

# Option C1: cherry-pick them onto main
git checkout main
git cherry-pick <oldest-detached-hash>^..HEAD

# Option C2: merge the detached branch into main
git branch temp-recovery HEAD
git checkout main
git merge temp-recovery
git branch -d temp-recovery
```

**NEVER do:** `git checkout main` while detached with uncommitted changes. That discards changes unless you have an upstream tracking setup.

**NEVER do:** `git reset --hard` while detached. You will lose commits.

---

## Protocol 2: Botched Rebase (Abort)

**Symptoms:** `git status` shows `rebase in progress` or dozens of conflict markers.

```
git status
  interactive rebase in progress; onto abc1234
  You are currently rebasing branch 'feature' on 'abc1234'.
```

**Recovery path — abort safely:**

```bash
# Step 1: check for uncommitted changes that are NOT conflict markers
git status --short

# Step 2: if you want to abort completely (loses rebase progress, not original commits):
git rebase --abort

# Step 3: verify clean state
git status
```

**Abort loses nothing from pre-rebase history.** `git rebase --abort` rewinds to the state before `git rebase` was run. Original commits on both branches are intact.

**If you already resolved some conflicts and want to keep that work:**
```bash
git add -A
git rebase --continue
```

**NEVER do:** `git reset --hard` during a rebase. You will lose the commits being rebased.

---

## Protocol 3: Botched Rebase (Continue Despite Conflicts)

**Symptoms:** Rebase paused on a commit with conflicts. You want to finish it.

```bash
# Step 1: see which files are unmerged
git status --short

# Step 2: resolve conflicts in each file, then stage
git add <resolved-file>

# Step 3: if a commit is empty (all changes were duplicates/conflicts already applied)
git rebase --continue
# If git says "No changes", that commit is already applied elsewhere:
git rebase --skip

# Step 4: if you want to edit the commit message
git commit --amend
```

**When to skip vs continue:**
- Skip = the commit's changes are already present in the target branch (common when cherry-picking or rebasing across branches that partially overlap).
- Continue = conflicts were resolved and the commit still has meaningful changes.

---

## Protocol 4: Accidental Commit to Main (Wrong Branch)

**Symptoms:** You committed to `main` but intended a feature branch.

```
git status
  On branch main
  Your branch is ahead of 'origin/main' by 1 commit.
```

**Recovery path — move commit to new branch without losing it:**

```bash
# Step 1: create and check out the feature branch (main stays where it is)
git checkout -b feature-branch

# Step 2: reset main back to origin (DANGER: only if you have NOT pushed)
git checkout main
git reset --hard origin/main

# Step 3: verify
git log --oneline --graph --all --decorate | head -10
```

**If you ALREADY PUSHED the bad commit to main:**
- Do NOT reset --hard and force-push on a shared branch.
- Instead: revert the commit on main, then continue on the feature branch.

```bash
# On main
git revert <bad-commit-hash>
git push origin main

# Now the feature branch still has the commit
git checkout feature-branch
git rebase main  # or just keep it as-is and PR normally
```

---

## Protocol 5: Force-Push Overwrite (Lost Remote Commits)

**Symptoms:** You force-pushed and someone else's (or your own) commits disappeared from the remote.

**First:** Do not panic-push again. Every push makes recovery harder.

**Recovery path:**

```bash
# Step 1: check reflog for the overwritten commits
git reflog --all | grep <branch-name>

# Step 2: find the hash before the force-push
git log --oneline --all --graph | head -20

# Step 3: create a recovery branch at the lost commit
git checkout -b recovery-lost <lost-commit-hash>

# Step 4: merge the recovery branch back into the target branch
git checkout main
git merge recovery-lost

# Step 5: push normally (no force needed)
git push origin main

# Step 6: clean up
git branch -d recovery-lost
```

**If the lost commits are NOT in your reflog** (e.g. you cloned fresh), check if another teammate has them:
```bash
git fetch --all
git branch -r --contains <lost-hash>
```

**NEVER do:** Force-push again hoping to "undo" the first force-push. That just overwrites more history.

---

## Protocol 6: Hard Reset Gone Wrong (Lost Local Commits)

**Symptoms:** You ran `git reset --hard <hash>` and realized you needed the commits you just discarded.

**Recovery path — reflog rescue:**

```bash
# Step 1: find the commit before the reset
git reflog

# Example reflog output:
# abc1234 HEAD@{0}: reset: moving to HEAD~2
# def5678 HEAD@{1}: commit: the commit you lost
# ghi9012 HEAD@{2}: commit: another commit you lost

# Step 2: checkout the lost commit
git checkout def5678

# Step 3: create a branch to preserve it
git checkout -b recovered-work

# Step 4: merge back to your working branch if desired
git checkout main
git merge recovered-work
```

**If you ALSO lost uncommitted working tree changes:**
Git cannot recover uncommitted changes after `reset --hard`. If you ran `git stash` earlier, use `git stash list` / `git stash pop`.

**NEVER do:** `git reset --hard` is permanent for uncommitted changes. There is no undo.

---

## Protocol 7: Merge Conflict Hell

**Symptoms:** `git merge` or `git pull` produced conflicts in many files. You're overwhelmed.

**Recovery path — strategic retreat and re-approach:**

```bash
# Step 1: if you haven't started resolving, abort and plan
git merge --abort  # or git rebase --abort

# Step 2: reduce blast radius — merge in smaller chunks
git checkout <your-branch>

# Option A: merge one file at a time using checkout --ours/--theirs
git checkout --ours   <file>   # keep your version
git checkout --theirs <file>   # keep their version
git add <file>

# Option B: for bulk acceptance of one side (DANGEROUS — review first)
git diff --name-only --diff-filter=U  # list unmerged files

# Then for files you know should all be "ours":
git diff --name-only --diff-filter=U | xargs git checkout --ours --
git add -A

# Step 3: for the remaining files, use a merge tool
git mergetool
# or vscode: code --wait --merge <file>

# Step 4: finish merge
git commit  # git pre-fills the merge commit message
```

**Our vs Theirs depends on perspective:**
- During `git merge`: `ours` = the branch you were on when you ran `git merge`; `theirs` = the branch you're merging in.
- During `git rebase`: `ours` = the target branch; `theirs` = your original branch (yes, it's swapped).

**Double-check with:**
```bash
git checkout --conflict=diff3 <file>  # shows base/ours/theirs markers with base context
```

---

## Protocol 8: Cherry-Pick Gone Wrong

**Symptoms:** `git cherry-pick` stopped with conflicts or applied wrong.

**Recovery path:**

```bash
# Step 1: abort the cherry-pick (rewinds to pre-cherry-pick state)
git cherry-pick --abort

# Step 2: if you need the commit but with conflicts resolved manually:
git cherry-pick <hash>
# resolve files...
git add <file>
git cherry-pick --continue

# Step 3: if cherry-pick applied empty (no changes), skip it
git cherry-pick --skip
```

**If cherry-pick says the commit is already present:**
```bash
git cherry-pick <hash> --no-commit  # apply changes to working tree without committing
git status  # review changes manually
git commit -m "cherry-picked <hash> with manual resolution"
```

---

## Protocol 9: Dirty Working Tree, Need to Switch Branches

**Symptoms:** You're on branch A with uncommitted changes, need to switch to branch B.

**Recovery path — don't stash everything blindly:**

```bash
# Option A: stash only the changes you don't need right now
git stash push -m "WIP before switching" -- <paths-to-stash>

# Option B: stash everything
git stash push -m "WIP: <describe what you were doing>"

# Switch branch
git checkout other-branch

# Later, return and restore
git checkout original-branch
git stash pop  # applies and removes from stash list
# OR
git stash apply stash@{0}  # applies but keeps in stash list
```

**If stash pop has conflicts:**
```bash
git stash show -p stash@{0}  # preview the stash
git reset --hard  # discard working tree if it's a mess
git stash pop  # try again on clean tree
```

---

## Protocol 10: Reverting a Public Commit (Shared Branch)

**Symptoms:** A bad commit is already on origin/main. You can't reset because others pulled it.

**Recovery path:**

```bash
# Revert creates a NEW commit that undoes the bad commit's changes
git revert <bad-commit-hash>

# If the revert has conflicts, resolve and commit
git add <resolved>
git revert --continue

# Push the revert commit normally
git push origin main
```

**If the bad commit was a merge commit:**
```bash
git revert -m 1 <merge-commit-hash>  # -m 1 = keep the mainline parent
```

---

## Quick Reference: Dangerous vs Safe Commands

| Dangerous (destructive, hard to undo) | Safe (recoverable via reflog) |
|---|---|
| `git reset --hard` | `git reset --soft`, `git reset --mixed` |
| `git clean -fd` | `git clean -fdn` (dry run first!) |
| `git push --force` on shared branch | `git push --force-with-lease` |
| `git rebase -i` without backup | `git branch backup-before-rebase` first |
| `git checkout <file>` (discards changes) | `git checkout --patch <file>` (interactive) |
| `git stash drop` | `git stash list` before dropping |

**Golden rule:** If a command discards or rewrites history, run `git branch backup-$(date +%s)` first. Branches are cheap. Lost commits are expensive.

---

## Related Skills

- `github-operations` — for remote PR workflows, code review, and team coordination.
- `bisect-debugging` — for finding which commit introduced a bug.
- `refactor-safely` — for large changes that need branch isolation.
- `lint-battalion` — for cleaning up mass linter errors before committing.
