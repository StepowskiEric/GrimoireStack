const schools = [
  {
    id:'debugging',real:'Debugging',
    name:'School of Remediation',symbol:'⚔',
    desc:'Incantations to banish bugs and restore order to broken code.',
    spells:[
      {name:'Trace Sight',skill:'log-trace-correlation',effect:'Maps stack traces to source code, inspects context around the failure, and suggests the most likely fix. Best when you already have an error log or crash report in hand.',status:'Proven',combos:['Bisect Divination','Root Cause Revelation','Spectral Analysis']},
      {name:'Bisect Divination',skill:'bisect-debugging',effect:'Binary searches the commit history to isolate the exact change that introduced the bug. Fastest path to "what changed" when you know tests used to pass.',status:'Proven',note:'+9.9% speed',combos:['Trace Sight','Iterative Mend','Root Cause Revelation']},
      {name:'Debug Familiar',skill:'debug-subagent',effect:'Conjures a dedicated debugging subagent that enforces a debug-before-edit workflow. Proven to increase fix rate by 13-22% over editing without diagnosis.',status:'Proven',combos:['Instrumentation Charm','Spectral Analysis','Scout Protocol']},
      {name:'Purify Vision',skill:'purify-test-output',effect:'Slices noisy test output down to only the failure-relevant lines. Reduces token consumption by ~18.6% and focuses the LLM on the actual bug.',status:'Proven',combos:['Instrumentation Charm','Test Oracle','Iterative Mend']},
      {name:'Instrumentation Charm',skill:'simulate-instrumentation',effect:'Auto-inserts temporary print/logging statements at key code points, runs the failing test, and captures runtime state. The captured values feed directly into debugging.',status:'Proven'},
      {name:'Iterative Mend',skill:'iterative-patch-repair',effect:'Loops patch → test → capture runtime → refine → augment the patch. Max N iterations with patch augmentation to avoid overfitting. +19.9% from augmentation alone.',status:'Proven'},
      {name:'Root Cause Revelation',skill:'root-cause-analysis',effect:'Applies 5 Whys and Ishikawa (fishbone) diagrams to trace from symptom to true underlying cause. Prevents treating symptoms while the real defect remains.',status:'Framework',combos:['Occam\'s Verdict','Trace Sight','Bisect Divination']},
      {name:'Issue Graph Walk',skill:'debug-issue',effect:'Graph-powered code navigation that traces issues through the system along dataflow and call-graph edges rather than guessing.',status:'Framework'},
      {name:'Pipeline of Restoration',skill:'debug-to-fix-pipeline',effect:'Fuses five research-backed debugging disciplines into one sequential 6-phase ritual. Each phase increases evidence quality while reducing token waste.',status:'Hybrid',combos:['Spectral Analysis','Debug Familiar','Instrumentation Charm','Purify Vision','Iterative Mend']},
      {name:'Test Oracle',skill:'unit-test-debugging',effect:'Determines whether a failing test or the code under test is the source of truth. Prevents the agent from blindly "fixing" a correct implementation to match a wrong test.',status:'New'},
      {name:'Jest Invocation',skill:'jest-testing',effect:'Complete reference for writing correct Jest tests: matchers, async patterns, mocking strategies, configuration, and React Native specifics.',status:'New'},
      {name:'Remote Viewing',skill:'explore-codebase',effect:'Navigates unfamiliar code using graph-powered token-efficient exploration. Progressive deepening from module structure to line-level detail.',status:'Framework'},
      {name:'Divide & Conquer',skill:'codebase-divide-conquer-search',effect:'Hierarchical codebase summarization → semantic partitioning → parallel sub-agent deep dives → ranked results with confidence scores. For finding code in massive repos.',status:'Proven',combos:['Remote Viewing','Scout\'s Trail','Knowledge Graph']},
      {name:'Scout\'s Trail',skill:'navigator',effect:'A scout sub-agent reads and distills file context for the main model; a thought-retriever stores the distilled reasoning as retrievable traces. Builds a living investigation trail.',status:'—'},
      {name:'Occam\'s Verdict',skill:'occam-root-cause',effect:'Generates competing causal chains from observed symptoms, selects the simplest that fits all evidence, and verifies through falsification before committing to a fix.',status:'New'},
      {name:'Spectral Analysis',skill:'specter',effect:'Generates competing hypotheses (abductive reasoning) then locates code structurally — no keyword grepping, no root-cause guessing. Reason backwards from the symptom.',status:'—'},
      {name:'Endurance Ward',skill:'long-task-survival-kit',effect:'Every 5 calls: checkpoint context, verify trajectory, re-ground assumptions. Prevents context overflow, failure spirals, and hallucinated facts on long debugging sessions.',status:'—',combos:['Trajectory Warden','Context Lifecycle','Grounding Ritual']},
      {name:'Temporal Rewind',skill:'time-traveling-debugger',effect:'Records deterministic execution trace forward, then replays in reverse from the crash point to find the exact line where state first diverged. Time-travel debug for LLMs.',status:'MCP'},
      {name:'Environment Exorcism',skill:'environment-recovery',effect:'Structured vitals check (disk, versions, caches, ports, permissions) followed by targeted repair. For when commands fail before reaching your code.',status:'New'},
      {name:'Network Divination',skill:'network-api-debugging',effect:'Captures actual network traffic, diagnoses by status code pattern, and fixes by failure type. Covers CORS, auth tokens, rate limiting, redirect chains, WebSocket drops.',status:'New'},
      {name:'Minimal Summoning',skill:'minimal-reproduction',effect:'Writes the smallest possible test that reliably demonstrates the bug. Having a minimal repro in hand dramatically accelerates all subsequent debugging steps.',status:'New'},
      {name:'Occam\'s Ladder',skill:'occam-minimal-repro',effect:'Ranks possible reproduction triggers by complexity, tests the simplest first, and stops at the first tier that reproduces. Prevents elaborate setups when a one-liner suffices.',status:'New'},
      {name:'Escalation Rite',skill:'escalation-ladder',effect:'5-level protocol: self-correct → strategy change → rubber duck → scope reduction → full retreat. Fills the gap between "stuck" and "abandon ship."',status:'New'},
      {name:'Coordinated Strike',skill:'coordinated-change',effect:'Maps the full change set, orders dependencies, edits atomically across files, and verifies consistency. For fixes that touch multiple files.',status:'New'},
    ]
  },
  {
    id:'reasoning',real:'Reasoning & Problem Solving',
    name:'School of Cognition',symbol:'◇',
    desc:'Mental models and structured thought for when the problem itself is unclear.',
    spells:[
      {name:'First Step Oracle',skill:'how-to-solve-it-state-machine',effect:'Forces explicit problem framing — what kind of problem is this? — before any action is taken. Prevents rushing to solutions before understanding the question.',status:'—'},
      {name:'Razor of Parsimony',skill:'occams-razor',effect:'Lists all plausible explanations ranked simplest → most complex. Tests the simplest first. Every additional assumption must earn its keep or be discarded.',status:'New'},
      {name:'Spectral Reasoning',skill:'specter',effect:'Generates multiple hypotheses from observed evidence (abduction), then locates the relevant code structurally. No keyword grepping, no confirmation bias.',status:'—'},
      {name:'Occam\'s Abduction',skill:'occam-abduction',effect:'Generate competing hypotheses → audit all available evidence → rank by assumption count → falsify or confirm the simplest. Strongest when multiple explanations fit.',status:'New'},
      {name:'Structural Seeker',skill:'keyword-agnostic-logic-locator',effect:'Finds code by structural relationships (call graph, dataflow, type hierarchy) rather than grepping for names. Query by logic, not by keyword.',status:'—'},
      {name:'Simple Path Scry',skill:'occam-mcts',effect:'Occams Razor ranks strategy branches by complexity first; Monte Carlo Tree Search explores the simplest viable branches before touching complex ones.',status:'New'},
      {name:'Thought-Weave & Search',skill:'tree-of-thoughts-plus-monte-carlo-tree-search',effect:'Tree of Thoughts generates diverse reasoning branches; Monte Carlo Tree Search allocates deeper effort to the branches that earn it. Prevents first-branch lock-in.',status:'—'},
      {name:'Court of Minds',skill:'jury',effect:'Spawns parallel perspectives with conflicting goals, lets them argue, and surfaces the conflict graph as the explanation. For decisions with genuinely ambiguous tradeoffs.',status:'—'},
      {name:'Prism of Understanding',skill:'prism',effect:'Forces explicit confidence calibration (metacognitive monitoring) then compresses understanding to its essence. If you cannot compress it, you do not understand it.',status:'—'},
      {name:'Analogy Bridge',skill:'cross-domain-analogy-generator',effect:'Forces analogies from unrelated domains (biology, music, traffic, architecture) to break fixation and generate novel solutions to stubborn problems.',status:'—'},
      {name:'OODA Loop',skill:'ooda-loop-state-machine',effect:'Observe → Orient → Decide → Act. For environments where conditions change between actions — adversarial or rapid-response situations.',status:'—'},
      {name:'Friction Governor',skill:'cognitive-friction-governor',effect:'Assigns a deliberation budget to each task. Each reasoning step consumes friction. When the budget is exhausted, you must decide. Prevents over-thinking trivial problems.',status:'—'},
      {name:'Reward Path Backtrack',skill:'process-reward-model-protocol',effect:'Self-assigns process rewards to each reasoning step. Backtracks when cumulative reward drops below threshold. Prevents committing to wrong reasoning paths early.',status:'—'},
      {name:'Analogy Solver',skill:'how-to-solve-it-analogy',effect:'When your problem resembles one already solved elsewhere, deliberately imports the structure of that prior solution rather than starting from scratch.',status:'—'},
      {name:'Stepwise Verification',skill:'step-level-verification-protocol',effect:'Verifies each reasoning step before proceeding to the next. Prevents error propagation through multi-step chains where early mistakes compound.',status:'—'},
      {name:'Grounding Ritual',skill:'assumption-grounding',effect:'States every assumption explicitly, verifies with the cheapest possible check, and only proceeds on confirmation. Based on Chain-of-Verification research.',status:'—'},
      {name:'Trajectory Warden',skill:'trajectory-guard',effect:'Runtime meta-monitoring that detects failure spirals — repetitive loops, specification drift, stuck trajectories — and forcibly redirects strategy.',status:'—'},
      {name:'Context Lifecycle',skill:'context-lifecycle-manager',effect:'Manages the full context lifecycle: budget tracking, exponential message decay, pruning of low-weight content, and token optimization. Extends useful context by 2-3x.',status:'—'},
    ]
  },
  {
    id:'process',real:'Process Improvement',
    name:'School of Refinement',symbol:'⚙',
    desc:'Rituals for improving systems, workflows, and outputs over time through disciplined iteration.',
    spells:[
      {name:'Deming Cycle',skill:'pdca-deming',effect:'Plan → Do → Check → Act. A measurement-anchored cycle of planning, execution, and verification before standardizing or escalating. For process and system improvement.',status:'—'},
      {name:'Kata Practice',skill:'toyota-kata-state-machine',effect:'Scientific thinking pattern: understand the current condition, set a target condition, experiment toward it. For disciplined iteration instead of one large speculative change.',status:'—'},
      {name:'Checkman Rite',skill:'checklist-manifesto',effect:'Checklist discipline for high-stakes procedures where expert knowledge is necessary but not sufficient. Prevents skip-ahead errors that cause most procedure failures.',status:'—'},
      {name:'Crystallization',skill:'requirement-crystallization-protocol',effect:'Socratic questioning surfaces the critical assumptions, then Intent Specification crystallizes vague requests into locked, testable specs before any code is written.',status:'—'},
      {name:'Pre-Flight Gate',skill:'pre-flight-intent-verification',effect:'Three-phase gate: Clarify → Specify → Ground. Surfaces critical assumptions, crystallizes intent into testable scenarios, verifies facts before acting. Universal pre-action check.',status:'New'},
      {name:'Kata + Deming Synthesis',skill:'iterative-improvement-cycle',effect:'Fuses Toyota Kata (target condition / experiment), PDCA (measurement cycle), and Philosophy of Software Design (deep modules) into a single sequential improvement protocol.',status:'—'},
      {name:'Zero Defect Ward',skill:'zero-defect-protocol',effect:'14-phase protocol for mission-critical features. Data contracting, invariant mapping, red-team critique, pre-mortem, and triple expert review before any code executes.',status:'—'},
      {name:'Blueprint Codification',skill:'blueprint',effect:'Codifies messy human problems into types, schemas, and code. When you can state the problem in code, contradictions and gaps become impossible to ignore.',status:'—'},
    ]
  },
  {
    id:'code-review',real:'Code Review & Quality',
    name:'School of Scrutiny',symbol:'◈',
    desc:'Incantations for verifying, elevating, and safeguarding code quality before it ships.',
    spells:[
      {name:'Triad Perspective',skill:'rashomon-triad-hybrid',effect:'Three specialized reasoning modes — hypothesis generation, verification, and pattern extraction — argue from conflicting goals. The conflict graph becomes the explanation.',status:'—'},
      {name:'Essence Test',skill:'compression-as-understanding',effect:'Compress your understanding of the code to its minimal essential form, then try to reconstruct the original. If you cannot compress it, you do not understand it.',status:'—'},
      {name:'Confidence Calibration',skill:'metacognitive-monitoring',effect:'After every significant output, explicitly calibrate confidence vs. accuracy. Decide whether to KEEP or WITHDRAW your result, and BET or decline — measurable withdraw delta.',status:'—'},
      {name:'Legacy Seam Working',skill:'working-effectively-with-legacy-code-state-machine',effect:'Characterize legacy behavior, create test seams, then transform in bounded slices with anti-loop protection. For brittle code with weak or no tests.',status:'—'},
      {name:'Complexity Audit',skill:'philosophy-of-software-design-state-machine',effect:'Identify shallow abstractions and deepen module design. Manages complexity by ensuring each module hides one decision behind a clean interface.',status:'—'},
      {name:'Pre-Commit Vigil',skill:'verify-before-integrate',effect:'Before integrating any external API, research paper concept, or library — verify the actual system behavior rather than trusting terminology alignment.',status:'—'},
      {name:'LLM Pre-Push Ward',skill:'llm-pre-push-review',effect:'5-pass protocol targeting LLM-specific code review failures: hallucinated logic, silent vulnerabilities, overcorrection, scope creep, and context-ignorant reviews.',status:'—'},
      {name:'Deployment Gate',skill:'pre-deployment-gate',effect:'7-pass pre-deployment checklist combining LLM Pre-Push Review with Vibe Coding Security Hardening. Execution, security, correctness, structure, integration, hardening, secrets.',status:'—',combos:['Security Warding','Vibe Hardening','LLM Pre-Push Ward','Failure Prophecy']},
      {name:'Self-Verify Pipeline',skill:'self-verify-pipeline',effect:'5-phase escalating verification: internal critique → claim decomposition → tool verification → external sources. Catches failures early and cheaply.',status:'—'},
      {name:'Task Intake Gate',skill:'task-intake-protocol',effect:'Cynefin problem classification + ETTO rigor calibration + Recognition-Primed Triage fused into one 3-phase decision gate before any work begins.',status:'—'},
      {name:'Failure Prophecy',skill:'failure-analysis-protocol',effect:'Pre-Mortem + Inversion + Second-Order Thinking fused. Three failure lenses: invert success, narrate specific failures, trace cascading consequences.',status:'—'},
      {name:'Security Warding',skill:'security-review-protocol',effect:'STRIDE threat analysis + Unsafe Control Actions hazard analysis + Vibe Coding Security hardening. Three security lenses fused.',status:'—'},
      {name:'Safe Refactor',skill:'refactoring-state-machine',effect:'Structured refactoring protocol that improves structure without drifting into endless cleanup. Gates prevent scope creep and "while we are here" syndrome.',status:'—'},
      {name:'Pragmatist\'s Way',skill:'pragmatic-programmer-state-machine',effect:'Bounded changes, reversible choices, automation over repeated toil, root-cause fixes instead of symptom patches, and practical scope control.',status:'—'},
      {name:'Thoroughness Charm',skill:'thoroughness-check-etto',effect:'Systematic ETTO (Efficiency-Thoroughness Trade-Off) completeness check before any meaningful task execution. Prevents confidently doing the wrong thing.',status:'—'},
      {name:'Strict Thoroughness',skill:'thoroughness-check-etto-state-machine',effect:'Enforced thoroughness state machine — a universal preflight protocol that gates execution behind completeness checks. Cannot proceed without passing each gate.',status:'—'},
      {name:'Counterfactual Trial',skill:'counterfactual-policy-testing',effect:'Validates decisions by testing against explicit counterfactuals before committing. Generate null, opposite, and partial alternatives; only proceed if proposal beats all.',status:'—'},
      {name:'Bounded Revision',skill:'bounded-self-revision',effect:'Structured self-improvement with finite revision cycles. After N rounds, stop — even if the output is not perfect. Prevents infinite polish loops.',status:'—'},
      {name:'Speculative Drafting',skill:'speculative-drafting-verification',effect:'Generates multiple candidate solution branches in parallel, verifies each against constraints, and selects the best. Prevents local minima traps.',status:'—'},
      {name:'Speculative Exploration',skill:'speculative-exploration-protocol',effect:'Fuses Speculative Drafting, Tree of Thoughts, and Process Reward Model. Branch candidates → score with PRM → prune low-reward branches → verify the best candidate.',status:'—'},
      {name:'Bias Audit',skill:'cognitive-bias-checklist',effect:'Checks 9 established cognitive biases in important decisions or analyses. For slow-mode reasoning where bias could contaminate the output.',status:'—'},
      {name:'Automated Bias Detection',skill:'cognitive-bias-auditor',effect:'Detects and mitigates cognitive biases in agent decisions using a companion auditing script. Tested on GPT-4o, Gemma 2, and Llama 3.1 across 9 biases.',status:'—'},
      {name:'Self-Consistency Rite',skill:'self-consistency',effect:'Generates multiple independent reasoning paths to the same conclusion and checks whether they converge. If they do not converge, the answer is unreliable.',status:'—'},
      {name:'Interactive Critique',skill:'tool-interactive-critic',effect:'Structured multi-tool critique process for existing drafts, answers, plans, or code changes. Uses tools to verify claims, not just review text.',status:'—'},
      {name:'API Surface Scry',skill:'api-surface-anchoring',effect:'Before writing code that calls any external library or API, verifies the current API surface from authoritative docs. Prevents hallucinated signatures and wrong imports.',status:'—'},
      {name:'Verified API Workflow',skill:'verified-api-workflow',effect:'Every verified API surface entry becomes an anchor. Code using external APIs is fully traceable to documentation you actually checked. Zero hallucinated APIs.',status:'—'},
    ]
  },
  {
    id:'architecture',real:'Architecture & Design',
    name:'School of Architecture',symbol:'🏛',
    desc:'Design rituals for systems that endure across dimensions of scale, time, and team boundaries.',
    spells:[
      {name:'Intent Binding',skill:'intent-specification-protocol',effect:'Scope control via explicit intent specification before writing any code. Prevents the Intent-Behavior Mirroring Effect where vague requests produce invasive output.',status:'—'},
      {name:'Counterfactual Design',skill:'counterfactual-policy-testing',effect:'Tests architectural decisions against null, opposite, and partial alternatives. Only proceeds if the proposed change beats all alternatives in simulated outcomes.',status:'—'},
      {name:'Team Topology Sight',skill:'team-topologies-ai',effect:'Organizational architecture patterns for arranging teams, services, and ownership boundaries without creating coordination chaos.',status:'—'},
      {name:'Data System Principles',skill:'designing-data-intensive-applications-ai',effect:'Reason about storage choices, distributed behavior, and tradeoffs in reliability, scalability, and maintainability.',status:'—'},
      {name:'Error Budget Divination',skill:'sre-error-budget',effect:'Makes the tradeoff between reliability and change velocity explicit, evidence-based, and governed. Data-driven SRE discipline.',status:'—'},
      {name:'Ubiquitous Language',skill:'domain-driven-design',effect:'Bounded contexts, aggregates, entities, value objects, and domain events. Aligns code organization with business domain structure.',status:'—'},
      {name:'Cynefin Compass',skill:'problem-mode-router-cynefin',effect:'Routes problems to the right category — Clear, Complicated, Complex, Chaotic — each with its own decision-making approach. Before choosing a solution, classify the problem.',status:'—'},
      {name:'Acceleration Rite',skill:'accelerate-ai',effect:'Evidence-based improvement using the four key metrics: deployment frequency, lead time, mean time to restore, change failure rate. Based on State of DevOps research.',status:'—'},
      {name:'Stability Warding',skill:'release-it-stability',effect:'Stability patterns for distributed systems under failure: circuit breakers, bulkheads, timeouts, backpressure, and graceful degradation.',status:'—'},
      {name:'Boundary Weaving',skill:'separation-of-concerns',effect:'Prevents different concerns — orchestration, business logic, data access — from contaminating each other\'s reasoning, side effects, or state.',status:'—'},
      {name:'Cynefin Gate',skill:'problem-mode-router-cynefin-state-machine',effect:'Enforced Cynefin routing where problem classification is a mandatory gate, not an optional lens. Cannot proceed without classifying.',status:'—'},
      {name:'System Dynamics',skill:'thinking-in-systems-state-machine',effect:'Analyzes feedback loops, reinforcing/balancing dynamics, delayed effects, and multi-step downstream consequences before making system changes.',status:'—'},
      {name:'Backward Compat Ward',skill:'api-design-backward-compatibility',effect:'Forces contract-first, additive-only API evolution. Consumer discovery before contract changes. Prevents shipping breaking changes.',status:'—'},
      {name:'Full Architecture Audit',skill:'system-architecture-audit',effect:'Fuses DDIA, DDD, Thinking in Systems, and Release It into one sequential audit protocol. Each phase feeds the next.',status:'—'},
    ]
  },
  {
    id:'discovery',real:'Algorithm & Tool Discovery',
    name:'School of Discovery',symbol:'✧',
    desc:'Algorithms and automated tools that find solutions beyond human intuition.',
    spells:[
      {name:'Evolutionary Forge',skill:'evolutionary-tool-composer',effect:'Runs an evolutionary algorithm that mutates, crosses, and selects tool chains, prompt strategies, and code solutions by fitness. AlphaEvolve/OpenEvolve principles.',status:'—'},
      {name:'Free Energy Seeker',skill:'active-inference-agent',effect:'Based on Friston\'s Free Energy Principle. Maintains hierarchical beliefs, computes Expected Free Energy for each action, selects policies minimizing predicted surprise.',status:'—'},
    ]
  },
  {
    id:'documentation',real:'Documentation & Communication',
    name:'School of Expression',symbol:'✎',
    desc:'Incantations for writing clearly, explaining complex systems, and communicating with stakeholders.',
    spells:[
      {name:'Intent Crystallization',skill:'intent-specification-protocol',effect:'Specifies and validates intent before writing any code. Transforms vague requests into precise, testable specifications.',status:'—'},
      {name:'Doc Crafting',skill:'documentation-craft',effect:'5-phase structured writing: outline-first planning, context-aware drafting, quality verification. Inspired by multi-agent documentation systems and literate programming.',status:'—'},
      {name:'Feynman Recitation',skill:'feynman-technique',effect:'Explains complex systems from the ground up in plain language. If you cannot explain it simply, you do not understand it well enough.',status:'—'},
      {name:'Code Vision',skill:'everything-as-code-conceptualizer',effect:'Views any system, process, or problem through a "code lens" — codifying reveals hidden structure, assumptions, and edge cases that natural language obscures.',status:'—'},
      {name:'Socratic Elicitation',skill:'socratic-clarification',effect:'Before executing an ambiguous or high-stakes task, surfaces and resolves the most critical unknown assumptions using structured questioning.',status:'—'},
      {name:'Doc Navigation',skill:'large-documentation-navigation',effect:'Transforms unwieldy documentation repos into navigable, user-centered knowledge bases with multi-layered navigation systems.',status:'—'},
      {name:'MECE Structuring',skill:'mece-pyramid-principle',effect:'Mutually Exclusive, Collectively Exhaustive structuring for complex outputs — plans, analyses, recommendations — so they are both complete and non-redundant.',status:'—'},
      {name:'Steelman Argument',skill:'steelmanning',effect:'Before committing to a recommendation, genuinely tests whether the opposing position is stronger than it appears by building the strongest version of the counterargument.',status:'—'},
      {name:'Calibrated Communication',skill:'stakeholder-communication',effect:'Separates facts from inferences, uses range estimates, and communicates unknown unknowns. Calibrates confidence by audience and decision urgency.',status:'—'},
    ]
  },
  {
    id:'planning',real:'Planning & Estimation',
    name:'School of Foresight',symbol:'◇',
    desc:'Rituals for estimating timelines, surfacing risks, and creating disciplined plans.',
    spells:[
      {name:'Base Rate Scry',skill:'reference-class-forecasting',effect:'Uses base rates from reference classes — how long did similar things actually take? — instead of intuition or optimistic inside-view estimates.',status:'—'},
      {name:'Pre-Mortem Vision',skill:'pre-mortem-state-machine',effect:'Assumes the plan has already failed spectacularly, then works backward to determine what went wrong. Surfaces real risks that optimistic planning misses.',status:'—'},
      {name:'Retrospective Mirror',skill:'retrospective',effect:'After-action review with Five Whys root cause analysis and structured action items. For learning from shipped features, incidents, and completed projects.',status:'—'},
      {name:'Explore-Exploit Compass',skill:'explore-vs-exploit-state-machine',effect:'Decides whether to continue gathering information or commit to action. Balances the value of new information against the cost of delaying the decision.',status:'—'},
      {name:'Bottleneck Sight',skill:'the-goal-theory-of-constraints-ai',effect:'Finds the single bottleneck constraining system throughput instead of optimizing everything. Based on Goldratt\'s Theory of Constraints.',status:'—'},
      {name:'Explore-Exploit Lens',skill:'explore-vs-exploit',effect:'Decision framework for the explore-vs-exploit tradeoff. Use when deciding whether to search for better options or commit to a known-good one.',status:'—'},
      {name:'Pre-Mortem Rite',skill:'pre-mortem',effect:'Prospective hindsight analysis framework. Imagine failure has already occurred, then trace backward to identify what caused it. Rank the risks and adjust the plan.',status:'—'},
      {name:'Plan with Judge',skill:'plan-with-judge',effect:'Creates a structured implementation plan in JSONL format, then iteratively improves it using a stronger user-specified model as a judge until approved.',status:'—'},
      {name:'Iterative Spec',skill:'iterative-spec-authoring',effect:'Authors a detailed technical spec grounded in research, runs up to 3 judge-LLM review cycles, then presents for user approval before implementation.',status:'—'},
      {name:'Structured Feature Path',skill:'structured-feature-planning',effect:'7-phase: explore → search on failure → stuck detection → plan (JSONL) → self-review×2 → summary → execute. No hallucination when confused.',status:'—'},
    ]
  },
  {
    id:'learning',real:'Learning & Understanding',
    name:'School of Knowledge',symbol:'✧',
    desc:'Incantations for understanding new domains, stress-testing proposals, and thinking from first principles.',
    spells:[
      {name:'Compression Test',skill:'compression-as-understanding',effect:'Verifies understanding by compressing knowledge into its minimal essential form, then testing whether that compressed representation can reconstruct the original.',status:'—'},
      {name:'Devil\'s Advocate',skill:'advocatus-diaboli',effect:'Spawns a genuinely separate adversarial sub-agent with no prior investment in the proposal. The adversary stress-tests your plan before you commit resources.',status:'—'},
      {name:'Thought Tree',skill:'tree-of-thoughts',effect:'Branches multiple reasoning paths in parallel. When the correct path is unclear, explores diverse directions before committing to any single line of thinking.',status:'—'},
      {name:'First Principles Forge',skill:'first-principles',effect:'Deconstructs problems to fundamental truths — what is genuinely known to be true? — and reasons up from there rather than reasoning by analogy or convention.',status:'—'},
      {name:'Inversion Lens',skill:'inversion-mental-model',effect:'Think backwards. Instead of asking "how do I achieve X?", ask "what would guarantee I fail to achieve X?" then avoid those things. Reveals blind spots.',status:'—'},
      {name:'Six Hats',skill:'six-thinking-hats',effect:'Examines problems from six distinct parallel perspectives: facts, emotions, risks, benefits, creativity, and process. Prevents collapsing all reasoning into one mode.',status:'—'},
      {name:'Inversion Path',skill:'inversion-mental-model-state-machine',effect:'Structured backward thinking protocol for risk, failure, blind spots, and defensive design. A formal state machine ensures you actually reason through the inversion.',status:'—'},
      {name:'Second Sight',skill:'second-order-thinking',effect:'Pushes past the immediate, obvious consequence to consider what happens next. And then what happens after that. Traces at least three orders of consequences.',status:'—'},
      {name:'Bayesian Update',skill:'bayesian-updating',effect:'Maintains explicit prior beliefs, captures new evidence, and computes posterior probabilities. Prevents over-swinging on single data points or ignoring disconfirming evidence.',status:'—'},
      {name:'Recognition Triage',skill:'recognition-primed-triage',effect:'For strong first moves under time pressure. Matches the current situation to patterns from experience and runs a mental simulation of the chosen course of action.',status:'—'},
      {name:'Structured RPD',skill:'recognition-primed-triage-state-machine',effect:'Enforced incident-response triage protocol. Gates prevent reckless action while maintaining response tempo. For genuine time-critical situations.',status:'—'},
      {name:'Fast-Slow Lens',skill:'kahneman-thinking-fast-slow-software-agent',effect:'Applies Kahneman\'s dual-process theory to coding, debugging, estimation, and architecture. Catches System 1 (fast, intuitive) errors before they ship.',status:'—'},
      {name:'Hallucination Ward',skill:'faithfulness-aware-reasoning',effect:'Detects and prevents faithfulness hallucinations where reasoning sounds plausible but is not logically entailed by the premises. Based on arXiv research.',status:'—'},
    ]
  },
  {
    id:'anti-hallucination',real:'Reasoning & Anti-Hallucination',
    name:'School of Veracity',symbol:'◈',
    desc:'Wards against reasoning decay — incantations that keep agent thinking honest and grounded.',
    spells:[
      {name:'Claim Verification',skill:'claim-verification-reasoning',effect:'Breaks reasoning into atomic claims, assigns confidence labels, verifies uncertain claims with tools, and builds dependency graphs to prevent reasoning hallucinations.',status:'—'},
      {name:'Context Density',skill:'context-density-operator',effect:'Maximizes decision-relevant information per token in the working context. Hierarchical memory with on-demand detail expansion. Based on information bottleneck principles.',status:'—'},
      {name:'CoT Pruning',skill:'cot-pruning-reasoning',effect:'Two-pass compress: coarse step-level pruning removes reasoning steps that do not change the conclusion, then fine token-level compression. Retains only what matters.',status:'—'},
      {name:'Verification Hybrid',skill:'reasoning-verification-hybrid',effect:'Master anti-hallucination protocol combining claim-level verification, backward contradiction checks, confidence calibration, and logical entailment validation.',status:'—'},
      {name:'Selective Halt',skill:'selective-halt-reasoning',effect:'Monitors reasoning output for semantic stabilization. When consecutive reasoning steps converge on equivalent conclusions, halt early. Prevents wasted elaboration.',status:'—'},
      {name:'Token Budget Warden',skill:'context-lifecycle-manager',effect:'Orchestrates context compression, CoT pruning, selective halting, and SOP capture in sequence. For long-horizon tasks where token burn is the bottleneck.',status:'—'},
      {name:'Integrity Chain',skill:'reasoning-integrity-chain',effect:'An escalating 4-phase verification chain catching all hallucination types. Faithfulness → Claims → Verification → Selective Halt. Reduces false positives from ~13% to ~4%.',status:'—'},
      {name:'Anchor Chain',skill:'hallucination-anchor-chain',effect:'Forces every factual claim to be anchored to a verified source. Unanchored claims are marked unverified and hidden from outputs. Builds a verifiable evidence chain.',status:'—'},
      {name:'Contradiction Trap',skill:'self-contradiction-trap',effect:'Maintains a persistent belief store of claims made during the session. Detects when new claims contradict existing ones and forces resolution before continuing.',status:'—'},
      {name:'Chaos Detection',skill:'chaos-detector',effect:'Computes Lyapunov exponents over token trajectories. Flags reasoning collapse before it happens — when token trajectories diverge chaotically, the session is at risk.',status:'—'},
    ]
  },
  {
    id:'software-dev',real:'Software Development',
    name:'School of Crafting',symbol:'⚒',
    desc:'Practical incantations for building, renaming, searching through, and shipping code.',
    spells:[
      {name:'Intent Binding',skill:'intent-specification-protocol',effect:'Clarifies intent before coding. Prevents the Intent-Behavior Mirroring Effect where vague requirements produce invasive, over-engineered output.',status:'—'},
      {name:'Debug Workflow',skill:'debug-issue',effect:'Forces the reproduce → isolate → fix → verify cycle. Graph-powered code navigation traces issues through the system along dataflow edges.',status:'—'},
      {name:'Codebase Walk',skill:'explore-codebase',effect:'Structured exploration with progressive deepening: module structure → file roles → symbol resolution. Token-efficient for unfamiliar codebases.',status:'—'},
      {name:'Divide & Search',skill:'codebase-divide-conquer-search',effect:'Hierarchical codebase summarization + semantic similarity partitioning + parallel sub-agent deep investigation + ranked results with confidence scores.',status:'—'},
      {name:'New Skill Rite',skill:'add-new-skill-to-repository',effect:'Standardized contribution workflow for adding skills to a skill repository. Documentation scaffolding, installation support, cross-platform verification.',status:'—'},
      {name:'Rename & Recall',skill:'bulk-rename-and-update-references',effect:'Safely discovers all files to rename, renames them, and updates every cross-reference across the codebase. Prevents broken links and stale references.',status:'—'},
      {name:'Supporting File Bind',skill:'skill-development-with-supporting-files',effect:'Workflow for creating skills that need supporting files beyond a single .md — Python scripts, templates, reference docs, config files.',status:'—'},
      {name:'Local LLM Invocation',skill:'local-llm-tooling',effect:'Setup, prompting, and structured output extraction from local LLMs (Ollama, llama.cpp). No cloud dependency for inference.',status:'—'},
      {name:'Safe Refactor',skill:'refactor-safely',effect:'Characterization testing to capture existing behavior, then bounded changes with immediate verification. Safe transformation of untested code.',status:'—'},
      {name:'Review Lens',skill:'review-changes',effect:'Structured review checklist for evaluating code changes systematically rather than reading through aimlessly.',status:'—'},
      {name:'Git Surgery',skill:'git-surgery',effect:'10 deterministic recovery protocols for common local git disasters: detached HEAD, botched rebase, force-push recovery, lost commits, merge conflicts.',status:'—'},
      {name:'Knowledge Graph',skill:'code-knowledge-graph-mcp',effect:'MCP server with structured symbol and call-graph queries. Navigate code by structure, not by string search.',status:'—'},
      {name:'Diagnostics Aggregator',skill:'dev-diagnostics-mcp',effect:'MCP server with unified parsers for ESLint, Biome, Ruff, tsc, Vitest, pytest. Returns structured JSON issues with severity and category.',status:'—'},
      {name:'Battalion Auto-Fix',skill:'lint-battalion',effect:'Mass linter error remediation via auto-fix sprint + parallel subagent battalions. Handles 500+ trivial errors mechanically, escalates semantic ones to specialists.',status:'—'},
      {name:'Verified Synthesis',skill:'verified-synthesize',effect:'Generates code plus Dafny formal specifications. Preconditions and postconditions are machine-checked via Z3 SMT solver. Provably correct code from natural language specs.',status:'—'},
    ]
  },
  {
    id:'multi-agent',real:'Multi-Agent & Coordination',
    name:'School of Confluence',symbol:'✦',
    desc:'Incantations for orchestrating multiple agents, sharing reasoning memory, and coordinating parallel workstreams.',
    spells:[
      {name:'Orchestrator Pattern',skill:'agentic-design-patterns-orchestrator',effect:'Workflow patterns for spawning specialized sub-agents: parallel fan-out, chain-of-thought delegation, evaluator-optimizer loops, and supervisor oversight.',status:'—'},
      {name:'Orchestrator Gate',skill:'agentic-design-patterns-orchestrator-state-machine',effect:'Enforced agent orchestration state machine. Routes between sequential, parallel, and evaluator-optimizer workflows based on task requirements.',status:'—'},
      {name:'Thought Retrieval',skill:'thought-retriever-coppermind',effect:'Three-layer memory architecture — working memory, retrieval tracking, procedural memory. Agents store structured thoughts that future agents retrieve and build on.',status:'—'},
      {name:'Memory Hygiene',skill:'agent-memory-hygiene',effect:'Decides what to remember, what to forget, how long to trust stored context, and when to treat cached knowledge as stale. Memory lifecycle management.',status:'—'},
      {name:'Branch Allocation',skill:'monte-carlo-tree-search',effect:'Allocates reasoning effort across multiple plausible strategy branches. Explores promising branches deeper while pruning low-value branches.',status:'—'},
      {name:'Weak Link Detection',skill:'weak-link-detection-multi-agent',effect:'Identifies and isolates the weakest reasoning chain in multi-agent outputs before aggregation. Prevents one failing agent from corrupting the final result.',status:'—'},
      {name:'SOP Evolution',skill:'sop-evolution-memory',effect:'Distills successful task trajectories into compact, reusable Standard Operating Procedures. Future similar tasks load the SOP instead of the full history.',status:'—'},
      {name:'Scout Protocol',skill:'scout',effect:'Fast sub-agent pre-reads and distills only the relevant context from files for the main model. Saves tokens, reduces distraction, prevents getting lost in large codebases.',status:'—'},
      {name:'Subagent Composer',skill:'subagent-composer',effect:'Composes high-context sub-agent briefs with skill loading, explicit boundaries, success criteria, and stop rules. Eliminates first-pass failures from incomplete briefs.',status:'—'},
      {name:'Octopus Coordination',skill:'octopus',effect:'Distributed multi-agent coordination inspired by octopus biology: contract-driven decomposition, parallel delegation, shared workspace, inter-arm coordination, autotomy on failure.',status:'—'},
    ]
  },
  {
    id:'risk',real:'Risk & Safety Analysis',
    name:'School of Warding',symbol:'🛡',
    desc:'Protective incantations for safety-critical changes, threat analysis, and pre-deployment hardening.',
    spells:[
      {name:'STPA Ward',skill:'unsafe-control-actions-hazard-analysis',effect:'Systems-Theoretic Process Analysis. Identifies unsafe control actions that could create harm before they are designed into the system.',status:'—'},
      {name:'Failure Scrying',skill:'pre-mortem',effect:'Prospective hindsight: imagine the plan has failed, then work backward to identify the causes. Surfaces risks that feel "unlikely" until you frame them as already having happened.',status:'—'},
      {name:'Second-Order Sight',skill:'second-order-thinking',effect:'Traces chains of downstream consequences beyond the immediate effect of any action. Considers what happens next, and what happens after that.',status:'—'},
      {name:'Stability Warding',skill:'release-it-stability',effect:'Stability patterns for distributed systems: circuit breakers, bulkheads, timeouts, backpressure, graceful degradation. Analyzes failure modes before they occur.',status:'—'},
      {name:'Pre-Mortem Gate',skill:'pre-mortem-state-machine',effect:'Enforced prospective analysis protocol. Formally validates a plan before execution by assuming failure has already occurred and working backward to causes.',status:'—'},
      {name:'STRIDE Analysis',skill:'security-threat-modeling',effect:'STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) threat analysis for authentication, secrets, input handling.',status:'—'},
      {name:'Vibe Hardening',skill:'vibe-coding-security-hardening',effect:'9-phase systematic hardening checklist targeting vulnerabilities that AI tools reliably introduce: exposed secrets, missing access controls, broken auth, injection flaws.',status:'—'},
    ]
  },
  {
    id:'cognitive-load',real:'Cognitive Load & Operator Support',
    name:'School of Clarity',symbol:'◈',
    desc:'Incantations for managing finite attention, reducing overhead, and keeping the agent focused.',
    spells:[
      {name:'Load Management',skill:'cognitive-load-operator-state-machine',effect:'Protocol for making information easier to understand, retain, and act on. Manages extraneous load, intrinsic complexity, and germane (productive) load.',status:'—'},
      {name:'Context Lifecycle + Budget',skill:'context-lifecycle-manager',effect:'Full lifecycle management: context is born → tracked by budget operator → decays/pruned by rot-pruner → optimized by token-budget-operator. Extends useful context life 2-3x.',status:'—'},
    ]
  },
  {
    id:'testing',real:'Testing & Evaluation',
    name:'School of Measurement',symbol:'⚖',
    desc:'Rituals for empirically measuring whether a skill actually improves outcomes.',
    spells:[
      {name:'A/B Scry',skill:'skill-ab-evaluation',effect:'Runs an A/B evaluation of any skill against a baseline using isolated subagents, 5 trials each, and an objective rubric. Measures real % improvement in isolated worktrees.',status:'—'},
      {name:'Empirical Justification',skill:'skill-ab-evaluation',effect:'Provides empirical data to justify skill refinement or retirement. Zero risk to current projects — all testing happens in isolated worktrees.',status:'—'},
    ]
  }
];

// ══════════════════════════════════════════════════════════════
//  BUILD THE GRIMOIRE
// ══════════════════════════════════════════════════════════════;

export default schools;

export const WIZARD_DATA = [
  {
    id:'bug', label:'🐛 Bug / Failure / Regression',
    desc:"Something isn't working and I need to find and fix it",
    situations:[
      { id:'stack-trace', label:'Stack trace or error log', desc:'Read a trace, find the problem', skill:'log-trace-correlation', effect:'Maps stack traces to source code, inspects context around the failure, and suggests the most likely fix.', reason:'Optimized for errors you already have in hand — the trace IS the data you need to act on.', alt:'bisect-debugging — if you need to find when this started' },
      { id:'cryptic-error', label:'Cryptic or misleading error message', desc:'Error makes no sense', skill:'log-trace-correlation', effect:'Maps stack traces to source code, inspects context around the failure, and suggests the most likely fix.', reason:'Includes error context inspection — finds the root even when the message itself is confusing.', alt:'specter — if you need competing hypotheses before you even look at the trace' },
      { id:'regression', label:'Something that used to work — now broken', desc:'Known-good code regressed', skill:'bisect-debugging', effect:'Binary searches commit history to isolate the exact change that introduced the bug. Fastest path to “what changed.”', reason:'Binary search is the mathematically optimal strategy for regression — O(log n) vs manually checking every commit.', alt:'trace-sight — if you need to understand the failure before hunting commits' },
      { id:'failing-test', label:'Test is failing, need to understand why', desc:'Unit/integration test failure', skill:'purify-test-output', effect:'Slices noisy test output down to only the failure-relevant lines. Reduces token waste by ~18.6%.', reason:'Test output is almost always too noisy to read raw — purification is the universal first step.', alt:'debug-subagent — if you want a dedicated subagent to handle the whole debug cycle' },
      { id:'complex-debug', label:'Complex or multi-step failure', desc:'Bug spans many files or layers', skill:'debug-subagent', effect:'Conjures a dedicated debugging subagent that enforces debug-before-edit. +13–22% fix rate vs editing without diagnosis.', reason:'A dedicated debugging subagent prevents the LLM from jumping straight to “fix this” before understanding “why this.”', alt:'time-traveling-debugger — for deterministic multi-step failure traces' },
      { id:'runtime-observation', label:'Need to observe runtime values to debug', desc:'Don\'t know what the values are', skill:'simulate-instrumentation', effect:'Auto-inserts temporary logging at key points, runs failing tests, feeds captured values back to the LLM.', reason:'You cannot fix what you cannot see — instrumentation is the bridge between “code looks fine” and “values are wrong.”', alt:'iterative-patch-repair — for a complete patch→test→refine cycle instead of one-off observation' },
      { id:'patch-refine', label:'Patch test cycle — generate, verify, refine', desc:'Need to iterate on a fix', skill:'iterative-patch-repair', effect:'Loops patch→test→capture→refine. Max N iterations with augmentation to avoid overfitting. +19.9% from augmentation alone.', reason:'Single-pass patching is unreliable — iterative refinement with runtime feedback converges on correct fixes.', alt:'abductive-first-debugging — for generating competing hypotheses before committing to any patch' },
      { id:'root-cause', label:'Root cause analysis for recurring bugs', desc:'Same bug keeps coming back', skill:'root-cause-analysis', effect:'Distinguishes symptoms from causes, verifies causal chains, forces upstream fixes rather than symptom patches.', reason:'Recurring bugs are almost always symptom suppression — this skill forces you to find the actual cause.', alt:'occam-root-cause — combo of root cause + Occam\'s Razor for parsimonious explanations' },
      { id:'abductive', label:'Multiple plausible causes, unsure which is real', desc:'Too many possibilities to try one by one', skill:'abductive-first-debugging', effect:'Generates multiple competing hypotheses, selects the one that best explains all observed symptoms — not the first plausible cause.', reason:'When you don\'t know where to start, abduction (generating and evaluating hypotheses) beats trial-and-error.', alt:'specter — for structural code-location search alongside hypothesis evaluation' },
      { id:'code-finding', label:'Know what the bug looks like, need to find it', desc:'Can describe the pattern but not locate it', skill:'specter', effect:'Generates competing hypotheses then locates code structurally — no keyword grepping, no root-cause guessing. Ghost hunts the real bug.', reason:'Keyword search fails when the bug is in code you don\'t know about yet. Structural matching finds it.', alt:'bisect-debugging — if the bug is in version history rather than the current code' },
    ]
  },
  {
    id:'reasoning', label:'🔮 Planning & Decisions',
    desc:"I'm confused or stuck — need to think clearly",
    situations:[
      { id:'complex-decision', label:'Complex decision with multiple options', desc:'Don\'t know which path to take', skill:'occams-razor', effect:'Favors the simplest sufficient explanation or solution. Forces trying the simplest thing that fits before escalating to alternatives.', reason:'Complex solutions often fail in complex ways. Simplicity is a reliability bet.', alt:'six-thinking-hats — for examining a decision from all angles instead of just picking one' },
      { id:'first-principles', label:'Working from first principles', desc:'Received wisdom or convention feels wrong', skill:'first-principles', effect:'Reasons from ground-up rather than from convention, analogy, or received wisdom. Uncovers hidden assumptions.', reason:'Convention hides its own assumptions. First principles makes them visible and testable.', alt:'inversion-mental-model — for stress-testing a plan by assuming it already failed' },
      { id:'risk-assessment', label:'Risks, failure modes, or blind spots', desc:'Need to surface what could go wrong', skill:'pre-mortem', effect:'Assumes failure has already occurred and works backward to identify what went wrong, rank risks, and adjust the plan.', reason:'Prospective failure analysis is more reliable than trying to predict success paths.', alt:'failure-analysis-protocol — fuse of Pre-Mortem + Inversion + Second-Order Thinking for maximum depth' },
      { id:'multi-step-plan', label:'Multi-step plan with many dependencies', desc:'Complex plan, need to verify each step', skill:'step-level-verification-protocol', effect:'Verifies each reasoning step before proceeding. Prevents error propagation in multi-step tasks.', reason:'Multi-step reasoning compounds errors — step-level verification catches them before they cascade.', alt:'PDCA-deming — for ongoing measurement-anchored improvement cycles' },
      { id:'planning-under-uncertainty', label:'Planning under uncertainty', desc:'Don\'t know the full picture yet', skill:'monte-carlo-tree-search', effect:'Allocates reasoning effort to the branches that earn it through evidence. Prevents exploring fancy solutions when simple ones suffice.', reason:'MCTS is the proven framework for resource-bounded decision-making under uncertainty.', alt:'bayesian-updating — for maintaining and updating beliefs as evidence arrives' },
      { id:'unconventional-thinking', label:'Need unconventional or creative thinking', desc:'Standard approaches keep failing', skill:'cross-domain-analogy-generator', effect:'Breaks fixation by forcing analogies from unrelated domains — biology, music, traffic engineering — and transfers insights.', reason:'Fixation is the most common cause of planning failure. Cross-domain analogy is the systematic fix.', alt:'jury — for spawning parallel perspectives that argue and surface the conflict graph' },
    ]
  },
  {
    id:'code-review', label:'📋 Code Review & Quality',
    desc:"Need to evaluate code — mine or someone else's",
    situations:[
      { id:'doubt-quality', label:'General quality or correctness doubts', desc:'Something feels off but can\'t articulate it', skill:'code-review-excellence', effect:'Provides constructive feedback, catches bugs early, and fosters knowledge sharing while maintaining team morale.', reason:'General quality review benefits from a structured framework — this skill covers the full review lifecycle.', alt:'super-review-typescript — specialized for the five failure modes of LLM-authored TypeScript' },
      { id:'typescript-review', label:'TypeScript code — catching LLM failures', desc:'Reviewing AI-generated TypeScript', skill:'super-review-typescript', effect:'Targets five specific failure modes: security vulnerabilities, hallucinated APIs, logic errors, type-safety violations, architectural decay.', reason:'AI-authored TypeScript has predictable failure patterns — this skill is specifically tuned to them.', alt:'code-review-excellence — for broader review that covers more than TypeScript failure modes' },
      { id:'pre-commit', label:'Before committing — catch systematic failures', desc:'Pre-push checklist', skill:'llm-pre-push-review', effect:'Pre-push checklist for catching LLM-specific failures: overcorrection, hallucinated logic, silent vulnerabilities, missing edge cases.', reason:'LLM-authored code has specific failure modes that standard review won\'t catch. This is the pre-push specific version.', alt:'review-ladder-plus — for formal multi-reviewer code review with forced test generation' },
      { id:'safety-critical', label:'Safety or security-critical code', desc:'Code where bugs could cause serious harm', skill:'security-review-protocol', effect:'Fuses attack surface analysis, hazardous operation checking, and LLM-specific vulnerability audit.', reason:'Safety-critical code demands layered review — this combines three security disciplines.', alt:'unsafe-control-actions-hazard-analysis — for identifying control actions that could cause serious harm or irreversible damage' },
    ]
  },
  {
    id:'architecture', label:'🏛 Architecture & Design',
    desc:"Structure, pattern, or system-level decisions",
    situations:[
      { id:'system-design', label:'System-level architecture or design', desc:'Large-scale structural decisions', skill:'system-architecture-audit', effect:'Four-phase audit: system mapping → boundary analysis → data flow analysis → stability assessment.', reason:'System architecture is complex enough to need a structured audit framework — this enforces completeness.', alt:'domain-driven-design — for reasoning about software architecture in terms of the business domain' },
      { id:'data-systems', label:'Data systems, storage, distributed behavior', desc:'Database, cache, queue, or data pipeline decisions', skill:'designing-data-intensive-applications-ai', effect:'Reasons about data systems, storage choices, distributed behavior, and tradeoffs in reliability, scalability, and maintainability.', reason:'Data systems have well-documented tradeoffs — this skill surfaces them so you don\'t re-learn them empirically.', alt:'accelerate-ai — for improving engineering delivery and operational reliability' },
      { id:'team-boundaries', label:'Organizing work across teams or ownership', desc:'Team topology or ownership decisions', skill:'team-topologies-ai', effect:'Organizes work across multiple agents, teams, or ownership boundaries without creating coordination chaos.', reason:'Team topology mistakes are expensive and slow to fix. This skill surfaces the organizational options.', alt:'philosophy-of-software-design-state-machine — for managing complexity and avoiding shallow abstraction sprawl' },
      { id:'improving-existing', label:'Improving existing codebase structure', desc:'Refactoring or restructuring', skill:'improve-codebase-architecture', effect:'Finds deepening opportunities informed by the domain language in CONTEXT.md and decisions in docs/adr/.', reason:'Architecture improvement without domain context often makes things worse. This grounds changes in existing decisions.', alt:'refactoring-state-machine — for improving structure without drifting into endless cleanup' },
    ]
  },
  {
    id:'refactoring', label:'🔧 Refactoring & Code Improvement',
    desc:"Improving code without changing its behavior",
    situations:[
      { id:'brittle-code', label:'Brittle code with weak tests or tight coupling', desc:'Scared to change it', skill:'working-effectively-with-legacy-code-state-machine', effect:'Changes brittle code through characterization, seam creation, then transformation in bounded slices with anti-loop protection.', reason:'Legacy code requires a specific workflow — this enforces the discipline that prevents making things worse.', alt:'legacy-rescue-protocol — fuse of Working Effectively with Legacy Code + Refactoring State Machine for maximum protection' },
      { id:'structure-improvement', label:'Improving structure without changing behavior', desc:'Restructure without breaking things', skill:'refactoring-state-machine', effect:'Improves structure without drifting into endless cleanup. Enforces bounded refactoring with stopping rules.', reason:'Refactoring without a stopping rule is just cleanup — this enforces the discipline that keeps it bounded.', alt:'working-effectively-with-legacy-code-state-machine — for when the code is too brittle to refactor normally' },
      { id:'no-tests', label:'Code with no tests — need to add tests first', desc:'Can\'t refactor safely without tests', skill:'test-driven-development', effect:'Red-green-refactor loop. Write the test first, watch it fail, write the minimal fix, then refactor.', reason:'Testless code demands test-first approach — this enforces the loop that makes refactoring safe.', alt:'tdd — same thing, triggered by mentioning “red-green-refactor” or “test-first”' },
    ]
  },
  {
    id:'testing-skill', label:'🧪 Testing & Evaluation',
    desc:"Writing tests, measuring quality, benchmarking",
    situations:[
      { id:'test-writing', label:'Writing or fixing unit/integration tests', desc:'Need correct tests for correctness', skill:'jest-testing', effect:'Comprehensive guide for correct Jest tests: matchers, async patterns, mocking, configuration, and React Native specifics.', reason:'Jest has specific failure modes — this skill covers them so you write tests that actually test what you think they test.', alt:'vitest — if you\'re on Vitest instead of Jest (same API, faster)' },
      { id:'vitest-testing', label:'Vitest tests (fast Vite-native test runner)', desc:'Using Vitest', skill:'vitest', effect:'Fast unit testing framework powered by Vite with Jest-compatible API. Covers mocking, coverage, fixtures, and test filtering.', reason:'Vitest is Jest-compatible but has its own quirks — this skill covers them.', alt:'jest-testing — if you\'re on Jest' },
      { id:'end-to-end', label:'End-to-end or browser UI testing', desc:'Playwright or browser automation', skill:'playwright-best-practices', effect:'Covers E2E, component, API, visual, accessibility, security, and extension testing with Playwright.', reason:'Playwright has many failure modes — this skill is the comprehensive guide for avoiding them.', alt:'maestro — for mobile UI automation on iOS and Android instead of browser' },
      { id:'skill-evaluation', label:'Benchmarking or evaluating a skill', desc:'Want to measure if a skill works', skill:'skill-ab-evaluation', effect:'A/B evaluates any skill against a baseline using isolated subagents, 5 trials each, and an objective rubric. Measures real % improvement.', reason:'Intuition about skill effectiveness is unreliable. A/B evaluation gives empirical data.', alt:'empirical-justification — for providing data to justify skill refinement or retirement' },
    ]
  },
  {
    id:'api-data', label:'🌐 API, Network & Data Fetching',
    desc:"Working with APIs, HTTP, or data retrieval",
    situations:[
      { id:'api-debugging', label:'API or network failure', desc:'Request is failing or behaving unexpectedly', skill:'network-api-debugging', effect:'Diagnoses CORS, auth tokens, rate limiting, redirect chains, WebSocket drops, and HTTP mismatches.', reason:'Network failures are often multi-layered. This skill maps the full chain and finds the breaking link.', alt:'native-data-fetching — for data fetching patterns in React Native or Expo apps' },
      { id:'data-fetching', label:'Data fetching in a React/Expo app', desc:'useLoaderData, fetch, React Query, SWR', skill:'native-data-fetching', effect:'Covers fetch API, React Query, SWR, error handling, caching, offline support, and Expo Router data loaders.', reason:'Data fetching has specific React patterns that differ from vanilla JS. This skill covers the right approach.', alt:'network-api-debugging — for debugging the underlying HTTP failures' },
      { id:'external-api', label:'Calling an external library or API', desc:'Need to verify current API surface', skill:'api-surface-anchoring', effect:'Verifies current API surface from authoritative docs before writing code. Prevents hallucinated signatures.', reason:'LLMs hallucinate API signatures. Verification before coding is the only reliable fix.', alt:'verified-api-workflow — for hybrid API anchoring + hallucination prevention chain' },
    ]
  },
  {
    id:'output-quality', label:'✨ Output Quality & Verification',
    desc:"Improving, verifying, or stress-testing output",
    situations:[
      { id:'revision', label:'Need to improve a first draft or answer', desc:'Initial output is improvable', skill:'bounded-self-revision', effect:'Revises output with bounded iterations. Prevents infinite revision loops.', reason:'Unbounded revision is a trap — this enforces discipline so revision improves output rather than chasing diminishing returns.', alt:'self-verify-pipeline — for escalating verification: internal critique → claim decomposition → tool verification' },
      { id:'understanding-check', label:'Verifying genuine understanding', desc:'Need to confirm I actually understand something', skill:'feynman-technique', effect:'Explains something from the ground up in simple language. If you can\'t compress it, you don\'t understand it.', reason:'The Feynman test is the most reliable check for genuine understanding vs pattern matching.', alt:'compression-as-understanding — automated version of the same idea' },
      { id:'output-stress-test', label:'Stress-testing a plan, design, or proposal', desc:'Need to challenge something before committing', skill:'adversarial-review', effect:'Stress-tests proposals against a SEPARATE adversarial subagent. Not self-critique — tool-mediated review with no prior investment.', reason:'Self-critique is unreliable when you\'ve already committed to a position. Adversarial review fixes this.', alt:'steelmanning — for testing whether the opposing position is stronger than it appears' },
      { id:'complex-output', label:'Structuring a complex output', desc:'Plan, analysis, recommendation, memo', skill:'mece-pyramid-principle', effect:'Structures complex outputs so they are both complete and non-redundant. MECE: Mutually Exclusive, Collectively Exhaustive.', reason:'Complex outputs need structure to be useful. This principle ensures completeness without redundancy.', alt:'six-thinking-hats — for examining a problem from multiple perspectives before structuring the output' },
    ]
  },
  {
    id:'collaboration', label:'🤝 Agent Collaboration & Memory',
    desc:"Working with multiple agents or shared context",
    situations:[
      { id:'memory', label:'What to remember across sessions', desc:'Context, decisions, what to store', skill:'agent-memory-hygiene', effect:'Decides what to remember, what to forget, how long to trust stored context, and when to treat cached knowledge as stale.', reason:'Unstructured memory degrades over time. This skill enforces the discipline of memory hygiene.', alt:'coppermind — for three-layer memory architecture with working memory, retrieval tracking, and evolution' },
      { id:'multi-agent', label:'Delegating or coordinating multiple agents', desc:'Subagent workflow, handoff, coordination', skill:'agentic-design-patterns-orchestrator', effect:'Behaves like a real workflow system rather than a one-shot responder. Covers skill selection, context levels, multi-agent coordination.', reason:'Multi-agent coordination has specific failure modes. This pattern system prevents them.', alt:'subagent-composer — for composing subagent briefs with skill loading, explicit boundaries, and success criteria' },
      { id:'handoff', label:'Handing off work between sessions', desc:'Session transition, context preservation', skill:'summarize', effect:'EMERGENCY STOP + HANDOFF REPORT. Preserves full context for the next agent.', reason:'Sessions have zero memory of each other. Handoff is the only way to preserve context across session boundaries.', alt:'resume-handoff — for resuming from a handoff document produced by summarize' },
    ]
  },
  {
    id:'cognition', label:'◈ Cognitive Load & Metacognition',
    desc:"Managing thinking, attention, and reasoning quality",
    situations:[
      { id:'attention', label:'Managing finite attention and focus', desc:'Keep the agent (or self) on track', skill:'cognitive-load-operator-state-machine', effect:'Makes information easier to understand, retain, and act on. Manages extraneous load, intrinsic complexity, and germane (productive) load.', reason:'Cognitive overload degrades reasoning quality. This skill provides the systematic fix.', alt:'context-budget-operator — for managing finite context windows with explicit token budgets' },
      { id:'bias', label:'Cognitive bias or decision quality issues', desc:'Worried about bias contaminating decisions', skill:'cognitive-bias-checklist', effect:'Checks whether specific high-consequence cognitive biases have contaminated the output of a decision or analysis.', reason:'Cognitive biases are predictable and systematic. The checklist makes them visible and addressable.', alt:'cognitive-bias-auditor — for detecting biases in agent decision-making based on arXiv research' },
      { id:'confidence', label:'Calibrating confidence and accuracy', desc:'Need to assess whether a belief is reliable', skill:'metacognitive-monitoring', effect:'Calibrates confidence vs accuracy. After every significant answer, assesses whether to KEEP or WITHDRAW output.', reason:'Uncalibrated confidence leads to overcommitment. This skill enforces the calibration discipline.', alt:'claim-verification-reasoning — for breaking reasoning into atomic claims and verifying uncertain ones' },
    ]
  },
  {
    id:'other', label:'📦 Other & Edge Cases',
    desc:"Edge cases, general utility, or uncategorized",
    situations:[
      { id:'uncertain', label:"I'm not sure what I need", desc:'Vague, unclear, or underspecified problem', skill:'task-intake-protocol', effect:'Universal preflight gate: classify the problem (Cynefin), set the evidence bar (ETTO), take the first action (Recognition-Primed Triage).', reason:'Underspecified problems need classification before they need solutions. This protocol does that.', alt:'socratic-clarification — for surfacing critical assumptions before acting on an ambiguous request' },
      { id:'documentation', label:'Writing or improving documentation', desc:'Docs, READMEs, guides', skill:'documentation-craft', effect:'Multi-phase documentation process: outline-first planning, context-aware drafting, quality verification.', reason:'Documentation that\'s technically accurate but unhelpful is worse than no docs. This ensures useful output.', alt:'large-documentation-navigation — for transforming large doc repositories into navigable knowledge bases' },
      { id:'security-general', label:'General security or vulnerability concerns', desc:'Secrets, auth, input validation', skill:'security-threat-modeling', effect:'Analyzes assets, trust boundaries, and entry points from an attacker\'s perspective. Prevents shipping common vulnerabilities.', reason:'Security mistakes are among the most expensive mistakes. Threat modeling is the proven framework for avoiding them.', alt:'security-review-protocol — for the full layered security review combining STRIDE + Unsafe Control Actions + LLM-specific audit' },
    ]
  }
];
