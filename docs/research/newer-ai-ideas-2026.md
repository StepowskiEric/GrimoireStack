# Newer AI Agent Ideas (2025–2026) for GrimoireStack

Research notes on novel, primary-sourced agent patterns that could become new
GrimoireStack skill entries. Scope: arXiv papers, official framework docs, and
first-party engineering blogs only. No listicles or SEO content.

Selection rule: tree-of-thoughts, Reflexion, ReAct, and basic LLM-as-judge are
already covered by existing catalogs, so they appear here only as baselines.

---

## 1. Agentic Context Engineering (ACE) — evolving "playbook" contexts

- **Source:** *Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models* — <https://arxiv.org/abs/2510.04618> (ICLR 2026; project page: <https://ace-agent.github.io/>)
- **Precursor:** *Dynamic Cheatsheet: Test-Time Learning with Adaptive Memory* — <https://arxiv.org/abs/2504.07952>

**Mechanism.** ACE treats the agent's system prompt / context as an evolving
playbook instead of a static instruction block. Three roles collaborate:
a Generator does the task, a Reflector extracts concrete lessons from wins and
losses, and a Curator merges those lessons into the playbook as small
incremental deltas (add / update / retire individual bullet items). Updates are
item-level, not full rewrites, which prevents "context collapse" — the
degeneration LLMs show when asked to rewrite long documents wholesale. The
playbook accumulates domain strategies, pitfalls, and tool-use tricks across
episodes with no weight updates.

**Evidence.** +10.6% on AppWorld agent benchmarks and +8.6% on financial
analysis over static-prompt baselines; matches or beats a top production
AppWorld agent while using a smaller open model (per paper abstract and ICLR
listing). Adaptation latency is reported as low overhead vs fine-tuning.

**Novelty vs coverage: HIGH.** Catalogs cover prompt engineering but almost none
encode the delta-curation discipline (incremental item updates + explicit
deduplication to avoid bloat/collapse). Very implementable as a pure SKILL.md
protocol backed by a markdown playbook file.

---

## 2. ReasoningBank — strategy-level memory distilled from failures too

- **Source:** *ReasoningBank: Scaling Agent Self-Evolving with Reasoning Memory* — <https://arxiv.org/abs/2509.25140> (Google Research blog: <https://research.google/blog/reasoningbank-enabling-agents-to-learn-from-experience/>)
- **Related survey:** *Memory in the Age of AI Agents: A Survey* — <https://github.com/Shichun-Liu/Agent-Memory-Paper-List> (paper list maintained by the survey authors)
- **Alternative memory design:** *A-MEM: Agentic Memory for LLM Agents* (Zettelkasten-style linked notes) — <https://arxiv.org/abs/2502.12110> (NeurIPS 2025)

**Mechanism.** Instead of storing raw trajectories (Reflexion style), the agent
distills each completed task into short, reusable *strategy items*: title,
description of the tactic, and when it applies. Crucially, failed tasks are
distilled too — counterfactual lessons ("what would have worked") become first-
class memories. At the start of a new task the agent retrieves the top-k
relevant strategies and conditions on them; at the end it writes new ones back.
The companion technique MaTTS combines this memory with parallel/sequential
test-time scaling so rollouts share learned strategies.

**Evidence.** Paper reports consistent gains across WebArena, Mind2Web, and SWE
Bench–style tasks; up to 34.7% relative improvement over the base agent, and
MaTTS shows memory + test-time scaling compound rather than duplicate.

**Novelty vs coverage: HIGH.** Reflexion is widely cataloged; strategy-item
memory with failure-positive distillation and retrieval conditioning is much
fresher. Maps directly to a skill protocol ("before coding, retrieve N tactic
notes; after verification, write back 1–3 items").

---

## 3. Agentic test-time compute: reflect only when needed, merge list-wise

- **Sources:**
  - *Scaling Test-time Compute for LLM Agents* — <https://arxiv.org/abs/2506.12928>
  - *Scaling Test-Time Compute for Agentic Coding* — <https://arxiv.org/abs/2604.16529>
  - *Benchmark Test-Time Scaling of General LLM Agents* — <https://arxiv.org/abs/2602.18998>

**Mechanism.** Systematic study of test-time scaling *for agents* (not single-
turn math): parallel sampling (Best-of-N, beam search, tree search over agent
trajectories) plus sequential scaling (longer interaction histories). Key
findings that contradict naive intuition:

1. Knowing **when** to trigger reflection beats reflecting after every step;
   unconditional self-correction can hurt.
2. Among verification/merging schemes for candidate trajectories, **list-wise**
   comparison (judge sees all candidates together) beats pointwise scoring and
   pairwise comparison.
3. Diversified rollouts (varying temperature/prompts per branch) help more than
   more samples from one distribution.
4. Gains grow with task horizon but saturate; spend extra compute on hard steps,
   not uniformly.

The agentic-coding follow-up extends this to long-horizon repo edits where
outputs cannot be re-sampled cheaply, favoring checkpoint-and-branch strategies.

**Evidence.** Consistent multi-benchmark gains in both papers (agent benchmarks
incl. ALFWorld/WebShop in 2506.12928; coding benchmarks in 2604.16529).

**Novelty vs coverage: MEDIUM-HIGH.** Tree-of-thoughts is cataloged everywhere,
but the *operational rules* (reflection gating, list-wise merging, diversify
branches) are rarely encoded as protocols and are directly actionable by an LLM
coding agent.

---

## 4. Rubric-first self-evaluation (Rubrics as Rewards → runtime rubrics)

- **Sources:**
  - *Rubrics as Rewards: Reinforcement Learning Beyond Verifiable Domains* — <https://arxiv.org/abs/2507.17746>
  - *Inference-Time Scaling of Verification: Self-Evolving Deep Research Agents via Test-Time Rubric-Guided Verification* — <https://arxiv.org/abs/2601.15808>

**Mechanism.** RaR shows that prompt-specific rubrics — lists of concrete,
binary-checkable criteria generated before answering — yield far more reliable
LLM-judge rewards than holistic "rate 1–10" judging, and can drive RL training.
At inference time, the rubric-guided verification work applies the same idea to
agents: before executing a research/coding task, the agent writes a checklist
rubric for what a good result must satisfy (coverage, evidence, constraints),
then iterates its output against that rubric, treating unmet criteria as
actionable defects. The rubric doubles as the acceptance test.

**Evidence.** RaR improves reward alignment with human judgment vs scalar judge
scores; rubric-guided verification improves deep-research agent quality at
inference time without retraining.

**Novelty vs coverage: MEDIUM-HIGH.** "Self-eval" skills exist but usually as
generic review prompts. The specific protocol — *generate the rubric BEFORE the
work, keep criteria binary and verifiable, iterate until all pass* — plus the
evidence that binary criteria beat scalar judgment, is fresh and cheap to
implement.

---

## 5. Orchestrator-worker multi-agent systems: Anthropic's production lessons

- **Source:** *How we built our multi-agent research system* — <https://www.anthropic.com/engineering/multi-agent-research-system> (June 2025)
- **Companion:** *Building effective agents* — <https://www.anthropic.com/engineering/building-effective-agents>

**Mechanism.** A lead agent decomposes a broad objective, spawns 3–5 parallel
subagents with focused briefs, and synthesizes their compressed reports. The
engineering writeup contains transferable operational rules: scale effort to
query complexity (explicit heuristics in the lead's prompt), subagents must
return condensed findings (not raw dumps) to protect the orchestrator's context,
parallel tool calls within subagents give most of the wall-clock win, and token
economics matter — multi-agent runs burned ~15× the tokens of chat. Also:
describing *when NOT to spawn* subagents was as important as when to spawn them.

**Evidence.** Multi-agent system beat single-agent Claude Opus 4 baseline by
90.2% relative on their internal research eval (with the large caveat of token
cost).

**Novelty vs coverage: MEDIUM.** Orchestrator-worker itself is now common, but
catalogs rarely carry the failure-driven rules (effort-scaling rubric, summary
compression contracts, de-duplication of delegated work). A coding-specific
adaptation (plan → parallel scoped probes → merged report) is still distinctive.

---

## 6. Deep Agents harness pattern: plan tool + filesystem as externalized context

- **Sources:**
  - LangChain blog: *Deep Agents* — <https://www.langchain.com/blog/deep-agents> (July 30, 2025)
  - Official docs: <https://docs.langchain.com/oss/python/deepagents/overview>
  - Multi-agent best practices: <https://www.langchain.com/blog/building-multi-agent-applications-with-deep-agents>

**Mechanism.** Distills the Claude Code architecture into four harness pieces:
(1) a persistent no-op planning/todo tool the agent maintains itself, (2) a
virtual filesystem used as scratch memory so large intermediate state never
sits in context, (3) focused subagents that get a fresh context per task, and
(4) long-term memory files. LangChain's stated design rule: "trust the LLM" —
enforce boundaries with tools/sandboxes, not prompt-level prohibitions. Their
subagent best-practices post adds concrete rules: few focused tools per
subagent, explicit return contracts, no shared mutable state.

**Evidence.** First-party production pattern behind Claude Code and LangChain's
deep-agents library; validated at scale though not via a single benchmark.

**Novelty vs coverage: MEDIUM.** The filesystem-as-memory + self-maintained plan
discipline is partially covered by catalogs; the "tool-boundary not prompt"
rule and subagent contract details are less common.

---

## 7. Plan-mode research workflow (Explore → Plan → Code → Commit)

- **Source:** *Best practices for Claude Code* (official docs, plan mode section) — <https://code.claude.com/docs/en/best-practices>; workflows: <https://code.claude.com/docs/en/common-workflows>

**Mechanism.** Anthropic's recommended loop: read/explore first without editing,
write a detailed implementation plan (optionally verified against docs), then
implement, then commit in small units. Plan mode enforces a read-only phase so
the model builds a grounding map before touching code; Anthropic reports large
quality gains on complex tasks versus direct prompting.

**Evidence.** First-party recommendation; widely replicated. GrimoireStack likely
already has adjacent entries — include mainly as evidence base for a stricter
"no edit before written plan approval" gate skill.

**Novelty vs coverage: LOW-MEDIUM.** Worth folding into other entries rather
than shipping standalone unless the catalog lacks it.

---

## 8. Computer-use agents: unified action space + built-in mistake correction

- **Sources:**
  - *UI-TARS: Pioneering Automated GUI Interaction with Native Agents* — <https://arxiv.org/abs/2501.12326> (ByteDance; SOTA on 10+ GUI benchmarks incl. OSWorld: 24.6 @ 50 steps vs Claude 22.0)
  - *Agent S2* — <https://arxiv.org/abs/2504.00906> (SimulAgent; generalizes to mobile/desktop)
  - *OSWorld-G / Jedi: Scaling Computer-Use Grounding* — <https://osworld-grounding.github.io/>
  - OpenAI Operator announcement (first-party): <https://openai.com/index/introducing-operator/>

**Mechanism.** Native GUI agents close the loop on screenshots alone: perceive
(elements + captions) → reason → act in a unified action space → observe. Two
protocol-relevant ideas: UI-TARS bakes *deliberative* (post-task reflection)
and *reactive* (mid-action undo/retry on visual error signals) correction into
the policy; Agent S2 adds Mixture-of-Grounding (delegate click-targeting to a
specialist pass) and Proactive Hierarchical Planning (re-plan on stale screen
state). OSWorld-G shows grounding ("where do I click") remains the bottleneck
and benefits from decomposition of instructions into sub-instructions.

**Evidence.** Benchmark numbers above; OSWorld leaderboard progression through
2025-2026.

**Novelty vs coverage: HIGH (for coding-agent catalogs).** Almost no prompt-
skill catalogs cover desktop/GUI agent protocols, and the reflection/reactive-
correction split transfers directly to browser-driving coding tasks (E2E tests,
visual QA).

---

## 9. Agentic RL and verifier feedback (background / training-time)

Useful context for skill design even though training is out of scope for
prompt-based skills:

- *The Landscape of Agentic Reinforcement Learning for LLMs: A Survey* — <https://arxiv.org/abs/2509.02547>. Frames agents as POMDP decision makers and taxonomizes verifier designs (execution feedback, rubric rewards, self-play curricula).
- *SWE-RL* (Meta) — <https://arxiv.org/abs/2502.18449>. RL on real GitHub PR data with rule-based rewards (similarity between predicted and actual patches); first RL approach scaled to real-world SE; improved SWE-bench Verified and generalized reasoning. Code: <https://github.com/facebookresearch/swe-rl>.
- *Absolute Zero* — <https://arxiv.org/abs/2505.03335>. Self-play where one model proposes its own coding tasks and a code executor verifies both task validity and answers; SOTA coding/math reasoning with zero human-curated data.

**Transferable protocol idea:** the executor-as-verifier loop (propose task →
attempt → let a deterministic checker adjudicate) is the prompt-level analogue
of RLVR and underwrites several skills above.

---

## 10. Context engineering doctrine (Anthropic, first-party)

- *Effective context engineering for AI agents* — <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents> (Sept 29, 2025). Treats attention as a finite budget: compaction, structured note-taking/memory tools, sub-agent contexts, just-in-time retrieval over full-file reads.
- *Equipping agents for the real world with Agent Skills* — <https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills> (Oct 16, 2025). Skills as progressive-disclosure folders: metadata loaded first, full SKILL.md body only when relevant; open standard.
- *Writing effective tools for AI agents* — <https://www.anthropic.com/engineering/writing-tools-for-agents> (Sept 11, 2025). Tool responses should return meaningful, token-efficient context.

**Novelty vs coverage: MEDIUM.** Progressive disclosure is exactly how
GrimoireStack's own SKILL.md format works — these posts justify a meta-skill
about *when to load which skill*, plus compaction/note-taking disciplines.

---

# Top 5 candidate skill ideas (ranked: uniqueness × usefulness for coding agents)

1. **Evolving Playbook (ACE-style context curation)** — Enforce incremental
   item-level updates to a persistent playbook file after every verified task:
   Reflector distills lessons, Curator merges as deltas, full rewrites banned to
   prevent context collapse.
   *(<https://arxiv.org/abs/2510.04618>)*

2. **Strategy Memory Bank (ReasoningBank-style)** — Require the agent to write
   1–3 titled, applicability-scoped tactic items after every task — including
   failures phrased as counterfactual fixes — and to retrieve top-k tactics
   before starting any nontrivial change.
   *(<https://arxiv.org/abs/2509.25140>)*

3. **Rubric Gate (rubric-first self-eval)** — Before implementing, generate a
   binary-checkable rubric of done-criteria; after implementing, verify each
   criterion explicitly and iterate until all pass; scalar "looks good"
   judgments forbidden.
   *(<https://arxiv.org/abs/2507.17746>, <https://arxiv.org/abs/2601.15808>)*

4. **Adaptive Reflection & List-wise Merge (agentic test-time compute)** — Gate
   reflection triggers on detected failure signals instead of every step; when
   multiple approaches exist, sample diversified attempts and compare them
   list-wise in one judgment, never pairwise.
   *(<https://arxiv.org/abs/2506.12928>, <https://arxiv.org/abs/2604.16529>)*

5. **Computer-Use Correction Loop (UI-TARS/Agent S2-derived)** — For any
   screenshot-driven work, enforce the perceive→act→observe cycle with reactive
   undo-on-error signals, post-action deliberation checkpoints, and delegation
   of precise click-targeting to a dedicated grounding pass.
   *(<https://arxiv.org/abs/2501.12326>, <https://arxiv.org/abs/2504.00906>)*

Honorable mention: **Subagent Contract Protocol** (Anthropic multi-agent +
LangChain deep-agents rules: effort-scaling heuristics, compressed-return
contracts, focused tool sets) if the catalog lacks a multi-agent entry.
