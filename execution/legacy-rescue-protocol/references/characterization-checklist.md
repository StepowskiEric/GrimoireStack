# Legacy Code Characterization Checklist

Use this checklist before modifying any legacy code. The goal is to build a complete mental model of the code's current behavior, dependencies, and structure — before writing a single line of change.

---

## 1. Dependency Map

Map everything the code depends on and everything that depends on it.

- [ ] **External libraries** — List all third-party packages imported/used. Note versions if known.
- [ ] **Internal modules** — Trace imports to other modules/packages in the codebase. Build a directed graph if the module is large.
- [ ] **Runtime dependencies** — Environment variables, config files, databases, message queues, file paths, network endpoints.
- [ ] **Build/toolchain dependencies** — Compiler versions, build scripts, Makefiles, Dockerfiles, CI configurations.
- [ ] **Reverse dependencies** — What other parts of the system call into this code? A change here may break callers you haven't seen.
- [ ] **Entry points** — Identify all entry points (CLI handlers, HTTP routes, message handlers, scheduled jobs, event listeners).
- [ ] **Exit points** — Identify all exit points: return values, exceptions raised, files written, network calls, logs emitted.

**Deliverable:** A dependency diagram (even a rough text outline) showing this module and its immediate neighbors.

---

## 2. Test Coverage Assessment

Quantify what is and isn't tested — and what the tests actually verify.

- [ ] **Run existing test suite** — Capture the current pass/fail state before any changes.
- [ ] **Line/branch coverage** — If possible, generate a coverage report. Note untested branches, especially error paths and edge cases.
- [ ] **Test quality audit** — Skim each test to check:
  - Are they asserting real behavior or just calling functions?
  - Do they use mocks/fakes? If so, are the mocks realistic?
  - Are there integration tests, or only unit tests?
- [ ] **Uncovered hot paths** — Prioritize the most-used execution paths that have no tests. These are high-risk.
- [ ] **Tests that may encode bugs** — Some tests document buggy behavior. Flag them: these must become characterization tests (see Phase 1 of the protocol).

**Deliverable:** A coverage summary and a list of untested paths ranked by risk.

---

## 3. Coupling Analysis

Understand how tightly this code is bound to its surroundings.

- [ ] **Afferent coupling (Ca)** — How many other modules depend on this one? High Ca = high blast radius for changes.
- [ ] **Efferent coupling (Ce)** — How many external modules does this one depend on? High Ce = hard to test in isolation.
- [ ] **Instability index** — Calculate I = Ce / (Ca + Ce). Close to 1.0 = very unstable (hard to change safely). Close to 0.0 = rigid but stable.
- [ ] **Tight coupling hotspots** — Identify functions or classes that directly instantiate dependencies, use global state, or call static methods. These are seam candidates.
- [ ] **Shared mutable state** — Look for module-level variables, singletons, or caches that are read/written across call sites.
- [ ] **Inheritance depth** — Deep inheritance chains make behavior hard to predict. Note the deepest chain in this module.

**Deliverable:** A coupling summary with specific locations (file:line) for hotspots.

---

## 4. Change Point Identification

Pinpoint exactly where a change needs to land and what ripples outward.

- [ ] **Locate the target behavior** — Find the specific function/method/line that produces the behavior you want to change.
- [ ] **Trace callers upward** — For the target, list every caller function up to the entry points. These are paths to re-characterize.
- [ ] **Trace callees downward** — For the target, list every function it calls (especially side-effecting ones). These are the collaborators that must keep passing.
- [ ] **Identify data flow** — What inputs reach the target? What outputs does it produce? Where do those outputs go?
- [ ] **Note side effects** — Database writes, network calls, file I/O, mutating shared state, logging. These are the hardest things to characterize and the easiest to break.
- [ ] **Flag branching complexity** — Deeply nested conditionals, switch statements without defaults, and complex boolean logic are high-risk change zones.
- [ ] **Previous change history** — If version control is available, check `git log` for this file. Files that change frequently are inherently riskier.

**Deliverable:** A change impact map: target → callers → callees → side effects.

---

## 5. Pre-Modification Risk Score

After completing sections 1–4, assign a risk score to guide the depth of your characterization.

| Risk Factor | Low | Medium | High |
|---|---|---|---|
| Test coverage | >70% | 30–70% | <30% |
| Afferent coupling | <3 callers | 3–10 callers | >10 callers |
| Efferent coupling | <3 deps | 3–10 deps | >10 deps |
| Side effects | None or read-only | Local side effects | External I/O or shared mutable state |
| Change frequency (git) | Rare | Occasionally | Often |

**Overall risk:** Count high-risk factors. 0–1 = proceed with standard characterization. 2–3 = invest in full characterization before touching anything. 4–5 = treat as high-risk; consider a phased approach or seek peer review before modifying.

---

## 6. Final Gate Checklist

Before writing any change:

- [ ] Dependency map documented
- [ ] Existing tests run and results recorded
- [ ] Coverage gaps identified and high-risk paths noted
- [ ] Coupling hotspots located (seam candidates identified)
- [ ] Change impact map complete
- [ ] Risk score assigned and accepted
- [ ] Characterization tests written for target behavior (if no existing test covers it)
- [ ] **All characterization tests passing green**

> If any item above is unchecked, return to characterization before proceeding to Phase 2 (Seam) of the Legacy Rescue Protocol.
