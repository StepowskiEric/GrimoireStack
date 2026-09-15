# Skill Catalog

The 58 skills in this repository, generated from `skills/*/*/SKILL.md`.
Each entry lists the file path, what the skill is, its triggers, and the supporting files it ships.

---

## 🔧 Debugging — Find and fix defects

`skills/debugging/`

### `debugging/debug-issue/SKILL.md`

**What it is:** Force the reproduce → isolate → fix → verify cycle. Graph-powered code navigation traces issues through the system along dataflow edges. Use when the bug spans multiple modules or services, the crash site isn't the cause, or state diverges across an async boundary.

**Triggers:** `Need to trace an issue through the system along dataflow edges`, `Bug spans multiple modules or services`, `Need to understand how data flows from entry point to failure point`, `Crash site is symptomatic, not causal — the real bug is upstream`, `State corruption happens across module boundaries (auth, caching, async)`

### `debugging/debug-subagent/SKILL.md`

**What it is:** Gate debugging behind a dedicated subagent — consult it before any code edit. Wraps debugger complexity behind natural-language queries. Use when the fix is not immediately obvious from the error, for multi-file bugs needing runtime state inspection, or when static analysis hasn't revealed the root cause.

**Triggers:** `Bug where fix is not immediately obvious from the error message`, `Multi-file bugs requiring runtime state inspection`, `Bugs where static analysis (reading code) hasn't revealed the root cause`

### `debugging/debug-to-fix-pipeline/SKILL.md`

**What it is:** 6-phase pipeline that increases evidence quality each phase while cutting token waste: context → hypothesis → instrument → capture → purify → patch → verify.

**Triggers:** `bug-not-obvious-from-error`, `multi-file-runtime-bug`, `silent-logic-error`, `first-patch-attempt-failed`, `hard-bug`, `stuck-on-debugging`

**Ships:** `references/conquest-mode.md`, `scripts/purify_test_output.py`

### `debugging/environment-recovery/SKILL.md`

**What it is:** Diagnose and fix broken development environments — missing tools, wrong versions, corrupted caches, full disks, permission drift, and dependency hell. The skill every other debugging skill assumes.

**Triggers:** `command-not-found-but-installed`, `silent-build-failure`, `eacces-enspoc-eaddrinuse`, `wrong-tool-version`, `stale-cache-symptoms`, `peer-dependency-conflict`, `lockfile-out-of-sync`

**Ships:** `references/common-failure-signatures.md`

### `debugging/escalation-ladder/SKILL.md`

**What it is:** Structured protocol for when an agent is stuck — escalating from self-recovery to user collaboration to full retreat. Fills the gap between trajectory-guard (detects stuck) and summarize (bails out).

**Triggers:** `Agent has tried 3+ approaches without progress`, `trajectory-guard fires but agent doesn't know what to do next`, `Same error message appearing after multiple fix attempts`, `Context window growing without convergence`, `Agent finds itself re-reading the same files`, `Agent is generating patches that don't change the failure output`, `Agent has been debugging for 30+ minutes without a clear hypothesis`, `Multiple debugging skills attempted without resolution`

**Ships:** `references/escalation-decision-tree.md`

### `debugging/minimal-reproduction/SKILL.md`

**What it is:** Write the smallest possible test that demonstrates the bug, then use it as ammunition for debugging.

**Triggers:** `Bug manifests at runtime but no test covers the buggy path`, `Agent is debugging by repeatedly running the full app instead of a targeted test`, `I can see the bug in the UI but I can't isolate it in a test`, `Agent is about to patch code without a test that verifies the fix`, `Test suite passes but the feature still doesn't work (untested path)`, `Agent wants to use debug-to-fix-pipeline but has no failing test to start Phase 3`

**Ships:** `references/test-templates.md`

### `debugging/network-api-debugging/SKILL.md`

**What it is:** Diagnose and fix network and API failures — CORS, auth token issues, rate limiting, redirect chains, WebSocket drops, and HTTP request/response mismatches.

**Triggers:** `cors-error`, `auth-token-issue`, `rate-limit-429`, `redirect-chain`, `websocket-drop`, `works-in-curl-not-app`

**Ships:** `references/http-status-quick-reference.md`

### `debugging/specter/SKILL.md`

**What it is:** Abduce the bug — generate competing hypotheses, locate code by structural relationship, then disconfirm until one survivor remains. Use when the crash site is not the cause, the bug is 'weird,' or your first instinct is suspect.

**Triggers:** `Multiple plausible causes and your first guess is suspect`, `Crash site is not the root cause (deferred execution, async, state machine)`, `Debugging by reasoning from symptom back to cause`

**Ships:** `references/abductive-reasoning-extended.md`

---

## 🧱 Development — Project layout and language-level work

`skills/development/`

### `development/unit-test-debugging/SKILL.md`

**What it is:** Systematic workflow for fixing failing unit tests by first determining whether the tests or the code under test are the source of truth.

**Triggers:** `test-failure-debugging`, `source-of-truth-diagnosis`, `test-overfitting-prevention`, `flaky-test-investigation`

**Ships:** `references/unit-test-debugging-details.md`

---

## ⚙️ Execution — How-to-do-the-work protocols

`skills/execution/`

### `execution/intent-specification-protocol/SKILL.md`

**What it is:** Crystallize vague coding requests into precise, testable specifications before writing any code. Prevents the Intent-Behavior Mirroring Effect.

**Triggers:** `ambiguous-request`, `over-engineering-risk`, `behavior-preservation`, `unfamiliar-code`

**Ships:** `references/ambiguity-patterns.md`, `references/intent-specification-details.md`

### `execution/iterative-spec-authoring/SKILL.md`

**What it is:** Author a detailed technical spec grounded in research, refine through up to 3 judge-LLM review cycles, then present to the user for final approval.

**Triggers:** `detailed-spec-needed`, `multi-concern-feature`, `judge-review-cycle`, `stakeholder-review`

**Ships:** `references/conduct-research.sh`, `references/openrouter-judge.sh`, `references/spec-authoring-details.md`, `references/spec-template.md`

### `execution/legacy-rescue-protocol/SKILL.md`

**What it is:** Characterize legacy behavior, create seams, then transform in bounded slices with anti-loop protection.

**Triggers:** `brittle-code-change`, `characterize-before-change`, `legacy-refactor-anti-loop`

**Ships:** `references/characterization-checklist.md`

### `execution/pdca-deming/SKILL.md`

**What it is:** Improve a process through a measurement-anchored cycle: plan with a measurable prediction, do, check actual vs predicted, then standardize or escalate. Standardize only what the check confirmed.

**Triggers:** `process-improvement`, `measurement-cycle`, `verify-before-standardize`, `baseline-gap`

**Ships:** `references/kata-improvement-board.md`, `references/pdca-details.md`

### `execution/split-large-files/SKILL.md`

**What it is:** Split large files along change boundaries, not line counts. Investigate before extracting, require strong architectural signals.

**Triggers:** `File nearing or exceeding ~500 lines`, `Need to refactor a large module or extract functions`, `Reviewing a PR with oversized files`, `About to add code to a file that is already large`

### `execution/summarize/SKILL.md`

**What it is:** Emergency stop + perfect handoff report so the next agent loses nothing.

**Triggers:** `Session quality is degraded`, `Need to hand off mid-work`, `Must preserve context before a /new`

**Ships:** `references/handoff-template.md`

### `execution/trajectory-guard/SKILL.md`

**What it is:** Detect agent failure spirals — repetitive loops, specification drift, and stuck trajectories — and forcibly redirect strategy.

**Triggers:** `Agent is repeating the same approach without progress`, `Specification drift detected`, `Same error appearing after multiple fix attempts`, `Context window growing without convergence`

---

## 🧭 Judgment and Routing — Decide what to do, and how rigorously

`skills/judgment-and-routing/`

### `judgment-and-routing/advocatus-diaboli/SKILL.md`

**What it is:** Stress-test a proposal against a separate adversarial sub-agent to break anchoring.

**Triggers:** `proposal-stress-test`, `high-stakes-decision`, `anchoring-break`, `adversarial-review`

**Ships:** `references/advocatus-diaboli-details.md`

### `judgment-and-routing/cognitive-bias-checklist/SKILL.md`

**What it is:** Explicit checklist to catch bias contamination before finalizing slow-mode recommendations.

**Triggers:** `slow-mode-bias-audit`, `pre-delivery-recommendation`, `estimate-calibration`, `high-consequence-decision`

**Ships:** `references/bias-checklist-details.md`

### `judgment-and-routing/counterfactual-policy-testing/SKILL.md`

**What it is:** Compare a decision against null, opposite, and partial counterfactuals before committing.

**Triggers:** `decision-vs-alternatives`, `causation-fallacy-risk`, `high-stakes-decision`, `default-path-just-do-it`

**Ships:** `references/counterfactual-details.md`

### `judgment-and-routing/evidence-grounding/SKILL.md`

**What it is:** Resolve every load-bearing observation against current evidence before acting: freshness checks on what you read, an early falsifying probe after the first edit, and receipts on every progress claim.

**Triggers:** `Acting on something read earlier (file, log, test output, doc)`, `First edits in an unfamiliar or fast-changing codebase`, `Reporting task status or claiming work is verified`

**Ships:** `RESEARCH.md`, `references/worked-example.md`

### `judgment-and-routing/explore-vs-exploit-state-machine/SKILL.md`

**What it is:** Explicit explore/exploit protocol: frame the decision, budget the search, explore with purpose, stop deliberately, act when search stops earning its keep.

**Triggers:** `explore-vs-commit`, `search-stopping-rule`, `research-budget`, `decision-support`

**Ships:** `references/explore-details.md`

### `judgment-and-routing/failure-swarm/SKILL.md`

**What it is:** Swarm 3-5 critic personas over a spec to surface failure modes pre-implementation. User-invoked; type `/failure-swarm`.

### `judgment-and-routing/future-mortem/SKILL.md`

**What it is:** After code is written, assume it will cause future pain and work backward to find what will bite: debt with interest, extension traps, hidden assumptions, maintenance memory, time bombs, and upgrade cliffs. Use when implementation is done and the agent must surface what the code will cost the project later.

**Triggers:** `Implementation is complete and needs a future-failure review before being called done`, `Need to know what the code will cost the project in six months`, `Code will be built upon by future features`, `Post-implementation risk audit`

### `judgment-and-routing/occams-razor/SKILL.md`

**What it is:** Favor the simplest sufficient explanation or solution. Try the simplest thing that fits the evidence before escalating.

**Triggers:** `over-engineering-risk`, `premature-abstraction`, `scope-creep-risk`, `simplest-fit-first`

**Ships:** `references/occam-details.md`

### `judgment-and-routing/pre-mortem-state-machine/SKILL.md`

**What it is:** Validate a plan before execution: assume failure has already happened, generate specific failure narratives, rank them, and adjust the plan.

**Triggers:** `plan-validation`, `failure-assumption`, `risk-ranking`, `pre-execution-gate`

**Ships:** `references/pre-mortem-details.md`

### `judgment-and-routing/recognition-primed-triage-state-machine/SKILL.md`

**What it is:** Gated incident-response protocol: recognize the pattern, simulate the first action, act within scope, reassess, hand off.

**Triggers:** `urgent-triage`, `incident-response`, `rapid-first-action`, `pattern-recognition-gate`

**Ships:** `references/triage-details.md`

### `judgment-and-routing/reference-class-forecasting/SKILL.md`

**What it is:** Anchor to similar past projects before reasoning from the specifics.

**Triggers:** `timeline-estimation`, `success-probability`, `outside-view-before-inside`, `optimism-bias-risk`

**Ships:** `references/forecasting-details.md`

### `judgment-and-routing/steelmanning/SKILL.md`

**What it is:** Construct the strongest opposing case before committing to a recommendation.

**Triggers:** `A recommendation needs stress-testing`, `Need to test whether the opposing position is stronger than it appears`, `Confirmation bias or overconfidence is a risk`

### `judgment-and-routing/thoroughness-check-etto-state-machine/SKILL.md`

**What it is:** Gate task execution by the Efficiency-Thoroughness Trade-Off: classify rigor 1-5, meet the evidence bar, act within the mode, validate to match.

**Triggers:** `preflight-gate`, `rigor-classification`, `evidence-threshold`, `risk-escalation`

**Ships:** `references/etto-details.md`

### `judgment-and-routing/unsafe-control-actions-hazard-analysis/SKILL.md`

**What it is:** Analyze how a control action could become unsafe before recommending or performing it.

**Triggers:** `high-consequence-action`, `irreversible-damage-risk`, `hazard-analysis-before-acting`

**Ships:** `references/ai-agent-hazards.md`, `references/worked-example.md`

---

## 🐙 Orchestration — Coordinate context and sub-agents

`skills/orchestration/`

### `orchestration/monte-carlo-tree-search/SKILL.md`

**What it is:** Allocate search effort to branches that earn it through probes and scoring.

**Triggers:** `competing-strategies`, `search-effort-allocation`, `bounded-probes`, `branch-scoring`

**Ships:** `references/mcts-details.md`, `references/mcts-node-schema.md`

### `orchestration/octopus/SKILL.md`

**What it is:** Coordinate parallel sub-agents with bounded concurrency — define shared contracts, delegate with auto-healing arms, retract on failure.

**Triggers:** `3-plus-parallel-workstreams`, `shared-contract-parallelism`, `wall-clock-speedup`, `local-subtask-autonomy`

**Ships:** `references/concrete-example.md`, `references/limitations-gotchas.md`

### `orchestration/pre-flight-intent-verification/SKILL.md`

**What it is:** Surface the critical assumption, crystallize intent into testable spec, ground facts before acting.

**Triggers:** `Request has ambiguity, blast radius, or irreversible side effects`, `Before any significant code change, mutation, or external action`, `Need to map assumptions before acting`

**Ships:** `references/pre-flight-record-template.md`

### `orchestration/scout/SKILL.md`

**What it is:** Scout context — a fast sub-agent reads files and returns only distilled relevant context, saving tokens and reducing distraction for the main model. Use when the codebase is large, you need scoped findings rather than raw file dumps, or the main task needs file context you don't already have.

**Triggers:** `Large codebase where direct reading wastes attention`, `Need scoped, distilled findings rather than raw file dumps`, `Main task needs file context not already in memory`

**Ships:** `references/model-comparison.md`, `references/scout-config.yaml`, `references/scouting-patterns.md`

### `orchestration/subagent-composer/SKILL.md`

**What it is:** Compose high-context sub-agent briefs that eliminate first-pass failures.

**Triggers:** `subagent-brief`, `delegation-failure`, `context-loading`, `skill-selection`

**Ships:** `references/invocation-templates.md`, `references/subagent-composer-details.md`

### `orchestration/subagent-laws/SKILL.md`

**What it is:** Standing behavioral constraints every sub-agent must follow. Enforce scope discipline, test integrity, and communication standards.

**Triggers:** `sub-agent-brief-composition`, `scope-discipline-enforcement`, `test-integrity`, `communication-standards`

**Ships:** `references/subagent-laws-details.md`

---

## 📐 Output Quality — Shape and verify what you hand over

`skills/output-quality/`

### `output-quality/documentation-craft/SKILL.md`

**What it is:** Multi-phase pipeline from outline to verified explanation, audience-driven and source-grounded.

**Triggers:** `technical-writing`, `code-to-docs`, `outline-first`, `doc-quality-verification`

**Ships:** `references/documentation-craft-details.md`

### `output-quality/rubric-gate/SKILL.md`

**What it is:** Write a rubric of binary done-criteria before implementing, then gate on it: every criterion shows PASS with evidence before work ships.

**Triggers:** `Task where 'done' is vague or contested`, `Output will face review or automated eval`, `Rework caused by unclear acceptance criteria`

**Ships:** `RESEARCH.md`, `references/rubric-example.md`

### `output-quality/self-verify-pipeline/SKILL.md`

**What it is:** Escalating verification chain of bounded revision, claim decomposition, and tool-grounded critique.

**Triggers:** `Outputs risk unverified confidence`, `Need escalating verification for agent output`, `Need to catch different failure modes at different verification levels`

**Ships:** `references/verification-templates.md`

---

## 🔎 Research — Gather facts you can cite

`skills/research/`

### `research/effective-web-search/SKILL.md`

**What it is:** Web search discipline for technical research. Official-docs-first, version-aware, full GitHub issue follow-through.

**Triggers:** `Need to look up an error, library behavior, framework quirk, or bug`, `Need official-docs-first, version-aware research`, `Need full GitHub issue follow-through`, `Risk of latching onto the first outdated result`

---

## 💻 Software Development — Day-to-day engineering work

`skills/software-development/`

### `software-development/api-surface-anchoring/SKILL.md`

**What it is:** Verify every external API call against current docs to prevent hallucinated APIs.

**Triggers:** `Using any external library, SDK, or API you are not 100% sure of`, `Libraries released or updated after your LLM's training cutoff`, `Niche or low-training-count libraries`, `Internal/SDK packages whose API may differ from documentation`, `Any code that imports from pip install packages, npm packages, or external REST/gRPC APIs`

**Ships:** `scripts/api_surface.py`

### `software-development/codebase-divide-conquer-search/SKILL.md`

**What it is:** Divide a large codebase into summary-ranked zones and conquer each with a parallel sub-agent. Find code by behavior, not by name.

**Triggers:** `large-codebase-search`, `vocabulary-mismatch`, `multi-module-target`, `no-obvious-start-file`

**Ships:** `references/codebase-details.md`, `references/search-strategies.md`

### `software-development/coordinated-change/SKILL.md`

**What it is:** Ensure consistency when a fix or feature requires touching 2+ files that must stay consistent.

**Triggers:** `multi-file-change`, `api-contract-change`, `shared-type-update`, `schema-migration`

**Ships:** `references/common-patterns.md`

### `software-development/git-surgery/SKILL.md`

**What it is:** Recover from local git disasters: detached HEAD, botched rebase, accidental commits, merge conflicts.

**Triggers:** `git-disaster-recovery`, `detached-head`, `botched-rebase`, `merge-conflict-hell`, `accidental-commit`

**Ships:** `references/git-surgery-protocols.md`, `scripts/git_surgery.py`

### `software-development/lint-battalion/SKILL.md`

**What it is:** Batch-process 50+ linter errors as a bulk remediation problem, not 50 separate decisions.

**Triggers:** `mass-lint-debt`, `post-rule-change-cleanup`, `pre-commit-lint-sprint`, `stricter-lint-onboarding`

**Ships:** `references/lint-battalion-details.md`, `scripts/lint_battalion.py`

### `software-development/llm-pre-push-review/SKILL.md`

**What it is:** Checklist and protocol for catching systematic LLM coding failures: overcorrection, hallucinated logic, silent vulnerabilities, missing edge cases.

**Triggers:** `Before pushing AI-authored code`, `Reviewing code generated by an LLM for systematic blind spots`, `Any diff where "it looks right" without running it`

**Ships:** `references/gate-checklist.md`, `references/llm-failure-modes.md`, `references/review-patterns.md`, `references/ts-common-hallucinations.md`, `references/ts-eslint-rules.md`, `references/ts-review-checklist.md`, `references/ts-semgrep-rules.md`, `references/ts-silent-failures.md`, `references/ts-verification-protocol.md`

### `software-development/review-ladder-plus/SKILL.md`

**What it is:** Multi-agent code review ladder for production-grade QA: security, auth, data, concurrency.

**Triggers:** `pre-merge-production-qa`, `security-sensitive-review`, `data-mutation-review`, `concurrency-review`

**Ships:** `references/prompt-templates.md`, `references/review-ladder-details.md`

### `software-development/verified-synthesize/SKILL.md`

**What it is:** Verify code correctness through formal Dafny specifications — given a natural language spec, produce provably correct code with pre/postconditions and loop invariants. Use for critical bugs in security, memory safety, or financial calculations; pre-refactor spec locking; or API contracts across module boundaries.

**Triggers:** `Critical bugs: security, memory safety, financial calculations`, `Small pure function where a wrong result is expensive`, `Pre-refactor spec locking — capture behavior before changing a function`, `Bug reports with no test — verify the fix against a formal spec`, `API contracts — enforce pre/postconditions across module boundaries`

**Ships:** `RESEARCH.md`, `references/dafny-patterns.md`, `scripts/dafny_verify.py`

### `software-development/verify-before-integrate/SKILL.md`

**What it is:** Verify the actual system behavior rather than matching abstract terminology when integrating research or external docs.

**Triggers:** `skill-system-integration`, `research-paper-implementation`, `abstract-to-concrete-mapping`, `integration-documentation`

**Ships:** `references/verify-details.md`

---

## 🏛️ Systems and Architecture — Structure, boundaries, and stability

`skills/systems-and-architecture/`

### `systems-and-architecture/cross-domain-analogy-generator/SKILL.md`

**What it is:** Generate cross-domain analogies — break fixation by mapping problem structures to foreign fields (biology, music, traffic) and transferring insights.

**Triggers:** `repeated-failed-attempts`, `local-optima-trap`, `creative-block`, `fresh-perspective-needed`

**Ships:** `references/analogy-details.md`

### `systems-and-architecture/everything-as-code-conceptualizer/SKILL.md`

**What it is:** Codify messy human problems as pseudocode to reveal hidden assumptions, missing decisions, and edge cases.

**Triggers:** `messy-problem-analysis`, `hidden-assumptions`, `requirements-clarification`, `pre-spec-codification`

**Ships:** `references/everything-as-code-details.md`

### `systems-and-architecture/feature-architecture/SKILL.md`

**What it is:** One rule set for three moments: plan where files live before writing, review completed work, and audit the repo as a living system.

**Triggers:** `feature-architecture-planning`, `ownership-decision`, `module-boundaries`, `post-implementation-architecture-review`, `architectural-drift`, `long-term-health`

**Ships:** `references/architecture-evolution-details.md`, `references/architecture-maintenance-details.md`, `references/feature-architecture-details.md`

### `systems-and-architecture/release-it-stability/SKILL.md`

**What it is:** Circuit breakers, bulkheads, timeouts, load shedding, steady-state hygiene for production failure modes.

**Triggers:** `distributed-system-resilience`, `cascading-failure-prevention`, `production-readiness-review`, `stability-pattern-audit`

**Ships:** `references/stability-details.md`

### `systems-and-architecture/security-review-protocol/SKILL.md`

**What it is:** 4-phase security review fusing STRIDE, hazard analysis, LLM vuln audit, and expanded threat-modeling guidance.

**Triggers:** `comprehensive-security-review`, `stride-threat-modeling`, `llm-vulnerability-audit`

**Ships:** `references/threat-catalog.md`

### `systems-and-architecture/system-architecture-audit/SKILL.md`

**What it is:** 4-phase audit fusing Thinking in Systems, DDD, DDIA, and Release It. Reveals structural problems before they cascade.

**Triggers:** `Auditing an existing system for architectural weaknesses`, `Need to evaluate boundaries, data flow, and stability`, `Need to reveal structural problems before they cascade`

### `systems-and-architecture/thinking-in-systems-state-machine/SKILL.md`

**What it is:** Model stocks, flows, delays, leverage points, and blast radius before touching the system.

**Triggers:** `feedback-loops`, `delayed-effects`, `multi-step-cascades`, `system-boundary-mapping`

**Ships:** `references/systems-details.md`

### `systems-and-architecture/vibe-coding-security-hardening/SKILL.md`

**What it is:** Hardening checklist for vulnerabilities LLMs reliably introduce: exposed secrets, missing RLS, broken auth, injection flaws, insecure defaults.

**Triggers:** `pre-deploy-hardening`, `vibe-code-review`, `owasp-checklist`, `secret-scan`

**Ships:** `references/hardening-details.md`

---

## 🧪 Testing — Test strategy and reconciliation

`skills/testing/`

### `testing/e2e-crosscheck/SKILL.md`

**What it is:** Bidirectional audit between E2E test selectors/assertions and source code. Reconciles every test identifier, text assertion, and navigation route.

**Triggers:** `post-refactor-e2e-audit`, `pre-release-test-reconciliation`, `test-selector-drift`, `untested-ui-states`

**Ships:** `references/crosscheck-details.md`

---
