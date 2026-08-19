# Pragmatic Programmer — Brief, Depth Lens & Breakers

## pragmatic-run-brief.md template

Create before meaningful execution.

```md
# Pragmatic Run Brief

## Task
<goal>

## Real Problem
<what is actually wrong or needed>

## Smallest Correct Move
<bounded move>

## Reversibility
<easy / partial / hard>

## Shared Surfaces Potentially Affected
- <surface>

## Consumer Discovery Method
<global search method>

## Known Consumers
- <consumer>

## Unknown Consumers
- <unknown>

## Blast Radius Confidence
<high / medium / low>

## Automation Opportunity
<what could be scripted, linted, or enforced>

## Stop Condition
<when to stop>
```

## The module-depth lens (Ousterhout)

A *deep module* hides complexity behind a simple interface; a *shallow* module is mostly wrapper with little to hide.

Questions before choosing a boundary:
- What caller complexity disappears once this boundary exists?
- What implementation details become internal?
- Does the interface get simpler than the implementation?
- Are we reducing *change amplification* — the number of places that must change for one conceptual change?

Reject the boundary if any of these are true:
- It is shallower than the current code (no complexity hidden, just renamed)
- It introduces an interface with a single implementation and no architectural need
- Wrappers exist purely to enable extraction
- The extracted module depends heavily on the original's internals
- Change amplification stays the same or grows

Pick the boundary that hides the most complexity behind the simplest interface. If two boundaries are close, the deeper one wins.

## Tool gating

### Consumer discovery phase
- **Allowed:** read/search/list/map; artifact writing
- **Disallowed:** editing shared surfaces

### Execution phase
- **Allowed:** bounded edits only after blast-radius handling

## Circuit breakers

Stop and reassess if:
- about to change a shared surface with low blast-radius confidence
- a second major objective appears
- "improving things" without evidence it serves the main goal
- the task drifts from pragmatic fix into speculative redesign

## Definition of done

Correctly applied when:
- `pragmatic-run-brief.md` exists
- shared consumers were searched before shared changes
- unknowns were declared honestly
- the smallest correct move was chosen
- automation opportunities were identified
- the agent stopped after solving the real problem
