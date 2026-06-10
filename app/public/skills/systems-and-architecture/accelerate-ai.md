# Skill: Accelerate for AI Delivery and Reliability Agents

## Purpose

Use this skill when the agent must improve engineering delivery, operational reliability, or team productivity using evidence rather than folklore.

This skill adapts research-oriented DevOps and software delivery ideas into an AI operating model:
- optimize flow, stability, and feedback together
- measure what matters
- prefer capability improvements over vanity activity
- reduce batch size and recovery time
- avoid cargo-cult process changes

This skill is useful for CI/CD, release engineering, quality strategy, platform work, incident response, and engineering productivity analysis.

---

## When to Use

Use this skill when:
- delivery is slow or painful
- deployments are risky
- incidents take too long to recover from
- teams argue about process without evidence
- the repo has weak feedback loops
- platform or DevEx work needs prioritization
- engineering leadership wants concrete improvement recommendations

---

## Core Rule

Do not confuse activity with performance.

The job is to improve delivery and reliability outcomes by strengthening the capabilities that drive them:
- fast, trustworthy feedback
- smaller safer changes
- reliable release flow
- recoverability
- good engineering hygiene
- manageable coupling
- observability that shortens diagnosis time

---

## Key Outcome Areas

This skill should reason about a few high-value outcomes:

- how often change can be delivered safely
- how long it takes to move from commit to production
- how often changes create incidents or require rollback
- how quickly the system recovers when something fails

These outcomes are more meaningful than “number of tickets closed” or “lines changed.”

---

## Capability Areas the Agent Should Evaluate

### 1) Build and test feedback
- CI duration
- flake rate
- serial bottlenecks
- failure clarity
- local reproducibility
- test selection strategy
- type/lint/test confidence

### 2) Deployment flow
- deployment friction
- manual approval bottlenecks
- environment drift
- release batching
- rollback difficulty
- canary or progressive delivery support

### 3) Operational resilience
- monitoring quality
- alert noise
- on-call diagnosis friction
- mean time to restore
- log/trace usefulness
- safe fallback paths

### 4) Architecture and coupling
- ability to change one service without many others
- dependency sprawl
- schema coordination pain
- hidden runtime coupling
- unsafe release dependencies

### 5) Team and workflow ergonomics
- review queue delays
- unclear ownership
- repetitive manual toil
- missing platform support
- weak developer environments

---

## Improvement Workflow

## Step 1: Choose the outcome to improve

Examples:
- reduce lead time
- reduce deployment pain
- reduce failed change rate
- reduce restore time
- improve CI trust

Do not start with “we should adopt tool X.”
Start with the delivery problem.

---

## Step 2: Measure the current state

Use real indicators:
- CI wall-clock time
- queue wait times
- deploy frequency
- rollback count
- incident recovery time
- flaky test percentage
- review latency
- time spent waiting for environments
- size of typical release batch
- failure diagnosis time

If no measurement exists, propose how to create it.

---

## Step 3: Identify limiting capabilities

Find the capabilities most responsible for poor outcomes.

Examples:
- one giant release batch creates risk
- flaky tests destroy trust in CI
- poor logs lengthen incident recovery
- missing ownership slows rollout decisions
- strong local coupling makes safe deploys hard
- manual steps create long lead time

---

## Step 4: Prefer system capability improvements

Recommended categories:
- faster deterministic CI feedback
- smaller change sets
- progressive delivery
- stronger observability
- clearer ownership
- rollback-friendly deploys
- less coordination-heavy architecture
- test strategy that matches risk
- automated guardrails instead of tribal reminders

Avoid “just work harder” or “do more meetings” solutions.

---

## Step 5: Validate with outcomes

Every recommendation should map to:
- which capability improves
- which delivery/reliability outcome should move
- how the team will know it worked

This prevents fashionable but low-leverage process churn.

---

## AI Failure Modes This Skill Prevents

### 1) Tool worship
The agent recommends a tool without identifying the capability gap.

Counter:
Start from delivery problem, not vendor.

### 2) Metric vanity
The agent optimizes easy-to-count numbers that do not improve flow or stability.

Counter:
Tie every metric to meaningful outcomes.

### 3) Batch-size blindness
The agent keeps proposing large risky changes.

Counter:
Prefer smaller, safer, more frequent changes.

### 4) Reliability vs speed false tradeoff
The agent treats speed and stability as enemies.

Counter:
Good delivery systems improve both through fast feedback and low-risk change.

### 5) Process maximalism
The agent adds ceremony instead of improving capability.

Counter:
Remove friction and waiting, do not create more.

---

## Best Uses for This Skill

- CI/CD improvement plans
- developer productivity analysis
- platform prioritization
- release engineering strategy
- observability and incident recovery improvements
- repo health audits
- productivity bottleneck diagnosis
- engineering effectiveness prompts

---

## Review Checklist

- What delivery or reliability outcome are we trying to improve?
- What is the current baseline?
- Which capability gap most explains the poor result?
- Does the recommendation shrink batch size, improve feedback, or shorten recovery?
- What evidence will show improvement?
- Is the proposal reducing toil or just relocating it?

---

## Definition of Done

A delivery-improvement task is done when:
- the outcome to improve is clear
- the current state was measured or bounded
- recommendations target capabilities, not buzzwords
- success metrics are explicit
- changes are likely to improve both flow and stability, not one at the expense of the other

---

## Prompt Snippets

### For CI/CD
“Evaluate our delivery system using capability-based thinking. Identify which capability gaps most hurt lead time, deploy safety, or recovery time.”

### For platform work
“Prioritize platform improvements by likely impact on feedback speed, change safety, and developer waiting time.”

### For observability
“Recommend changes that reduce diagnosis and restore time, not just data volume.”

### For productivity debates
“Ground recommendations in measurable delivery and reliability outcomes. Reject vanity metrics and process theater.”

---

## Final Instruction

Improve software delivery the way strong engineering organizations do:
by strengthening feedback, lowering risk, shortening recovery, and measuring real outcomes.
