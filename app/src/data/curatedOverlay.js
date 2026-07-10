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
    "displayName": "Log Trace Correlation",
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
    "displayName": "Bisect Debugging",
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
    "displayName": "Debug Subagent",
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
    "displayName": "Test Output Purification",
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
    "displayName": "Simulate Instrumentation",
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
    "displayName": "Iterative Patch Repair",
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
    "displayName": "Root Cause Analysis",
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
    "displayName": "Debug to Fix Pipeline",
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
  "explore-codebase": {
    "displayName": "Codebase Exploration",
    "status": "—"
  },
  "codebase-divide-conquer-search": {
    "displayName": "Divide & Search",
    "status": "—"
  },
  "specter": {
    "displayName": "Spectral Debugging",
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
    "displayName": "Time-Travel Debugger",
    "trueName": "The Temporal Rewind",
    "status": "MCP",
    "kins": [
      "bisect-debugging",
      "log-trace-correlation",
      "iterative-patch-repair"
    ]
  },
  "environment-recovery": {
    "displayName": "Environment Recovery",
    "status": "New"
  },
  "network-api-debugging": {
    "displayName": "Network API Debugging",
    "status": "New"
  },
  "minimal-reproduction": {
    "displayName": "Minimal Reproduction",
    "status": "New"
  },
  "escalation-ladder": {
    "displayName": "Escalation Ladder",
    "status": "New"
  },
  "coordinated-change": {
    "displayName": "Coordinated Change",
    "status": "New"
  },
  "abductive-first-debugging": {
    "displayName": "Abductive Debugging",
    "status": "New"
  },
  "how-to-solve-it-state-machine": {
    "displayName": "Problem Solving Protocol",
    "status": "—"
  },
  "occams-razor": {
    "displayName": "Occam's Razor",
    "trueName": "The Razor of Parsimony",
    "status": "New",
    "kins": [
      "root-cause-analysis",
      "first-principles",
      "specter"
    ]
  },
  "keyword-agnostic-logic-locator": {
    "displayName": "Logic-Based Code Search",
    "status": "—"
  },
  "jury": {
    "displayName": "Jury",
    "status": "—"
  },
  "prism": {
    "displayName": "Prism",
    "status": "—"
  },
  "cross-domain-analogy-generator": {
    "displayName": "Cross-Domain Analogy Generator",
    "status": "—"
  },
  "ooda-loop-state-machine": {
    "displayName": "OODA Loop",
    "status": "—"
  },
  "cognitive-friction-governor": {
    "displayName": "Cognitive Friction Governor",
    "status": "—"
  },
  "process-reward-model-protocol": {
    "displayName": "Process Reward Model",
    "status": "—"
  },
  "how-to-solve-it-analogy": {
    "displayName": "Analogy-Based Problem Solving",
    "status": "—"
  },
  "step-level-verification-protocol": {
    "displayName": "Stepwise Verification",
    "status": "—"
  },
  "assumption-grounding": {
    "displayName": "Assumption Grounding",
    "status": "—"
  },
  "trajectory-guard": {
    "displayName": "Trajectory Guard",
    "status": "—"
  },
  "pdca-deming": {
    "displayName": "PDCA Deming Cycle",
    "status": "—"
  },
  "toyota-kata-state-machine": {
    "displayName": "Toyota Kata",
    "status": "—"
  },
  "checklist-manifesto": {
    "displayName": "Checklist Manifesto",
    "status": "—"
  },
  "requirement-crystallization-protocol": {
    "displayName": "Requirement Crystallization",
    "status": "—"
  },
  "pre-flight-intent-verification": {
    "displayName": "Pre-Flight Verification",
    "status": "New"
  },
  "zero-defect-protocol": {
    "displayName": "Zero Defect Protocol",
    "status": "—"
  },
  "blueprint": {
    "displayName": "Blueprint",
    "status": "—"
  },
  "rashomon-triad-hybrid": {
    "displayName": "Rashomon Triad",
    "status": "—"
  },
  "compression-as-understanding": {
    "displayName": "Compression as Understanding",
    "status": "—"
  },
  "metacognitive-monitoring": {
    "displayName": "Metacognitive Monitoring",
    "status": "—"
  },
  "working-effectively-with-legacy-code-state-machine": {
    "displayName": "Legacy Code Working",
    "status": "—"
  },
  "philosophy-of-software-design-state-machine": {
    "displayName": "Software Design Philosophy",
    "status": "—"
  },
  "verify-before-integrate": {
    "displayName": "Verify Before Integrate",
    "status": "—"
  },
  "llm-pre-push-review": {
    "displayName": "Pre-Push Review",
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
    "displayName": "Task Intake Protocol",
    "status": "—"
  },
  "failure-analysis-protocol": {
    "displayName": "Failure Analysis Protocol",
    "status": "—"
  },
  "security-review-protocol": {
    "displayName": "Security Review Protocol",
    "status": "—"
  },
  "refactoring-state-machine": {
    "displayName": "Safe Refactor",
    "status": "—"
  },
  "thoroughness-check-etto": {
    "displayName": "Thoroughness Check",
    "status": "—"
  },
  "thoroughness-check-etto-state-machine": {
    "displayName": "Thoroughness Check Protocol",
    "status": "—"
  },
  "counterfactual-policy-testing": {
    "displayName": "Counterfactual Policy Testing",
    "status": "—"
  },
  "bounded-self-revision": {
    "displayName": "Bounded Self-Revision",
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
    "displayName": "Cognitive Bias Checklist",
    "status": "—"
  },
  "cognitive-bias-auditor": {
    "displayName": "Cognitive Bias Auditor",
    "status": "—"
  },
  "self-consistency": {
    "displayName": "Self-Consistency",
    "status": "—"
  },
  "tool-interactive-critic": {
    "displayName": "Tool-Interactive Critic",
    "status": "—"
  },
  "api-surface-anchoring": {
    "displayName": "API Surface Anchoring",
    "status": "—"
  },
  "verified-api-workflow": {
    "displayName": "Verified API Workflow",
    "status": "—"
  },
  "super-review-typescript": {
    "displayName": "TypeScript Super Review",
    "status": "New"
  },
  "code-review-excellence": {
    "displayName": "Code Review Excellence",
    "status": "New"
  },
  "adversarial-review": {
    "displayName": "Adversarial Review",
    "status": "New"
  },
  "critical-system-interrogation": {
    "displayName": "Critical System Interrogation",
    "status": "New"
  },
  "intent-specification-protocol": {
    "displayName": "Intent Specification Protocol",
    "status": "—"
  },
  "team-topologies-ai": {
    "displayName": "Team Topologies",
    "status": "—"
  },
  "designing-data-intensive-applications-ai": {
    "displayName": "Data System Principles",
    "status": "—"
  },
  "sre-error-budget": {
    "displayName": "SRE Error Budget",
    "status": "—"
  },
  "domain-driven-design": {
    "displayName": "Domain-Driven Design",
    "status": "—"
  },
  "problem-mode-router-cynefin": {
    "displayName": "Cynefin Compass",
    "status": "—"
  },
  "accelerate-ai": {
    "displayName": "Accelerate AI",
    "status": "—"
  },
  "release-it-stability": {
    "displayName": "Release It Stability",
    "status": "—"
  },
  "separation-of-concerns": {
    "displayName": "Separation of Concerns",
    "status": "—"
  },
  "problem-mode-router-cynefin-state-machine": {
    "displayName": "Cynefin Decision Gate",
    "status": "—"
  },
  "thinking-in-systems-state-machine": {
    "displayName": "Thinking in Systems",
    "status": "—"
  },
  "api-design-backward-compatibility": {
    "displayName": "Backward Compatible API Design",
    "status": "—"
  },
  "system-architecture-audit": {
    "displayName": "System Architecture Audit",
    "status": "—"
  },
  "improve-codebase-architecture": {
    "displayName": "Improve Codebase Architecture",
    "status": "New"
  },
  "evolutionary-tool-composer": {
    "displayName": "Evolutionary Tool Composer",
    "status": "—"
  },
  "active-inference-agent": {
    "displayName": "Active Inference Agent",
    "status": "—"
  },
  "documentation-craft": {
    "displayName": "Documentation Craft",
    "status": "—"
  },
  "feynman-technique": {
    "displayName": "Feynman Technique",
    "status": "—"
  },
  "everything-as-code-conceptualizer": {
    "displayName": "Everything as Code",
    "status": "—"
  },
  "socratic-clarification": {
    "displayName": "Socratic Clarification",
    "status": "—"
  },
  "large-documentation-navigation": {
    "displayName": "Documentation Navigation",
    "status": "—"
  },
  "mece-pyramid-principle": {
    "displayName": "MECE Pyramid Principle",
    "status": "—"
  },
  "steelmanning": {
    "displayName": "Steelmanning",
    "status": "—"
  },
  "stakeholder-communication": {
    "displayName": "Stakeholder Communication",
    "status": "—"
  },
  "reference-class-forecasting": {
    "displayName": "Reference Class Forecasting",
    "status": "—"
  },
  "pre-mortem-state-machine": {
    "displayName": "Pre-Mortem Protocol",
    "status": "—"
  },
  "retrospective": {
    "displayName": "Retrospective",
    "status": "—"
  },
  "explore-vs-exploit-state-machine": {
    "displayName": "Explore vs Exploit",
    "status": "—"
  },
  "the-goal-theory-of-constraints-ai": {
    "displayName": "Theory of Constraints",
    "status": "—"
  },
  "explore-vs-exploit": {
    "displayName": "Explore vs Exploit Lens",
    "status": "—"
  },
  "pre-mortem": {
    "displayName": "Pre-Mortem",
    "status": "—"
  },
  "plan-with-judge": {
    "displayName": "Plan with Judge",
    "status": "—"
  },
  "iterative-spec-authoring": {
    "displayName": "Iterative Spec Authoring",
    "status": "—"
  },
  "structured-feature-planning": {
    "displayName": "Structured Feature Planning",
    "status": "—"
  },
  "summarize": {
    "displayName": "Summarize",
    "status": "New"
  },
  "tree-of-thoughts": {
    "displayName": "Tree of Thoughts",
    "status": "—"
  },
  "first-principles": {
    "displayName": "First Principles",
    "status": "—"
  },
  "inversion-mental-model": {
    "displayName": "Inversion Mental Model",
    "status": "—"
  },
  "six-thinking-hats": {
    "displayName": "Six Thinking Hats",
    "status": "—"
  },
  "inversion-mental-model-state-machine": {
    "displayName": "Inversion Protocol",
    "status": "—"
  },
  "second-order-thinking": {
    "displayName": "Second-Order Thinking",
    "status": "—"
  },
  "bayesian-updating": {
    "displayName": "Bayesian Updating",
    "status": "—"
  },
  "recognition-primed-triage": {
    "displayName": "Recognition-Primed Triage",
    "status": "—"
  },
  "kahneman-thinking-fast-slow-software-agent": {
    "displayName": "Fast & Slow Thinking",
    "status": "—"
  },
  "faithfulness-aware-reasoning": {
    "displayName": "Faithfulness-Aware Reasoning",
    "status": "—"
  },
  "claim-verification-reasoning": {
    "displayName": "Claim Verification",
    "status": "—"
  },
  "context-density-operator": {
    "displayName": "Context Density Operator",
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
    "displayName": "Reasoning Integrity Chain",
    "status": "—"
  },
  "hallucination-anchor-chain": {
    "displayName": "Hallucination Anchor Chain",
    "status": "—"
  },
  "self-contradiction-trap": {
    "displayName": "Self-Contradiction Detection",
    "status": "—"
  },
  "chaos-detector": {
    "displayName": "Chaos Detector",
    "status": "—"
  },
  "add-new-skill-to-repository": {
    "displayName": "Add New Skill",
    "status": "—"
  },
  "bulk-rename-and-update-references": {
    "displayName": "Bulk Rename",
    "status": "—"
  },
  "skill-development-with-supporting-files": {
    "displayName": "Skill Development with Supporting Files",
    "status": "—"
  },
  "local-llm-tooling": {
    "displayName": "Local LLM Tooling",
    "status": "—"
  },
  "refactor-safely": {
    "displayName": "Safe Refactor",
    "status": "—"
  },
  "review-changes": {
    "displayName": "Review Changes",
    "status": "—"
  },
  "git-surgery": {
    "displayName": "Git Surgery",
    "status": "—"
  },
  "code-knowledge-graph-mcp": {
    "displayName": "Knowledge Graph MCP",
    "status": "—"
  },
  "dev-diagnostics-mcp": {
    "displayName": "Dev Diagnostics MCP",
    "status": "—"
  },
  "lint-battalion": {
    "displayName": "Lint Battalion",
    "status": "—"
  },
  "verified-synthesize": {
    "displayName": "Verified Synthesis",
    "status": "—"
  },
  "native-data-fetching": {
    "displayName": "Native Data Fetching",
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
    "displayName": "Thought Retriever",
    "status": "—"
  },
  "agent-memory-hygiene": {
    "displayName": "Memory Hygiene",
    "status": "—"
  },
  "monte-carlo-tree-search": {
    "displayName": "Monte Carlo Tree Search",
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
    "displayName": "Unsafe Control Actions Analysis",
    "status": "—"
  },
  "security-threat-modeling": {
    "displayName": "STRIDE Threat Modeling",
    "status": "—"
  },
  "vibe-coding-security-hardening": {
    "displayName": "Vibe Coding Security Hardening",
    "status": "—"
  },
  "cognitive-load-operator-state-machine": {
    "displayName": "Cognitive Load Operator",
    "status": "—"
  },
  "skill-ab-evaluation": {
    "displayName": "A/B Skill Evaluation",
    "status": "—"
  },
  "empirical-justification": {
    "displayName": "Empirical Justification",
    "status": "—"
  },
  "test-driven-development": {
    "displayName": "Test-Driven Development",
    "status": "New"
  },
  "maintain-architecture": {
    "displayName": "Architecture Maintenance",
    "status": "New"
  },
  "recognition-primed-triage-state-machine": {
    "displayName": "Recognition-Primed Triage (Protocol)",
    "status": "—"
  },
  "plan-feature-architecture": {
    "displayName": "Feature Architecture Planning",
    "status": "New"
  },
  "architecture-evolution-review": {
    "displayName": "Architecture Evolution Review",
    "status": "New"
  },
  "bug-inquisition": {
    "displayName": "Bug Inquisition",
    "status": "New"
  },
  "bug-inquisition-conquest": {
    "displayName": "Bug Inquisition Conquest",
    "status": "New"
  },
  "project-folder-architecture": {
    "displayName": "Project Folder Architecture",
    "status": "New"
  },
  "subagent-laws": {
    "displayName": "Subagent Laws",
    "status": "New"
  }
};

export const CURATED_SCHOOLS = {
  "debugging": {
    "id": "debugging",
    "real": "Debugging",
    "name": "Debugging",
    "desc": "Techniques for diagnosing and fixing issues in code and systems."
  },
  "execution": {
    "id": "execution",
    "real": "Execution & Improvement",
    "name": "Execution & Improvement",
    "desc": "Solving problems, executing plans, and improving systems over time."
  },
  "judgment-and-routing": {
    "id": "judgment-and-routing",
    "real": "Judgment & Decision-Making",
    "name": "Judgment & Decision-Making",
    "desc": "Routing decisions, weighing tradeoffs, and choosing the right approach."
  },
  "orchestration": {
    "id": "orchestration",
    "real": "Agent Orchestration",
    "name": "Agent Orchestration",
    "desc": "Coordinating multiple agents and managing shared reasoning."
  },
  "output-quality": {
    "id": "output-quality",
    "real": "Output Quality",
    "name": "Output Quality",
    "desc": "Improving, verifying, and stress-testing output before it ships."
  },
  "reasoning": {
    "id": "reasoning",
    "real": "Reasoning & Problem Solving",
    "name": "Reasoning & Problem Solving",
    "desc": "Mental models and structured thought when the problem isn't clear."
  },
  "software-development": {
    "id": "software-development",
    "real": "Software Development",
    "name": "Software Development",
    "desc": "Building, refactoring, searching through, and shipping code."
  },
  "systems-and-architecture": {
    "id": "systems-and-architecture",
    "real": "Systems & Architecture",
    "name": "Systems & Architecture",
    "desc": "Design principles for systems that endure across scale and team boundaries."
  },
  "mcp-servers": {
    "id": "mcp-servers",
    "real": "MCP Servers",
    "name": "MCP Servers",
    "desc": "Model Context Protocol servers that extend agent capabilities."
  },
  "mlops": {
    "id": "mlops",
    "real": "Mlops",
    "name": "Mlops",
    "desc": "Skills related to ML operations and local LLM tooling."
  },
  "research": {
    "id": "research",
    "real": "Research",
    "name": "Research",
    "desc": "Skills related to research."
  },
  "discovery": {
    "id": "discovery",
    "real": "Discovery",
    "name": "Discovery",
    "desc": "Finding solutions beyond intuitive search."
  },
  "planning": {
    "id": "planning",
    "real": "Planning & Estimation",
    "name": "Planning & Estimation",
    "desc": "Estimating timelines, surfacing risks, and creating disciplined plans."
  },
  "learning": {
    "id": "learning",
    "real": "Learning & Understanding",
    "name": "Learning & Understanding",
    "desc": "Understanding new domains and stress-testing ideas."
  },
  "anti-hallucination": {
    "id": "anti-hallucination",
    "real": "Anti-Hallucination",
    "name": "Anti-Hallucination",
    "desc": "Keeping agent reasoning honest and grounded."
  },
  "cognitive-load": {
    "id": "cognitive-load",
    "real": "Cognitive Load Management",
    "name": "Cognitive Load Management",
    "desc": "Managing finite attention and reducing overhead."
  },
  "testing": {
    "id": "testing",
    "real": "Testing & Evaluation",
    "name": "Testing & Evaluation",
    "desc": "Measuring whether skills actually improve outcomes."
  },
  "development": {
    "id": "development",
    "real": "Development & Tooling",
    "name": "Development & Tooling",
    "desc": "Tooling, utilities, and workflows for development tasks."
  }
};
