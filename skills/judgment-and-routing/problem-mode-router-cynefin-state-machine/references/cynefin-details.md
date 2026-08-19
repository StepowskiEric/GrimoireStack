# Problem-Mode Router (Cynefin) — Reference Details

## problem-mode-classification.md template

Create before any tool use or task execution.

```md
# Problem Mode Classification

## Task
<one-sentence description>

## Signals Observed
- <signal>
- <signal>

## Domain Candidates
- Obvious: <reasoning for / against>
- Complicated: <reasoning for / against>
- Complex: <reasoning for / against>
- Chaotic: <reasoning for / against>
- Disorder: <reasoning — applicable if classification is genuinely unclear>

## Classification Chosen
<Obvious / Complicated / Complex / Chaotic / Disorder>

## Justification
<why this domain was chosen over the alternatives>

## Misclassification Risk
<what goes wrong if this classification is wrong>

## Unjustified Obvious Check
<was Obvious selected? if yes: what specific evidence justifies it? if the evidence is thin, this must be escalated to Complicated>

## Response Style Unlocked
<sense-categorize-respond / sense-analyze-respond / probe-sense-respond / act-sense-respond>

## Skill Stack Recommended
- <skill>

## Reclassification Trigger
<what new signal would cause a domain reclassification>
```

## Domain → response → skills table

| Domain | Evidence | Response style | Skills |
|---|---|---|---|
| **Obvious** | cause/effect clear, stable, standard procedure applied many times in identical conditions | sense → categorize → respond | ETTO light, Checklist Manifesto, direct execution |
| **Complicated** | cause/effect exists but expert analysis needed; answer knowable through diagnosis | sense → analyze → respond | ETTO, How to Solve It, Pragmatic Programmer, domain-specific protocol |
| **Complex** | cause/effect only visible in retrospect; emergent behavior, interacting variables, novel elements | probe → sense → respond | ETTO, Explore vs. Exploit, Thinking in Systems, Toyota Kata (discovery mode) |
| **Chaotic** | no accessible stable cause/effect; active outage or crisis; containment first | act → sense → respond | Recognition-Primed Triage, ETTO high mode |
| **Disorder** | genuinely mixed signals that do not resolve | gather signal → classify | ETTO, light investigation tools |

## Tool gating

### Signal gathering and classification
- **Allowed:** read, inspect, search context
- **Disallowed:** execution of task steps; writes to the system being worked on

### Post-classification execution
- **Allowed:** only the tools appropriate to the selected response style
- **Disallowed:** analysis tools in Chaotic mode (contain first); execution tools before classification is complete

## Circuit breakers

Stop and escalate if:
- Obvious was selected without specific justification
- the same task keeps cycling through multiple domains without resolution
- classification was skipped and execution has already begun
- the classification does not change despite clearly different signals arriving

## Failure modes this skill prevents

- Using the wrong response style for the problem type
- Treating every unclear task as Complicated when it is actually Complex
- Treating urgent tasks as Chaotic when stabilization has not been tried
- Over-classification as Obvious to avoid analysis
- Applying Complicated best practices to an emergent Complex situation

## Definition of done

Correctly applied when:
- `problem-mode-classification.md` exists and was completed before execution
- all five domains were evaluated, not just the selected one
- the Obvious classification was challenged if selected
- the response style and skill stack were derived from the domain
- reclassification was monitored during execution

## Pairing guide

- **Problem-Mode Router (conceptual)** — the framework version applies Cynefin as a lens without the enforced gate; use it for a lighter touch
- **ETTO State Machine** — classify the domain with Cynefin, then calibrate rigor within it with ETTO
- **Recognition-Primed Triage** — the default skill for Chaotic classification
- **Explore vs. Exploit State Machine** — the default skill for Complex classification
