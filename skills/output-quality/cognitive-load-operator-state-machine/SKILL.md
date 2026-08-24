---
name: cognitive-load-operator-state-machine
description: "Inspect complexity and replace high-load structures with lower-load equivalents."
triggers:
  - Output risks dense overload
  - Need to make information easier to understand, retain, and act on
  - Explanations, plans, or workflows are too complex
disable-model-invocation: true
---

# Cognitive Load Operator — State Machine Protocol

**Purpose:** Reduce working memory required to use an output correctly. Not "be clear" — make understanding cheap.

---

## Core Law

Do not emit dense, tangled, high-branching output when a lower-load structure is possible. Inspect complexity before output, identify overload sources, choose a lower-load structure, verify it's actually easier to process.

---

## Mandatory Artifact

Create `cognitive-load-map.md` before final output. Required fields: Audience, Goal, Core Concepts, Active Working-Memory Risks (too many concepts, hidden dependencies, unstable naming, buried sequence, implicit state), Output Shape, Chunking Strategy, Simplification Moves.

---

## State Machine

**0 — Intake.** Identify audience, what they must be able to do, and output type (explanation / instruction / comparison / plan / decision support). **Exit:** audience + output type identified.

**1 — Complexity Scan.** Find overload: too many active concepts, long conditionals, hidden state changes, unstable vocabulary, buried order, mixed abstraction levels. **Exit:** risks documented in `cognitive-load-map.md`.

**2 — Structure Selection.** Choose lowest-load shape: overview+details, stepwise procedure, decision memo, option comparison, state machine, hierarchy, Q&A, timeline. Structure must reduce processing cost, not just look organized. **Exit:** shape + chunking strategy chosen.

**3 — State & Dependency Mapping.** Externalize what would otherwise live in the reader's head: state changes, sequence, prerequisites, branching points, dependencies, when caveats apply. **Exit:** state/dependency model documented.

**4 — Output Assembly.** Stable terminology, visible structure before detail, chunk related items, separate optional from core, reduce branch nesting, restate critical constraints locally. **Exit:** draft exists in chosen low-load structure.

**5 — Load Audit.** Self-check: how many concepts per section? Each section do one mental job? State transitions obvious? Most important info visible early? Language stable? If still mentally expensive, revise. **Exit:** answer materially easier to scan and use.

---

## Circuit Breakers

Restructure if: answer keeps growing in flat complexity, one section has too many branches, same concept renamed repeatedly, remote caveats required, explanation needs mental simulation over recognition.

---

## Failure Modes Prevented

Dense but correct outputs, unstable vocabulary, branch overload, buried sequence, hidden state, explanation spaghetti.

---

## Definition of Done

`cognitive-load-map.md` exists. Output shape is intentional. Working-memory risks identified and reduced. Sequence, state, dependencies explicit. Final answer cheaper to understand than unstructured alternative.

---

**Make understanding cheap.**
