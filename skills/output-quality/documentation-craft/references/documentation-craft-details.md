# Documentation Craft — Templates & Positive Craft Rules

## README.md template

````markdown
# {Project Name}

{One-sentence description. Problem it solves in 2-3 sentences.}

### Key Features
- {Feature 1} — {what it does for the user}
- {Feature 2} — {what it does for the user}

## Getting Started

### Prerequisites
- {Requirement}

### Installation
```bash
{install command}
```

### Quick Start
```{language}
{minimal working example — copy-pasteable, produces a visible result}
```

## Core Concepts

### {Concept 1}
{Mental model + why it matters. Diagram if the relationship is spatial.}

## Usage

### {Common Pattern}
```{language}
{working example with comments on the non-obvious lines}
```

### {Edge Case / Configuration}
```{language}
{example}
```

## Reference

### {Function/Class}
```{language}
{signature}
```
{one-line purpose. Parameters table if >2 params. Returns. Raises. Example.}

## Contributing
{How to contribute — or pointer to CONTRIBUTING.md}

## License
{License}
````

## ADR (Architecture Decision Record) template

````markdown
# ADR-{number}: {Title}

## Status
{Proposed | Accepted | Deprecated | Superseded by ADR-XXX}

## Context
{What situation motivates this decision? What constraints exist?}

## Decision
{What we decided. Be specific — "we will X" not "we should consider X".}

## Consequences

### Positive
- {Benefit}

### Negative
- {Trade-off we accepted}

## Alternatives Considered
{What else was evaluated and why it lost.}
````

## Function/Class doc template

````markdown
## {Name}

{One-sentence purpose.}

{2-3 sentences: when to use it, what it does, what it does NOT do.}

```{language}
{signature}
```

| Param | Type | Description |
|-------|------|-------------|
| `{p}` | `{t}` | {what the caller must provide} |

**Returns:** {type} — {what the caller gets back}
**Raises:** {Error} — {when}

```{language}
{working example — the 80% use case}
```

**See also:** {related function or concept}
````

## Craft rules

- **Use active voice.** "The system checks" not "Checks are performed."
- **Give every example context.** Concept first, then the code — never code floating without the "when and why."
- **Lead with purpose.** "This function validates..." not "The validate function..."
- **Concrete over abstract.** "Returns 42" beats "Returns an integer."
