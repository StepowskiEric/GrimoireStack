---
name: architecture-evolution-review
description: "Review the repository as a living system. Detect architectural drift, feature erosion, and long-term maintenance risks."
triggers:
  - architectural-drift
  - maintainability-review
  - long-term-health
---

# Architecture Evolution Review

**Architecture is measured by how well tomorrow's changes fit naturally into today's structure.** Assume 100 more features will be added. Maximize long-term developer velocity — evaluate whether the repository is becoming easier or harder to maintain over time.

## The Move

### 1. Map the structure
Walk the folder tree. For each top-level directory: what responsibility does it own? How many features does it serve? Is it growing around one concept or becoming a dumping ground?

### 2. Check each dimension
Run the 8 checks (see Reference) and record findings with file/folder references.

### 3. Identify trends
One oversized component is acceptable. Five is a pattern. One misplaced helper is acceptable. Twenty is drift. Prefer patterns over isolated issues.

### 4. Rank improvements
Score each finding by leverage (how many future features it helps), effort (how hard to fix), blast radius (how many things it touches). Pick the top 5.

### 5. Write the verdict
Produce: **Architecture Trend** (easier or harder over time, with evidence), **Top 5 Improvements** (ranked by leverage × effort), **Future Risks** (what will hurt in a year if not addressed), and **Decisions** (for each non-trivial recommendation: the decision, why, trade-offs, why alternatives were rejected). Do not recommend rewrites — prefer small, high-leverage improvements.

## Readability test
Could a new engineer answer without searching: Where does {core concept} live? Where is backend access? Where are shared components? Where do tests belong? Could another AI agent answer the same questions and produce consistent implementations? If not, recommend improvements.

## Reference
For the full 8 checks (feature cohesion, folder health, shared code audit, core stability, dependency boundaries, module depth, duplication, predictive risk), see [`references/architecture-evolution-details.md`](references/architecture-evolution-details.md).

## Rules
- **Do** record every finding with a file/folder reference.
- **Do** prefer patterns over isolated issues — one case is noise, five is a trend.
- **Do** rank by leverage × effort, not by how annoying the code looks.
- **Do** centralize knowledge duplication (repeated business rules); leave code duplication that doesn't share meaning alone.
