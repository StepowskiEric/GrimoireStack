# Skill: Everything-as-Code Conceptualizer

## Purpose

View any system, process, or problem through a "code lens" — treating it as if it were a program. The act of "codifying" reveals hidden structure, assumptions, and edge cases that natural language descriptions obscure.

Based on the "Everything as Code" (EaC) paradigm and the paper "Understanding Everything as Code: A Taxonomy and Conceptual Model" (arXiv:2507.05100).

---

## When to Use

- Messy human/process problems that resist structured analysis
- When you need to surface hidden assumptions
- Team dynamics, workflow issues, unclear requirements
- Any situation where "if only we had clear specs" is said
- Before writing actual code for ambiguous requirements

**Don't use when:**
- Problem is already well-specified
- You're ready to write actual code
- Human/emotional factors dominate (use different skill)

---

## Core Concept

The EaC paradigm says: infrastructure, config, docs, tests, processes — all should be "codified." This skill applies that lens to problems that aren't obviously code:

| Domain | Natural Language | As Code |
|--------|------------------|---------|
| Team conflict | "We don't communicate well" | `function communicate() { if (busy) return ignore; }` |
| Unclear requirements | "The user wants it fast" | `const requirement = { speed: undefined, fast: relative }` |
| Deployment issues | "Sometimes it fails" | `deploy().catch(e => retry(3)).catch(e => alert)` |
| Knowledge gaps | "Only Sarah knows this" | `knowledge.owner = 'Sarah'; // Single point of failure` |

**The insight:** Code forces precision. If you can't write it as code, you don't fully understand it.

---

## Framework (Not Protocol)

This is a **conceptual lens**, not a rigid protocol. Apply it flexibly:

### Step 1: Identify the System

What are you trying to understand?
- A team process?
- A user workflow?
- A deployment pipeline?
- A decision-making process?

### Step 2: Codify the Structure

Write pseudocode representing the system:

```pseudocode
// Example: Code review process as code
function submitPR(code, author) {
  const pr = createPR(code, author);
  pr.reviewers = selectReviewers(code.files);
  pr.status = 'pending_review';
  return pr;
}

function reviewPR(pr, reviewer) {
  if (reviewer.busy) {
    // BUG: No timeout, PR can stall forever
    return defer(pr);
  }
  
  const feedback = analyze(code);
  
  if (feedback.conflicts.length > 0) {
    // BUG: No resolution mechanism defined
    return requestChanges(pr, feedback);
  }
  
  return approve(pr);
}

// Main loop
while (project.active) {
  const prs = getOpenPRs();
  
  for (pr in prs) {
    if (pr.age > 3 days && pr.status == 'pending_review') {
      // BUG: No escalation, just suffering
      emit(Complaint);
    }
  }
}
```

### Step 3: Identify Bugs in the Process

The pseudocode reveals:
- **Missing error handling:** No timeout on reviewer assignment
- **Undefined behavior:** How are conflicts resolved?
- **Infinite loops:** Complaints without action
- **Implicit state:** Who decides reviewers?

### Step 4: Refactor

```pseudocode
// Refactored with fixes
function reviewPR(pr, reviewer) {
  const deadline = now() + 2 days;  // FIX: Timeout
  
  if (reviewer.busy) {
    reassign(pr, findAlternativeReviewer());
    return;
  }
  
  const feedback = analyze(code);
  
  if (feedback.conflicts.length > 0) {
    const resolution = scheduleConflictResolution(pr, feedback.conflicts);  // FIX: Mechanism
    return resolution;
  }
  
  return approve(pr);
}

// FIX: Escalation instead of complaints
if (pr.age > 3 days) {
  escalate(pr, to: 'tech-lead');
}
```

### Step 5: Extract Insights

What did codification reveal?
- Implicit assumptions now explicit
- Edge cases surfaced
- Missing decisions highlighted
- Refactoring opportunities clear

---

## Example Applications

### Example 1: Team Communication Issues

**Problem:** "Our team keeps missing important updates"

**Codified:**
```pseudocode
function sendUpdate(sender, message, channel) {
  channel.post(message);
  
  // BUG: No acknowledgment tracking
  return 'sent';  // But was it seen?
}

function receiveUpdate(user, channel) {
  if (user.channels.includes(channel)) {
    if (user.focus == 'deep_work') {
      // BUG: Notification suppressed, no retry
      return bufferForLater();
    }
    return notify(user, message);
  }
  // BUG: User not in channel — silent failure
  return null;
}

// Result: Updates lost in 3 different ways
```

**Insight:** The system has no "receipt" concept. Three different failure modes.

**Refactor:** Add acknowledgment requirement, escalation path, and "must see" flag.

---

### Example 2: Unclear Product Requirements

**Requirement:** "Users should be able to easily manage their subscriptions"

**Codified:**
```pseudocode
function manageSubscription(user, action) {
  const subscription = user.subscriptions.find(s => s.active);
  // BUG: What if multiple? What if none?
  
  if (action == 'cancel') {
    subscription.status = 'cancelling';
    // BUG: When does it actually cancel? End of period? Immediately?
    // BUG: What about partial refunds?
    // BUG: Can they reactivate?
  }
  
  if (action == 'upgrade') {
    const newPlan = selectPlan();  // BUG: How is this selected?
    // BUG: Proration? Feature migration?
  }
  
  // BUG: No 'pause' option despite users asking
  // BUG: No 'switch payment method' option
}
```

**Insights:**
- "Easily" is doing a lot of heavy lifting
- Multiple undefined states
- Missing features that are obviously needed once you see the code

---

### Example 3: Deployment Pipeline

**Problem:** "Deployments are flaky"

**Codified:**
```pseudocode
function deploy(service, version) {
  const instances = getInstances(service);
  
  for (instance in instances) {
    instance.deploy(version);
    // BUG: No health check before proceeding
    // BUG: No rollback on failure
  }
  
  // BUG: All instances updated simultaneously
  // BUG: No traffic draining
  return 'deployed';  // Maybe?
}
```

**Insights:**
- No canary deployment
- No health verification
- Blast radius is 100%
- "Flaky" is actually "unsafe"

---

## Codification Patterns

### Pattern 1: State Machines

Good for: Processes with clear states

```pseudocode
state Machine {
  Idle -> Running: on start
  Running -> Success: on complete
  Running -> Failed: on error  // Is this defined?
  Failed -> Running: on retry  // How many retries?
}
```

### Pattern 2: Function Contracts

Good for: Interfaces, APIs, responsibilities

```pseudocode
function X(input: T): Result {
  requires: /* preconditions */
  ensures: /* postconditions */
  throws: /* error cases */
}
```

### Pattern 3: Data Flow

Good for: Information moving through systems

```pseudocode
source A -> transform B -> sink C
// Where does it fail? Where is it transformed?
// What if B is down?
```

### Pattern 4: Decision Trees

Good for: Complex decision processes

```pseudocode
if (condition) {
  // What if this branch is wrong?
} else {
  // Is this exhaustive?
}
```

---

## Anti-Patterns

**Don't:**
- Write actual executable code (keep it pseudocode)
- Get lost in syntax details
- Force-fit non-computational problems
- Ignore the human/emotional layer entirely

**Do:**
- Use pseudocode to reveal structure, not implement
- Focus on what's *missing* or *undefined*
- Look for implicit assumptions
- Surface edge cases

---

## Integration

- Use **before** writing real specs to surface requirements gaps
- Use **after** `specter` to codify the winning hypothesis
- Use **with** `metacognitive-monitoring` to assess confidence in the model

---

## See Also

- Paper: "Understanding Everything as Code: A Taxonomy and Conceptual Model" (arXiv:2507.05100)
- Infrastructure-as-Code, Configuration-as-Code movements
- `domain-driven-design` — for modeling domains
