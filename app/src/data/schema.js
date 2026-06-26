/**
 * GrimoireStack — Shared Data Contract
 *
 * Canonical schema for schools, spells, wizard categories, and situations.
 * Both the React app and static site should validate/derive against this contract
 * rather than relying on implicit shape.
 */

/**
 * @typedef {Object} Spell
 * @property {string} name
 * @property {string} skill
 * @property {string} effect
 * @property {string} [status]
 * @property {string} [note]
 * @property {string[]} [combos]
 * @property {string} [trueName]     — poetic 2–4 word canonical incantation handle
 * @property {string[]} [kins]      — skill IDs of related spells (familiar system)
 */

/**
 * @typedef {Object} School
 * @property {string} id
 * @property {string} real
 * @property {string} name
 * @property {string} symbol
 * @property {string} desc
 * @property {Spell[]} spells
 */

/**
 * @typedef {Object} WizardSituation
 * @property {string} id
 * @property {string} label
 * @property {string} desc
 * @property {string} skill
 * @property {string} effect
 * @property {string} reason
 * @property {string} [alt]
 */

/**
 * @typedef {Object} WizardCategory
 * @property {string} id
 * @property {string} label
 * @property {string} desc
 * @property {WizardSituation[]} situations
 */

/**
 * Validate that a spell conforms to the contract.
 * @param {unknown} candidate
 * @returns {Spell}
 */
export function validateSpell(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Spell must be an object');
  }
  const spell = /** @type {Spell} */ (candidate);
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
  if (spell.trueName !== undefined && typeof spell.trueName !== 'string') {
    throw new Error('Spell.trueName must be a string when present');
  }
  if (spell.kins !== undefined) {
    if (!Array.isArray(spell.kins)) {
      throw new Error('Spell.kins must be an array of strings when present');
    }
    for (const k of spell.kins) {
      if (typeof k !== 'string' || !k.trim()) {
        throw new Error('Spell.kins entries must be non-empty strings');
      }
    }
  }
  return spell;
}

/**
 * Validate that a school conforms to the contract.
 * @param {unknown} candidate
 * @returns {School}
 */
export function validateSchool(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('School must be an object');
  }
  const school = /** @type {School} */ (candidate);
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
 * @param {unknown} schoolsArray
 * @returns {School[]}
 */
export function validateSchools(schoolsArray) {
  if (!Array.isArray(schoolsArray)) {
    throw new Error('Schools must be an array');
  }
  return schoolsArray.map(validateSchool);
}

