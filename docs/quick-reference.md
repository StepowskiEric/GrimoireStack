# Quick Reference Tables

## All Protocol Skills (State Machine)

| Skill | Location | Best For | Notes |
|-------|----------|----------|-------|
| how-to-solve-it-state-machine | execution/ | Hard problems, debugging | |
| ooda-loop-state-machine | execution/ | Fast-changing situations | |
| refactoring-state-machine | execution/ | Code restructuring | |
| working-effectively-with-legacy-code-state-machine | execution/ | Legacy code changes | |
| checklist-manifesto | execution/ | Procedural safety | |
| pdca-deming | execution/ | Iterative improvement | |
| toyota-kata-state-machine | execution/ | Continuous improvement | |
| philosophy-of-software-design-state-machine | execution/ | Complexity management | |
| pragmatic-programmer-state-machine | execution/ | Grounded execution | |
| cognitive-friction-governor | execution/ | Deliberation budgeting | |
| abductive-first-debugging | execution/ | Novel failure diagnosis | |
| **keyword-agnostic-logic-locator** | execution/ | Code navigation | Requires manual script setup |
| step-level-verification-protocol | execution/ | Preventing error propagation | |
| speculative-drafting-verification | execution/ | Parallel candidate evaluation | |
| process-reward-model-protocol | execution/ | Self-correcting reasoning | |
| trajectory-guard | execution/ | Failure spiral detection & recovery | Checkpoint every 5 tool calls |
| thoroughness-check-etto-state-machine | judgment-and-routing/ | Setting rigor level | |
| pre-mortem-state-machine | judgment-and-routing/ | Prospective hindsight | |
| recognition-primed-triage-state-machine | judgment-and-routing/ | Fast triage | |
| problem-mode-router-cynefin-state-machine | judgment-and-routing/ | Problem classification | |
| inversion-mental-model-state-machine | judgment-and-routing/ | Backward reasoning | |
| intent-specification-protocol | execution/ | Crystallize vague requests into testable specs | MCP server + script available |
| explore-vs-exploit-state-machine | judgment-and-routing/ | Resource allocation | |
| metacognitive-monitoring | judgment-and-routing/ | Confidence calibration | |
| counterfactual-policy-testing | judgment-and-routing/ | Decision validation | |
| agentic-design-patterns-orchestrator-state-machine | orchestration/ | Workflow control | |
| rashomon-triad-hybrid | orchestration/ | Multi-perspective decisions | |
| socratic-clarification | orchestration/ | Pre-execution clarity | |
| thought-retriever-coppermind | orchestration/ | Memory-augmented reasoning | |
| weak-link-detection-multi-agent | orchestration/ | Multi-agent quality control | |
| cognitive-load-operator-state-machine | output-quality/ | Reducing complexity | |
| bounded-self-revision | output-quality/ | Self-improvement | |
| documentation-craft | output-quality/ | Technical writing | |
| compression-as-understanding | output-quality/ | Understanding verification | |
| thinking-in-systems-state-machine | systems-and-architecture/ | System analysis | |
| log-trace-correlation | debugging/ | Root-cause analysis | ✓ Proven |
| bisect-debugging | debugging/ | Isolate regression commits | [tested] +9.9% speed |
| debug-subagent | debugging/ | Interactive debug subagent | Based on Debug2Fix |
| purify-test-output | debugging/ | Reduce test noise (~18.6% tokens) | Based on DebugRepair |
| simulate-instrumentation | debugging/ | Capture runtime state | Based on DebugRepair |
| iterative-patch-repair | debugging/ | Iterative patch generation | Based on DebugRepair |
| **time-traveling-debugger** | debugging/ | Forward trace + backward rewind | Includes time_travel.py + MCP server |
| **context-density-operator** | reasoning/ | Maximize info per token | GenericAgent (arXiv:2604.17091) |
| **hallucination-anchor-chain** | reasoning/ | Anchor claims to verified sources | Includes anchor_chain.py |
| **context-rot-pruner** | reasoning/ | Exponential decay + prune low-weight msgs | Includes context_rot.py |
| **context-lifecycle-manager** | execution/ | Hybrid: budget + rot-pruner + token | Insane 3-skill combo, includes context_lifecycle.py |
| **self-contradiction-trap** | reasoning/ | Detect + resolve self-contradictions | Includes belief_store.py |
| **cot-pruning-reasoning** | reasoning/ | Compress CoT reasoning | CoT-Influx (arXiv:2312.08901) |
| **selective-halt-reasoning** | reasoning/ | Halt when converged | DASH (arXiv:2604.18103) |
| **sop-evolution-memory** | orchestration/ | Reusable SOPs from trajectories | GenericAgent (arXiv:2604.17091) |
| **token-budget-operator** | reasoning/ | Master token-efficiency orchestrator | Hybrid (all 4 above) |
| **claim-verification-reasoning** | reasoning/ | Atomic claim verification | CURE + DCF + PRISM |
| **reasoning-verification-hybrid** | reasoning/ | Master anti-hallucination orchestrator | Hybrid (6 papers) |
| root-cause-analysis | debugging/ | Distinguish symptoms from real causes | 5 Whys + Ishikawa |
| vibe-coding-security-hardening | systems-and-architecture/ | Harden AI-generated apps for production | 9-phase checklist |
| **llm-pre-push-review** | software-development/ | Pre-push review for LLM-generated code | 5-pass protocol, 11 arXiv papers |
| **task-intake-protocol** | judgment-and-routing/ | Universal preflight gate (Cynefin+ETTO+RPT) | 3-phase classify→calibrate→commit |
| **pre-deployment-gate** | software-development/ | Pre-push + production hardening | 7-pass gate, Pre-Push + Vibe Coding Security |
| **requirement-crystallization-protocol** | execution/ | Vague request → locked spec | Socratic + Intent Spec fused |
| **legacy-rescue-protocol** | execution/ | Safe legacy code changes | WELC + Refactoring State Machine |
| **self-verify-pipeline** | output-quality/ | Escalating output verification | BSR + TIC + Claim Verification |
| **failure-analysis-protocol** | judgment-and-routing/ | Pre-commitment failure analysis | Pre-Mortem + Inversion + 2nd-Order |
| **long-task-survival-kit** | execution/ | Prevent agent decay on long tasks | Assumption + Trajectory + Context Budget |
| **security-review-protocol** | systems-and-architecture/ | Comprehensive security review | STRIDE + UCA + Vibe Coding Security |
| **debug-to-fix-pipeline** | debugging/ | End-to-end debugging pipeline | Abductive + Subagent + Instrumentation + Purify + Patch Repair |
| **reasoning-integrity-chain** | reasoning/ | Reasoning integrity chain | Faithfulness + Claims + Verification + Halt |
| **system-architecture-audit** | systems-and-architecture/ | Comprehensive architecture audit | DDIA + DDD + Thinking in Systems + Release It |
| **speculative-exploration-protocol** | execution/ | Explore with process rewards | Speculative Drafting + ToT + PRM |
| **iterative-improvement-cycle** | execution/ | Iterative improvement cycle | Toyota Kata + PDCA + Philosophy of Software Design |
| **plan-with-judge** | execution/ | Create plan.jsonl refined by stronger model | Max 5 judge iterations |
| **structured-feature-planning** | execution/ | 7-phase structured planning with self-review×2 | Explore → search → stuck detection → plan → review×2 → execute. JSONL output. Never hallucinate rule. Includes structured_planner.py |
| **api-surface-anchoring** | software-development/ | Verify API surface from authoritative docs before writing code | Includes scripts/api_surface.py |
| **verified-api-workflow** | software-development/ | Hybrid: api-surface + anchor-chain | Includes verified_api.py |

## All Framework Skills (Conceptual)

| Skill | Location | Best For |
|-------|----------|----------|
| how-to-solve-it-analogy | execution/ | Analogical problem solving |
| six-thinking-hats | judgment-and-routing/ | Multi-perspective analysis |
| first-principles | judgment-and-routing/ | Deconstruction |
| second-order-thinking | judgment-and-routing/ | Consequence analysis |
| steelmanning | judgment-and-routing/ | Challenge testing |
| kahneman-thinking-fast-slow-software-agent | judgment-and-routing/ | Cognitive mode switching |
| cognitive-bias-checklist | judgment-and-routing/ | Bias correction |
| cognitive-bias-auditor | judgment-and-routing/ | Detect 9 biases, includes script |
| bayesian-updating | judgment-and-routing/ | Belief revision |
| reference-class-forecasting | judgment-and-routing/ | Estimation |
| pre-mortem | judgment-and-routing/ | Failure prediction |
| unsafe-control-actions-hazard-analysis | judgment-and-routing/ | Safety analysis |
| problem-mode-router-cynefin | judgment-and-routing/ | Domain classification |
| recognition-primed-triage | judgment-and-routing/ | Pattern matching |
| inversion-mental-model | judgment-and-routing/ | Reverse thinking |
| explore-vs-exploit | judgment-and-routing/ | Decision timing |
| thoroughness-check-etto | judgment-and-routing/ | Rigor calibration |
| agent-memory-hygiene | orchestration/ | Memory management |
| agentic-design-patterns-orchestrator | orchestration/ | Agent patterns |
| separation-of-concerns | orchestration/ | Work separation |
| monte-carlo-tree-search | orchestration/ | Branch exploration |
| tree-of-thoughts | output-quality/ | Branching exploration |
| self-consistency | output-quality/ | Triangulation |
| tool-interactive-critic | output-quality/ | External verification |
| mece-pyramid-principle | output-quality/ | Clear structure |
| feynman-technique | output-quality/ | Simple explanation |
| large-documentation-navigation | output-quality/ | Navigating large docs |
| stakeholder-communication | output-quality/ | Calibrated confidence for human audiences |
| faithfulness-aware-reasoning | reasoning/ | Reasoning hallucination detection |
| cross-domain-analogy-generator | systems-and-architecture/ | Creative solutions |
| everything-as-code-conceptualizer | systems-and-architecture/ | System modeling |
| domain-driven-design | systems-and-architecture/ | Domain modeling |
| team-topologies-ai | systems-and-architecture/ | Team alignment |
| accelerate-ai | systems-and-architecture/ | DevOps improvement |
| designing-data-intensive-applications-ai | systems-and-architecture/ | Data systems |
| release-it-stability | systems-and-architecture/ | Stability patterns |
| sre-error-budget | systems-and-architecture/ | Reliability trade-offs |
| security-threat-modeling | systems-and-architecture/ | STRIDE-based security analysis |
| the-goal-theory-of-constraints-ai | systems-and-architecture/ | Bottleneck focus |
| verify-before-integrate | software-development/ | Pre-integration verification |
| debug-issue | software-development/ | Structured debugging |
| explore-codebase | software-development/ | Codebase exploration |
| refactor-safely | software-development/ | Safe refactoring |
| review-changes | software-development/ | Code review |
| api-design-backward-compatibility | software-development/ | Consumer-aware API contract changes |
| skill-development-with-supporting-files | development/ | Skills with scripts/templates |
| add-new-skill-to-repository | development/ | Contributing new skills |
| local-llm-tooling | mlops/ | Running local LLMs |

## MCP Servers & Tools

These are **not skills** in the traditional sense — they are MCP servers or companion scripts included in the repo.

| Tool | Type | Location | What it does |
|------|------|----------|--------------|
| code-knowledge-graph | [mcp] | `mcp-servers/code-graph/server.py` | Structured code navigation (index, find symbol, call graph, dead code) |
| dev-diagnostics | [mcp] | `mcp-servers/dev-diagnostics/server.py` | Unified lint/test/typecheck output parser (6+ tools) |
| evolutionary-tool-composer | [mcp] | `mcp-servers/evolutionary-tool-composer/server.py` | Evolutionary algorithm for tool/prompt/code discovery (AlphaEvolve principles) |
| active-inference-agent | [mcp] | `mcp-servers/active-inference-agent/server.py` | Active Inference agent (Friston's Free Energy Principle) for principled decision-making |
| lint-battalion | [script] | `software-development/lint-battalion/scripts/lint_battalion.py` | Batch-plan 500+ linter errors into auto-fixable categories |
| git-surgery | [script] | `software-development/git-surgery/scripts/git_surgery.py` | `diagnose` / `reflog` commands for git disaster recovery |
| verify-assumptions | [script] | `execution/assumption-grounding/scripts/verify_assumptions.py` | Assumption verification helper |
| context-budget | [script] | `execution/context-budget-operator/scripts/context_budget.py` | Token budget computation |
| purify-test-output | [script] | `debugging/purify-test-output/scripts/purify_test_output.py` | Slice failing test output to relevant lines |

## Recently Added

|| Skill | Date | Key Technique |
||-------|------|---------------|
| evolutionary-tool-composer | 2026-05 | AlphaEvolve-style evolutionary algorithm for tool/prompt/code discovery |
| active-inference-agent | 2026-05 | Friston Free Energy Principle for principled Bayesian decision-making |
| lint-battalion | 2026-05 | Mass lint remediation via auto-fix sprint + parallel subagent battalions |
| git-surgery | 2026-05 | 10 deterministic recovery protocols for common git disasters |
| code-knowledge-graph-mcp | 2026-05 | MCP server for structured code navigation (zero deps) |
| dev-diagnostics-mcp | 2026-05 | MCP server for unified lint/test/typecheck diagnostics |
|| root-cause-analysis | 2026-04 | 5 Whys + Ishikawa diagnostic protocol |
| security-threat-modeling | 2026-04 | STRIDE-based threat analysis |
| api-design-backward-compatibility | 2026-04 | Consumer discovery before contract changes |
| stakeholder-communication | 2026-04 | Calibrated confidence for human audiences |
| vibe-coding-security-hardening | 2026-04 | 9-phase hardening checklist for AI-generated apps |
| reasoning-verification-hybrid | 2026-04 | Master anti-hallucination orchestrator (6 papers) |
| claim-verification-reasoning | 2026-04 | Atomic claim verification (CURE/DCF/PRISM) |
| token-budget-operator | 2026-04 | Master token-efficiency orchestrator (hybrid) |
| context-density-operator | 2026-04 | Context info density maximization (arXiv:2604.17091) |
| cot-pruning-reasoning | 2026-04 | Two-pass CoT compression (arXiv:2312.08901) |
| selective-halt-reasoning | 2026-04 | Semantic stabilization halting (arXiv:2604.18103) |
| sop-evolution-memory | 2026-04 | Trajectory-to-SOP distillation (arXiv:2604.17091) |
| debug-to-fix-pipeline | 2026-04 | End-to-end debugging pipeline (5 debugging skills fused) |
| reasoning-integrity-chain | 2026-04 | Reasoning integrity chain (faithfulness + claims + verification + halt) |
| system-architecture-audit | 2026-04 | Architecture audit (DDIA + DDD + Thinking in Systems + Release It) |
| speculative-exploration-protocol | 2026-04 | Exploration with process rewards (Speculative Drafting + ToT + PRM) |
| iterative-improvement-cycle | 2026-04 | Iterative improvement (Toyota Kata + PDCA + Philosophy of Software Design) |
| documentation-craft | 2025-04 | 5-phase structured writing (arXiv:2504.08725) |
| counterfactual-policy-testing | 2025-04 | Null/opposite/partial alternatives (arXiv:2604.10511) |
| cognitive-friction-governor | 2025-04 | Deliberation budgeting (arXiv:2603.30031) |
| cross-domain-analogy-generator | 2025-04 | Foreign-domain analogies (arXiv:2603.19087) |
| metacognitive-monitoring | 2025-04 | Confidence calibration (arXiv:2604.15702) |
| abductive-first-debugging | 2025-04 | Inference to best explanation (arXiv:2604.08016) |
| keyword-agnostic-logic-locator | 2025-04 | Datalog code queries (arXiv:2604.16021) |
| compression-as-understanding | 2025-04 | Kolmogorov complexity verification |
| everything-as-code-conceptualizer | 2025-04 | System codification (arXiv:2507.05100) |
| rashomon-triad-hybrid | 2025-04 | Multi-perspective reasoning |
| thought-retriever-coppermind | 2025-04 | Memory-augmented reasoning |
| log-trace-correlation | 2025-04 | Error log to source code mapping |
| local-llm-tooling | 2025-04 | Local LLM structured output |

## Meta / Evaluation

| Skill | Location | Best For |
|-------|----------|----------|
| skill-ab-evaluation | testing/ | A/B test any skill for % improvement |
