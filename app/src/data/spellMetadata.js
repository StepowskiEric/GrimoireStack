/**
 * GrimoireStack — Spell metadata
 *
 * Per-spell "lastUpdated" dates and curated change notes. Spells without
 * an explicit entry fall back to a deterministic hash-based date within
 * the past year so the changelog is always populated and stable.
 *
 * Iteration over the corpus goes through `grimoireIndex` — this module
 * only adds the metadata layer (explicit curation, recency sort) on top.
 */

import { grimoireIndex } from './grimoireIndexInstance.js';

const ISO = (date) => date.toISOString().slice(0, 10);

function hashStringToInt(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function deterministicDate(skill) {
  const h = hashStringToInt(skill);
  const daysAgo = 30 + (h % 300);
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return ISO(d);
}

const EXPLICIT = {
  'log-trace-correlation': { lastUpdated: '2026-05-22', note: 'Polished effect description; tier unchanged.' },
  'bisect-debugging': { lastUpdated: '2026-05-15' },
  'debug-subagent': { lastUpdated: '2026-04-30', note: 'Updated guidance for the debug-before-edit workflow.' },
  'purify-test-output': { lastUpdated: '2026-05-08' },
  'simulate-instrumentation': { lastUpdated: '2026-05-29', note: 'Refreshed effect copy; combinations unchanged.' },
  'iterative-patch-repair': { lastUpdated: '2026-05-12' },
  'unit-test-debugging': { lastUpdated: '2026-06-02', note: 'New entry — sourced from Jerry\'s agent skills library.' },
  'jest-testing': { lastUpdated: '2026-06-02', note: 'New entry — covers Vitest and React Native specifics.' },
  'occam-root-cause': { lastUpdated: '2026-05-18', note: 'New entry — added to the School of Remediation.' },
  'specter': { lastUpdated: '2026-05-04' },
  'long-task-survival-kit': { lastUpdated: '2026-06-05', note: 'Refined effect and added combo pairings.' },
  'time-traveling-debugger': { lastUpdated: '2026-04-22' },
  'environment-recovery': { lastUpdated: '2026-06-04', note: 'New entry — covers disk, version, and port recovery.' },
  'network-api-debugging': { lastUpdated: '2026-05-26', note: 'New entry — for HTTP, CORS, and WebSocket failures.' },
  'minimal-reproduction': { lastUpdated: '2026-05-26', note: 'New entry — smallest-possible-repro workflow.' },
  'occam-minimal-repro': { lastUpdated: '2026-05-26', note: 'New entry — ranks repro triggers by complexity.' },
  'escalation-ladder': { lastUpdated: '2026-05-30' },
  'coordinated-change': { lastUpdated: '2026-05-19' },
  'how-to-solve-it-state-machine': { lastUpdated: '2026-05-21' },
  'occams-razor': { lastUpdated: '2026-05-21' },
  'occam-abduction': { lastUpdated: '2026-05-21' },
  'keyword-agnostic-logic-locator': { lastUpdated: '2026-05-04' },
  'occam-mcts': { lastUpdated: '2026-05-21' },
  'tree-of-thoughts-plus-monte-carlo-tree-search': { lastUpdated: '2026-05-21' },
  'jury': { lastUpdated: '2026-05-04' },
  'prism': { lastUpdated: '2026-05-04' },
  'cross-domain-analogy-generator': { lastUpdated: '2026-05-04' },
  'ooda-loop-state-machine': { lastUpdated: '2026-05-04' },
  'cognitive-friction-governor': { lastUpdated: '2026-05-04' },
  'process-reward-model-protocol': { lastUpdated: '2026-05-04' },
  'how-to-solve-it-analogy': { lastUpdated: '2026-05-04' },
  'step-level-verification-protocol': { lastUpdated: '2026-05-04' },
  'assumption-grounding': { lastUpdated: '2026-05-04' },
  'trajectory-guard': { lastUpdated: '2026-05-04' },
  'context-lifecycle-manager': { lastUpdated: '2026-05-04' },
  'pre-flight-intent-verification': { lastUpdated: '2026-05-21' },
  'pre-deployment-gate': { lastUpdated: '2026-06-01', note: 'New entry — 7-pass deployment checklist.' },
  'llm-pre-push-review': { lastUpdated: '2026-06-01' },
  'failure-analysis-protocol': { lastUpdated: '2026-05-04' },
  'security-review-protocol': { lastUpdated: '2026-05-04' },
  'refactoring-state-machine': { lastUpdated: '2026-05-04' },
  'pragmatic-programmer-state-machine': { lastUpdated: '2026-05-04' },
  'thoroughness-check-etto': { lastUpdated: '2026-05-04' },
  'thoroughness-check-etto-state-machine': { lastUpdated: '2026-05-04' },
  'counterfactual-policy-testing': { lastUpdated: '2026-05-04' },
  'bounded-self-revision': { lastUpdated: '2026-05-04' },
  'speculative-drafting-verification': { lastUpdated: '2026-05-04' },
  'speculative-exploration-protocol': { lastUpdated: '2026-05-04' },
  'cognitive-bias-checklist': { lastUpdated: '2026-05-04' },
  'cognitive-bias-auditor': { lastUpdated: '2026-05-04' },
  'self-consistency': { lastUpdated: '2026-05-04' },
  'claim-verification-reasoning': { lastUpdated: '2026-05-04' },
  'reasoning-verification-hybrid': { lastUpdated: '2026-05-04' },
  'advocatus-diaboli': { lastUpdated: '2026-05-04' },
  'adversarial-review': { lastUpdated: '2026-05-04' },
  'mece-pyramid-principle': { lastUpdated: '2026-05-04' },
  'feynman-technique': { lastUpdated: '2026-05-04' },
  'documentation-craft': { lastUpdated: '2026-05-04' },
  'security-threat-modeling': { lastUpdated: '2026-05-04' },
  'concrete-example-extractor': { lastUpdated: '2026-05-19' },
  'summarize': { lastUpdated: '2026-05-04' },
  'resume-handoff': { lastUpdated: '2026-05-19' },
  'agentic-design-patterns-orchestrator': { lastUpdated: '2026-05-04' },
  'subagent-composer': { lastUpdated: '2026-05-04' },
  'agent-memory-hygiene': { lastUpdated: '2026-05-04' },
  'coppermind': { lastUpdated: '2026-05-04' },
  'context-budget-operator': { lastUpdated: '2026-05-04' },
  'cognitive-load-operator-state-machine': { lastUpdated: '2026-05-04' },
  'metacognitive-monitoring': { lastUpdated: '2026-05-04' },
  'inspect-first-modeling': { lastUpdated: '2026-05-19' },
  'dspy-signature-optimizer': { lastUpdated: '2026-05-19' },
  'user-onboarding-flow-validator': { lastUpdated: '2026-05-19' },
  'critical-system-interrogation': { lastUpdated: '2026-06-12', note: 'New entry — deep-dive investigation of critical system components combining relentless questioning with extreme code quality standards.' },
};

export function getSpellLastUpdated(skill) {
  if (!skill) return null;
  const explicit = EXPLICIT[skill];
  if (explicit?.lastUpdated) return explicit.lastUpdated;
  return deterministicDate(skill);
}

export function getSpellNote(skill) {
  if (!skill) return null;
  return EXPLICIT[skill]?.note || null;
}

export function isExplicitlyUpdated(skill) {
  return !!EXPLICIT[skill];
}

export function getRecentlyUpdated(limit = 12) {
  return grimoireIndex.allEntries()
    .map(({ spell, school }) => ({
      skill: spell.skill,
      name: spell.name,
      spell,
      school,
      lastUpdated: getSpellLastUpdated(spell.skill),
      isExplicit: isExplicitlyUpdated(spell.skill),
      note: getSpellNote(spell.skill),
    }))
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, limit);
}

export function getChangeFeed(limit = 30) {
  return getRecentlyUpdated(limit);
}

export function getAlphabeticalIndex() {
  return grimoireIndex.allEntries()
    .slice()
    .sort((a, b) => a.spell.name.localeCompare(b.spell.name));
}
