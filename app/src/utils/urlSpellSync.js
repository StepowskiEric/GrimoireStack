/**
 * Pure helpers for syncing the address bar with the open spell modal.
 * Supports two URL forms:
 *   - Query form (legacy):  /?s=<skill>
 *   - Path form (canonical): /s/<skill>
 *
 * The path form is preferred for shareability (per-spell OG, SEO) but the
 * query form is still supported so previously-shared links keep working.
 */

const SPELL_PATH_RE = /^\/s\/([\w.-]+)\/?$/;

export function parseSpellFromLocation(locationLike) {
  const pathname =
    typeof locationLike === 'string'
      ? locationLike.split('?')[0]
      : locationLike.pathname || '';
  const search =
    typeof locationLike === 'string'
      ? locationLike.split('?')[1] || ''
      : (locationLike.search || '').replace(/^\?/, '');

  const pathMatch = pathname.match(SPELL_PATH_RE);
  if (pathMatch) return pathMatch[1];

  if (search) {
    const params = new URLSearchParams(search);
    const skill = params.get('s');
    if (skill) return skill;
  }
  return null;
}

export function buildPathForSpell(skill) {
  return `/s/${encodeURIComponent(skill)}`;
}

export function buildShareUrl(origin, skill) {
  const trimmed = origin.replace(/\/$/, '');
  return `${trimmed}${buildPathForSpell(skill)}`;
}
