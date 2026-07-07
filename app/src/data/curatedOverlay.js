// Hand-maintained curated overlay. The registry generator prefers these
// values over the auto-derived ones for the listed skill ids.
//
//   displayName  — the grimoire-themed name shown in the UI
//   status       — Proven / Framework / Hybrid / New / MCP / —
//   note         — short, human-readable summary of what changed
//   combos       — related spell display names
//
// CURATED_SCHOOLS at the bottom carries the same kind of override
// for school theme (real / name / desc) per topic. New skills do not
// need an entry here; only add one when the auto-derived name or
// status isn't the one you want to ship.

export const CURATED_OVERLAY = {
  "log-trace-correlation": {
    "displayName": "Trace Sight",
    "trueName": "The Eye That Reads the Trace",
    "status": "Proven",
    "note": "Polished effect description; tier unchanged.",
    "kins": [
      "bisect-debugging",
      "root-cause-analysis",
      "debug-subagent",
      "simulate-instrumentation"
    ],
    "combos": [
      "Bisect Divination",
      "Root Cause Revelation",
      "Spectral Analysis"
    ]
  },
  "bisect-debugging": {
    "displayName": "Bisect Divination",
    "trueName": "The Halving Rite",
    "status": "Proven",
    "note": "+9.9% speed",
    "kins": [
      "log-trace-correlation",
      "root-cause-analysis",
      "iterative-patch-repair",
      "time-traveling-debugger"
    ],
    "combos": [
      "Trace Sight",
      "Iterative Mend",
      "Root Cause Revelation"
    ]
  },
  "debug-subagent": {
    "displayName": "Debug Familiar",
    "trueName": "Familiar of the Debug",
    "status": "Proven",
    "kins": [
      "log-trace-correlation",
      "root-cause-analysis",
      "simulate-instrumentation",
      "specter"
    ],
    "combos": [
      "Instrumentation Charm",
      "Spectral Analysis",
      "Scout Protocol"
    ]
  },
  "purify-test-output": {
    "displayName": "Purify Vision",
    "trueName": "The Sight Unclouded",
    "status": "Proven",
    "kins": [
      "simulate-instrumentation",
      "iterative-patch-repair",
      "minimal-reproduction",
      "time-traveling-debugger"
    ],
    "combos": [
      "Instrumentation Charm",
      "Test Oracle",
      "Iterative Mend"
    ]
  },
  "simulate-instrumentation": {
    "displayName": "Instrumentation Charm",
    "trueName": "The Wards of Observation",
    "status": "Proven",
    "kins": [
      "log-trace-correlation",
      "purify-test-output",
      "iterative-patch-repair",
      "debug-subagent"
    ]
  },
  "iterative-patch-repair": {
    "displayName": "Iterative Mend",
    "trueName": "The Mend That Mends Itself",
    "status": "Proven",
    "kins": [
      "simulate-instrumentation",
      "purify-test-output",
      "root-cause-analysis",
      "minimal-reproduction"
    ]
  },
  "root-cause-analysis": {
    "displayName": "Root Cause Revelation",
    "trueName": "The Severing of Cause",
    "status": "Framework",
    "kins": [
      "log-trace-correlation",
      "bisect-debugging",
      "debug-subagent",
      "occams-razor",
      "specter"
    ],
    "combos": [
      "Occam\\'s Verdict",
      "Trace Sight",
      "Bisect Divination"
    ]
  },
  "debug-issue": {
    "displayName": "Debug Workflow",
    "status": "—"
  },
  "debug-to-fix-pipeline": {
    "displayName": "Pipeline of Restoration",
    "trueName": "The Six-Phase Restoration",
    "status": "Hybrid",
    "kins": [
      "log-trace-correlation",
      "root-cause-analysis",
      "simulate-instrumentation",
      "iterative-patch-repair",
      "debug-subagent"
    ],
    "combos": [
      "Spectral Analysis",
      "Debug Familiar",
      "Instrumentation Charm",
      "Purify Vision",
      "Iterative Mend"
    ]
  },
  "unit-test-debugging": {
    "displayName": "Test Oracle",
    "status": "New"
  },
  "jest-testing": {
    "displayName": "Jest Invocation",
    "status": "New"
  },
  "explore-codebase": {
    "displayName": "Codebase Walk",
    "status": "—"
  },
  "codebase-divide-conquer-search": {
    "displayName": "Divide & Search",
    "status": "—"
  },
  "specter": {
    "displayName": "Spectral Reasoning",
    "trueName": "The Ghost That Hunts",
    "status": "—",
    "kins": [
      "log-trace-correlation",
      "debug-subagent",
      "codebase-divide-conquer-search",
      "minimal-reproduction"
    ]
  },
  "long-task-survival-kit": {
    "displayName": "Endurance Ward",
    "status": "—",
    "combos": [
      "Trajectory Warden",
      "Context Lifecycle",
      "Grounding Ritual"
    ]
  },
  "time-traveling-debugger": {
    "displayName": "Temporal Rewind",
    "trueName": "The Temporal Rewind",
    "status": "MCP",
    "kins": [
      "bisect-debugging",
      "log-trace-correlation",
      "iterative-patch-repair"
    ]
  },
  "environment-recovery": {
    "displayName": "Environment Exorcism",
    "status": "New"
  },
  "network-api-debugging": {
    "displayName": "Network Divination",
    "status": "New"
  },
  "minimal-reproduction": {
    "displayName": "Minimal Summoning",
    "status": "New"
  },
  "escalation-ladder": {
    "displayName": "Escalation Rite",
    "status": "New"
  },
  "coordinated-change": {
    "displayName": "Coordinated Strike",
    "status": "New"
  },
  "abductive-first-debugging": {
    "displayName": "Abductive Strike",
    "status": "New"
  },
  "how-to-solve-it-state-machine": {
    "displayName": "First Step Oracle",
    "status": "—"
  },
  "occams-razor": {
    "displayName": "Razor of Parsimony",
    "trueName": "The Razor of Parsimony",
    "status": "New",
    "kins": [
      "root-cause-analysis",
      "first-principles",
      "specter"
    ]
  },
  "keyword-agnostic-logic-locator": {
    "displayName": "Structural Seeker",
    "status": "—"
  },
  "occam-mcts": {
    "displayName": "Simple Path Scry",
    "status": "New"
  },
  "tree-of-thoughts-plus-monte-carlo-tree-search": {
    "displayName": "Thought-Weave & Search",
    "status": "—"
  },
  "jury": {
    "displayName": "Court of Minds",
    "status": "—"
  },
  "prism": {
    "displayName": "Prism of Understanding",
    "status": "—"
  },
  "cross-domain-analogy-generator": {
    "displayName": "Analogy Bridge",
    "status": "—"
  },
  "ooda-loop-state-machine": {
    "displayName": "OODA Loop",
    "status": "—"
  },
  "cognitive-friction-governor": {
    "displayName": "Friction Governor",
    "status": "—"
  },
  "process-reward-model-protocol": {
    "displayName": "Reward Path Backtrack",
    "status": "—"
  },
  "how-to-solve-it-analogy": {
    "displayName": "Analogy Solver",
    "status": "—"
  },
  "step-level-verification-protocol": {
    "displayName": "Stepwise Verification",
    "status": "—"
  },
  "assumption-grounding": {
    "displayName": "Grounding Ritual",
    "status": "—"
  },
  "trajectory-guard": {
    "displayName": "Trajectory Warden",
    "status": "—"
  },
  "context-lifecycle-manager": {
    "displayName": "Context Lifecycle + Budget",
    "status": "—"
  },
  "pdca-deming": {
    "displayName": "Deming Cycle",
    "status": "—"
  },
  "toyota-kata-state-machine": {
    "displayName": "Kata Practice",
    "status": "—"
  },
  "checklist-manifesto": {
    "displayName": "Checkman Rite",
    "status": "—"
  },
  "requirement-crystallization-protocol": {
    "displayName": "Crystallization",
    "status": "—"
  },
  "pre-flight-intent-verification": {
    "displayName": "Pre-Flight Gate",
    "status": "New"
  },
  "iterative-improvement-cycle": {
    "displayName": "Kata + Deming Synthesis",
    "status": "—"
  },
  "zero-defect-protocol": {
    "displayName": "Zero Defect Ward",
    "status": "—"
  },
  "blueprint": {
    "displayName": "Blueprint Codification",
    "status": "—"
  },
  "rashomon-triad-hybrid": {
    "displayName": "Triad Perspective",
    "status": "—"
  },
  "compression-as-understanding": {
    "displayName": "Compression Test",
    "status": "—"
  },
  "metacognitive-monitoring": {
    "displayName": "Confidence Calibration",
    "status": "—"
  },
  "working-effectively-with-legacy-code-state-machine": {
    "displayName": "Legacy Seam Working",
    "status": "—"
  },
  "philosophy-of-software-design-state-machine": {
    "displayName": "Complexity Audit",
    "status": "—"
  },
  "verify-before-integrate": {
    "displayName": "Pre-Commit Vigil",
    "status": "—"
  },
  "llm-pre-push-review": {
    "displayName": "LLM Pre-Push Ward",
    "status": "—"
  },
  "pre-deployment-gate": {
    "displayName": "Deployment Gate",
    "status": "—",
    "combos": [
      "Security Warding",
      "Vibe Hardening",
      "LLM Pre-Push Ward",
      "Failure Prophecy"
    ]
  },
  "self-verify-pipeline": {
    "displayName": "Self-Verify Pipeline",
    "status": "—"
  },
  "task-intake-protocol": {
    "displayName": "Task Intake Gate",
    "status": "—"
  },
  "failure-analysis-protocol": {
    "displayName": "Failure Prophecy",
    "status": "—"
  },
  "security-review-protocol": {
    "displayName": "Security Warding",
    "status": "—"
  },
  "refactoring-state-machine": {
    "displayName": "Safe Refactor",
    "status": "—"
  },
  "thoroughness-check-etto": {
    "displayName": "Thoroughness Charm",
    "status": "—"
  },
  "thoroughness-check-etto-state-machine": {
    "displayName": "Strict Thoroughness",
    "status": "—"
  },
  "counterfactual-policy-testing": {
    "displayName": "Counterfactual Design",
    "status": "—"
  },
  "bounded-self-revision": {
    "displayName": "Bounded Revision",
    "status": "—"
  },
  "speculative-drafting-verification": {
    "displayName": "Speculative Drafting",
    "status": "—"
  },
  "speculative-exploration-protocol": {
    "displayName": "Speculative Exploration",
    "status": "—"
  },
  "cognitive-bias-checklist": {
    "displayName": "Bias Audit",
    "status": "—"
  },
  "cognitive-bias-auditor": {
    "displayName": "Automated Bias Detection",
    "status": "—"
  },
  "self-consistency": {
    "displayName": "Self-Consistency Rite",
    "status": "—"
  },
  "tool-interactive-critic": {
    "displayName": "Interactive Critique",
    "status": "—"
  },
  "api-surface-anchoring": {
    "displayName": "API Surface Scry",
    "status": "—"
  },
  "verified-api-workflow": {
    "displayName": "Verified API Workflow",
    "status": "—"
  },
  "super-review-typescript": {
    "displayName": "TypeScript Vigil",
    "status": "New"
  },
  "code-review-excellence": {
    "displayName": "Review Mastery",
    "status": "New"
  },
  "adversarial-review": {
    "displayName": "Adversarial Trial",
    "status": "New"
  },
  "critical-system-interrogation": {
    "displayName": "Critical System Interrogation",
    "status": "New"
  },
  "intent-specification-protocol": {
    "displayName": "Intent Binding",
    "status": "—"
  },
  "team-topologies-ai": {
    "displayName": "Team Topology Sight",
    "status": "—"
  },
  "designing-data-intensive-applications-ai": {
    "displayName": "Data System Principles",
    "status": "—"
  },
  "sre-error-budget": {
    "displayName": "Error Budget Divination",
    "status": "—"
  },
  "domain-driven-design": {
    "displayName": "Ubiquitous Language",
    "status": "—"
  },
  "problem-mode-router-cynefin": {
    "displayName": "Cynefin Compass",
    "status": "—"
  },
  "accelerate-ai": {
    "displayName": "Acceleration Rite",
    "status": "—"
  },
  "release-it-stability": {
    "displayName": "Stability Warding",
    "status": "—"
  },
  "separation-of-concerns": {
    "displayName": "Boundary Weaving",
    "status": "—"
  },
  "problem-mode-router-cynefin-state-machine": {
    "displayName": "Cynefin Gate",
    "status": "—"
  },
  "thinking-in-systems-state-machine": {
    "displayName": "System Dynamics",
    "status": "—"
  },
  "api-design-backward-compatibility": {
    "displayName": "Backward Compat Ward",
    "status": "—"
  },
  "system-architecture-audit": {
    "displayName": "Full Architecture Audit",
    "status": "—"
  },
  "improve-codebase-architecture": {
    "displayName": "Deepening Ritual",
    "status": "New"
  },
  "evolutionary-tool-composer": {
    "displayName": "Evolutionary Forge",
    "status": "—"
  },
  "active-inference-agent": {
    "displayName": "Free Energy Seeker",
    "status": "—"
  },
  "documentation-craft": {
    "displayName": "Doc Crafting",
    "status": "—"
  },
  "feynman-technique": {
    "displayName": "Feynman Recitation",
    "status": "—"
  },
  "everything-as-code-conceptualizer": {
    "displayName": "Code Vision",
    "status": "—"
  },
  "socratic-clarification": {
    "displayName": "Socratic Elicitation",
    "status": "—"
  },
  "large-documentation-navigation": {
    "displayName": "Doc Navigation",
    "status": "—"
  },
  "mece-pyramid-principle": {
    "displayName": "MECE Structuring",
    "status": "—"
  },
  "steelmanning": {
    "displayName": "Steelman Argument",
    "status": "—"
  },
  "stakeholder-communication": {
    "displayName": "Calibrated Communication",
    "status": "—"
  },
  "reference-class-forecasting": {
    "displayName": "Base Rate Scry",
    "status": "—"
  },
  "pre-mortem-state-machine": {
    "displayName": "Pre-Mortem Gate",
    "status": "—"
  },
  "retrospective": {
    "displayName": "Retrospective Mirror",
    "status": "—"
  },
  "explore-vs-exploit-state-machine": {
    "displayName": "Explore-Exploit Compass",
    "status": "—"
  },
  "the-goal-theory-of-constraints-ai": {
    "displayName": "Bottleneck Sight",
    "status": "—"
  },
  "explore-vs-exploit": {
    "displayName": "Explore-Exploit Lens",
    "status": "—"
  },
  "pre-mortem": {
    "displayName": "Failure Scrying",
    "status": "—"
  },
  "plan-with-judge": {
    "displayName": "Plan with Judge",
    "status": "—"
  },
  "iterative-spec-authoring": {
    "displayName": "Iterative Spec",
    "status": "—"
  },
  "structured-feature-planning": {
    "displayName": "Structured Feature Path",
    "status": "—"
  },
  "summarize": {
    "displayName": "Final Word",
    "status": "New"
  },
  "tree-of-thoughts": {
    "displayName": "Thought Tree",
    "status": "—"
  },
  "first-principles": {
    "displayName": "First Principles Forge",
    "status": "—"
  },
  "inversion-mental-model": {
    "displayName": "Inversion Lens",
    "status": "—"
  },
  "six-thinking-hats": {
    "displayName": "Six Hats",
    "status": "—"
  },
  "inversion-mental-model-state-machine": {
    "displayName": "Inversion Path",
    "status": "—"
  },
  "second-order-thinking": {
    "displayName": "Second-Order Sight",
    "status": "—"
  },
  "bayesian-updating": {
    "displayName": "Bayesian Update",
    "status": "—"
  },
  "recognition-primed-triage": {
    "displayName": "Recognition Triage",
    "status": "—"
  },
  "recognition-primed-triage-state-machine": {
    "displayName": "Structured RPD",
    "status": "—"
  },
  "kahneman-thinking-fast-slow-software-agent": {
    "displayName": "Fast-Slow Lens",
    "status": "—"
  },
  "faithfulness-aware-reasoning": {
    "displayName": "Hallucination Ward",
    "status": "—"
  },
  "claim-verification-reasoning": {
    "displayName": "Claim Verification",
    "status": "—"
  },
  "context-density-operator": {
    "displayName": "Context Density",
    "status": "—"
  },
  "cot-pruning-reasoning": {
    "displayName": "CoT Pruning",
    "status": "—"
  },
  "reasoning-verification-hybrid": {
    "displayName": "Verification Hybrid",
    "status": "—"
  },
  "selective-halt-reasoning": {
    "displayName": "Selective Halt",
    "status": "—"
  },
  "reasoning-integrity-chain": {
    "displayName": "Integrity Chain",
    "status": "—"
  },
  "hallucination-anchor-chain": {
    "displayName": "Anchor Chain",
    "status": "—"
  },
  "self-contradiction-trap": {
    "displayName": "Contradiction Trap",
    "status": "—"
  },
  "chaos-detector": {
    "displayName": "Chaos Detection",
    "status": "—"
  },
  "add-new-skill-to-repository": {
    "displayName": "New Skill Rite",
    "status": "—"
  },
  "bulk-rename-and-update-references": {
    "displayName": "Rename & Recall",
    "status": "—"
  },
  "skill-development-with-supporting-files": {
    "displayName": "Supporting File Bind",
    "status": "—"
  },
  "local-llm-tooling": {
    "displayName": "Local LLM Invocation",
    "status": "—"
  },
  "refactor-safely": {
    "displayName": "Safe Refactor",
    "status": "—"
  },
  "review-changes": {
    "displayName": "Review Lens",
    "status": "—"
  },
  "git-surgery": {
    "displayName": "Git Surgery",
    "status": "—"
  },
  "code-knowledge-graph-mcp": {
    "displayName": "Knowledge Graph",
    "status": "—"
  },
  "dev-diagnostics-mcp": {
    "displayName": "Diagnostics Aggregator",
    "status": "—"
  },
  "lint-battalion": {
    "displayName": "Battalion Auto-Fix",
    "status": "—"
  },
  "verified-synthesize": {
    "displayName": "Verified Synthesis",
    "status": "—"
  },
  "native-data-fetching": {
    "displayName": "Data Fetch Ward",
    "status": "New"
  },
  "agentic-design-patterns-orchestrator": {
    "displayName": "Orchestrator Pattern",
    "status": "—"
  },
  "agentic-design-patterns-orchestrator-state-machine": {
    "displayName": "Orchestrator Gate",
    "status": "—"
  },
  "thought-retriever-coppermind": {
    "displayName": "Thought Retrieval",
    "status": "—"
  },
  "agent-memory-hygiene": {
    "displayName": "Memory Hygiene",
    "status": "—"
  },
  "monte-carlo-tree-search": {
    "displayName": "Branch Allocation",
    "status": "—"
  },
  "weak-link-detection-multi-agent": {
    "displayName": "Weak Link Detection",
    "status": "—"
  },
  "sop-evolution-memory": {
    "displayName": "SOP Evolution",
    "status": "—"
  },
  "scout": {
    "displayName": "Scout Protocol",
    "status": "—"
  },
  "subagent-composer": {
    "displayName": "Subagent Composer",
    "status": "—"
  },
  "octopus": {
    "displayName": "Octopus Coordination",
    "status": "—"
  },
  "unsafe-control-actions-hazard-analysis": {
    "displayName": "STPA Ward",
    "status": "—"
  },
  "security-threat-modeling": {
    "displayName": "STRIDE Analysis",
    "status": "—"
  },
  "vibe-coding-security-hardening": {
    "displayName": "Vibe Hardening",
    "status": "—"
  },
  "cognitive-load-operator-state-machine": {
    "displayName": "Load Management",
    "status": "—"
  },
  "skill-ab-evaluation": {
    "displayName": "A/B Scry",
    "status": "—"
  },
  "empirical-justification": {
    "displayName": "Empirical Justification",
    "status": "—"
  },
  "test-driven-development": {
    "displayName": "Red-Green Rite",
    "status": "New"
  },
  "vitest": {
    "displayName": "Vitest Conjuration",
    "status": "New"
  },
  "playwright-best-practices": {
    "displayName": "Playwright Binding",
    "status": "New"
  }
};

export const CURATED_SCHOOLS = {
  "debugging": {
    "id": "debugging",
    "real": "Debugging",
    "name": "School of Remediation",
    "desc": "Incantations to banish bugs and restore order to broken code."
  },
  "reasoning": {
    "id": "reasoning",
    "real": "Reasoning & Problem Solving",
    "name": "School of Cognition",
    "desc": "Mental models and structured thought for when the problem itself is unclear."
  },
  "process": {
    "id": "process",
    "real": "Process Improvement",
    "name": "School of Refinement",
    "desc": "Rituals for improving systems, workflows, and outputs over time through disciplined iteration."
  },
  "code-review": {
    "id": "code-review",
    "real": "Code Review & Quality",
    "name": "School of Scrutiny",
    "desc": "Incantations for verifying, elevating, and safeguarding code quality before it ships."
  },
  "architecture": {
    "id": "architecture",
    "real": "Architecture & Design",
    "name": "School of Architecture",
    "desc": "Design rituals for systems that endure across dimensions of scale, time, and team boundaries."
  },
  "discovery": {
    "id": "discovery",
    "real": "Algorithm & Tool Discovery",
    "name": "School of Discovery",
    "desc": "Algorithms and automated tools that find solutions beyond human intuition."
  },
  "documentation": {
    "id": "documentation",
    "real": "Documentation & Communication",
    "name": "School of Expression",
    "desc": "Incantations for writing clearly, explaining complex systems, and communicating with stakeholders."
  },
  "planning": {
    "id": "planning",
    "real": "Planning & Estimation",
    "name": "School of Foresight",
    "desc": "Rituals for estimating timelines, surfacing risks, and creating disciplined plans."
  },
  "learning": {
    "id": "learning",
    "real": "Learning & Understanding",
    "name": "School of Knowledge",
    "desc": "Incantations for understanding new domains, stress-testing proposals, and thinking from first principles."
  },
  "anti-hallucination": {
    "id": "anti-hallucination",
    "real": "Reasoning & Anti-Hallucination",
    "name": "School of Veracity",
    "desc": "Wards against reasoning decay — incantations that keep agent thinking honest and grounded."
  },
  "software-dev": {
    "id": "software-dev",
    "real": "Software Development",
    "name": "School of Crafting",
    "desc": "Practical incantations for building, renaming, searching through, and shipping code."
  },
  "multi-agent": {
    "id": "multi-agent",
    "real": "Multi-Agent & Coordination",
    "name": "School of Confluence",
    "desc": "Incantations for orchestrating multiple agents, sharing reasoning memory, and coordinating parallel workstreams."
  },
  "risk": {
    "id": "risk",
    "real": "Risk & Safety Analysis",
    "name": "School of Warding",
    "desc": "Protective incantations for safety-critical changes, threat analysis, and pre-deployment hardening."
  },
  "cognitive-load": {
    "id": "cognitive-load",
    "real": "Cognitive Load & Operator Support",
    "name": "School of Clarity",
    "desc": "Incantations for managing finite attention, reducing overhead, and keeping the agent focused."
  },
  "testing": {
    "id": "testing",
    "real": "Testing & Evaluation",
    "name": "School of Measurement",
    "desc": "Rituals for empirically measuring whether a skill actually improves outcomes."
  }
};
