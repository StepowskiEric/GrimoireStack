# Escalation Level Decision Tree

```
START: Am I stuck?
│
├─ NO → Continue current approach
│
└─ YES → Level 0: Self-Correction (5 min max)
    │
    ├─ Re-read error verbatim → new insight?
    │   └─ YES → Continue debugging
    │   └─ NO → Check environment healthy?
    │       └─ NO → Run environment-recovery
    │       └─ YES → Check assumptions list
    │
    ├─ Still stuck? → Level 1: Strategy Change (10 min max)
    │   │
    │   ├─ Switch debugging skill
    │   ├─ Create minimal reproduction test
    │   ├─ Change information source
    │   └─ Generate 3-5 competing hypotheses
    │
    ├─ Still stuck? → Level 2: Rubber Duck Protocol (10 min max)
    │   │
    │   ├─ Write structured debugging journal
    │   ├─ Re-read journal yourself
    │   ├─ Present "Blocked On" to user
    │   └─ Receive user input → new direction?
    │       └─ YES → Back to Level 1 with new info
    │       └─ NO → Next level
    │
    ├─ Still stuck? → Level 3: Scope Reduction (15 min max)
    │   │
    │   ├─ Test most basic assumption (is code even running?)
    │   ├─ Binary search the problem space
    │   ├─ Try completely different approach
    │   └─ Check if dependency bug
    │
    └─ Still stuck? → Level 4: Full Retreat
        │
        ├─ Write handoff document (use summarize skill)
        ├─ Revert incomplete changes
        ├─ Add failing test if possible
        └─ Report to user with next steps
```

## Common Stuck Patterns and Quick Escalation

| Pattern | Quick Escalation |
|---------|-----------------|
| Same error after 2 patches | Level 1 immediately — strategy is wrong |
| "Maybe if I try this small change..." | Level 0 step 5 — write down assumptions first |
| Re-reading the same file 3+ times | Level 1 — switch from code reading to code running |
| Context window > 50% on debugging | Level 2 — externalize reasoning |
| 3+ hypothesis cycles in specter without convergence | Level 2 — need new information source |
| "Let me just add a try-catch..." | Level 0 step 2 — symptom masking, not root cause fix |
| Agent keeps modifying test expectations | Stop immediately — the test is right, the code is wrong |