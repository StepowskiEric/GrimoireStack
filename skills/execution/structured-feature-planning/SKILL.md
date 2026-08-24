---
name: structured-feature-planning
description: "Read files, search for patterns, self-review twice, then execute. Never hallucinate when confused."
triggers:
  - correctness-critical-feature
  - ambiguous-request
  - unfamiliar-codebase-feature
  - just-start-coding-temptation
disable-model-invocation: true
---

# Structured Feature Planning

**Confused? Stop. Search. Ask. Never fabricate.** A real engineer does not guess when unsure, and neither does this skill. Read the relevant files, search for implementation patterns, detect your own stuck points, write a structured plan, self-review it twice — then execute. A partially-complete plan beats a confident plan built on guessed assumptions.

## When to Use
- Starting a new feature of any complexity
- The request is ambiguous or could be interpreted multiple ways
- The feature touches architecture you haven't read yet
- You feel yourself "just starting to code" without a plan

Skip it: trivial one-liners, an already-approved spec (just execute), or purely exploratory tasks.

## The Move

### 1. Explore — read before assuming
Read every file relevant to the feature and emit a structured finding per file: what is relevant, key functions/classes/schemas with line numbers, importable patterns, and gaps or questions raised. If a file references something you haven't read and don't understand, read that too — do not skip context.

### 2. Search — targeted, with purpose
Run 3–5 targeted searches, each with an explicit PURPOSE line before the query: implementation patterns for specific ambiguous parts, how similar systems solve the problem, technical questions raised while reading. Skip open-ended "are there issues with X" and things answerable by reading the code more carefully. If 3–5 searches don't resolve the uncertainty, stop searching — do not spiral.

### 3. Stuck detection — resolve or ask
After search, check: am I still uncertain? If search can resolve it, run the search and move on. If it cannot (human knowledge, business decision, architecture choice you can't make), emit a **NEEDS_CLARIFICATION** block — the issue, why search can't resolve it, options, recommendation — and stop Phase 3 until resolved. Never put a fake answer in the plan; never proceed past confusion.

### 4. Plan — structured steps with confidence
Write the plan as JSONL: each step one atomic action with action, files affected, confidence (HIGH/MEDIUM/LOW), assumptions, and verification. HIGH = read the code and know the pattern; MEDIUM/LOW = assumptions exist and must be listed explicitly. Include explicit out-of-scope, what you don't know, and risks with mitigations.

### 5. Self-review twice, then execute
- **Pass 1 — scope diff:** compare the plan to the original request. Scope creep? Scope reduced without justification? Correct back or emit a scope-change note.
- **Pass 2 — pre-mortem:** for each step, "if this ships and causes a problem, what went wrong?" Fix fixable gaps; flag the rest as KNOWN_GAP. If a severe failure mode has no mitigation, stop and return to Phase 3.
- **Execute** with the plan as reference, not prison — update it when new information changes a step, noting what changed and why.

## Reference
For the JSONL schemas per phase, the confusion triggers and responses, the output-file contract, and a full condensed example run, see [`references/planner-details.md`](references/planner-details.md). Script companion: `scripts/structured_planner.py` (enforces phase ordering, validates JSONL, resumes from the last incomplete phase).

## Rules
- **Do** read the file before assuming what it does — "I believe X happens here" without verification is a fabrication.
- **Do** write a PURPOSE before every search query.
- **Do** stop at confusion: read more, search the specific unknown, then ask.
- **Do** mark every MEDIUM/LOW step with explicit assumptions and verification.
- **Do** update the plan when execution reveals new information.
