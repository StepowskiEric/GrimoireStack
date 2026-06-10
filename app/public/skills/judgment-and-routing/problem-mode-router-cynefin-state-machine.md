# Skill: Problem-Mode Router (Cynefin) — State Machine Protocol for AI Agents

## Purpose

Use this skill when the agent must determine what kind of problem it is facing before deciding how to respond — and when you want that classification to be an enforced gate rather than an optional lens.

This is the protocol version of the Problem-Mode Router.
The framework version (conceptual) applies the Cynefin model as a reasoning lens without enforcing the classification step.
This state machine version **gates all subsequent work** on a documented, explicit domain classification.

The agent cannot select a solving approach, invoke a sub-skill, or begin execution until the domain is declared and the classification is challenged for unjustified optimism.

Source: David Snowden's Cynefin Framework.

---

## Core Law

The worst response to a problem is the right response to the wrong kind of problem.

No task may proceed to execution until the domain is explicitly classified and unjustified "Obvious" classifications are challenged.

---

## Mandatory Diagnostic Artifact

Before any tool use or task execution, create `problem-mode-classification.md`.

Required structure:

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

---

## State Machine

## State 0 — Signal Gathering

Goal:
- collect enough signal to begin classification

Allowed actions:
- read context, gather available information, inspect the task as stated
- note what is known and what is unknown

Questions:
- What signals are present?
- What is known about this task?
- What is unknown?
- Is this a novel situation or a familiar one?

Disallowed:
- beginning to solve the problem
- invoking any sub-skill before classification is complete

Exit condition:
- signals are documented

---

## State 1 — Domain Classification

Goal:
- classify the task into one of the five Cynefin domains

The agent must evaluate all five domains, not just the one that seems right.

### Obvious
Cause and effect are clear, stable, and widely understood.
Best evidence: this is a standard procedure the agent has applied many times in identical conditions.
Warning: agents over-classify tasks as Obvious because it is fastest. Require explicit evidence.

### Complicated
Cause and effect exist, but expert analysis is needed to find the right answer.
Best evidence: the answer is knowable through analysis, but requires non-trivial diagnosis or domain expertise.
Appropriate for most non-trivial technical tasks.

### Complex
Cause and effect are only visible in retrospect. The situation cannot be fully analyzed in advance.
Best evidence: the situation has emergent behavior, multiple interacting variables, or novel elements where probes teach more than upfront analysis.

### Chaotic
No stable cause-effect relationship is accessible. Immediate action is required to restore order.
Best evidence: active outage, breakdown, or operational crisis where the first priority is containment.
Warning: agents must not confuse urgency with chaos.

### Disorder
It is not clear which domain applies.
Best evidence: genuinely mixed signals that do not resolve to any single domain.
Response: gather more signal or decompose the problem.

Unjustified Obvious Check (mandatory):
If the agent selected Obvious, it must state specific evidence.
"It seems routine" is not evidence.
If the evidence for Obvious is thin, reclassify to Complicated.

Exit condition:
- domain is selected and documented in `problem-mode-classification.md`
- unjustified Obvious check is completed

---

## State 2 — Challenge and Confirm

Goal:
- stress-test the classification against the strongest alternative before locking it in

For the selected domain, ask:
- What would have to be true for this to actually be in a different domain?
- What signals are being ignored or weighted too lightly?
- What is the cost if this domain is wrong?

Mandatory challenge:
- if Obvious was selected: what makes this genuinely routine vs. merely familiar?
- if Complicated was selected: is there emergent behavior that suggests Complex?
- if Complex was selected: is there enough stability for expert analysis to work (suggesting Complicated)?
- if Chaotic was selected: has stabilization actually failed, or just not been tried yet?

Exit condition:
- classification survives challenge or is revised
- misclassification risk is documented

---

## State 3 — Response Style and Skill Selection

Goal:
- unlock the correct response style and skill stack based on the domain

Domain → Response style:

**Obvious**:
Response: sense → categorize → respond
Appropriate skills: ETTO light, Checklist Manifesto, direct execution

**Complicated**:
Response: sense → analyze → respond
Appropriate skills: ETTO, How to Solve It, Pragmatic Programmer, Philosophy of Software Design, domain-specific protocol

**Complex**:
Response: probe → sense → respond
Appropriate skills: ETTO, Explore vs. Exploit, Thinking in Systems, Toyota Kata (discovery mode)

**Chaotic**:
Response: act → sense → respond
Appropriate skills: Recognition-Primed Triage, ETTO high mode, containment first
Note: reclassify out of Chaotic as soon as order is partially restored

**Disorder**:
Response: gather signal → classify
Appropriate skills: ETTO, light investigation tools
Do not escalate to full analysis or action until classification resolves

Exit condition:
- response style is documented
- skill stack is selected and documented

---

## State 4 — Reclassification Monitoring

Goal:
- monitor for signals that require domain reclassification during execution

The domain can change:
- a Complicated task that reveals emergent behavior should be reclassified to Complex
- a Chaotic situation that is partially stabilized should be reclassified
- an Obvious task that reveals unexpected coupling should be reclassified to Complicated

Mandatory rule:
If a reclassification trigger is observed during execution, stop, update `problem-mode-classification.md`, and select the new response style before continuing.

---

## State 5 — Stop / Escalate

Stop when:
- the task is complete under the selected domain's response style
- the domain resolved from Disorder to a classifiable domain and the appropriate skill has been invoked

Escalate when:
- the domain cannot be classified with available signal
- classification keeps changing without resolution
- the task requires a domain classification that the agent does not have authority to act in (e.g., Chaotic situations requiring immediate human decision authority)

---

## Tool Gating

### Signal gathering and classification
Allowed:
- read, inspect, search context

Disallowed:
- execution of task steps
- writes to the system being worked on

### Post-classification execution
Allowed:
- only the tools appropriate to the selected response style

Disallowed:
- analysis tools in Chaotic mode (contain first)
- execution tools before classification is complete

---

## Circuit Breakers

Stop and escalate if:
- Obvious was selected without specific justification
- the same task keeps cycling through multiple domains without resolution
- classification was skipped and execution has already begun
- the classification does not change despite clearly different signals arriving

---

## Failure Modes This Skill Prevents

- using the wrong response style for the problem type
- treating every unclear task as Complicated when it is actually Complex
- treating urgent tasks as Chaotic when stabilization has not been tried
- over-classification as Obvious to avoid analysis
- applying Complicated best practices to an emergent Complex situation

---

## Definition of Done

This skill was correctly applied when:
- `problem-mode-classification.md` exists and was completed before execution
- all five domains were evaluated, not just the selected one
- the Obvious classification was challenged if selected
- the response style and skill stack were derived from the domain
- reclassification was monitored during execution

---

## Pairing Guide

- **Problem-Mode Router (conceptual)** — the framework version applies Cynefin as a reasoning lens without enforcing the gate; use the conceptual version when a lighter touch is appropriate
- **ETTO State Machine** — use Cynefin to classify the domain, then use ETTO to calibrate rigor within the selected domain
- **Recognition-Primed Triage** — the default skill for Chaotic domain classification
- **Explore vs. Exploit State Machine** — the default skill for Complex domain classification

---

## Final Instruction

Classify before acting.
Challenge the classification.
Let the domain determine the response style.
Reclassify when the signals change.
