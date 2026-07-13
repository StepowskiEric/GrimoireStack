/**
 * GrimoireStack — Shared Data Contract
 *
 * Canonical schema for schools, spells, wizard categories, and situations.
 * Both the React app and static site should validate/derive against this contract
 * rather than relying on implicit shape.
 */

export interface Spell {
  name: string;
  skill: string;
  effect: string;
  status?: string;
  note?: string;
  combos?: string[];
}

export interface School {
  id: string;
  real: string;
  name: string;
  symbol?: string;
  desc: string;
  spells: Spell[];
}

export interface WizardSituation {
  id: string;
  label: string;
  desc: string;
  skill: string;
  effect: string;
  reason: string;
  alt?: string;
}

export interface WizardCategory {
  id: string;
  label: string;
  desc: string;
  situations: WizardSituation[];
}

/**
 * Validate that a spell conforms to the contract.
 */
export function validateSpell(candidate: unknown): Spell {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Spell must be an object');
  }
  const spell = candidate as Spell;
  if (typeof spell.name !== 'string' || !spell.name.trim()) {
    throw new Error('Spell.name must be a non-empty string');
  }
  if (typeof spell.skill !== 'string' || !spell.skill.trim()) {
    throw new Error('Spell.skill must be a non-empty string');
  }
  if (typeof spell.effect !== 'string' || !spell.effect.trim()) {
    throw new Error('Spell.effect must be a non-empty string');
  }
  if (spell.combos && !Array.isArray(spell.combos)) {
    throw new Error('Spell.combos must be an array of strings');
  }
  return spell;
}

/**
 * Validate that a school conforms to the contract.
 */
export function validateSchool(candidate: unknown): School {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('School must be an object');
  }
  const school = candidate as School;
  if (typeof school.id !== 'string' || !school.id.trim()) {
    throw new Error('School.id must be a non-empty string');
  }
  if (typeof school.name !== 'string' || !school.name.trim()) {
    throw new Error('School.name must be a non-empty string');
  }
  if (!Array.isArray(school.spells)) {
    throw new Error('School.spells must be an array');
  }
  return {
    ...school,
    spells: school.spells.map(validateSpell),
  };
}

/**
 * Validate the full schools array against the contract.
 */
export function validateSchools(schoolsArray: unknown): School[] {
  if (!Array.isArray(schoolsArray)) {
    throw new Error('Schools must be an array');
  }
  return schoolsArray.map(validateSchool);
}
