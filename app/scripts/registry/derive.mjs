/**
 * derive.mjs — Derive a spell's display name and effect from its source.
 *
 * Resolution order (highest priority first):
 *   displayName: frontmatter.display-name > first H1 heading > humanize(skill-id)
 *   effect:      frontmatter.description   > "No description provided."
 *
 * The H1 fallback is intentionally narrow: only "Skill: <title>" or
 * a plain "# <title>" heading. We do not walk the body for the effect
 * because body-walking silently returns the wrong thing ("## Purpose",
 * bullet markers, etc.). If a SKILL.md is missing a description,
 * the spell appears with "No description provided." and the author
 * can fill it in.
 */

import { promises as fs } from 'fs';

export function deriveDisplayName(meta, skillId, body) {
  if (meta['display-name']) return meta['display-name'];
  const h1 = body.match(/^#\s+(?:Skill:\s*)?(.+)$/m);
  if (h1) return h1[1].trim();
  return humanize(skillId);
}

export function deriveEffect(meta /* , body, hasFrontmatter */) {
  if (meta.description) return meta.description;
  return 'No description provided.';
}

export function humanize(skillId) {
  return skillId
    .split('-')
    .map(w => /^[A-Z]{2,}$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function fileMtime(filePath) {
  return fs.stat(filePath).then(s => s.mtime).catch(() => new Date());
}

export function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
