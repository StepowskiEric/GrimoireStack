/**
 * GrimoireStack — Compare spells helper
 *
 * Pure helpers to compute a diff-friendly representation of two
 * spells for the side-by-side comparison view.
 */

const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'skill', label: 'Skill ID' },
  { key: 'effect', label: 'Effect' },
  { key: 'status', label: 'Status' },
  { key: 'tier', label: 'Tier' },
  { key: 'combos', label: 'Combos' },
  { key: 'note', label: 'Note' },
];

export function compareSpells(left, right) {
  return FIELDS.map((f) => {
    const lv = normalize(left?.[f.key]);
    const rv = normalize(right?.[f.key]);
    return {
      key: f.key,
      label: f.label,
      left: lv,
      right: rv,
      same: lv === rv,
    };
  });
}

function normalize(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}
