---
name: verify-before-integrate
description: "Verify the actual system behavior rather than matching abstract terminology when integrating research or external docs."
triggers:
  - skill-system-integration
  - research-paper-implementation
  - abstract-to-concrete-mapping
  - integration-documentation
---

# Verify Before Integrate

**Abstract descriptions do not match concrete implementations.** Research papers and high-level docs use abstract terminology — "three-layer memory architecture," "event sourcing," "graph relationships" — and every actual system makes specific, often different choices. "Three-layer" in Coppermind means episodes → memories → edges; in another system it means working → episodic → semantic. All are three-layer; none share schemas, fields, or constraints. Verify against the real system before writing any integration.

## The Move

### 1. Identify the abstraction
Name the concept from the paper, doc, or research: "three-layer memory: working, episodic, semantic." Write it down with its assumed meaning.

### 2. Search for terminology in the target
Does the target system use the same terms? `rg "working.*memory|episodic|semantic"` in the source and docs. Exact match is rare — assume no match until proven.

### 3. Find the actual schema
Schemas reveal the truth: `rg "DEFINE TABLE|CREATE TABLE"`, `rg "interface.*Memory|type.*Memory"`, ORM models, SDK types, protobufs. Then **read the source of truth** — the actual implementation file, not just the README. Docs summarize; code commits.

### 4. Map fields explicitly
Create a mapping document: paper concept → system implementation. Name the actual tables/fields and what each really holds — "episode: immutable raw audit (NOT episodic)" — then map each abstract concept to its real counterpart ("observation → episode with promotion=none").

### 5. Verify with the system owner
If possible, confirm the mapping with the owner. Then write the integration against the verified schema, and keep the mapping document for future maintainers.

## Reference
For the worked wrong-vs-right example, the red flags that trigger verification, and the verify-against table per integration type, see [`references/verify-details.md`](references/verify-details.md).

## Rules
- **Do** search for exact terminology first — assume no match until proven.
- **Do** read source code for schema definitions; docs and architecture diagrams are not field names.
- **Do** create an explicit translation layer and document the mapping.
- **Do** stop writing integration the moment a red flag appears — vague docs, familiar-sounding terms, paper abstractions, multiple interpretations.
- **Do** confirm with the system owner when the mapping is load-bearing.
