---
source: "jerry-skills"
name: assumption-grounding
description: Prevent hallucinated facts from compounding into costly errors. State every assumption explicitly, verify with the cheapest possible check, and only proceed on confirmation. Based on Chain-of-Verification research.
category: execution
priority: high
tags: [verification, hallucination-prevention, correctness, debugging, agent-safety]
...



---

## Overview

The #1 cause of agent failure is not bad reasoning — it's reasoning atop **hallucinated facts**. An agent assumes a file exists at a certain path, assumes a function has a certain signature, or assumes a dependency is installed. One unchecked assumption cascades into ten wasted turns, broken code, and confused recovery.

**Assumption Grounding** forces a verify-before-act discipline:
1. **State** what you assume before acting on it
2. **Verify** with the cheapest check that could falsify it
3. **Decide** — proceed only if confirmed; reformulate if falsified
4. **Log** the assumption and result for future reference

Research (Chain-of-Verification, Dhuliawala et al. 2023) shows that explicit verification loops reduce factual errors by 28% and prevent error compounding.

## When to use

- Before reading, editing, or creating any file
- Before calling any function, API, or tool whose signature you haven't confirmed in this session
- Before asserting any factual claim about the codebase, environment, or dependencies
- Before proceeding after a context gap (computer restarted, new session, long pause)
- When confidence in a memory is < 90%

## When NOT to use

- The fact was verified in the current turn and nothing has changed
- You're repeating a verbatim operation you just completed successfully
- The check would cost more than the mistake (e.g., verifying a throwaway temp path)
- The user explicitly instructed you to proceed without verification

## Companion script (optional)

A companion Python script automates cheap verification checks. Use it when you want deterministic, reproducible validation without manual tool calls.

```bash
# Verify a batch of assumptions from a file
python scripts/verify_assumptions.py --file assumptions.txt

# Verify inline assumptions
python scripts/verify_assumptions.py <<EOF
file_exists: src/utils.py
function_exists: src/utils.py | calculate_tax
package_installed: pytest
grep_match: src/config.py | DATABASE_URL
EOF
```

The script is optional — the skill works equally well when you apply the verification rules manually.

## Core protocol

### Step 1 — STATE the assumption explicitly

Write it down in a falsifiable form:

```markdown
Assumption: The function `process_order` is defined in `orders.py`.
```

Bad (unfalsifiable): "I think orders.py has the function"
Good (falsifiable): "`process_order` is defined in `orders.py`"

### Step 2 — VERIFY with the cheapest check

| Assumption type | Cheapest verification |
|-----------------|----------------------|
| File exists at path | `ls path` or `test -f path` |
| Function/class exists in file | `grep "def function_name" file` or read first 30 lines |
| Variable/constant exists | `grep "VARIABLE_NAME" file` |
| Package installed | `python -c "import pkg"` or `which binary` |
| API signature | Read the function definition (first 10 lines) |
| Directory structure | `ls -la dir/` |
| Git state | `git status --short` or `git log --oneline -1` |
| Environment variable | `echo $VAR` or `env \| grep VAR` |

### Step 3 — DECIDE based on verification result

**If confirmed:**
```markdown
Verification: PASS. `process_order` found in `orders.py` line 14.
Proceeding with edit.
```

**If falsified:**
```markdown
Verification: FAIL. `orders.py` does not exist.
Reformulating assumption: `process_order` may be in `src/orders.py`.
New verification: `ls src/orders.py` → PASS.
Proceeding.
```

**If ambiguous:**
```markdown
Verification: AMBIGUOUS. Multiple files match `*orders*.py`.
Escalating to user: Which file contains `process_order`?
```

### Step 4 — LOG the assumption

Maintain a running list in your reasoning:
```markdown
Assumptions verified this session:
- [PASS] `orders.py` exists at repo root
- [PASS] `process_order` defined in `orders.py`
- [FAIL] `charge_customer` in `payments.py` → actually in `billing.py`
- [PASS] `pytest` installed (version 8.3)
```

## Rules for verification

| Do | Don't |
|----|-------|
| Use the cheapest check that falsifies the assumption | Run the full operation as "verification" |
| Verify one assumption at a time | Bundle multiple assumptions into one vague check |
| State the assumption before verifying | Verify first, then rationalize the assumption |
| Reformulate and re-verify on failure | Guess the correction without checking |
| Log both passes and failures | Only log failures |
| Escalate when ambiguous | Pick arbitrarily and hope |

## Research basis

- **Chain-of-Verification** (Dhuliawala et al., 2023): Explicit verification loops reduce hallucination in long-form generation by 28%.
- **Self-Reflection in LLM Agents** (Renze & Guven, 2024): Self-critique without grounding in observable checks produces minimal improvement.
- **ErrorProbe** (ACL 2026 Findings): Verified memory of error patterns (confirmed via executable evidence) is the strongest predictor of recovery success.

## Example

**Scenario:** Agent needs to fix a bug in order processing.

**Without grounding (typical failure):**
```
I'll edit `orders.py` to fix the tax calculation.
[reads wrong file or file doesn't exist]
3 turns of confused recovery...
```

**With grounding:**
```
Assumption: Order processing logic is in `orders.py`.
Verification: `ls orders.py` → FAIL (no such file).
Reformulation: Maybe `src/orders.py`?
Verification: `ls src/orders.py` → PASS.
Assumption: `calculate_tax` function exists in `src/orders.py`.
Verification: `grep "def calculate_tax" src/orders.py` → PASS (line 23).
Proceeding with edit.
```

## Pitfalls

- **Verification theater**: Running `cat huge_file.py` and claiming you verified the assumption. Use targeted `grep` or read specific offsets.
- **Assumption bundling**: "The function exists and takes 3 arguments and returns a dict" → verify each claim separately.
- **Stale verification**: Assuming a file checked 20 turns ago is unchanged. Re-verify if the file was edited since last check.
- **Over-verification**: Checking if `/tmp` exists before creating a temp file. Not every assumption needs verification — only those that, if wrong, would derail the task.
- **Escalation avoidance**: When verification is ambiguous (multiple matches, unclear structure), ask the user rather than guessing.
