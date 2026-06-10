---
name: simulate-instrumentation
description: Auto-insert temporary print/logging statements at key points in the code, run the failing test, and feed the captured runtime state to the LLM. Hybrid LLM + rule-based approach. Based on DebugRepair research (+26.3% when removed in ablation).
category: debugging
priority: high
tags: [debugging, instrumentation, runtime-state, logging, program-repair]
...



---

## Overview

Static analysis (reading code) often fails because the bug involves runtime state that isn't visible in the source. **Simulated instrumentation** temporarily injects print/log statements at strategic points, runs the test, and captures the actual values of variables, function arguments, and return values at runtime.

This gives the LLM ground-truth runtime evidence instead of forcing it to mentally simulate execution.

Research shows removing simulated instrumentation causes a **26.3% drop** in correct fixes. It's one of the highest-impact components of modern APR systems.

## When to use

- Bug involves data transformation or type mismatch
- Static analysis hasn't revealed the root cause
- The failure is a silent logic error (not a crash)
- You need to verify assumptions about what values actually flow through the code

## When NOT to use

- The bug is a clear syntax error or obvious logic flaw
- The code is in a language where runtime instrumentation is hard (compiled C/C++ without debug build)
- Side effects from print statements would alter behavior (timing-sensitive code)

## Core protocol

### Step 1 — Identify instrumentation targets

Ask: "What variables or expressions would prove or disprove my current hypothesis?"

Target categories:
- Function arguments at entry
- Return values at exit
- Loop variables mid-iteration
- Branch conditions (which path was taken)
- Object attributes before/after mutation

### Step 2 — Inject temporary prints

Use a clear prefix so prints are easy to find and remove later.

```python
# Before (buggy)
def charge_customer(customer, amount):
    customer_id = customer["id"]  # KeyError here?
    print(f"DEBUG: customer={customer}, amount={amount}")
    print(f"DEBUG: customer_id={customer_id}")
    return {"status": "success", "amount": amount}
```

### Step 3 — Run the test and capture output

```bash
python -m pytest test_order.py -x -s 2>&1 | grep "^DEBUG:"
```

### Step 4 — Feed runtime state to diagnosis

```markdown
Runtime state captured:
- `charge_customer` called with customer={'tier': 'gold', 'customer_id': 'cust_42'}, amount=112.5
- KeyError raised: 'id'
- Hypothesis confirmed: `customer` dict has key 'customer_id', not 'id'
```

### Step 5 — Remove instrumentation

After fix is applied, strip all `DEBUG:` print statements.

## Hybrid strategy

| Approach | When to use |
|----------|-------------|
| **LLM-based** (agent picks targets) | Flexible, context-aware. Use when the bug domain is novel. |
| **Rule-based** (auto-inject at func entry/exit) | Reliable fallback. Use when LLM picks bad targets or code is complex. |

Combine both: let the LLM pick targets first, but if it misses key variables, fall back to rule-based entry/exit logging.

## Instrumentation rules

1. **Prefix all prints** with `DEBUG:` or `// DEBUG:` for easy grep-and-remove
2. **Print before the suspected failure point** — if the print doesn't run, you know the code path was different
3. **Print the full object**, not just one attribute — the missing/wrong key is often the bug
4. **Don't print large collections** (lists >100 items) — truncate to first/last 5

## Research basis

- **DebugRepair** (arXiv:2604.19305): Simulated instrumentation is one of three core components.
- Ablation: removing it caused **26.3% drop** in correct fixes.
- Average debug output tokens reduced by **18.6%** when combined with test purification.

## Example

**Hypothesis:** `validateOrder` converts `customerId` to string, breaking numeric discount checks.

**Instrumentation:**
```python
def validateOrder(raw):
    print(f"DEBUG: raw.customerId={raw.get('customerId')!r}, type={type(raw.get('customerId'))}")
    customerId = String(raw.customerId)
    print(f"DEBUG: after stringify customerId={customerId!r}, type={type(customerId)}")
    return {...}
```

**Runtime output:**
```
DEBUG: raw.customerId=500, type=<class 'int'>
DEBUG: after stringify customerId='500', type=<class 'str'>
```

**Diagnosis:** Confirmed. `customerId` was int, now str. Downstream `typeof customerId === 'number'` fails.

## Pitfalls

- **Instrumentation changes behavior**: Print statements can alter timing or trigger lazy evaluation. Remove them after debugging.
- **Print fatigue**: Don't instrument every line. Pick 3-5 strategic points maximum.
- **Side effects in property access**: `print(obj.expensive_property)` may trigger unwanted computation. Use `hasattr` checks or `repr` carefully.
