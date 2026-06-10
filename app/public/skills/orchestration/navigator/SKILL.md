---
name: navigator
description: Scout reads and distills context; Thought-Retriever stores the distilled reasoning as retrievable traces. Navigate complex codebases by building a living trail of what was explored and why.
triggers:
  - Large codebase, unknown bug location
  - Need to understand a foreign codebase fast
  - Want to preserve investigation trail for later retrieval
  - Agent keeps re-asking the same questions
---

# Navigator

**Biological analog:** A cartographer mapping terrain in real time — every path walked gets recorded so the next explorer doesn't redo the work.

## When to Use

You face a large or unfamiliar codebase and need to:
- Rapidly map structure without reading every file
- Preserve the investigation trail so future sessions can resume where you left off
- Avoid redundant re-exploration across agent turns

## How It Works

### Phase 1 — Scout (Surface)

Scout sub-agent reads files, identifies patterns, and produces a **distilled context artifact**:

```
Output: scout_report.md containing:
- File/function/region locations (with evidence)
- Structural relationships discovered
- Anomalies or patterns of interest
- Confidence: HIGH/MEDIUM/LOW on each finding
```

Scout does NOT draw conclusions — it surfaces raw structure. The "so what" is deferred to the Thought-Retriever phase.

### Phase 2 — Thought-Retriever (Store)

Thought-Retriever takes Scout's output and converts it into a **structured reasoning trace** for long-term retrieval:

```
Output: reasoning_trace.json containing:
- query: what the investigation was looking for
- evidence: [ { source, location, excerpt } ]
- synthesis: one-paragraph summary of what was found
- next_steps: recommended follow-up actions
- tags: [code-location, pattern-type, domain]
```

This trace is stored in a shared workspace (file or memory system) keyed by: `(domain, pattern_type, file_location)` so future investigations can retrieve by structural similarity, not keyword.

### Phase 3 — Retrieval (Future Sessions)

When a new investigation starts, query the stored traces before scanning the codebase fresh. If `(domain, pattern_type)` matches an existing trace, resume from where Scout stopped rather than restarting.

## Sub-Agent Contracts

### Scout
- **Inputs:** investigation goal, workspace path, previously stored traces (to avoid re-doing)
- **Outputs:** `scout_report.md` in shared workspace
- **Limits:** 20 files max per run, stop at confidence threshold, write partial findings if budget exhausted

### Thought-Retriever
- **Inputs:** `scout_report.md`, existing traces for same domain
- **Outputs:** `reasoning_trace.json` appended to trace store
- **Limits:** Max 10 traces per domain before triggering a consolidation pass (merge old traces into a summary artifact)

## Anti-Patterns (what Navigator prevents)

- **Re-traversal:** Agent re-reads same files because previous findings weren't stored
- **Keyword-only search:** Finding code by pattern match rather than structural relationship
- **Forgetting why:** Agent knows what files exist but not why they were examined

## Fallback Mode

If Thought-Retriever is unavailable, Scout writes directly to a `navigator_trail.md` file with the same structured format (query, evidence, synthesis, next_steps) so manual retrieval is still possible.