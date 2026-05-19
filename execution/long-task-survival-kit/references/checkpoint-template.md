---
name: Checkpoint Template
description: Concrete checkpoint template and recovery protocol for resuming work after interruption.
---

# Checkpoint Template

Use this template to capture state at each checkpoint (every 5 tool calls) or when pausing for any reason.

---

## Checkpoint Record

**Timestamp:** [YYYY-MM-DD HH:MM]
**Checkpoint #:** [incrementing number]
**Since Last Checkpoint:** [number of tool calls since last checkpoint]

---

### Task Description

**Original Goal:**
[One-paragraph description of what you're trying to accomplish]

**Current Subtask:**
[What you're working on right now]

---

### Files Changed

| File | Status | Notes |
|------|--------|-------|
| `path/to/file.ext` | Modified / Created / Deleted | Brief description of changes |
| [Add more rows as needed] | | |

**Total changes:** [count] files modified

---

### Tests Status

**Test Command:** [e.g., `pytest tests/`, `npm test`, `cargo test`]

| Suite | Result | Duration | Notes |
|-------|--------|----------|-------|
| Unit tests | ✅ Passing / ❌ Failing / ⏸️ Not run | [time] | [failures or skip reason] |
| Integration tests | ✅ Passing / ❌ Failing / ⏸️ Not run | [time] | |
| Lint / Type check | ✅ Passing / ❌ Failing / ⏸️ Not run | | |

**Known test failures:** [List any pre-existing failures that are not related to current work]

---

### Current Hypothesis

**What I believe is true:**
[State your current working theory about the problem or system]

**Evidence supporting it:**
- [Bullet point evidence from code, logs, tests]
- [More evidence]

**Confidence level:** [High / Medium / Low]

---

### Blockers

**Active blockers:**
- [Blocker 1]: [Description and impact]
- [Blocker 2]: [Description and impact]

**Resolved since last checkpoint:**
- [Blocker that was resolved]: [How it was resolved]

---

### Next Step

**Immediate next action:**
[Specific, concrete next tool call or action]

**Why this step:**
[Brief rationale]

**Expected outcome:**
[What success looks like]

---

## Recovery Protocol

When resuming from this checkpoint, follow this sequence:

### Step 1: Orient (1-2 minutes)

1. Read this checkpoint file from top to bottom.
2. Re-read the original task description to confirm understanding.
3. Check the Files Changed table — review any modified files you haven't seen.

### Step 2: Validate Assumptions

For each item in Current Hypothesis:
- [ ] Verify the evidence still holds (state may have changed)
- [ ] Note any assumptions that were unverified at checkpoint time
- [ ] Update hypothesis if facts have changed

### Step 3: Run Tests

- [ ] Run the test suite to confirm current state
- [ ] If tests fail, determine: pre-existing failure vs. regression from our changes
- [ ] Document any new failures

### Step 4: Resume Work

1. Complete the "Next Step" action listed above.
2. If the next step is no longer relevant, re-evaluate based on current state.
3. Run a new checkpoint after 5 tool calls or if any blocker emerges.

---

## Checkpoint History

| # | Timestamp | Tool Calls Since | Status | Notes |
|---|-----------|-----------------|--------|-------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
