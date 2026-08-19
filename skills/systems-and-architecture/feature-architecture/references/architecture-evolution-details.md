# Architecture Evolution Review — The 8 Checks

## Feature cohesion
Does each feature still have a clear purpose? Has it accumulated unrelated responsibilities? Would a new engineer know where to add the next file? Split only when cohesion has genuinely declined.

## Folder health
Healthy folders grow around one responsibility. Watch for `shared/`, `utils/`, `helpers/`, `common/`, `services/`, `hooks/`, `components/` becoming dumping grounds. Subdivide only when necessary.

## Shared code audit
Every shared file must justify its existence. How many features use it? Would moving it back improve clarity? Shared code is a dependency — every dependency is maintenance cost.

## Core stability
Core should remain stable. Infrastructure changes slowly. If business logic appears in core, flag it immediately.

## Dependency boundaries
Feature leakage, circular dependencies, cross-feature imports, repositories importing UI, infrastructure importing business logic. Recommend simpler dependency flow.

## Module depth
Prefer deep modules that hide complexity. Discourage interfaces that merely forward work. Ask: could callers know less?

## Duplication
Knowledge duplication (repeated business rules) causes maintenance problems — centralize it. Code duplication (repeated JSX) is sometimes fine — don't centralize what doesn't share meaning.

## Predictive risk
Which folders will be painful in a year? Which abstractions will collapse? Which files will attract every future change? Recommend preventative improvements now.
