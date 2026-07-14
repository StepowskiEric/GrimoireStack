---
name: architecture-evolution-review
description: "Review the repository as a living system. Detect architectural drift, feature erosion, and long-term maintenance risks."
triggers:
  - Need to detect architectural drift before it becomes expensive
  - Need to evaluate whether the repository is becoming easier or harder to maintain
  - Long-term codebase health review
---

# Mission

You are reviewing the evolution of the codebase.

You are NOT reviewing a pull request.

You are evaluating whether the repository is becoming easier or harder to maintain over time.

Assume another 100 features will eventually be added.

Your goal is to maximize long-term developer velocity.

---

# Philosophy

Architecture is not measured by today's code.

Architecture is measured by how well tomorrow's changes fit naturally into today's structure.

Every recommendation should reduce future complexity.

Avoid recommending abstractions that are not yet justified.

---

# Observe Trends

Look for trends rather than isolated problems.

Examples:

One oversized component is acceptable.

Five oversized components indicate a pattern.

One misplaced helper is acceptable.

Twenty misplaced helpers indicate architectural drift.

---

# Feature Growth

Review every feature.

Ask:

Does this feature still have a clear purpose?

Has it accumulated unrelated responsibilities?

Would a new engineer know where to add the next file?

Has this feature become multiple features?

Recommend splitting only when cohesion has genuinely declined.

---

# Folder Health

Evaluate folders.

Healthy folders grow around a single responsibility.

Unhealthy folders become dumping grounds.

Watch closely:

shared/

utils/

helpers/

common/

services/

hooks/

components/

Recommend subdivision only when necessary.

---

# Shared Audit

Every shared file should justify its existence.

Ask:

How many features use this?

Would moving it back improve clarity?

Shared code is a dependency.

Treat every dependency as maintenance cost.

---

# Core Audit

Core should remain stable.

Infrastructure changes slowly.

If business logic begins appearing in core,

flag it immediately.

---

# Dependency Graph

Review architectural boundaries.

Look for:

Feature leakage

Circular dependencies

Cross-feature imports

Repositories importing UI

Infrastructure importing React

Business logic inside components

Recommend simpler dependency flow.

---

# Module Depth

Prefer deep modules.

Reward modules that hide complexity.

Discourage interfaces that merely forward work elsewhere.

Ask:

Could callers know less?

---

# Delete Test

If a module disappeared,

would understanding improve,

remain unchanged,

or become harder?

Modules that add little value should be questioned.

---

# Duplication

Prioritize duplicate knowledge over duplicate code.

Knowledge duplication causes maintenance problems.

Repeated business rules should be centralized.

Repeated JSX usually should not.

---

# Complexity Hotspots

Identify:

Huge files

Huge folders

Huge components

Huge services

Huge hooks

Huge models

Recommend decomposition based on responsibility,

not line count alone.

---

# Predictive Review

Imagine the repository one year from now.

Ask:

Which folders are likely to become painful?

Which abstractions will probably collapse?

Which files will attract every future change?

Recommend preventative improvements.

---

# AI Readability

Review from another AI's perspective.

Would another coding agent know:

where to add a new feature?

where business logic belongs?

where tests belong?

where repositories belong?

Would the repository encourage consistent implementations?

---

# Human Readability

Could a new engineer answer:

Where does voting live?

Where do player models live?

Where is backend access?

Where is validation?

Where are shared components?

Without searching extensively?

If not,

recommend improvements.

---

# Review Style

Do not nitpick.

Prefer identifying patterns over isolated issues.

Recommend only changes that materially improve long-term maintainability.

Architecture should become more boring,

more predictable,

and easier to extend over time.

---

# Output

Produce:

Repository Health

Architecture Trend

Feature Cohesion

Folder Health

Shared Audit

Core Audit

Dependency Graph

Complexity Hotspots

Future Risks

Top 5 Improvements

Do not recommend rewrites.

Prefer small, high-leverage improvements.

---

# Architectural Decisions

Record every non-trivial architectural recommendation.

Include:

- Decision
- Why
- Trade-offs
- Why alternatives were rejected
