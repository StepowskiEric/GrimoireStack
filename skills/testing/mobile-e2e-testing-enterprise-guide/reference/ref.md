# Reference: Tables, Checklists, and Patterns

Loaded by the `mobile-e2e-testing-enterprise-guide` skill. Consult when you need the full detail behind a heuristic, the complete edge-case list, or the anti-patterns table.

---

## HICCUPPS — Test Oracles

How to recognize whether the app behaved correctly. Before writing a test, pick the relevant oracle(s). A test with no oracle can't detect a failure.

| Heuristic | Question to Ask |
|---|---|
| **H**istory | Does this behavior match what the app did before? (regression) |
| **I**mage | Does this match the company's brand, style, and visual identity? |
| **C**omparable Products | Would competitors' apps behave the same way? |
| **C**laims | Does the app do what the marketing/help docs say it should? |
| **U**sers' Desires | Does this match what users expect and need? |
| **P**roduct | Is the app consistent with itself? (same pattern everywhere) |
| **P**urpose | Does this feature do what it was designed to do? |
| **S**tatutes | Does it comply with legal/regulatory requirements? (accessibility, privacy, GDPR) |

---

## SFDPOT — Coverage Dimensions

Walk through each dimension systematically to find blind spots. If you only tested Function and Structure, you missed Data, Platform, Operations, and Time.

| Dimension | Look For |
|---|---|
| **S**tructure | Architecture, modules, navigation hierarchy, screen flow |
| **F**unction | Every feature, button, gesture, and what it does |
| **D**ata | What data lives where? What persists? What syncs? |
| **P**latform | iOS vs Android, tablet vs phone, notch vs no-notch, safe areas |
| **O**perations | Performance under load, memory pressure, disk full, backgrounded |
| **T**ime | Loading times, timeout behavior, stale data, long-running sessions, clock changes |

---

## Risk-Based Prioritization

Quantify risk as **Probability × Impact**:

1. **Identify risks**: what could go wrong in each flow? (data loss, payment failure, navigation broken, crash)
2. **Rate probability**: how likely is this failure? (past bugs, code complexity, change frequency)
3. **Rate impact**: how bad would it be? (revenue loss, user frustration, data loss, compliance violation)
4. **Prioritize**: test the highest-risk items first. Everything else gets lower-level tests or manual check.

**Rule of thumb:** 20% of your flows cause 80% of user-facing failures. Find those 20% and put your E2E budget there.

### Six Dimensions of Test Coverage (Rex Black)

Confidence requires measuring across multiple dimensions:

1. **Risk coverage**: what % of identified risks have passing tests?
2. **Requirements coverage**: do tests map to stakeholder requirements?
3. **Design coverage**: does the implementation match the design?
4. **Environment coverage**: tested across relevant devices, OS versions, networks?
5. **User coverage**: do tests reflect real usage patterns and frequencies?
6. **Code coverage**: diagnostic — which code paths are exercised?

**Defensible confidence** = "We tested X% of risks, Y% of requirements, W% of environments, V% of user activities, and U% code coverage." Any single number is a lie.

---

## Adversarial / Abuse-Case Checklist

Beyond happy path — think like an attacker.

### The Adversarial Mindset
- **Lie to the app**: send unexpected data, manipulate headers, tamper with state
- **Break trust boundaries**: what does the frontend assume the backend validates? What does the backend trust the frontend to enforce?
- **Chain micro-bugs**: minor issue A + minor issue B = serious exploit
- **Attack assumptions**: deep-link cold when "must be logged in"; tamper client-side totals; background mid-flow

### Negative Testing — What Not To Do
For every input, action, and state transition:
- **Boundaries**: what happens at the edge of valid values? Just past it?
- **Empty/null**: what if this list is empty? Field is null? Response is blank?
- **Malformed**: what if data format is wrong? (bad JSON, truncated, wrong type)
- **Unauthorized**: no token? expired token? wrong role?
- **Race conditions**: two operations simultaneously
- **Cancelled/interrupted**: user hits back or cancel mid-flow

### Abuse Cases for Mobile
- Tap the same button twice rapidly (double-submit)
- Rotate the device while a request is in flight
- Background the app during a multi-step flow, then return
- Fill storage to capacity before a write operation
- Deny every permission prompt, then try every feature
- Change system date/time to manipulate time-sensitive logic
- Use accessibility services (screen reader, switch control) during the flow

---

## Cognitive Biases — Full Table with Counters

| Bias | What It Does | How To Counter |
|---|---|---|
| **Confirmation** | Test what you *expect* to work, not what might break | Invent explicit "what would disprove this?" scenarios for every flow |
| **Anchoring** | First result sets your mental baseline | Test in random order. Don't always start with the happy path |
| **Automation** | Trust the result because "the computer said so" | Review failures critically. Is the test correct, or is the test wrong? |
| **Availability** | Test recent/known bugs and miss silent areas | Use SFDPOT/HICCUPPS systematically to force coverage |
| **Sunk cost** | Keep a flaky test because you already wrote it | Cut it. Past effort is irrelevant to future value |
| **Bandwagon** | "Everyone tests this way" | Challenge every inherited pattern. Does it still provide value? |
| **Optimism** | Underestimate how often things will fail | Assume every flow WILL fail under some condition you haven't tested |
| **Blind spot** | See biases in others but not yourself | Peer-review test design, not just test results |

---

## Edge Cases That Find Real Bugs

| Edge Case | Why Missed | What to Test |
|---|---|---|
| Cold start via deep link | Most tests launch the app normally | Launch via URL scheme, verify correct screen |
| Push notification from killed state | Testers foreground → then send | Kill app → send push → tap → verify destination |
| Permission revoked mid-session | Tests grant once at start | Grant → use feature → revoke in settings → use again |
| Biometric failure → fallback | Simulators skip biometric by default | Cause biometric to fail → verify passcode fallback |
| Payment interrupted mid-transaction | Happy-path only | Incoming call or background during purchase, then return |
| Sub-second race conditions | Timing is hard to reproduce | Explicit assertions around async operations (save → verify appears) |
| Network transition (on→off→on) | Tests treat network as binary | Online → action → offline → verify queue → online → verify sync |
| Data migration between versions | Only tested in dev | Install old version → create data → upgrade → verify migration |
| System font size / accessibility scaling | Tested at default only | Run at largest accessibility font size → verify layout |
| Multiple simultaneous pushes | Tests tap one push | Queue 3 pushes → open app → verify all rendered in order |
| Double-tap submit button | Testers tap deliberately once | Rapidly tap twice → verify no double-submit |
| Background during multi-step flow | Tested in foreground only | Start flow → background → return → verify state preserved |
| System clock change mid-session | Rarely considered | Change date/time while running → verify time-sensitive logic |
| Storage full on write | Only tested with adequate space | Fill storage → attempt write → verify graceful failure |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|---|---|
| E2E before unit/integration tests | Can't distinguish app failure from environment failure |
| Testing every permutation | 10 screens × 5 states × 3 devices = 150 rotting tests |
| Shared state between tests | Test A passing determines if Test B fails |
| Hardcoded waits / sleep() | Works locally, fails in CI, fails on slower devices |
| Coordinate-based selectors | Broken by different screen sizes, notches, keyboards |
| Over-mocking | If you mock API, DB, and auth, you're not doing E2E |
| No failure enrichment | No screenshot/log/context → 20-minute diagnosis |
| Ignoring flaky tests | One flaky test poisons the whole suite's credibility |
| Full suite on every commit | 30-minute E2E run destroys developer flow |
| Same selectors as dev | Devs change IDs during refactors. Use separate test ID contract |
| Testing implementation, not behavior | Assert on what the user sees, not internal method calls |

---

## Test Design Principles

- **Accessibility IDs, not text** — text changes with translations, A/B tests, redesigns. IDs are a contract.
- **Explicit starting state** — every test defines app state / network state / data state. The #1 flake cause is state leakage.
- **Reset backend data before each run** — deterministic data → deterministic tests.
- **One journey per test** — a 50-step test that fails at step 47 is near-useless. Break at natural boundaries.
- **Assert on what the user sees** — visible labels and UI state, not database rows.
- **Avoid coordinates** — screen sizes, notches, safe areas differ.
- **Declarative waits, not sleeps** — wait for an element to appear, not for N seconds.

---

## Flakiness Management

- Mobile E2E flakiness of **4-12% is normal** — reality even at Google/Apple scale.
- **Do NOT retry everything** — retry only infrastructure failures (device crash, network timeout). Retrying logic failures masks real bugs.
- **Quarantine flaky tests** — move to separate CI stage. Fix or delete within the sprint.
- **Flakiness > 5% = suite has lost trust** — fix the infrastructure before adding more tests.

---

## CI Pipeline Tiers

| Stage | What | Frequency | Devices |
|---|---|---|---|
| Tier 1 | Unit + type check | Every commit | Host |
| Tier 2 | Critical E2E (5-10) | Every PR | Emulators |
| Tier 3 | Broader regression | Merge to main | Emulators + cloud farm |
| Tier 4 | Full suite real devices | Pre-release / nightly | 10-15 from user analytics |

**Never block every commit with real-device tests** — real devices gate releases, not commits.

---

## Permission Handling

- Pre-grant permissions in test setup where possible
- For denial tests, set explicit negative state before the flow starts
- Treat system dialogs (OS update prompt, biometric, clipboard) as first-class test state

---

## Mocking Strategy

- Mock external unpredictable services (payment gateways, third-party APIs, auth providers)
- **Do NOT mock everything** — the point of E2E is validating real integration
- Use a mock proxy (Mockoon, WireMock) between app and backend to switch between real/mock without touching app code
- **Detect mock drift** — backend evolves, mocks get stale. Automated contract tests (OpenAPI schema verification) catch drift early

---

## Enterprise Patterns

### Deterministic Reset Contract
Every test starts with a dev-only API endpoint that resets the backend to a known snapshot. Idempotent, < 1 second. Eliminates data state pollution — the #1 flake source.

### Test Isolation
- Each test gets its own user account (or signs up fresh)
- Shared data is seeded per-test, never assumed from previous runs
- Tests that mutate shared state run last in a serial phase

### Observability
Every failure includes: screenshot, logs, device context, user/data state at time of failure. Without these, debugging is guesswork.

---

## Psychology of Testing

- **Pattern recognition** is your superpower — but also your trap (seeing patterns that aren't there)
- **Emotional regulation**: a flaky suite creates learned helplessness. Fix the signal-to-noise ratio before you burn out.
- **The testing personality** is cultivated, not innate. Curiosity, skepticism, empathy are practiced skills.
- **Burnout signal**: when you stop being curious and start just "running the tests" — you're no longer testing, you're executing. That's when bugs escape.
