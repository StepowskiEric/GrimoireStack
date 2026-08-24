---
name: documentation-craft
description: "Multi-phase pipeline from outline to verified explanation, audience-driven and source-grounded."
triggers:
  - technical-writing
  - code-to-docs
  - outline-first
  - doc-quality-verification
disable-model-invocation: true
---

# Documentation Craft

**Structure first, words second.** Write docs that tell the reader something they need to know, at the depth they need it, in the structure they expect. Every doc passes through three phases: outline, draft, verify.

## The Move

### 1. Outline — structure the narrative
Identify the audience (developer / end user / maintainer / new hire) and its expertise — depth is audience-relative. Then write the section headers and key points before any prose. Each section has a single purpose; order follows dependency (prereqs before usage). Don't write prose yet.

### 2. Draft — write with context
Write each section from its outline points. Lead with purpose: "This function validates..." not "The validate function...". One idea per paragraph, active voice, concrete over abstract. Cross-reference instead of duplicating — if it's written elsewhere, point at it.

### 3. Verify — score against the quality checklist
Score every section before calling it done:
1. **Information value** — does the reader need this? Cut what is obvious from the code or restates the config.
2. **Completeness** — can a new maintainer operate the system from this doc alone?
3. **Clarity** — one idea per paragraph; why before what; active voice.
4. **Accuracy** — every claim verified against the code or a committed source of truth. Stale docs are defects.
5. **Progressive disclosure** — overview → concepts → usage → reference; deep detail behind section boundaries, not inline.

Any section failing a dimension goes back to Draft. Update stale docs in the same patch as the code change.

## Reference
For the README, ADR, and function/class templates plus the positive craft rules, see [`references/documentation-craft-details.md`](references/documentation-craft-details.md).

## MECE test
Before publishing any taxonomy, category list, or option set: every item must fit exactly one category (no overlaps) and the categories must cover the whole domain (no gaps). An item that fits two places means the categories are wrong.

## Rules
- **Do** outline before writing prose.
- **Do** lead with purpose and give every example context.
- **Do** update docs in the same patch as the code they describe.
- **Do not** document the obvious — if the code says it, don't repeat it.
- **Do not** ship reference dumps: a wall of parameters without "when to use this" is a lookup, not documentation.
