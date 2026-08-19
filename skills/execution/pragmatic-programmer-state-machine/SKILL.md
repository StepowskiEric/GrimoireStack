---
name: pragmatic-programmer-state-machine
description: "Bounded changes, reversible choices, automation over repeated toil, root-cause fixes over symptom patches."
triggers:
  - bounded-change-discipline
  - shared-surface-modification
  - automation-opportunity
  - root-cause-over-symptom
---

# The Pragmatic Programmer

**Be practical, bounded, and honest about blast radius.** Work in a real system the way a pragmatic engineer does: name the real problem, make the smallest correct move, choose reversible options, automate recurring toil, fix root causes instead of symptoms — and never touch a shared surface before finding its consumers.

## The Move

### 1. Frame — the real problem, not the ticket
State what is actually wrong or needed, then the **smallest correct move** that solves it. If you cannot state the real problem, you cannot bound the fix.

### 2. Consumer discovery — bound the blast radius
Before modifying any public interface, shared utility, common workflow, schema, or reused contract: run a global search and list consumers. Inspect call sites and map dependencies. If discovery is incomplete, declare the unknown consumers honestly and lower blast-radius confidence — then narrow scope if needed. Editing shared surfaces before the consumer scan is the violation this skill exists to prevent.

### 3. Choose the move — smallest, reversible, root-cause
Prefer reversible changes, local improvements with system awareness, automation of recurring toil, and root-cause fixes. Avoid speculative framework-building, giant rewrites, and "nice cleanup" outside the core need. When designing a module or interface, apply the depth lens (in Reference): hide the most complexity behind the simplest interface; reject boundaries that are shallower than current code, have a single implementation with no architectural need, or leave change amplification unchanged. **One session, one primary smell family** — do not chase a second structural problem while resolving the first.

### 4. Execute — bounded
Act within the chosen move. Do not open a second major objective; opportunistic cleanup only inside touched scope. When a repeated manual step appears, note it as an automation opportunity rather than doing it by hand again.

### 5. Validate & stop
Verify the move solved the real problem and shared consumers stayed safe. Ask what recurring toil should now become process/tooling — script, lint, template, or CI guardrail. Stop when the smallest correct move is complete, validation passes, and no new essential evidence expands the problem. Escalate when blast radius is unknown on a risky shared surface, consumer discovery failed, or the "small move" became a multi-system migration.

## Reference
For the `pragmatic-run-brief.md` template, the module-depth lens in full, tool gating, and circuit breakers, see [`references/pragmatic-details.md`](references/pragmatic-details.md).

## Rules
- **Do** search for consumers before touching any shared surface.
- **Do** declare unknown consumers — a guessed blast radius is a lie about risk.
- **Do** choose the smallest reversible move that fixes the root cause.
- **Do** record automation opportunities for repeated manual steps.
- **Do** stop after solving the real problem — the second objective is the next session.
