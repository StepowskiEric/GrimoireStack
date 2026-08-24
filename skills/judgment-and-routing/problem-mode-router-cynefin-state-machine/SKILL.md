---
name: problem-mode-router-cynefin-state-machine
description: "Enforce Cynefin domain classification as a hard gate before any tool use or execution."
triggers:
  - cynefin-classification
  - response-style-selection
  - domain-gate
  - misclassification-risk
disable-model-invocation: true
---

# Problem-Mode Router (Cynefin)

**The worst response to a problem is the right response to the wrong kind of problem.** Before solving, classify the task into one of five domains and gate all execution on that classification — the agent cannot select an approach, invoke a sub-skill, or begin work until the domain is declared and challenged for unjustified optimism.

## The Move

### 1. Gather signal
Collect what is known and what is unknown about the task. Is this novel or familiar? Document signals without beginning to solve — no sub-skill invocation before classification.

### 2. Classify — evaluate all five domains
Assess every domain, not just the one that seems right:
- **Obvious** — cause/effect clear and stable, standard procedure applied many times in identical conditions. Warning: agents over-classify here because it is fastest — require explicit evidence; "it seems routine" is not evidence. Thin evidence → reclassify to Complicated.
- **Complicated** — cause/effect exists but needs expert analysis; the answer is knowable through diagnosis. Most non-trivial technical tasks.
- **Complex** — cause/effect visible only in retrospect; emergent behavior, interacting variables, probes teach more than upfront analysis.
- **Chaotic** — no accessible stable cause/effect, urgent; active outage or crisis where containment comes first. Urgency is not chaos — stabilization must actually have failed.
- **Disorder** — genuinely mixed signals; gather more signal or decompose the problem.

### 3. Challenge the classification
Stress-test against the strongest alternative: What would have to be true for this to be in a different domain? What signals are ignored or weighted too lightly? What is the cost if the domain is wrong? Mandatory challenges: Obvious → genuinely routine or merely familiar? Complicated → emergent behavior suggesting Complex? Complex → enough stability for expert analysis? Chaotic → has stabilization actually failed, or just not been tried?

### 4. Unlock response style & skill stack
Domain determines the response:
- **Obvious** → sense-categorize-respond; checklist/direct execution
- **Complicated** → sense-analyze-respond; How to Solve It, diagnostic skills
- **Complex** → probe-sense-respond; Explore-vs-Exploit, Toyota Kata discovery
- **Chaotic** → act-sense-respond; Recognition-Primed Triage, containment first
- **Disorder** → gather signal → classify; light investigation only

### 5. Monitor for reclassification
The domain can change mid-task: a Complicated task revealing emergent behavior → Complex; a Chaotic situation partially stabilized → reclassify; an Obvious task with unexpected coupling → Complicated. On any reclassification trigger, stop, update the classification artifact, and select the new response style before continuing.

## Reference
For the `problem-mode-classification.md` template, the full domain → response → skills table, tool gating, circuit breakers, and failure modes, see [`references/cynefin-details.md`](references/cynefin-details.md).

## Rules
- **Do** evaluate all five domains before selecting one.
- **Do** challenge every Obvious classification with specific evidence.
- **Do** let the domain determine the response style and skill stack.
- **Do** reclassify when signals change — the domain is not a one-time decision.
- **Do** contain first in Chaotic, then reclassify once order is partially restored.
