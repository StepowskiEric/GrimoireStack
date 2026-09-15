# Quick Reference

Generated from `skills/` — the live set of 60 skills.

## Skills that ship runnable tooling

| Skill | Path | Ships |
|---|---|---|
| `api-surface-anchoring` | `software-development/api-surface-anchoring/SKILL.md` | `scripts/api_surface.py` |
| `debug-to-fix-pipeline` | `debugging/debug-to-fix-pipeline/SKILL.md` | `scripts/purify_test_output.py` |
| `git-surgery` | `software-development/git-surgery/SKILL.md` | `scripts/git_surgery.py` |
| `iterative-spec-authoring` | `execution/iterative-spec-authoring/SKILL.md` | `references/conduct-research.sh`, `references/openrouter-judge.sh` |
| `lint-battalion` | `software-development/lint-battalion/SKILL.md` | `scripts/lint_battalion.py` |
| `time-traveling-debugger` | `debugging/time-traveling-debugger/SKILL.md` | `scripts/time_travel.py`, `scripts/time_travel_server.py` |
| `verified-synthesize` | `software-development/verified-synthesize/SKILL.md` | `scripts/dafny_verify.py` |

## All skills by topic

| Skill | Path | Use when |
|---|---|---|
| `debug-issue` | `debugging/debug-issue/SKILL.md` | Need to trace an issue through the system along dataflow edges; Bug spans multiple modules or services; Need to understand how data flows from entry point to failure point |
| `debug-subagent` | `debugging/debug-subagent/SKILL.md` | Bug where fix is not immediately obvious from the error message; Multi-file bugs requiring runtime state inspection; Bugs where static analysis (reading code) hasn't revealed the root cause |
| `debug-to-fix-pipeline` | `debugging/debug-to-fix-pipeline/SKILL.md` | bug-not-obvious-from-error; multi-file-runtime-bug; silent-logic-error |
| `environment-recovery` | `debugging/environment-recovery/SKILL.md` | command-not-found-but-installed; silent-build-failure; eacces-enspoc-eaddrinuse |
| `escalation-ladder` | `debugging/escalation-ladder/SKILL.md` | Agent has tried 3+ approaches without progress; trajectory-guard fires but agent doesn't know what to do next; Same error message appearing after multiple fix attempts |
| `minimal-reproduction` | `debugging/minimal-reproduction/SKILL.md` | Bug manifests at runtime but no test covers the buggy path; Agent is debugging by repeatedly running the full app instead of a targeted test; I can see the bug in the UI but I can't isolate it in a test |
| `network-api-debugging` | `debugging/network-api-debugging/SKILL.md` | cors-error; auth-token-issue; rate-limit-429 |
| `specter` | `debugging/specter/SKILL.md` | Multiple plausible causes and your first guess is suspect; Crash site is not the root cause (deferred execution, async, state machine); Debugging by reasoning from symptom back to cause |
| `time-traveling-debugger` | `debugging/time-traveling-debugger/SKILL.md` | runtime-error-no-obvious-cause; wrong-value-mystery; heisenbug |
| `unit-test-debugging` | `development/unit-test-debugging/SKILL.md` | test-failure-debugging; source-of-truth-diagnosis; test-overfitting-prevention |
| `intent-specification-protocol` | `execution/intent-specification-protocol/SKILL.md` | ambiguous-request; over-engineering-risk; behavior-preservation |
| `iterative-spec-authoring` | `execution/iterative-spec-authoring/SKILL.md` | detailed-spec-needed; multi-concern-feature; judge-review-cycle |
| `legacy-rescue-protocol` | `execution/legacy-rescue-protocol/SKILL.md` | brittle-code-change; characterize-before-change; legacy-refactor-anti-loop |
| `pdca-deming` | `execution/pdca-deming/SKILL.md` | process-improvement; measurement-cycle; verify-before-standardize |
| `split-large-files` | `execution/split-large-files/SKILL.md` | File nearing or exceeding ~500 lines; Need to refactor a large module or extract functions; Reviewing a PR with oversized files |
| `summarize` | `execution/summarize/SKILL.md` | Session quality is degraded; Need to hand off mid-work; Must preserve context before a /new |
| `trajectory-guard` | `execution/trajectory-guard/SKILL.md` | Agent is repeating the same approach without progress; Specification drift detected; Same error appearing after multiple fix attempts |
| `advocatus-diaboli` | `judgment-and-routing/advocatus-diaboli/SKILL.md` | proposal-stress-test; high-stakes-decision; anchoring-break |
| `cognitive-bias-checklist` | `judgment-and-routing/cognitive-bias-checklist/SKILL.md` | slow-mode-bias-audit; pre-delivery-recommendation; estimate-calibration |
| `counterfactual-policy-testing` | `judgment-and-routing/counterfactual-policy-testing/SKILL.md` | decision-vs-alternatives; causation-fallacy-risk; high-stakes-decision |
| `evidence-grounding` | `judgment-and-routing/evidence-grounding/SKILL.md` | Acting on something read earlier (file, log, test output, doc); First edits in an unfamiliar or fast-changing codebase; Reporting task status or claiming work is verified |
| `explore-vs-exploit-state-machine` | `judgment-and-routing/explore-vs-exploit-state-machine/SKILL.md` | explore-vs-commit; search-stopping-rule; research-budget |
| `failure-swarm` | `judgment-and-routing/failure-swarm/SKILL.md` | Swarm 3-5 critic personas over a spec to surface failure modes pre-implementation. User-in… |
| `first-principles` | `judgment-and-routing/first-principles/SKILL.md` | conventional-solutions-failing; inherited-framing; ground-up-reasoning |
| `future-mortem` | `judgment-and-routing/future-mortem/SKILL.md` | Implementation is complete and needs a future-failure review before being called done; Need to know what the code will cost the project in six months; Code will be built upon by future features |
| `occams-razor` | `judgment-and-routing/occams-razor/SKILL.md` | over-engineering-risk; premature-abstraction; scope-creep-risk |
| `pre-mortem-state-machine` | `judgment-and-routing/pre-mortem-state-machine/SKILL.md` | plan-validation; failure-assumption; risk-ranking |
| `recognition-primed-triage-state-machine` | `judgment-and-routing/recognition-primed-triage-state-machine/SKILL.md` | urgent-triage; incident-response; rapid-first-action |
| `reference-class-forecasting` | `judgment-and-routing/reference-class-forecasting/SKILL.md` | timeline-estimation; success-probability; outside-view-before-inside |
| `steelmanning` | `judgment-and-routing/steelmanning/SKILL.md` | A recommendation needs stress-testing; Need to test whether the opposing position is stronger than it appears; Confirmation bias or overconfidence is a risk |
| `thoroughness-check-etto-state-machine` | `judgment-and-routing/thoroughness-check-etto-state-machine/SKILL.md` | preflight-gate; rigor-classification; evidence-threshold |
| `unsafe-control-actions-hazard-analysis` | `judgment-and-routing/unsafe-control-actions-hazard-analysis/SKILL.md` | high-consequence-action; irreversible-damage-risk; hazard-analysis-before-acting |
| `monte-carlo-tree-search` | `orchestration/monte-carlo-tree-search/SKILL.md` | competing-strategies; search-effort-allocation; bounded-probes |
| `octopus` | `orchestration/octopus/SKILL.md` | 3-plus-parallel-workstreams; shared-contract-parallelism; wall-clock-speedup |
| `pre-flight-intent-verification` | `orchestration/pre-flight-intent-verification/SKILL.md` | Request has ambiguity, blast radius, or irreversible side effects; Before any significant code change, mutation, or external action; Need to map assumptions before acting |
| `scout` | `orchestration/scout/SKILL.md` | Large codebase where direct reading wastes attention; Need scoped, distilled findings rather than raw file dumps; Main task needs file context not already in memory |
| `subagent-composer` | `orchestration/subagent-composer/SKILL.md` | subagent-brief; delegation-failure; context-loading |
| `subagent-laws` | `orchestration/subagent-laws/SKILL.md` | sub-agent-brief-composition; scope-discipline-enforcement; test-integrity |
| `documentation-craft` | `output-quality/documentation-craft/SKILL.md` | technical-writing; code-to-docs; outline-first |
| `rubric-gate` | `output-quality/rubric-gate/SKILL.md` | Task where 'done' is vague or contested; Output will face review or automated eval; Rework caused by unclear acceptance criteria |
| `self-verify-pipeline` | `output-quality/self-verify-pipeline/SKILL.md` | Outputs risk unverified confidence; Need escalating verification for agent output; Need to catch different failure modes at different verification levels |
| `effective-web-search` | `research/effective-web-search/SKILL.md` | Need to look up an error, library behavior, framework quirk, or bug; Need official-docs-first, version-aware research; Need full GitHub issue follow-through |
| `api-surface-anchoring` | `software-development/api-surface-anchoring/SKILL.md` | Using any external library, SDK, or API you are not 100% sure of; Libraries released or updated after your LLM's training cutoff; Niche or low-training-count libraries |
| `codebase-divide-conquer-search` | `software-development/codebase-divide-conquer-search/SKILL.md` | large-codebase-search; vocabulary-mismatch; multi-module-target |
| `coordinated-change` | `software-development/coordinated-change/SKILL.md` | multi-file-change; api-contract-change; shared-type-update |
| `git-surgery` | `software-development/git-surgery/SKILL.md` | git-disaster-recovery; detached-head; botched-rebase |
| `lint-battalion` | `software-development/lint-battalion/SKILL.md` | mass-lint-debt; post-rule-change-cleanup; pre-commit-lint-sprint |
| `llm-pre-push-review` | `software-development/llm-pre-push-review/SKILL.md` | Before pushing AI-authored code; Reviewing code generated by an LLM for systematic blind spots; Any diff where "it looks right" without running it |
| `review-ladder-plus` | `software-development/review-ladder-plus/SKILL.md` | pre-merge-production-qa; security-sensitive-review; data-mutation-review |
| `verified-synthesize` | `software-development/verified-synthesize/SKILL.md` | Critical bugs: security, memory safety, financial calculations; Small pure function where a wrong result is expensive; Pre-refactor spec locking — capture behavior before changing a function |
| `verify-before-integrate` | `software-development/verify-before-integrate/SKILL.md` | skill-system-integration; research-paper-implementation; abstract-to-concrete-mapping |
| `cross-domain-analogy-generator` | `systems-and-architecture/cross-domain-analogy-generator/SKILL.md` | repeated-failed-attempts; local-optima-trap; creative-block |
| `everything-as-code-conceptualizer` | `systems-and-architecture/everything-as-code-conceptualizer/SKILL.md` | messy-problem-analysis; hidden-assumptions; requirements-clarification |
| `feature-architecture` | `systems-and-architecture/feature-architecture/SKILL.md` | feature-architecture-planning; ownership-decision; module-boundaries |
| `release-it-stability` | `systems-and-architecture/release-it-stability/SKILL.md` | distributed-system-resilience; cascading-failure-prevention; production-readiness-review |
| `security-review-protocol` | `systems-and-architecture/security-review-protocol/SKILL.md` | comprehensive-security-review; stride-threat-modeling; llm-vulnerability-audit |
| `system-architecture-audit` | `systems-and-architecture/system-architecture-audit/SKILL.md` | Auditing an existing system for architectural weaknesses; Need to evaluate boundaries, data flow, and stability; Need to reveal structural problems before they cascade |
| `thinking-in-systems-state-machine` | `systems-and-architecture/thinking-in-systems-state-machine/SKILL.md` | feedback-loops; delayed-effects; multi-step-cascades |
| `vibe-coding-security-hardening` | `systems-and-architecture/vibe-coding-security-hardening/SKILL.md` | pre-deploy-hardening; vibe-code-review; owasp-checklist |
| `e2e-crosscheck` | `testing/e2e-crosscheck/SKILL.md` | post-refactor-e2e-audit; pre-release-test-reconciliation; test-selector-drift |
