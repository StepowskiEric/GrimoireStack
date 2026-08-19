---
name: mobile-e2e-testing-enterprise-guide
description: "Mobile E2E specifics: five testing mindsets, what to test by tier, adversarial and bias-aware test design, and a starting sequence."
triggers:
  - mobile-e2e-planning
  - mobile-test-coverage-review
  - flakiness-debugging
  - adversarial-edge-case-ideas
---

# Mobile E2E Testing — The Hunter's Mindset

**A hunter is curious, skeptical, and empathetic — and knows an all-green suite can still ship bugs.** Mobile E2E specifics layered on the shared E2E philosophy: prove the user's experience, define every test's starting state, track trust rather than coverage, and think adversarially. For the shared epistemology, three pillars, three-layer architecture, and risk scoring, load `e2e-testing-philosophy-and-architecture` first.

## When to Use
- Planning mobile E2E tests
- Reviewing mobile test coverage
- Debugging mobile flakiness
- Needing adversarial or edge-case ideas

## The Five Mindsets
1. **Prove the system, not the code** — E2E fails when a real user would be blocked, not when logic is debatable.
2. **Maintenance is the real cost** — writing takes hours; keeping green for a year takes orders of magnitude more. Every test must protect revenue, protect a critical action, or catch what lower layers cannot.
3. **Accept the myth** — full coverage across all devices, networks, and OS versions is unattainable. You run critical-path integration tests labelled E2E; be precise about which subset of the infinite permutation space you cover.
4. **Test state, not flows** — define every test's starting state: app state (fresh install, logged in, permissions granted?), network state (online, offline, slow?), data state (which user, which records). A test without a defined starting state will flake.
5. **Green means trust, not coverage** — an all-green suite that still ships bugs E2E should have caught is false confidence. Track flake rate (below 2–3%), false negatives, and false positives.

## What to Test (priority order)
- **Tier 1 — Revenue & conversion (every release):** auth (email, OAuth, biometric), purchases and subscriptions (selection → payment → confirmation → receipt; restore; expiry), checkout, revenue-driving deep links (push tap, cold-start routing, universal link fallback).
- **Tier 2 — Core feature loop:** onboarding (first launch → permission prompts → tutorial → first action), the primary user action, navigation (screen transitions, back/home, tab bar, modals).
- **Tier 3 — Resilience:** offline (cached data → queue actions → reconnect → sync), permission denial for every dependent feature, network degradation (timeouts, retries, partial data), app state transitions (background → foreground, killed → relaunch, notification tap).
- **Tier 4 — Device & platform:** gestures (swipe, pinch, long-press), interruptions (incoming call, low storage), keyboard (fields not covered, return key advances focus), orientation (no data loss).

## Starting Point (ordered, each with a completion check)
1. **Write 5–10 critical-user-journey tests** (Tiers 1–2): defined starting state, accessibility IDs, assert on visible outcomes.
2. **Build a dev-only reset endpoint** — restores a known snapshot, idempotent, under 1 second; calling it before any test produces deterministic results.
3. **Use accessibility IDs as the element contract** — no text, coordinates, or index-based selectors.
4. **Run the critical subset on every PR, the full suite on merge** — Tier 2 on PR, Tiers 1–3 on merge, Tier 4 pre-release.
5. **Track flakiness** — quarantine anything above 5%; tag and triage within the sprint.
6. **Fix the test environment before writing more tests** — infrastructure failures (device crash, network timeout) must be distinguishable from logic failures.

## Reference
For HICCUPPS oracles, SFDPOT coverage dimensions, the full abuse-case checklist, cognitive-bias counter-strategies, 16 edge cases, the 12-entry anti-pattern table, permission/mocking strategy, and enterprise patterns, see [`reference/ref.md`](reference/ref.md). Shared philosophy, three-layer architecture, and risk-based prioritization live in `e2e-testing-philosophy-and-architecture`.

## Rules
- **Do** think adversarially: lie to the app, break trust boundaries, chain micro-bugs, attack assumptions.
- **Do** watch your own biases — confirmation, anchoring, automation, availability, sunk cost, optimism.
