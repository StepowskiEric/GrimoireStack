# Oracle Eye — The Great Eye as Centerpiece

Turn the "Skill Finder" modal into the main landing experience. The eye becomes the hero: users describe their problem in a textarea below it, the eye animates while consulting the AI oracle, and results appear as floating cards below.

## Context

- **Current state:** Skill Finder is a modal triggered from a sidebar button. The eye is decorative. The school grid is the default view.
- **Target state:** The eye + textarea + results is the default view. The school grid lives in the right panel and sidebar tab. No modal.
- **AI backend:** `app/functions/api/recommend.js` calls Granite 4.0 H Micro via Workers AI. Fallback to local `matchProblem` on failure.

## Slice Graph

```
1. useOracle hook ──→ 2. OracleInlinePanel ──→ 3. Eye wiring + layout ──→ 4. Full integration ──→ 5. Cleanup
       │                      │                        │
       └── tests              └── tests                 └── CSS + mobile
```

## Contracts

| Slice | Unlocks | Verifiable by |
|---|---|---|
| 1 | Oracle state machine independent of UI | `vitest run src/test/useOracle.test.js` |
| 2 | Inline oracle UI without modal wrapper | `vitest run src/test/oracleInlinePanel.test.jsx` |
| 3 | Eye animates on oracle state, stage scrolls | Visual + `data-oracle` attribute check |
| 4 | Full working oracle as default view | Manual QA + integration tests |
| 5 | Dead code removed, tests migrated | `vitest run`, grep for removed symbols |

## Known Unknowns

- Right panel content when oracle is active: **Decision: keep school grid visible by default.** The right panel stays as the library reference.
- Category chips in inline panel: **Decision: keep them.** They provide fast filtering.
- Mobile eye size: **Decision: existing mobile breakpoints handle this.** The eye shrinks to 340px on <1100px. Textarea and cards stack below.

## Next Agent Prompt

You are implementing the Oracle Eye feature. Start at `specs/oracle-eye/slices/01-use-oracle-hook.md` and work through each slice in order. Each slice file tells you exactly what to build, what tests to run, and what to verify before moving on. Update this README's "Next Agent Prompt" section when you finish a slice.

## Global TODO

- [ ] Slice 1: Extract `useOracle` hook with local fallback
- [ ] Slice 2: Create `OracleInlinePanel` component
- [ ] Slice 3: Wire eye state + make eye-stage scrollable
- [ ] Slice 4: Full layout integration, oracle as default
- [ ] Slice 5: Remove ProblemIntakeModal, clean up, migrate tests
