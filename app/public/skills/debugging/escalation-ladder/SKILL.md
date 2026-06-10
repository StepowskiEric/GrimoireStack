---
source: "jerry-skills"
name: escalation-ladder
description: "Structured protocol for when an agent is stuck — escalating from self-recovery to user collaboration to full retreat. Fills the gap between trajectory-guard (detects stuck) and summarize (bails out)."
triggers:
  - Agent has tried 3+ approaches without progress
  - trajectory-guard fires but agent doesn't know what to do next
  - Same error message appearing after multiple fix attempts
  - Context window growing without convergence
  - Agent finds itself re-reading the same files
  - Agent is generating patches that don't change the failure output
  - Agent has been debugging for 30+ minutes without a clear hypothesis
  - Multiple debugging skills attempted without resolution
---

# Escalation Ladder

**Biological analog:** A submarine emergency procedure — you don't surface immediately, you follow depth-based protocols at each level before deciding to go higher.

## The Problem This Solves

`trajectory-guard` detects you're stuck. `summarize` bails out entirely. But between "stuck" and "give up" there are productive middle steps that most agents skip — or waste time on approaches that don't escalate properly.

This skill provides a **5-level escalation ladder** where each level has specific actions, time budgets, and clear exit criteria.

---

## Level 0: Self-Correction (0-5 min, 3-5 tool calls)

**You detect you might be stuck.** Before escalating, try these self-corrections:

1. **Re-read the error message verbatim** — not your paraphrase, the actual error output. Copy-paste it.
2. **Check: am I fixing the symptom or the cause?** — If you've patched code without understanding why, revert and re-hypothesize.
3. **Check the environment** — Run `environment-recovery` Phase 1 vitals. Is the env actually healthy?
4. **Try the opposite approach** — If you've been adding code, try removing code. If you've been searching broadly, try a targeted probe.
5. **Check your assumptions** — Write down exactly what you believe is true. Which one is least supported by evidence?

**Exit criteria:**
- New evidence found → continue debugging with updated hypothesis
- No new evidence → escalate to Level 1

**Anti-pattern:** Re-running the same command hoping for different results. If you ran it once and it failed, running it again without changing something won't help.

---

## Level 1: Strategy Change (5-15 min, 5-10 tool calls)

**Self-correction didn't work.** Switch debugging strategy entirely.

1. **Switch debugging skill** — If using `debug-to-fix-pipeline`, switch to `specter`. If using `specter`, switch to `bisect-debugging` (if recent change). If using ad-hoc debugging, switch to a structured skill.
2. **Reduce scope to minimal reproduction** — Strip away everything unrelated to the bug. Create a minimal test case that demonstrates the issue.
3. **Change information source** — If you've been reading code, run the code. If you've been running code, read the code. If you've been looking at logs, look at the runtime state.
4. **Generate competing hypotheses** — Write down 3-5 possible root causes. Include at least one "weird" hypothesis that contradicts your current intuition.

**Minimal reproduction template:**

```
## Minimal Reproduction Attempt

Bug: [exact error message or behavior]

Hypothesis: [most likely root cause]

Step 1: Create minimal test that should PASS if bug is fixed
Step 2: Run it — confirm it FAILS (bug reproduced)
Step 3: If step 2 passes (test doesn't fail) → hypothesis is wrong, try next one
```

**Exit criteria:**
- Minimal reproduction found → continue debugging with narrow scope
- Can't reproduce → bug may be environmental (switch to `environment-recovery`)
- Still stuck after 15 minutes → escalate to Level 2

---

## Level 2: Rubber Duck Protocol (15-25 min, async)

**Strategy changes aren't working.** Time to externalize your reasoning and get a fresh perspective.

**Write a structured debugging journal** containing:

```markdown
## Debugging Journal — [bug description]

### What I've Tried
1. [Approach 1] → Result: [what happened]
2. [Approach 2] → Result: [what happened]
3. [Approach 3] → Result: [what happened]

### Current Hypothesis
[Your best guess at the root cause]

### Evidence For
- [evidence point 1]
- [evidence point 2]

### Evidence Against
- [what doesn't fit the hypothesis]

### What I Haven't Tried Yet
- [approaches I considered but haven't attempted]

### Blocked On
- [specific question or unknown that's preventing progress]
```

After writing this, **re-read it yourself**. Often the act of writing it reveals the answer.

If it doesn't: **present this to the user.** Ask specifically for help on "Blocked On" items. This is not giving up — it's productive collaboration.

**Exit criteria:**
- Writing the journal reveals the answer → continue debugging
- User provides a clue → continue with new information
- User doesn't know either → escalate to Level 3

---

## Level 3: Scope Reduction (25-40 min)

**Even with user input, the bug isn't resolving.** This is a scope problem — the bug is likely broader or different than you think.

1. **Test the most basic assumption** — Is the code you're editing even being executed? Add a console.log/assert at the entry point and confirm it fires.
2. **Binary search the problem space** — Comment out half the code. Does the bug still happen? Then it's in the other half. Bisect.
3. **Try a completely different path to the same goal** — If approach A isn't working, what's approach B that achieves the same outcome with different code?
4. **Consider: is this actually a bug in your dependencies or runtime?** — Check GitHub issues for the framework/library you're using.

**Decision:**
- If you can narrow the bug to a specific file/function → go back to Level 1 with narrow scope
- If you can narrow it to a dependency bug → document a workaround and report
- If you still can't narrow it → escalate to Level 4

---

## Level 4: Full Retreat (last resort)

**All escalation levels exhausted.** Time to stop debugging and deliver what you have.

1. **Write a complete handoff document** using `summarize` skill format:
   - Bug description (exact error, reproduction steps)
   - Everything you tried and results
   - Current best hypothesis and why you're not confident
   - Minimal reproduction (if found)
   - Next steps someone else should try
   
2. **Revert any incomplete changes** — Don't leave half-applied patches in the codebase. Either commit a working partial fix (with TODO) or revert entirely.

3. **Add a failing test** if possible — Even if you can't fix the bug, a failing test documents the expected behavior and prevents the bug from being silently "fixed" by accident.

4. **Report to the user** with:
   - What's broken
   - What you tried
   - Where you got stuck
   - What you think they should try next

---

## Time Budgets

| Level | Time | Tool Calls | Signal to Escalate |
|-------|------|-----------|-------------------|
| 0 | 0-5 min | 3-5 | No new evidence |
| 1 | 5-15 min | 5-10 | Strategy change didn't help |
| 2 | 15-25 min | async (writing) | Writing didn't reveal answer |
| 3 | 25-40 min | variable | Can't narrow scope |
| 4 | immediate | 1-2 | Deliver handoff |

**Maximum total debugging time before full retreat: ~40 minutes.**

After 40 minutes of active debugging without resolution, the cost of continuing exceeds the value of the information you're generating. Stop and hand off.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| Skipping Level 0 and going straight to user | Most "stuck" moments resolve with self-correction; asking too early wastes user time |
| Re-reading files instead of running code | If the bug was visible in code, you'd have found it; runtime state is what you need |
| Small variations on the same failed approach | If `console.log(x)` didn't show the bug, `console.log(JSON.stringify(x))` probably won't either — change strategy |
| Adding more code to work around the bug | Workarounds create technical debt; find the root cause or explicitly document it as a workaround |
| "Let me try one more thing" after 40 minutes | Sunk cost fallacy; the next 40 minutes won't be different from the last 40 |
| Not writing the debugging journal | Externalizing reasoning reveals blind spots that internal monologue can't |

---

## Integration with Other Skills

- **`trajectory-guard`** → fires at Level 0, triggers this skill
- **`environment-recovery`** → run at Level 0 self-correction step 3
- **`specter`** → use at Level 1 as strategy change
- **`bisect-debugging`** → use at Level 1 if the bug was recently introduced
- **`debug-to-fix-pipeline`** → use at Level 1 as alternative strategy
- **`summarize`** → use at Level 4 for handoff document