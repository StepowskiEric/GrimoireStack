# Skill: Speculative Exploration Protocol for AI Agents

## Purpose

Fuses Speculative Drafting and Verification, Tree of Thoughts (ToT), and Process Reward Model (PRM) into one sequential reasoning protocol. Branch into N candidate paths, score with PRM rewards, prune low-reward branches, then verify the best candidate against hard constraints. Prevents first-branch lock-in, silent reasoning degradation, and premature convergence simultaneously.

The combined protocol works as follows: Branch into N candidate paths (ToT-style), score each path using PRM process rewards at intermediate checkpoints, prune low-reward branches early, then verify the surviving best candidate against hard constraints before committing.

This prevents three failure modes simultaneously: first-branch lock-in (ToT), silent reasoning degradation (PRM), and premature convergence on suboptimal solutions (Speculative Drafting).

## When to Use

Use this protocol when:

- Problem has multiple plausible solution strategies and wrong early commitment is costly
- Previous reasoning passes produced correct-looking but flawed conclusions
- The task requires multi-step reasoning where early errors cascade downstream
- You need to balance exploration breadth (ToT) with step-quality tracking (PRM) and constraint satisfaction (Speculative Drafting)
- Correctness matters more than speed

Do not use when:

- The correct approach is obvious and well-established
- Speed is critical and exploration cost is prohibitive
- The task is purely generative with no correctness criterion

---

## Protocol

### Phase 1: BRANCH — Generate N Candidate Paths

Generate multiple qualitatively distinct solution approaches before developing any single one.

1. Analyze the problem for multiple solution paths. Identify key decision points where approaches diverge.
2. Generate N branches (N=3 default, max 5). Each branch must be a genuinely different strategy — not variations of the same idea.
3. For each branch, draft first moves and an intermediate checkpoint description: what does "making progress" look like for this approach?
4. Record each branch's key insight, potential advantages, and potential risks.

**Branch Template:**
```
Branch 1: [Approach name]
- Strategy: [how this approaches the problem]
- First moves: [step 1, step 2]
- Checkpoint criteria: [what good progress looks like]
- Key advantage: [...]
- Key risk: [...]

Branch 2: [Different approach]
(same structure)

Branch 3: [Another approach]
(same structure)
```

**Exit criterion:** All N branches drafted with checkpoint criteria defined. Proceed to Phase 2.

---

### Phase 2: SCORE — PRM Reward Each Branch

Evaluate each branch at intermediate checkpoints using process reward scoring. Do NOT develop branches to completion yet — only to the checkpoint.

1. For each branch, develop reasoning steps until the intermediate checkpoint is reached.
2. At the checkpoint, score each step using process reward criteria:
   - **Correctness** (0.4 weight): logically sound, no errors
   - **Clarity** (0.2 weight): reasoning is clear and unambiguous
   - **Progress** (0.3 weight): meaningful advance toward solution goal
   - **Efficiency** (0.1 weight): not taking unnecessary detours
3. Calculate per-step reward: `step_reward = (correctness × 0.4) + (clarity × 0.2) + (progress × 0.3) + (efficiency × 0.1)`
4. Calculate cumulative branch reward using decay: `cumulative = (decay × prev_cumulative) + step_reward` (decay=0.9)
5. Record the full reward trajectory for each branch.

**Scoring Template:**
```
Branch X at checkpoint:
  Step 1: correctness=0.9 clarity=0.8 progress=0.85 efficiency=0.9 → reward=0.87
  Step 2: correctness=0.7 clarity=0.7 progress=0.6 efficiency=0.8 → reward=0.69
  Cumulative reward: 0.82
  Reward trend: DECLINING
```

**Exit criterion:** All branches scored at checkpoint with cumulative rewards calculated. Proceed to Phase 3.

---

### Phase 3: PRUNE — Cut Low-Reward Branches

Eliminate branches that are unlikely to produce good solutions.

1. Rank branches by cumulative reward at checkpoint.
2. Apply pruning rules:
   - **Hard prune:** Any branch where any step scored below 0.4 on correctness → immediate elimination
   - **Soft prune:** Any branch with cumulative reward below 0.55 → eliminate
   - **Trend prune:** Any branch with declining reward across 2+ consecutive steps → eliminate unless it is the highest-ranked remaining branch
3. If all branches are pruned, return to Phase 1 with new approaches informed by what failed.
4. If only one branch survives, proceed to Phase 2 deeper development (extend checkpoint), then to Phase 4.
5. If 2+ branches survive, continue developing all surviving branches to next checkpoint, re-score, re-prune. Repeat until one branch clearly dominates OR two remain and are within 0.05 of each other.

**Pruning Decision:**
```
Branch 1: cumulative=0.82, trend=stable    → SURVIVE
Branch 2: cumulative=0.51, trend=declining → PRUNE (cumulative < 0.55 + declining)
Branch 3: cumulative=0.78, trend=stable    → SURVIVE
```

**Exit criterion:** One clear winning branch identified. Proceed to Phase 4.

---

### Phase 4: VERIFY — Validate Best Against Hard Constraints

Apply full constraint verification to the winning branch. This is the Speculative Drafting verification step — hard pass/fail checks, not soft scoring.

1. Define hard verification criteria upfront (must satisfy ALL):
   - Constraint satisfaction: does it meet all stated requirements?
   - Correctness: are there logical errors, edge cases, or invalid assumptions?
   - Completeness: does it address the full problem scope?
   - Robustness: does it handle failure modes and edge cases?
2. Run each criterion as a pass/fail check with evidence.
3. If any criterion FAILS:
   - Identify the specific failing step(s)
   - Backtrack to Phase 2 at that step (PRM backtracking)
   - Revise the step, re-score, and re-verify
   - Maximum 3 backtrack-and-revise cycles before abandoning branch
4. If all criteria PASS:
   - Commit the solution
   - Document selection rationale: why this branch beat alternatives
   - Record rejected branches with reasons

**Verification Template:**
```
VERIFICATION: Branch 1 (winner)

Constraint satisfaction: PASS
- Evidence: [specific check]

Correctness: PASS
- Evidence: [specific check]

Completeness: PASS
- Evidence: [specific check]

Robustness: PASS
- Evidence: [specific check]

Overall: ACCEPTABLE
Backtrack cycles used: 1 (step 3 revised for correctness)
```

**Exit criterion:** All hard constraints PASS. Solution committed.

---

## Anti-Patterns

1. **Branching without genuine diversity** — Generating 3 branches that are the same idea reworded. Each branch must be a qualitatively different strategy.

2. **Skipping intermediate checkpoints** — Developing branches all the way to completion before comparing. This wastes computation on branches that should have been pruned early.

3. **Reward hacking** — Inflating self-assigned PRM scores to avoid backtracking. Be honest in step-level assessment. Low scores are signals, not failures.

4. **Over-pruning** — Setting thresholds too aggressively (e.g., requiring 0.8 cumulative to survive). This collapses exploration back to single-path reasoning.

5. **Over-backtracking** — Revising steps endlessly when PRM score dips. Set max backtrack cycles (3). If a branch can't recover, abandon it.

6. **Verification theater** — Running Phase 4 verification but accepting everything. Hard constraints are pass/fail — "mostly good" is a fail.

7. **False branch comparison** — Comparing branches at different development depths. All branches must reach the same checkpoint before scoring.

8. **Ignoring reward trends** — A branch with good cumulative reward but declining trend is likely heading toward failure. Weight trend in decisions.

9. **Skipping verification because scoring looked good** — PRM scoring is soft estimation. Phase 4 hard verification catches things scoring missed.

---

## Exit Criteria

The protocol is complete when:

1. At least 2 branches were genuinely explored (not just named)
2. Each branch was scored at an intermediate checkpoint using PRM criteria
3. Weak branches were pruned with explicit reasoning
4. The winning branch passed all hard constraint checks in Phase 4
5. Selection rationale documents why the winner beat alternatives
6. If backtracking occurred, the revision history is recorded

The final output includes:
- The committed solution
- Branch exploration summary (N branches, scores, which survived)
- PRM reward trajectory for the winning branch
- Verification results (pass/fail per criterion)
- Rejected alternatives with reasons
