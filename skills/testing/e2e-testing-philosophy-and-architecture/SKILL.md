---
name: e2e-testing-philosophy-and-architecture
description: "Reference for E2E testing mindset, architecture, and strategy: testing epistemology, 3-layer BDR architecture, risk-based prioritization, data realism principles."
triggers:
  - Need E2E testing reference for mindset and architecture
  - Need testing epistemology and strategy guidance
  - Need risk-based prioritization and data realism principles
disable-model-invocation: true
---

# E2E Testing Philosophy & Architecture — Reference

## I. The Core Mindset: Testing as Epistemology

- **Inverted burden of proof:** Assume software is broken; the test must prove otherwise.
- **Non-optimistic stance:** Search for the gap between what the system *should* do and what it *actually* does.
- **Three pillars:** Curiosity ("what if?"), Skepticism ("prove it works"), Empathy ("how does a real, distracted user behave?").
- **Heuristics toolbelt:** SFDPOT, RCRCRC, the "what if" cascade for every action.

## II. What E2E Tests Actually Are (and Aren't)

- **Are:** Full-stack, black-box validation of complete user workflows using real inputs and real outcomes.
- **Are NOT:** Regression for unit-level logic, substitute for integration tests, or a measure of code coverage.
- **Testing Trophy distribution (Kent C. Dodds):** Static > Unit > **Integration (most effort)** > E2E (few, targeted, critical-path only).
- Core principle: **"The more your tests resemble the way your software is used, the more confidence they provide."**

## III. Think Like a User

- **Test outcomes, not implementation.** Assert on what the user sees and can do.
- **Assume the user will:** have no/wrong data, lose connectivity, be on a slow device, get interrupted, double-tap, navigate backwards, enter absurd input.
- **Map failure modes before writing the happy path.** The happy path is table stakes.
- **Realism is a feature:** Empty databases give false confidence. Use seed endpoints with multi-archetype data (trial/active/churned/admin/no-data). Run against production-like environments.
- **Postmortems write tests:** Every incident should produce a permanent E2E test that catches it before the fix ships.

## IV. Architecture: Three-Layer Model (BDR Methodology)

### Layer 1 — Technical (Page Objects)
- Selectors + raw UI interactions only. No business rules, no assertions, no cross-page orchestration.
- Change selectors here once; no test touches them.

### Layer 2 — Action (Flows)
- Business-process orchestration using Page Objects. Models real business entities (CartFlow, CheckoutFlow, AuthFlow).
- Never touches selectors or DOM.

### Layer 3 — Specification (Tests)
- Business intent expressed in user-story form. Composes flows to demonstrate scenarios.
- Knows nothing about implementation.

**Boundary rule:** Spec → Flow → POM. Each layer talks only to the layer directly below.

## V. Risk-Based Prioritization

**Risk Score = Business Impact (1–5) × Probability of Breakage (1–5)**

| Tier | Score | Focus | Effort |
|---|---|---|---|
| Critical | 16–25 | Deep E2E, pre-merge gate, multiple scenarios | ~40% |
| High | 10–15 | Thorough E2E + integration, regression emphasis | ~30% |
| Medium | 5–9 | Standard testing, selective automation | ~15–20% |
| Low | 1–4 | Smoke tests only, maybe skip E2E | ~5–10% |

**Critical bucket:** Auth/onboarding, core transactions (payment/checkout), data-integrity flows, critical third-party integrations.

**Money path heuristic:** Focus on 5–10 flows that drive revenue, retention, and core value.

## VI. Anti-Patterns

| Anti-Pattern | Why It Fails |
|---|---|
| Testing implementation details | Breaks on every refactor even when behavior is identical |
| Static sleeps | Flakiest cause — always wait for a condition, never an amount of time |
| Shared mutable state | Passes in isolation, fails in parallel |
| Too many E2E tests | Suite becomes slow, flaky, ignored |
| No quarantine discipline | One flaky test poisons the whole suite's credibility |
| Empty-database testing | Passes with no data, fails with real volumes and edge cases |
| No teardown / resource leak | Tests accumulate state, eventually collapse |
| Asserting on exact text/position | Breaks on localization, responsive layout, copy changes |

## VII. Heuristics Toolbox

- **Oracle problem:** Compare against known-good system, validate invariants, check consistency rules.
- **Boundary analysis:** Test every partition edge (empty, single, max, overflow, negative, expired).
- **Pairwise / all-pairs:** Cover every interaction between any two variables (~15 tests vs 243 for full combinatorial).
- **Tour heuristic:** Navigate through every major screen and function in a single flow.
- **Error guessing:** Trained intuition from experience with similar APIs, configs, and failure patterns.
- **State transition testing:** Model flow as a state machine; test every valid AND invalid transition.

## VIII. Data Rules

1. Seed endpoints over fixture files (version-controlled, schema-aware, handle time-dependent states).
2. Every test gets its own known state — no shared DB, no shared user, no shared session.
3. Represent multiple user archetypes (trial, active, churned, no-data, 1000+ records, expired session, admin).
4. Include "awkward" data (incomplete profiles, deleted records, nulls, special chars, boundary dates).
5. Masked production data beats synthetic — but isolate per test run, never share.

## IX. Suite Management

- Quarantine flaky tests immediately — investigate before re-entering critical path.
- Keep pre-merge E2E under ~5 minutes; longer suites run post-merge or nightly.
- Track: flake rate, execution time trend, false positive rate, mean-time-to-detection, coverage on changed surface area.
- Review suite every sprint — drop tests that no longer guard important risk.
- Postmortems feed the suite. Every gap reveals a blind spot in your thinking.

## X. Summary Tenets

1. E2E is expensive — spend it where failure hurts most.
2. Test behavior, not implementation.
3. Realism matters more than breadth.
4. Three-layer architecture: Spec → Flow → POM.
5. Postmortems write tests.
6. Think like a tired, distracted user on a bad network.
7. Data is infrastructure — versioned, clean, multi-archetype.
8. Quarantine flakiness fast.
9. The suite is a living thing — add, remove, rebalance.
10. The measure is confidence, not count.
