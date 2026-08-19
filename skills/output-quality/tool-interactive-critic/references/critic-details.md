# Tool-Interactive Critic — Template & Pairings

## Critique template

```md
## Initial Output Type
<answer / plan / code / recommendation / summary>

## Verification Targets
- <target>

## Tools Chosen
- <tool>: <why>

## Tool Findings
- <finding>

## Critique
- Verified:
- Contradicted:
- Weak / uncertain:
- Needs revision:

## Revised Output Changes
- <change>

## Remaining Uncertainty
- <uncertainty>
```

## Invocation examples

- **Factual answer:** "Use Tool-Interactive Critic. Draft the answer, verify the key claims with the right tools, critique the weak parts, then revise."
- **Code output:** "Use Tool-Interactive Critic. After proposing the change, validate it with tests/search/static checks and revise only where the evidence says the draft is weak."
- **Plan:** "Write the plan first, then use tools to challenge its assumptions before finalizing it."

## Good pairings

- **ETTO** — decide how much verification is warranted
- **Agentic Patterns Orchestrator** — insert as a post-generation verification phase
- **How to Solve It** — use after initial diagnosis or solution proposal
- **Unsafe Control Actions / Hazard Analysis** — verify safeguards and assumptions for risky actions

## Failure modes this skill prevents

- Confident but unverified answers
- "Looks right" code or plans with hidden factual flaws
- Hallucinated current details
- Revision without evidence
- Polishing the wording while leaving the substance untested
