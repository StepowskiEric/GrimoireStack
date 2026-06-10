export function getSpellTier(spell) {
  const status = (spell.status || '').trim();
  const hasMCP = /(?:^|[\s-])MCP(?:$|[\s-])/.test(status);
  const hasHybrid = /(?:^|[\s-])Hybrid(?:$|[\s-])/.test(status);
  const hasProven = status === 'Proven';
  const comboCount = Array.isArray(spell.combos) ? spell.combos.length : 0;

  if (hasProven && (hasMCP || hasHybrid || comboCount >= 3)) return 'archmage';
  if (hasProven && comboCount >= 1) return 'master';
  if (hasProven) return 'adept';
  if (hasMCP) return 'master';
  if (hasHybrid) return 'adept';
  if (status === 'New' || status === 'Framework') return 'apprentice';
  return 'faded';
}

export const TIER_META = {
  faded: {
    label: 'Faded Glyph',
    className: 'sigil-tier-faded',
    title: 'Faded Glyph — Common or uncatalogued',
  },
  apprentice: {
    label: 'Apprentice Sigil',
    className: 'sigil-tier-apprentice',
    title: 'Apprentice Sigil — New or emerging',
  },
  adept: {
    label: 'Adept Sigil',
    className: 'sigil-tier-adept',
    title: 'Adept Sigil — Framework or hybrid path',
  },
  master: {
    label: 'Master Sigil',
    className: 'sigil-tier-master',
    title: 'Master Sigil — Proven or tool-integrated',
  },
  archmage: {
    label: 'Archmage Sigil',
    className: 'sigil-tier-archmage',
    title: 'Archmage Sigil — Proven and highly connected',
  },
};
