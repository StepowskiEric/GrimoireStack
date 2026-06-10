# Skill: Documentation Craft — Structured Technical Writing

## Purpose

Generate high-quality technical documentation by following a structured multi-phase process inspired by multi-agent documentation systems and literate programming research. Transform complex code into clear, contextual, and complete documentation through outline-first planning, context-aware drafting, and quality verification.

Based on DocAgent multi-agent architecture (arXiv:2504.08725), LLMs for Explainable AI (arXiv:2504.00125), and Natural Language Outlines research (arXiv:2408.04820).

---

## When to Use

- Writing README files for repositories
- Creating API documentation
- Documenting complex functions or classes
- Updating outdated documentation
- Explaining architecture decisions
- Onboarding documentation for new developers

**Don't use when:**
- Code is self-explanatory and trivial
- Documentation already exists and is current
- The audience is yourself only (personal notes)

---

## Core Concept

**The Documentation Pipeline:**

```
Code/Topic → Outline → Context Enrichment → Draft → Verify → Refine
```

**Three-Phase Architecture:**

| Phase | Purpose | Output |
|-------|---------|--------|
| **1. Outline** | Structure the narrative | Section headers + key points |
| **2. Draft** | Write with context | Complete prose |
| **3. Verify** | Check quality | Validated documentation |

**Quality Dimensions (from DocAgent Verifier):**
- **Information Value**: Does it tell the reader something they need to know?
- **Detail Level**: Is the depth appropriate for the audience?
- **Completeness**: Are all essential aspects covered?
- **Clarity**: Is it understandable on first read?
- **Accuracy**: Does it match the code/reality?

---

## State Machine

### State 0: Discovery — Understand the Subject

Before writing, understand what needs documentation.

```yaml
discovery:
  subject_type: "code|architecture|process|api"
  
  # For code documentation
  code_analysis:
    entry_points: ["main.py", "index.js"]
    key_functions: ["authenticate", "process_payment"]
    dependencies: ["database", "external_api"]
    
  # For architecture documentation  
  architecture_analysis:
    components: ["frontend", "backend", "database"]
    data_flow: "user → api → database"
    key_decisions: ["microservices", "event-driven"]
    
  target_audience:
    role: "developer|end_user|maintainer|new_hire"
    expertise: "beginner|intermediate|expert"
    context: "onboarding|reference|decision_making"
```

**Exit condition:** Subject understood, audience identified.

---

### State 1: Outline — Structure the Narrative

Create a NL (Natural Language) outline before writing prose.

```yaml
outline_creation:
  # Top-level structure
  sections:
    - title: "Overview"
      purpose: "What this is and why it exists"
      key_points:
        - "One-sentence description"
        - "Problem it solves"
        - "Key capabilities"
      
    - title: "Getting Started"
      purpose: "Minimum steps to first success"
      key_points:
        - "Prerequisites"
        - "Installation"
        - "Quick example"
      
    - title: "Core Concepts"
      purpose: "Mental models needed to understand"
      key_points:
        - "Key abstractions"
        - "Architecture diagram"
        - "Data flow"
      
    - title: "Usage"
      purpose: "How to use it in practice"
      key_points:
        - "Common patterns"
        - "Configuration options"
        - "Error handling"
      
    - title: "Reference"
      purpose: "Complete API/option listing"
      key_points:
        - "All public methods"
        - "Parameters and returns"
        - "Examples for each"
  
  # For each section, verify information value
  section_validation:
    - section: "Overview"
      information_value: "high"  # Reader must know this
      
    - section: "Getting Started"
      information_value: "high"  # Critical for adoption
      
    - section: "Core Concepts"
      information_value: "medium"  # Helps but not blocking
```

**Outline Principles (from NL Outlines research):**
- Each section has a single purpose
- Key points are bullet points (not prose yet)
- Structure follows reader's mental model
- Order reflects dependency (prereqs before usage)

**Exit condition:** Complete outline with validated sections.

---

### State 2: Context Enrichment — Gather Supporting Information

Before drafting, collect context that will be needed.

```yaml
context_enrichment:
  # For code documentation
  code_context:
    - type: "function_signature"
      source: "def authenticate(user, password):"
      
    - type: "call_sites"
      source: "Used by: login_handler, api_gateway"
      
    - type: "dependencies"
      source: "Depends on: database, bcrypt"
      
    - type: "error_cases"
      source: "Raises: AuthError, TimeoutError"
      
    - type: "examples"
      source: "test_authenticate.py lines 15-30"
  
  # For architecture documentation
  architecture_context:
    - type: "diagram"
      source: "system_architecture.png"
      
    - type: "decision_rationale"
      source: "ADR-001: Why microservices"
      
    - type: "performance_metrics"
      source: "load_test_results.md"
  
  # Enrichment completeness check
  required_context_collected: true
  missing_context: []  # If not empty, gather before drafting
```

**Exit condition:** All context needed for drafting is collected.

---

### State 3: Draft — Write with Context

Write prose using the outline and enriched context.

```yaml
drafting:
  section: "Overview"
  
  outline_to_prose:
    key_point: "One-sentence description"
    draft: |
      This authentication module provides secure user verification
      with support for multiple credential types (password, token, OAuth).
      
    key_point: "Problem it solves"
    draft: |
      Applications need to verify user identity before granting access
      to protected resources. This module handles the complexity of
      credential validation, session management, and security best practices.
      
    key_point: "Key capabilities"
    draft: |
      - Multi-factor authentication support
      - Session token generation and validation
      - Rate limiting to prevent brute force attacks
      - Audit logging for security compliance
  
  # Writing principles
  principles_applied:
    - "Lead with the 'why' before the 'what'"
    - "Use active voice"
    - "One idea per paragraph"
    - "Code examples for every concept"
    - "Link to related sections"
```

**Drafting Guidelines:**

| Principle | Example |
|-----------|---------|
| **Lead with purpose** | "This function validates..." not "The validate function..." |
| **Active voice** | "The system checks..." not "Checks are performed..." |
| **Concrete examples** | Show code after explaining concept |
| **Progressive disclosure** | Overview → Details → Reference |
| **Cross-references** | "See [Authentication Flow](#auth-flow)" |

**Exit condition:** All sections drafted to prose.

---

### State 4: Verify — Quality Check

Check documentation against quality dimensions.

```yaml
verification:
  quality_checks:
    - dimension: "Information Value"
      check: "Does this tell the reader something essential?"
      sections_verified:
        - section: "Overview"
          score: 9/10
          notes: "Clearly explains purpose and scope"
        - section: "Getting Started"
          score: 8/10
          notes: "Quick example works, but missing troubleshooting"
      
    - dimension: "Detail Level"
      check: "Is depth appropriate for audience?"
      sections_verified:
        - section: "Core Concepts"
          score: 7/10
          notes: "Good for intermediate devs, may overwhelm beginners"
          action: "Add 'For Beginners' subsection"
      
    - dimension: "Completeness"
      check: "Are all essential aspects covered?"
      sections_verified:
        - section: "Usage"
          score: 6/10
          notes: "Missing error handling examples"
          action: "Add error handling subsection"
      
    - dimension: "Clarity"
      check: "Is it understandable on first read?"
      sections_verified:
        - section: "Reference"
          score: 8/10
          notes: "Clear, but parameter descriptions could be more concrete"
      
    - dimension: "Accuracy"
      check: "Does it match the code/reality?"
      verification_method: "Code review"
      sections_verified:
        - section: "API Reference"
          score: 9/10
          notes: "All parameters match function signatures"
  
  overall_quality_score: 7.8/10
  
  required_improvements:
    - "Add error handling examples to Usage"
    - "Create 'For Beginners' subsection in Core Concepts"
    - "Make parameter descriptions more concrete"
```

**Exit condition:** All quality dimensions score ≥7/10 or issues logged.

---

### State 5: Refine — Address Issues

Fix identified quality issues.

```yaml
refinement:
  issues_addressed:
    - issue: "Missing error handling examples"
      action: "Added try/catch examples for common errors"
      section: "Usage"
      
    - issue: "May overwhelm beginners"
      action: "Added simplified overview at top of Core Concepts"
      section: "Core Concepts"
      
    - issue: "Parameter descriptions too abstract"
      action: "Added concrete example values for each parameter"
      section: "Reference"
  
  final_verification:
    quality_score_improvement: "7.8 → 8.9"
    ready_to_publish: true
```

**Exit condition:** Quality issues resolved, documentation ready.

---

## Documentation Templates

### Template 1: README.md

```markdown
# {Project Name}

## Overview
{One-sentence description}

{Problem it solves in 2-3 sentences}

### Key Features
- {Feature 1}
- {Feature 2}
- {Feature 3}

## Getting Started

### Prerequisites
- {Requirement 1}
- {Requirement 2}

### Installation
\`\`\`bash
{install command}
\`\`\`

### Quick Start
\`\`\`{language}
{minimal working example}
\`\`\`

## Core Concepts

### {Concept 1}
{Explanation with mental model}

### {Concept 2}
{Explanation with mental model}

## Usage

### {Common Pattern 1}
\`\`\`{language}
{code example}
\`\`\`

### {Common Pattern 2}
\`\`\`{language}
{code example}
\`\`\`

## API Reference

### {Function/Class 1}
{signature}

{description}

**Parameters:**
- `{param}` — {description}

**Returns:**
- {description}

**Example:**
\`\`\`{language}
{example}
\`\`\`

## Contributing
{How to contribute}

## License
{License info}
```

### Template 2: Architecture Decision Record (ADR)

```markdown
# ADR-{number}: {Decision Title}

## Status
{Proposed | Accepted | Deprecated | Superseded by ADR-XXX}

## Context
{What is the issue that we're seeing that is motivating this decision?}

## Decision
{What is the change that we're proposing or have agreed to implement?}

## Consequences
{What becomes easier or more difficult to do because of this change?}

### Positive
- {Benefit 1}
- {Benefit 2}

### Negative
- {Drawback 1}
- {Drawback 2}

## Alternatives Considered
{What other options were evaluated?}
```

### Template 3: Function/Class Documentation

```markdown
## {Name}

{One-sentence purpose}

{Detailed description of what this does and when to use it}

### Signature
\`\`\`{language}
{function signature}
\`\`\`

### Parameters
| Name | Type | Description |
|------|------|-------------|
| {param} | {type} | {description} |

### Returns
| Type | Description |
|------|-------------|
| {type} | {description} |

### Raises
| Exception | When |
|-----------|------|
| {Error} | {condition} |

### Example
\`\`\`{language}
{working example}
\`\`\`

### See Also
- [{Related Function}](#link)
```

---

## Anti-Patterns

**Don't:**
- Write prose without outlining first
- Document what is obvious from the code
- Use passive voice ("was implemented")
- Skip examples for complex concepts
- Write for yourself instead of the target audience
- Let documentation drift from code (stale docs)

**Do:**
- Outline before drafting
- Lead with the "why"
- Use concrete examples
- Cross-reference related sections
- Verify accuracy against code
- Update docs when code changes

---

## Integration with Other Skills

- Use **before** `compression-as-understanding` to verify docs capture essence
- Use **with** `cross-domain-analogy-generator` for explaining complex concepts
- Use **after** `everything-as-code-conceptualizer` to document codified systems

---

## See Also

- DocAgent: Multi-Agent System for Documentation (arXiv:2504.08725)
- LLMs for Explainable AI (arXiv:2504.00125)
- Natural Language Outlines for Code (arXiv:2408.04820)
- Context-Aware Code Documentation (arXiv:2509.14273)
- `feynman-technique` — for explaining simply
