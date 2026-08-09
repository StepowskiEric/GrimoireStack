# Verification Templates

Copy-paste these templates into any self-verification session. Fill in each section honestly before moving to the next phase.

---

## Template 1 — Code Verification

Use after writing or modifying code, before committing or presenting.

### Context
- **Language / runtime:** 
- **File(s) changed:** 
- **What the code is supposed to do (1 sentence):** 

### Phase 2 — Self-Critique (max 2 passes)
For each item, tick ✅ or ❌ and write a one-line note.

```
[ ] Error handling — every public function has a try/catch or returns a Result/Option type
[ ] Edge cases — empty input, zero, null/None, empty string, empty list all handled
[ ] Type boundaries — input types and return types are consistent at every call site
[ ] Requirement match — no extra features beyond what was asked
[ ] Side effects — I/O, mutations, and network calls are intentional and documented
[ ] Import correctness — every import resolves to an installed/available package
[ ] Naming — functions/variables match the domain and are not misleading
```

Pass 1 notes:
Pass 2 notes (if doing a second pass):

### Phase 3 — Claim Decompose (top flagged claims)
List each factual claim, then rate confidence / verifiable / impact.

| # | Claim | Confidence | Verifiable (tool) | Impact if wrong |
|---|-------|------------|-------------------|-----------------|
| 1 |       |            |                   |                 |
| 2 |       |            |                   |                 |
| 3 |       |            |                   |                 |

Top flagged claims (low confidence or high impact):
- 

### Phase 4 — Tool Verification
For each flagged claim, record the tool used and the result.

| # | Claim | Tool used | Query / command | Result | Pass / Fail |
|---|-------|-----------|-----------------|--------|-------------|
| 1 |       |           |                 |        |             |
| 2 |       |           |                 |        |             |
| 3 |       |           |                 |        |             |

### Phase 5 — Final Revision
- Claims fixed (describe what changed):
- Claims marked uncertain (describe why):
- Overall confidence: HIGH / MEDIUM / LOW

---

## Template 2 — Documentation Verification

Use before publishing or sharing docs, READMEs, guides, or changelogs.

### Context
- **Doc type:**  (README / guide / API doc / changelog / other)
- **Audience:** 
- **Last reviewed against source:** 

### Phase 2 — Self-Critique

```
[ ] Accuracy — every code example was run or cross-checked against the actual codebase
[ ] Completeness — prerequisites, setup steps, and prerequisites are all listed
[ ] Currency — version numbers, API signatures, and config keys match the current code
[ ] Clarity — a reader unfamiliar with the project could follow every step
[ ] Scope — no undocumented features are promised; no stale features are referenced
[ ] Links — all URLs and cross-references were checked for 404s
[ ] Formatting — headings, code fences, and tables render correctly in plain text
```

Pass 1 notes:
Pass 2 notes:

### Phase 3 — Claim Decompose

| # | Claim (factual statement in the doc) | Confidence | Verifiable (tool) | Impact if wrong |
|---|--------------------------------------|------------|-------------------|-----------------|
| 1 |                                      |            |                   |                 |
| 2 |                                      |            |                   |                 |
| 3 |                                      |            |                   |                 |

Top flagged claims:
- 

### Phase 4 — Tool Verification

| # | Claim | Tool used | Query / command | Result | Pass / Fail |
|---|-------|-----------|-----------------|--------|-------------|
| 1 |       |           |                 |        |             |
| 2 |       |           |                 |        |             |
| 3 |       |           |                 |        |             |

### Phase 5 — Final Revision
- Docs updated (section, what changed):
- Items marked uncertain (why):
- Overall confidence: HIGH / MEDIUM / LOW

---

## Template 3 — Test Verification

Use before committing tests, before reviewing a test suite, or when auditing coverage.

### Context
- **Test framework:** 
- **Code under test:** 
- **What is being validated:** 

### Phase 2 — Self-Critique

```
[ ] Coverage — each public function / route / endpoint has at least one test
[ ] Happy path — the normal/expected input produces the expected output
[ ] Error path — invalid input, missing fields, and error codes are tested
[ ] Boundary — zero, empty, max, min, and off-by-one values are tested
[ ] Idempotency — running the same test twice gives the same result
[ ] Isolation — tests do not depend on execution order or shared mutable state
[ ] Assertions — each test has at least one specific assertion, not just "no crash"
[ ] Naming — test names describe the scenario and expected outcome
[ ] Fixtures — test data is defined inline or clearly referenced, not hidden globals
```

Pass 1 notes:
Pass 2 notes:

### Phase 3 — Claim Decompose

For each test, extract the implicit claim it is making.

| # | Test name / description | Implicit claim | Confidence | Verifiable (tool) | Impact if claim is wrong |
|---|-------------------------|---------------|------------|-------------------|--------------------------|
| 1 |                         |               |            |                   |                          |
| 2 |                         |               |            |                   |                          |
| 3 |                         |               |            |                   |                          |

Top flagged claims:
- 

### Phase 4 — Tool Verification

| # | Claim | Tool used | Command / query | Result | Pass / Fail |
|---|-------|-----------|-----------------|--------|-------------|
| 1 |       |           |                 |        |             |
| 2 |       |           |                 |        |             |
| 3 |       |           |                 |        |             |

### Phase 5 — Final Revision
- Tests added / fixed (describe):
- Tests marked flaky / skipped (why):
- Overall confidence in test suite: HIGH / MEDIUM / LOW
