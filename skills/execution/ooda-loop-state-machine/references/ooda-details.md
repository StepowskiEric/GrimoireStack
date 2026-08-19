# OODA Loop — Reference Details

## ooda-cycle-log.md template

Create before the first action; update every cycle.

```md
# OODA Cycle Log

## Task / Mission
<one-sentence description>

## Cycle Number
<iteration count>

## Observe
- Raw signals observed:
  - <signal>
- Gaps or missing data:
  - <gap>

## Orient
- Prior mental model:
  - <what was believed before>
- Model update:
  - <what changed>
- Active hypotheses:
  - <hypothesis>
- Mismatches with prior model:
  - <mismatch>

## Decide
- Options considered:
  - <option>
- Selected action:
  - <action>
- Why this action fits the oriented picture:
  - <reason>

## Act
- Executed action (bounded scope):
  - <action taken>
- Time-box or scope limit:
  - <limit>

## Re-observe (loop trigger)
- Environment changed how:
  - <change>
- Next cycle warranted: yes / no
- Stop condition met: yes / no
```

## Tool gating per phase

### Observe
- **Allowed:** read, search, inspect, fetch logs, gather metrics, check state
- **Disallowed:** write operations, irreversible state changes

### Orient
- **Allowed:** artifact writing (update `ooda-cycle-log.md`), additional light reads to close gaps
- **Disallowed:** broad writes, actions that change external state

### Act
- **Allowed:** only the scoped action selected in Decide
- **Disallowed:** expansion beyond the decided scope; cleanup or optimization not tied to the decided action

## Failure modes

- **Reacting without observing:** acting on a stale mental model
- **Observing without orienting:** confusing data with understanding
- **Orienting without deciding:** analysis paralysis
- **Deciding without acting:** plan without execution
- **Acting without looping:** one-shot response when the situation keeps moving
- **Looping without learning:** identical cycles with no model update

## Definition of done

This skill is correctly applied when:
- `ooda-cycle-log.md` exists and was updated each cycle
- Observations were recorded before interpretation
- Orientation was updated, not just carried forward
- Decisions were bounded and action-scoped
- The loop was closed: re-observation happened after action
- The agent stopped when the mission was met or the situation required a different skill

## Pairing guide

- **Recognition-Primed Triage** — use for the initial Decide when pattern recognition dominates
- **Unsafe Control Actions** — use before Act when the selected action has high consequence
- **Cynefin** — use to determine whether OODA is the right skill at all (chaotic or rapidly-complex domains)
- **Thinking in Systems** — use when orientation repeatedly fails due to feedback loops or delays
