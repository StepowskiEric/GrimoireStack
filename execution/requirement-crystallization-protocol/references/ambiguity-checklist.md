# Ambiguity Detection Checklist

> Use this checklist during **Phase 1 (SURFACE)** of the Requirement Crystallization
> Protocol. For each item, mark whether the requirement passes or raises a
> clarification flag. Every flag produces one targeted clarifying question before
> moving to CAPTURE.

---

## 1. Vague Verbs

Verbs that describe an action without saying *how* it should behave hide
sub-decisions. Flag them and ask for concrete success criteria.

| Category | Trigger Words | What to Ask |
|---|---|---|
| Improve / enhance / better | "improve the UX", "make it faster" | *How much faster? What does "better UX" look like?* |
| Support / handle | "handle edge cases", "support imports" | *Which cases count as "edge"? What file formats?* |
| Update / refresh | "keep data up to date" | *On what cadence? What is the staleness threshold?* |
| Enable / allow | "allow users to search" | *What fields are searchable? What counts as a match?* |
| Integrate / connect | "integrate with the payment system" | *Which payment system? What events are synced?* |
| Display / show | "show relevant info" | *Which fields? In what order?* |

**Before:**
> "Improve the search experience."

**After:**
> "Reduce average search latency from 2.4 s to under 200 ms at p95 for queries
> up to 10 000 records. Return results ranked by a TF-IDF score over the `title`
> and `body` fields. Display up to 50 results per page."

---

## 2. Missing Constraints

Constraints that are completely absent — performance, scale, compatibility,
data shape, or security — are ambiguity holes.

| Missing Constraint | Flag Trigger | Clarifying Question |
|---|---|---|
| Scale / volume | No mention of data size, users, or requests | *What is the expected maximum load?* |
| Performance target | No latency, throughput, or timeout values | *What is the acceptable response time at p95?* |
| Data shape | Input/output format is undefined | *What is the exact schema of the request and response?* |
| Compatibility | No browser, OS, API version, or dependency bounds | *Which environments must be supported?* |
| Security / auth | No mention of access control or data sensitivity | *Who may perform this action? Is the data PII?* |
| Cost / quota | No budget or rate-limit guidance | *What is the acceptable cost or rate ceiling?* |
| Persistence | No mention of whether state is saved | *Is this operation stateless or stateful?* |

**Before:**
> "Build a feedback submission form."

**After:**
> "Build a POST /api/feedback endpoint that accepts `{ user_id, rating (1–5),
> message (max 2000 chars) }`. The form must authenticate via JWT, rate-limit
> submissions to 5/hour per user, persist submissions to PostgreSQL within 500 ms,
> and reject submissions from deactivated accounts with HTTP 403."

---

## 3. Undefined Edge Cases

Requirements that never mention what happens at boundaries or when things go
wrong are incomplete. Identify at least three edge cases before writing any code.

| Edge Case Type | Questions to Ask |
|---|---|
| Empty / null input | What happens when the list is empty, the string is null, or the payload is missing a required field? |
| Maximum / minimum values | What happens at 0, at MAX_INT, at the maximum allowed array length? |
| Concurrent access | What happens when two requests hit the same resource at the same time? |
| Partial failure | If step 3 of 5 fails, are steps 1–2 rolled back? Is the user notified? |
| Permission denied | What does the user see when they are not allowed to perform the action? |
| Offline / unavailable | What happens when the network is down or the downstream service returns 503? |
| Replay / duplicate | What happens if the same request is sent twice (idempotency)? |

**Before:**
> "Delete a user account and all their data."

**After:**
> "DELETE /api/users/:id must (a) soft-delete the user row, (b) nullify their
> posts' `author_id` within 10 s, (c) enqueue a job to purge PII from the `comments`
> table, (d) return 204 on success, 404 if the user does not exist, 409 if they
> have active subscriptions, and 500 with a retry-after header if the database is
> unavailable. The endpoint must be idempotent: a second DELETE on the same user
> returns 204 with no additional side effects."

---

## 4. Implicit Assumptions

Every requirement carries unstated assumptions about the current system,
the desired outcome, and the users. Surface them explicitly.

| Assumption Type | Examples | Clarifying Question |
|---|---|---|
| Current system state | "Add a cancel button" assumes the flow already has an in-progress state | *Is there already a pending state to cancel?* |
| User identity / role | "Show the dashboard" assumes a logged-in user with a known role | *Which roles can access this? What does an anonymous user see?* |
| Data already exists | "Sort by most popular" assumes popularity data is collected | *How is popularity measured? Is historical data already stored?* |
| Desired outcome | "Send a notification" assumes the user wants to be notified | *Which channels? What is the fallback if the channel is unavailable?* |
| External service availability | "Call the payment API" assumes it is up and responds quickly | *What is the timeout and retry policy? What happens on failure?* |

**Before:**
> "Let users invite teammates by email."

**After:**
> "POST /api/invites accepts `{ email, role }` from any authenticated user with
> the `admin` role. The system must (a) check that the email is not already a
> member, (b) generate a signed invite token valid for 72 h, (c) send it via the
> configured email provider, (d) record the invite in the `invites` table, (e)
> return 201 with the invite ID, or 409 if the email already exists, or 403 if
> the caller lacks the `admin` role. If the email provider is down, the invite is
> still recorded and a background job retries delivery up to 3 times over 24 h."

---

## 5. Quick Checklist Summary

Run this list for every requirement before entering CAPTURE.

- [ ] **Verb clarity** — All action verbs have measurable success criteria.
- [ ] **Scale defined** — Maximum load, data size, or request rate is stated.
- [ ] **Performance target** — Latency / throughput / timeout numbers are set.
- [ ] **Data shape** — Request and response schemas are fully specified.
- [ ] **Compatibility** — Supported environments, versions, and dependencies are listed.
- [ ] **Security / auth** — Who can perform the action and what data they can see is clear.
- [ ] **Edge cases** — At least 3 boundary conditions are identified and specified.
- [ ] **Error states** — Failure modes (network, permission, partial) have defined responses.
- [ ] **Idempotency** — Duplicate or replay behavior is specified if relevant.
- [ ] **Assumptions surfaced** — Every implicit assumption has been named and validated.
- [ ] **Critical assumption resolved** — The one assumption that invalidates the most work has been answered.

If any box is unchecked, formulate a targeted clarifying question and resolve it
before proceeding to **Phase 2: CAPTURE**.
