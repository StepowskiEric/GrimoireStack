export const WIZARD_DATA = [
  {
    id: 'bug',
    label: 'Bug / Failure / Regression',
    desc: "Something isn't working and I need to find and fix it",
    situations: [
      {
        id: 'stack-trace',
        label: 'Stack trace or error log',
        desc: 'Read a trace, find the problem',
        skill: 'debug-issue',
        effect:
          'Maps stack traces to source code, inspects context around the failure, and suggests the most likely fix.',
        reason:
          'Optimized for errors you already have in hand — the trace IS the data you need to act on.',
        alt: 'debug-to-fix-pipeline — if you need to find when this started',
      },
      {
        id: 'cryptic-error',
        label: 'Cryptic or misleading error message',
        desc: 'Error makes no sense',
        skill: 'debug-issue',
        effect:
          'Maps stack traces to source code, inspects context around the failure, and suggests the most likely fix.',
        reason:
          'Includes error context inspection — finds the root even when the message itself is confusing.',
        alt: 'specter — if you need competing hypotheses before you even look at the trace',
      },
      {
        id: 'regression',
        label: 'Regression — something that used to work',
        desc: 'Find the change that broke it',
        skill: 'debug-to-fix-pipeline',
        effect:
          'Binary search across git history to isolate the exact commit that introduced the bug.',
        reason:
          'Fastest way to find "what changed" when tests used to pass — O(log n) commits checked.',
        alt: 'specter — if the cause is likely config or environment, not a code change',
      },
      {
        id: 'random-failure',
        label: 'Random / non-deterministic failure',
        desc: 'Fails sometimes, passes other times with no changes',
        skill: 'specter',
        effect:
          'Systematically surfaces the real risks in a plan before committing — works backward from the failure to find what went wrong.',
        reason:
          'Non-deterministic failures point to race conditions, timing, or state leakage — root-cause analysis is the structured way to surface the underlying mechanism.',
        alt: 'specter — generates competing hypotheses for "weird" bugs where the crash site is not the cause',
      },
      {
        id: 'wild-guess',
        label: 'Guessing at fixes / wasting time',
        desc: 'Trying things at random',
        skill: 'specter',
        effect:
          'Traces the failure back to its root cause rather than patching symptoms — prevents the "try random things until it passes" death spiral.',
        reason:
          'Random-fix loops are the most common debugging anti-pattern. Root-cause analysis breaks the loop by structuring the investigation.',
        alt: 'bug-inquisition — if you need the full structured investigation protocol',
      },
      {
        id: 'hard-bug',
        label: 'Stuck on a hard bug for hours',
        desc: 'Nothing has worked',
        skill: 'bug-inquisition',
        effect:
          'Systematic root-cause debugging with mandatory context-gathering — fuses evidence-ledger tracking, pre-mortem on every fix, and multi-model cross-check.',
        reason:
          'When surface debugging has failed, this brings the heavy structure: track what you tried, demand evidence, disconfirm hypotheses until one survivor remains.',
        alt: 'bug-inquisition-conquest — for the absolute hardest bugs (intermittent, environment-specific, already failed surface debugging)',
      },
    ],
  },
  {
    id: 'planning',
    label: 'Architecture / Design / Planning',
    desc: 'I need to design or plan something before building it',
    situations: [
      {
        id: 'arch-decisions',
        label: 'Make a technical decision',
        desc: 'Choose between approaches',
        skill: 'feature-architecture',
        effect:
          'Reveals the business domain model that should drive technical decisions — makes the right choice obvious by clarifying what the code is really about.',
        reason:
          'Technical decisions should follow domain boundaries. Domain-driven design surfaces the seams that nature already drew.',
        alt: 'documentation-and-adrs — if the decision needs to be recorded for posterity',
      },
      {
        id: 'system-design',
        label: 'Design a new system or feature',
        desc: 'Greenfield or major addition',
        skill: 'feature-architecture',
        effect:
          'Reveals the business domain model that should drive technical decisions — makes the right choice obvious by clarifying what the code is really about.',
        reason:
          'New systems are the best opportunity to get the domain model right. Starting with DDD prevents the accretion of accidental complexity.',
        alt: 'plan-feature-architecture — if the scope is a single feature, not a whole system',
      },
      {
        id: 'boundaries',
        label: 'Define module / service boundaries',
        desc: 'Split up a monolithic concern',
        skill: 'feature-architecture',
        effect:
          'Reveals the business domain model that should drive technical decisions — makes the right choice obvious by clarifying what the code is really about.',
        reason:
          'Bounded contexts are the fundamental unit of modularity. DDD gives you the language to find them.',
        alt: 'team-topologies-ai — if the boundary decision affects team structure, not just code',
      },
      {
        id: 'improve-arch',
        label: 'Improve existing architecture',
        desc: 'Refactor toward a better structure',
        skill: 'improve-codebase-architecture',
        effect:
          'Finds deepening opportunities informed by the domain language — identifies hot-spots, boundary violations, and missing abstractions in the current codebase.',
        reason:
          'Improving architecture is not a rewrite — it is finding the deepening opportunities the existing code hints at.',
        alt: 'refactor-clean — if the architecture is basically right but the implementation is messy; or split-large-files if the primary smell is file size',
      },
      {
        id: 'audit-arch',
        label: 'Audit existing system architecture',
        desc: 'Review for risks or improvements',
        skill: 'system-architecture-audit',
        effect:
          'Four-phase sequential audit: map the system, evaluate boundaries, judge data flow, assess stability and failure modes.',
        reason:
          'Architecture review needs structure, not intuition. This fuses all four architecture disciplines into one audit protocol.',
        alt: 'architecture-evolution-review — for a lighter, ongoing review rather than a full audit',
      },
      {
        id: 'legacy-code',
        label: 'Work with legacy / fragile code',
        desc: 'Change code safely',
        skill: 'working-effectively-with-legacy-code-state-machine',
        effect:
          'Characterizes the legacy behavior, creates test seams, then transforms in bounded slices with anti-loop protection.',
        reason:
          'Legacy code demands a different approach: characterize before change, create seams before refactoring, slice before transforming.',
        alt: 'refactoring-state-machine — for structural improvement in tested code, not legacy rescue',
      },
      {
        id: 'monolith-breakup',
        label: 'Break up a monolith',
        desc: 'Plan extraction',
        skill: 'feature-architecture',
        effect:
          'Reveals the business domain model that should drive technical decisions — makes the right choice obvious by clarifying what the code is really about.',
        reason:
          'Monolith breakup is the ultimate bounded-context exercise. Getting the wrong boundaries means painful re-division later.',
        alt: 'improve-codebase-architecture — for identifying extraction targets from the code itself',
      },
    ],
  },
  {
    id: 'dev-lifecycle',
    label: 'Development Workflow & Operations',
    desc: 'Improve how I build, test, and ship',
    situations: [
      {
        id: 'add-feature',
        label: 'Add a new feature to existing code',
        desc: 'Incremental addition',
        skill: 'incremental-implementation',
        effect:
          'Delivers changes incrementally, preventing large code dumps and enabling mid-course correction at each step.',
        reason:
          'Single large changes are the #1 source of "it worked in my head" bugs. Incremental implementation forces the code to prove itself at each step.',
        alt: 'refactoring-state-machine — if adding the feature first requires cleaning up the area you are working in',
      },
      {
        id: 'refactor',
        label: 'Refactor existing code',
        desc: 'Improve structure without changing behavior',
        skill: 'refactor-clean',
        effect:
          'Replaces the old shape with the simpler shape the codebase would want if it were designed today — merging duplicated owners or splitting overloaded modules.',
        reason:
          'Refactoring is not layering sediment — it is moving ownership until every concept has exactly one clear home.',
        alt: 'split-large-files — if the primary smell is a file that has grown too large; or refactoring-state-machine — if you need a structured gate to prevent scope creep',
      },
      {
        id: 'code-review',
        label: 'Review code before merging',
        desc: 'Get a review pass',
        skill: 'code-review-excellence',
        effect:
          'Provides constructive feedback, catches bugs early, and fosters knowledge sharing — reviewing for correctness, design, test coverage, and maintainability.',
        reason:
          'Code review is the last gate before production. A structured review catches what authors miss.',
        alt: 'security-review — if the change touches auth, data, or security-sensitive paths',
      },
      {
        id: 'debug-ci',
        label: 'Fix a failing CI / build',
        desc: 'Broken pipeline',
        skill: 'environment-recovery',
        effect:
          'Diagnoses and fixes broken development environments — missing tools, wrong versions, corrupted caches, full disks, permission drift, and dependency hell.',
        reason:
          'CI failures are environment problems until proven otherwise. Environment recovery is built for these diagnostics.',
        alt: 'network-api-debugging — if the failure is a network or API call, not a tool; or debug-issue — if you have a specific error trace',
      },
      {
        id: 'test-strategy',
        label: 'Plan or improve test strategy',
        desc: 'Better test coverage',
        skill: 'write-tests',
        effect:
          'Writes tests that pin real behavior instead of implementation details — config values, lucky samples, or brittle selectors.',
        reason:
          'Good tests survive refactoring. Bad tests couple to implementation and break on every change. This skill teaches the difference.',
        alt: 'unit-test-debugging — if you want to write the tests before the code; or e2e-testing-philosophy-and-architecture — for the full E2E testing mindset',
      },
      {
        id: 'shipping-check',
        label: 'Pre-deployment checklist / launch prep',
        desc: 'Make sure Im ready to ship',
        skill: 'shipping-and-launch',
        effect:
          'Prepares production launches — pre-launch checklist, monitoring setup, staged rollout planning, and rollback strategy.',
        reason:
          'Shipping is risky. A structured launch checklist prevents the most common production failures.',
        alt: 'security-review — if the deployment involves auth, data, or compliance boundaries',
      },
      {
        id: 'docs-api',
        label: 'Document an API or design decision',
        desc: 'Record for future reference',
        skill: 'documentation-and-adrs',
        effect:
          'Records decisions and documentation — ideal for architectural decisions, changing public APIs, shipping features, or recording context future engineers will need.',
        reason:
          'Undocumented decisions are lost knowledge. ADRs capture the "why" that code cannot express.',
        alt: 'documentation-craft — for comprehensive documentation generation, not just decision records',
      },
      {
        id: 'performance-tune',
        label: 'Profile and optimize performance',
        desc: 'Make it faster',
        skill: 'performance-optimization',
        effect:
          'Optimizes application performance across frontend, backend, queries, and databases — Core Web Vitals, load times, N+1 queries, and bottlenecks.',
        reason:
          'Performance optimization should follow the evidence. Profile first, then fix what matters.',
        alt: 'observability-and-instrumentation — if you need to add monitoring first before you can identify bottlenecks',
      },
    ],
  },
  {
    id: 'reasoning',
    label: 'Thinking & Decision-Making',
    desc: 'I need to think through a complex problem',
    situations: [
      {
        id: 'hard-problem',
        label: 'Complex / multi-faceted problem',
        desc: 'Many dimensions to consider',
        skill: 'kahneman-thinking-fast-slow-software-agent',
        effect:
          'Uses the fast vs. slow thinking model to make AI software agents more reliable during coding, debugging, refactoring, review, estimation, and architecture work.',
        reason:
          'Complex problems need System 2 (slow, deliberate) thinking. This skill enforces that discipline.',
        alt: 'thinking-in-systems-state-machine — for problems with feedback loops and delayed effects',
      },
      {
        id: 'options',
        label: 'Compare multiple approaches',
        desc: 'Choose between valid options',
        skill: 'documentation-craft',
        effect:
          'Structures complex outputs — plans, analyses, recommendations, memos, explanations — so they are both complete and non-redundant.',
        reason:
          'MECE forces you to enumerate all options before choosing — preventing the "forgotten alternative" failure mode.',
        alt: 'jury — if the options have genuine tradeoffs and reasonable people disagree; or brainstorming — if you need to generate options first',
      },
      {
        id: 'blind-spots',
        label: 'Check for blind spots / biases',
        desc: 'Avoid common thinking traps',
        skill: 'cognitive-bias-checklist',
        effect:
          'Checks whether specific high-consequence cognitive biases have contaminated the output — applied to important decisions, recommendations, estimates, architecture choices, or analyses.',
        reason:
          'Bias is invisible to the biased. A structured checklist is the only reliable defense.',
        alt: 'advocatus-diaboli — for adversarial challenge from a genuinely different cognitive entity',
      },
      {
        id: 'risk-check',
        label: 'Surface risks before committing',
        desc: 'What could go wrong?',
        skill: 'pre-mortem',
        effect:
          'Surfaces the real risks in a plan before committing to it — assumes the plan has already failed and works backward to find out why.',
        reason:
          'The pre-mortem is the single highest-leverage thinking tool: it costs nothing and prevents expensive failures.',
        alt: 'inversion-mental-model — for a lighter "what if we inverted our assumptions" check',
      },
      {
        id: 'uncertain-estimate',
        label: 'Estimate timeline / cost / scope',
        desc: 'How long will this take?',
        skill: 'reference-class-forecasting',
        effect:
          'Estimates timeline, cost, scope, or probability of success by comparing to a reference class of similar past projects.',
        reason:
          'Inside-view estimates are systematically overconfident. Reference-class forecasting corrects the bias by grounding estimates in actual outcomes.',
        alt: 'pre-mortem — for surfacing uncertainty factors, not numerical estimates',
      },
      {
        id: 'tradeoff',
        label: 'Evaluate tradeoffs between options',
        desc: 'Whats the right balance?',
        skill: 'feature-architecture',
        effect:
          'Reveals the business domain model that should drive technical decisions — makes the right choice obvious by clarifying what the code is really about.',
        reason:
          'Tradeoffs are only resolvable by referring to what the system is actually for. DDD provides the language for that reference.',
        alt: 'documentation-craft — to ensure you have enumerated all options before evaluating tradeoffs',
      },
    ],
  },
  {
    id: 'testing',
    label: 'Testing & Quality',
    desc: 'I need to ensure quality through testing',
    situations: [
      {
        id: 'e2e-flow',
        label: 'Set up or improve E2E tests',
        desc: 'End-to-end test planning',
        skill: 'e2e-testing-philosophy-and-architecture',
        effect:
          'Comprehensive reference for E2E testing mindset, architecture, and strategy — covers testing epistemology, 3-layer BDR architecture, risk-based prioritization, and data realism.',
        reason:
          'E2E tests are expensive. A clear philosophy ensures every E2E test earns its keep.',
        alt: 'e2e-crosscheck — if you already have E2E tests and need to verify they still match the code',
      },
      {
        id: 'flaky-tests',
        label: 'Fix flaky / unreliable tests',
        desc: 'Tests that fail intermittently',
        skill: 'e2e-crosscheck',
        effect:
          'Bidirectional cross-reference between E2E test selectors/assertions and source code — catches silent failures: dead identifiers, drifted UI text, stale routes, orphaned tests.',
        reason:
          'Flaky tests erode trust in the entire suite. Cross-referencing against source code finds the root cause.',
        alt: 'purify-test-output — if the flakiness is from noisy test output drowning out the real failure',
      },
      {
        id: 'unit-tests',
        label: 'Write or improve unit tests',
        desc: 'Test individual components',
        skill: 'write-tests',
        effect:
          'Writes tests that pin real behavior instead of implementation details — config values, lucky samples, or brittle selectors.',
        reason:
          'Unit tests are the foundation. Getting them right prevents the entire test pyramid from being built on sand.',
        alt: 'unit-test-debugging — if existing tests are failing and you need to fix them',
      },
      {
        id: 'test-gaps',
        label: 'Identify test coverage gaps',
        desc: 'What am I not testing?',
        skill: 'e2e-test-premortem',
        effect:
          'Premortem for E2E test changes — audits coverage gaps, data realism, failure-mode coverage, and assertion quality before declaring done.',
        reason:
          'You cannot fix what you do not measure. A test premortem reveals coverage gaps before bugs do.',
        alt: 'mobile-e2e-testing-enterprise-guide — for a broader "hunters mindset" across the full testing surface',
      },
      {
        id: 'mobile-test',
        label: 'Test mobile / device-specific flows',
        desc: 'On-device quality',
        skill: 'mobile-e2e-testing-enterprise-guide',
        effect:
          'Hunter mindset for mobile E2E testing — what to test, how to catch real bugs, verify flows work, and avoid traps on mobile platforms.',
        reason:
          'Mobile testing has unique failure modes (network, device state, gestures, interrupts). A specialized guide prevents the most common mobile-specific regressions.',
        alt: 'e2e-testing-philosophy-and-architecture — for the foundational E2E principles that apply across platforms',
      },
    ],
  },
  {
    id: 'security',
    label: 'Security & Hardening',
    desc: 'I need to find or fix security issues',
    situations: [
      {
        id: 'security-audit',
        label: 'Audit code for security issues',
        desc: 'Find vulnerabilities',
        skill: 'security-threat-modeling',
        effect:
          'Prevents the most common security vulnerabilities and design flaws — covers injection, auth, data exposure, and supply chain risks using STRIDE and OWASP frameworks.',
        reason:
          'Security is a property of the architecture, not a feature. Threat modeling finds the design-level issues that scanners miss.',
        alt: 'security-review — for a code-level review focused on implementation bugs',
      },
      {
        id: 'secure-coding',
        label: 'Write secure code from the start',
        desc: 'Security by design',
        skill: 'security-threat-modeling',
        effect:
          'Prevents the most common security vulnerabilities and design flaws — covers injection, auth, data exposure, and supply chain risks using STRIDE and OWASP frameworks.',
        reason:
          'Building security in from the start is orders of magnitude cheaper than retrofitting it.',
        alt: 'vibe-coding-security-hardening — for the specific vulnerability patterns common in AI-generated code',
      },
      {
        id: 'pre-deploy-security',
        label: 'Security gate before deployment',
        desc: 'Pre-release check',
        skill: 'security-review-protocol',
        effect:
          'Three-phase security audit: Security Threat Modeling (STRIDE) + Unsafe Control Actions + Vibe Coding Security Hardening.',
        reason:
          'A pre-deployment security gate catches the vulnerabilities that development speed overlooks.',
        alt: 'deep-security-review — for high-stakes deployments where a single vulnerability could be catastrophic',
      },
      {
        id: 'llm-vuln',
        label: 'Review LLM-generated code for security',
        desc: 'Catch AI-specific vulns',
        skill: 'vibe-coding-security-hardening',
        effect:
          'Hardens AI-generated code against the vulnerabilities LLMs consistently produce — studies show 45%+ of AI-generated code contains OWASP Top 10 vulnerabilities.',
        reason:
          'LLMs optimize for functionality, not security. A dedicated hardening pass catches the vulnerabilities they reliably miss.',
        alt: 'security-threat-modeling — for a broader security analysis beyond LLM-specific patterns',
      },
      {
        id: 'api-security',
        label: 'Secure an API endpoint',
        desc: 'API-level hardening',
        skill: 'security-threat-modeling',
        effect:
          'Prevents the most common security vulnerabilities and design flaws — covers injection, auth, data exposure, and supply chain risks using STRIDE and OWASP frameworks.',
        reason:
          'APIs are the primary attack surface. Threat modeling each endpoint prevents the most common API exploits.',
        alt: 'api-surface-anchoring — if the security concern is about breaking existing clients, not vulnerabilities',
      },
    ],
  },
  {
    id: 'learning',
    label: 'Learning & Understanding',
    desc: 'I need to understand a codebase, concept, or tool',
    situations: [
      {
        id: 'new-codebase',
        label: 'Explore an unfamiliar codebase',
        desc: 'Get oriented quickly',
        skill: 'explore-codebase',
        effect:
          'Structured exploration with progressive deepening: module structure → file roles → symbol resolution — token-efficient for unfamiliar codebases.',
        reason:
          'Random exploration of a new codebase is inefficient. Structured deepening quickly builds a mental model.',
        alt: 'codebase-divide-conquer-search — if you are looking for something specific, not general orientation',
      },
      {
        id: 'understand-concept',
        label: 'Understand a complex concept',
        desc: 'Deep learning',
        skill: 'feynman-technique',
        effect:
          'Verifies genuine understanding by explaining in simple language — if you cannot explain it simply, you do not understand it well enough.',
        reason:
          'The Feynman Technique is the single best test of understanding. It reveals gaps that reading alone misses.',
        alt: 'compression-as-understanding — for a more structured "compress and reconstruct" check',
      },
      {
        id: 'find-code',
        label: 'Find where something is in the code',
        desc: 'Locate implementation',
        skill: 'codebase-divide-conquer-search',
        effect:
          'Used when the codebase is too large for context, grep produces too many candidates, or the target could be in any of several modules.',
        reason:
          'When grep fails, structural search through call graphs and data flows finds what naming cannot.',
        alt: 'explore-codebase — for general orientation, not a specific target',
      },
      {
        id: 'learn-framework',
        label: 'Learn a new library or framework',
        desc: 'Ramp up quickly',
        skill: 'source-driven-development',
        effect:
          'Grounds every implementation decision in official documentation — authoritative, source-cited code free from outdated patterns.',
        reason:
          'Learning from official docs avoids the "tutorial debt" of following outdated blog posts.',
        alt: 'verify-before-integrate — to verify the API actually behaves the way the docs claim',
      },
    ],
  },
  {
    id: 'output',
    label: 'Documentation & Communication',
    desc: 'I need to write docs, specs, or communicate decisions',
    situations: [
      {
        id: 'write-spec',
        label: 'Write a specification for a feature',
        desc: 'Detailed technical spec',
        skill: 'write-spec',
        effect:
          'Breaks large features into independently verifiable, human-reviewable slices with staged implementation plans and checkpoints.',
        reason:
          'A good spec is testable, reviewable, and sliceable. Writing it forces clarity before coding.',
        alt: 'iterative-spec-authoring — if the spec needs to survive review cycles with a judge LLM',
      },
      {
        id: 'write-docs',
        label: 'Write or improve documentation',
        desc: 'Better docs for users or contributors',
        skill: 'documentation-craft',
        effect:
          'Generates high-quality technical documentation using a structured outline-first approach — planning, context-aware drafting, and quality verification.',
        reason:
          'Good documentation follows structure, not stream of consciousness. Outline-first prevents meandering docs.',
        alt: 'write-docs — for editing existing docs as a glossary of principles rather than generating new docs from scratch',
      },
      {
        id: 'adr',
        label: 'Record an architecture decision',
        desc: 'ADR for posterity',
        skill: 'documentation-and-adrs',
        effect:
          'Records decisions and documentation — ideal for architectural decisions, changing public APIs, shipping features, or recording context future engineers will need.',
        reason:
          'ADRs capture the "why" that code cannot express — preventing future engineers from wondering "what were they thinking."',
        alt: 'documentation-craft — for generating comprehensive documentation, not just decision records',
      },
      {
        id: 'stakeholder-update',
        label: 'Communicate with stakeholders',
        desc: 'Clear technical communication',
        skill: 'stakeholder-communication',
        effect:
          'Presents conclusions, estimates, recommendations, or technical explanations to humans — without overpromising, hiding uncertainty, or creating false confidence.',
        reason:
          'Technical communication to non-technical stakeholders is a distinct skill. The right framing prevents misalignment.',
        alt: 'documentation-craft — to structure the communication before delivering it',
      },
      {
        id: 'incident-report',
        label: 'Write a post-incident review',
        desc: 'Learn from production incidents',
        skill: 'future-mortem',
        effect:
          'Systematically learns from outcomes — the natural counterpart to pre-mortem, examining what actually happened vs what was expected.',
        reason:
          'Post-incident reviews are only valuable if they are blameless and systematic. Retrospective structures that learning.',
        alt: 'specter — if the primary need is technical root cause, not process learning',
      },
    ],
  },
  {
    id: 'testing-quality',
    label: 'Testing / Quality Assurance',
    desc: 'I need to write or improve tests',
    situations: [
      {
        id: 'unit-tests-2',
        label: 'Write unit tests for a module',
        desc: 'Test individual functions or components',
        skill: 'write-tests',
        effect:
          'Writes tests that pin real behavior instead of implementation details — config values, lucky samples, or brittle selectors.',
        reason:
          'Unit tests are the first line of defense. Getting them right makes the entire test suite more valuable.',
        alt: 'unit-test-debugging — if you prefer to write tests before code',
      },
      {
        id: 'integration-tests',
        label: 'Write integration tests',
        desc: 'Test module interactions',
        skill: 'unit-test-debugging',
        effect:
          'Red-green-refactor loop: write the test first, watch it fail, write the minimal fix, then refactor.',
        reason:
          'Integration tests benefit most from the TDD cycle — writing the test first forces the integration API to be clean.',
        alt: 'write-tests — if you need test-writing guidance rather than a full TDD workflow',
      },
      {
        id: 'e2e-setup',
        label: 'Set up E2E testing framework',
        desc: 'Initial E2E infrastructure',
        skill: 'e2e-testing-philosophy-and-architecture',
        effect:
          'Comprehensive reference for E2E testing mindset, architecture, and strategy — covers testing epistemology, 3-layer BDR architecture, risk-based prioritization, and data realism.',
        reason:
          'E2E testing is as much about philosophy as infrastructure. A clear framework prevents expensive mistakes in test architecture.',
        alt: 'mobile-e2e-testing-enterprise-guide — if the E2E tests are primarily on mobile platforms',
      },
      {
        id: 'visual-tests',
        label: 'Add visual regression tests',
        desc: 'Catch UI changes',
        skill: 'e2e-test-premortem',
        effect:
          'Premortem for E2E test changes — audits coverage gaps, data realism, failure-mode coverage, and assertion quality.',
        reason:
          'Visual regression testing needs a clear plan before implementation. A premortem ensures the visual tests actually cover the meaningful surfaces.',
        alt: 'e2e-crosscheck — for maintaining existing E2E tests, not planning new ones',
      },
    ],
  },
  {
    id: 'learning-2',
    label: 'Learning & Onboarding',
    desc: 'I need to learn or understand something',
    situations: [
      {
        id: 'explore-codebase-2',
        label: 'Explore an unfamiliar codebase',
        desc: 'Get oriented in new code',
        skill: 'explore-codebase',
        effect:
          'Structured exploration with progressive deepening: module structure → file roles → symbol resolution.',
        reason:
          'Jumping into random files wastes context. Progressive deepening builds a mental model fast.',
        alt: 'codebase-divide-conquer-search — for targeted searches once you know what you are looking for',
      },
      {
        id: 'read-docs',
        label: 'Understand a libraries documentation',
        desc: 'Navigate docs effectively',
        skill: 'source-driven-development',
        effect:
          'Grounds every implementation decision in official documentation — authoritative, source-cited code free from outdated patterns.',
        reason:
          'Official docs are the source of truth. Learning to navigate them efficiently is a meta-skill.',
        alt: 'verify-before-integrate — to verify the documented behavior against actual API responses',
      },
      {
        id: 'check-understanding',
        label: 'Verify I understand a concept',
        desc: 'Test my own understanding',
        skill: 'feynman-technique',
        effect:
          'Verifies genuine understanding by explaining in simple language — if you cannot explain it simply, you do not understand it well enough.',
        reason:
          'The Feynman Technique exposes understanding gaps that reading alone hides.',
        alt: 'compression-as-understanding — for a more rigorous compress-and-reconstruct check',
      },
      {
        id: 'code-review-learning',
        label: 'Learn from code review feedback',
        desc: 'Improve through review',
        skill: 'code-review-excellence',
        effect:
          'Provides constructive feedback, catches bugs early, and fosters knowledge sharing.',
        reason:
          'Code review is also a learning mechanism — reading others reviews of your code teaches more than reading documentation.',
        alt: 'code-simplification — for systematic simplification of reviewed code',
      },
    ],
  },
  {
    id: 'misc',
    label: 'General / Other',
    desc: 'Everything else',
    situations: [
      {
        id: 'refactor-sediment',
        label: 'Clean up accumulated cruft',
        desc: 'Code sediment removal',
        skill: 'refactor-clean',
        effect:
          'Replaces the old shape with the simpler shape the codebase would want if it were designed today — merging duplicated owners or splitting overloaded modules.',
        reason:
          'Accumulated cruft is the natural state of software. Refactoring it cleanly prevents the death by a thousand papercuts.',
        alt: 'refactoring-state-machine — for a more structured gate-controlled refactoring process',
      },
      {
        id: 'tech-debt',
        label: 'Prioritize technical debt',
        desc: 'What to tackle first',
        skill: 'improve-codebase-architecture',
        effect:
          'Finds deepening opportunities informed by the domain language — identifies hot-spots, boundary violations, and missing abstractions.',
        reason:
          'Not all technical debt is equal. Architecture-aware analysis identifies the debt that actually slows you down.',
        alt: 'architecture-evolution-review — for ongoing debt tracking rather than a one-time analysis',
      },
      {
        id: 'oncall',
        label: 'Respond to production alert',
        desc: 'On-call incident response',
        skill: 'incident',
        effect:
          'RCA runbook for alerts — identifies the alert type, verifies tooling/auth, and walks through root cause analysis using deep research.',
        reason:
          'On-call is high-pressure. A runbook prevents the common failure modes: tunnel vision, jumping to fixes, and missing evidence.',
        alt: 'specter — for the pure root-cause investigation without the on-call workflow',
      },
      {
        id: 'migration',
        label: 'Plan a migration / deprecation',
        desc: 'Safely remove old functionality',
        skill: 'deprecation-and-migration',
        effect:
          'Manages deprecation and migration — removing old systems, APIs, or features, and migrating users from old to new implementations.',
        reason:
          'Deprecation is riskier than greenfield development. A structured migration plan prevents the "we forgot to migrate X" failure.',
        alt: 'documentation-and-adrs — for recording the deprecation decision and migration path',
      },
      {
        id: 'security-mistake',
        label: 'Security mistake — cost is high',
        desc: 'Potential security issue',
        skill: 'security-threat-modeling',
        effect:
          'Prevents the most common security vulnerabilities and design flaws — covers injection, auth, data exposure, and supply chain risks using STRIDE and OWASP frameworks.',
        reason:
          'Security mistakes are among the most expensive mistakes. Threat modeling is the proven framework for avoiding them.',
        alt: 'security-review-protocol — for the full layered security review combining STRIDE + Unsafe Control Actions + LLM-specific audit',
      },
    ],
  },
];
