# Recommended Ways to Use This Repo

## If you want execution discipline

Start with the protocol skills, especially:

- `judgment-and-routing/thoroughness-check-etto-state-machine.md`
  d05|
  6ba|- `orchestration/pre-flight-intent-verification/SKILL.md` — unified pre-action gate (Clarify → Specify → Ground) before any significant task execution
- `execution/how-to-solve-it-state-machine.md`
- `execution/refactoring-state-machine.md`
- `execution/working-effectively-with-legacy-code-state-machine.md`
- `execution/toyota-kata-state-machine.md`
- `execution/checklist-manifesto.md`
- `execution/ooda-loop-state-machine.md`

## If you want better judgment or routing

Start with the framework skills, especially:

- `judgment-and-routing/problem-mode-router-cynefin.md`
- `judgment-and-routing/recognition-primed-triage.md`
- `judgment-and-routing/unsafe-control-actions-hazard-analysis.md`
- `judgment-and-routing/first-principles.md`
- `judgment-and-routing/second-order-thinking.md`
- `systems-and-architecture/thinking-in-systems-state-machine.md`
- `systems-and-architecture/the-goal-theory-of-constraints-ai.md`
- `judgment-and-routing/kahneman-thinking-fast-slow-software-agent.md`

## If you want better output quality

These skills refine the agent's own work:

- `output-quality/bounded-self-revision.md` — structured self-improvement with stop rules
- `output-quality/tool-interactive-critic.md` — tool-grounded post-generation verification
- `output-quality/cognitive-load-operator-state-machine.md` — reduce mental burden in any output
- `output-quality/feynman-technique.md` — verify understanding by explaining simply
- `output-quality/mece-pyramid-principle.md` — structure outputs to be complete and non-redundant
- `output-quality/tree-of-thoughts.md` — explore multiple reasoning paths before committing
- `output-quality/self-consistency.md` — triangulate conclusions across independent reasoning chains

## If you are building higher-quality agent workflows

Strong combinations include:

- **ETTO + Problem-Mode Router** → decide rigor level and response mode first
- **Cynefin State Machine + Recognition-Primed Triage State Machine** → classify the domain, then apply the correct triage protocol
- **Recognition-Primed Triage + Unsafe Control Actions** → move fast, but with guardrails
- **How to Solve It + Pragmatic Programmer** → disciplined diagnosis plus grounded execution
- **How to Solve It + Analogy Transfer** → problem-framing with analog import when a prior solution exists
- **Working Effectively with Legacy Code + Refactoring** → make change safe, then improve structure
- **Thinking in Systems + Theory of Constraints** → understand the system, then find the true bottleneck
- **Toyota Kata + PDCA** → discover the obstacle, then verify the improvement with measurement discipline
- **OODA Loop + Checklist Manifesto** → dynamic tempo in fast-moving situations, procedural discipline in high-stakes steps
- **Pre-Mortem + Retrospective** → prevent failures before they happen, then learn from what actually did happen. Complete the learning loop: before + after.
- **Pre-Mortem + Inversion** → vivid failure stories plus abstract failure-mode analysis, before committing to a plan
- **Six Thinking Hats + Steelmanning** → multi-perspective analysis plus genuine challenge of the leading recommendation
- **Steelmanning + Advocatus Diaboli** → self-critique first (steelmanning), then a separate adversarial sub-agent attacks the proposal (advocatus-diaboli). Escalating review depth.
- **Sub-Agent Composer + TDD** → when delegating code work, always compose the sub-agent with TDD plus task-relevant skills via subagent-composer
- **Kahneman Fast/Slow + Cognitive Bias Checklist** → switch to slow mode, then verify the slow-mode output is bias-corrected
  6ba|- **Pre-Flight Intent Verification + Refactoring State Machine** → clarify assumptions and crystallize intent before bounded execution; prevents confidently doing the wrong thing, then limits the blast radius once execution starts
- **DDD + Team Topologies** → align domain boundaries to team structures
- **Release It! + SRE Error Budget** → implement stability patterns, then govern the reliability-velocity tradeoff
- **Socratic Clarification + Pre-Mortem** → surface the key assumption before planning, then validate the plan against failure
- **Bounded Self-Revision + Tool-Interactive Critic** → self-refine first, then verify with external tools
- **Feynman Technique + MECE / Pyramid Principle** → verify the reasoning is sound, then structure the output clearly

## Practical skill flows

Use these as default stacks when the task matches the scenario.

### Extremely difficult debugging

1. `judgment-and-routing/problem-mode-router-cynefin.md`
2. `judgment-and-routing/thoroughness-check-etto-state-machine.md`
3. `execution/how-to-solve-it-state-machine.md`
4. `intent-specification-protocol.md` to clarify what correct behavior looks like before diving in
5. `judgment-and-routing/explore-vs-exploit-state-machine.md`
6. `execution/ooda-loop-state-machine.md` if the situation is changing while you investigate
7. `debugging/root-cause-analysis.md` if the bug is recurring or symptom-only fixes keep failing
8. `output-quality/tool-interactive-critic.md` to verify the conclusion against code, logs, or tests

Why this stack works: classify the problem first, set the rigor bar, force disciplined diagnosis, distinguish symptoms from real causes, then keep evidence and action in a tight loop. Add `execution/trajectory-guard/SKILL.md` to this stack if the debugging session exceeds 10 tool calls — it catches the failure spiral where the agent keeps trying variants of the same fix.

### New architecture or major design decisions

1. `judgment-and-routing/problem-mode-router-cynefin.md`
2. `judgment-and-routing/thoroughness-check-etto-state-machine.md`
3. `judgment-and-routing/first-principles.md`
4. `systems-and-architecture/thinking-in-systems-state-machine.md`
5. `systems-and-architecture/domain-driven-design.md`
6. `systems-and-architecture/team-topologies-ai.md`
7. `software-development/api-design-backward-compatibility.md` to enumerate consumers before changing contracts
8. `judgment-and-routing/pre-mortem.md`
9. `judgment-and-routing/inversion-mental-model.md`

Why this stack works: it separates problem classification from design, forces boundary, coupling, and failure-mode analysis, protects existing consumers, then validates the plan against failure before committing.

### Large refactor or cleanup of bad code

1. `judgment-and-routing/thoroughness-check-etto-state-machine.md`
2. `intent-specification-protocol.md` to lock the target behavior before changing code
3. `execution/working-effectively-with-legacy-code-state-machine.md`
4. `execution/refactoring-state-machine.md`
5. `execution/pragmatic-programmer-state-machine.md`
6. `execution/checklist-manifesto.md` if the change is risky or procedural
7. `output-quality/tool-interactive-critic.md` before claiming the work is done

Why this stack works: stabilize first, refactor in bounded slices, keep the blast radius explicit, and verify before closure.

### Mass lint remediation or post-migration cleanup

1. `software-development/lint-battalion/SKILL.md` — auto-fix sprint, categorize, parallel subagent battalions, contamination checks

2. `debugging/debug-subagent/SKILL.md` — for semantic errors requiring logic understanding
3. `execution/checklist-manifesto.md` — phase gates and contamination checks
4. `software-development/pre-deployment-gate/SKILL.md` — final lint check before commit

Why this stack works: lint-battalion eliminates 80%+ of errors mechanically, the debug subagent handles semantic survivors without context bloat, and the checklist gates prevent contamination from sloppy fixes.

### Large codebase search or bug localization

1. `software-development/codebase-divide-conquer-search/SKILL.md` — hierarchical summarization, semantic ranking, and parallel sub-agent deep dives
2. `execution/how-to-solve-it-state-machine.md` — frame the query precisely before searching
3. `keyword-agnostic-logic-locator.md` — structural queries when semantic similarity is ambiguous
4. `debugging/debug-subagent/SKILL.md` — if the search is for a bug, use as the Phase 2 conquer agent
5. `output-quality/tool-interactive-critic.md` — verify findings against actual source code

Why this stack works: the divide-and-conquer protocol compresses the codebase by ~80%, routes queries to the right zones with 84.67% file-level accuracy (Meta-RAG), and uses parallel agents to avoid the path-explosion problem that kills single-agent searches in large repos.

### Following strong principles while deciding

1. `judgment-and-routing/first-principles.md`
2. `judgment-and-routing/second-order-thinking.md`
3. `judgment-and-routing/kahneman-thinking-fast-slow-software-agent.md`
4. `judgment-and-routing/cognitive-bias-checklist.md`
5. `output-quality/mece-pyramid-principle.md`
6. `output-quality/feynman-technique.md`

Why this stack works: it pushes the agent to reason from basics, check downstream effects, slow down when needed, and present the result clearly.

### Fast-moving incident or urgent operational work

1. `judgment-and-routing/problem-mode-router-cynefin.md`
2. `judgment-and-routing/recognition-primed-triage.md`
3. `execution/ooda-loop-state-machine.md`
4. `judgment-and-routing/unsafe-control-actions-hazard-analysis.md`
5. `execution/checklist-manifesto.md`

Why this stack works: classify the situation, take the first plausible strong move, then stay disciplined about timing, sequence, and safeguards.

### Better output quality or sharper reasoning

1. `output-quality/tree-of-thoughts.md`
2. `output-quality/self-consistency.md`
3. `output-quality/bounded-self-revision.md`
4. `output-quality/tool-interactive-critic.md`
5. `output-quality/mece-pyramid-principle.md`
6. `output-quality/feynman-technique.md`
7. `output-quality/stakeholder-communication.md` when presenting conclusions to humans

Why this stack works: it broadens the search space, triangulates conclusions, then tightens the result into a clear, testable, and appropriately calibrated answer.

### Specification-driven coding (any non-trivial code change)

1. `intent-specification-protocol.md` — state what correct behavior looks like before writing code
2. `output-quality/bounded-self-revision.md` — verify the spec is achievable and self-consistent
3. `step-level-verification-protocol.md` — check each unit of work against the spec before moving on

Why this stack works: spec-first eliminates rework, bounded self-revision catches spec gaps early, step-level verification keeps each change aligned with intent.

### Security review or production hardening (especially AI-generated apps)

1. `systems-and-architecture/security-threat-modeling.md` — STRIDE analysis for assets, trust boundaries, and attack vectors
2. `systems-and-architecture/vibe-coding-security-hardening.md` — 9-phase checklist for secrets, auth, RLS, input validation, and secure defaults
3. `judgment-and-routing/unsafe-control-actions-hazard-analysis.md` — check high-consequence actions for timing and sequencing risks
4. `output-quality/tool-interactive-critic.md` — verify security claims against actual code and configuration

Why this stack works: threat modeling finds the holes, the hardening checklist covers the vulnerabilities AI tools reliably miss, hazard analysis guards dangerous operations, and external verification prevents false confidence in security posture.

### Git disaster recovery (detached HEAD, rebase botch, force-push overwrite)

1. `software-development/git-surgery/SKILL.md` — select the exact protocol for the disaster type
2. `execution/checklist-manifesto.md` — if the recovery has known steps, enforce them
3. `output-quality/tool-interactive-critic.md` — verify the recovered state before continuing work

Why this works: most git "disasters" are actually deterministic state machines. Git-surgery maps each failure mode to a pre-verified protocol, the checklist prevents skip-ahead errors during execution, and external verification confirms the repo is sane before the agent resumes coding.

### Large codebase navigation with structured queries

1. `software-development/code-knowledge-graph-mcp/SKILL.md` — index the repo and query symbols/call-graphs structurally

2. `execution/keyword-agnostic-logic-locator/SKILL.md` — when semantic search is ambiguous, find code by structure

Why this works: the MCP server eliminates grep noise by returning structured symbol data (definitions, imports, call sites), and the logic locator handles cases where the right code doesn't match the query keywords.

### Unified developer diagnostics (lint/test/typecheck)

1. `software-development/dev-diagnostics-mcp/SKILL.md` — run diagnostics and get structured JSON output
2. `software-development/lint-battalion/SKILL.md` — for bulk mechanical errors, run the auto-fix battalion
3. `software-development/pre-deployment-gate/SKILL.md` — final contamination check before committing

Why this works: the MCP server normalizes output from 6+ tools (ESLint, Biome, Ruff, tsc, Vitest, pytest) into a single schema, lint-battalion handles mass remediation, and the pre-deployment gate catches contamination from sloppy fixes.

### Long-horizon tasks (migrations, multi-file changes, complex bugs)

1. `execution/context-lifecycle-manager/SKILL.md` — track token budget + decay + pruning before it silently overflows (absorbs context-budget-operator)
2. `execution/trajectory-guard/SKILL.md` — detect failure spirals and force strategy changes
3. `execution/assumption-grounding/SKILL.md` — verify assumptions before each major decision
4. `execution/pragmatic-programmer-state-machine.md` — keep changes bounded and reversible

Why this stack works: long tasks are where agents fail most — context overflow, failure spirals, and specification drift compound over many turns. Budget tracking prevents silent instruction loss, trajectory guard catches stuck execution, assumption grounding prevents hallucinated facts from compounding, and the pragmatist protocol keeps scope bounded.

## Hybrid Skill Protocols

These skills fuse 2-3 existing skills into single protocols, eliminating loading overhead and enforcing phase sequencing. Use them instead of loading the component skills separately.

| Hybrid                                                                                               | Fuses                                                                      | When to Use                                                                         |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`task-intake-protocol`](../judgment-and-routing/task-intake-protocol/SKILL.md)                      | Cynefin + ETTO + RPT                                                       | Before ANY non-trivial task                                                         |
| [`pre-deployment-gate`](../software-development/pre-deployment-gate/SKILL.md)                        | Pre-Push Review + Vibe Coding Security                                     | Before pushing/deploying code                                                       |
| [`requirement-crystallization-protocol`](../execution/requirement-crystallization-protocol/SKILL.md) | Socratic + Intent Spec                                                     | Before coding when requirements are vague                                           |
| [`legacy-rescue-protocol`](../execution/legacy-rescue-protocol/SKILL.md)                             | WELC + Refactoring State Machine                                           | Changing untested/legacy code                                                       |
| [`self-verify-pipeline`](../output-quality/self-verify-pipeline/SKILL.md)                            | BSR + TIC + Claim Verification                                             | Verifying output before committing                                                  |
| [`failure-analysis-protocol`](../judgment-and-routing/failure-analysis-protocol/SKILL.md)            | Pre-Mortem + Inversion + 2nd-Order                                         | Before high-stakes decisions                                                        |
| [`long-task-survival-kit`](../execution/long-task-survival-kit/SKILL.md)                             | Assumption + Trajectory + Context Budget                                   | Tasks with 10+ tool calls                                                           |
| [`security-review-protocol`](../systems-and-architecture/security-review-protocol/SKILL.md)          | STRIDE + UCA + Vibe Coding Security                                        | Security review before deployment                                                   |
| [`debug-to-fix-pipeline`](../debugging/debug-to-fix-pipeline.md)                                     | Abductive Debug + Debug Subagent + Instrumentation + Purify + Patch Repair | End-to-end non-trivial debugging                                                    |
| [`occam-mcts`](../orchestration/occam-mcts/SKILL.md)                                                 | Occam's Razor + Monte Carlo Tree Search                                    | Complexity-ranked branch exploration; stop when simplest viable branch is confirmed |
| [`occam-abduction`](../judgment-and-routing/occam-abduction/SKILL.md)                                | Occam's Razor + Abductive Reasoning                                        | Select simplest surviving hypothesis from competing explanations                    |
| [`reasoning-integrity-chain`](../reasoning/reasoning-integrity-chain.md)                             | Faithfulness + Claims + Verification + Selective Halt                      | High-stakes reasoning integrity                                                     |
| [`system-architecture-audit`](../systems-and-architecture/system-architecture-audit.md)              | DDIA + DDD + Thinking in Systems + Release It                              | Comprehensive architecture review                                                   |
| [`speculative-exploration-protocol`](../execution/speculative-exploration-protocol.md)               | Speculative Drafting + Tree of Thoughts + PRM                              | Explore alternatives with process rewards                                           |
| [`iterative-improvement-cycle`](../execution/iterative-improvement-cycle.md)                         | Toyota Kata + PDCA + Philosophy of Software Design                         | Iterative improvement with measurement + design quality                             |

### Occam-first debugging or design

1. [`judgment-and-routing/occams-razor/SKILL.md`](../..) — rank alternatives simplest → most complex before any analysis
2. [`judgment-and-routing/occam-abduction/SKILL.md`](../..) — generate hypotheses, audit evidence, select simplest surviving explanation
3. [`debugging/occam-root-cause/SKILL.md`](../..) — verify the simplest root cause with falsification before fixing
4. [`debugging/occam-minimal-repro/SKILL.md`](../..) — rank triggers by complexity, stop at first tier that reproduces
5. [`orchestration/occam-mcts/SKILL.md`](../..) — if multiple fix branches exist, explore simplest first and stop when simplest viable branch is confirmed

Why this stack works: simplicity is the selection criterion at every stage — hypothesis generation, root cause selection, trigger testing, and fix branch exploration. Complexity is not free; it has to earn its way in.

---

## If you are unsure where to begin

A practical default sequence is:

1. `judgment-and-routing/problem-mode-router-cynefin.md`
2. `judgment-and-routing/thoroughness-check-etto-state-machine.md`
3. `orchestration/socratic-clarification.md` if the task is ambiguous
4. one task-specific protocol or framework from the relevant topic folder
5. `output-quality/tool-interactive-critic.md` if the output depends on facts or code that can be externally checked
6. `execution/toyota-kata-state-machine.md` if the goal is iterative improvement rather than one-shot change
