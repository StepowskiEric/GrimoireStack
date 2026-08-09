# Pre-Flight Record Template

```md
# Pre-Flight Record

## Task as Stated

<exact statement of the task>

---

## Phase 1 — Clarify

### What I Believe I Know

- [confirmed] <fact>
- [assumption] <inferred belief>

### Critical Assumption

Assumption: <highest-priority assumption>

- If wrong, this would: <consequence>
- Question asked: <the clarifying question>
- Answer received: <answer / "ambiguity accepted: <reason>">

---

## Phase 2 — Specify

### Core Intent

<one sentence>

### Invariants (must NOT change)

- <constraint>
- <constraint>

### Scenarios

#### Scenario 1: [name]

Given <preconditions>
When <action>
Then <expected result>

#### Scenario 2: [edge case]

Given <preconditions>
When <action>
Then <expected result>

#### Scenario 3: [invariant check]

Given <existing behavior context>
When <action that would trigger old behavior>
Then <old behavior still works exactly as before>

### Gate Decision

[ ] All scenarios concrete → proceed to Phase 3
[ ] Ambiguity found → return to user

---

## Phase 3 — Ground

| Assumption | Check            | Result      |
| ---------- | ---------------- | ----------- |
| `<claim>`  | `<command used>` | PASS / FAIL |
| `<claim>`  | `<command used>` | PASS / FAIL |

---

## Gate Decision

[ ] All phases green → EXECUTE
[ ] Blocked: <reason>
```
