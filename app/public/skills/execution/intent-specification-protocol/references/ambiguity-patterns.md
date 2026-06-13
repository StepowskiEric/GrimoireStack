# Ambiguity Patterns Reference

This reference catalogs common sources of requirement ambiguity that trigger the AMBIGUOUS state in the Intent Specification Protocol. Use this to rapidly identify what's unclear before writing code.

---

## Pattern Categories

### 1. Vague Verbs

**Definition:** The action word is imprecise enough to cover multiple distinct operations.

**Why it's ambiguous:** Different implementations of "improve," "handle," or "fix" can produce radically different code with different side effects.

**Detection Heuristic:** If you can name at least 3 different functions that would satisfy the verb, it's vague.

---

#### Examples

| Vague Verb | Concrete Alternatives | Gap |
|------------|----------------------|-----|
| "improve performance" | add caching / batch queries / add index / rewrite algorithm / paginate results | Which bottleneck? What's the target latency? |
| "handle errors" | return null / throw exception / log and continue / retry with backoff / return error object | Which errors? What's the caller's expectation? |
| "fix the bug" | null-check / type coercion / boundary condition / race condition / state reset | What's the observed failure mode? |
| "clean up the code" | rename variables / extract functions / remove dead code / add types / restructure modules | What specific problem are you solving? |
| "optimize" | reduce allocations / improve cache locality / parallelize / use lazy evaluation / reduce API calls | What's the constraint? CPU? Memory? Latency? |
| "support more users" | scale horizontally / add rate limiting / implement queue / add pagination / optimize queries | What's the current failure mode under load? |
| "add validation" | client-side / server-side / both / required fields only / format checking / business rules | Which fields? What error response? |

---

#### Detection Questions

- "What exactly does [verb] mean in this context?"
- "What would the output look like if [verb] was done correctly?"
- "If I implement [verb] in two different ways, would both be correct?"

---

#### Red Flags in Specs

- "Improve the X" → Should specify what "improved" means
- "Better error handling" → Should specify which errors and what "better" means
- "Make it faster" → Should specify by how much or to what target
- "Clean up Y" → Should specify which aspects of Y

---

### 2. Missing Constraints

**Definition:** The requirement describes what to do but omits critical boundaries, limits, or conditions.

**Why it's ambiguous:** Without explicit constraints, the agent must guess at boundaries, and guesses tend toward the most general (and usually over-engineered) implementation.

**Detection Heuristic:** If you can't answer "when should this NOT apply?" the constraint is missing.

---

#### Examples

| Missing Constraint | Problem It Creates | Clarifying Question |
|--------------------|-------------------|---------------------|
| "Add pagination to the list endpoint" | No page size, no cursor vs offset, no sort order | What page size? Offset or cursor? Default sort? |
| "Cache the user data" | No TTL, no invalidation trigger, no cache key strategy | TTL? When does cache invalidate? Key format? |
| "Add authentication" | No auth method, no session duration, no protected routes | Which routes? JWT? Session? OAuth? Token lifetime? |
| "Filter results by date" | No date field specified, no range semantics, no timezone | Which date field? Inclusive/exclusive? UTC or local? |
| "Send notification on event" | No channel, no throttling, no retry, no failure behavior | Email? SMS? Push? Rate limits? What if send fails? |
| "Batch process the records" | No batch size, no parallelism, no ordering guarantee | Batch size? Sequential or parallel? Order matters? |
| "Migrate the database schema" | No rollback plan, no downtime tolerance, no backfill strategy | Zero-downtime? Can we rollback? Backfill existing rows? |

---

#### The "When Should This NOT Apply?" Test

For every constraint, ask: "When should this NOT apply?" If you can't answer, the constraint is incomplete.

**Examples:**
- ✅ "Return user profile" → When should it NOT return a profile? When user is not authenticated. (Constraint found: requires auth)
- ❌ "Cache the results" → When should it NOT cache? [blank] → Missing constraint (e.g., when data is stale, when user is admin)

---

#### Common Missing Constraint Patterns

**Scope Boundaries:**
- "This feature applies to..." → Who/what is EXCLUDED?
- "Process all items" → How many items? What's the upper bound?

**Error Boundaries:**
- "Return the data" → What if data doesn't exist? What if the DB is down?
- "Calculate the total" → What if inputs are null? What if division by zero?

**Time Boundaries:**
- "Cache the result" → For how long? When does it expire?
- "Retry on failure" → How many times? With what backoff?

**State Boundaries:**
- "Update the record" → What if the record was deleted by another thread?
- "Process the queue" → What if the queue is empty? What if items are malformed?

---

### 3. Implicit Assumptions

**Definition:** The requirement relies on context, conventions, or prior knowledge that isn't stated but is critical to implementation.

**Why it's ambiguous:** Assumptions are invisible until violated. The agent may share the user's assumptions (leading to overconfidence) or hold different ones (leading to wrong code).

**Detection Heuristic:** For every statement in the requirement, ask "what must be true for this to make sense?" If the answer isn't in the requirement, it's an assumption.

---

#### Examples

| Assumption | Why It's Risky | How to Surface It |
|------------|---------------|-------------------|
| "Use the existing user service" | Which one? There are 3 user-related services | "Which service handles user data?" |
| "Follow the existing pattern" | Which existing pattern? There are 4 similar features with different patterns | "Which feature's pattern should I follow?" |
| "Make it consistent with the rest" | "Rest" is undefined — consistent in style? Behavior? API shape? | "Consistent in what dimension — naming, API structure, error format?" |
| "Handle it properly" | "Properly" is defined by the context, which isn't stated | "What does 'proper' look like in this codebase?" |
| "Use the standard approach" | Standard for what domain? This team? This company? Industry? | "What's the standard for X in this context?" |
| "Integrate with the auth system" | Which auth system? Multiple may exist or none may be named | "Which auth system — Auth0, Cognito, custom?" |
| "Add it to the dashboard" | Which dashboard? What section? What widget type? | "Which dashboard — admin, user, analytics?" |

---

#### The Assumption Surfacing Technique

For each requirement statement, apply this template:

```
Statement: "{{requirement_text}}"
For this to be unambiguous, I need to know:
1. {{specific question about scope}}
2. {{specific question about behavior}}
3. {{specific question about integration point}}
```

**Example:**
```
Statement: "Add the feature to the dashboard"
For this to be unambiguous, I need to know:
1. Which dashboard (admin, user, analytics)?
2. Where on the dashboard (section, widget type)?
3. What data does it display and from where?
```

---

#### The "Explain to a New Engineer" Test

If you had to explain this requirement to a new engineer who joined yesterday, what would you have to tell them that isn't in the requirement? Those are the implicit assumptions.

---

### 4. Undefined Edge Cases

**Definition:** The requirement describes the primary flow but doesn't address boundary conditions, exceptional inputs, or unusual states.

**Why it's ambiguous:** Edge cases are where most real bugs live. Without explicit guidance, the agent must guess, and guesses tend toward "happy path only."

**Detection Heuristic:** For each input, state, or operation, ask "what happens at the boundary?" If the answer isn't specified, it's undefined.

---

#### Common Undefined Edge Case Patterns

**Empty / Null Cases:**
- "Return a list of items" → What if there are no items? Empty list, null, 404, error?
- "Process the user input" → What if input is empty string? What if all fields are null?

**Boundary Values:**
- "Accept a score between 0 and 100" → What about exactly 0? Exactly 100? Negative? 100.5?
- "Limit to 100 items" → What about exactly 100? What about 101?

**State Transitions:**
- "Cancel the subscription" → What if already cancelled? What if in trial? What if payment pending?
- "Delete the record" → What if it has children? What if it's referenced elsewhere?

**Concurrency:**
- "Update the counter" → What if two requests arrive simultaneously?
- "Process the payment" → What if the payment was already processed by another request?

**Permission / Authorization:**
- "Show the user's profile" → What if the viewer isn't the user? What if the user is deleted?

**External Dependencies:**
- "Sync with the external API" → What if the API is down? What if it returns an error?
- "Generate a report" → What if the data source is unavailable?

---

#### The "What Happens When X is..." Test

For each operation, systematically ask:

```
What happens when:
- The input is empty / null / missing?
- The input is at the minimum valid value?
- The input is at the maximum valid value?
- The input exceeds the maximum?
- The resource doesn't exist?
- The resource already exists?
- The user isn't authorized?
- The external service is unavailable?
- The operation is repeated?
- The operation is called simultaneously from two places?
```

If any of these aren't specified, the edge case is undefined.

---

### 5. Missing "What Not to Change" (Invariant Ambiguity)

**Definition:** The requirement describes the desired change but doesn't specify what must be preserved.

**Why it's ambiguous:** This is the most dangerous type of ambiguity because it leads to over-engineering and broken invariants. The agent will change everything that "makes sense" to change, potentially breaking unrelated behavior.

**Detection Heuristic:** If you can't answer "what existing behavior must continue to work exactly as before?" the invariant is missing.

---

#### Examples

| Ambiguous Requirement | Missing Invariant | Clarifying Question |
|-----------------------|-------------------|---------------------|
| "Add a discount field to the order" | What about existing order calculations? | Must existing order total calculations produce identical results for orders without discounts? |
| "Change the user search to be case-insensitive" | What about existing search filters? | Must exact-match searches still work? Must filters combining case-sensitive and case-insensitive fields still work? |
| "Update the notification format" | What about existing notification consumers? | Must all downstream consumers parse the new format without changes? |
| "Refactor the payment processing" | What about transaction history? | Must the refactored code produce identical audit logs? |
| "Optimize the query" | What about result ordering? | Must the optimized query return rows in the same order? |
| "Add a new status to the order state machine" | What about existing status transitions? | Must existing transitions still be valid? Must rejected orders behave identically? |

---

#### The Invariant Checklist

Before coding, verify these invariants are specified:

- [ ] **Existing callers:** What do existing callers of modified functions expect?
- [ ] **Existing tests:** What behavior do existing tests verify?
- [ ] **Data contracts:** What data shapes must be preserved?
- [ ] **Public API:** What function signatures are locked?
- [ ] **Performance:** Are there latency/throughput constraints that must not regress?

---

### 6. Underspecified Acceptance Criteria

**Definition:** The requirement describes the change but doesn't define what "done" looks like in verifiable terms.

**Why it's ambiguous:** Without acceptance criteria, verification is subjective. "It looks right" isn't a testable criterion.

**Detection Heuristic:** If you can't write a test (automated or manual) that would fail when the requirement isn't met, the criteria are underspecified.

---

#### Examples

| Ambiguous Criteria | Verifiable Alternative |
|--------------------|------------------------|
| "The page should load faster" | "Page load time must be under 2 seconds on 3G" |
| "Users should be able to search" | "Search returns results within 500ms for queries up to 100 chars" |
| "Handle all edge cases" | "Returns 400 with error message for null, empty, and malformed inputs" |
| "Make it accessible" | "All interactive elements have keyboard focus indicators and ARIA labels" |
| "Support international users" | "All user-facing strings are extracted to i18n keys; date/times display in user's locale" |
| "No bugs" | "All existing tests pass; no new console errors in happy path" |

---

## Pattern Interaction Map

Ambiguity patterns rarely appear in isolation. Watch for these compound patterns:

| Compound Pattern | Risk | Example |
|-----------------|------|---------|
| Vague verb + missing constraints | Over-engineered general solution | "Improve caching" with no TTL, no invalidation strategy |
| Vague verb + implicit assumptions | Wrong solution to wrong problem | "Handle errors properly" assuming "properly" means "log and continue" when caller expects exceptions |
| Missing constraints + undefined edge cases | Fragile implementation | "Add rate limiting" with no handling for "what about admin users?" or "what about burst at limit boundary?" |
| Implicit assumptions + underspecified criteria | Verification impossibility | "Make it consistent" — consistent with what? How do you verify? |
| All of the above | Maximum ambiguity risk | Any requirement stated in a single sentence in a Slack message |

---

## Detection Workflow

When reviewing a requirement, run through this checklist:

```
□ Read the requirement once without taking notes
□ Identify every verb — is each one precise?
□ For each action, list what must NOT change — are invariants stated?
□ For each claim, ask "what must be true for this to make sense?" — are assumptions stated?
□ For each input/operation, ask boundary questions — are edge cases stated?
□ Can you write a test that would fail if the requirement isn't met? — are acceptance criteria stated?
□ Can you explain the requirement to someone with no context? — are implicit dependencies stated?
```

**Scoring:**
- 0-2 unchecked boxes: Low ambiguity, may proceed with light specification
- 3-4 unchecked boxes: Medium ambiguity, full protocol recommended
- 5-7 unchecked boxes: High ambiguity, MUST clarify before any code

---

## Quick Reference: Red Flag Vocabulary

Words that signal ambiguity in requirements:

| Category | Red Flag Words | What to Ask |
|----------|---------------|-------------|
| Vague verbs | improve, optimize, handle, fix, clean, support, enhance | What does success look like? |
| Missing scope | everything, all, any, various, some | What's excluded? What's the boundary? |
| Missing conditions | normally, usually, typically, when needed | When does this NOT apply? |
| Missing specifics | properly, correctly, appropriately, standard | What does "proper" mean here? |
| Missing owners | the system, the user, they | Who specifically? Which system? |
| Missing values | reasonable, acceptable, sufficient | What's the threshold? |
| Missing time | eventually, soon, when ready | By when? What's the deadline? |

---

## De-escalation: When Ambiguity is Intentional

Not all ambiguity is a problem. Sometimes ambiguity is intentional (e.g., "make it feel faster" is a UX goal, not a spec). In these cases:

1. **Acknowledge the ambiguity** — "This is a UX/design goal, not a technical spec."
2. **Propose exploration** — "I'll build a prototype to test approaches. Should I start with X, Y, or Z?"
3. **Set a decision point** — "I'll implement option A first, evaluate, then decide if we need B or C."

Don't force a technical specification where the user is expressing a goal. Goals need exploration; features need specs.
