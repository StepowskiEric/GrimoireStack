# Skill: Team Topologies for Multi-Agent Software Systems

## Purpose

Use this skill when the agent must organize work across multiple agents, teams, or ownership boundaries without creating coordination chaos.

This skill adapts Team Topologies into an AI agent operating model:
- bounded ownership
- clear interaction modes
- cognitive load control
- stream-aligned delivery
- platform support without platform sprawl

It is especially useful when designing sub-agent systems for engineering work: refactors, feature delivery, migrations, platform tasks, incident handling, and repo governance.

---

## When to Use

Use this skill when:
- multiple agents are collaborating on one repository
- one agent is doing too much and context is collapsing
- responsibilities are unclear
- work crosses product, platform, infra, and architecture concerns
- the repo needs stable ownership boundaries
- the team wants an agent swarm without chaos
- you need to decide which agent should do what

---

## Core Law

Optimize for fast flow by keeping each agent or team responsible for a bounded area with manageable cognitive load.

The question is not:
“How many agents can we add?”

The question is:
“How should responsibilities, interfaces, and interaction modes be shaped so work flows cleanly?”

---

## Agent Team Types

## 1) Stream-Aligned Agent
Owns an end-to-end user-facing feature or business capability.

Examples:
- billing slice agent
- auth slice agent
- notifications feature agent
- onboarding flow agent

Use when:
- work should stay close to a product or feature outcome
- one agent should reason across UI, API, domain, and tests for a bounded slice

---

## 2) Platform Agent
Provides reusable capabilities that reduce toil for stream-aligned agents.

Examples:
- CI tooling
- deployment templates
- logging/telemetry stack
- scaffolding generators
- shared auth/session primitives
- data access libraries that remove repeated complexity

Use when:
- many stream-aligned agents repeatedly need the same capability
- self-service can reduce cognitive load and duplicated work

---

## 3) Enabling Agent
Helps other agents adopt a new skill or navigate a difficult area.

Examples:
- database migration advisor
- performance specialist
- accessibility specialist
- security hardening advisor
- testing strategy coach

Use when:
- a stream-aligned agent temporarily needs expertise
- the goal is capability uplift, not permanent ownership transfer

---

## 4) Complicated-Subsystem Agent
Owns a highly specialized domain that needs focused expertise.

Examples:
- pricing engine
- recommendation logic
- compiler/transformation pipeline
- synchronization engine
- distributed scheduler

Use when:
- the subsystem is deep enough that casual edits are dangerous
- abstraction is needed to shield others from the complexity

---

## Interaction Modes

## Collaboration
Two agents work closely for a bounded time on a shared problem.

Use for:
- migrations
- architecture transitions
- incident recovery
- initial domain discovery

Avoid keeping collaboration permanent; it increases cognitive load.

---

## X-as-a-Service
One agent provides a capability via clear interface or self-service contract.

Use for:
- scaffolding
- CI pipelines
- auth/session tooling
- deploy/release helpers
- observability infrastructure

This is the preferred steady-state platform interaction.

---

## Facilitating
An enabling agent helps another agent learn or adopt a capability without taking over ownership.

Use for:
- performance guidance
- test strategy
- domain modeling help
- security review
- accessibility support

The goal is to increase independence.

---

## Cognitive Load Budget

Every agent should have a bounded context:
- owned slice
- known dependencies
- stable interfaces
- clear success metrics
- limited decision surface

Warning signs of overload:
- one agent edits unrelated areas constantly
- many agents depend on one “super-agent”
- high coordination overhead
- duplicate decisions made in different places
- unclear ownership of tests, contracts, or migrations
- agents require too much repo-wide context to act safely

Fix overload by:
- narrowing ownership
- creating better platform capabilities
- extracting complicated subsystems
- clarifying interaction mode

---

## Multi-Agent Repo Operating Model

A practical AI engineering setup:

### Stream-aligned agents
Own:
- feature code
- feature tests
- feature contracts
- domain rules
- local migrations within slice boundaries

### Platform agents
Own:
- scaffolding
- CI templates
- repo-wide lint/type/test tooling
- telemetry patterns
- shared developer experience

### Enabling agents
Assist with:
- architecture transitions
- performance bottlenecks
- security and quality improvements
- testing uplift
- legacy rescue plans

### Complicated-subsystem agents
Own:
- mathematically or operationally dense domains
- logic that should be protected by narrow stable APIs

---

## Rules for Sub-Agent Design

1. Prefer stream-aligned ownership over generic layer ownership.
2. Do not create a permanent central brain for everything.
3. Use platform agents to remove repeated toil, not to hoard complexity.
4. Use enabling agents to teach and unblock, not to become bottlenecks.
5. Protect complicated subsystems with simple interfaces.
6. Limit collaboration windows; steady-state should use clearer boundaries.
7. Design boundaries around real domains and workflows, not arbitrary folder trees.

---

## Bad Multi-Agent Patterns

### 1) The God Agent
One agent owns architecture, implementation, review, testing, and infra for the whole repo.

Counter:
Split along stream/platform/enabling/subsystem lines.

### 2) Layer agents
One agent owns controllers, another services, another repositories.

Counter:
That often increases coordination and breaks end-to-end ownership.

### 3) Platform empire
The platform agent accumulates so much responsibility that everyone waits on it.

Counter:
Keep platform focused on self-service capabilities.

### 4) Permanent collaboration
Multiple agents are always entangled in the same work.

Counter:
Use collaboration for discovery and transitions, then simplify boundaries.

### 5) Cognitive overload denial
The organization keeps adding ownership without removing context burden.

Counter:
Treat cognitive load as a first-class design constraint.

---

## Use Cases This Skill Handles Well

- designing sub-agent workflows
- organizing large refactors
- ownership planning for monorepos
- agent routing strategies
- platform tooling design
- migration task decomposition
- avoiding “everyone touches everything” chaos
- turning AI agents into a more realistic engineering team

---

## Review Checklist

- Which agent type should own this work?
- Is ownership stream-aligned, platform, enabling, or specialized?
- What interaction mode is appropriate?
- Does this arrangement reduce or increase cognitive load?
- Are boundaries stable enough for self-service?
- Is any agent becoming a bottleneck?
- Should a complicated subsystem be protected behind a better interface?

---

## Definition of Done

A multi-agent design is done when:
- ownership boundaries are clear
- cognitive load is bounded
- dependencies and interfaces are understandable
- platform capabilities are self-service where possible
- collaboration is purposeful and time-bounded
- no single agent must hold the whole system in its head

---

## Prompt Snippets

### For agent orchestration
“Organize this work using Team Topologies principles. Assign stream-aligned, platform, enabling, and complicated-subsystem responsibilities with explicit interaction modes.”

### For repo planning
“Do not split work by generic layers. Design ownership around user-facing flows, platform capabilities, and specialized subsystems while minimizing cognitive load.”

### For agent bottlenecks
“Identify whether one agent has become the system constraint because ownership boundaries are too broad or platform capabilities are too weak.”

### For refactors
“Use bounded collaboration for discovery, then return to clearer ownership and self-service interfaces.”

---

## Final Instruction

Design agent systems the way strong engineering organizations design teams:
clear ownership, low cognitive load, explicit interaction patterns, and fast flow over heroics.
