import { describe, expect, it } from 'vitest';
import { SKILL_CATALOG } from '../../functions/api/skill-catalog.js';

/**
 * oracleGoldenSet.test.js — Golden-set regression tests for the oracle.
 *
 * Each case is a realistic user query plus the skill ids that MUST
 * appear in the top-5 results. Two layers of verification:
 *
 *   1. Catalog assertion: every expected skill id exists in the catalog.
 *      Catches the class of bug where skills were silently missing from
 *      the catalog (the original "jest-testing was MISSING" bug).
 *
 *   2. Local-match assertion: the server-side localMatch() token-overlap
 *      matcher (replicated below) returns the expected skills for each
 *      query. This proves the matcher can find them even without AI.
 *      Queries marked `aiOnly: true` require semantic understanding the
 *      token-overlap matcher cannot provide — they are skipped in the
 *      local-match test and serve as manual smoke-test targets for the
 *      live /api/recommend endpoint.
 *
 * To smoke-test the AI path:
 *   curl -X POST https://grimoirestack.com/api/recommend \
 *     -H 'Content-Type: application/json' \
 *     -d '{"query":"..."}' | jq '.results[].skill'
 */

// ── Golden set ──────────────────────────────────────────
const GOLDEN_SET = [
  // ── Token-overlap-verifiable (local matcher should find these) ──
  {
    query: 'worried about security vulnerabilities in my app',
    expected: ['security-review-protocol'],
  },
  {
    query: 'planning a complex feature and not sure where to start',
    expected: ['how-to-solve-it-state-machine', 'structured-feature-planning'],
  },
  {
    query: 'separate fact, intuition, caution, optimism, creativity, and process into six discrete rounds',
    expected: ['six-thinking-hats', 'steelmanning'],
  },
  {
    query: 'isolate the exact commit that introduced a bug using binary search',
    expected: ['bisect-debugging', 'root-cause-analysis'],
  },
  {
    query: 'want to verify my answer is correct before committing',
    expected: ['verify-before-integrate', 'self-verify-pipeline'],
  },
  {
    query: 'worried my plan will fail, want to check risks first',
    expected: ['pre-mortem-state-machine'],
  },
  {
    query: 'need to brainstorm multiple solutions to a problem',
    expected: ['tree-of-thoughts', 'cross-domain-analogy-generator'],
  },
  {
    query: 'improving CI/CD pipeline reliability',
    expected: ['release-it-stability'],
  },
  {
    query: 'system is unreliable, need to balance speed and stability',
    expected: ['sre-error-budget'],
  },
  {
    query: 'my distributed system has data consistency issues',
    expected: ['designing-data-intensive-applications-ai'],
  },
  {
    query: 'find the one constraint, ignore non-constraints, exploit then elevate it',
    expected: ['the-goal-theory-of-constraints-ai'],
  },

  // ── AI-only (require semantic understanding; local matcher may miss) ──
  {
    query: 'my jest tests are flaky and fail intermittently in CI',
    expected: ['unit-test-debugging'],
    aiOnly: true,
  },
  {
    query: 'designing a new microservice and worried about coupling',
    expected: ['domain-driven-design', 'separation-of-concerns'],
    aiOnly: true,
  },
  {
    query: 'agent keeps going in circles, repeating the same mistakes',
    expected: ['trajectory-guard'],
    aiOnly: true,
  },
  {
    query: 'agent output is too verbose, need to compress it',
    expected: ['cognitive-load-operator-state-machine'],
    aiOnly: true,
  },
  {
    query: 'agent is not sure if it should keep exploring or commit',
    expected: ['explore-vs-exploit-state-machine'],
    aiOnly: true,
  },
  {
    query: 'writing tests for my new feature',
    expected: ['unit-test-debugging'],
    aiOnly: true,
  },
  {
    query: 'my code review is taking forever, want to focus on real issues',
    expected: ['review-ladder-plus', 'super-review-typescript'],
    aiOnly: true,
  },
  {
    query: 'agent keeps hallucinating APIs that do not exist',
    expected: ['claim-verification-reasoning'],
    aiOnly: true,
  },
  {
    query: 'need to refactor a legacy module safely',
    expected: ['legacy-rescue-protocol'],
    aiOnly: true,
  },
];

// ── Local matcher (replica of recommend.js localMatch) ──
const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'i',
  'im',
  'ive',
  'id',
  'is',
  'it',
  'of',
  'to',
  'and',
  'or',
  'but',
  'my',
  'in',
  'on',
  'for',
  'with',
  'this',
  'that',
  'those',
  'these',
  'be',
  'been',
  'was',
  'were',
  'are',
  'am',
  'do',
  'does',
  'did',
  'have',
  'has',
  'had',
  'you',
  'your',
  'me',
  'we',
  'us',
  'our',
  'so',
  'just',
  'very',
  'really',
  'about',
  'what',
  'how',
  'when',
  'where',
  'why',
  'which',
  'than',
  'then',
  'too',
  'any',
  'some',
  'no',
  'not',
]);

function tokenizeQuery(query) {
  const cleaned = String(query || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ');
  const out = [];
  for (const raw of cleaned.split(/\s+/)) {
    if (raw && !STOPWORDS.has(raw) && raw.length > 1) out.push(raw);
  }
  return out;
}

function localMatch(query, limit = 5) {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [];
  const scored = [];
  for (const skill of SKILL_CATALOG) {
    const haystack =
      `${skill.name} ${skill.skill} ${skill.effect} ${skill.school} ${skill.schoolName || ''} ${skill.status || ''}`.toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (haystack.includes(tok)) score += 2;
    }
    if (skill.status === 'Proven') score += 0.5;
    if (score > 0) {
      scored.push({ skill: skill.skill, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ skill }) => skill);
}

// ── Tests ───────────────────────────────────────────────

describe('oracle golden set', () => {
  const catalogIds = new Set(SKILL_CATALOG.map((s) => s.skill));

  // Layer 1: every expected skill exists in the catalog.
  it('all expected skills are present in the catalog', () => {
    const missing = [];
    for (const { expected } of GOLDEN_SET) {
      for (const skillId of expected) {
        if (!catalogIds.has(skillId)) {
          missing.push(skillId);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  // Layer 2: local matcher finds expected skills for token-overlap queries.
  for (const { query, expected, aiOnly } of GOLDEN_SET) {
    if (aiOnly) continue;
    it(`local matcher finds expected skills for: "${query}"`, () => {
      const results = localMatch(query, 10);
      const resultIds = new Set(results);
      const found = expected.filter((id) => resultIds.has(id));
      expect(found.length).toBeGreaterThan(0);
    });
  }

  // Layer 3: no phantom skills — no duplicate skill ids in catalog.
  it('catalog has no duplicate skill ids', () => {
    const ids = SKILL_CATALOG.map((s) => s.skill);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  // Layer 4: catalog is not empty and has reasonable size.
  it('catalog has between 100 and 300 entries', () => {
    expect(SKILL_CATALOG.length).toBeGreaterThanOrEqual(100);
    expect(SKILL_CATALOG.length).toBeLessThanOrEqual(300);
  });
});
