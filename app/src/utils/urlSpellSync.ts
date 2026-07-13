const SPELL_PATH_RE = /^\/s\/([\w.-]+)\/?$/;

export function parseSpellFromLocation(locationLike: string | { pathname?: string; search?: string }): string | null {
  const pathname =
    typeof locationLike === 'string' ? locationLike.split('?')[0] : locationLike.pathname || '';
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

export function buildPathForSpell(skill: string): string {
  return `/s/${encodeURIComponent(skill)}`;
}

export function buildShareUrl(origin: string, skill: string): string {
  const trimmed = origin.replace(/\/$/, '');
  return `${trimmed}${buildPathForSpell(skill)}`;
}
