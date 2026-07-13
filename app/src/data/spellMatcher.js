/**
 * spellMatcher — similarity and problem-matching scorers.
 *
 * Both matchers iterate the catalog and produce scored results.
 * They own the scoring rules (token weights, stopwords, bonuses)
 * so those rules live in one place.
 */

const PROBLEM_STOPWORDS = new Set([
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

function tokenizeProblem(text) {
  const out = new Set();
  const cleaned = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ');
  for (const raw of cleaned.split(/\s+/)) {
    if (raw && !PROBLEM_STOPWORDS.has(raw) && raw.length > 1) {
      out.add(raw);
    }
  }
  return [...out];
}

export function createSpellMatcher(core) {
  const { iterate } = core;

  // similarTo: substring + token overlap on skill id and spell name.
  // Substring hits are weighted 5x a single token hit so a complete
  // match outranks partials.
  const similarTo = (query, limit = 4) => {
    if (!query) return [];
    const q = String(query).toLowerCase().trim();
    if (!q) return [];
    const tokens = q.split(/[\s\-_.]+/).filter(Boolean);

    const scored = [];
    for (const entry of iterate()) {
      const haystack = `${entry.spell.skill} ${entry.spell.name}`.toLowerCase();
      let score = 0;
      if (haystack.includes(q)) score += 5;
      for (const t of tokens) {
        if (haystack.includes(t)) score += 1;
      }
      if (score > 0) scored.push({ entry, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.entry);
  };

  // matchProblem: stopword-filtered token overlap against a broader
  // haystack (name + skill + effect + school name + real name + status).
  const matchProblem = (query, { limit = 5 } = {}) => {
    const tokens = tokenizeProblem(query);
    if (tokens.length === 0) return [];

    const scored = [];
    for (const entry of iterate()) {
      const { spell, school } = entry;
      const haystack = (
        spell.name +
        ' ' +
        spell.skill +
        ' ' +
        spell.effect +
        ' ' +
        school.name +
        ' ' +
        school.real +
        ' ' +
        (spell.status || '')
      ).toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (haystack.includes(tok)) score += 2;
      }
      if (Array.isArray(spell.combos) && spell.combos.length > 0) score += 0.5;
      if (spell.status === 'Proven') score += 0.5;
      if (score > 0) scored.push({ spell, school, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  };

  return { similarTo, matchProblem };
}
