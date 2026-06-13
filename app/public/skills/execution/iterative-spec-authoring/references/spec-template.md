# Spec: [Feature/Change Title]

**Author:** [Agent Name]
**Date:** [YYYY-MM-DD]
**Status:** DRAFT | REVISED | USER-APPROVED
**Judge Model:** [model used, e.g. anthropic/claude-sonnet-4]
**Research Phase:** [yes/no — whether external research was performed]

---

## 1. Overview

**What:** [One paragraph describing what this feature/change does]

**Why:** [The problem it solves or the value it delivers]

**Who:** [Who benefits — users, developers, operators]

**In / Out of Scope:**
- ✅ In scope: [list]
- ❌ Out of scope: [list]

---

## 2. Acceptance Criteria

Each criterion must be independently testable. Write them as:
*"Given [context], when [action], then [observable result]"*

1. [AC-1] [Description]
2. [AC-2] [Description]
3. [AC-3] [Description]
<!-- Add more as needed -->

---

## 3. Technical Implementation Plan

### 3.1 Backend

1. [Step description — what to implement, not how]
   - API/function: [name and signature]
   - Data changes: [new fields, tables, indexes]
   - Dependencies: [what this step requires]

<!-- Repeat for each backend step -->

### 3.2 Frontend

1. [Step description]
   - Component: [name]
   - Route: [path]
   - State management: [hook/store/context]

<!-- Repeat for each frontend step -->

### 3.3 Infrastructure / Integration

1. [Step description — env vars, services, third-party integrations]

### 3.4 Data Migration (if applicable)

1. [Migration steps, rollback procedure]

---

## 4. File-by-File Changes

For each file that changes, list the file path and describe the changes:

### `path/to/file.ts`
- **Change type:** [new | modify | delete]
- **What changes:** [description]
- **Why:** [justification]

<!-- Repeat for every file -->

---

## 5. Testing Strategy

| Layer | What to test | How |
|-------|-------------|-----|
| Unit | [isolated functions/utilities] | [framework + approach] |
| Integration | [API endpoints, DB interactions] | [setup + assertions] |
| E2E | [user flows] | [Playwright/Detox steps] |
| Edge cases | [empty state, bad input, race conditions] | [specific scenarios] |
| Regression | [what existing tests must still pass] | [test suite name] |

**Test data:** [how to set up fixtures/seeds]

**Verification commands:**
```bash
# Run these to verify your changes
npm run test
npm run check
```

---

## 6. Security & Compliance

- [ ] **Authentication:** [Who can access this? What auth checks are needed?]
- [ ] **Authorization:** [RBAC/permissions — who can do what?]
- [ ] **Input validation:** [What validation is applied at each boundary?]
- [ ] **Data handling:** [PII considerations, encryption, retention]
- [ ] **Rate limiting:** [Is abuse possible? Mitigation?]
- [ ] **OWASP Top 10:** [Which items apply, and how they're addressed]
- [ ] **Error handling:** [Do errors leak sensitive info?]
- [ ] **Audit logging:** [What gets logged for compliance?]

---

## 7. Dependencies & Risks

### Dependencies
- [ ] [Dependency name and version]
- [ ] [Internal service/API dependency]

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [description] | [H/M/L] | [H/M/L] | [what to do] |

### Rollback Plan
1. [How to revert if this fails]
2. [Feature flag / kill switch approach]

---

## 8. Performance Considerations

- [Expected load: X requests/sec, Y concurrent users]
- [Latency target: <Z ms for p95]
- [Caching strategy: what, where, TTL]
- [Database query optimization: indexes, N+1 concerns]

---

## 9. Monitoring & Observability

- [ ] **Logs:** [What to log, log levels, structured format]
- [ ] **Metrics:** [Counters, histograms, dashboards]
- [ ] **Alerts:** [Threshold-based alerts for errors, latency, saturation]
- [ ] **Tracing:** [Distributed tracing spans if applicable]

---

## 10. Research & References

> *Populated during Phase 2 (tool-assisted research). Updated after each judge round.*

### Key Findings

1. **[Finding summary]** — [Source URL](https://...) — *Confidence: High/Medium/Low*
2. **[Finding summary]** — [Source URL](https://...) — *Confidence: High/Medium/Low*
3. **[Finding summary]** — [Source URL](https://...) — *Confidence: High/Medium/Low*

### How Research Influenced This Spec

- [Section X]: [describe how a research finding changed the plan]
- [Section Y]: [describe a pitfall from research that was addressed]

### Sources Consulted

| # | Title | URL | Date Retrieved | Relevance |
|---|-------|-----|----------------|-----------|
| 1 | [Title] | [URL] | [YYYY-MM-DD] | [High/Med/Low] |
| 2 | [Title] | [URL] | [YYYY-MM-DD] | [High/Med/Low] |

---

## 11. Revision Log

> *Auto-populated during each revision round. Do not delete previous entries.*

### Revision 0 — Initial Authoring
- Author: [agent]
- Research: [X sources consulted]
- Changes: [initial draft]

### Revision 1 — Judge Round 1
- Judge: [model name]
- Issues found: [N]
- Changes applied: [summary]
- Needs-research items: [list or "none"]

### Revision 2 — Judge Round 2
- Judge: [model name]
- Issues found: [N]
- Changes applied: [summary]

### Revision 3 — Judge Round 3
- Judge: [model name]
- Issues found: [N]
- Changes applied: [summary]

---

_Final status: [DRAFT | REVISED | USER-APPROVED]_