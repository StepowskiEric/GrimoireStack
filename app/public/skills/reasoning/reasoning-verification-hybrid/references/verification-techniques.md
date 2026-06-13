# Verification Techniques Reference

Practical commands and examples for applying each verification technique in the reasoning-verification-hybrid skill.

---

## 1. Claim Verification (Phase 1)

**Purpose:** Break reasoning into atomic, falsifiable claims and verify each one before proceeding.

### Commands & Tools

```
# Read a file to verify a claim about code
read_file(path="/path/to/file.py", offset=1, limit=50)

# Search file contents to verify a claim
search_files(pattern="function_name|class_name", path="/path/to/dir", target="content")

# Run terminal command to verify a claim
terminal(command="grep -n 'pattern' /path/to/file")

# Check if a file exists
terminal(command="test -f /path/to/file && echo EXISTS || echo MISSING")

# Count occurrences to verify a quantity claim
terminal(command="grep -c 'pattern' /path/to/file")
```

### Example Workflow

**Task:** "The auth hook returns null after sign-in"

**Step 1 — Decompose into atomic claims:**

```
Claim A [CERTAIN]: getCurrentUser() returns null after sign-in  [observed symptom]
Claim B [UNCERTAIN]: The loading state includes tokenTransition  [needs verification]
Claim C [UNCERTAIN]: useQuery returns undefined during loading   [needs verification]
```

**Step 2 — Verify each UNCERTAIN claim:**

```
# Verify Claim B: does the loading state include tokenTransition?
read_file(path="/src/auth/useAuth.ts", offset=1, limit=80)

# Expected finding in file:
# const loading = useMemo(() => ({
#   userLoading: !user && !token,
#   tokenTransition: !!token && !user,
# }), [user, token]);
# → Claim B is CERTAIN
```

```
# Verify Claim C: does useQuery return undefined during loading?
search_files(pattern="useQuery|return undefined|isLoading", path="/src/auth", target="content")

# Expected finding:
# if (isLoading) return undefined;
# → Claim C is CERTAIN
```

**Step 3 — Build the dependency graph:**

```
Claim A (observed)
    └── Claim B (verified: CERTAIN)
        └── Claim C (verified: CERTAIN)
            └── Claim D (inference: user null during token propagation → LIKELY)
```

---

## 2. Self-Consistency Check (Phase 3)

**Purpose:** Generate multiple reasoning paths and check if they converge on the same conclusion. Low agreement = low confidence.

### Commands & Tools

```
# Compare two different reasoning paths by re-examining evidence
read_file(path="/path/to/evidence1.md")
read_file(path="/path/to/evidence2.md")

# Count agreement: how many independent signals point to the same conclusion?
search_files(pattern="error|warning|fail", path="/logs", target="content", output_mode="count")

# Check for conflicting evidence
search_files(pattern="contradict|however|but|unlike", path="/docs", target="content")
```

### Example Workflow

**Task:** "What caused the deployment failure?"

**Step 1 — Generate 3 independent reasoning paths:**

```
Path A (from logs):    "OOMKilled" in pod events → memory limit too low
Path B (from metrics):  Memory usage spiked to 98% of limit → confirm OOM
Path C (from config):   memory.limit = 256Mi → below recommended 512Mi
```

**Step 2 — Check convergence:**

```
Agreement: 3/3 paths → OOM / memory limit
Confidence: 0.90 (high convergence)
```

**Step 3 — If paths disagree:**

```
Path A: OOMKilled in logs
Path B: CPU throttling in metrics
Path C: No memory config found

Agreement: 1/3 → conflicting evidence
Confidence: 0.40 → STOP, need more evidence before concluding
→ Re-examine: check if OOM and CPU issues coexist, or which came first
```

---

## 3. Faithfulness Check (Phase 4)

**Purpose:** Verify that the conclusion is logically entailed by the verified premises. Detect hidden assumptions and correlation-vs-causation errors.

### Commands & Tools

```
# Extract premises and conclusion for manual entailment check
read_file(path="/path/to/premises.md")

# Search for causal language that may be unjustified
search_files(pattern="because|therefore|thus|caused by|leads to|results in", path="/reasoning", target="content")

# Search for hidden assumption indicators
search_files(pattern="assume|presume|suppose|must be|obviously|clearly|of course", path="/reasoning", target="content")

# Verify that cited evidence actually supports the claim
terminal(command="diff <(grep -A2 'claim' /evidence.txt) <(grep -A2 'support' /evidence.txt)")
```

### Example Workflow

**Task:** "Fix should resolve the bug"

**Step 1 — List premises and conclusion:**

```
Premise 1: getCurrentUser() returns null during loading  [verified CERTAIN]
Premise 2: useQuery returns undefined while loading     [verified CERTAIN]
Conclusion: Adding !!user check will fix the null bug
```

**Step 2 — Check entailment:**

```
Does Premise 1 + Premise 2 ENTAIL the conclusion?
  → No. Premises describe WHEN null occurs, not WHY.
  → Missing premise: "Adding !!user prevents null from propagating"
  → Verdict: REQUIRES ASSUMPTION
```

**Step 3 — Identify hidden assumptions:**

```
Hidden assumption found: "UI components don't also depend on loading state"
→ Verify: search for components reading loading.userLoading
read_file(path="/src/components/AuthGuard.tsx")
→ Found: AuthGuard also checks userLoading → !!user alone is insufficient
→ Fix must also handle loading state
```

**Step 4 — Correlation vs causation check:**

```
Statement: "Users with dark mode enabled report fewer bugs"
  → Correlation: dark mode users are more tech-savvy
  → NOT causation: dark mode doesn't cause fewer bugs
  → Fix: rephrase to "dark mode users report fewer bugs" (no causal claim)
```

---

## 4. Convergence Check (Phase 3 — Aggregation)

**Purpose:** Combine multiple claim confidences into an overall conclusion confidence. The conclusion is only as strong as its weakest verified premise.

### Commands & Tools

```
# Calculate min-confidence across claim chain (Python-like pseudocode)
# conclusion_confidence = min(ancestor_claim_confidences)

# Example implementation in reasoning:
# - List all ancestor claims with their confidence scores
# - Take the minimum
# - Apply threshold rules
```

### Example Workflow

**Task:** "Recommend whether to adopt library X"

**Step 1 — List claims and confidences:**

```
Claim 1: Library X has 10k GitHub stars      [verified]  confidence: 0.95
Claim 2: Library X is actively maintained     [verified]  confidence: 0.85
Claim 3: Library X has no known critical CVEs  [verified]  confidence: 0.90
Claim 4: Library X API fits our use case      [UNCERTAIN] confidence: 0.60  ← weakest link
Claim 5: Migration cost is < 1 week           [UNCERTAIN] confidence: 0.55  ← weakest link
```

**Step 2 — Aggregate:**

```
Conclusion confidence = min(0.95, 0.85, 0.90, 0.60, 0.55) = 0.55
```

**Step 3 — Apply threshold:**

```
0.55 < 0.7 → STOP — do not recommend adoption yet
Action: Verify Claim 4 and Claim 5 before proceeding
```

**Step 4 — After verification:**

```
Claim 4: Library X API fits our use case      [verified]  confidence: 0.80
Claim 5: Migration cost is < 1 week           [verified]  confidence: 0.75

Conclusion confidence = min(0.95, 0.85, 0.90, 0.80, 0.75) = 0.75
0.75 is in 0.7-0.9 range → Proceed with caveat
→ "Recommend adoption with note: monitor API stability for 30 days post-migration"
```

---

## Quick Reference: Threshold Rules

| Confidence | Action |
|------------|--------|
| ≥ 0.9      | Proceed with confidence |
| 0.7 – 0.9  | Proceed with caveat |
| < 0.7      | STOP — verify or abstain |
| 0.0 – 0.3  | Strongly consider abstention |

## Quick Reference: Phase Execution Order

```
Phase 1 (Claim Decomposition)  → Always run first
Phase 4 (Entailment Check)     → After Phase 1, before action
Phase 2 (Backward Check)       → After candidate conclusion exists; skip for trivial
Phase 3 (Calibration)          → Before any action; gates implementation
```

## Abort Conditions

Run these checks in order. Abort immediately if any triggers:

1. **Fatal flaw in Phase 1** — Core claim is unverifiable or false → Stop, report issue
2. **Fatal flaw in Phase 4** — Conclusion not entailed by premises → Stop, revise reasoning
3. **Phase 3 confidence < 0.7** — Do not implement fix, do not assert conclusion
4. **Phase 2 reveals contradiction** — Revisit Phase 1 claims, check for missed evidence

---

*For the full protocol, see the parent skill: `reasoning-verification-hybrid/SKILL.md`*
