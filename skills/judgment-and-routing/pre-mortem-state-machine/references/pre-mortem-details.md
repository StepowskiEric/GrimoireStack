# Pre-Mortem — Reference Details

## pre-mortem-report.md template

Create before plan adjustment; complete through the verdict.

```md
# Pre-Mortem Report

## Plan Summary
<the plan being validated, stated clearly>

## Failure Assumption
"It is [future date]. The plan was executed. It failed — clearly and materially. This report explains why."

## Failure Stories
1. <specific narrative: what went wrong and how>
2. <specific narrative>
3. <specific narrative>
4. <specific narrative>
5. <specific narrative>
(minimum 5; add more if warranted)

## Ranked Failure Stories
| Story # | Description | Likelihood | Severity | Detectable Early? |
|---------|-------------|-----------|----------|------------------|

## Top Risk Profiles
### Risk 1: <name>
- Failure story: <which story>
- Root condition: <what must be true for this to occur>
- Early warning signal: <what would indicate this is starting>
- Prevention: <plan change that reduces likelihood>
- Contingency: <what to do if it begins anyway>

### Risk 2: <name>
(repeat structure)

## Plan Adjustments
- <change to the plan>
- <monitoring or detection added>
- <explicit accepted tradeoff>

## Residual Risks
| Risk | Why Accepted | Owner | Review Trigger |
|------|-------------|-------|---------------|

## Pre-Mortem Verdict
<proceed / adjust and proceed / do not proceed — and brief rationale>
```

## Tool gating

### Generation phases (states 1–3)
- **Allowed:** read, inspect context, review the plan, artifact writing
- **Disallowed:** any execution of the plan being pre-mortemed

### Plan adjustment phase (state 5)
- **Allowed:** revise planning documents, architecture documents, checklists; add monitoring or alerting requirements
- **Disallowed:** executing the revised plan until the verdict is issued

## Failure modes this skill prevents

- Surface-level risk lists that do not change the plan
- Optimism bias in consensus-built plans
- Assuming dependencies will hold without verifying them
- Executing a plan without naming and accepting residual risks
- Pre-mortem theater (going through the motions without genuine generation)

## Definition of done

Correctly applied when:
- `pre-mortem-report.md` exists
- the failure assumption was stated explicitly and unhedged
- at least five specific narrative failure stories were generated
- stories were ranked by likelihood and severity
- top risks have full profiles: root condition, warning signal, prevention, contingency
- plan adjustments were made or risks were explicitly accepted
- a clear verdict was issued

## Pairing guide

- **Inversion State Machine** — use for abstract failure-mode analysis; use this for plan-specific narrative failure; complementary on high-stakes work
- **Checklist Manifesto** — after the pre-mortem, encode key risk checks into the execution procedure
- **Unsafe Control Actions** — after the pre-mortem, for timing- and sequencing-sensitive risks in detail
- **ETTO State Machine** — use ETTO to decide whether a full pre-mortem is warranted
