# Verify Before Integrate — Example, Red Flags & Reference Table

## Worked example: wrong vs right

### Wrong (assumption)

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

### Right (verification)

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

## Red flags

Watch for signals that verification is needed:
1. **Vague documentation** — "memory system" without schema details
2. **Familiar terminology** — "events," "layers," "graph" that sound standard
3. **Research paper integration** — papers use abstract models
4. **Multiple interpretations possible** — "three-layer" could mean many things

On any red flag: stop writing the integration, find the schema source (`src/` or `schema/`), read the actual implementation, create the explicit mapping, and verify with the system owner if possible.

## Verify-against table

| Situation | Verify against |
|-----------|----------------|
| Database integration | `DEFINE TABLE`, `CREATE TABLE`, ORM models |
| API integration | OpenAPI spec, actual endpoint responses |
| Research paper | source code of the reference implementation |
| External system | SDK types, protobuf definitions |
| Internal system | `src/types.ts`, `schema.sql`, entity files |

## Anti-patterns

- Assuming terminology is consistent across systems
- Writing integration code from paper abstracts alone
- Trusting high-level architecture diagrams for field names
- Mapping concepts without checking actual database schemas

## See also

- `karpathy-guidelines` — general coding discipline
- `thoroughness-check-etto` — pre-execution verification
- `socratic-clarification` — when requirements are ambiguous
