# Find by Use Case

**"I need a skill for..."**

> **Note:** Skill recommendations below are empirically validated where marked with [tested].
> Unmarked recommendations are theoretical. See `../evaluations/` for test results.

---

### Debugging / Bug Fixing

*Skills that actually help find and fix code bugs.*

| Situation | Best Skill | Why | Status |
|-----------|------------|-----|--------|
| Have a stack trace or error log | [`log-trace-correlation`](../debugging/log-trace-correlation/SKILL.md) | Maps traces to source, inspects context, suggests fix | ✓ Proven |
| Know the bug was introduced recently | [`bisect-debugging`](../debugging/bisect-debugging/SKILL.md) | Binary search commits to isolate the exact change | [tested] +9.9% speed |
| Bug not obvious from error message | [`debug-subagent`](../debugging/debug-subagent/SKILL.md) | Dedicated subagent enforces debug-before-edit | Based on Debug2Fix |
| Verbose test output drowning signal | [`purify-test-output`](../debugging/purify-test-output/SKILL.md) | Slice to failure-relevant lines only | Based on DebugRepair |
| Need runtime state invisible in source | [`simulate-instrumentation`](../debugging/simulate-instrumentation/SKILL.md) | Inject prints, capture actual values | Based on DebugRepair |
| First patch failed, need alternatives | [`iterative-patch-repair`](../debugging/iterative-patch-repair/SKILL.md) | Loop: patch → test → refine → augment | Based on DebugRepair |
| Bug keeps coming back after "fix" | [`root-cause-analysis`](../debugging/root-cause-analysis.md) | 5 Whys + Ishikawa to find real cause, not symptom | Framework |
| Need structured debug workflow | [`debug-issue`](../software-development/debug-issue.md) | Graph-powered code navigation to trace issues | Framework |
| Tests fail, need reproducibility | [`debug-issue`](../software-development/debug-issue.md) | Reproduce → Isolate → Fix → Verify cycle | Framework |
| End-to-end debugging pipeline needed | [`debug-to-fix-pipeline`](../debugging/debug-to-fix-pipeline.md) | Fuses 5 debugging skills: abductive + subagent + instrumentation + purify + patch repair | Hybrid |
| Need to understand unfamiliar code before fixing | [`explore-codebase`](../software-development/explore-codebase.md) | Graph-powered navigation with token efficiency | Framework |
| Large codebase, bug location unknown | [`codebase-divide-conquer-search`](../software-development/codebase-divide-conquer-search.md) | Hierarchical summarization + parallel agent deep dives | Based on Meta-RAG / GenLoc |
| Debugging session getting long, agent stuck | [`long-task-survival-kit`](../execution/long-task-survival-kit.md) | Checkpoint every 5 calls: context, trajectory, assumptions | |
| Bug crashes but root cause is not at the crash site | [`time-traveling-debugger`](../debugging/time-traveling-debugger/SKILL.md) | Forward trace + backward rewind to find state divergence | Includes MCP server |

**Not recommended for typical code bugs** (empirically ineffective in our tests):
- `abductive-first-debugging` — Designed for novel failures with multiple competing hypotheses. Tested on a real repo bug: **-0.4% vs baseline**.
- `pdca-deming` — Designed for process/system improvement with measurable baselines. Tested on a real repo bug: **-1.6% vs baseline**.
- `step-level-verification-protocol` — Designed for multi-step reasoning verification (math, logic). Tested on a real repo bug: **+9.9% time efficiency** but **0% correctness improvement**.

---

### Reasoning / Problem Solving

*Skills for structured thinking when the problem is unclear.*

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Hard problem, don't know where to start | [`how-to-solve-it-state-machine`](../execution/how-to-solve-it-state-machine.md) | Forces problem framing before action |
| Multiple possible causes, novel failure | [`abductive-first-debugging`](../execution/abductive-first-debugging.md) | Generates competing hypotheses, picks best explanation |
| Need to locate relevant code by structure | [`keyword-agnostic-logic-locator`](../execution/keyword-agnostic-logic-locator.md) | Finds code by structure, not by grepping |
| Stuck in a rut, same failed attempts | [`cross-domain-analogy-generator`](../systems-and-architecture/cross-domain-analogy-generator.md) | Forces foreign-domain analogies to break fixation |
| Prematurely jumping to solutions | [`ooda-loop-state-machine`](../execution/ooda-loop-state-machine.md) | Observe → Orient → Decide → Act cycle |
| Over-thinking trivial problems | [`cognitive-friction-governor`](../execution/cognitive-friction-governor.md) | Budgets deliberation, forces decision |
| Backtrack when reasoning goes wrong | [`process-reward-model-protocol`](../execution/process-reward-model-protocol.md) | Self-correcting reasoning path |
| Use analogy to solve problems | [`how-to-solve-it-analogy`](../execution/how-to-solve-it-analogy.md) | Structured analogy-based problem solving |
| Verify each step before proceeding | [`step-level-verification-protocol`](../execution/step-level-verification-protocol.md) | Prevents error propagation in multi-step reasoning |
| Prevent hallucinated facts from compounding | [`assumption-grounding`](../execution/assumption-grounding/SKILL.md) | State, verify, and log assumptions before acting |
| Agent keeps retrying the same failed approach | [`trajectory-guard`](../execution/trajectory-guard/SKILL.md) | Detects repetition loops, specification drift, and stuck trajectories — forces strategy change |
| Agent drifted from what was actually asked | [`trajectory-guard`](../execution/trajectory-guard/SKILL.md) | Catches specification drift by re-checking alignment with user's original request |
| Running out of context on a long task | [`context-budget-operator`](../execution/context-budget-operator/SKILL.md) + [`trajectory-guard`](../execution/trajectory-guard/SKILL.md) | Budget tracking + failure-spiral detection prevents wasted tokens |
| Context rot in long sessions (20+ turns) | [`context-rot-pruner`](../reasoning/context-rot-pruner/SKILL.md) | Exponential decay + prune low-weight messages | Includes context_rot.py |
| Want insane full lifecycle (birth→track→decay→prune→optimize) | [`context-lifecycle-manager`](../execution/context-lifecycle-manager/SKILL.md) | Hybrid: budget-operator + rot-pruner + token-budget-operator | Includes context_lifecycle.py |

---

### Algorithm / Tool Discovery

*Skills that let the agent automatically discover solutions that outperform human intuition.*

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Discover optimal tool chains or prompts through search | [`evolutionary-tool-composer`](../mcp-servers/evolutionary-tool-composer/SKILL.md) | Evolutionary algorithm: mutate, cross, select by fitness — AlphaEvolve/OpenEvolve principles |
| Decision-making with uncertain outcomes, information value matters | [`active-inference-agent`](../mcp-servers/active-inference-agent/SKILL.md) | Friston's Free Energy Principle: minimize Expected Free Energy — formal Bayesian decision theory |

---

### Process Improvement

*Skills for improving systems, workflows, or outputs over time.*

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Continuous improvement cycle | [`pdca-deming`](../execution/pdca-deming.md) | Plan-Do-Check-Act iterative improvement |
| Toyota-style continuous improvement | [`toyota-kata-state-machine`](../execution/toyota-kata-state-machine.md) | Scientific thinking pattern |
| Complex multi-step procedure | [`checklist-manifesto`](../execution/checklist-manifesto.md) | Checklist discipline |
| Vague request, need to crystallize before coding | [`requirement-crystallization-protocol`](../execution/requirement-crystallization-protocol.md) | Socratic + Intent Spec: surface → capture → lock |
| Improve system with measurement + design quality | [`iterative-improvement-cycle`](../execution/iterative-improvement-cycle.md) | Toyota Kata + PDCA + Philosophy of Software Design |

---

### Code Review / Quality

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Security + performance + maintainability conflict | [`rashomon-triad-hybrid`](../orchestration/rashomon-triad-hybrid.md) | Parallel perspectives argue, surface conflicts |
| Not sure if I understand the code | [`compression-as-understanding`](../output-quality/compression-as-understanding.md) | Compress to essence, test reconstruction |
| Need to verify my understanding | [`metacognitive-monitoring`](../judgment-and-routing/metacognitive-monitoring.md) | Explicit confidence calibration |
| Refactoring legacy code | [`working-effectively-with-legacy-code-state-machine`](../execution/working-effectively-with-legacy-code-state-machine.md) | Safe change protocol |
| Code smells but not sure what | [`philosophy-of-software-design-state-machine`](../execution/philosophy-of-software-design-state-machine.md) | Complexity management |
| Before committing changes | [`verify-before-integrate`](../software-development/verify-before-integrate.md) | Pre-commit verification |
| Reviewing LLM-generated code before push | [`llm-pre-push-review`](../software-development/llm-pre-push-review.md) | 5-pass protocol catching LLM-specific failures (hallucinated logic, silent vulns, overcorrection, scope creep) |
| Pre-deployment security + quality gate | [`pre-deployment-gate`](../software-development/pre-deployment-gate.md) | 7-pass pre-push + production hardening checklist |
| Verify output before presenting | [`self-verify-pipeline`](../output-quality/self-verify-pipeline.md) | 5-phase escalating verification: self-critique → claims → tools |
| Universal task preflight | [`task-intake-protocol`](../judgment-and-routing/task-intake-protocol.md) | Cynefin + ETTO + RPT fused into one gate |
| Pre-commitment failure analysis | [`failure-analysis-protocol`](../judgment-and-routing/failure-analysis-protocol.md) | Pre-Mortem + Inversion + Second-Order Thinking |
| Security review | [`security-review-protocol`](../systems-and-architecture/security-review-protocol.md) | STRIDE + UCA + Vibe Coding Security fused |
| Refactoring safely | [`refactoring-state-machine`](../execution/refactoring-state-machine.md) | Structured refactoring protocol |
| Follow pragmatic programmer principles | [`pragmatic-programmer-state-machine`](../execution/pragmatic-programmer-state-machine.md) | Core programming wisdom |
| Self-check for thoroughness | [`thoroughness-check-etto`](../judgment-and-routing/thoroughness-check-etto.md) | Systematic completeness check |
| Strict thoroughness protocol | [`thoroughness-check-etto-state-machine`](../judgment-and-routing/thoroughness-check-etto-state-machine.md) | Enforced thoroughness state machine |
| Validate decisions with counterfactuals | [`counterfactual-policy-testing`](../judgment-and-routing/counterfactual-policy-testing.md) | Test against alternatives |
| Improve my own output | [`bounded-self-revision`](../output-quality/bounded-self-revision.md) | Structured self-improvement |
| Generate and verify multiple solutions | [`speculative-drafting-verification`](../execution/speculative-drafting-verification.md) | Parallel candidate evaluation |
| Explore multiple solutions with process rewards | [`speculative-exploration-protocol`](../execution/speculative-exploration-protocol.md) | Speculative drafting + tree of thoughts + PRM fused |
| Check for cognitive biases | [`cognitive-bias-checklist`](../judgment-and-routing/cognitive-bias-checklist.md) | Bias detection and mitigation |
| Automated bias detection in decisions | [`cognitive-bias-auditor`](../judgment-and-routing/cognitive-bias-auditor/SKILL.md) | Detect 9 biases from arXiv:2410.02820 |
| Verify self-consistency | [`self-consistency`](../output-quality/self-consistency.md) | Cross-check reasoning |
| Interactive criticism of work | [`tool-interactive-critic`](../output-quality/tool-interactive-critic.md) | Structured critique process |
| Need to call an external library — not sure of its exact API | [`api-surface-anchoring`](../software-development/api-surface-anchoring/SKILL.md) | Verify current API surface from authoritative docs before writing code |
| Want 100% API call verification with citations | [`verified-api-workflow`](../software-development/verified-api-workflow/SKILL.md) | Hybrid: api-surface + anchor-chain for full traceability | Includes verified_api.py |

---

### Architecture / Design Decisions

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Prevent over-engineering, clarify scope before coding | [`intent-specification-protocol`](../execution/intent-specification-protocol.md) | Scope control via explicit intent specification | | Includes intent_mcp_server.py (MCP) + intent-specification-protocol.py |
| Big decision, multiple options | [`counterfactual-policy-testing`](../judgment-and-routing/counterfactual-policy-testing.md) | Test against null/opposite/partial alternatives |
| Trade-offs between teams/systems | [`team-topologies-ai`](../systems-and-architecture/team-topologies-ai.md) | Organizational architecture patterns |
| Data system design | [`designing-data-intensive-applications-ai`](../systems-and-architecture/designing-data-intensive-applications-ai.md) | Data system principles |
| Scalability concerns | [`sre-error-budget`](../systems-and-architecture/sre-error-budget.md) | Reliability vs velocity trade-offs |
| Domain modeling | [`domain-driven-design`](../systems-and-architecture/domain-driven-design.md) | Bounded contexts, ubiquitous language |
| Not sure what kind of problem | [`problem-mode-router-cynefin`](../judgment-and-routing/problem-mode-router-cynefin.md) | Cynefin framework routing |
| Accelerate delivery | [`accelerate-ai`](../systems-and-architecture/accelerate-ai.md) | DevOps and delivery optimization |
| Release planning | [`release-it-stability`](../systems-and-architecture/release-it-stability.md) | Stability patterns |
| Separation of concerns | [`separation-of-concerns`](../orchestration/separation-of-concerns.md) | Component boundary design |
| Router for problem types (state machine) | [`problem-mode-router-cynefin-state-machine`](../judgment-and-routing/problem-mode-router-cynefin-state-machine.md) | Enforced Cynefin routing |
| System thinking protocol | [`thinking-in-systems-state-machine`](../systems-and-architecture/thinking-in-systems-state-machine.md) | System dynamics analysis |
| API design with backward compatibility | [`api-design-backward-compatibility`](../software-development/api-design-backward-compatibility.md) | Consumer discovery before contract changes |
| Comprehensive architecture review | [`system-architecture-audit`](../systems-and-architecture/system-architecture-audit.md) | DDIA + DDD + Thinking in Systems + Release It fused |

---

### Documentation / Communication

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Ambiguous requirements, need to clarify before coding | [`intent-specification-protocol`](../execution/intent-specification-protocol.md) | Specify and validate intent before writing code |
| Writing README / API docs | [`documentation-craft`](../output-quality/documentation-craft.md) | 5-phase structured writing |
| Explaining complex system simply | [`feynman-technique`](../output-quality/feynman-technique.md) | Explain to a child |
| Team/process problems | [`everything-as-code-conceptualizer`](../systems-and-architecture/everything-as-code-conceptualizer.md) | Codify non-code systems |
| Need clarity on requirements | [`socratic-clarification`](../orchestration/socratic-clarification.md) | Pre-execution clarification |
| Navigate large documentation | [`large-documentation-navigation`](../output-quality/large-documentation-navigation.md) | Structured doc exploration |
| MECE structuring | [`mece-pyramid-principle`](../output-quality/mece-pyramid-principle.md) | Mutually exclusive, collectively exhaustive |
| Steelman opposing views | [`steelmanning`](../judgment-and-routing/steelmanning.md) | Strongest version of opponent's argument |
| Communicating to stakeholders with calibrated confidence | [`stakeholder-communication`](../output-quality/stakeholder-communication.md) | Facts vs inferences, range estimates, unknowns |

---

### Planning / Estimation

| Situation | Best Skill | Why |
|-----------|------------|-----|
| How long will this take? | [`reference-class-forecasting`](../judgment-and-routing/reference-class-forecasting.md) | Base rate estimation |
| What could go wrong? | [`pre-mortem-state-machine`](../judgment-and-routing/pre-mortem-state-machine.md) | Prospective hindsight |
| Should I explore or exploit? | [`explore-vs-exploit-state-machine`](../judgment-and-routing/explore-vs-exploit-state-machine.md) | Resource allocation |
| Theory of constraints | [`the-goal-theory-of-constraints-ai`](../systems-and-architecture/the-goal-theory-of-constraints-ai.md) | Bottleneck identification |
| Explore vs exploit (framework) | [`explore-vs-exploit`](../judgment-and-routing/explore-vs-exploit.md) | Decision framework |
| Pre-mortem (framework) | [`pre-mortem`](../judgment-and-routing/pre-mortem.md) | Prospective hindsight analysis |
| Need a structured, reviewable plan before coding | [`plan-with-judge`](../execution/plan-with-judge/SKILL.md) | Create plan.jsonl, then iterate with a stronger judge model until approved |
| New feature, need disciplined exploration before planning | [`structured-feature-planning`](../execution/structured-feature-planning/SKILL.md) | 7-phase: explore → search → stuck detection → plan (JSONL) → self-review×2 → summary + execute. No hallucination allowed. |

---

### Learning / Understanding

| Situation | Best Skill | Why |
|-----------|------------|-----|
| New codebase, need to understand | [`compression-as-understanding`](../output-quality/compression-as-understanding.md) | Verify understanding via compression |
| Researching a topic | [`tree-of-thoughts`](../output-quality/tree-of-thoughts.md) | Branching exploration |
| First principles thinking | [`first-principles`](../judgment-and-routing/first-principles.md) | Deconstruct to fundamentals |
| Inverting the problem | [`inversion-mental-model`](../judgment-and-routing/inversion-mental-model.md) | Think backwards |
| Analyzing from multiple angles | [`six-thinking-hats`](../judgment-and-routing/six-thinking-hats.md) | Parallel thinking modes |
| Inversion (state machine) | [`inversion-mental-model-state-machine`](../judgment-and-routing/inversion-mental-model-state-machine.md) | Structured backward thinking |
| Second-order effects | [`second-order-thinking`](../judgment-and-routing/second-order-thinking.md) | Consequences of consequences |
| Bayesian updating | [`bayesian-updating`](../judgment-and-routing/bayesian-updating.md) | Probabilistic belief updating |
| Recognition-primed decisions | [`recognition-primed-triage`](../judgment-and-routing/recognition-primed-triage.md) | Expert pattern matching |
| RPD state machine | [`recognition-primed-triage-state-machine`](../judgment-and-routing/recognition-primed-triage-state-machine.md) | Structured expert decision |
| Kahneman fast/slow thinking | [`kahneman-thinking-fast-slow-software-agent`](../judgment-and-routing/kahneman-thinking-fast-slow-software-agent.md) | Dual-process thinking |
| Detect reasoning hallucinations | [`faithfulness-aware-reasoning`](../reasoning/faithfulness-aware-reasoning.md) | Ensures reasoning is logically entailed |

---

### Reasoning / Anti-Hallucination

*Skills for verifying reasoning, preventing hallucinations, and managing token burn in long-horizon tasks.*

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Multi-step reasoning where errors compound | [`claim-verification-reasoning`](../reasoning/claim-verification-reasoning.md) | Break into atomic claims, assign confidence, verify with tools |
| Context window filling during long tasks | [`context-density-operator`](../reasoning/context-density-operator.md) | Maximize decision-relevant info per token |
| Chain-of-thought reasoning exceeds 10 steps | [`cot-pruning-reasoning`](../reasoning/cot-pruning-reasoning.md) | Compress CoT to retain only conclusion-changing steps |
| Need master anti-hallucination protocol | [`reasoning-verification-hybrid`](../reasoning/reasoning-verification-hybrid.md) | Claim verification + contradiction checks + confidence calibration |
| Reasoning is converging but keeps elaborating | [`selective-halt-reasoning`](../reasoning/selective-halt-reasoning.md) | Halt when consecutive steps stabilize |
| Token burn is the bottleneck | [`token-budget-operator`](../reasoning/token-budget-operator.md) | Orchestrates compression, pruning, halting, and SOP capture |
| Reasoning integrity across faithfulness + convergence | [`reasoning-integrity-chain`](../reasoning/reasoning-integrity-chain.md) | Faithfulness + claims + verification + selective halt fused |
| Need to eliminate hallucinated claims | [`hallucination-anchor-chain`](../reasoning/hallucination-anchor-chain/SKILL.md) | Every claim anchored to verified source | Includes anchor_chain.py |
| Agent keeps contradicting itself | [`self-contradiction-trap`](../reasoning/self-contradiction-trap/SKILL.md) | Detect contradictions, force resolution | Includes belief_store.py |
| Reasoning trajectory might be diverging or collapsing | [`chaos-detector`](../reasoning/chaos-detector/SKILL.md) | Lyapunov exponent over token trajectories flags collapse before it happens | Includes lyapunov.py |

---

### Software Development

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Writing features or fixing bugs, requirements unclear | [`intent-specification-protocol`](../execution/intent-specification-protocol.md) | Clarify intent before coding, prevent over-engineering |
| Need a structured debugging workflow | [`debug-issue`](../software-development/debug-issue.md) | Forces reproduce-isolate-fix-verify cycle |
| Need to understand an unfamiliar codebase | [`explore-codebase`](../software-development/explore-codebase.md) | Structured exploration with progressive deepening |
| Search large codebase for bug/feature/API usage | [`codebase-divide-conquer-search`](../software-development/codebase-divide-conquer-search.md) | Hierarchical summarization + semantic ranking + parallel sub-agents |
| Adding a new skill to this repository | [`add-new-skill-to-repository`](../development/add-new-skill-to-repository/SKILL.md) | Standardized contribution process with documentation and verification |
| Renaming files that have cross-references | [`bulk-rename-and-update-references`](../development/bulk-rename-and-update-references.md) | Discover, rename, and update all references safely |
| Skill has supporting scripts/templates | [`skill-development-with-supporting-files`](../development/skill-development-with-supporting-files.md) | Workflow for skills with external files beyond `.md` |
| Running LLMs locally (Ollama, llama.cpp) | [`local-llm-tooling`](../mlops/local-llm-tooling/SKILL.md) | Local model setup, prompting, structured output extraction |
| Need to refactor code safely | [`refactor-safely`](../software-development/refactor-safely.md) | Characterization testing + bounded changes |
| Need to review code changes | [`review-changes`](../software-development/review-changes.md) | Structured review checklist |
| Git disasters (detached HEAD, botched rebase, force-push overwrite) | [`git-surgery`](../software-development/git-surgery/SKILL.md) | 10 deterministic recovery protocols + companion `diagnose`/`reflog` script |
| Code navigation / symbol search in large repos | [`code-knowledge-graph-mcp`](../software-development/code-knowledge-graph-mcp/SKILL.md) | MCP server with structured symbol/call-graph queries |
| Structured lint/test/typecheck output parsing | [`dev-diagnostics-mcp`](../software-development/dev-diagnostics-mcp/SKILL.md) | MCP server with unified parsers for ESLint, Biome, Ruff, tsc, Vitest, pytest |
| 500+ linter errors to fix | [`lint-battalion`](../software-development/lint-battalion/SKILL.md) | Auto-fix sprint + parallel subagent battalions with contamination checks |
| Critical code that must be provably correct | [`verified-synthesize`](../software-development/verified-synthesize/SKILL.md) | Generate code + Dafny spec, machine-checked via Z3 SMT solver | Includes dafny_verify.py |

---

### Multi-Agent / Coordination

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Need to spawn specialized sub-agents | [`agentic-design-patterns-orchestrator`](../orchestration/agentic-design-patterns-orchestrator.md) | Agent workflow patterns |
| Orchestrator state machine | [`agentic-design-patterns-orchestrator-state-machine`](../orchestration/agentic-design-patterns-orchestrator-state-machine.md) | Enforced agent orchestration |
| Storing reasoning for later | [`thought-retriever-coppermind`](../orchestration/thought-retriever-coppermind.md) | Memory-augmented reasoning |
| Managing agent memory | [`agent-memory-hygiene`](../orchestration/agent-memory-hygiene.md) | Memory categorization |
| Debating which branch to pursue | [`monte-carlo-tree-search`](../orchestration/monte-carlo-tree-search.md) | Branch allocation |
| Identify weak agent reasoning | [`weak-link-detection-multi-agent`](../orchestration/weak-link-detection-multi-agent.md) | Prevents error amplification |
| Distill successful trajectories into reusable SOPs | [`sop-evolution-memory`](../orchestration/sop-evolution-memory.md) | Turn past task patterns into compact reusable procedures |
| Scout files before reading them | [`scout`](../orchestration/scout.md) | Fast sub-agent pre-reads and distills file context for the main model |

---

### Risk / Safety Analysis

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Safety-critical changes | [`unsafe-control-actions-hazard-analysis`](../judgment-and-routing/unsafe-control-actions-hazard-analysis.md) | STPA safety analysis |
| What could break? | [`pre-mortem`](../judgment-and-routing/pre-mortem.md) | Prospective hindsight |
| Second-order effects | [`second-order-thinking`](../judgment-and-routing/second-order-thinking.md) | Consequences of consequences |
| Release planning | [`release-it-stability`](../systems-and-architecture/release-it-stability.md) | Stability patterns |
| Pre-mortem protocol | [`pre-mortem-state-machine`](../judgment-and-routing/pre-mortem-state-machine.md) | Enforced prospective analysis |
| Security review for auth/secrets/input | [`security-threat-modeling`](../systems-and-architecture/security-threat-modeling.md) | STRIDE-based threat analysis |
| Hardening AI-generated apps for production | [`vibe-coding-security-hardening`](../systems-and-architecture/vibe-coding-security-hardening.md) | 9-phase security checklist |

---

### Cognitive Load / Operator Support

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Reduce cognitive load | [`cognitive-load-operator-state-machine`](../output-quality/cognitive-load-operator-state-machine.md) | Load management protocol |
| Manage finite context windows explicitly | [`context-budget-operator`](../execution/context-budget-operator/SKILL.md) | Track token budget, compress, decide breadth vs depth |

---

### Testing / Evaluation

*Skills for measuring and improving other skills.*

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Want to know if a skill is actually helping | [`skill-ab-evaluation`](../testing/skill-ab-evaluation/SKILL.md) | 5-trial A/B test with objective rubric |
| Need empirical data to justify skill refinement | [`skill-ab-evaluation`](../testing/skill-ab-evaluation/SKILL.md) | Isolated worktrees, zero risk to current projects |
