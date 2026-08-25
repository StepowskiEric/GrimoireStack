# Fresh Agent Ideas — researched 2026-08-25

Follow-up to `newer-ai-ideas-2026.md`. Sources fetched directly; all primary.

## 1. Self-Harness: harnesses that improve themselves

- **Source:** *Self-Harness: Harnesses That Improve Themselves* (arXiv 2606.09498,
  submitted 2026-06-08, v3 2026-08-20): <https://arxiv.org/abs/2606.09498>

**Mechanism.** The agent improves its own operating harness (the prompts, tools,
and scaffolding around the model) in a three-stage loop:
1. **Weakness Mining** — identify model-specific failure patterns from execution traces.
2. **Harness Proposal** — generate diverse but *minimal* harness modifications tied
   to those failures.
3. **Proposal Validation** — accept a candidate edit only after regression testing.

**Evidence.** Across 9 model×benchmark combinations (Terminal-Bench-2.0,
SWE-bench Verified, AppWorld; MiniMax M2.5, Qwen3.5-35B-A3B, GLM-5), every final
harness improved held-in AND held-out pass rates; relative gains up to 132%.
Retained mechanisms addressed artifact handling, patch verification, app-state retrieval.

**Skill fit: VERY HIGH.** No major skill catalog encodes "audit your own harness
from your own failure traces." Directly applicable: mine session transcripts for
recurring failures, propose one minimal edit each (AGENTS.md line, skill tweak,
hook), gate acceptance on regression tests.

## 2. Context thinning for strong models (Anthropic, first-party)

- **Source:** *The new rules of context engineering for Claude 5 generation models*
  (Anthropic / claude.com blog, 2026-07-24):
  <https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models>

**Mechanism.** Anthropic removed >80% of Claude Code's system prompt for newer
models with no measurable eval loss. The then→now shifts they name:
- Give rules → **let the model use judgment** ("match surrounding comment density"
  replaces comment bans)
- Give examples → **design expressive interfaces** (enum values and parameter names
  carry the instruction; examples constrain exploration)
- Put it all upfront → **progressive disclosure** (verification moved into skills;
  deferred-loading tools)
- Repeat yourself → **single-source tool descriptions**
- Memory in CLAUDE.md → auto-memory
- Simple specs → **rich references** (specs as code, test suites, rubrics fed to
  verifier agents)

**Skill fit: HIGH.** An audit skill that slims over-constrained instruction files
(AGENTS.md, SKILL.md, system prompts) by converting rules to judgment, moving
instructions into interface design, and pushing detail behind disclosure. Directly
useful to anyone maintaining a skill catalog.

## 3. Echo Gap: self-graded memories rot (cautionary)

- **Source:** *Memory Reward Inflation in Self-Improving LLM Agents*
  (arXiv 2608.00017, submitted 2026-06-29): <https://arxiv.org/abs/2608.00017>

**Mechanism.** When agents score their own episodes into external memory and later
retrieve by those scores, incorrect episodes receive *inflated* rewards — the agent
preferentially reuses its most confidently-wrong mistakes. The inflation compounds
through memory rather than averaging out, and a confirming judge's errors stay
correlated with the original bias, so it cannot spot overvalued memories. Formalized
as the Error-Independence Assumption (EIA); their answer-free de-inflation algorithm
(LUCID) lifts BIRD text-to-SQL accuracy 54.0% → 56.9%.

**Skill fit: MODERATE alone; HIGH as a failure-mode section** for any lesson-capture
or memory discipline: store lessons only from externally verified outcomes
(tests pass, user confirmed), never from self-assessed success.

## 4. How LLMs fall short at coding — current evidence (2026)

### 4a. Developer–agent misalignment in 20,574 real sessions

- **Source:** *How Coding Agents Fail Their Users* (arXiv 2605.29442, 2026-05-28):
  <https://arxiv.org/abs/2605.29442>
- Seven recurring misalignment forms: reading projects, interpreting intent,
  following rules, bounding actions, implementing/executing code, reporting progress.
- 90.50% of episodes cost effort/trust rather than irreversible damage, yet 91.49%
  of resolutions require explicit user correction.
- Over time overall rates decline, but **constraint violations and inaccurate
  self-reporting grow in share**. Misalignment persists across adjacent sessions.

### 4b. Failure as a process: CLI agent trajectories

- **Source:** *Failure as a Process: An Anatomy of CLI Coding Agent Trajectories*
  (arXiv 2607.09510, 2026-07-10): <https://arxiv.org/abs/2607.09510>
- 1,794 annotated trajectories / 63k+ steps, seven frontier models, three scaffolds.
- Failures are predominantly **epistemic errors** (wrong beliefs about the
  environment), typically begin **within the first few execution steps**, and often
  stay hidden **until recovery is no longer possible**. Reliability needs earlier
  validation, not better final-outcome evaluation.

### 4c. The verification bottleneck (practitioner survey)

- **Source:** Sonar *State of Code Developer Survey 2026*, 1,100+ professional
  developers (2026-01-08):
  <https://www.sonarsource.com/blog/state-of-code-developer-survey-report-the-current-reality-of-ai-coding/>
- 42% of committed code is AI-generated today; 96% of developers do not fully trust
  it; only 48% always verify before committing.
- 38% report reviewing AI code takes more effort than reviewing human code —
  generation got cheap, verification became the bottleneck.
- Usage vs effectiveness gap: new-code writing 90% usage vs 55% rated effective;
  refactoring 72% vs 43%. Strongest at docs (74%), explaining code (66%), tests (59%).

### 4d. Corroborating industry signals (secondary sources)

- CodeRabbit analysis of 470 open-source PRs: AI-authored PRs carry ~1.7× more
  defects than human-authored ones (via tech-insider.org summary, 2026-07).
- GitClear: AI-assisted coding correlates with ~4× more code cloning/duplication
  (via secondary summaries).
- CSA research note: CVEs attributed to AI-generated code rose 6 → 35 between
  January and March 2026 (labs.cloudsecurityalliance.org, 2026-03-31).

## 5. What the failure data implies for a GrimoireStack skill

| Documented shortcoming | Skill-shaped countermeasure |
|---|---|
| Failures are epistemic, start in the first few steps, then hide | Front-load a cheap reality probe right after first exploration/edit — run the smallest build/test/lint check before building on assumptions |
| Inaccurate self-reporting grows over time | Progress claims must carry evidence (command output), never narrative-only status |
| Constraint violations + clashing rules cause misbehavior | Audit instruction files for conflicts; convert rules to judgment (Anthropic thinning) |
| Recurring model-specific failures persist across sessions | Mine own traces for repeat failures; minimal harness edits gated by regression (Self-Harness) |
| Review burden exceeds human code | Keep diffs small and reviewable; duplication check against GitClear-style cloning risk |
