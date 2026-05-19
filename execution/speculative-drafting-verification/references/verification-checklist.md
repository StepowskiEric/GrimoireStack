# Verification Checklist for Speculative Drafting

Use this checklist to systematically verify each drafted candidate branch before selection.

---

## Pre-Draft Verification

Before generating candidates, confirm:

- [ ] **Problem is well-defined**: Clear statement of what needs to be solved
- [ ] **Constraints are explicit**: All hard requirements, soft preferences, and edge cases listed
- [ ] **Success criteria established**: Measurable outcomes for a "good" solution
- [ ] **Branching factor chosen**: N = 3–5 (not too many, not too few)
- [ ] **Verification criteria defined**: What will be checked (compilation, tests, intent match, etc.)

---

## Per-Candidate Verification (Apply to Every Draft)

For each candidate branch, verify the following:

### 1. Compilation / Syntax Check

**For code solutions:**
- [ ] Code compiles without errors
- [ ] No syntax warnings (or they are understood and acceptable)
- [ ] Dependencies are available and correctly specified
- [ ] Build process completes successfully

**For non-code solutions (designs, plans, documents):**
- [ ] Structure is coherent and complete
- [ ] No missing sections or placeholders left unresolved
- [ ] Formatting is consistent

### 2. Test Passing

**If the problem has existing tests or testable components:**
- [ ] All existing tests still pass (no regressions)
- [ ] New tests added for the solution pass
- [ ] Edge case tests included and passing
- [ ] Performance tests (if any) meet thresholds

**If no formal tests exist:**
- [ ] Manual test scenarios identified and executed
- [ ] Test results documented
- [ ] Failures categorized (critical, major, minor)

### 3. Intent Matching

**Does the solution solve the original problem?**
- [ ] Addresses the core requirement (not a related but different problem)
- [ ] Respects all stated constraints
- [ ] Aligns with implicit requirements (e.g., performance, maintainability)
- [ ] Does not introduce new problems or side effects
- [ ] Matches the problem's priority (e.g., quick prototype vs. production-ready)

### 4. Quality Attributes

**Evaluate non-functional aspects:**

- [ ] **Simplicity**: Minimal complexity for the problem solved
- [ ] **Maintainability**: Clear structure, documented decisions
- [ ] **Performance**: Acceptable for the use case
- [ ] **Security**: No obvious vulnerabilities
- [ ] **Robustness**: Handles error cases gracefully
- [ ] **Extensibility**: Can be adapted if requirements change

### 5. Comparative Assessment

**Relative to other candidates:**
- [ ] Unique advantages identified (what this candidate does better)
- [ ] Unique disadvantages identified (what this candidate lacks)
- [ ] Tradeoffs understood and acceptable
- [ ] Not a duplicate of another candidate (each branch should be qualitatively different)

---

## Post-Verification Scoring

After verifying all candidates, assign scores (0–1 scale):

| Criterion | Weight | Candidate 1 | Candidate 2 | Candidate 3 |
|-----------|--------|-------------|-------------|-------------|
| Constraint Satisfaction | 0.4 | ____ | ____ | ____ |
| Efficiency | 0.3 | ____ | ____ | ____ |
| Robustness | 0.2 | ____ | ____ | ____ |
| Simplicity | 0.1 | ____ | ____ | ____ |
| **TOTAL** | **1.0** | ____ | ____ | ____ |

**Scoring guidance:**
- 0.0–0.3: Major issues, does not meet requirements
- 0.4–0.6: Partial success, needs significant work
- 0.7–0.8: Acceptable with minor refinements
- 0.9–1.0: Excellent, meets or exceeds expectations

---

## Selection Decision

Based on scores, apply decision rules:

- [ ] **Top score ≥ 0.8** → ACCEPT: Ready to commit
- [ ] **0.7 ≤ Top score < 0.8** → REFINE: Improve the top candidate before committing
- [ ] **Top score < 0.7** → REJECT: Generate new branches and restart

---

## Documentation

After completing verification:

- [ ] **Record results**: Document which candidates passed/failed and why
- [ ] **Note learnings**: What approaches were tried and what made them succeed/fail
- [ ] **Capture rationale**: If a candidate is selected, record why it was chosen
- [ ] **Log alternatives**: Brief note on why other candidates were rejected

---

## Quick Reference

```
Candidate ID: _______________

Compiles?  [YES / NO / PARTIAL]
Tests pass? [YES / NO / PARTIAL]
Matches intent? [YES / NO / PARTIAL]
Quality adequate? [YES / NO / PARTIAL]
Unique value? [YES / NO]

Final verdict: [ACCEPT / REFINE / REJECT]
Score: _____/1.0
Notes:
_________________________________
_________________________________
```

---

## Common Failure Modes

Watch for these signs of a weak candidate:

- **Works but solves wrong problem**: Verify intent alignment first
- **Compiles but fails tests**: Tests reveal hidden bugs
- **Passes tests but fragile**: Edge cases not handled
- **Works but over-engineered**: Simplicity penalty in scoring
- **Promising but incomplete**: Draft quality issues

---

## When to Stop Exploring

If any candidate reaches score ≥ 0.9 and all verification checks pass:
- Consider stopping early rather than generating more branches
- Time spent exploring additional candidates has diminishing returns

If no candidate reaches 0.7 after 3 rounds of branching:
- Re-examine the problem definition and constraints
- Consider that the problem may be ill-posed or require different framing
