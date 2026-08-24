---
name: codebase-divide-conquer-search
description: "Divide a large codebase into summary-ranked zones and conquer each with a parallel sub-agent. Find code by behavior, not by name."
triggers:
  - large-codebase-search
  - vocabulary-mismatch
  - multi-module-target
  - no-obvious-start-file
disable-model-invocation: true
---

# Codebase Divide-and-Conquer Search

**Find code by behavior, not by name.** When grep returns too many candidates or the target could live in any of several modules, compress the codebase into a summary tree, partition it into candidate zones, and send one sub-agent to conquer each zone in parallel. Summaries beat raw code for retrieval; parallel zones beat a single linear scan.

## The Move

### 1. Comprehend — build the summary tree
Summarize the codebase at file/class/function granularity, under 100 words per file. For files over 200 lines, summarize at function level too. With the companion script this is one command (see Reference); without it, list source files, read 1–2 representatives per module, and record exports + responsibilities in a scratchpad.

### 2. Divide — rank candidates into zones
Write the search query as a natural-language sentence (not keywords). Rank files/classes/functions by semantic similarity to the query, then partition the top candidates into non-overlapping **zones** — one per sub-agent:
- Zone 1: files clearly related to the query
- Zone 2: files that call into Zone 1
- Zone 3: files that configure or initialize the subsystem
- Discard files with no plausible connection

Limits: max ~50 candidate files, 3–5 zones. More zones give diminishing returns.

### 3. Conquer — one sub-agent per zone
Spawn a sub-agent per zone with a strict mandate: read every file in the zone, search for query-relevant code, and return ONLY a JSON array of findings — file path, line range, one-sentence why, confidence (0.0–1.0). Allow exploration outside the zone (callers, callees) but cap it (10 tool calls total). Read-only: no edits during search.

### 4. Synthesize — merge, cross-validate, rank
- **Deduplicate:** same file + overlapping lines = one finding; keep the higher confidence.
- **Cross-validate:** if two zones independently point to the same location, boost confidence (+0.1, cap 1.0).
- **Resolve contradictions:** if zones disagree on a location, read it directly and adjudicate.
- **Rank by evidence strength:** direct implementation match > caller > configuration; line-specific > file-level guess.

Output: findings with file, lines, function, confidence, evidence, and supporting zones; list filtered false positives with reasons.

### 5. Deepen (optional) — re-run at finer granularity
When top confidence < 0.75, findings are near-tied (within 0.1), or the query targets a specific function and you only have file-level results: take the most promising zone, re-summarize at function/block level, and re-run Divide + Conquer on just that zone.

## Circuit breakers
- Summary generation fails for >30% of files (codebase may be too exotic)
- All zones return empty (query malformed or target absent)
- Sub-agents keep exploring outside their zones (zone boundaries wrong)
- After 2 deepening iterations confidence is still < 0.75 — escalate to a human

## Reference
- [`references/codebase-details.md`](references/codebase-details.md) — script setup and commands, JSON formats, and the bug-localization walkthrough.
- [`references/search-strategies.md`](references/search-strategies.md) — division strategies per codebase type (monorepo, feature modules, microservices) and token-budget-aware search.

## Rules
- **Do** keep summaries under 100 words per file.
- **Do** give every sub-agent a tool-call budget and require line numbers in evidence.
- **Do** cross-validate findings across zones.
- **Do** deepen when confidence is borderline.
- **Do** use the script when the codebase exceeds ~50K tokens — the compression is the point.
