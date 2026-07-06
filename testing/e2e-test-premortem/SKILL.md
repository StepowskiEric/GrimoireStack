---
name: e2e-test-premortem
category: testing
description: "Premortem for E2E test changes. Run after writing or modifying E2E tests to audit coverage gaps, data realism, failure-mode coverage, and assertion quality before declaring done. Also run before writing E2E tests to map the flow and identify blind spots first."
version: 1.0
---

# Premortem: E2E Test Audit Protocol

A premortem assumes the tests are insufficient and works backward to find the blind spot. Run the relevant branch below.

**Prerequisite:** Load `skill://e2e-testing-philosophy-and-architecture` — the ten tenets, anti-pattern table, data rules, and heuristics toolbox are the reference for every step here.

---

## Branch: Author — Before Writing

Use this when no E2E tests exist yet for a flow and you're about to create them.

1. **Map the flow.** Write down: the user's goal, every screen/state in the flow, and every transition between them. This is a state machine — get it on paper before touching code.

2. **Name the failure modes.** For every transition, ask: what could go wrong here? Empty data? Network failure? Permission denied? Wrong input? Race condition? State leak? List at least one failure mode per transition.

3. **Select targets by risk.** Apply the Risk-Based Prioritization from the reference: which transitions carry the highest business impact × probability of breakage? Those get E2E coverage. The rest get integration or unit tests.

4. **Write against the map.** Each test must cover: the happy path, at least one failure mode per risky transition, and a data-variety case. Each test maps to a specific transition + failure-mode pair — no orphan tests.

5. **Run the Auditor branch.** After writing, switch branches below and premortem every test you just created.

**Completion criterion:** Every risky transition has a named failure mode in the flow map. Every test maps to a specific transition + failure-mode pair. The Auditor branch has run and either found no gaps or fixed every gap it found.

---

## Branch: Auditor — After Writing

Use this when you've just written or modified one or more E2E tests and need to audit them before declaring done.

1. **Gather the change set.** Identify every E2E test file added or modified in this change.

2. **Premortem each test individually.** For each test, ask all six questions:

   a. **The blind-spot question:** If this test passes but the feature has a production bug in the same flow, what's the most likely cause the test missed? (Wrong assertion? Missing state the user could be in? Test data that doesn't reflect reality?)

   b. **The flakiness question:** If this test fails non-deterministically, what's the most likely root cause? (Timing? Shared state crossing test boundaries? Selector coupled to volatile UI? Environment dependency?)

   c. **The coverage question:** What user behavior is this test explicitly NOT exercising? (Empty state? Error state? Partial data? Network timeout? Backgrounding? Double-tap submission?)

   d. **The data question:** Is the test data realistic? Or is it a single happy-path fixture with no edge-case variety? Does it exercise at least one non-happy-path data condition?

   e. **The assertion question:** Does the test assert on a user-visible outcome (screen state, visible text, navigation result)? Or does it assert on internal state, intermediate API responses, or DOM structure?

   f. **The isolation question:** Does this test start from a known clean state? Or could it be affected by state from a previous test?

3. **Premortem the change set as a whole.** Across all the tests:

   a. **Flow coverage:** Are all the risky transitions from the flow map covered? If not, which are missing and is the gap acceptable?

   b. **Realistic-data coverage:** Is there at least one test that uses multi-archetype data (not just a single perfect record)?

   c. **Anti-pattern scan:** Does any test match an anti-pattern from the reference? (Static sleeps, implementation coupling, shared state, empty-database assumptions, exact-text assertions.)

4. **Categorize and address findings.** For each issue found:

   | Category | Meaning | Action |
   |---|---|---|
   | COVERAGE_GAP | A risky transition has no test | Add a test, or document why acceptable |
   | DATA_REALISM | Test data too clean or too narrow | Add a realistic data case |
   | FLAKINESS_RISK | Structural flakiness source present | Replace root cause (condition-based wait, isolated state, stable selector) |
   | IMPLEMENTATION_COUPLING | Asserts on internals | Change assertion to user-visible outcome |
   | NO_ISSUE | No gap found after full premortem | State what risk this test guards and why the data is sufficient |

5. **Fix or accept.** Every finding that is not NO_ISSUE must be either fixed immediately or explicitly documented (in a code comment or PR description) with the reason the gap is acceptable for this change. An undocumented gap is a blind spot that will ship.

**Completion criterion:** Every test in the change set has been premortemed through all six questions in step 2. Every test has passed the three change-set checks in step 3. Every finding from step 4 has been either fixed or explicitly risk-accepted with a documented reason. You can state, for each test, what blind spot it guards against.
