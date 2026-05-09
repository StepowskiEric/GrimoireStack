---
name: bisect-debugging
description: Isolate the exact commit that introduced a bug using binary search through git history. The fastest way to find "what changed" when tests used to pass.
category: debugging
tags: [debugging, git, bisect, regression, testing]
author: empirical-testing
version: 1.0.0
...



---

# Bisect Debugging

## When to Use

- Tests pass on an older commit but fail on HEAD
- A feature worked yesterday but is broken today
- You need to find the **exact change** that caused a regression
- Multiple commits could be the culprit and you want to avoid checking each one

**Don't use when:**
- The bug is in uncommitted local changes (use `git diff` instead)
- The bug is environmental (not code-related)
- You don't have a reproducible test or symptom

___


## Core Method

Binary search through git history to find the first bad commit.

```
Known Good          Unknown              Known Bad
    |------------------|--------------------|
   v0.9.0            ???                  HEAD

Step 1: Test middle commit
Step 2: If bad, search left half. If good, search right half.
Step 3: Repeat until adjacent commits (good, bad) found
```

___


## State Machine

### State 1: Establish Boundaries

**Goal:** Find one commit where the bug exists (bad) and one where it doesn't (good).

**Actions:**
1. Run tests on current HEAD → confirm failure (bad)
2. Check out an older commit you know was working → run tests → confirm pass (good)
3. If uncertain, try: last release tag, last known good CI run, `HEAD~10`

**Boundary Rules:**
- Good and bad must be on the same branch
- Good must be strictly older than bad
- Tests must be deterministic (same result every run)

**Exit Condition:** Have one `good` and one `bad` commit hash.

___


### State 2: Bisect (Manual or Automated)

**Option A: Git Bisect (Automated)**

```bash
# Start bisect session
git bisect start

# Mark current HEAD as bad
git bisect bad

# Mark known good commit
git bisect good <commit-hash>

# Git checks out a middle commit automatically
# Run your test, then tell git:
git bisect good   # if test passes
git bisect bad    # if test fails

# Repeat until git reports:
# "<commit-hash> is the first bad commit"

# Clean up
git bisect reset
```

**Option B: Manual Binary Search**

Use when `git bisect` is unavailable or you need more control:

```bash
# Count commits between good and bad
git log --oneline <good>..<bad> | wc -l

# If 10 commits, check commit at index 5
git log --oneline --reverse <good>..<bad> | sed -n '5p'

# Check out that commit
git checkout <middle-commit-hash>

# Run test, decide good/bad, repeat on appropriate half
```

**Exit Condition:** First bad commit identified.

___


### State 3: Analyze the Culprit Commit

**Goal:** Understand what changed and why it broke things.

**Actions:**
1. Show the commit:
   ```bash
   git show <bad-commit-hash>
   ```

2. Read the commit message → does it claim to fix something related?

3. Look at the diff → what files changed? How many lines?

4. Check if the commit was a merge:
   ```bash
   git log --merges <bad-commit-hash>~1..<bad-commit-hash>
   ```

5. If merge, bisect into the merge:
   ```bash
   git bisect start
   git bisect bad <bad-commit-hash>
   git bisect good <good-commit-hash>
   git bisect run <test-command>
   ```

**Key Questions:**
- Was this commit supposed to touch the failing area?
- Are there related commits just before/after?
- Does reverting just this commit fix the issue?

**Exit Condition:** Understand the root cause of the regression.

___


### State 4: Fix or Escalate

**If the fix is obvious:**
- Apply fix, run tests, verify
- Consider if the original commit's intent is still valid
- Sometimes the fix is in a different place than the bad commit

**If the fix is not obvious:**
- The bad commit may have exposed a latent bug elsewhere
- Look at what assumptions the commit changed
- Check for missing test coverage that would have caught this

**Exit Condition:** Bug is fixed and tests pass.

___


## Speed Tips

| Commits to Search | Manual Steps | Git Bisect Steps |
|-------------------|-------------|------------------|
| 2 | 1 | 1 |
| 10 | 3-4 | 3-4 |
| 100 | 7 | 7 |
| 1000 | 10 | 10 |

**Always prefer `git bisect run` for automation:**
```bash
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
git bisect run npm test
# Fully automated — walks away and comes back to the answer
```

___


## Common Pitfalls

1. **Flaky tests** → Bisect becomes unreliable. Fix test flakiness first.
2. **Non-deterministic bugs** (race conditions, timing) → May need multiple runs per commit.
3. **Multiple independent bugs** → Bisect finds the first one. Fix it, then check if tests still fail.
4. **Build steps required** → Some commits need `npm install` or rebuild between checkouts. Account for this.
5. **Submodules or generated files** → Ensure clean state between checkouts: `git clean -fd` (use with caution).

___


## Definition of Done

- First bad commit identified with `git bisect` or manual binary search
- Commit diff reviewed and understood
- Root cause documented
- Fix applied and verified with tests

___


## Example

```bash
# Tests fail on HEAD
$ npm test
# FAIL (2)

# Start bisect
$ git bisect start
$ git bisect bad

# v1.2.0 was known good
$ git bisect good v1.2.0
Bisecting: 5 revisions left to test after this (roughly 3 steps)
[abc1234] feat: add plugin sync check

# Test this middle commit
$ npm test
# PASS

# This commit is good, search upper half
$ git bisect good
Bisecting: 2 revisions left to test after this (roughly 1 step)
[def5678] fix: restart logic for plugin updates

$ npm test
# FAIL

# This commit is bad, search lower half
$ git bisect bad
def5678 is the first bad commit

# Show what changed
$ git show def5678
# The commit added restart logic but forgot to export checkPluginSync
# on updateCheckInternals for tests to mock
```
