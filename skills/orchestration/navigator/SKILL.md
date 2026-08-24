---
name: navigator
description: "Scout reads code, Thought-Retriever stores the reasoning trail so future sessions resume from where you stopped."
triggers:
  - Large or unfamiliar codebase
  - Investigation trail worth preserving across sessions
  - Agent keeps re-reading the same files
disable-model-invocation: true
---

# Navigator

Two roles, one trail. **Scout** distills code into a context artifact. **Thought-Retriever** stores it so the next session resumes from where this one stopped.

## When to Use

- Mapping a large or unfamiliar codebase without reading every file
- Preserving investigation trail across agent turns
- Avoiding redundant re-exploration

## When NOT to Use

- **Single-file edits or small surfaces.** Scout's overhead burns budget the agent doesn't have.
- **Exploratory questions with no follow-up.** No point storing a trace you won't retrieve.

## Phase 1 — Scout (Surface)

Read files, identify patterns, write a `scout_report.md` containing:

- File / function / region locations (with evidence)
- Structural relationships discovered
- Anomalies or patterns of interest
- Confidence (HIGH / MEDIUM / LOW) on each finding

Scout does NOT draw conclusions — only surfaces raw structure. The "so what" is deferred to Phase 2.

**Done when** `scout_report.md` exists, every finding has a confidence rating, and findings add up to ≤20 files explored.

## Phase 2 — Thought-Retriever (Store)

Convert the scout report into a structured `reasoning_trace.json`:

```
query:        <what the investigation was looking for>
evidence:     [ { source, location, excerpt } ]
synthesis:    <one-paragraph summary>
next_steps:   <recommended follow-up actions>
tags:         [code-location, pattern-type, domain]
```

Key traces by `(domain, pattern_type)` so future sessions retrieve by structural similarity, not keyword.

**Done when** the trace is keyed by `(domain, pattern_type)`, and ≤10 traces exist per domain (consolidate before adding more).

## Phase 3 — Retrieval (Future Sessions)

When a new investigation starts, query the stored traces before scanning fresh. If `(domain, pattern_type)` matches an existing trace, resume from where Scout stopped.

**Done when** a fresh investigation reuses at least one stored trace, OR the trace store has no match and a new trace is written.

## Anti-Patterns

- **Re-traversal:** re-reading files because previous findings weren't stored
- **Keyword-only search:** finding code by string match rather than structural relationship
- **Forgetting why:** knowing what files exist but not why they were examined

## Integration

Pair with `code-knowledge-graph` for the structural layer if your repo is indexed. Pair with `summarize` at the end of a session to write the trace before context is lost.
