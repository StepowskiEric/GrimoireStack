# Everything-as-Code — Patterns, Examples & Integration

## Codification patterns

### State machines
Good for processes with clear states.

```pseudocode
state Machine {
  Idle -> Running: on start
  Running -> Success: on complete
  Running -> Failed: on error  // Is this defined?
  Failed -> Running: on retry  // How many retries?
}
```

### Function contracts
Good for interfaces, APIs, responsibilities.

```pseudocode
function X(input: T): Result {
  requires: /* preconditions */
  ensures: /* postconditions */
  throws: /* error cases */
}
```

### Data flow
Good for information moving through systems.

```pseudocode
source A -> transform B -> sink C
// Where does it fail? Where is it transformed?
// What if B is down?
```

### Decision trees
Good for complex decision processes.

```pseudocode
if (condition) {
  // What if this branch is wrong?
} else {
  // Is this exhaustive?
}
```

## Worked example: code review process

```pseudocode
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

Refactor: add a 2-day review deadline, reassign when the reviewer is busy, schedule conflict resolution, escalate to tech-lead instead of complaining.

## Worked example: team communication

**Problem:** "Our team keeps missing important updates"

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

Insight: the system has no "receipt" concept — three distinct failure modes. Refactor: add an acknowledgment requirement, escalation path, and "must see" flag.

## Worked example: unclear product requirements

**Requirement:** "Users should be able to easily manage their subscriptions"

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

Insights: "easily" carries the whole requirement; multiple undefined states; missing features become obvious once the code exists.

## Worked example: deployment pipeline

**Problem:** "Deployments are flaky"

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

Insights: no canary, no health verification, blast radius 100% — "flaky" is actually "unsafe."

## Integration

- Use **before** writing real specs to surface requirements gaps
- Use **after** `specter` to codify the winning hypothesis
- Use **with** `metacognitive-monitoring` to assess confidence in the model
- See also `domain-driven-design` for modeling domains

## Source

Paper: "Understanding Everything as Code: A Taxonomy and Conceptual Model" (arXiv:2507.05100); the Infrastructure-as-Code / Configuration-as-Code movements.
