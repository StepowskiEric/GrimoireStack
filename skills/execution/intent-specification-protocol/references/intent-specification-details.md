# Intent Specification — Failure Modes

- **Skipping Constrain** — without invariants you cannot detect over-engineering. The #1 source of bloated changes.
- **Specifying too much** — more than 5 scenarios for one change means the change should be decomposed first.
- **Specifying too little** — one scenario is never enough. Minimum: happy path + edge case + invariant check.
- **Spec drift during repair** — if the fix doesn't match the spec, the spec might be wrong. Return to Formalize, not to "what the user meant."
- **Gate bypass** — convincing yourself the spec is clear when you can't write concrete expected outputs. A fuzzy Then means AMBIGUOUS.
- **Feature creep in Execute** — adding "while I'm here" features violates the contract. The spec defines the scope.
