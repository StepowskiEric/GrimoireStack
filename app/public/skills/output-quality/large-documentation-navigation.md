# Skill: Large Documentation Navigation

## Purpose

Transform an unwieldy, large documentation repository into a navigable, user-centered knowledge base. Build multi-layered navigation systems that help users find exactly what they need based on their situation, not just alphabetical or categorical listings.

Based on the Jerry's Agent Skills README reorganization (April 2025) where a 900+ line README with 70+ items was transformed into a discoverable, use-case-driven navigation system.

---

## When to Use

- Documentation has grown beyond 20+ items and users report "can't find anything"
- README or index is just a long list with no situational guidance
- Users ask "which one should I use?" frequently
- Documentation is organized by category, but users think in terms of problems/tasks
- New users feel overwhelmed by the scope of available resources

**Don't use when:**
- Documentation is small (< 10 items) and easily scannable
- Users already navigate effectively via search
- The content is linear (a guide, not a reference library)

---

## Core Concept

**The Navigation Hierarchy:**

```
Level 1: Quick Jump Links (immediate orientation)
    ↓
Level 2: Use-Case Scenarios ("I need to...")
    ↓
Level 3: Category Browsing (traditional organization)
    ↓
Level 4: Reference Tables (quick comparison)
```

**Key Insight:** Users don't browse documentation alphabetically or by category. They arrive with a problem: "I need to debug something" or "I need to make a decision." Navigation should answer: "What are you trying to do?"

---

## The Navigation System Architecture

### Component 1: Quick Navigation Bar (Level 1)

Place at the very top. Immediate orientation without scrolling.

```markdown
## 📚 Quick Navigation

**[Find by Use Case](#find-by-use-case)** — I need a resource for...
- [Debugging / Problem Solving](#debugging--problem-solving)
- [Code Review / Quality](#code-review--quality)
- [Architecture / Design Decisions](#architecture--design-decisions)
- [Documentation / Communication](#documentation--communication)
- [Planning / Estimation](#planning--estimation)
- [Learning / Understanding](#learning--understanding)
- [Multi-Agent / Coordination](#multi-agent--coordination)
- [Risk / Safety Analysis](#risk--safety-analysis)

**[Browse by Category](#browse-by-category)**
- [🔧 Execution](#execution) — Problem-solving protocols
- [🧭 Judgment & Routing](#judgment--routing) — Decision-making frameworks
- [🎛️ Orchestration](#orchestration) — Workflow control
- [✅ Output Quality](#output-quality) — Self-improvement

**[Quick Reference Tables](#quick-reference-tables)**
- [All Protocol Skills](#all-protocol-skills) — State-machine enforced
- [All Framework Skills](#all-framework-skills) — Conceptual lenses
- [Recently Added](#recently-added) — Newest resources
```

**Principles:**
- Use emoji icons for visual scanning
- Keep to 5-8 use-case categories (cognitive limit)
- Every link is a jump link to that section
- Group by user intent, not content type

---

### Component 2: Find by Use Case (Level 2)

The heart of the system. Scenario-driven tables that map situations to resources.

```markdown
## Find by Use Case

**"I need a resource for..."**

### Debugging / Problem Solving

| Situation | Best Resource | Why |
|-----------|---------------|-----|
| Hard bug, don't know where to start | [how-to-solve-it](#link) | Forces problem framing |
| Multiple possible causes | [abductive-debugging](#link) | Generates competing hypotheses |
| Stuck in a rut, repeating failures | [cross-domain-analogy](#link) | Breaks fixation |
| Over-thinking trivial issues | [cognitive-friction](#link) | Budgets deliberation |

### Architecture / Design Decisions

| Situation | Best Resource | Why |
|-----------|---------------|-----|
| Big decision, multiple options | [counterfactual-testing](#link) | Tests alternatives |
| Trade-offs between systems | [team-topologies](#link) | Org architecture patterns |
| Not sure what kind of problem | [problem-mode-router](#link) | Classifies domain |
```

**Building the Tables:**

1. **Identify user scenarios** (not content categories)
   - Ask: "What are users trying to accomplish?"
   - Group into 5-8 high-level scenarios
   - Examples: Debugging, Reviewing, Deciding, Learning, Planning

2. **For each scenario, identify situations**
   - Specific moments of need
   - Lead with the pain point: "Hard bug...", "Big decision..."
   - Keep to 4-6 situations per scenario

3. **Map to resources with rationale**
   - Resource name (linked)
   - One-line "why" — the value proposition
   - Be honest about trade-offs

4. **Link everything**
   - Every resource name links to its full description
   - Scenario headers link to that section
   - Enables rapid navigation

---

### Component 3: Browse by Category (Level 3)

Traditional organization for users who prefer categorical browsing.

```markdown
## 🔧 Execution — Problem-Solving Protocols

Skills for executing technical work in a bounded, disciplined way.

### `execution/how-to-solve-it-state-machine` · [protocol]
**What it is:** A disciplined problem-solving protocol...

**Use it when:** The task is hard, uncertain...

**Best for:** Debugging, algorithmic reasoning...

---

### `execution/ooda-loop-state-machine` · [protocol]
**What it is:** Observe-Orient-Decide-Act cycle...
```

**Principles:**
- Keep category descriptions short
- Use consistent formatting (name, type, what, when, best for)
- Visual separator (---) between items
- Tag with [protocol] or [framework] for quick scanning

---

### Component 4: Quick Reference Tables (Level 4)

Dense, scannable tables for power users who know what they're looking for.

```markdown
## Quick Reference Tables

### All Protocol Skills (State Machine)

| Skill | Location | Best For |
|-------|----------|----------|
| how-to-solve-it-state-machine | execution/ | Hard problems, debugging |
| ooda-loop-state-machine | execution/ | Fast-changing situations |
| refactoring-state-machine | execution/ | Code restructuring |
| thoroughness-check-etto | judgment/ | Setting rigor level |

### All Framework Skills (Conceptual)

| Skill | Location | Best For |
|-------|----------|----------|
| first-principles | judgment/ | Deconstruction |
| second-order-thinking | judgment/ | Consequence analysis |
| tree-of-thoughts | output/ | Branching exploration |

### Recently Added

| Skill | Date | Key Technique |
|-------|------|---------------|
| documentation-craft | 2025-04 | 5-phase structured writing |
| counterfactual-testing | 2025-04 | Null/opposite/partial alternatives |
```

**Table Types:**

1. **By Type** — Separate protocol vs framework
2. **Alphabetical** — All items, quick scan
3. **By Date** — Recently added, changelog-style
4. **By Popularity** — Most-used (if you have metrics)

---

## Implementation Workflow

### Phase 1: Audit Current State

```yaml
audit:
  current_structure:
    type: "flat_list|categories|mixed"
    item_count: 70
    user_complaints:
      - "can't find what I need"
      - "which one should I use?"
      - "overwhelming"
  
  content_analysis:
    item_types: [protocol, framework, tool, guide]
    topic_areas: [execution, judgment, orchestration, output]
    
  user_research:
    common_tasks:
      - "debugging hard problems"
      - "making architecture decisions"
      - "writing documentation"
      - "estimating work"
```

**Exit condition:** Understand current pain points and user tasks.

---

### Phase 2: Design Use-Case Categories

```yaml
use_case_design:
  # Generate 10-15 candidate categories
  candidates:
    - debugging
    - code_review
    - architecture_decisions
    - documentation
    - planning
    - learning
    - coordination
    - safety_analysis
  
  # Group into 5-8 high-level scenarios
  grouped_scenarios:
    debugging_problem_solving:
      - debugging
      - troubleshooting
      - root_cause_analysis
    
    architecture_design:
      - architecture_decisions
      - system_design
      - trade_off_analysis
  
  # Validate with user language
  final_categories:
    - "Debugging / Problem Solving"
    - "Architecture / Design Decisions"
    - "Documentation / Communication"
    - "Planning / Estimation"
    - "Learning / Understanding"
    - "Multi-Agent / Coordination"
    - "Risk / Safety Analysis"
```

**Exit condition:** 5-8 categories that match user mental models.

---

### Phase 3: Build Use-Case Tables

```yaml
table_construction:
  for_each_category:
    - identify_situations: "specific pain points"
    - map_resources: "which resource helps this situation"
    - write_rationale: "why this resource fits"
    - add_links: "every resource name links to details"
  
  quality_check:
    - each_situation_specific: true
    - each_rationale_concise: true
    - all_links_work: true
    - no_category_over_6_situations: true
```

**Exit condition:** All tables built with working links.

---

### Phase 4: Build Reference Tables

```yaml
reference_tables:
  protocol_table:
    columns: [skill_name, location, best_for]
    sort: alphabetical
    count: 29
    
  framework_table:
    columns: [skill_name, location, best_for]
    sort: alphabetical
    count: 31
    
  recently_added:
    columns: [skill_name, date, key_technique]
    sort: date_descending
    count: 11
```

**Exit condition:** All reference tables complete.

---

### Phase 5: Assemble and Validate

```yaml
assembly:
  order:
    1: quick_navigation_bar
    2: find_by_use_case
    3: browse_by_category
    4: quick_reference_tables
  
  validation:
    - all_jump_links_work: true
    - no_broken_anchors: true
    - visual_hierarchy_clear: true
    - mobile_readable: true
```

**Exit condition:** Navigation system live and tested.

---

## Anti-Patterns

**Don't:**
- Create more than 8 use-case categories (cognitive overload)
- List resources without explaining when to use them
- Use only one navigation method (users differ)
- Make tables so wide they require horizontal scrolling
- Forget to update all tables when adding new items

**Do:**
- Lead with use cases, not content types
- Keep rationale lines under 10 words
- Use consistent formatting across tables
- Test all links after every edit
- Update "Recently Added" when adding content

---

## Example: Before and After

### Before (Flat List - Hard to Navigate)

```markdown
# Skills

- how-to-solve-it-state-machine.md
- ooda-loop-state-machine.md
- refactoring-state-machine.md
- ... (70 more items)
```

**User experience:** "I need to debug something... scrolls through 70 items... gives up"

### After (Use-Case Navigation - Easy to Find)

```markdown
## 📚 Quick Navigation

**[Find by Use Case](#find-by-use-case)** — I need a skill for...
- [Debugging / Problem Solving](#debugging--problem-solving)
- [Architecture / Design Decisions](#architecture--design-decisions)
...

## Find by Use Case

### Debugging / Problem Solving

| Situation | Best Skill | Why |
|-----------|------------|-----|
| Hard bug, don't know where to start | [how-to-solve-it](#link) | Forces problem framing |
...
```

**User experience:** "I need to debug → clicks Debugging → finds exact situation → clicks skill"

---

## Integration

- Use **after** `compression-as-understanding` to ensure navigation captures essence
- Use **with** `documentation-craft` when writing the navigation content
- Use **before** adding new content (plan navigation structure first)

---

## See Also

- Information architecture principles
- User-centered design
- Cognitive load theory (5±2 items)
- This skill was developed during the Jerry's Agent Skills README reorganization (April 2025)
