---
name: halt-signals
description: Catalog of concrete signals indicating reasoning convergence and when NOT to halt. Companion reference for selective-halt-reasoning skill.
source: selective-halt-reasoning skill
---

# Halt Signals Reference

This document catalogs concrete, observable signals that reasoning has converged (and should halt) versus signals that reasoning is still productive (and should continue).

---

## Part 1 — Signals Reasoning Has CONVERGED (Halt)

When you observe these signals, reasoning is likely at a semantic fixing point. Consider halting if halting criteria are met.

### 1. Semantic Stabilization

**Definition:** The core conclusion, action, or answer remains unchanged across consecutive reasoning steps, despite variations in wording or additional justification.

**Concrete indicators:**
- You produce the same file path, line number, or root cause in 3+ consecutive iterations
- The recommended action is identical, only the explanation differs
- You find yourself saying "as mentioned before" or "to reiterate"
- New steps add no new entities, file references, or code locations

**Example:**
```
Iteration N:   "The bug is in user_service.py line 42."
Iteration N+1: "The issue is located at user_service.py:42."
Iteration N+2: "user_service.py, line 42 is the root cause."
→ Semantic stabilization: same location, different words. Halt candidate.
```

---

### 2. Confidence Plateauing

**Definition:** Your stated or implicit confidence level stops increasing despite additional reasoning steps. Confidence has hit a ceiling.

**Concrete indicators:**
- You say "I'm confident" or "I'm certain" in consecutive steps with no new evidence
- Confidence score (if tracked numerically) stays flat or changes by < 0.05 across iterations
- You stop using hedging language ("likely", "probably", "might") without new evidence justifying the shift
- The certainty feels "earned" but no new facts were introduced

**Example:**
```
Iteration N:   "I'm 85% confident the fix is X. We should verify with a test."
Iteration N+1: "I'm 85% confident the fix is X. Let's run the test suite."
Iteration N+2: "I'm 85% confident the fix is X. Running tests now."
→ Confidence plateau: stuck at 85%, no new evidence added. Halt candidate.
```

---

### 3. Diminishing Marginal Insight

**Definition:** Each additional reasoning step yields progressively smaller or less valuable contributions. The insight-per-step ratio has dropped near zero.

**Concrete indicators:**
- A step that would have taken 1 sentence now requires 3 to say the same thing
- You're elaborating on implications that were already clear from the conclusion
- You're preemptively addressing objections that weren't raised
- The "new" information is merely restating the conclusion in a different frame
- You catch yourself adding filler like "this is important because..." without a new "because"

**Example:**
```
Iteration N:   "Fix: move line 15 after super().__init__()."
Iteration N+1: "The fix involves relocating the handler assignment to occur after the parent class initialization, which ensures Starlette does not overwrite it."
Iteration N+2: "By moving the assignment after super().__init__(), we ensure the parent class's initialization sequence completes first, preventing the overwrite."
→ Diminishing insight: longer words, same action. Halt candidate.
```

---

### 4. Repeated Conclusions

**Definition:** You reach the same conclusion, recommendation, or answer more than once — often triggered by re-reading the same evidence or revisiting the same reasoning path.

**Concrete indicators:**
- You output the exact same sentence or near-identical formulation as a prior step
- You discover a "new" point that was already noted in an earlier step (self-plagiarism of reasoning)
- After forcing a novel action (e.g., reading a new file), you return to the same conclusion without incorporating new data
- Your notes or scratchpad show duplicate entries with the same conclusion

**Example:**
```
Step 4 output:  "Root cause: DB connection pool exhaustion. Fix: increase max_connections to 50."
Step 7 output:  "After checking the config, the root cause is DB connection pool exhaustion. Increase max_connections to 50."
→ Repeated conclusion: same root cause, same fix, different step number. Halt candidate.
```

---

## Part 2 — Signals Reasoning is Still PRODUCTIVE (Do NOT Halt)

When you observe these signals, reasoning has not yet converged. Continue exploring.

### 1. Novel Information Still Emerging

**Definition:** Each step introduces genuinely new facts, evidence, file locations, constraints, or edge cases that were not previously known.

**Concrete indicators:**
- A new file or function is referenced that wasn't in any prior step
- A new constraint or dependency is discovered (e.g., "this only works on Linux")
- An edge case or boundary condition is identified that changes the conclusion
- A contradiction or conflict is found between two previously assumed-compatible facts
- New data (test output, log lines, config values) changes the assessment

**Example:**
```
Step 3: "The bug is in parser.py."
Step 4: "Wait — parser.py delegates to lexer.py, and lexer.py has the actual bug."
→ Novel information: new file (lexer.py) changes the conclusion. DO NOT halt.
```

---

### 2. Confidence Still Rising

**Definition:** Your confidence level is actively increasing, meaning each step is adding meaningful evidence or reducing uncertainty.

**Concrete indicators:**
- Confidence score (if tracked) increases by > 0.1 between steps
- Hedging language is being removed without new negative evidence appearing
- You're able to add specific details: exact line numbers, test names, config keys
- You're able to answer "why do I believe this?" with new supporting facts each time
- The conclusion is becoming more precise, not just more certain (e.g., "file X" → "line Y in file X")

**Example:**
```
Step 3: "I think the issue is in the auth module, maybe around login flow. Confidence: 40%."
Step 4: "Found it: auth/login.py line 89 calls verify_token() which is deprecated. Confidence: 75%."
Step 5: "verify_token() was removed in v3.0. We're on v3.2. Need to migrate to validate_session(). Confidence: 95%."
→ Confidence rising: 40% → 75% → 95%. DO NOT halt yet — reach 95%+ and verify.
```

---

### 3. New Action Required

**Definition:** The current conclusion reveals that a new action (test, read, write, verify) is needed before you can be done — meaning the work is not yet complete.

**Concrete indicators:**
- You identify an unmet halting criterion (e.g., "test not yet run", "edge case not checked")
- You discover you need to read a file you haven't read yet
- The fix you identified requires verification against a spec or dependency
- You realize the scope is larger than initially assessed

**Example:**
```
"I've identified the fix. Before halting, I need to: (1) run the failing test, (2) check for regressions in auth_router.py, (3) verify the fix works with the OAuth flow."
→ New action required: unmet criteria. DO NOT halt — execute the actions first.
```

---

### 4. Contradiction or Conflict Detected

**Definition:** A newly observed fact contradicts your current conclusion or reveals an inconsistency in your reasoning.

**Concrete indicators:**
- Two pieces of evidence point to different root causes
- A test result contradicts your hypothesis
- Your conclusion doesn't explain all the observed symptoms
- You notice an assumption that hasn't been verified

**Example:**
```
Current conclusion: "The bug is in the database layer."
New observation: "The bug also occurs with an in-memory database (no disk I/O)."
→ Contradiction: database layer can't be the sole cause. DO NOT halt — re-examine.
```

---

## Part 3 — Decision Matrix

Use this matrix to decide whether to halt or continue after a reasoning step.

| Signal Observed | Action |
|----------------|--------|
| Semantic stabilization + halting criteria met | **HALT** |
| Confidence plateauing + halting criteria met | **HALT** |
| Diminishing marginal insight + halting criteria met | **HALT** |
| Repeated conclusion + halting criteria met | **HALT** |
| Semantic stabilization + halting criteria **unmet** | Force a novel action (test/read/verify), don't reason further |
| Novel information emerging | Continue reasoning |
| Confidence actively rising | Continue reasoning |
| New action required (test/verify) | Execute the action, then reassess |
| Contradiction detected | Continue reasoning — resolve the conflict |
| < 3 consecutive no-change steps | Continue — wait for convergence signal |
| Confidence < 0.5 | Continue — uncertainty means more exploration needed |

---

## Part 4 — Edge Cases

### Multi-Step Fixes with Lulls

Complex problems may have natural lulls where reasoning appears to stabilize between breakthroughs. Do not halt if:
- You're in the middle of implementing a multi-part fix
- You've identified one sub-problem but suspect others remain
- You haven't verified the fix against all requirements

**Rule:** Only halt when all halting criteria are fully satisfied AND at least one convergence signal from Part 1 is present.

---

### False Convergence

A locally stable conclusion can be globally wrong. Counteract by:
- Requiring at least one external validation (test run, data check) before halting
- Checking at least one edge case or boundary condition
- Asking: "If this conclusion is wrong, what would I have missed?"

---

### Overconfidence in Convergence

Agents often signal stabilization prematurely. Mitigate by:
- Waiting for 3 consecutive no-change steps before treating stabilization as real
- Comparing the semantic content of steps, not just the length or tone
- Forcing a novel action (run test, read new file) before final halt when criteria are borderline

---

*This reference is designed to be used alongside the selective-halt-reasoning skill. For the core protocol, see `SKILL.md`.*
