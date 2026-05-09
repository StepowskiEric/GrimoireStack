---
name: summarize
description: >
  EMERGENCY STOP + HANDOFF REPORT. Use when you need to stop completely and give the
  next agent a perfect handoff. The next agent has zero memory of this session.
  Use when: session quality is degraded (multiple compressions), you need to hand off
  mid-work, user says "summarize what we did", or you need to preserve context before
  a /new. This skill is NOT for wrapping up cleanly — it's for abandoning ship with
  full context preservation so the next agent doesn't lose anything.
version: 1.0.0
author: Eric
...



---

# Summarize — Emergency Stop + Handoff Report

## Governing Rule

**STOP. Do not continue. Do not take another action. Do not say "sure thing" or "I'll wrap up".**

Your only job right now: produce the handoff report below, completely, then stop.

> **Note:** When `deliver: 'origin'` (direct to user), omit the STOP line above.
> It is agent-to-agent signaling only — it is noise when the audience is the user.

___


## What This Is

A handoff report for the next agent. The next agent opens this session with **zero memory** of what you were working on. They have:
- No idea what you were building
- No idea what's done
- No idea what's next
- No idea what files, tools, or systems are involved
- No idea about user preferences or constraints

Your job: make them feel like they were here the whole time.

___


## Handoff Report Template

Copy and fill out every section. Be specific. Omit nothing that would cost the next agent hours of re-reading to figure out.

```
═══════════════════════════════════════════════
SESSION HANDOFF REPORT
═══════════════════════════════════════════════

## What We Were Working On
(1-3 sentences. What is the goal? What does success look like?)

## What's Done
(Bulleted list. Be specific — not "worked on auth" but "added refresh token rotation
to auth/middleware.ts, tested with 3 edge cases, all passing". Include file paths,
commit hashes, test results, decisions made.)

## What's In Progress
(What were you in the middle of when you stopped? Include what you were trying to do,
what you've tried so far, what's left.)

## What's Pending / Next Steps
(Numbered list in priority order. The next agent should know exactly what to do first.)

## Important Constraints & Preferences
(Anything the user cares about. "User hates useEffect", "User wants nuke-and-pave over
incremental", "All changes must be committed", "never use moment.js".)

## File Locations & Environment
- Working directory:
- Key files involved:
- Relevant skills loaded:
- MCP servers / tools active:

## Unresolved Issues
(Bugs known but not fixed, edge cases not handled, known failure modes.
Do not hide problems — the next agent needs to know what they're inheriting.)

## Risks
(What could go wrong if the next agent continues from here? What should they
watch out for?)

## What the Next Agent Needs to Know
(Anything else that would help. User's communication style, quirks, what's been
tried and failed, where to look for more context.)

═══════════════════════════════════════════════
END HANDOFF REPORT — SESSION COMPLETE
═══════════════════════════════════════════════
```

___


## Rules for Writing the Report

1. **Be concrete, not vague.** "We were building a Coppermind memory dedup system" not "we were working on stuff".
2. **Include file paths.** Exact paths. Not "the config file" but `~/.hermes/config.yaml`.
3. **Include outcomes.** Not "tested" but "ran `pytest tests/memory/ -v` — 47 passed, 0 failed".
4. **Flag the unknown.** If you were uncertain about something, say so. Do not paper over gaps.
5. **Preserve decisions.** If the user or you made a decision, record it with the reason.
6. **Do not apologize.** No "sorry for the confusion" or "I wasn't able to finish". Just facts.
7. **Preserve context about the user.** Any preferences, quirks, or communication style you observed.

___


## When to Use This Skill

| Situation | Use this? |
|-----------|-----------|
| Session has been compressed 2+ times | Yes — quality is degraded |
| Anti-thrashing warning in logs | Yes — compressor is telling you to stop |
| User says "summarize what we did" | Yes — produce the report below |
| You need to `/new` or `/branch` | Yes — produce handoff first |
| You were working on something complex and need to hand off | Yes |
| Session was interrupted / tools not responding | Yes — emergency stop |
| User explicitly asks for a handoff | Yes |

___


## After Writing the Report

1. Verify every section is filled — no "TODO" or "fill in later"
2. Verify file paths are real and spelled correctly
3. Stop. Do nothing else. Wait for the user or the next agent.

The session is over. The report is the deliverable.
