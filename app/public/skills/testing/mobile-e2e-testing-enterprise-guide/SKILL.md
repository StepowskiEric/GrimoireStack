---
name: mobile-e2e-testing-enterprise-guide
category: testing
description: "Hunter's mindset for mobile E2E testing — think like a professional tester: what to test, how to catch real bugs, verify flows work, and avoid traps. Use when planning tests, reviewing coverage, debugging flakiness, or needing adversarial/edge-case ideas."
version: 1.0
---

# Mobile E2E Testing: The Hunter's Mindset

A **hunter** is curious (where's the trail?), skeptical (that's not what it seems), and empathetic (how does the prey think?). They think adversarially, know their own limits, use structured tools, and don't waste energy over-hunting.

This skill is all reference — consult it whenever you need to think like a tester, not like a developer.

---

## The Three Attitudes

These aren't personality traits — they're practiced skills.

- **Curiosity** — "what if?" scenarios beyond the obvious path. Network drops *here*? User taps twice? Phone rotates mid-flow?
- **Skepticism** — "it works on my machine" is not evidence. Assume hidden failure modes until proved otherwise.
- **Empathy** — real users are tired, distracted, on slow devices with full storage and accessibility needs.

---

## The Five Mindsets

### Mindset 1: Prove the system, not the code
Unit tests prove logic. E2E tests prove the *user's experience*. Fail when a real user would be blocked, not when an implementation detail changes.

### Mindset 2: Maintenance is the real cost
Writing takes hours. Keeping green for a year takes orders of magnitude more. Every test must earn its keep — protect revenue, protect a critical action, or catch what lower layers can't. If none, delete it.

### Mindset 3: Accept the myth
True E2E coverage across all devices, networks, and OS versions is **unattainable**. You're running critical-path integration tests labelled E2E. Be precise about which subset of the infinite permutation space you cover.

### Mindset 4: Test state, not flows
Define every test's starting state — app state (fresh install? logged in? permissions granted?), network state (online? offline? slow?), data state (which user? which records?). A test without a defined starting state **will flake**.

### Mindset 5: Green means trust, not coverage
An all-green suite that still ships bugs E2E should have caught is **false confidence** — the most dangerous state. Track flakiness rate (< 2-3%), false negatives, and false positives.

---

## Heuristic Models (Overview)

Professional testers use structured heuristics to find blind spots. The full tables are in [`reference/ref.md`](reference/ref.md), but the two key mnemonics are:

- **HICCUPPS** — test oracles: 8 ways to recognize correct vs broken behavior (History, Image, Comparable products, Claims, Users, Product consistency, Purpose, Statutes).
- **SFDPOT** — coverage dimensions: 6 areas where bugs hide (Structure, Function, Data, Platform, Operations, Time).

Before writing any test, ask: "How will I know if the app is wrong here?" (oracle) and "Which dimensions have I not checked?" (coverage).

---

## Adversarial Thinking

A hunter thinks like their prey. Ask not "does this work?" but **"how could this be abused?"**

- Lie to the app (unexpected data, tampered state)
- Break trust boundaries (what does the frontend assume the backend validates?)
- Chain micro-bugs (small issue A + small issue B = serious exploit)
- Attack assumptions (deep-link cold, tamper client-side totals, background mid-flow)

Full abuse-case checklist in [`reference/ref.md`](reference/ref.md).

---

## Cognitive Bias Traps

Your own brain is the biggest threat to good testing. These biases are proven to undermine testers:

| Bias | What It Does |
|---|---|
| **Confirmation** | You test what you *expect* to work, not what might break |
| **Anchoring** | The first result sets your mental baseline |
| **Automation** | You trust the result because "the computer said so" |
| **Availability** | You test recent/known bugs and miss silent areas |
| **Sunk cost** | You keep a flaky test because you already wrote it |
| **Optimism** | You underestimate how often things fail |

**Counter:** structured heuristics (HICCUPPS, SFDPOT) and peer review of test design, not just test code.

Full table with counter-strategies in [`reference/ref.md`](reference/ref.md).

---

## What to Test (Priority Order)

### Tier 1 — Revenue & Conversion (test every release)
- Auth flows (email, OAuth, biometric) — signup, login, password reset
- Purchases and subscriptions — selection → payment → confirmation → receipt; restore; expiry
- Checkout — cart → address → payment → confirmation
- Revenue-driving deep links — push notification tap, cold-start routing, universal link fallback

### Tier 2 — Core Feature Loop
- Onboarding — first launch → permission prompts → tutorial → first action
- The primary user action (the main thing your app does)
- Navigation — screen transitions, back/home, tab bar, modals

### Tier 3 — Resilience
- Offline: cached data → queue actions → reconnect → sync
- Permission denial: every denied permission, every feature that depends on it
- Network degradation: timeouts, retries, partial data
- App state transitions: background → foreground, killed → relaunch, notification tap

### Tier 4 — Device & Platform
- Gestures (swipe, pinch, long-press)
- Interruptions (incoming call, low storage)
- Keyboard (fields not covered, return key advances focus)
- Orientation (data not lost)

---

## Starting Point

These are the ordered steps. Each has a completion criterion you can check.

1. **Write 5-10 critical-user-journey E2E tests** — covering Tiers 1 and 2 above. Completion: each test starts from a defined state, uses accessibility IDs, and asserts on visible outcomes.
2. **Build a dev-only reset endpoint** — restores backend to a known snapshot, idempotent, < 1 second. Completion: calling it before any test produces deterministic results.
3. **Use accessibility IDs as your element contract** — dev and test agree on stable selectors. Completion: no test uses text content, coordinates, or index-based selectors.
4. **Run critical subset on every PR, full suite on merge** — Tier 2 on PR, Tiers 1-3 on merge, Tier 4 pre-release. Completion: CI is configured and green.
5. **Track flakiness rate** — quarantine anything above 5%. Completion: a periodic review cadence exists, flaky tests are tagged and triaged within the sprint.
6. **Fix the test environment before writing more tests** — if staging is unreliable, tests will be too. Completion: the environment is stable enough that infrastructure failures (device crash, network timeout) are distinguishable from logic failures.

---

## Reference

All detailed tables, checklists, and patterns are in [`reference/ref.md`](reference/ref.md):

- HICCUPPS oracle table (8 consistency heuristics with prompts)
- SFDPOT coverage dimension table (6 areas with what to look for)
- Risk-based prioritization model and the six coverage dimensions
- Full adversarial / abuse-case checklist for mobile
- Cognitive biases full table with counter-strategies
- Edge cases that find real bugs (16 entries with why missed + what to test)
- Anti-patterns table (12 entries with why they fail)
- Test design principles, flakiness handling, CI pipeline tiers
- Permission handling and mocking strategy
- Enterprise patterns (deterministic reset, test isolation, observability)
- Psychology of testing (pattern recognition, emotional regulation, burnout signals)
