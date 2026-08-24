# Skill Eval Memo — assumption-grounding & calibration batch (2026-08-24)

Instrument: skills/testing/skill-ab-evaluation (paired blind trials, rubric scoring,
trap-fall metrics), run by DeepSeek V4 Flash (mid tier) and Step 3.7 Flash (low tier).

## Decision
KEEP `assumption-grounding` — conditionally: it earns its place for mid-tier agents
working in sparse or unfamiliar repos. It is not universal scaffolding.

## Evidence

### Synthetic fixture (phantom-path trap), DeepSeek V4 Flash, 5v5
| metric | skill | baseline |
|---|---|---|
| flagged the false paths | 5/5 | 3/5 |
| fabricated phantom registry.py | 0/5 | 1/5 |
| used the real registry | 5/5 | 4/5 |

### Real-repo confirmation pair (psf/requests checkout), DeepSeek V4 Flash
Both conditions PASSED the trap unaided: each discovered retry.py does not exist,
found urllib3.Retry via HTTPAdapter, implemented get_with_retries correctly, and
documented the adaptation. In well-indexed real repos, baseline verification is
already strong — one search settles ground truth.

### Two-tier check (Step 3.7 Flash, synthetic fixture, N=2 per condition)
ALL FOUR runners fell in the trap (fabricated pipeline/registry.py, zero deviation
flags). Loading the skill changed nothing at this tier: below a capability floor,
verify-before-act does not take hold even when scaffolded.

## Calibration nulls (baseline probes never fell the trap)
- recency-grounding fixture: 0/3 fell stale-API trap (guide hint leaked; model knows pydantic v2).
- bounded-self-revision fixture: 0/3 exceeded budget or looped.
- step-level-verification fixture: 0/3 failed the 5-part cascade.
No headroom measurable at mid tier -> these three fall back to audit judgment:
merge (recency -> api-surface-anchoring; bounded-self-revision stop-rules ->
self-verify-pipeline); retire step-level-verification-protocol.

## Limitations
- Tier-2 sample is N=2 per condition; suggestive, not definitive.
- Synthetic fixtures make verification artificially cheap -> likely UNDERSTATE the
  skill's value in large repos; bias is conservative (favors retirement).
- Single task per skill; effects may vary across task types.

## Round 2 (2026-08-24, later)

### test-driven-development — DeepSeek V4 Flash, 1v1 pair
NULL RESULT: both conditions scored 10/10 on a hidden 10-case edge battery;
baseline wrote tests unprompted. No measurable effect for well-specified pure functions.
Disposition: DELETE from catalog (duplicates the user-level `tdd` skill; adds nothing).

### steelmanning — Stepfun Step 3.7 Flash, 1v1 pair, blind judge
WIN: skill condition (A) beat baseline (B) 9/9/9 vs 7/8/9 under a blind judge.
Cited gap: B's steelman praised what its own critique later condemned (self-
undermining verdict); A constructed genuine rebuttals to all three proposal landmines,
then issued conditional adoption with Phase-0 preconditions.
Notable: first judgment-skill win, and it appeared on the LOWER tier — inverse of
assumption-grounding (which helped mid-tier only). Discipline skills for reasoning/
review appear more model-portable than verification scaffolds.
Disposition: KEEP as a full skill (upgrade from WEAK/merge).

### api-design-backward-compatibility — DeepSeek V4 Flash, 1v1 pair
OUTCOME NULL, PROCESS WIN: both conditions passed every consumer (incl. the
3-positional silent-corruption trap), correct surcharge math, clean rename.
The skill condition went further: kept legacy `amount=` as a DeprecationWarning
alias, migrated internal consumers to the new name, added 6 compat/surcharge tests.
This is the expected shape — the skill does not change whether the task succeeds,
it changes the quality margin of how. At DeepSeek tier the baseline already clears
the bar; value would only appear with weaker runners or stricter review gates.
Disposition per audit: WEAK -> trim to its merge-time compatibility checklist,
fold into api-surface-anchoring's references.

### Round 4 (2026-08-24): critical-system-interrogation + separation-of-concerns

#### critical-system-interrogation — DeepSeek V4 Flash, 1v1
DETECTION TIE on 5 planted flaws (skill 4/5, baseline 5/5 — baseline caught the
currency gap the skill missed). Skill edge was process shape only: reproduced each
finding against live code (race demo 60/200), issued explicit DO-NOT-DEPLOY gate.
Disposition: DELETE standalone; salvage two rules during merges:
- verdict/approval-bar format -> review-ladder-plus
- reproduce-every-finding-before-reporting -> llm-pre-push-review

#### separation-of-concerns — Stepfun Step 3.7 Flash, heisenbug fixture, 1v1
FULL NULL. Both conditions overwrote the diagnostic debug.log before extracting
the clue (trap fired identically), both still root-caused correctly from the moved
poison payload, and both produced working fixes. Loading the skill changed nothing.
Disposition: DELETE (matches audit WEAK).

## Campaign-level pattern (updated)
Mechanical-change skills (TDD, backward-compat) ceiling at mid tier. Verification
scaffolds help mid-tier only (assumption-grounding), vanish below it. Reasoning-
discipline skills can help lower tiers (steelmanning). Review skills add shape,
not detection. Remaining evaluable: claim-verification-reasoning,
faithfulness-aware-reasoning, self-contradiction-trap, structured-feature-planning,
inversion, self-consistency, context-budget-operator, failure-analysis-protocol,
log-trace-correlation, root-cause-analysis, bisect-debugging.

### Round 5 (2026-08-24): structured-feature-planning + log-trace-correlation

#### structured-feature-planning — DeepSeek V4 Flash, 1v1
NULL on the core gate. Fixture: deliberately self-contradictory multi-currency brief.
Both conditions built working implementations (tests green, API compatible); NEITHER
explicitly flagged the brief's contradictions in its answer — the skill condition
resolved them as a polished "decision record" with a PLAN.jsonl artifact, but the
claimed ambiguity-surfacing gate never fired. Baseline matched outcomes with less ceremony.
Disposition: DELETE.

#### log-trace-correlation — Stepfun Step 3.7 Flash, 1v1
FULL NULL. Both conditions traced the empty-cell fault to datasource.py (past the
formatter traceback surface), preserved the dash-rendering contract, no swallow-fix.
Baseline was already perfect; skill indistinguishable.
Disposition: DELETE.

## Campaign pattern (final form)
8 skills evaluated across 5 rounds, 4 tiers/model combos:
- 1 KEEP (steelmanning — attention-direction for reasoning/review)
- 7 no measurable benefit at tested tiers (assumption-grounding rescued mid-tier
  only, retired by user call; TDD, critical-system-interrogation,
  separation-of-concerns, structured-feature-planning, log-trace-correlation full
  nulls; api-design-backward-compat outcome-null/process-margin)
Mid-tier baselines now handle mechanical change and single-cause debugging natively;
measured skill value concentrates in output-SHAPE disciplines for reasoning tasks.
Remaining unevaluated disputed skills are predominantly the same shape as proven
nulls -> batch-retire on audit judgment recommended over further per-skill evals.

### Round 6 (2026-08-24): first-principles + cognitive-load-operator

#### first-principles — DeepSeek V4 Flash, 1v1 (inherited-framing trap)
PARTIAL WIN (articulation only). Both built working caches; neither fixed the actual
latency source (N+1 tag queries). Skill condition named the N+1 as the real root
cause and reframed goal-vs-method ("Redis is the prescribed method, not the goal");
baseline followed the ticket verbatim. Attention-direction value, no outcome delta.
Disposition: KEEP, consistent with steelmanning-shaped skills.

#### cognitive-load-operator-state-machine — Stepfun Step 3.7 Flash, blind judge
WIN: skill artifact A scored 10/7/9 vs baseline B 9/9/8. Judge cited A's worked
attempt-by-attempt timelines, numeric scenario predictions, and per-scenario
on-call actions; cost was a garbled flowchart and the mandatory cognitive-load-map.md
side-artifact (ceremony, but did not degrade the main output).
Disposition: KEEP — first output-quality win; trim or make the map optional.

## Final campaign pattern
Judgment/attention-direction skills (steelmanning, first-principles,
cognitive-load-operator) show judge- or trace-verifiable wins.
Mechanical/verification/debugging/planning gates: nulls at every tier tested.

### Round 7 (2026-08-24): first-principles retest + api-surface-anchoring

#### first-principles RE-TEST — DeepSeek V4 Flash, outcome-coupled fixture
NULL — the round-6 partial win did NOT replicate under stakes. Fixture: ticket
premise was factually false (+tag emails already accepted); implementing it = validation
regression. BOTH conditions detected the false premise, refused the regression,
and shipped proper validation + regression tests instead. Baseline equally
frame-questioning when the framing would break something.
Disposition: DELETE (round-6 delta was articulation-only).

#### api-surface-anchoring — DeepSeek V4 Flash, vendored unconventional SDK
NULL: both conditions used defer_s/max_per_worker correctly on first write, no
conventional-signature fallbacks; both also found and fixed an incidental bug in
the vendored package. Small vendored SDKs are self-documenting at a glance.
Disposition: KEEP on audit judgment only (artifact+script+big-repo scope untested);
flagged as audit-keep/eval-null in the catalog metadata.

## CAMPAIGN FINAL — 12 skills evaluated
KEEP: steelmanning, cognitive-load-operator (judge wins); api-surface-anchoring (audit).
DELETE: assumption-grounding, test-driven-development, critical-system-interrogation,
separation-of-concerns, structured-feature-planning, log-trace-correlation,
first-principles (+11 batch-retired by audit).
Rule holds: attention-direction skills won only when graded on output shape;
outcome-level differences appeared exactly once (assumption-grounding, mid-tier)
and were retired by user call.

### Round 8 (2026-08-24): occams-razor + explore-vs-exploit-state-machine (audit-KEEPs)

#### occams-razor — DeepSeek V4 Flash, 1v1
NULL. Fixture baited over-engineering (persistence feature in a no-build static
project); BOTH conditions delivered the minimal solution (localStorage, single file,
no abstractions, syntax-clean). Baseline did not over-engineer.

#### explore-vs-exploit-state-machine — Stepfun Step 3.7 Flash, 1v1
NULL. Both picked `integrations` (correct: highest change rate + most rollbacks +
blocked dedicated team + narrow sync coupling) and both explicitly documented what
they stopped investigating (reporting = cost trap, notifications = 1-engineer team,
billing = dependency not extractable). No runaway exploration either side.

## Audit-KEEP calibration
Rounds 8 show audit-KEEP skills also null against flash-tier baselines on
well-posed tasks. The audit KEEPs therefore encode value for stronger agents,
messier real-world context, or multi-session work - NOT measurable lift over a
mid-tier model on synthetic tasks. Treat catalog as curated for capable agents;
per-skill A/B lift at flash tier is not a meaningful keep/retire criterion for
this remaining corpus.
