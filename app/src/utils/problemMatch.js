/**
 * GrimoireStack — Problem intake matcher
 *
 * Pure keyword + token-overlap matcher that maps a free-text problem
 * description to the most relevant spell(s). Used by the
 * ProblemIntake modal to suggest spells without requiring the user
 * to know a school's name.
 */

import schools from '../data/schools.js';

const STOPWORDS = new Set([
  'a','an','the','i','im','ive','id','is','it','of','to','and','or','but',
  'my','in','on','for','with','this','that','those','these','be','been',
  'was','were','are','am','do','does','did','have','has','had','you','your',
  'me','we','us','our','so','just','very','really','about','what','how',
  'when','where','why','which','than','then','too','any','some','no','not',
]);

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w) && w.length > 1);
}

function uniqueTokens(tokens) {
  return Array.from(new Set(tokens));
}

function scoreSpell(spell, school, queryTokens) {
  if (!queryTokens.length) return 0;
  const haystack = (
    spell.name + ' ' +
    spell.skill + ' ' +
    spell.effect + ' ' +
    school.name + ' ' +
    school.real + ' ' +
    (spell.status || '')
  ).toLowerCase();
  let score = 0;
  for (const tok of queryTokens) {
    if (haystack.includes(tok)) score += 2;
  }
  if (spell.combos?.length) score += 0.5;
  if (spell.status === 'Proven') score += 0.5;
  return score;
}

export function matchProblemToSpells(query, { limit = 5 } = {}) {
  const tokens = uniqueTokens(tokenize(query));
  if (!tokens.length) return [];
  const matches = [];
  for (const school of schools) {
    for (const spell of school.spells) {
      const score = scoreSpell(spell, school, tokens);
      if (score > 0) {
        matches.push({ spell, school, score });
      }
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit);
}

export function suggestExampleProblems() {
  return [
    'My tests are failing in CI but pass locally',
    'I have a production bug with no clear repro',
    'Need to refactor a 2000-line legacy module safely',
    'Designing a new microservice and worried about coupling',
    'My code review is taking forever, want to focus on real issues',
    'The agent keeps hallucinating APIs that do not exist',
    'Need to coordinate three subagents without losing context',
    'Want to verify an answer before I commit to it',
  ];
}
