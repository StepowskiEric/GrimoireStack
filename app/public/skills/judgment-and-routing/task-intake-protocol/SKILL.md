---
name: Task Intake Protocol
description: Universal preflight gate combining Cynefin problem classification, ETTO rigor calibration, and Recognition-Primed Triage into a single 3-phase decision. Classify the problem, set the evidence bar, take the first action.
...



---

## Task Intake Protocol

A fused 3-phase gate for task intake. Run this before any non-trivial task to classify, calibrate, and commit.

Instead of loading 3 separate skills (Cynefin + ETTO + Recognition-Primed Triage), this protocol combines them into one sequential pipeline that eliminates gaps between classification, rigor-setting, and first action.

### Phase 1: CLASSIFY (Cynefin)

Determine which domain the problem falls into:

| Domain | Signal | Response Style |
|--------|--------|----------------|
| **Obvious** | Known cause-effect, best practice exists | Apply the practice. No analysis needed. |
| **Complicated** | Known cause-effect but requires expertise | Analyze, then apply expert method. |
| **Complex** | Cause-effect only clear in retrospect | Probe → Sense → Respond. Experiment first. |
| **Chaotic** | No cause-effect visible, urgent | Act → Sense → Respond. Stabilize first. |

**Gate:** State the domain explicitly. If you cannot, default to Complex.

### Phase 2: CALIBRATE (ETTO)

Set the rigor level based on domain and stakes:

| Factor | Low Rigor | High Rigor |
|--------|-----------|------------|
| Reversibility | Easy to undo | Hard/impossible to undo |
| Blast radius | Single file/function | Multiple modules/systems |
| Uncertainty | Well-understood | Novel/ambiguous |
| Evidence available | Sufficient | Missing or conflicting |

**Calibration output:**
- Evidence bar: what must be verified before acting?
- Tool budget: how many tool calls before escalating?
- Stop condition: when to pause and re-classify?

### Phase 3: COMMIT (Recognition-Primed Triage)

Take the first action based on domain:

1. **Pattern match** — does this situation resemble a known pattern?
2. **Mental simulate** — if I take action X, what happens? Walk through 2-3 steps mentally.
3. **First action** — take the most plausible strong move. Not the perfect move — the first defensible one.
4. **Reassess** — after the first action, does the situation match the classification? If not, re-enter Phase 1.

### Decision Record

After completing all 3 phases, record:

```
Domain: [obvious/complicated/complex/chaotic]
Rigor: [low/medium/high]
Evidence bar: [what must be verified]
First action: [what you'll do]
Stop condition: [when to pause]
```

### When to Use

- Before any non-trivial coding task
- At the start of a debugging session
- Before architecture decisions
- When receiving an ambiguous request

### Anti-Patterns

- Skipping Phase 1 and jumping straight to action (most common failure)
- Classifying everything as Obvious (indicates you aren't thinking)
- Setting high rigor for low-stakes work (wastes time)
- Setting low rigor for irreversible changes (causes damage)
