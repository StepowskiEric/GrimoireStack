---
name: team-topologies-ai
description: "Stream-aligned, platform, enabling, and complicated-subsystem boundaries with explicit interaction modes."
triggers:
  - multi-agent-organization
  - ownership-boundaries
  - god-agent-prevention
  - platform-sprawl
---

# Team Topologies for Multi-Agent Systems

**Fast flow over heroics.** Organize agents like strong engineering teams: each agent owns a bounded area — stream, platform, enabling, or complicated subsystem — with an explicit interaction mode, so cognitive load stays manageable and work flows cleanly. The question is not "how many agents can we add?" but "how should responsibilities, interfaces, and interaction modes be shaped?"

## When to Use
- Multiple agents collaborating on one repository
- One agent is doing too much and context is collapsing
- Responsibilities are unclear across product, platform, infra, and architecture
- The repo needs stable ownership boundaries
- You need to decide which agent should do what

## The Move

### 1. Map the streams
Identify the end-to-end user-facing flows (billing, auth, onboarding, notifications). Assign one **stream-aligned agent** per bounded slice: it owns feature code, tests, contracts, and domain rules together — reasoning across UI, API, domain, and tests for its slice.

### 2. Extract platforms
Find capabilities many streams need repeatedly (CI tooling, scaffolding, auth/session primitives, telemetry, deploy templates). Give them to a **platform agent** as self-service capabilities that reduce toil — not as a hoard of complexity.

### 3. Protect subsystems
Locate deep specialized domains (pricing engine, recommendation logic, scheduler, transformation pipeline) where casual edits are dangerous. Put them behind a **complicated-subsystem agent** with a narrow, stable API that shields everyone else from the complexity.

### 4. Add enablers
For temporary expertise needs (migrations, performance, security, testing uplift), use an **enabling agent** that teaches and unblocks — capability uplift, not permanent ownership transfer.

### 5. Set interaction modes & verify
- **Collaboration** — two agents work closely on a shared problem; use for migrations, transitions, incident recovery; keep it time-bounded (permanent collaboration raises cognitive load)
- **X-as-a-service** — one agent provides a capability via a clear self-service contract; the preferred steady state for platforms
- **Facilitating** — an enabling agent helps another learn without taking over

Then verify: every agent has a bounded slice, known dependencies, stable interfaces, and clear success metrics; no God Agent, no platform empire, no permanent entanglement.

## Reference
For the per-type details with examples, cognitive-load warning signs and fixes, the bad-pattern catalog with counters, the multi-agent repo operating model, and prompt snippets, see [`references/team-topologies-details.md`](references/team-topologies-details.md).

## Rules
- **Do** prefer stream-aligned ownership over generic layer ownership (controllers/services/repos split increases coordination).
- **Do** make platform capabilities self-service — everyone waits on a non-self-service platform.
- **Do** keep collaboration time-bounded; steady state uses clearer boundaries.
- **Do** protect complicated subsystems with simple interfaces.
- **Do** treat cognitive load as a first-class design constraint.
