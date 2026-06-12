---
name: "retrospective"
description: "Use this skill after an incident, shipped feature, completed project, or any significant outcome to systematically learn from what happened. The natural counterpart to pre-mortem: before execution you imagine failure; after execution you examine the real outcome."
---

# Skill: Retrospective — After-Action Learning from Real Outcomes

## Purpose

Use this skill after an incident, shipped feature, completed project, or any significant outcome to systematically learn from what happened.

A retrospective (or post-mortem) is the real-data counterpart to the pre-mortem:
- **Pre-mortem**: Before execution, imagine it failed — work backward to prevent it.
- **Retrospective**: After execution, examine what actually happened — learn from it.

Where the pre-mortem asks "what could go wrong?", the retrospective asks "what did go wrong (and right), why, and what should we change?"

---

## Core Principle

**You cannot improve what you do not examine.**

Every significant outcome — success or failure — contains signal. A successful project may have hidden bad practices that will bite later. A failed incident reveals process gaps that can be closed.

The retrospective captures that signal and converts it into action:
- **What happened** (facts, not blame)
- **What went well** (patterns to keep)
- **What went wrong** (patterns to change)
- **Why it happened** (root cause, not symptoms)
- **What we will do differently** (actionable commitments)

---

## When to Use

Use this skill after:
- an **incident or outage** — production issue, downtime, data loss, security event
- a **shipped feature or release** — did it meet expectations? What did the launch surface?
- a **sprint or iteration** — agile retrospective; what improved, what degraded?
- a **project milestone** — meaningful checkpoint worth a learning pause
- a **decision outcome** — you made a decision weeks/months ago; does the actual outcome match the expected one?
- a **bug fix** — what allowed the bug to exist? What prevents its class?
- a **failed experiment** — what was learned even though the outcome was negative?
- a **session handoff** — what was accomplished, what's still open? (See also: `summarize` skill)

Do not use this skill for:
- trivial, routine events with no signal to extract
- situations where you lack data about what actually happened
- urgent firefighting (do the retro after the incident is resolved, not during)
- events you have no ability to change based on findings

---

## Standard Retrospective Workflow

### Step 1: Set the Stage
Define the scope of the retrospective:
- **What is being reviewed?** (specific incident, feature, sprint, project, decision)
- **Time period covered** (when did it start and end?)
- **Participants** (who was involved? Who has relevant perspective?)
- **What kind of retro is this?** (incident post-mortem, project retro, personal learning, etc.)
- **Goal** (what do we want to get out of this? Action items? Root causes? Patterns?)

### Step 2: Gather the Facts
Collect what actually happened. This is the data phase — no interpretation, no judgment, just facts.

For incidents:
- **Timeline**: When did things happen? What alerts fired? What actions were taken and when?
- **Impact**: What was affected? How many users? How much data? How long?
- **Detection**: How was the problem first noticed? By whom? How long between introduction and detection?
- **Resolution**: What fixed it? How long did the fix take? Was it a clean fix or a workaround?

For features/projects:
- **What was built**: What shipped, and what was the actual scope vs planned scope?
- **Metrics**: How did actual metrics compare to expected/projected metrics?
- **Timeline**: Planned vs actual timeline — where did it slip, where did it beat estimates?
- **Quality**: Bug counts, test coverage changes, performance numbers

### Step 3: What Went Well
Identify what worked. Do not skip this.

- What practices or processes contributed to positive outcomes?
- What decisions turned out better than expected?
- What would you do the same way again?
- What surprised you positively?

### Step 4: What Went Wrong / Could Be Better
Identify problems, gaps, and improvement areas.

- What went wrong or did not meet expectations?
- What was frustrating, slow, or unclear?
- What would you do differently if you could go back?
- What near-misses occurred (things that almost went wrong)?

### Step 5: Root Cause Analysis
For each problem, go deeper than the surface.

Use the **Five Whys** technique:
> Problem: "The deployment took 4 hours."
> Why? "The database migration script timed out."
> Why? "The migration tried to rewrite a table with 50M rows."
> Why? "We didn't test the migration against production-scale data."
> Why? "Our staging environment has 1/100th the data volume."
> Why? "We never provisioned staging with production-scale data because of cost."

Stop when you reach a process, policy, or systemic issue that can be changed — not a person, not a one-time mistake.

### Step 6: Generate Action Items
For each root cause, create a concrete, owned action item.

Good action items:
- **Specific** — what exactly will be done
- **Owned** — who is responsible (a person or team, not "we")
- **Trackable** — how will we know it's done?
- **Timeline** — by when?

Example:
> ❌ "Improve testing." (vague, no owner, no timeline)
> ✅ "Add a load-testing step to the deploy pipeline that runs migrations against a 10M-row dataset. Owner: platform team. Deadline: next sprint."

### Step 7: Follow Up
Action items are worthless without follow-through.

- Record the action items somewhere persistent (not just the retro document)
- Set a follow-up date to check completion
- For critical items, link to a tracking system (issue tracker, task list, etc.)

---

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

## Retrospective Template

```md
## Retrospective: <Title>

### Type
<incident | project | feature | sprint | personal | decision-outcome>

### Scope
- What: <what is being reviewed>
- Period: <start date> → <end date>
- Participants: <who has relevant perspective>
- Goal: <what do we want to get out of this?>

---

## Facts

### Timeline
- <time>: <event>
- <time>: <event>
- <time>: <event>

### Key Facts
- <fact about the outcome>
- <fact about the context>

---

## What Went Well
- <positive outcome or practice>
- <positive outcome or practice>
- <positive outcome or practice>

---

## What Went Wrong / Could Be Better
| Problem | Severity | Root Cause (Five Whys) |
|---------|----------|----------------------|
| <problem> | High/Med/Low | <root cause> |
| <problem> | High/Med/Low | <root cause> |

---

## Action Items

| # | Action | Owner | Deadline | Status |
|---|--------|-------|----------|--------|
| 1 | <what> | <who> | <when> | Open |
| 2 | <what> | <who> | <when> | Open |
| 3 | <what> | <who> | <when> | Open |

---

## Key Learnings
- <what should be remembered from this retro>
- <what pattern or principle does this reinforce or challenge>
```

---

## Agent Rules

### Do
- focus on systems, processes, and circumstances — not people
- capture what went well, not just what went wrong
- use the Five Whys to reach root causes, not surface explanations
- produce specific, owned, trackable action items
- set a follow-up mechanism

### Do Not
- assign blame — the question is "what allowed this to happen?" not "who did this?"
- stop at surface causes (training, communication, "human error")
- let a good outcome prevent learning (successful projects still have improvement areas)
- produce vague action items with no owner or timeline
- skip the retrospective because the outcome was minor (small events accumulate)

---

## How Retrospective Differs from Pre-Mortem

| | Pre-Mortem | Retrospective |
|---|---|---|
| **Timing** | Before execution | After execution |
| **Data** | Hypothetical (imagined failure) | Real (observed outcome) |
| **Cognitive mode** | "It failed — why?" (prospective) | "It happened — what do we learn?" (retrospective) |
| **Output** | Failure stories → plan adjustments | Action items → process improvements |
| **Best for** | Risk prevention before commitment | Learning from actual results |
| **Source** | Gary Klein, naturalistic decision-making | Agile retrospectives, incident analysis |

**Use both for any significant initiative:**
1. Pre-mortem before execution → identify and prevent risks.
2. Execute.
3. Retrospective after execution → capture real learnings and improve.

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

## Pairing Guide

- **Pre-Mortem** — the natural counterpart. Use pre-mortem before execution to prevent failures; use retrospective after execution to learn from actual outcomes. Together they form a complete learning loop.
- **PDCA / Deming** — the retrospective is the "Check" and "Act" phases of PDCA. Use PDCA for the full improvement cycle, retrospective when you specifically need after-action review.
- **Toyota Kata** — the retrospective can serve as the "reflect" step in a kata improvement cycle. Use kata for ongoing process improvement, retrospective for discrete event review.
- **Decision Journal** — after a decision outcome review retrospective, log the learnings in a decision journal to build a personal or team decision history.
- **Root Cause Analysis** — use the root-cause-analysis skill for deep technical debugging; use retrospective for broader process and outcome review (which may include technical root causes).
- **Trajectory Guard** — trajectory guard detects failure spirals in real-time; retrospective analyzes them after they complete.

---

## Quick Start (Simplest Useful Form)

For a quick retrospective that takes 2 minutes and covers the essentials:

```
1. What happened? (one paragraph)
2. What went well? (bullets)
3. What went wrong? (bullets)
4. For each thing that went wrong: why? (Five Whys until systemic cause)
5. What will we change? (specific, owned action items)
```

This lightweight form is better than skipping the retro entirely.
Use the full template for significant incidents or project milestones.

---

## Definition of Done

A retrospective was applied correctly when:

- [ ] The scope and type were clearly defined
- [ ] Facts were gathered before interpretation began
- [ ] What went well was documented (not skipped)
- [ ] Problems were analyzed to root cause using Five Whys (or equivalent depth)
- [ ] Action items are specific, owned, and time-bound
- [ ] The tone is blameless — focused on systems and processes, not people
- [ ] A follow-up mechanism was set

---

## Final Instruction

The outcome is in the past. You cannot change it.

But you can change what happens next.

Look at what happened — honestly, without blame.
Find the signal.
Turn it into action.

That is the whole skill.
