---
name: purify-test-output
description: "Use when failing test output contains >50% framework noise (site-packages, node_modules) that drowns out user code, or when multiple tests fail and you need to isolate the most relevant failure first."
triggers:
  - Failing test produces verbose output with framework/library stack frames that drown out user code
  - Multiple tests fail and need to isolate the most relevant failure first
  - Output contains >50% framework noise (measured by lines containing site-packages or lib/python)
category: debugging
priority: high
tags: [testing, token-efficiency, debugging, test-output]
---

## Overview

Raw test output is noisy. A failing test may produce hundreds of lines of logs, stack traces through framework internals, and irrelevant setup output. The LLM's attention scatters across this noise, missing the actual signal.

**Test Semantic Purification** extracts only the failure-relevant context:
- The assertion that failed
- The stack trace frames in user code (not framework internals)
- The specific exception message
- Relevant variable values at the failure point

Research shows this reduces token count by **18.6%** on average and improves repair correctness.

## When NOT to use

- Test output is already minimal (single assertion failure with no framework frames)
- The failing test body contains setup/configuration that is part of the diagnostic signal
- The bug is in the test itself (you need full test context)
- Output is <20 lines OR contains zero `site-packages`/`lib/python` frames

## Core protocol

### Step 1 — Run the test and capture raw output

```bash
pytest test_foo.py -x --tb=long 2>&1 | tee /tmp/raw_output.txt
```

### Step 2 — Extract the failure signature

Use the companion script if available:

```bash
pytest test_foo.py 2>&1 | python purify_test_output.py
# Or from file: python purify_test_output.py --file /tmp/raw_output.txt
```

The script handles pytest, jest, vitest, and mocha automatically — strips framework frames, preserves user code and assertions, reports token reduction stats.

If the script is not available, apply the Rules table below manually: keep assertion messages, user-code stack frames, exception type/message, variable diffs, and last 3 lines of stderr. Discard everything else.

### Step 3 — Present purified output to LLM

```markdown
Test `test_process_order` failed. Purified output:

```
AssertionError: Expected 85.0 but got 100
  File "orders.py", line 14, in process_order
  File "payments.py", line 7, in charge_customer
KeyError: 'id'
```
```

## Rules for purification

| Keep | Discard |
|------|---------|
| Assertion message | Test setup/teardown logs |
| User-code stack frames | Framework internal frames |
| Exception type and message | Pass/skip summaries for other tests |
| Variable diffs (`expected X, got Y`) | Coverage reports |
| Last 3 lines of stderr | stdout from passing tests |

## Failure Modes

- **Over-purification:** removing the test assertion line — it contains the expected vs actual values
- **Under-purification:** keeping framework frames like `pytest.raises` or `asyncio.run` when the bug is in user code
- **Multi-failure cascades:** if test A fails because test B's setup broke, you may need both failure outputs
