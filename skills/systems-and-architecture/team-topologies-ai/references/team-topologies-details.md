# Team Topologies — Reference Details

## Agent team types

### Stream-aligned agent
Owns an end-to-end user-facing feature or business capability. Examples: billing slice agent, auth slice agent, notifications feature agent, onboarding flow agent. Use when work should stay close to a product outcome and one agent should reason across UI, API, domain, and tests for a bounded slice.

### Platform agent
Provides reusable capabilities that reduce toil for stream-aligned agents. Examples: CI tooling, deployment templates, logging/telemetry stack, scaffolding generators, shared auth/session primitives, data-access libraries. Use when many stream-aligned agents repeatedly need the same capability and self-service can reduce duplicated work.

### Enabling agent
Helps other agents adopt a new skill or navigate a difficult area. Examples: database migration advisor, performance specialist, accessibility specialist, security hardening advisor, testing strategy coach. Use for temporary expertise; the goal is capability uplift, not permanent ownership.

### Complicated-subsystem agent
Owns a highly specialized domain needing focused expertise. Examples: pricing engine, recommendation logic, compiler/transformation pipeline, synchronization engine, distributed scheduler. Use when the subsystem is deep enough that casual edits are dangerous.

## Interaction modes

| Mode | Use for | Steady state? |
|------|---------|---------------|
| **Collaboration** | migrations, architecture transitions, incident recovery, initial domain discovery | No — keep bounded; permanent collaboration increases cognitive load |
| **X-as-a-service** | scaffolding, CI pipelines, auth/session tooling, deploy/release helpers, observability | Yes — the preferred steady-state platform interaction |
| **Facilitating** | performance guidance, test strategy, domain modeling, security review, accessibility support | Yes — goal is to increase independence |

## Cognitive load budget

Every agent should have: owned slice, known dependencies, stable interfaces, clear success metrics, limited decision surface.

Warning signs of overload:
- one agent edits unrelated areas constantly
- many agents depend on one "super-agent"
- high coordination overhead
- duplicate decisions made in different places
- unclear ownership of tests, contracts, or migrations
- agents require too much repo-wide context to act safely

Fix overload by: narrowing ownership, creating better platform capabilities, extracting complicated subsystems, clarifying interaction mode.

## Bad patterns (with counters)

- **The God Agent** — one agent owns architecture, implementation, review, testing, and infra for the whole repo. Counter: split along stream/platform/enabling/subsystem lines.
- **Layer agents** — one agent owns controllers, another services, another repositories. Counter: that increases coordination and breaks end-to-end ownership.
- **Platform empire** — the platform agent accumulates so much responsibility that everyone waits on it. Counter: keep platform focused on self-service capabilities.
- **Permanent collaboration** — multiple agents always entangled in the same work. Counter: collaborate for discovery and transitions, then simplify boundaries.
- **Cognitive overload denial** — adding ownership without removing context burden. Counter: treat cognitive load as a first-class design constraint.

## Multi-agent repo operating model

- **Stream-aligned agents own:** feature code, feature tests, feature contracts, domain rules, local migrations within slice boundaries.
- **Platform agents own:** scaffolding, CI templates, repo-wide lint/type/test tooling, telemetry patterns, shared developer experience.
- **Enabling agents assist with:** architecture transitions, performance bottlenecks, security and quality improvements, testing uplift, legacy rescue plans.
- **Complicated-subsystem agents own:** mathematically or operationally dense domains, logic that should be protected by narrow stable APIs.

## Review checklist

- Which agent type should own this work?
- Is ownership stream-aligned, platform, enabling, or specialized?
- What interaction mode is appropriate?
- Does this arrangement reduce or increase cognitive load?
- Are boundaries stable enough for self-service?
- Is any agent becoming a bottleneck?
- Should a complicated subsystem be protected behind a better interface?

## Prompt snippets

- **Agent orchestration:** "Organize this work using Team Topologies principles. Assign stream-aligned, platform, enabling, and complicated-subsystem responsibilities with explicit interaction modes."
- **Repo planning:** "Do not split work by generic layers. Design ownership around user-facing flows, platform capabilities, and specialized subsystems while minimizing cognitive load."
- **Agent bottlenecks:** "Identify whether one agent has become the system constraint because ownership boundaries are too broad or platform capabilities are too weak."
- **Refactors:** "Use bounded collaboration for discovery, then return to clearer ownership and self-service interfaces."

## Definition of done

A multi-agent design is done when:
- ownership boundaries are clear
- cognitive load is bounded
- dependencies and interfaces are understandable
- platform capabilities are self-service where possible
- collaboration is purposeful and time-bounded
- no single agent must hold the whole system in its head
