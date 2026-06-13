---
name: critical-system-interrogation
description: Deep-dive investigation of critical system components (auth pipelines, payment flows, data validation) combining relentless questioning with extreme code quality standards. Use when you need to stress-test a critical system path for correctness, race conditions, security flaws, and architectural integrity.
---

# Critical System Interrogation

A hybrid skill combining the relentless questioning of grill-me with the extreme code quality standards of thermo-nuclear-code-review. Designed for deep investigation of critical system components like authentication pipelines, payment processing, data validation layers, or any system path where bugs could cause serious harm.

## Core Workflow

### Phase 1: Context Gathering (Grill-Me Style)

Interview the user relentlessly about the system component under investigation. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

**Ask questions one at a time.**

If a question can be answered by exploring the codebase, explore the codebase instead.

#### Key Investigation Areas:

1. **System Boundaries**
   - Where does this component start and end?
   - What are the entry points and exit points?
   - What external systems does it interact with?

2. **Data Flow**
   - What data flows through this component?
   - What transformations happen to the data?
   - Where could data become corrupted or invalid?

3. **State Management**
   - What state does this component maintain?
   - How is state shared between concurrent operations?
   - What happens if state becomes inconsistent?

4. **Error Handling**
   - What error conditions can occur?
   - How are errors propagated and handled?
   - What happens when error handling itself fails?

5. **Security Considerations**
   - What authentication/authorization checks exist?
   - Where could injection or bypass attacks occur?
   - What sensitive data is processed and how is it protected?

6. **Race Conditions & Concurrency**
   - What concurrent operations access shared resources?
   - What synchronization mechanisms are used?
   - Where could timing-dependent bugs occur?

### Phase 2: Code Investigation (Thermo-Nuclear Standards)

Apply extreme code quality standards to the identified critical path. Be ambitious about structural simplification and look for "code judo" moves that dramatically improve the implementation.

#### Non-Negotiable Standards:

1. **Be ambitious about structural simplification.**
   - Do not stop at "this could be a bit cleaner."
   - Look for opportunities to reframe the change so whole branches, helpers, modes, conditionals, or layers disappear entirely.
   - Prefer the solution that makes the code feel inevitable in hindsight.
   - Assume there is often a "code judo" move available: a re-organization that uses the existing architecture more effectively and makes the change dramatically simpler and more elegant.
   - If you see a path to delete complexity rather than rearrange it, push hard for that path.

2. **Do not let a component grow past 1k lines without a very strong reason.**
   - Treat this as a strong code-quality smell by default.
   - Prefer extracting helpers, subcomponents, modules, or local abstractions instead of letting a file sprawl past 1000 lines.
   - If the diff crosses that threshold, explicitly ask whether the code should be decomposed first.
   - Only waive this if there is a compelling structural reason and the resulting file is still clearly organized.

3. **Do not allow random spaghetti growth in existing code.**
   - Be highly suspicious of new ad-hoc conditionals, scattered special cases, or one-off branches inserted into unrelated flows.
   - If a change adds "weird if statements in random places", treat that as a design problem, not a stylistic nit.
   - Prefer pushing the logic into a dedicated abstraction, helper, state machine, policy object, or separate module instead of tangling an existing path.
   - Call out changes that make the surrounding code harder to reason about, even if they technically work.

4. **Bias toward cleaning the design, not just accepting working code.**
   - If behavior can stay the same while the structure becomes meaningfully cleaner, push for the cleaner version.
   - Do not rubber-stamp "it works" implementations that leave the codebase messier.
   - Strongly prefer simplifications that remove moving pieces altogether over refactors that merely spread the same complexity around.

5. **Prefer direct, boring, maintainable code over hacky or magical code.**
   - Treat brittle, ad-hoc, or "magic" behavior as a code-quality problem.
   - Be skeptical of generic mechanisms that hide simple data-shape assumptions.
   - Flag thin abstractions, identity wrappers, or pass-through helpers that add indirection without buying clarity.

6. **Push hard on type and boundary cleanliness when they affect maintainability.**
   - Question unnecessary optionality, `unknown`, `any`, or cast-heavy code when a clearer type boundary could exist.
   - Prefer explicit typed models or shared contracts over loosely-shaped ad-hoc objects.
   - If a branch relies on silent fallback to paper over an unclear invariant, ask whether the boundary should be made explicit instead.

7. **Keep logic in the canonical layer and reuse existing helpers.**
   - Call out feature logic leaking into shared paths or implementation details leaking through APIs.
   - Prefer existing canonical utilities/helpers over bespoke one-offs.
   - Push code toward the right package, service, or module instead of normalizing architectural drift.

8. **Treat unnecessary sequential orchestration and non-atomic updates as design smells when the cleaner structure is obvious.**
   - If independent work is serialized for no good reason, ask whether the flow should run in parallel instead.
   - If related updates can leave state half-applied, push for a more atomic structure.
   - Do not over-index on micro-optimizations, but do flag avoidable orchestration complexity that makes the implementation more brittle.

### Phase 3: Critical Path Analysis

Focus specifically on the critical system path and look for:

#### Correctness Issues:
- Logic errors in conditional branches
- Off-by-one errors in loops or bounds checking
- Missing validation of input parameters
- Incorrect error propagation
- State machine transitions that can get stuck

#### Race Conditions & Concurrency:
- Shared mutable state without proper synchronization
- TOCTOU (Time-of-Check to Time-of-Use) vulnerabilities
- Non-atomic operations that should be atomic
- Missing locks or improper lock ordering
- Async operations without proper awaiting or error handling

#### Security Vulnerabilities:
- Authentication bypass possibilities
- Authorization check gaps
- Injection vulnerabilities (SQL, NoSQL, command, etc.)
- Sensitive data exposure in logs or errors
- Improper session management
- Missing input sanitization

#### Architectural Integrity:
- Logic leaking across layer boundaries
- Missing abstraction for cross-cutting concerns
- Inconsistent error handling patterns
- Tight coupling that makes the system brittle
- Missing idempotency for retry scenarios

## Output Format

### Summary Report

Provide a structured report with:

1. **Critical Findings** (must fix before deployment)
   - Security vulnerabilities
   - Race conditions that can cause data corruption
   - Logic errors that cause incorrect behavior
   - Missing validation that allows invalid state

2. **High-Priority Issues** (should fix soon)
   - Architectural integrity problems
   - Missing error handling
   - Concurrency concerns
   - Type safety issues

3. **Medium-Priority Improvements** (recommended)
   - Structural simplification opportunities
   - Abstraction improvements
   - Code organization enhancements
   - Performance considerations

4. **Low-Priority Observations** (nice to have)
   - Code style improvements
   - Documentation gaps
   - Minor refactoring opportunities

### Code Judo Opportunities

Explicitly call out any opportunities for dramatic simplification:
- "This entire branch could be eliminated by..."
- "This abstraction is unnecessary because..."
- "This logic belongs in [X] instead of..."
- "This could be made atomic by..."

### Verification Checklist

Provide a checklist of things to verify:
- [ ] Authentication checks at all entry points
- [ ] Authorization verified before data access
- [ ] Input validation complete and consistent
- [ ] Error handling covers all failure modes
- [ ] Race conditions identified and mitigated
- [ ] Sensitive data properly protected
- [ ] State transitions are complete and atomic
- [ ] External system failures handled gracefully

## Review Tone

Be direct, serious, and demanding about quality.
Do not be rude, but do not soften major maintainability issues into mild suggestions.
If the code is making the codebase messier, say so clearly.
If the implementation missed an opportunity for a dramatic simplification, say that clearly too.

Good phrases:

- `this creates a race condition between X and Y. can we make this atomic?`
- `this authentication check is missing at entry point Z. this is a security vulnerability.`
- `this entire error handling branch could be eliminated by...`
- `this logic is leaking across layer boundaries. can we isolate it?`
- `this abstraction seems unnecessary. can we just keep the direct flow?`
- `why does this need a cast / optional here? can we make the boundary more explicit instead?`
- `this looks like a bespoke helper for something we already have elsewhere. can we reuse the canonical one?`
- `i think there's a code-judo move here that makes this much simpler. can we reframe this so these branches disappear?`
- `this refactor moves complexity around, but doesn't really delete it. is there a way to make the model itself simpler?`

## Approval Bar

Do not approve merely because behavior seems correct.
The bar for approval is:

- no critical security vulnerabilities
- no race conditions that can cause data corruption
- no logic errors in the critical path
- no missing validation that allows invalid state
- no clear structural regression
- no obvious missed opportunity to make the implementation dramatically simpler when such a path is visible
- no unjustified file-size explosion
- no obvious spaghetti-growth from special-case branching
- no obviously hacky or magical abstraction that makes the code harder to reason about
- no unnecessary wrapper/cast/optionality churn obscuring the real design
- no clear architecture-boundary leak or avoidable canonical-helper duplication
- no missed opportunity for an obvious decomposition that would materially improve maintainability

Treat these as presumptive blockers unless the author can justify them clearly:

- the implementation preserves a lot of incidental complexity when there is a plausible code-judo move that would delete it
- the implementation pushes a file from below 1000 lines to above 1000 lines
- the implementation adds ad-hoc branching that makes an existing flow more tangled
- the implementation solves a local problem by scattering feature checks across shared code
- the implementation adds an unnecessary abstraction, wrapper, or cast-heavy contract that makes the design more indirect
- the implementation duplicates an existing helper or puts logic in the wrong layer when there is a clear canonical home

If those conditions are not met, leave explicit, actionable feedback and push for a cleaner decomposition.

## When to Use This Skill

Use this skill when:
- Investigating authentication/authorization pipelines
- Reviewing payment processing flows
- Auditing data validation and sanitization layers
- Examining session management systems
- Reviewing cryptographic implementations
- Investigating any system path where bugs could cause:
  - Security breaches
  - Data corruption
  - Financial loss
  - Service outages
  - Compliance violations

Do NOT use this skill for:
- Simple utility functions
- UI components without security implications
- Documentation-only changes
- Configuration changes without security impact
- Performance optimizations without correctness implications
