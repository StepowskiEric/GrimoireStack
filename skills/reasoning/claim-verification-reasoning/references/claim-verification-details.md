# Claim Verification — Tiers, Tool Mapping & Anchor Store

## Verification tier definitions

For each confidence label, by claim type (code, environment, API, data), the reference file `verification-tiers.md` lists concrete commands:

- **Tier 0 — Self-check:** claims provable from what is already in context (quoted source, test output already seen)
- **Tier 1 — Pattern search (`rg`):** find definitions, search patterns near a file, context lines, filename presence, directory narrowing
- **Tier 2+ — Execution:** run tests, queries, benchmarks, git show/diff for commit claims

Default rule: if you did not read it from source code, a test output, or documentation, it is not CERTAIN.

## Verification tool mapping

| What you need to verify | Tool to use |
|------------------------|-------------|
| "Function X does Y" | `read_file` at function definition |
| "Test T fails with error E" | `terminal` running the test |
| "Variable V has value N" | `terminal` with print/debugger |
| "API A returns field F" | `web_extract` on API docs |
| "Database table T has column C" | `terminal` with schema query |
| "Commit C changed file F" | `terminal` with git show/diff |

## Anchor store (optional, long sessions)

Persist verified claims to `anchors.jsonl` for cross-session consistency:

```json
{"id": "a1", "claim": "Starlette Router.__init__ overwrites on_startup", "source": "starlette/routing.py:234", "verified": true, "confidence": "certain"}
```

On new claims, check the store first: a contradicting anchor halts the reasoning until resolved. This prevents accumulating contradictions across turns. (No bundled script — manage the file directly.)

## Pitfalls

- **Analysis paralysis** — verifying every claim is expensive; use the confidence label to focus on UNCERTAIN+ only
- **Circular dependencies** — claim A depends on B, B on A; break the cycle with an external verification point
- **False certainty** — a claim "verified" by reading the wrong file or misinterpreting output; always quote the evidence
- **Graph bloat** — compress resolved all-CERTAIN branches into single summary claims
- **Over-abstention** — if everything is UNCERTAIN the agent never acts; default to LIKELY when evidence is strong but not direct

## Research basis

- **CURE** (arXiv:2604.12046) — claim-aware reasoning with explicit per-claim confidence; up to 39.9% claim-level accuracy improvement; enables selective abstention
- **DCF** (arXiv:2604.20098) — dependency graphs for multi-step reasoning; joint validation with logical ancestors; 141% improvement in claim retention at maintained reliability
- **PRISM** (arXiv:2604.16909) — disentangles hallucinations into 4 dimensions; shows mitigation strategies trade off between dimensions

## Relationship to other skills

| Skill | What it catches | This skill adds |
|-------|----------------|-----------------|
| `faithfulness-aware-reasoning` | reasoning not following premises (type 3) | types 1, 2, 4: missing knowledge, wrong facts, instruction drift |
| `self-consistency` | multiple chains disagree | single-chain claim verification |
| `cot-pruning-reasoning` | redundant reasoning steps | falsifiable claims before pruning |

Best used together: claim-verification to make claims solid → faithfulness-aware to check entailment → cot-pruning to compress.
