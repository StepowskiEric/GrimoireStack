import { describe, expect, it } from 'vitest';
import { buildSchools, renderSchoolsSource } from '../../scripts/registry/emit-schools.mjs';

const baseRecord = () => ({
  skill: 'log-trace-correlation',
  topic: 'debugging',
  name: 'Trace Sight',
  effect: 'Maps stack traces to source code.',
  status: 'Proven',
  note: null,
  combos: null,
  lastUpdated: '2026-01-01',
});

describe('buildSchools', () => {
  it('builds a school from records', () => {
    const schools = buildSchools([baseRecord()]);
    expect(schools).toHaveLength(1);
    expect(schools[0].id).toBe('debugging');
    expect(schools[0].spells).toHaveLength(1);
    expect(schools[0].spells[0].name).toBe('Trace Sight');
  });

  it('omits note and combos when null', () => {
    const schools = buildSchools([baseRecord()]);
    const spell = schools[0].spells[0];
    expect(spell).not.toHaveProperty('note');
    expect(spell).not.toHaveProperty('combos');
  });

  it('emits note and combos when present', () => {
    const schools = buildSchools([
      {
        ...baseRecord(),
        note: 'compact summary',
        combos: ['Bisect Divination', 'Root Cause Revelation'],
      },
    ]);
    const spell = schools[0].spells[0];
    expect(spell.note).toBe('compact summary');
    expect(spell.combos).toEqual(['Bisect Divination', 'Root Cause Revelation']);
  });

  it('does not emit trueName or kins (theming removed)', () => {
    const schools = buildSchools([baseRecord()]);
    const spell = schools[0].spells[0];
    expect(spell).not.toHaveProperty('trueName');
    expect(spell).not.toHaveProperty('kins');
  });

  it('keeps the round-trippable shape the registry contract expects', () => {
    const schools = buildSchools([baseRecord()]);
    const round = JSON.parse(JSON.stringify(schools));
    expect(round[0].spells[0].name).toBe('Trace Sight');
  });

  it('groups multiple records by topic', () => {
    const schools = buildSchools([
      baseRecord(),
      { ...baseRecord(), skill: 'bisect-debugging', name: 'Bisect Divination' },
    ]);
    expect(schools).toHaveLength(1);
    expect(schools[0].spells).toHaveLength(2);
  });

  it('sorts spells alphabetically by name', () => {
    const schools = buildSchools([
      { ...baseRecord(), skill: 'b', name: 'Z Spell' },
      { ...baseRecord(), skill: 'a', name: 'A Spell' },
    ]);
    expect(schools[0].spells[0].name).toBe('A Spell');
    expect(schools[0].spells[1].name).toBe('Z Spell');
  });
});

describe('renderSchoolsSource', () => {
  it('emits an ESM module that default-exports the schools array', () => {
    const source = renderSchoolsSource([
      {
        id: 'debugging',
        real: 'Debugging',
        name: 'School of Remediation',
        desc: 'Tests',
        spells: [{ name: 'Trace Sight', skill: 'log-trace-correlation', effect: 'X', status: '—' }],
      },
    ]);
    expect(source).toMatch(/^const schools/m);
    expect(source).toMatch(/export default schools;\s*$/);
    expect(source).toMatch(/AUTO-GENERATED/);
  });
});
