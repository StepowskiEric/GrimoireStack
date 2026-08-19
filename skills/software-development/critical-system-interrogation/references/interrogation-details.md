# Critical System Interrogation — Standards, Bar & Checklist

## The 8 non-negotiable standards

1. **Be ambitious about structural simplification.** Do not stop at "could be cleaner." Reframe so whole branches, helpers, modes, conditionals, or layers disappear. Prefer the solution that feels inevitable in hindsight. If a path deletes complexity rather than rearranges it, push hard for it.
2. **No component past 1K lines without a very strong reason.** Treat it as a strong smell by default; prefer extraction. If a diff crosses the threshold, ask whether the code should be decomposed first.
3. **No random spaghetti growth.** Be highly suspicious of new ad-hoc conditionals and one-off branches in unrelated flows — that is a design problem, not a stylistic nit. Push logic into a dedicated abstraction, state machine, policy object, or module.
4. **Bias toward cleaning the design.** If behavior can stay the same while structure becomes meaningfully cleaner, push for the cleaner version. Prefer removing moving pieces over refactors that spread the same complexity around.
5. **Prefer direct, boring, maintainable code.** Treat brittle, ad-hoc, "magic" behavior as a code-quality problem. Be skeptical of generic mechanisms hiding simple data-shape assumptions. Flag thin abstractions, identity wrappers, pass-through helpers.
6. **Push hard on type and boundary cleanliness.** Question unnecessary optionality, `unknown`, `any`, cast-heavy code. Prefer explicit typed models over loosely-shaped objects. Silent fallback papering over an unclear invariant means the boundary should be explicit.
7. **Keep logic in the canonical layer.** Call out feature logic leaking into shared paths and implementation details leaking through APIs. Reuse existing canonical helpers over bespoke one-offs.
8. **Treat unnecessary sequential orchestration and non-atomic updates as smells.** Independent work serialized for no reason → parallel. Related updates that can leave state half-applied → atomic. Flag avoidable orchestration complexity that makes the implementation brittle.

## Approval bar

Do not approve merely because behavior seems correct. The bar:
- no critical security vulnerabilities
- no race conditions that can cause data corruption
- no logic errors in the critical path
- no missing validation that allows invalid state
- no clear structural regression
- no obvious missed opportunity for dramatic simplification when such a path is visible
- no unjustified file-size explosion
- no spaghetti growth from special-case branching
- no hacky or magical abstraction that makes code harder to reason about
- no unnecessary wrapper/cast/optionality churn obscuring the real design
- no architecture-boundary leak or avoidable canonical-helper duplication
- no missed opportunity for an obvious decomposition that materially improves maintainability

**Presumptive blockers** (author must justify): preserving incidental complexity when a plausible code-judo move would delete it; pushing a file past 1000 lines; adding ad-hoc branching that tangles an existing flow; scattering feature checks across shared code; adding an unnecessary abstraction or cast-heavy contract; duplicating an existing helper or putting logic in the wrong layer when a clear canonical home exists.

## Verification checklist

- [ ] Authentication checks at all entry points
- [ ] Authorization verified before data access
- [ ] Input validation complete and consistent
- [ ] Error handling covers all failure modes
- [ ] Race conditions identified and mitigated
- [ ] Sensitive data properly protected
- [ ] State transitions are complete and atomic
- [ ] External system failures handled gracefully

## Review-tone phrasebook

- "This creates a race condition between X and Y. Can we make this atomic?"
- "This authentication check is missing at entry point Z. This is a security vulnerability."
- "This entire error handling branch could be eliminated by..."
- "This logic is leaking across layer boundaries. Can we isolate it?"
- "This abstraction seems unnecessary. Can we just keep the direct flow?"
- "Why does this need a cast / optional here? Can we make the boundary more explicit instead?"
- "This looks like a bespoke helper for something we already have elsewhere. Can we reuse the canonical one?"
- "I think there's a code-judo move here that makes this much simpler. Can we reframe this so these branches disappear?"
- "This refactor moves complexity around, but doesn't really delete it. Is there a way to make the model itself simpler?"

Tone: direct, serious, demanding about quality — not rude, but never softening major maintainability issues into mild suggestions.
