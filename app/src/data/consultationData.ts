/**
 * consultationData.js — The Séance.
 *
 * Hand-curated data for the Consultation tab ("The Séance").
 * A consultation is a 1-sigil + 3-5 narrowing-question ritual that trades
 * Insight (narrower results) for Sanity (visual decay). At Sanity <= 2 the
 * question pool swaps to "darker" prompts; at Sanity 0 the result is the
 * "Beasthood" alternate of the chosen spell.
 *
 * Each sigil maps to a school. Each question is scoped to a school.
 * Each option has a `primary` skill (the most likely match) and an `alt`
 * (the second-best, surfaced as the alternate). The Beasthood ending
 * swaps the primary for the alt and re-renders with a corrupted visual.
 *
 * Skill ids are validated against grimoireIndex in tests. If a skill id
 * here ever stops resolving, `consultationData.test.js` will catch it.
 */

export const SEANCE_MAX_SANITY = 5;
export const SEANCE_MAX_QUESTIONS = 5;
export const SEANCE_CONVERGENCE_RUN = 2;
export const SEANCE_DARKNESS_THRESHOLD = 2; // Sanity <= this swaps to darker pool

// ── Sigils (Q1 — Domain Sigils) ───────────────────────

// ── Types ─────────────────────────────────────────────

export interface SeanceSigil {
  id: string;
  schoolId: string;
  crypticName: string;
  crypticLine: string;
  plainLabel: string;
}

export interface SeanceOption {
  id: string;
  label: string;
  sigilGlyph: string;
  primary: string;
  alt: string;
  reason: string;
}

export interface SeanceQuestion {
  id: string;
  question: string;
  clarification: string;
  options: SeanceOption[];
}

export interface SeanceQuestionPool {
  narrowing: SeanceQuestion[];
  darker: SeanceQuestion[];
}

export interface FoundOption {
  option: SeanceOption;
  question: SeanceQuestion;
  pool: 'narrowing' | 'darker';
}


export const SEANCE_SIGILS: SeanceSigil[] = [
  {
    id: 'sigil-remediation',
    schoolId: 'debugging',
    crypticName: 'The Beckoning Bell',
    crypticLine: 'It tolls for what is broken in the dark.',
    plainLabel: 'Fix bugs and diagnose failures',
  },
  {
    id: 'sigil-cognition',
    schoolId: 'reasoning',
    crypticName: 'The Cartomancer\u2019s Lantern',
    crypticLine: 'A light cast by the turning of cards.',
    plainLabel: 'Think through complex problems',
  },
  {
    id: 'sigil-crafting',
    schoolId: 'software-development',
    crypticName: 'The Forge\u2019s Anvil',
    crypticLine: 'Where the next spell is hammered into being.',
    plainLabel: 'Write, ship, and review code',
  },
  {
    id: 'sigil-architecture',
    schoolId: 'systems-and-architecture',
    crypticName: 'The Architect\u2019s Compass',
    crypticLine: 'The first drawing of lines across an empty world.',
    plainLabel: 'Design systems and make tradeoffs',
  },
  {
    id: 'sigil-measurement',
    schoolId: 'testing',
    crypticName: 'The Crucible\u2019s Eye',
    crypticLine: 'The all-seeing test that does not blink.',
    plainLabel: 'Write tests and verify quality',
  },
  {
    id: 'sigil-refinement',
    schoolId: 'output-quality',
    crypticName: 'The Mirror\u2019s Veil',
    crypticLine: 'The reflection truth demands before it speaks.',
    plainLabel: 'Polish docs, output, and communication',
  },
];

// ── Narrowing & Darker question pools per school ──────
//
// Each option: { id, label, sigilGlyph, primary, alt, reason }
//   - primary: the most likely matching skill id
//   - alt:     the second-best, surfaced as the Beasthood alternate
//   - reason:  a one-sentence eldritch justification
//


export const SEANCE_QUESTIONS: Record<string, SeanceQuestionPool> = {
  debugging: {
    narrowing: [
      {
        id: 'dbg-n1',
        question: 'When the wound is first found, what shape does it wear?',
        clarification: 'What do your symptoms look like?',
        options: [
          {
            id: 'dbg-n1-a',
            label: 'A clear trace, like a sigil in the dark',
            sigilGlyph: '\u2741',
            primary: 'debug-issue',
            alt: 'purify-test-output',
            reason: 'The trace itself is the data to act on.',
          },
          {
            id: 'dbg-n1-b',
            label: 'A silence, where sound should be',
            sigilGlyph: '\u25c7',
            primary: 'specter',
            alt: 'specter',
            reason: 'A ghost-hunt for what is missing.',
          },
          {
            id: 'dbg-n1-c',
            label: 'A wound that returns with each full moon',
            sigilGlyph: '\u263e',
            primary: 'specter',
            alt: 'specter',
            reason: 'Recurring wounds are symptom suppression.',
          },
          {
            id: 'dbg-n1-d',
            label: 'A chaos of contradicting voices',
            sigilGlyph: '\u2042',
            primary: 'specter',
            alt: 'specter',
            reason: 'Many plausible causes; the best one wins.',
          },
        ],
      },
      {
        id: 'dbg-n2',
        question: 'What does the test-oracle whisper?',
        clarification: 'What does your test output tell you?',
        options: [
          {
            id: 'dbg-n2-a',
            label: 'A failing test, plain to see',
            sigilGlyph: '\u2716',
            primary: 'minimal-reproduction',
            alt: 'debug-issue',
            reason: 'The smallest test that fails is the truth.',
          },
          {
            id: 'dbg-n2-b',
            label: 'A test that fails only in distant CI',
            sigilGlyph: '\u2697',
            primary: 'environment-recovery',
            alt: 'network-api-debugging',
            reason: 'The wound lives between the local and the far.',
          },
          {
            id: 'dbg-n2-c',
            label: 'A test that should exist, but does not',
            sigilGlyph: '\u2756',
            primary: 'minimal-reproduction',
            alt: 'purify-test-output',
            reason: 'No failing test is a wound un-named.',
          },
          {
            id: 'dbg-n2-d',
            label: 'A test of the test, the meta-ritual',
            sigilGlyph: '\u29c8',
            primary: 'verified-synthesize',
            alt: 'minimal-reproduction',
            reason: 'Provable correctness outranks hope.',
          },
        ],
      },
      {
        id: 'dbg-n3',
        question: 'How does the wound mend?',
        clarification: 'How do you prefer to fix bugs?',
        options: [
          {
            id: 'dbg-n3-a',
            label: 'By iteration, slow and patient',
            sigilGlyph: '\u221e',
            primary: 'debug-issue',
            alt: 'simulate-instrumentation',
            reason: 'Single-pass patching is unreliable.',
          },
          {
            id: 'dbg-n3-b',
            label: 'By binary search through the histories',
            sigilGlyph: '\u2693',
            primary: 'debug-to-fix-pipeline',
            alt: 'time-traveling-debugger',
            reason: 'O(log n) finds the change that broke it.',
          },
          {
            id: 'dbg-n3-c',
            label: 'By conjuring a familiar to tend the wound',
            sigilGlyph: '\u2698',
            primary: 'debug-subagent',
            alt: 'specter',
            reason: 'A dedicated debugger before any edit.',
          },
          {
            id: 'dbg-n3-d',
            label: 'By watching values as they pass',
            sigilGlyph: '\u25ce',
            primary: 'simulate-instrumentation',
            alt: 'debug-issue',
            reason: 'You cannot fix what you cannot see.',
          },
        ],
      },
      {
        id: 'dbg-n4',
        question: 'What power does the wound drink from?',
        clarification: 'What is the underlying cause?',
        options: [
          {
            id: 'dbg-n4-a',
            label: 'A missing dependency, gone to shadow',
            sigilGlyph: '\u2620',
            primary: 'environment-recovery',
            alt: 'api-surface-anchoring',
            reason: 'The spell cannot find what it summons.',
          },
          {
            id: 'dbg-n4-b',
            label: 'A web of CORS, tokens, and the unseen gate',
            sigilGlyph: '\u26d4',
            primary: 'network-api-debugging',
            alt: 'environment-recovery',
            reason: 'Everything between the code and the server.',
          },
          {
            id: 'dbg-n4-c',
            label: 'A spell no longer in the registry',
            sigilGlyph: '\u2625',
            primary: 'api-surface-anchoring',
            alt: 'environment-recovery',
            reason: 'The API moved; the spell did not.',
          },
          {
            id: 'dbg-n4-d',
            label: 'A regression, in the most recent commit',
            sigilGlyph: '\u21bb',
            primary: 'debug-to-fix-pipeline',
            alt: 'time-traveling-debugger',
            reason: 'It worked once. Find when it stopped.',
          },
        ],
      },
    ],
    darker: [
      {
        id: 'dbg-d1',
        question: 'When you stare into the wound, what stares back?',
        clarification: 'What is the deeper pattern?',
        options: [
          {
            id: 'dbg-d1-a',
            label: 'The first commit, still bleeding',
            sigilGlyph: '\u2620',
            primary: 'debug-to-fix-pipeline',
            alt: 'time-traveling-debugger',
            reason: 'The wound has a birthday.',
          },
          {
            id: 'dbg-d1-b',
            label: 'A recursive nightmare of causes',
            sigilGlyph: '\u221e',
            primary: 'specter',
            alt: 'specter',
            reason: 'Each cause has a cause.',
          },
          {
            id: 'dbg-d1-c',
            label: 'The many truths, all fighting for the throat',
            sigilGlyph: '\u2042',
            primary: 'specter',
            alt: 'specter',
            reason: 'Choose the explanation that covers the most.',
          },
          {
            id: 'dbg-d1-d',
            label: 'Your own reflection, fractured',
            sigilGlyph: '\u2756',
            primary: 'specter',
            alt: 'specter',
            reason: 'The wound is in the assumption.',
          },
        ],
      },
      {
        id: 'dbg-d2',
        question: 'What does the wound demand of you?',
        clarification: 'What approach does the situation need?',
        options: [
          {
            id: 'dbg-d2-a',
            label: 'Patience beyond reason',
            sigilGlyph: '\u29d6',
            primary: 'debug-issue',
            alt: 'simulate-instrumentation',
            reason: 'Many rounds of refinement.',
          },
          {
            id: 'dbg-d2-b',
            label: 'Surrender, and start the environment anew',
            sigilGlyph: '\u2625',
            primary: 'environment-recovery',
            alt: 'minimal-reproduction',
            reason: 'Sometimes the ground itself is corrupt.',
          },
          {
            id: 'dbg-d2-c',
            label: 'A pact with the silent subagent',
            sigilGlyph: '\u2698',
            primary: 'debug-subagent',
            alt: 'specter',
            reason: 'A dedicated familiar knows the wound.',
          },
          {
            id: 'dbg-d2-d',
            label: 'A ritual of trial, error, and time reversal',
            sigilGlyph: '\u21bb',
            primary: 'time-traveling-debugger',
            alt: 'debug-to-fix-pipeline',
            reason: 'Record forward, rewind to the divergence.',
          },
        ],
      },
    ],
  },

  reasoning: {
    narrowing: [
      {
        id: 'rsn-n1',
        question: 'When the problem first appears, what does it wear?',
        clarification: 'What kind of confusion are you dealing with?',
        options: [
          {
            id: 'rsn-n1-a',
            label: 'A mask of complexity',
            sigilGlyph: '\u2042',
            primary: 'occams-razor',
            alt: 'first-principles',
            reason: 'Simple explanations are more often right.',
          },
          {
            id: 'rsn-n1-b',
            label: 'A mask of received wisdom',
            sigilGlyph: '\u269c',
            primary: 'first-principles',
            alt: 'pre-flight-intent-verification',
            reason: 'Strip convention to the bare thing.',
          },
          {
            id: 'rsn-n1-c',
            label: 'A mask of false certainty',
            sigilGlyph: '\u2756',
            primary: 'reasoning-integrity-chain',
            alt: 'reasoning-integrity-chain',
            reason: 'Beliefs that contradict themselves are loud.',
          },
          {
            id: 'rsn-n1-d',
            label: 'A mask of impossibility',
            sigilGlyph: '\u2620',
            primary: 'pre-flight-intent-verification',
            alt: 'cross-domain-analogy-generator',
            reason: 'When all paths look blocked, reach across domains.',
          },
        ],
      },
      {
        id: 'rsn-n2',
        question: 'What is the shape of your confusion?',
        clarification: 'What is blocking clear thinking?',
        options: [
          {
            id: 'rsn-n2-a',
            label: 'Many paths, none chosen',
            sigilGlyph: '\u2042',
            primary: 'monte-carlo-tree-search',
            alt: 'tree-of-thoughts',
            reason: 'Allocate effort to branches that earn it.',
          },
          {
            id: 'rsn-n2-b',
            label: 'A wall of contradictions',
            sigilGlyph: '\u2756',
            primary: 'reasoning-integrity-chain',
            alt: 'reasoning-integrity-chain',
            reason: 'Surface the contradictions first.',
          },
          {
            id: 'rsn-n2-c',
            label: 'A fog of too much context',
            sigilGlyph: '\u2601',
            primary: 'cot-pruning-reasoning',
            alt: 'trajectory-guard',
            reason: 'Old context rots; prune with decay.',
          },
          {
            id: 'rsn-n2-d',
            label: 'A weight of stale memory',
            sigilGlyph: '\u2691',
            primary: 'trajectory-guard',
            alt: 'cot-pruning-reasoning',
            reason: 'Compress to retain only what changes the decision.',
          },
        ],
      },
      {
        id: 'rsn-n3',
        question: 'How do you test your own thinking?',
        clarification: 'How do you verify your reasoning?',
        options: [
          {
            id: 'rsn-n3-a',
            label: 'By compressing it to its essence',
            sigilGlyph: '\u25ce',
            primary: 'cognitive-load-operator-state-machine',
            alt: 'feynman-technique',
            reason: 'If you cannot compress it, you do not know it.',
          },
          {
            id: 'rsn-n3-b',
            label: 'By explaining it to a child',
            sigilGlyph: '\u2042',
            primary: 'feynman-technique',
            alt: 'cognitive-load-operator-state-machine',
            reason: 'Simple language is the acid test.',
          },
          {
            id: 'rsn-n3-c',
            label: 'By speaking it aloud, for others to weigh',
            sigilGlyph: '\u2756',
            primary: 'first-principles',
            alt: 'metacognitive-monitoring',
            reason: 'A claim you can defend has weight.',
          },
          {
            id: 'rsn-n3-d',
            label: 'By trying many paths at once',
            sigilGlyph: '\u2042',
            primary: 'tree-of-thoughts',
            alt: 'reasoning-integrity-chain',
            reason: 'Branching and pruning beats linear search.',
          },
        ],
      },
      {
        id: 'rsn-n4',
        question: 'What truth are you seeking?',
        clarification: 'What outcome are you after?',
        options: [
          {
            id: 'rsn-n4-a',
            label: 'The simplest sufficient one',
            sigilGlyph: '\u25c7',
            primary: 'occams-razor',
            alt: 'first-principles',
            reason: 'Simplicity is a reliability bet.',
          },
          {
            id: 'rsn-n4-b',
            label: 'The one stripped of assumption',
            sigilGlyph: '\u269c',
            primary: 'first-principles',
            alt: 'occams-razor',
            reason: 'From the ground up, not from received wisdom.',
          },
          {
            id: 'rsn-n4-c',
            label: 'The one seen by all sides at once',
            sigilGlyph: '\u2042',
            primary: 'six-thinking-hats',
            alt: 'metacognitive-monitoring',
            reason: 'Multiple lenses reduce single-view error.',
          },
          {
            id: 'rsn-n4-d',
            label: 'The one that survives contradiction',
            sigilGlyph: '\u2756',
            primary: 'reasoning-integrity-chain',
            alt: 'reasoning-integrity-chain',
            reason: 'Truth tested by independent paths.',
          },
        ],
      },
    ],
    darker: [
      {
        id: 'rsn-d1',
        question: 'When the recursion closes, what remains?',
        clarification: 'What have you learned?',
        options: [
          {
            id: 'rsn-d1-a',
            label: 'A whisper, calling your name',
            sigilGlyph: '\u2042',
            primary: 'first-principles',
            alt: 'feynman-technique',
            reason: 'Confidence calibrated to the audience.',
          },
          {
            id: 'rsn-d1-b',
            label: 'A silence, deeper than thought',
            sigilGlyph: '\u25c7',
            primary: 'feynman-technique',
            alt: 'cognitive-load-operator-state-machine',
            reason: 'The child did not understand.',
          },
          {
            id: 'rsn-d1-c',
            label: 'A pattern, finally visible',
            sigilGlyph: '\u2756',
            primary: 'reasoning-integrity-chain',
            alt: 'tree-of-thoughts',
            reason: 'Many paths converging on one shape.',
          },
          {
            id: 'rsn-d1-d',
            label: 'A question, sharper than before',
            sigilGlyph: '\u269c',
            primary: 'pre-flight-intent-verification',
            alt: 'first-principles',
            reason: 'The answer you needed was the next question.',
          },
        ],
      },
      {
        id: 'rsn-d2',
        question: 'What would you burn to understand?',
        clarification: 'What are you willing to question?',
        options: [
          {
            id: 'rsn-d2-a',
            label: 'All that came before',
            sigilGlyph: '\u2620',
            primary: 'first-principles',
            alt: 'occams-razor',
            reason: 'Convention is the fuel.',
          },
          {
            id: 'rsn-d2-b',
            label: 'The sacred assumptions',
            sigilGlyph: '\u2042',
            primary: 'pre-mortem-state-machine',
            alt: 'pre-mortem-state-machine',
            reason: 'What if the opposite were true?',
          },
          {
            id: 'rsn-d2-c',
            label: 'Your certainty of speed',
            sigilGlyph: '\u23f2',
            primary: 'reasoning-integrity-chain',
            alt: 'cot-pruning-reasoning',
            reason: 'Stop when the conclusion is stable.',
          },
          {
            id: 'rsn-d2-d',
            label: 'Your chain of evidence',
            sigilGlyph: '\u2756',
            primary: 'reasoning-integrity-chain',
            alt: 'reasoning-integrity-chain',
            reason: 'Every claim needs an anchor.',
          },
        ],
      },
    ],
  },

  'software-development': {
    narrowing: [
      {
        id: 'sde-n1',
        question: 'When the code is written, what is asked of it?',
        clarification: 'What is the main concern for your code?',
        options: [
          {
            id: 'sde-n1-a',
            label: 'To integrate without breaking what was before',
            sigilGlyph: '\u26d4',
            primary: 'api-surface-anchoring',
            alt: 'coordinated-change',
            reason: 'Additive only is the contract.',
          },
          {
            id: 'sde-n1-b',
            label: 'To call on powers not yet known',
            sigilGlyph: '\u269c',
            primary: 'api-surface-anchoring',
            alt: 'verified-api-workflow',
            reason: 'Verify the API before you cast.',
          },
          {
            id: 'sde-n1-c',
            label: 'To remain stable when the storm comes',
            sigilGlyph: '\u2693',
            primary: 'release-it-stability',
            alt: 'release-it-stability',
            reason: 'Survival under load is a feature.',
          },
          {
            id: 'sde-n1-d',
            label: 'To defend against the next maintainer',
            sigilGlyph: '\u2620',
            primary: 'api-surface-anchoring',
            alt: 'super-review-typescript',
            reason: 'Contracts outlive their authors.',
          },
        ],
      },
      {
        id: 'sde-n2',
        question: 'What form does the code wear?',
        clarification: 'What state is your codebase in?',
        options: [
          {
            id: 'sde-n2-a',
            label: 'A contract, sealed in types',
            sigilGlyph: '\u2756',
            primary: 'super-review-typescript',
            alt: 'verified-synthesize',
            reason: 'Types that lie are louder than bugs.',
          },
          {
            id: 'sde-n2-b',
            label: 'A spell book, written in haste',
            sigilGlyph: '\u2042',
            primary: 'llm-pre-push-review',
            alt: 'super-review-typescript',
            reason: 'LLM-authored code has known failure modes.',
          },
          {
            id: 'sde-n2-c',
            label: 'A web of small, coordinated changes',
            sigilGlyph: '\u26d4',
            primary: 'coordinated-change',
            alt: 'lint-battalion',
            reason: 'Atomic across the surface that depends.',
          },
          {
            id: 'sde-n2-d',
            label: 'A monument to past selves',
            sigilGlyph: '\u2620',
            primary: 'git-surgery',
            alt: 'verify-before-integrate',
            reason: 'When history is broken, surgery is needed.',
          },
        ],
      },
      {
        id: 'sde-n3',
        question: 'Who shall judge the code?',
        clarification: 'How strict should the review process be?',
        options: [
          {
            id: 'sde-n3-a',
            label: 'A single vigilant eye, before commit',
            sigilGlyph: '\u25ce',
            primary: 'verify-before-integrate',
            alt: 'llm-pre-push-review',
            reason: 'Gate the boundary.',
          },
          {
            id: 'sde-n3-b',
            label: 'A chorus of critics, in layers',
            sigilGlyph: '\u2756',
            primary: 'review-ladder-plus',
            alt: 'super-review-typescript',
            reason: 'Forced test generation and "why is it safe".',
          },
          {
            id: 'sde-n3-c',
            label: 'The many eyes of the deployment gate',
            sigilGlyph: '\u26d4',
            primary: 'pre-deployment-gate',
            alt: 'security-review-protocol',
            reason: 'Seven passes, one threshold.',
          },
          {
            id: 'sde-n3-d',
            label: 'A critical system, unforgiving',
            sigilGlyph: '\u2620',
            primary: 'review-ladder-plus',
            alt: 'pre-deployment-gate',
            reason: 'Auth, payment, validation, all of it.',
          },
        ],
      },
      {
        id: 'sde-n4',
        question: 'What corruption lurks in the spell?',
        clarification: 'What kind of issues are you worried about?',
        options: [
          {
            id: 'sde-n4-a',
            label: 'A forgotten API, now a phantom',
            sigilGlyph: '\u2620',
            primary: 'api-surface-anchoring',
            alt: 'verified-api-workflow',
            reason: 'The signature moved; the call did not.',
          },
          {
            id: 'sde-n4-b',
            label: 'A type that lies to the compiler',
            sigilGlyph: '\u2756',
            primary: 'super-review-typescript',
            alt: 'llm-pre-push-review',
            reason: 'Type-safety violations are silent until production.',
          },
          {
            id: 'sde-n4-c',
            label: 'A secret left in the open',
            sigilGlyph: '\u26d4',
            primary: 'security-review-protocol',
            alt: 'pre-deployment-gate',
            reason: 'Hardening before exposure.',
          },
          {
            id: 'sde-n4-d',
            label: 'A path the test runner never saw',
            sigilGlyph: '\u2042',
            primary: 'simulate-instrumentation',
            alt: 'lint-battalion',
            reason: 'The tooling knows what eyes cannot see.',
          },
        ],
      },
    ],
    darker: [
      {
        id: 'sde-d1',
        question: 'When the code ships at last, who mourns?',
        clarification: 'What suffers when code ships?',
        options: [
          {
            id: 'sde-d1-a',
            label: 'The versions that came before',
            sigilGlyph: '\u26d4',
            primary: 'api-surface-anchoring',
            alt: 'coordinated-change',
            reason: 'Backward-compat is the promise.',
          },
          {
            id: 'sde-d1-b',
            label: 'The linter, in vain',
            sigilGlyph: '\u2756',
            primary: 'lint-battalion',
            alt: 'simulate-instrumentation',
            reason: 'Many trivial errors, one auto-fix.',
          },
          {
            id: 'sde-d1-c',
            label: 'The watcher, who never slept',
            sigilGlyph: '\u25ce',
            primary: 'verify-before-integrate',
            alt: 'pre-deployment-gate',
            reason: 'Vigilance beyond the commit.',
          },
          {
            id: 'sde-d1-d',
            label: 'The user, who trusted',
            sigilGlyph: '\u2620',
            primary: 'first-principles',
            alt: 'security-review-protocol',
            reason: 'Communication is a safety feature.',
          },
        ],
      },
      {
        id: 'sde-d2',
        question: 'What does the production altar demand?',
        clarification: 'What does deploying to production require?',
        options: [
          {
            id: 'sde-d2-a',
            label: 'Verification, end to end',
            sigilGlyph: '\u26d4',
            primary: 'pre-deployment-gate',
            alt: 'verify-before-integrate',
            reason: 'Seven passes, one threshold.',
          },
          {
            id: 'sde-d2-b',
            label: 'Vigilance against the dark',
            sigilGlyph: '\u2620',
            primary: 'security-review-protocol',
            alt: 'vibe-coding-security-hardening',
            reason: 'Three security lenses merged.',
          },
          {
            id: 'sde-d2-c',
            label: 'Readiness for the worst hour',
            sigilGlyph: '\u2693',
            primary: 'release-it-stability',
            alt: 'release-it-stability',
            reason: 'Stability under failure is the bar.',
          },
          {
            id: 'sde-d2-d',
            label: 'A heart, in the chaos',
            sigilGlyph: '\u2756',
            primary: 'release-it-stability',
            alt: 'release-it-stability',
            reason: 'The error budget is the heartbeat.',
          },
        ],
      },
    ],
  },

  'systems-and-architecture': {
    narrowing: [
      {
        id: 'arc-n1',
        question: 'When you first draw the lines, what guides your hand?',
        clarification: 'What is driving the design?',
        options: [
          {
            id: 'arc-n1-a',
            label: 'A principle older than the code',
            sigilGlyph: '\u269c',
            primary: 'feature-architecture',
            alt: 'system-architecture-audit',
            reason: 'The language shapes the design.',
          },
          {
            id: 'arc-n1-b',
            label: 'A study of the data\u2019s nature',
            sigilGlyph: '\u25ce',
            primary: 'system-architecture-audit',
            alt: 'system-architecture-audit',
            reason: 'Storage, scaling, and tradeoffs.',
          },
          {
            id: 'arc-n1-c',
            label: 'A map of how teams divide the work',
            sigilGlyph: '\u2042',
            primary: 'team-topologies-ai',
            alt: 'feature-architecture',
            reason: 'Boundaries are organizational.',
          },
          {
            id: 'arc-n1-d',
            label: 'A vision of the whole system',
            sigilGlyph: '\u26d4',
            primary: 'system-architecture-audit',
            alt: 'system-architecture-audit',
            reason: 'Map, then judge.',
          },
        ],
      },
      {
        id: 'arc-n2',
        question: 'What is the system\u2019s first breath?',
        clarification: 'What is the primary goal of the system?',
        options: [
          {
            id: 'arc-n2-a',
            label: 'Speed of change',
            sigilGlyph: '\u23f2',
            primary: 'release-it-stability',
            alt: 'everything-as-code-conceptualizer',
            reason: 'Throughput is a design constraint.',
          },
          {
            id: 'arc-n2-b',
            label: 'Stability under stress',
            sigilGlyph: '\u2693',
            primary: 'release-it-stability',
            alt: 'release-it-stability',
            reason: 'The error budget is the heartbeat.',
          },
          {
            id: 'arc-n2-c',
            label: 'Survival of the storm',
            sigilGlyph: '\u26d4',
            primary: 'release-it-stability',
            alt: 'release-it-stability',
            reason: 'Stable in failure is the design.',
          },
          {
            id: 'arc-n2-d',
            label: 'Strength against the dark',
            sigilGlyph: '\u2620',
            primary: 'security-review-protocol',
            alt: 'security-review-protocol',
            reason: 'The adversary is always considered.',
          },
        ],
      },
      {
        id: 'arc-n3',
        question: 'Where do the lines blur?',
        clarification: 'What boundaries are unclear?',
        options: [
          {
            id: 'arc-n3-a',
            label: 'Between teams',
            sigilGlyph: '\u2042',
            primary: 'team-topologies-ai',
            alt: 'feature-architecture',
            reason: 'Ownership is the seam.',
          },
          {
            id: 'arc-n3-b',
            label: 'Between data and time',
            sigilGlyph: '\u23f2',
            primary: 'thinking-in-systems-state-machine',
            alt: 'system-architecture-audit',
            reason: 'Feedback loops and delayed effects.',
          },
          {
            id: 'arc-n3-c',
            label: 'Between the abstract and the code',
            sigilGlyph: '\u2756',
            primary: 'everything-as-code-conceptualizer',
            alt: 'system-architecture-audit',
            reason: 'Codify the system to reveal it.',
          },
          {
            id: 'arc-n3-d',
            label: 'Between past and future decisions',
            sigilGlyph: '\u25c7',
            primary: 'release-it-stability',
            alt: 'team-topologies-ai',
            reason: 'The decisions compound.',
          },
        ],
      },
      {
        id: 'arc-n4',
        question: 'What unseen weight does the system bear?',
        clarification: 'What hidden challenges exist?',
        options: [
          {
            id: 'arc-n4-a',
            label: 'A bottleneck, hidden in the flow',
            sigilGlyph: '\u2693',
            primary: 'thinking-in-systems-state-machine',
            alt: 'system-architecture-audit',
            reason: 'Find the one constraint, not the many.',
          },
          {
            id: 'arc-n4-b',
            label: 'A coupling, binding too tight',
            sigilGlyph: '\u2756',
            primary: 'feature-architecture',
            alt: 'team-topologies-ai',
            reason: 'Bounded contexts limit coupling.',
          },
          {
            id: 'arc-n4-c',
            label: 'A risk, lurking in the choices',
            sigilGlyph: '\u2620',
            primary: 'pre-mortem-state-machine',
            alt: 'pre-mortem-state-machine',
            reason: 'Imagine failure first.',
          },
          {
            id: 'arc-n4-d',
            label: 'An idea, borrowed from afar',
            sigilGlyph: '\u2042',
            primary: 'cross-domain-analogy-generator',
            alt: 'pre-flight-intent-verification',
            reason: 'Break fixation with foreign structure.',
          },
        ],
      },
    ],
    darker: [
      {
        id: 'arc-d1',
        question: 'When the system fails, what shape does the failure take?',
        clarification: 'How does failure manifest?',
        options: [
          {
            id: 'arc-d1-a',
            label: 'A cascade, of cascading cascades',
            sigilGlyph: '\u26d4',
            primary: 'system-architecture-audit',
            alt: 'thinking-in-systems-state-machine',
            reason: 'Map the full chain, then judge stability.',
          },
          {
            id: 'arc-d1-b',
            label: 'A single point, finally breaking',
            sigilGlyph: '\u2693',
            primary: 'thinking-in-systems-state-machine',
            alt: 'system-architecture-audit',
            reason: 'One constraint, finally hit.',
          },
          {
            id: 'arc-d1-c',
            label: 'A promise, that no one kept',
            sigilGlyph: '\u2756',
            primary: 'release-it-stability',
            alt: 'release-it-stability',
            reason: 'SLOs are promises; budgets are honesty.',
          },
          {
            id: 'arc-d1-d',
            label: 'An enemy, waiting patiently',
            sigilGlyph: '\u2620',
            primary: 'security-review-protocol',
            alt: 'security-review-protocol',
            reason: 'STRIDE finds the adversary\u2019s path.',
          },
        ],
      },
      {
        id: 'arc-d2',
        question: 'What does the system\u2019s silence mean?',
        clarification: 'What is missing or stalled?',
        options: [
          {
            id: 'arc-d2-a',
            label: 'The bottleneck, at last revealed',
            sigilGlyph: '\u2693',
            primary: 'thinking-in-systems-state-machine',
            alt: 'system-architecture-audit',
            reason: 'When nothing moves, the constraint is loudest.',
          },
          {
            id: 'arc-d2-b',
            label: 'The assumption, finally cracked',
            sigilGlyph: '\u2756',
            primary: 'pre-mortem-state-machine',
            alt: 'pre-mortem-state-machine',
            reason: 'Imagined failure becomes observed.',
          },
          {
            id: 'arc-d2-c',
            label: 'The boundary, drawn too thin',
            sigilGlyph: '\u26d4',
            primary: 'security-review-protocol',
            alt: 'security-review-protocol',
            reason: 'The trust boundary betrayed.',
          },
          {
            id: 'arc-d2-d',
            label: 'The decision, long deferred',
            sigilGlyph: '\u23f2',
            primary: 'release-it-stability',
            alt: 'thinking-in-systems-state-machine',
            reason: 'Latency is a system property.',
          },
        ],
      },
    ],
  },

  testing: {
    narrowing: [
      {
        id: 'tst-n1',
        question: 'When the test is run, what does it prove?',
        clarification: 'What do your tests tell you?',
        options: [
          {
            id: 'tst-n1-a',
            label: 'The skill itself is worth using',
            sigilGlyph: '\u2042',
            primary: 'skill-ab-evaluation',
            alt: 'verify-before-integrate',
            reason: 'Empirical A/B vs. baseline.',
          },
          {
            id: 'tst-n1-b',
            label: 'The gate opens, and the gate is honest',
            sigilGlyph: '\u26d4',
            primary: 'pre-deployment-gate',
            alt: 'review-ladder-plus',
            reason: 'Seven passes, one threshold.',
          },
          {
            id: 'tst-n1-c',
            label: 'The code, by other eyes',
            sigilGlyph: '\u2756',
            primary: 'review-ladder-plus',
            alt: 'verify-before-integrate',
            reason: 'Forced test generation and "why is it safe".',
          },
          {
            id: 'tst-n1-d',
            label: 'The test\u2019s output, sliced to truth',
            sigilGlyph: '\u23f2',
            primary: 'purify-test-output',
            alt: 'skill-ab-evaluation',
            reason: 'Sliced test output is the cleanest signal.',
          },
        ],
      },
      {
        id: 'tst-n2',
        question: 'How is the verdict forged?',
        clarification: 'How do you validate quality?',
        options: [
          {
            id: 'tst-n2-a',
            label: 'With isolated subagents, in trials',
            sigilGlyph: '\u2042',
            primary: 'skill-ab-evaluation',
            alt: 'review-ladder-plus',
            reason: '5 trials, isolated subagents, a rubric.',
          },
          {
            id: 'tst-n2-b',
            label: 'With a vigilant eye, before the commit',
            sigilGlyph: '\u25ce',
            primary: 'verify-before-integrate',
            alt: 'review-ladder-plus',
            reason: 'Gate the boundary.',
          },
          {
            id: 'tst-n2-c',
            label: 'With a chorus of critics, in layers',
            sigilGlyph: '\u2756',
            primary: 'review-ladder-plus',
            alt: 'llm-pre-push-review',
            reason: 'Forced test generation and "why is it safe".',
          },
          {
            id: 'tst-n2-d',
            label: 'With the final deployment gate',
            sigilGlyph: '\u26d4',
            primary: 'pre-deployment-gate',
            alt: 'skill-ab-evaluation',
            reason: 'One threshold; many passes.',
          },
        ],
      },
      {
        id: 'tst-n3',
        question: 'What does the verdict measure?',
        clarification: 'What are you measuring?',
        options: [
          {
            id: 'tst-n3-a',
            label: 'Whether the skill improves outcomes',
            sigilGlyph: '\u2042',
            primary: 'skill-ab-evaluation',
            alt: 'pre-deployment-gate',
            reason: 'Does it actually improve outcomes?',
          },
          {
            id: 'tst-n3-b',
            label: 'Whether the code survives review',
            sigilGlyph: '\u2756',
            primary: 'review-ladder-plus',
            alt: 'llm-pre-push-review',
            reason: 'Catches what the author missed.',
          },
          {
            id: 'tst-n3-c',
            label: 'Whether the commit is clean',
            sigilGlyph: '\u25ce',
            primary: 'verify-before-integrate',
            alt: 'llm-pre-push-review',
            reason: 'Pre-commit, pre-regret.',
          },
          {
            id: 'tst-n3-d',
            label: 'Whether the ship is safe',
            sigilGlyph: '\u26d4',
            primary: 'pre-deployment-gate',
            alt: 'review-ladder-plus',
            reason: 'Production-ready, by seven tests.',
          },
        ],
      },
      {
        id: 'tst-n4',
        question: 'When the verdict comes back, what then?',
        clarification: 'What do you do with test results?',
        options: [
          {
            id: 'tst-n4-a',
            label: 'The output is purified, line by line',
            sigilGlyph: '\u23f2',
            primary: 'purify-test-output',
            alt: 'debug-issue',
            reason: 'Slice noise; keep signal.',
          },
          {
            id: 'tst-n4-b',
            label: 'The test is re-read, slowly',
            sigilGlyph: '\u25ce',
            primary: 'review-ladder-plus',
            alt: 'verify-before-integrate',
            reason: 'Trace, assert, retry.',
          },
          {
            id: 'tst-n4-c',
            label: 'A new review is born, of the failing one',
            sigilGlyph: '\u2756',
            primary: 'llm-pre-push-review',
            alt: 'review-ladder-plus',
            reason: 'Pre-push, pre-regret.',
          },
          {
            id: 'tst-n4-d',
            label: 'The skill itself is questioned',
            sigilGlyph: '\u2042',
            primary: 'skill-ab-evaluation',
            alt: 'pre-deployment-gate',
            reason: 'Even skills need to earn their place.',
          },
        ],
      },
    ],
    darker: [
      {
        id: 'tst-d1',
        question: 'When the verdict is silent, what does that mean?',
        clarification: 'What does a passing test actually mean?',
        options: [
          {
            id: 'tst-d1-a',
            label: 'The code passed, but the user did not',
            sigilGlyph: '\u26d4',
            primary: 'pre-deployment-gate',
            alt: 'skill-ab-evaluation',
            reason: 'Gate-passed is not user-passed.',
          },
          {
            id: 'tst-d1-b',
            label: 'The test runner is broken',
            sigilGlyph: '\u23f2',
            primary: 'verify-before-integrate',
            alt: 'llm-pre-push-review',
            reason: 'Diagnose the verifier first.',
          },
          {
            id: 'tst-d1-c',
            label: 'The skill is untested',
            sigilGlyph: '\u2042',
            primary: 'skill-ab-evaluation',
            alt: 'pre-deployment-gate',
            reason: 'A skill without evaluation is hearsay.',
          },
          {
            id: 'tst-d1-d',
            label: 'The framework has hidden the truth',
            sigilGlyph: '\u2756',
            primary: 'review-ladder-plus',
            alt: 'llm-pre-push-review',
            reason: 'Reviews can lie; integration is honest.',
          },
        ],
      },
      {
        id: 'tst-d2',
        question: 'What does a green verdict promise?',
        clarification: 'How reliable are green tests?',
        options: [
          {
            id: 'tst-d2-a',
            label: 'Nothing, alone',
            sigilGlyph: '\u2620',
            primary: 'skill-ab-evaluation',
            alt: 'pre-deployment-gate',
            reason: 'Green is a sample, not a proof.',
          },
          {
            id: 'tst-d2-b',
            label: 'Only what was asked',
            sigilGlyph: '\u2756',
            primary: 'llm-pre-push-review',
            alt: 'review-ladder-plus',
            reason: 'Coverage of assertions, not behavior.',
          },
          {
            id: 'tst-d2-c',
            label: 'An agreement, easily broken',
            sigilGlyph: '\u26d4',
            primary: 'pre-deployment-gate',
            alt: 'skill-ab-evaluation',
            reason: 'A passing gate is a fragile contract.',
          },
          {
            id: 'tst-d2-d',
            label: 'A foundation, if the foundation is true',
            sigilGlyph: '\u23f2',
            primary: 'verify-before-integrate',
            alt: 'llm-pre-push-review',
            reason: 'Build on solid gates or build on sand.',
          },
        ],
      },
    ],
  },

  'output-quality': {
    narrowing: [
      {
        id: 'out-n1',
        question: 'When the output is born, what does it lack?',
        clarification: 'What is missing from your output?',
        options: [
          {
            id: 'out-n1-a',
            label: 'Polished prose, fit for the user',
            sigilGlyph: '\u269c',
            primary: 'documentation-craft',
            alt: 'first-principles',
            reason: 'Documentation is a deliverable.',
          },
          {
            id: 'out-n1-b',
            label: 'A second opinion, willing to wound',
            sigilGlyph: '\u2756',
            primary: 'tool-interactive-critic',
            alt: 'self-verify-pipeline',
            reason: 'Internal critique, then external tool.',
          },
          {
            id: 'out-n1-c',
            label: 'A clear skeleton, MECE and true',
            sigilGlyph: '\u2042',
            primary: 'documentation-craft',
            alt: 'documentation-craft',
            reason: 'Mutually exclusive, collectively exhaustive.',
          },
          {
            id: 'out-n1-d',
            label: 'A calibration of confidence',
            sigilGlyph: '\u25ce',
            primary: 'first-principles',
            alt: 'reasoning-integrity-chain',
            reason: 'Confidence stated is a deliverable.',
          },
        ],
      },
      {
        id: 'out-n2',
        question: 'How is the output tested?',
        clarification: 'How do you review your output?',
        options: [
          {
            id: 'out-n2-a',
            label: 'By explaining it simply',
            sigilGlyph: '\u2042',
            primary: 'feynman-technique',
            alt: 'cognitive-load-operator-state-machine',
            reason: 'The simplest explanation survives.',
          },
          {
            id: 'out-n2-b',
            label: 'By compression to the core',
            sigilGlyph: '\u25ce',
            primary: 'cognitive-load-operator-state-machine',
            alt: 'feynman-technique',
            reason: 'If it can be compressed, it is understood.',
          },
          {
            id: 'out-n2-c',
            label: 'By trying many paths at once',
            sigilGlyph: '\u2756',
            primary: 'tree-of-thoughts',
            alt: 'reasoning-integrity-chain',
            reason: 'Branch, evaluate, prune.',
          },
          {
            id: 'out-n2-d',
            label: 'By independent paths to the same truth',
            sigilGlyph: '\u2042',
            primary: 'reasoning-integrity-chain',
            alt: 'tree-of-thoughts',
            reason: 'Convergent paths are robust.',
          },
        ],
      },
      {
        id: 'out-n3',
        question: 'What weighs the output down?',
        clarification: 'What makes your output hard to follow?',
        options: [
          {
            id: 'out-n3-a',
            label: 'A flood of stale context',
            sigilGlyph: '\u2601',
            primary: 'cognitive-load-operator-state-machine',
            alt: 'self-verify-pipeline',
            reason: 'Compress aggressively, on schedule.',
          },
          {
            id: 'out-n3-b',
            label: 'A surplus of words, where few would do',
            sigilGlyph: '\u2042',
            primary: 'self-verify-pipeline',
            alt: 'documentation-craft',
            reason: 'Revision is bounded, not endless.',
          },
          {
            id: 'out-n3-c',
            label: 'A structure without a skeleton',
            sigilGlyph: '\u2756',
            primary: 'documentation-craft',
            alt: 'tree-of-thoughts',
            reason: 'Structure first, prose second.',
          },
          {
            id: 'out-n3-d',
            label: 'A path not yet considered',
            sigilGlyph: '\u2042',
            primary: 'tree-of-thoughts',
            alt: 'reasoning-integrity-chain',
            reason: 'More branches, better pruning.',
          },
        ],
      },
      {
        id: 'out-n4',
        question: 'What truth does the output serve?',
        clarification: 'Who or what is the output for?',
        options: [
          {
            id: 'out-n4-a',
            label: 'The user\u2019s understanding',
            sigilGlyph: '\u269c',
            primary: 'documentation-craft',
            alt: 'documentation-craft',
            reason: 'Writers serve readers, not themselves.',
          },
          {
            id: 'out-n4-b',
            label: 'The structure of the problem',
            sigilGlyph: '\u2042',
            primary: 'documentation-craft',
            alt: 'tree-of-thoughts',
            reason: 'Structure reveals the whole.',
          },
          {
            id: 'out-n4-c',
            label: 'The chain of evidence',
            sigilGlyph: '\u2756',
            primary: 'tool-interactive-critic',
            alt: 'self-verify-pipeline',
            reason: 'Every claim must earn its place.',
          },
          {
            id: 'out-n4-d',
            label: 'The depth of the topic',
            sigilGlyph: '\u25ce',
            primary: 'documentation-craft',
            alt: 'documentation-craft',
            reason: 'The reader can find their way.',
          },
        ],
      },
    ],
    darker: [
      {
        id: 'out-d1',
        question: 'When the output is read, who understands?',
        clarification: 'How clear is your output to others?',
        options: [
          {
            id: 'out-d1-a',
            label: 'The one who wrote it',
            sigilGlyph: '\u269c',
            primary: 'documentation-craft',
            alt: 'first-principles',
            reason: 'The curse of knowledge.',
          },
          {
            id: 'out-d1-b',
            label: 'No one, fully',
            sigilGlyph: '\u2620',
            primary: 'documentation-craft',
            alt: 'documentation-craft',
            reason: 'Navigation reveals what prose cannot.',
          },
          {
            id: 'out-d1-c',
            label: 'Those who already knew',
            sigilGlyph: '\u2756',
            primary: 'first-principles',
            alt: 'documentation-craft',
            reason: 'Calibrate to the audience.',
          },
          {
            id: 'out-d1-d',
            label: 'Those who ask the right questions',
            sigilGlyph: '\u2042',
            primary: 'documentation-craft',
            alt: 'pre-flight-intent-verification',
            reason: 'Structure invites the right questions.',
          },
        ],
      },
      {
        id: 'out-d2',
        question: 'When the output is judged, what shall be found?',
        clarification: 'What will reviewers notice?',
        options: [
          {
            id: 'out-d2-a',
            label: 'The author\u2019s doubts, unstated',
            sigilGlyph: '\u2756',
            primary: 'first-principles',
            alt: 'reasoning-integrity-chain',
            reason: 'Calibrated confidence is honest.',
          },
          {
            id: 'out-d2-b',
            label: 'The unrevised parts, still rough',
            sigilGlyph: '\u2042',
            primary: 'self-verify-pipeline',
            alt: 'tool-interactive-critic',
            reason: 'Revision is bounded, not endless.',
          },
          {
            id: 'out-d2-c',
            label: 'The unseen alternatives, unconsidered',
            sigilGlyph: '\u2756',
            primary: 'tree-of-thoughts',
            alt: 'reasoning-integrity-chain',
            reason: 'Branch before pruning.',
          },
          {
            id: 'out-d2-d',
            label: 'The truths, but not all of them',
            sigilGlyph: '\u2042',
            primary: 'reasoning-integrity-chain',
            alt: 'reasoning-integrity-chain',
            reason: 'Convergent paths surface most truths.',
          },
        ],
      },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────

/**
 * Look up an option by its id within a school.
 * @param {string} schoolId
 * @param {string} optionId
 * @returns {{option: object, question: object, pool: string}|null}
 */


export function getOptionById(schoolId: string, optionId: string): FoundOption | null {
  const pools = SEANCE_QUESTIONS[schoolId];
  if (!pools) return null;
  for (const pool of ['narrowing', 'darker'] as const) {
    for (const question of pools[pool] || []) {
      const option = question.options.find((o: SeanceOption) => o.id === optionId);
      if (option) return { option, question, pool };
    }
  }
  return null;
}
