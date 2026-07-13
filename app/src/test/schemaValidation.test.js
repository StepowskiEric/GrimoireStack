import { describe, expect, it } from 'vitest';
import { validateSchool, validateSchools, validateSpell } from '../data/schema.ts';

const baseSpell = () => ({
  name: 'Trace Sight',
  skill: 'log-trace-correlation',
  effect: 'Maps stack traces to source code.',
  status: 'Proven',
});

describe('validateSpell', () => {
  it('accepts a valid spell', () => {
    const spell = validateSpell(baseSpell());
    expect(spell.name).toBe('Trace Sight');
  });

  it('throws for non-object', () => {
    expect(() => validateSpell(null)).toThrow(/Spell must be an object/);
    expect(() => validateSpell(42)).toThrow(/Spell must be an object/);
  });

  it('throws when name is missing', () => {
    expect(() => validateSpell({ skill: 'x', effect: 'y' })).toThrow(/Spell.name must be a non-empty string/);
  });

  it('throws when skill is missing', () => {
    expect(() => validateSpell({ name: 'A', effect: 'y' })).toThrow(/Spell.skill must be a non-empty string/);
  });

  it('throws when effect is missing', () => {
    expect(() => validateSpell({ name: 'A', skill: 'x' })).toThrow(/Spell.effect must be a non-empty string/);
  });

  it('accepts combos as an array', () => {
    const spell = validateSpell({ ...baseSpell(), combos: ['A', 'B'] });
    expect(spell.combos).toEqual(['A', 'B']);
  });

  it('throws when combos is not an array', () => {
    expect(() => validateSpell({ ...baseSpell(), combos: 'not-array' })).toThrow(/combos must be an array/);
  });
});

describe('validateSchool / validateSchools', () => {
  it('validates a school with spells', () => {
    const school = validateSchool({
      id: 'debugging',
      name: 'Debugging',
      spells: [baseSpell()],
    });
    expect(school.id).toBe('debugging');
    expect(school.spells).toHaveLength(1);
  });

  it('throws for a malformed school', () => {
    expect(() => validateSchool({ id: 'x' })).toThrow(/School.name must be a non-empty string/);
  });

  it('validateSchools runs over the whole array', () => {
    const schools = validateSchools([
      { id: 'a', name: 'A', spells: [baseSpell()] },
      { id: 'b', name: 'B', spells: [baseSpell()] },
    ]);
    expect(schools).toHaveLength(2);
  });
});
