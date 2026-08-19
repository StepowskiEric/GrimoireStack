# How to Solve It — Templates & Breakers

## problem-frame.md template

```md
# Problem Frame

## Problem
<precise statement>

## Expected Behavior
<what should happen>

## Observed Behavior
<what does happen>

## Known Facts
- <fact>

## Unknowns
- <unknown>

## Constraints
- <constraint>

## Candidate Hypotheses
- <hypothesis>

## Cheapest Evidence-Rich Next Steps
- <step>
```

## evidence-log.md template

```md
# Evidence Log

- grep/find/search: <what was searched>
- tests/run: <what was run>
- files inspected: <which files>
- result summary: <what was learned>
```

## Tool gating

### Recon phase
- **Allowed:** grep/find/search/read/run_tests/list; diagnostic artifact writing only
- **Disallowed:** repo modifications

### Execution phase
- **Allowed:** bounded edits only after the evidence gate

## Unknowns rule

If the problem touches a shared interface or utility, add: known consumers, unknown consumers, search method used, blast-radius confidence. If consumers cannot be identified, declare the blast radius unknown.

## Circuit breakers

Stop and reassess if:
- recon never produced new information
- hypotheses keep multiplying without narrowing
- the task becomes broader than the original problem frame
- a shared/public surface is about to change without blast-radius knowledge

## Failure modes

- **Premature coding** — acting before understanding the problem
- **First-answer lock-in** — committing to the first hypothesis without evidence
- **Skipping recon** — gathering evidence after writing code instead of before
- **No reflection** — closing a task without learning from what happened

## Definition of done

Correctly applied when:
- `problem-frame.md` exists
- `evidence-log.md` shows real evidence gathering
- the first phase stayed read-only
- action followed evidence rather than impatience
- the agent reflected before closure
