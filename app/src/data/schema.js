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

/**
 * Validate wizard category data.
 * @param {unknown} candidate
 * @returns {WizardCategory}
 */
export function validateWizardCategory(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Wizard category must be an object');
  }
  const cat = /** @type {WizardCategory} */ (candidate);
  if (typeof cat.id !== 'string' || !cat.id.trim()) {
    throw new Error('Wizard category id must be a non-empty string');
  }
  if (!Array.isArray(cat.situations)) {
    throw new Error('Wizard category situations must be an array');
  }
  return {
    ...cat,
    situations: cat.situations.map(sit => {
      if (!sit || typeof sit !== 'object') {
        throw new Error('Wizard situation must be an object');
      }
      if (typeof sit.id !== 'string' || !sit.id.trim()) {
        throw new Error('Wizard situation id must be a non-empty string');
      }
      if (typeof sit.skill !== 'string' || !sit.skill.trim()) {
        throw new Error('Wizard situation skill must be a non-empty string');
      }
      return /** @type {WizardSituation} */ (sit);
    }),
  };
}

/**
 * Validate the full wizard data array.
 * @param {unknown} wizardData
 * @returns {WizardCategory[]}
 */
export function validateWizardData(wizardData) {
  if (!Array.isArray(wizardData)) {
    throw new Error('Wizard data must be an array');
  }
  return wizardData.map(validateWizardCategory);
}
