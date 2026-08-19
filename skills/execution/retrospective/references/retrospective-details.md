# Retrospective — Reference Details

## Retrospective Types

### Incident Post-Mortem

Focus: What happened during the incident, why, and how to prevent recurrence.

Key sections:
- Timeline of events
- Impact assessment
- Root cause analysis
- What worked well in the response
- What didn't work in the response
- Action items to prevent recurrence
- Action items to improve detection and response

Tone: Blameless. The question is never "who caused this?" It is "what system, process, or gap allowed this to happen?"

### Project / Feature Retro

Focus: How did the project go? What can we improve for next time?

Key sections:
- Goals vs outcomes (were the goals met? How do we know?)
- What went well (reinforce these patterns)
- What could be better (fix these for next time)
- Surprises (unexpected positives and negatives)
- Process improvements (planning, communication, execution)
- Action items

### Personal Retro

Focus: Individual learning. What did I (the agent) learn from this session or task?

Key sections:
- What was the task and outcome?
- What approaches worked well?
- What approaches did not work?
- What would I do differently next time?
- What patterns should I remember?

### Decision Outcome Review

Focus: Did a past decision produce the expected results?

Key sections:
- Decision made (when, by whom, with what rationale)
- Expected outcomes (what was predicted)
- Actual outcomes (what happened)
- Gap analysis (where did reality diverge from expectations?)
- What was learned about the assumptions that were made?
- How should this update future decisions?

---

---

## Retrospective Template

```md

---

## The Five Whys in Detail

The Five Whys is the core root cause technique in a retrospective.

**How it works**: Start with a problem and ask "why?" repeatedly until you reach a systemic cause (a process, policy, or design issue) rather than a surface cause (a person, a one-time mistake, "lack of attention").

### Example 1: Incident

| Level | Question | Answer |
|-------|----------|--------|
| Problem | Site was down for 30 minutes. | |
| Why? | A bad config was deployed. | |
| Why? | The config change went through without review. | |
| Why? | The deploy pipeline doesn't require review for config changes. | |
| Why? | Config was classified as low-risk and excluded from the review gate. | ✅ **Systemic cause** — process gap in deploy pipeline |

Stop here. The fix is not "review config more carefully" — it's "add config changes to the review gate in the deploy pipeline."

### Example 2: Missed Deadline

| Level | Question | Answer |
|-------|----------|--------|
| Problem | Feature shipped two weeks late. | |
| Why? | The database migration took much longer than estimated. | |
| Why? | We discovered mid-sprint that the schema change required a data backfill for 1M existing records. | |
| Why? | The data model change was planned without checking how it would affect existing records. | |
| Why? | The design review template doesn't include a "backward compatibility and migration" section. | ✅ **Systemic cause** — missing design review step |

### When to Stop

Stop when the answer is:
- A process that can be changed
- A policy that can be updated
- A tool that can be improved
- A check that can be added or automated

Do not stop when the answer is:
- A person ("they should have been more careful")
- A generality ("we need better communication")
- A tautology ("it failed because the code had a bug")

---

---

## Failure Modes This Skill Prevents

### 1) Blame culture
The retrospective becomes a search for who to blame rather than what to fix.

Counter: strict blameless framing. Every "who" question is rewritten as "what allowed this?"

### 2) Surface-level analysis
The retro identifies symptoms ("the deployment failed") but not root causes ("no rollback test before deploy").

Counter: Five Whys until a systemic cause is reached.

### 3) Success blindness
When things go well, teams skip the retro or rush through it. This misses accumulating bad practices that only become visible when they compound into a failure.

Counter: always do the retro, even — especially — when things went well.

### 4) Action item decay
Action items are created but never tracked or completed.

Counter: assign owners, set deadlines, schedule follow-up.

### 5) False consensus
The retro is done by one person who assumes they know what everyone else experienced.

Counter: involve all relevant perspectives. The agent should flag when their view is incomplete and note assumptions.

### 6) Forgetting
Lessons from one retro are not applied to the next project.

Counter: before starting a new initiative, review the last retrospective's action items. Are those improvements still in place?

---

---

