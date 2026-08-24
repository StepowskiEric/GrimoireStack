# SKILL-AUDIT-BEHAVIOR.md — Behavioral Audit (2026-08-24)

Question: not "are these texts similar" but "if this skill were loaded when relevant,
would it change LLM behavior beyond defaults?"

Method: all 125 SKILL.md files read in full by six independent reviewers using one rubric.
Verdicts: KEEP = imposes non-obvious gates/artifacts/handoffs; WEAK = mostly restates
native model behavior, merge candidate; DELETE = generic advice, fact dump, ceremonial
framework, duplicate job, or unexecutable mechanism.

## Headline
- 125 skills audited: **65 KEEP / 33 WEAK / 27 DELETE**.
- Delete the 27 outright -> 98. Merge the 33 WEAK into their cluster survivors
  -> a catalog of roughly **65-70 skills**, which is the right size.
- 100 is too many *as currently composed* — about half the corpus adds nothing a
  strong model doesn't do natively or duplicates a sibling's job.

# judgment-and-routing audit

Audited as an LLM consumer: "if loaded when relevant, does this change my behavior for the better beyond my defaults?"

| skill | verdict | one-line reason |
|---|---|---|
| recognition-primed-triage-state-machine | KEEP | Real gated protocol for urgent incidents: declared pattern/confidence, mental simulation gate, bounded reversible first actions, clean handoff record — none of this happens by default under time pressure. |
| advocatus-diaboli | KEEP | Non-obvious core insight (self-critique ≠ critique; use a separate fork-context sub-agent) plus explicit accept/rebut/distinguish loop and confidence-delta measurement. |
| explore-vs-exploit-state-machine | KEEP | Fixes a real LLM failure mode (endless searching with no stopping rule); `search-budget.md` with hard budget, sufficiency criteria, and mandatory continue/stop checkpoints. |
| metacognitive-monitoring | KEEP | KEEP/WITHDRAW × BET/DECLINE probe cross-check with fatal-mismatch HALT is a concrete calibration gate models never run unprompted; withdraw-delta tracking gives it teeth over time. |
| occams-razor | KEEP | Complexity-tier ladder (0 read → 4 new infrastructure) with per-component complexity tax directly attacks documented LLM over-engineering; escalation ordering is enforced, not suggested. |
| reference-class-forecasting | KEEP | Outside-view-before-inside-view with p75 anchoring, range-with-risk output format, and honest adjustment rules — models estimate from the happy path by default. |
| unsafe-control-actions-hazard-analysis | KEEP | STPA four-question analysis (not-given / given / timing / duration) is a genuinely non-obvious hazard frame; refuses irreversible actions without a safeguard story. |
| counterfactual-policy-testing | KEEP | Null/opposite/**partial** counterfactuals with a ≥10% decision rule; the partial counterfactual surfaces proportionality wins that default analysis misses entirely. |
| problem-mode-router-cynefin-state-machine | KEEP | The category's router: hard classification gate with anti-overclassify-Obvious challenge and a domain → response-style → sibling-skill map that actually coordinates this skill family. |
| thoroughness-check-etto-state-machine | KEEP | Preflight rigor classification (1–5) with matched evidence/execution/validation bars and `etto-preflight.md` artifact; prevents both under-rigor on risky work and over-ceremony on trivia. |
| pre-mortem-state-machine | KEEP | Strongest plan-validation gate here: unhedged failure assumption, ≥5 specific narrative stories, root-condition/warning/prevention/contingency profiles, execution verdict with circuit breakers. |
| future-mortem | KEEP | Distinct post-implementation timing; future-cost ledger (cost now vs cost later, pay-now/pay-later verdict) turns vague "tech debt" worry into located, ranked, owned decisions. |
| failure-swarm | KEEP | Multi-round persona swarm with NEW/CHALLENGED/REFINED cross-pollination, diminishing-returns red light, and disagreement-as-artifact synthesis — a different machine than any single-critic skill. |
| bayesian-updating | WEAK | Name-hypotheses-before-evidence and falsifiability checks are good hygiene, but a strong model largely does this when prompted to diagnose; borderline merge into a debugging/diagnosis family. |
| inversion-mental-model-state-machine | WEAK | Guardrail conversion (prevention/detection/containment/recovery) is its only step beyond pre-mortem; functionally a subset of pre-mortem + guard table. Fold the quadrant into pre-mortem and retire. |
| second-order-thinking | WEAK | "Ask and-then-what twice" is close to native reasoning; the plausible-vs-possible rule and time-horizon check add little standalone. Best absorbed as Phase 3 of a unified failure-analysis skill. |
| first-principles | WEAK | Hard/soft/assumed constraint classification is a mild upgrade, but strip-to-foundations reasoning is core native capability; reads as generic thinking advice with a template. |
| cognitive-bias-checklist | WEAK | Bias tables edge toward reference dump, though the check-question + mandatory-correction pairing helps; overlaps metacognitive-monitoring (both post-answer audits) — merge candidates. |
| steelmanning | WEAK | 200 lines whose kernel is one instruction strong models half-follow anyway; the template and residual-tension rule are the value. Merge its template into advocatus-diaboli (self vs fork variants of one job). |
| kahneman-thinking-fast-slow-software-agent | DELETE | Duplicate: its scout/skeptic switch rules and bias pointers are fully covered (better) by thoroughness-check-etto plus cognitive-bias-checklist. No artifact, no gate of its own. |
| six-thinking-hats | DELETE | Ceremonial framework: six rounds of facts/optimism/caution/intuition is structured pros-cons-plus-intuition, which a strong model produces on request; no gate, no artifact, no non-default output. |
| failure-analysis-protocol | DELETE | Explicit fusion of three sibling skills (inversion + pre-mortem + second-order) with thinner versions of each phase — textbook cross-skill duplication; delete in favor of the originals or make it the sole survivor of the cluster. |

## Cluster notes

**Failure-analysis mega-cluster (worst duplication in the category).** Six skills share one job — surface failure modes before/after commitment:
- `pre-mortem-state-machine` (KEEP, best single gate), `inversion-mental-model-state-machine` (WEAK, subset + guardrail quadrants), `second-order-thinking` (WEAK, cascade phase), `failure-analysis-protocol` (DELETE, literal fusion of the previous three), `future-mortem` (KEEP, distinct post-code timing), `failure-swarm` (KEEP, distinct multi-agent machinery).
- Recommended shape: keep pre-mortem (pre-plan), future-mortem (post-code), failure-swarm (heavyweight/user-invoked). Fold inversion's prevention/detection/containment/recovery quadrant and second-order's cascade tracing into pre-mortem as optional deepening phases; delete failure-analysis-protocol outright.

**Fast/slow + audit cluster.** `kahneman-thinking-fast-slow-software-agent`, `thoroughness-check-etto-state-machine`, `cognitive-bias-checklist`, and `metacognitive-monitoring` all police reasoning rigor around commitments. ETTO owns the pre-task rigor gate; metacognitive-monitoring and cognitive-bias-checklist both own the post-answer audit — merge the bias checklist's correction-linked rows into metacognitive-monitoring and delete kahneman.

**Adversarial-review cluster.** `steelmanning` (self, strongest-alternative), `advocatus-diaboli` (separate fork agent, attack), and failure-swarm's Adversary/Skeptic personas overlap. Keep advocatus-diaboli and failure-swarm; move steelmanning's template/residual-tension rule into advocatus-diaboli as the lightweight no-sub-agent variant, then retire it.

**Estimation pair.** `reference-class-forecasting` is the keeper; the cognitive-bias-checklist's planning-fallacy row just delegates back to it — another sign the checklist is a thin router rather than a skill.

**Routing coherence.** `problem-mode-router-cynefin-state-machine` references Explore-vs-Exploit (Complex) and Recognition-Primed Triage (Chaotic) as its downstream skills; deleting skills above does not break this map, but the Cynefin details file (`references/cynefin-details.md`) should be checked for stale skill names after any merges.
# execution audit

| skill | verdict | one-line reason |
|---|---|---|
| assumption-grounding | WEAK | "Check before you assume" is near-default careful behavior for a strong model; the falsifiability framing and session log add marginal value over what good agents already do with ls/grep before edits. |
| blueprint | WEAK | Gap/contradiction detection over a typed schema is the one non-native bit, but it is the fifth skill in this category doing "formalize requirements before acting" — merge its gap checklist into intent-specification-protocol. |
| checklist-manifesto | KEEP | Imposes real discipline an LLM skips: read-do vs do-confirm selection, one-screen limit, pause points, exception triggers, and stop-on-failed-check instead of improvising past a gate. |
| context-budget-operator | DELETE | Core mechanism (assess own token usage, log per-operation consumption, GREEN/YELLOW/RED status) cannot be faithfully executed by the model — it would fabricate the numbers; the rest (prefer signatures over full reads, compress old reasoning) is default behavior. |
| how-to-solve-it-state-machine | WEAK | Frame/recon/hypothesize/plan/reflect mostly restates evidence-before-code discipline; only the Polya analog sub-technique is distinctive, and that does not carry a whole state machine. |
| intent-specification-protocol | KEEP | The invariants/"what must NOT change" step plus the 2–5 Given/When/Then scenarios and hard ambiguity gate are genuinely skipped by LLMs and directly prevent over-engineering. |
| iterative-spec-authoring | KEEP | Concrete artifacts (spec-template.md, spec_revision_log.md) and a bounded judge-review loop with severity taxonomy — a procedure the model would never run unprompted, with a user gate at the end. |
| legacy-rescue-protocol | KEEP | Characterization-tests-first, seams, green slices, transformation budget, and the 3-failures→re-seam breaker counteract the strong LLM default of refactoring brittle code directly. |
| ooda-loop-state-machine | DELETE | Ceremonial framework: Observe/Orient/Decide/Act adds vocabulary, not gates; its circuit breakers duplicate trajectory-guard's job with less specificity. |
| pdca-deming | KEEP | The write-a-measurable-prediction-before-executing and standardize-only-what-check-confirmed rules are concrete, enforceable gates against feel-based iteration. |
| pragmatic-programmer-state-machine | WEAK | Consumer discovery before shared-surface edits is valuable but commonly done anyway; smallest-move/root-cause/stop-early are native; overlaps trajectory-guard's spec-drift control for scope discipline. |
| retrospective | WEAK | Well-known AAR format (facts → well/wrong → five whys → owned action items); a strong model produces most of it natively, so it mostly restates defaults. |
| speculative-drafting-verification | DELETE | "Draft N alternatives and pick the best" is generic thinking advice models do on request; forced full drafts of 3 branches are expensive and self-assigned scores are ceremony. |
| split-large-files | KEEP | Directly corrects a real LLM failure mode (splitting by line count, creating utils/helpers); strong-vs-supporting signals, explicit do-not-split gate, rejection criteria, and cohesive-file list are all non-obvious. |
| step-level-verification-protocol | DELETE | Self-check with fabricated confidence ≥0.8 thresholds is ceremonial; "draft one atomic step, verify, backtrack" is either native or unenforceable without an external checker. |
| structured-feature-planning | WEAK | Purpose-per-search and the NEEDS_CLARIFICATION stop gate are nice, but this is a fourth overlap of plan-before-code; merge the clarification gate into the surviving planning skill. |
| summarize | KEEP | Hard STOP rule plus a sectioned handoff contract forces completeness (paths, outcomes, risks, user quirks) where the default is a vague wrap-up paragraph. |
| toyota-kata-state-machine | DELETE | Its experiment loop explicitly runs PDCA — it is a subset variant of pdca-deming with an obstacle-ranking wrapper; keep one process-improvement cycle skill. |
| trajectory-guard | KEEP | Addresses a failure mode models do not self-monitor: checkpoint cadence, three named spiral types with signal tables, forced strategy change, and a genuine hard-stop circuit breaker. |
| zero-defect-protocol | KEEP | Data-contract-before-architecture, red-team sub-agent, pre-mortem, risky-10% spike — heavy but each phase has a done-gate and artifact; appropriately scoped to mission-critical work. |

## Cluster notes

- **Plan-before-code cluster (5 skills):** `blueprint`, `intent-specification-protocol`, `how-to-solve-it-state-machine`, `structured-feature-planning`, and `zero-defect-protocol` all gate coding behind understanding + formalization. Keep `intent-specification-protocol` (small/surgical changes) and `zero-defect-protocol` (mission-critical tier). Fold blueprint's gap/contradiction scan into intent-spec's references; retire or merge `how-to-solve-it` and `structured-feature-planning` — their distinctive bits (analog reasoning, NEEDS_CLARIFICATION gate) survive as sections of the survivors.
- **Process-improvement cycles:** `pdca-deming` vs `toyota-kata-state-machine` — same job, PDCA is sharper (prediction-anchored Check). Keep PDCA, delete Kata.
- **Spiral/loop control:** `ooda-loop-state-machine`, `trajectory-guard`, and the anti-loop parts of `legacy-rescue-protocol`. Trajectory-guard wins decisively; OODA adds no artifact or gate trajectory-guard lacks.
- **Verification family:** `assumption-grounding` + `step-level-verification-protocol` both sell verify-each-link discipline without an external checker; if any survives, merge assumption-grounding's cheapest-check table into a reference, not a standalone skill.
- **Scope-discipline overlap:** trajectory-guard's Specification Drift detection covers the same ground as pragmatic-programmer's "one smell family per session" and zero-defect's bounded phases — acceptable redundancy since trajectory-guard is meta-monitoring, but don't add more.
# software-development audit

| skill | verdict | one-line reason |
|---|---|---|
| api-design-backward-compatibility | WEAK | Mostly a dump of well-known API-design facts (additive-safe changes, versioning tables, naming style); only the merge-time compatibility checklist is non-default — extract it and drop the rest. |
| api-surface-anchoring | KEEP | Real discipline against hallucinated APIs: verify-before-write plus a persisted `api-surface.jsonl` artifact and companion script; an LLM will not do this unprompted. |
| codebase-divide-conquer-search | KEEP | Concrete parallel zone-search orchestration with summary-tree compression, confidence scoring, cross-validation, and circuit breakers — none of it default behavior. |
| code-review-excellence | DELETE | Generic review advice a strong model already does natively ("use a checklist", "be constructive", "acknowledge good work"); no gate, artifact, or procedure beyond defaults. |
| coordinated-change | KEEP | Imposes map-change-set-first, types→impl→consumers→tests ordering, atomic-edit-then-test, orphan scan, single commit — directly counteracts the sloppy incremental-edit default. |
| critical-system-interrogation | WEAK | The interrogation framing and standards are mostly tone; its structured-verdict/approval-bar gate overlaps review-ladder-plus and super-review-typescript — merge the verdict format elsewhere. |
| git-surgery | KEEP | Diagnostic-first state classification, backup-branch escape hatch before destructive ops, `--force-with-lease` rule, and 10 recovery protocols — valuable under panic conditions where defaults fail. |
| lint-battalion | KEEP | Genuinely non-obvious bulk-remediation pipeline: auto-fix gate, mechanical/semantic/architectural triage, file-disjoint batches, contamination checks, 3-cycle escalation. |
| llm-pre-push-review | KEEP | Targeted 5-pass protocol for LLM-authored code failure modes (execution grounding, security surface, scope creep) with a concrete anti-pattern table — sharpens defaults materially. |
| native-data-fetching | DELETE | Thin restatement of common knowledge (pick React Query vs SWR, handle loading/error states); no procedure, gate, or non-obvious content. |
| pre-deployment-gate | DELETE | Duplicate by construction — passes 1–5 just point back at llm-pre-push-review; the unique content (two production-hardening passes) should fold into that skill. |
| recency-grounding | WEAK | Useful idea (whole-library pre-audit stamp) but heavily overlaps api-surface-anchoring and depends on out-of-category skills (hallucination-anchor-chain, failure-swarm); merge into the anchoring skill as a "library-level depth" mode. |
| review-ladder-plus | KEEP | Dual-mandate adversarial reviewers, mandatory tests-from-findings, proof-required dismissal gate, fresh-context reviewer — a real QA process an LLM would never run by default. |
| super-review-typescript | KEEP | Tool-first five-pass TS review with strict hallucination-verification protocol (check package/node_modules/types before claiming) — complements llm-pre-push-review rather than duplicating it. |
| verified-api-workflow | DELETE | Ceremonial layer on top of api-surface-anchoring: re-wraps the same verification into anchors.jsonl with `# [a1]` comment citations — duplicate job plus bookkeeping overhead. |
| verified-synthesize | KEEP | Unique capability (Dafny machine-checked proofs with spec/invariant workflow and self-healing verify loop) — nothing close to default behavior. |
| verify-before-integrate | KEEP | Enforces terminology-vs-schema verification with an explicit mapping document and red-flag stops before integrating papers/docs — a real trap agents fall into. |

## Cluster notes

- **Review-family bloat (6 skills):** `code-review-excellence`, `llm-pre-push-review`, `super-review-typescript`, `pre-deployment-gate`, `critical-system-interrogation`, `review-ladder-plus`. Consolidate to three: delete `code-review-excellence` (generic), fold `pre-deployment-gate`'s production-hardening passes into `llm-pre-push-review`, and merge `critical-system-interrogation`'s verdict/approval-bar format into either `super-review-typescript` or `review-ladder-plus`. Keep `llm-pre-push-review` (diff-level), `super-review-typescript` (tool-first TS deep dive), and `review-ladder-plus` (multi-agent pre-merge gate) as distinct layers.
- **Verification-family duplication (3+ skills):** `api-surface-anchoring`, `recency-grounding`, and `verified-api-workflow` (plus out-of-category `hallucination-anchor-chain`) cover one job at different scopes. Delete `verified-api-workflow`; absorb `recency-grounding` as a library-level mode of `api-surface-anchoring`. One skill, two depths, one artifact format.
- **Minor overlap:** `coordinated-change` partially overlaps generic multi-file-edit habits, but its explicit ordering and atomic-commit gates justify keeping it.
# debugging audit
| skill | verdict | one-line reason |
|---|---|---|
| bisect-debugging | DELETE | Reference dump of `git bisect` usage the model already knows; the log2 table and state machine add no discipline beyond native behavior. |
| debug-issue | KEEP | Concrete dataflow-trace procedure (seam selection, 3-5 prefixed anchors, divergence-point localization, verify-at-hop-not-crash) that fixes real LLM habits like patching the symptom. |
| debug-subagent | KEEP | Enforces debug-before-edit gating plus confidence-routed iteration — a non-obvious orchestration discipline an unsupervised agent would skip.
| debug-to-fix-pipeline | KEEP | Concrete gated pipeline (pre-flight context, >=3 competing hypotheses, DEBUG:-prefix anchors, duplicate-patch stop rule, root-cause-category prevention); clean handoffs to specter/debug-issue/root-cause-analysis rather than duplication.
| environment-recovery | KEEP | The 8-command vitals sweep + symptom-route table plus the "clean sweep means code bug, stop" exit gate counters the native `npm install` reflex; good first-runner position.
| escalation-ladder | KEEP | Time-boxed 5-level ladder with exit criteria and a mandatory handoff artifact directly attacks the LLM sunk-cost looping failure mode; explicit integration points to sibling skills.
| log-trace-correlation | DELETE | Restates native behavior (map stack frames to files, hypothesize, patch); no gate or artifact a competent LLM wouldn't produce anyway.
| minimal-reproduction | KEEP | Focused pre-requisite skill with hard gates (test must FAIL first, assert expected not buggy behavior, keep test as permanent regression guard) and a clean handoff table into the other debug skills.
| network-api-debugging | KEEP | Domain-specific discipline (capture wire traffic before hypothesizing; 4xx=client vs 5xx=server routing) that redirects the default read-the-code reflex.
| purify-test-output | DELETE | Its keep/discard rules table is already embedded verbatim in debug-to-fix-pipeline Phase 4 (Purify); the rest is mechanical output filtering.
| root-cause-analysis | WEAK | 5 Whys/Ishikawa are native model behavior and its one distinctive idea (faithfulness test) is already in debug-to-fix-pipeline Phase 6; merge into the pipeline as a reference.
| simulate-instrumentation | DELETE | Its instrumentation rules (3-5 targets, DEBUG: prefix, print full objects, truncate >100 items) are copied nearly verbatim into both debug-issue Phase 2b and debug-to-fix-pipeline Phase 2.
| specter | KEEP | Genuine abduction discipline (competing hypotheses with disconfirming conditions, structural not keyword location, confidence thresholds, mandatory Alternative field); clear when-NOT-to-use boundaries vs sibling skills.
| time-traveling-debugger | KEEP | Backed by real tooling (`scripts/time_travel.py`) enabling reverse replay to the divergence point — a capability the model cannot replicate from priors; hard verify-by-re-trace gate.

# systems-and-architecture audit
| skill | verdict | one-line reason |
|---|---|---|
| cross-domain-analogy-generator | DELETE | Generic creativity advice ("map to foreign domains when stuck") the model does natively; no gate or artifact changes the outcome.
| designing-data-intensive-applications-ai | WEAK | Structured table-of-contents of DDIA facts a strong LLM already knows; only the failure-behavior-mandatory gate is mildly additive.
| domain-driven-design | WEAK | Restates standard DDD concepts the model applies by default; the analysis-template artifact alone doesn't clear the bar.
| everything-as-code-conceptualizer | WEAK | Pseudocode-codification lens is plausible but thin — a strong LLM codifies to find gaps unprompted; `// BUG:` marking is the only concrete addition.
| feature-architecture | KEEP | Load-bearing rule set (ownership-before-writing, shared-must-be-earned test, dependency direction per import, delete test) applied at three moments with done-when gates and verdict artifacts.
| improve-codebase-architecture | DELETE | Ceremonial 3-phase shell ("read context, find opportunities, propose changes") with no method, gate, or artifact; its job is covered by feature-architecture's audit mode.
| release-it-stability | KEEP | Forces a per-integration-point timeout/breaker/bulkhead/fallback table plus steady-state unbounded-accumulation hunt and an assessment artifact — a check agents skip by default.
| security-review-protocol | KEEP | Four-lens review with tool-grounded verification gate (UNVERIFIED != fine), minimum bar (S/T/E), and deployment-blocking severity ratings.
| sre-error-budget | WEAK | Error-budget math and policy thresholds are native SRE knowledge; the hard-gate framing is nice but the agent rarely has budget data at decision time.
| system-architecture-audit | KEEP | Umbrella 4-phase audit with per-phase artifacts, explicit exit criteria, and clean delegation to release-it-stability for pattern detail; the sequencing constraints (map before boundaries before data before stability) are real discipline.
| team-topologies-ai | KEEP | Non-obvious transfer of Team Topologies to multi-agent repos (four agent types, time-bounded collaboration, self-service platform rule, God-Agent prevention) — agents don't structure their own ownership this way by default.
| the-goal-theory-of-constraints-ai | WEAK | Restates TOC five focusing steps the model knows; only "ignore non-constraints / exploit before elevate" mildly counters optimization scatter.
| thinking-in-systems-state-machine | KEEP | Hard map-before-write gate with named artifacts (`system-feedback-map.md`, `unknowns-register.md`) and an evidence gate ("no metrics = story, not map") that stops symptom-patching in loop-driven systems.
| vibe-coding-security-hardening | KEEP | Deploy-blocking triage gate, ordered ten-phase checklist, adversarial verification tests (prove controls, don't read code), and sign-off-with-owner artifact.

## Cluster notes

### debugging — merges and duplicates

- **Instrumentation is written three times.** `simulate-instrumentation` (DELETE), `debug-issue` Phase 2b, and `debug-to-fix-pipeline` Phase 2 carry nearly identical rules: 3-5 targets, `DEBUG:`/anchor prefix, print full objects, truncate >100-item collections. Keep the pipeline's copy as canonical; `debug-issue` should reference it instead of restating.
- **Output purification is written twice.** `purify-test-output` (DELETE) duplicates debug-to-fix-pipeline Phase 4 (Purify) rule-for-rule, including the "last 3 lines of stderr" clause. If standalone triggering matters, keep it as a thin pointer to Phase 4 plus the companion script — but as content it adds nothing.
- **Reproduction overlaps.** debug-to-fix-pipeline Phase 0 ("build a fast deterministic pass/fail loop") and `minimal-reproduction` Step 1-4 cover the same ground; minimal-reproduction survives because its test-writing gates (assert expected behavior, test must fail first, keep as regression guard) are sharper and it is explicitly a feeder for the pipeline.
- **Hypothesis generation overlaps.** Pipeline Phase 1 summarizes `specter`'s scoring scheme and defers to it; that handoff is clean — keep both, do not let them drift.
- **RCA is half-absorbed.** The pipeline's faithfulness test in Phase 6 is verbatim `root-cause-analysis`'s core idea; RCA's remaining content (5 Whys, Ishikawa) is native model behavior. Merge into the pipeline's references.
- **Suggested deletion set:** bisect-debugging, log-trace-correlation, purify-test-output, simulate-instrumentation (+ root-cause-analysis merged into pipeline references). That trims the category from 14 to ~9 skills with no lost discipline.

### systems-and-architecture — merges and duplicates

- **The "-ai book summary" family is weak as a cluster.** designing-data-intensive-applications-ai, domain-driven-design, sre-error-budget, the-goal-theory-of-constraints-ai (and cross-domain-analogy-generator, everything-as-code-conceptualizer nearby) are structured summaries of material a strong LLM already knows. Their content survives inside `system-architecture-audit`, which sequences the same disciplines into one gated audit with artifacts. Candidate outcome: keep only system-architecture-audit + release-it-stability (the pattern-detail deep dive) from this cluster, demote the rest to its references.
- **Architecture-review overlap.** feature-architecture (file/module ownership), improve-codebase-architecture (DELETE — empty shell), and system-architecture-audit (whole-system) have distinct scopes; only improve-codebase-architecture duplicates — its three phases are a subset of feature-architecture's audit moment with none of its rules.
- **Security pair is complementary, not duplicate.** security-review-protocol reviews a change (STRIDE per endpoint, tool-verified claims); vibe-coding-security-hardening hardens an AI-generated app pre-deploy (triage gate, ten phases, adversarial tests). Checklist items overlap (secrets, RLS, CORS, rate limits) — cross-reference rather than merge, since triggers differ (change review vs pre-deploy).
- **thinking-in-systems-state-machine vs system-architecture-audit Phase 1** share the stocks/flows/loops/delays map. Acceptable: the state-machine skill owns the intervention loop (evidence gate → smallest leverage-point change → whole-system verify); the audit only consumes the map. Cross-reference the shared template.

### Tally

| category | keep | weak | delete |
|---|---|---|---|
| debugging (14) | 9 | 1 | 4 |
| systems-and-architecture (13) | 6 | 5 | 2 |
# orchestration audit
| skill | verdict | one-line reason |
|---|---|---|
| agentic-design-patterns-orchestrator-state-machine | WEAK | Meta-framework whose gates restate plan→execute→verify; its real content (assumption gating, phase tool rules) is done better and more concretely by pre-flight-intent-verification and separation-of-concerns — merge candidate. |
| monte-carlo-tree-search | KEEP | Imposes bounded probes with explicit scoring, budget-before-branching, and a plain-language pruning policy — agents genuinely commit to the first plausible path without this. |
| navigator | WEAK | Persist-and-resume investigation trails is largely what harness memory does natively; its Scout role duplicates the `scout` skill and its store job duplicates `sop-evolution-memory` — merge into sop-evolution-memory. |
| octopus | KEEP | Concrete contracts-first ordering, workspace layout (_contracts/_status/_wip), 5-arm concurrency cap, compressed-report mandate, and an explicit retract-on-failure procedure — none of this happens by default. |
| pre-flight-intent-verification | KEEP | Non-obvious gates: rank assumptions by consequence×likelihood, ask exactly ONE question, invariant-check GWT scenarios, cheapest-verification grounding table, artifact + circuit breakers. |
| rashomon-triad-hybrid | WEAK | Attack-graph formalism is elaborate machinery for decisions that rarely need it; core value ("surface genuine conflict, don't force consensus") fits in two rules — merge the jury variant or trim heavily. |
| scout | KEEP | Mode table (Lite/Full/Hybrid), scope caps (>8 files = too broad), timeouts, and the delegate-don't-dump rule change real behavior; agents otherwise read 50 files raw. |
| separation-of-concerns | WEAK | Rules-only, no artifact/gate/threshold; "don't diagnose while fixing" is discipline a strong LLM mostly applies, so it restates defaults — fold its five-pairs list into the orchestrator state machine if kept at all. |
| sop-evolution-memory | KEEP | Distill-from-success-only gate, success_count promotion rule, 500-token SOP budget, staleness/versioning policy — concrete quality gates for cross-session learning beyond harness defaults. |
| subagent-composer | KEEP | Fixed 8-section brief contract with context levels and post-return verification ("never trust all tests pass") — briefs are exactly what delegation gets sloppy about; pairs cleanly with subagent-laws. |
| subagent-laws | KEEP | The strongest skill here: scope discipline, test-integrity law (no weakening tests), evidence-backed reporting with exit codes, no unasked commits, no debug artifacts — directly prevents documented LLM failure modes. |
| weak-link-detection-multi-agent | DELETE | Generic "score outputs before aggregating" advice with no threshold, artifact, or scoring rubric; a careful aggregator does this natively and the details live only in references. |

# output-quality audit
| skill | verdict | one-line reason |
|---|---|---|
| bounded-self-revision | WEAK | The 1-draft+2-pass budget and stop conditions are good but are absorbed verbatim by self-verify-pipeline Phase 2 — keep as stop-condition text inside that skill, not standalone. |
| cognitive-load-operator-state-machine | WEAK | Mandatory cognitive-load-map.md per output is ceremony for most answers; the useful residue (load-audit checklist: concepts-per-section, stable naming, state explicit) could be a short section elsewhere. |
| documentation-craft | KEEP | Outline-first pipeline plus a scored verify pass and the non-default rules "update docs in same patch" / "stale docs are defects" / "reference dump ≠ documentation". |
| feynman-technique | DELETE | Generic thinking advice ("explain simply, find where you hand-wave") a strong model does natively when asked to explain; the gap-pattern catalog adds little over defaults. |
| mece-pyramid-principle | WEAK | Textbook consulting framework the model already knows cold; only the mechanical MECE test (item fits exactly one category / domain fully covered) is operational — candidate to merge as a checklist into documentation-craft. |
| self-consistency | WEAK | Same-weights sampling rarely yields genuinely independent paths (its own false-convergence caveat admits this); divergence-hunting idea is sound but execution guidance is thin. |
| self-verify-pipeline | KEEP | Escalating chain with claim decomposition (confidence/verifiable/impact), flag-only top 3–5 claims, cheapest-tool-first mapping, and "don't touch verified-correct claims" anti-patterns — concrete and cost-aware. |
| tool-interactive-critic | DELETE | Subsumed by self-verify-pipeline Phases 3–4, including the match-tool-to-failure-mode table it shares; keeping both guarantees duplicate invocation. |
| tree-of-thoughts | DELETE | Self-described as superseded by monte-carlo-tree-search ("the search-budget equivalent of Tree of Thoughts"), which adds probes/scoring/pruning policy ToT lacks. |

## Cluster notes

**Cluster A — verification/self-critique (output-quality):** self-verify-pipeline explicitly fuses bounded-self-revision, tool-interactive-critic (and claim-verification). Keep self-verify-pipeline as the single entry point; delete tool-interactive-critic outright and fold bounded-self-revision's stop conditions into pipeline Phase 2.

**Cluster B — branch exploration:** tree-of-thoughts (output-quality) and monte-carlo-tree-search (orchestration) are the same pattern at different fidelity; MCTS admits it. Delete ToT, keep MCTS.

**Cluster C — cross-session knowledge persistence (orchestration):** navigator (reasoning_trace.json keyed by domain/pattern) and sop-evolution-memory (SOP index keyed by triggers/domain) solve the same problem with different formats. Keep sop-evolution-memory (stronger quality gates); merge navigator's resume-from-trace retrieval step into it and drop navigator.

**Cluster D — phased-workflow meta-skills (orchestration):** agentic-design-patterns-orchestrator-state-machine, separation-of-concerns, and pre-flight-intent-verification all gate plan/execute/verify boundaries. Pre-flight has the sharpest gates and artifacts; keep it plus octopus/subagent pair, and either delete the orchestrator state machine or slim it to pattern-selection + circuit breakers referencing pre-flight for Phase 2.

**Cluster E — delegation pair:** subagent-composer (what the brief contains) + subagent-laws (how the sub-agent behaves) split cleanly by their own admission — keep both together, do not merge.

**Cross-category note:** scout (orchestration) names its Phase 1 role "Scout", which collides with navigator's Scout phase; after Cluster C's merge, rename or clarify to avoid trigger confusion.
# Audit: reasoning, testing, development, research, mlops

Rubric: "If loaded when relevant, would this change my behavior for the better beyond my defaults?"

## reasoning audit

| skill | verdict | one-line reason |
|---|---|---|
| claim-verification-reasoning | WEAK | Confidence labels + tool verification is what careful LLMs already do; the min-of-ancestors rule is the only novel bit, and it is fully restated in `reasoning-integrity-chain` — merge there. |
| cot-pruning-reasoning | DELETE | Generic concision advice ("drop hedging, drop restatements") applied to the model's own output; no gate or artifact, and its Phase-4 twin role is already covered by the chain skill. |
| faithfulness-aware-reasoning | DELETE | 44 lines of "does the conclusion follow from premises" — native model behavior; the only distinctive content (abort threshold, flag patterns) is duplicated verbatim in the chain skill. |
| prism | WEAK | Calibrate/compress/verify has some teeth, but it is a near-subset of claim-verification (calibration) plus cot-pruning (compression), cites sibling skills absent from these dirs, and adds no artifact. |
| reasoning-integrity-chain | KEEP | The one skill worth keeping from this family: escalating gates (abort >50% flagged, survival score thresholds, 3×NO_CHANGE halt), explicit exit criteria, and sequencing — merge the five satellites into it. |
| selective-halt-reasoning | WEAK | The 3-consecutive-NO_CHANGE rule is a real heuristic, but it is reproduced wholesale in chain Phase 4 and the rest is "stop repeating yourself" — merge into the chain. |
| self-contradiction-trap | WEAK | Belief-store JSONL + contradiction scores is ceremony a model will not maintain faithfully, and the underlying detector is admitted keyword overlap; overlaps chain step 1. Only viable if the companion script is load-bearing. |

## testing audit

| skill | verdict | one-line reason |
|---|---|---|
| e2e-crosscheck | KEEP | Six-pass bidirectional selector/text/route/state reconciliation with a severity taxonomy is a concrete drift-audit procedure an LLM would never run unprompted. |
| e2e-testing-philosophy-and-architecture | DELETE | Reference dump of well-known material (testing trophy, POM layers, risk matrix, anti-pattern table) the model already knows; inline the two tables the other skills cite instead of keeping a 115-line fact dump. |
| e2e-test-premortem | KEEP | Author/Auditor branches with six mandatory per-test questions, finding categories, and fix-or-document gates — real discipline applied after writing tests, which models skip. |
| mobile-e2e-testing-enterprise-guide | KEEP | Mobile-specific tier priorities, defined-starting-state rule, reset-endpoint and accessibility-ID contracts are concrete and platform-specific, not generic testing wisdom. |
| skill-ab-evaluation | KEEP | Concrete empirical A/B protocol for the catalog itself: snapshot isolation, 5v5 trials, weighted rubric, correctness=0 on budget exhaustion, justification memo. |
| test-driven-development | DELETE | Canonical red-green-refactor description the model natively performs when asked; the four failure modes are standard TDD caveats — duplicates the separate `tdd` agent skill too. |

## development audit

| skill | verdict | one-line reason |
|---|---|---|
| project-folder-architecture | KEEP | Stack-specific (Expo Router + RN + Supabase) canonical layout, hard dependency-direction rules, promote/demote policy, and migration path — opinionated answers to "where does this file live?" the model would guess at. |
| unit-test-debugging | KEEP | The authority tiebreaker chain (production > spec > comments > tests > git history) and mutation-check rule break the real code-vs-test flip-flop failure loop; short and gated. |

## research audit

| skill | verdict | one-line reason |
|---|---|---|
| effective-web-search | KEEP | Docs-first ordering, version pinning, GitHub-issue-thread follow-through (state, linked PRs, changelog), and a provenance answer template directly counter the first-hit-latch failure mode. |

## mlops audit

| skill | verdict | one-line reason |
|---|---|---|
| local-llm-tooling | DELETE | Reference dump of Ollama/llama.cpp commands and generic prompting/validation tips the model already knows; command flags are version-stale and no project-specific gate or artifact is imposed. |

## Cluster notes

**reasoning-integrity-chain family (7 skills, heavy duplication).**
The chain skill (`reasoning-integrity-chain`) restates the full protocols of `faithfulness-aware-reasoning`, `claim-verification-reasoning`, and `selective-halt-reasoning`; `cot-pruning-reasoning` declares itself the twin of `selective-halt`; `prism` re-implements calibration (claim-verification) plus compression (cot-pruning); `self-contradiction-trap` calls itself "step 1 of integrity". Recommendation: keep `reasoning-integrity-chain` as the single entry point, fold in the survival-score/halt gates and the min-of-ancestors confidence rule, and delete or archive the six satellites. This cuts ~30KB of redundant context for one behavior.

**E2E trio shares a reference.**
`e2e-test-premortem` and `mobile-e2e-testing-enterprise-guide` both declare `e2e-testing-philosophy-and-architecture` a prerequisite and borrow its risk matrix and anti-pattern table. If the philosophy dump is deleted, inline those two tables (risk tiers, anti-pattern list) once — e.g., into the premortem skill — so the remaining skills stay self-contained.

**test-driven-development duplicates an existing agent skill.**
A `tdd` skill already exists outside this catalog (~/.agents/skills/tdd); the catalog copy adds nothing beyond the canonical loop name.

**Cross-category echo:** `effective-web-search` (research) and `claim-verification-reasoning` (reasoning) both enforce source-grounded verification; keeping the research skill covers the web case, which is where the discipline actually bites.
