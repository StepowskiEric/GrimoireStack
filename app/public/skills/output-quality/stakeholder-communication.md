# Skill: Stakeholder Communication and Uncertainty Calibration

## Purpose

Use this skill when presenting conclusions, estimates, recommendations, or technical explanations to humans. Prevents the agent from overpromising, hiding uncertainty, stating speculative fixes as certainties, or communicating in ways that create false confidence or unnecessary alarm.

Good technical communication is not about sounding smart. It is about transferring the right information at the right level of precision so the recipient can make an informed decision.

---

## When to Apply

- Presenting a diagnosis, root cause, or recommended fix
- Giving a time estimate for a task or project
- Explaining tradeoffs between options
- Reporting on progress, blockers, or setbacks
- Answering "is this safe to deploy?" or "will this work?"
- Writing commit messages, incident reports, or design docs
- Summarizing research, experiments, or investigations
- Any situation where a human must act on the agent's output

---

## The Pattern

### Step 1: Separate Facts from Inferences

Before communicating, tag every claim:

| Tag | Meaning | Example |
|-----|---------|---------|
| **FACT** | Directly observed, reproducible | "The test fails with `NullPointerException` at line 47." |
| **INFERENCE** | Logical conclusion from facts | "The null likely originates from `getUser()` returning null when the ID is not found." |
| **SPECULATION** | Possible but unverified | "This might be related to the recent auth service migration." |
| **OPINION** | Value judgment | "Refactoring this now will be cleaner than adding another workaround." |

Rule: Lead with FACTs. Separate INFERENCEs clearly. Label SPECULATION and OPINION explicitly. Never present a SPECULATION as a FACT.

Anti-pattern: "The bug is caused by the auth migration." (Unless you proved it, this is speculation dressed as fact.)

### Step 2: Calibrate Confidence Levels

State how sure you are using a standard scale. Do not use vague qualifiers.

| Level | Verbal | Probability | When to Use |
|-------|--------|-------------|-------------|
| **Certain** | "I am certain that..." | ~99% | Directly observed and verified |
| **High confidence** | "I am highly confident that..." | ~85-95% | Strong evidence, minor uncertainty |
| **Likely** | "It is likely that..." | ~60-80% | Best inference but not proven |
| **Uncertain** | "I am uncertain; possibilities include..." | ~40-60% | Multiple plausible explanations |
| **Unlikely** | "It is unlikely that..." | ~10-30% | Weak evidence, better alternatives exist |
| **Unknown** | "I do not know." | — | No basis for a claim |

Rule: If you cannot pick a level, you have not thought clearly enough. Stop and gather more information.

Anti-pattern: "Maybe it's the database." → Convert to: "I am uncertain; possibilities include database connection limits (no direct evidence) or a missing index (query is slow but not timing out)."

### Step 3: Structure the Answer by Decision Urgency

Match the structure to what the stakeholder needs:

**Urgent decision needed (incident, blocker):**
```
1. What happened (1 sentence)
2. Impact right now (1 sentence)
3. What I recommend doing immediately (1 action)
4. Confidence level in that recommendation
5. What we should verify afterward
```

**Non-urgent decision (design, roadmap):**
```
1. The question being answered
2. Options considered (at least 2)
3. Tradeoffs for each
4. Recommendation with reasoning
5. Risks if the recommendation is wrong
6. What would change my mind
```

**No decision needed (update, FYI):**
```
1. What was done
2. What the result was
3. What is next
4. Any blockers or help needed
```

Anti-pattern: Buried lede. If the database is down, do not start with "I was looking at the logs and noticed an interesting pattern..."

### Step 4: Estimate with Ranges, Not Points

Point estimates are lies. Ranges are honest.

| Bad | Better |
|-----|--------|
| "It will take 3 days." | "I estimate 2-5 days. 70% confidence in 2-4 days if no blockers." |
| "This is safe." | "I see no risks under normal load. I have not tested spike conditions." |
| "The fix works." | "The fix passes the reproduction test and 10 related tests. I have not tested edge cases yet." |

Rules:
- Always give a range, never a single number
- State confidence and assumptions
- Separate "known work" from "unknown work"
- If the range is wider than 3x (e.g., 1 day to 1 week), say "I need to investigate X before I can narrow this"

### Step 5: Surface What You Do Not Know

Explicitly list gaps. This builds credibility, not weakness.

```
Known:
- The error occurs on every request with user_id > 2^31
- Rolling back to v1.4.2 resolves it

Unknown:
- Whether the issue is in the serializer or the database driver
- Whether this affects other integer fields
- Performance impact of the rollback

Plan:
1. Check serializer for 32-bit assumptions (30 min)
2. Run integration tests with large IDs (1 hour)
3. Decide fix vs rollback based on findings
```

Anti-pattern: Pretending certainty to look competent. Humans can handle uncertainty; they cannot handle surprises after a "definitely."

### Step 6: Recommend, Do Not Just Inform

Stakeholders often want a recommendation, not a report. Give one.

Structure:
```
Recommendation: <specific action>
Rationale: <2-3 sentences>
Risk: <what could go wrong>
Alternative: <what we could do instead>
```

If you genuinely have no recommendation, say so:
```
"I do not have a recommendation yet. I need to complete X before I can give one."
```

Anti-pattern: Dumping raw data and expecting the human to synthesize it.

### Step 7: Match the Audience's Technical Depth

Adjust vocabulary and detail:

| Audience | Adjustments |
|----------|-------------|
| Executive / PM | Lead with impact and recommendation; hide implementation details; use business terms |
| Senior engineer | Include architecture and tradeoffs; show reasoning; cite evidence |
| Junior engineer | Include context and "why"; define acronyms; be explicit about assumptions |
| On-call responder | Lead with symptom, impact, and immediate action; include runbook links |
| External customer | Focus on their experience, not your internals; give timelines, not technical excuses |

Rule: If you do not know the audience, default to senior engineer depth and offer to adjust.

### Step 8: Review for Hidden Overconfidence

Before sending, scan for these red-flag words and replace them:

| Red Flag | Replacement |
|----------|-------------|
| "Obviously..." | Delete. If it were obvious, you would not need to say it. |
| "Clearly..." | Delete. Substitute the evidence that makes it clear. |
| "Just..." | "Just restart it" → "Restarting it will temporarily resolve the symptom." |
| "Simply..." | "Simply add a cache" → "Adding a cache reduces latency but introduces invalidation complexity." |
| "It will work" | "I expect it to work under these assumptions: ..." |
| "There is no risk" | "I have not identified risks under these conditions: ..." |
| "I am sure" | "I am confident because ..." or "I believe ..." |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|--------------|-------------|
| Hiding uncertainty to sound competent | Creates false confidence; decisions made on bad information |
| Over-explaining to a busy audience | Message lost; recipient stops reading |
| Under-explaining to a technical audience | Appears evasive or shallow |
| Blaming tools, libraries, or other teams | Deflects from actionable next steps |
| "It should work" | "Should" is not a test result; say what you verified |
| Giving a point estimate with no assumptions | Assumptions always exist; state them or they will be wrong |
| Apologizing for not knowing | Uncertainty is information; frame it as what needs to be learned |
| Ending with a question dump | If you need more info, structure the ask by priority |

---

## Quick Reference

```
1. Tag claims      → FACT / INFERENCE / SPECULATION / OPINION
2. Calibrate       → Certain / High / Likely / Uncertain / Unlikely / Unknown
3. Structure       → match to decision urgency
4. Estimate        → ranges with confidence, not point values
5. Surface gaps    → list unknowns explicitly
6. Recommend       → specific action + rationale + risk + alternative
7. Match audience  → adjust depth to recipient
8. Red-flag scan   → remove "obviously," "clearly," "just," "simply," "sure"
```

---

## Related Skills

- `mece-pyramid-principle` — structure complex arguments clearly
- `feynman-technique` — verify understanding by simplifying explanations
- `compression-as-understanding` — distill to essence before communicating
- `pre-mortem` — surface risks that should be mentioned in recommendations
- `bayesian-updating` — revise confidence as new evidence arrives
