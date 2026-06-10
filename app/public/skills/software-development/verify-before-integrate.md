# Skill: Verify Before Integrate

## Purpose

When integrating research paper concepts, API documentation, or external system descriptions into a skill or implementation, verify the actual system behavior rather than assuming terminology alignment. Names that sound similar often refer to different implementations.

---

## When to Use

- Writing a skill that connects to an existing system (Coppermind, Convex, Supabase, etc.)
- Implementing a research paper's algorithm in a production codebase
- Mapping abstract concepts to concrete APIs or database schemas
- Creating integration documentation or tutorials

---

## The Pitfall

**Abstract descriptions don't match concrete implementations.**

Research papers and high-level documentation use abstract terminology:
- "Three-layer memory architecture" → sounds like working/episodic/semantic
- "Event sourcing" → sounds like any system with events
- "Graph relationships" → sounds like any connected data

**Actual implementations make specific, often different choices:**
- Coppermind: episodes (immutable) → memories (lifecycle) → edges (relations)
- Another system: working → episodic → semantic (cognitive science model)
- A third system: raw events → aggregates → projections

All are "three-layer" but have different schemas, fields, and constraints.

---

## The Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Identify the abstraction in the paper/concept              │
│  "Three-layer memory: working, episodic, semantic"                │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: Check if target system uses same terminology               │
│  Search: "working layer" "episodic" "semantic" in target codebase │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │  MATCH       │    │  NO MATCH    │
            │  (rare)      │    │  (common)    │
            └──────┬───────┘    └──────┬───────┘
                   │                   │
                   ▼                   ▼
            Use directly          Find actual schema
                                    │
                                    ▼
                            ┌──────────────┐
                            │  Read source │
                            │  code, not   │
                            │  just docs   │
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │  Map concept   │
                            │  to actual     │
                            │  fields/tables │
                            └──────┬───────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │  Create      │
                            │  translation │
                            │  layer       │
                            └──────────────┘
```

---

## Verification Checklist

Before writing integration code or skills:

### 1. Search for Terminology
```bash
# Does the target system use the same terms?
rg "working.*memory|episodic|semantic" ~/target-system/src/
rg "three.*layer|memory.*architecture" ~/target-system/docs/
```

### 2. Find the Actual Schema
```bash
# Database schemas reveal the truth
rg "DEFINE TABLE|CREATE TABLE" ~/target-system/src/
rg "interface.*Memory|type.*Memory" ~/target-system/src/
```

### 3. Read the Source of Truth
```bash
# The actual implementation file
cat ~/target-system/src/memory-plane.ts | head -100
```

### 4. Map Fields Explicitly

Create a mapping document:

```yaml
# Paper Concept → System Implementation
paper:
  working_memory: "Session-scoped temporary storage"
  episodic_memory: "Event-based audit trail"
  semantic_memory: "Generalized knowledge graph"

system_actual:
  episode: "Immutable raw audit (NOT episodic)"
  memories: "Promoted durable records with lifecycle"
  edges: "Graph relationships via TYPE RELATION"

mapping:
  observation: "episode with promotion=none or promoted→memory"
  inference: "memory with durability=durable"
  conclusion: "memory with canonical_candidate=true"
```

---

## Example: What Went Wrong vs. Right

### Wrong (Assumption)
```yaml
# I assumed:
coppermind_layers:
  working: "Session thoughts"
  episodic: "Episode table"
  semantic: "Abstracted patterns"

# Wrote skill using:
store_thought:
  layer: "episodic"  # WRONG - no such layer in Coppermind
```

### Right (Verification)
```yaml
# After reading surreal-memory-plane.ts:
coppermind_tables:
  episode:
    fields: [entry_id, raw_text, promotion, memory_entry_id]
    purpose: "Immutable audit trail"
  memories:
    fields: [entry_id, content, status, durability, canonical_key]
    purpose: "Promoted durable records"
  edges:
    types: [supersedes, contradicts, related_to, derived_from]
    purpose: "Graph relationships"

# Correct mapping:
observation_thought:
  store_to: "episode"
  promote_to: "memories" if validated
  edges: ["derived_from"]
```

---

## Red Flags

Watch for these signals that you need to verify:

1. **Vague documentation** — "memory system" without schema details
2. **Familiar terminology** — "events", "layers", "graph" that sound standard
3. **Research paper integration** — papers use abstract models
4. **Multiple interpretations possible** — "three-layer" could mean many things

---

## Action When Flagged

If any red flag appears:

1. **Stop writing the integration**
2. **Find the schema source** — usually `src/` or `schema/` directory
3. **Read the actual implementation** — not just README/docs
4. **Create explicit mapping** — paper concept → system field
5. **Verify with system owner** if possible

---

## Anti-Patterns

**Don't:**
- Assume terminology is consistent across systems
- Write integration code from paper abstracts alone
- Trust high-level architecture diagrams for field names
- Map concepts without checking actual database schemas

**Do:**
- Read source code for schema definitions
- Search for exact terminology matches first
- Create explicit translation layers
- Document the mapping for future maintainers

---

## Quick Reference

| Situation | Verify Against |
|-----------|----------------|
| Database integration | `DEFINE TABLE`, `CREATE TABLE`, ORM models |
| API integration | OpenAPI spec, actual endpoint responses |
| Research paper | Source code of reference implementation |
| External system | SDK types, protobuf definitions |
| Internal system | `src/types.ts`, `schema.sql`, entity files |

---

## See Also

- `karpathy-guidelines` — general coding discipline
- `thoroughness-check-etto` — pre-execution verification
- `socratic-clarification` — when requirements are ambiguous
