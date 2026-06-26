import { describe, it, expect } from 'vitest';
import schools from '../data/schools.js';
import { WIZARD_DATA } from '../data/schools.js';

describe('schools data', () => {
  it('exports an array of schools', () => {
    expect(Array.isArray(schools)).toBe(true);
    expect(schools.length).toBeGreaterThan(0);
  });

  it('each school has required fields', () => {
    for (const school of schools) {
      expect(school).toHaveProperty('id');
      expect(school).toHaveProperty('name');
      expect(school).toHaveProperty('real');
      expect(school).toHaveProperty('desc');
      expect(school).toHaveProperty('spells');
      expect(Array.isArray(school.spells)).toBe(true);
    }
  });

  it('each spell has required fields', () => {
    for (const school of schools) {
      for (const spell of school.spells) {
        expect(spell).toHaveProperty('name');
        expect(spell).toHaveProperty('skill');
        expect(spell).toHaveProperty('effect');
        expect(spell).toHaveProperty('status');
      }
    }
  });

  it('trueName is optional and only a string when present', () => {
    for (const school of schools) {
      for (const spell of school.spells) {
        if (spell.trueName !== undefined) {
          expect(typeof spell.trueName).toBe('string');
          expect(spell.trueName.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('kins is optional and only an array of non-empty strings when present', () => {
    for (const school of schools) {
      for (const spell of school.spells) {
        if (spell.kins !== undefined) {
          expect(Array.isArray(spell.kins)).toBe(true);
          for (const k of spell.kins) {
            expect(typeof k).toBe('string');
            expect(k.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('every kins entry resolves to an existing skill', () => {
    for (const school of schools) {
      for (const spell of school.spells) {
        if (!Array.isArray(spell.kins)) continue;
        for (const k of spell.kins) {
          const found = schools.some(s => s.spells.some(sp => sp.skill === k));
          expect(found, `kin "${k}" on spell "${spell.skill}" must exist in the catalog`).toBe(true);
        }
      }
    }
  });

  it('has unique school IDs', () => {
    const ids = schools.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique spell name values within each school', () => {
    for (const school of schools) {
      const names = school.spells.map(s => s.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('has a non-zero number of spells in each school', () => {
    for (const school of schools) {
      expect(school.spells.length).toBeGreaterThan(0);
    }
  });
});

describe('WIZARD_DATA', () => {
  it('is an array of wizard categories', () => {
    expect(Array.isArray(WIZARD_DATA)).toBe(true);
    expect(WIZARD_DATA.length).toBeGreaterThan(0);
  });

  it('each category has required fields', () => {
    for (const cat of WIZARD_DATA) {
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('label');
      expect(cat).toHaveProperty('situations');
      expect(Array.isArray(cat.situations)).toBe(true);
    }
  });

  it('each situation has required fields', () => {
    for (const cat of WIZARD_DATA) {
      for (const sit of cat.situations) {
        expect(sit).toHaveProperty('id');
        expect(sit).toHaveProperty('label');
        expect(sit).toHaveProperty('skill');
        expect(sit).toHaveProperty('effect');
        expect(sit).toHaveProperty('reason');
      }
    }
  });

  it('has unique category IDs', () => {
    const ids = WIZARD_DATA.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each category has at least one situation', () => {
    for (const cat of WIZARD_DATA) {
      expect(cat.situations.length).toBeGreaterThan(0);
    }
  });
});
