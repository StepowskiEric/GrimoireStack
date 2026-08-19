---
name: unsafe-control-actions-hazard-analysis
description: "Analyze how a control action could become unsafe before recommending or performing it."
triggers:
  - high-consequence-action
  - irreversible-damage-risk
  - hazard-analysis-before-acting
---

# Unsafe Control Actions / Hazard Analysis

**The danger is rarely the action itself — it is whether, when, and how the action is applied.** How could this control action become unsafe? Not giving it when needed, giving it when it should not be given, giving it too early or too late, in the wrong order, for too long, or stopping it too soon. Before any consequential action, map the losses, hazards, unsafe control actions, and the safeguards that make it safe.

## When to Use
- Risky automations, infra or production changes, migrations
- Database or data-mutation actions
- Permission/security-sensitive operations, rollout decisions
- Tool actions that change external state
- Any task where "do the thing" is not enough and timing/sequence matters

Skip it: trivial low-risk tasks, brainstorming, ideation with no consequential action.

## The Move

### 1. Name the losses first
What unacceptable outcomes must be avoided? Data loss, outage, privilege escalation, corruption, customer harm, financial loss, broken authentication, destructive irreversible state. Concrete losses — not vague "risks" — anchor everything that follows.

### 2. Map the hazards
What unsafe system states could lead to those losses? Hazards are states, not adjectives: "database is inconsistent" not "risk of issues."

### 3. Define the control action
The exact action being recommended, triggered, or withheld. An analysis of a vague action produces vague safeguards.

### 4. Analyze the unsafe control actions
For the action, ask the four questions:
- **Not given** — what if it is withheld when needed?
- **Given** — what if it fires when it should not?
- **Timing/order** — what if it happens too early, too late, or out of sequence?
- **Duration** — what if it is applied too long or stopped too soon?

### 5. Define constraints and safeguards
**Safety constraints** — what must always or never happen. **Safeguards** — the gating checks, monitoring, rollback, containment, and recovery that must exist before the action is allowed. Treat weak feedback signals as a real risk factor — irreversible action with weak feedback is the classic unsafe control.

## Reference
For the hazard-analysis template, the AI-agent-specific hazard catalog (prompt injection, tool misuse, credential exposure, delegation risks), and the full worked example on a production deployment, see [`references/ai-agent-hazards.md`](references/ai-agent-hazards.md) and [`references/worked-example.md`](references/worked-example.md).

## Rules
- **Do** name the concrete losses before analyzing the action.
- **Do** analyze omission, commission, timing, sequencing, and duration — happy-path analysis is not hazard analysis.
- **Do** define gating conditions before action and rollback/containment for serious actions.
- **Do** refuse to recommend irreversible action without a safeguard story.
- **Do** treat "probably fine" as inadequate for high-loss tasks.
