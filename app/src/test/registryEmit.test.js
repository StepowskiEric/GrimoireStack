import { describe, expect, it } from 'vitest';
import {
  buildSchools,
  renderSchoolsSource,
  validateRecords,
} from '../../scripts/registry/emit-schools.mjs';

const baseRecord = () => ({
  skill: 'log-trace-correlation',
  topic: 'debugging',
  name: 'Trace Sight',
  effect: 'Maps stack traces to source code.',
  status: 'Proven',
  note: null,
  combos: null,
  trueName: null,
  kins: null,
  lastUpdated: '2026-01-01',
});

describe('buildSchools — trueName / kins emission', () => {
  it('emits trueName and kins when present on a record', () => {
    const schools = buildSchools(
      [
        {
          ...baseRecord(),
          trueName: 'The Eye That Reads',
          kins: ['bisect-debugging', 'root-cause-analysis'],
        },
      ],
      { spells: {}, schools: {} },
    );
    expect(schools).toHaveLength(1);
    const spell = schools[0].spells[0];
    expect(spell.trueName).toBe('The Eye That Reads');
    expect(spell.kins).toEqual(['bisect-debugging', 'root-cause-analysis']);
  });

  it('omits trueName when null/empty', () => {
    const schools = buildSchools([baseRecord()], { spells: {}, schools: {} });
    const spell = schools[0].spells[0];
    expect(spell).not.toHaveProperty('trueName');
  });

  it('omits trueName when empty string', () => {
    const schools = buildSchools([{ ...baseRecord(), trueName: '' }], { spells: {}, schools: {} });
    const spell = schools[0].spells[0];
    expect(spell).not.toHaveProperty('trueName');
  });

  it('omits kins when null', () => {
    const schools = buildSchools([baseRecord()], { spells: {}, schools: {} });
    const spell = schools[0].spells[0];
    expect(spell).not.toHaveProperty('kins');
  });

  it('omits kins when empty array', () => {
    const schools = buildSchools([{ ...baseRecord(), kins: [] }], { spells: {}, schools: {} });
    const spell = schools[0].spells[0];
    expect(spell).not.toHaveProperty('kins');
  });

  it('still emits note and combos alongside the new fields', () => {
    const schools = buildSchools(
      [
        {
          ...baseRecord(),
          note: 'compact summary',
          combos: ['Bisect Divination', 'Root Cause Revelation'],
          trueName: 'The Eye',
          kins: ['bisect-debugging'],
        },
      ],
      { spells: {}, schools: {} },
    );
    const spell = schools[0].spells[0];
    expect(spell.note).toBe('compact summary');
    expect(spell.combos).toEqual(['Bisect Divination', 'Root Cause Revelation']);
    expect(spell.trueName).toBe('The Eye');
    expect(spell.kins).toEqual(['bisect-debugging']);
  });

  it('keeps the round-trippable shape the registry contract expects', () => {
    // Run JSON.parse(JSON.stringify(...)) to confirm the emitted object is
    // pure data — no Maps, no Symbols — and survives serialization.
    const schools = buildSchools(
      [
        {
          ...baseRecord(),
          trueName: 'The Eye',
          kins: ['bisect-debugging'],
        },
      ],
      { spells: {}, schools: {} },
    );
    const round = JSON.parse(JSON.stringify(schools));
    expect(round[0].spells[0].trueName).toBe('The Eye');
    expect(round[0].spells[0].kins).toEqual(['bisect-debugging']);
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
    expect(source).toMatch(/^const schools = /m);
    expect(source).toMatch(/export default schools;\s*$/);
    expect(source).toMatch(/AUTO-GENERATED/);
  });
});

describe('validateRecords — kin integrity at build time', () => {
  function makeLogger() {
    const messages = [];
    return { messages, log: (m) => messages.push(m) };
  }

  it('returns empty report for clean data', () => {
    const records = [
      { skill: 'a', kins: ['b'] },
      { skill: 'b', kins: [] },
      { skill: 'c' /* no kins */ },
    ];
    const allIds = new Set(['a', 'b', 'c']);
    const logger = makeLogger();
    const report = validateRecords(records, allIds, { logger: logger.log });
    expect(report.overCap).toEqual([]);
    expect(report.unresolved).toEqual([]);
    expect(logger.messages).toEqual([]);
  });

  it('flags every kin id that does not resolve to a known skill', () => {
    const records = [
      { skill: 'a', kins: ['b', 'ghost-1'] },
      { skill: 'c', kins: ['d', 'ghost-2', 'e'] },
    ];
    const allIds = new Set(['a', 'b', 'c', 'd', 'e']);
    const logger = makeLogger();
    const report = validateRecords(records, allIds, { logger: logger.log });
    expect(report.unresolved).toEqual([
      { from: 'a', to: 'ghost-1' },
      { from: 'c', to: 'ghost-2' },
    ]);
    expect(logger.messages).toHaveLength(2);
    expect(logger.messages[0]).toMatch(/unresolved kin "ghost-1"/);
    expect(logger.messages[1]).toMatch(/unresolved kin "ghost-2"/);
  });

  it('flags spells whose curated kins list exceeds the UI cap', () => {
    const records = [
      { skill: 'a', kins: ['b', 'c', 'd', 'e', 'f'] }, // 5 kins, cap is 3
      { skill: 'b', kins: ['a'] }, // 1 kin, fine
    ];
    const allIds = new Set(['a', 'b', 'c', 'd', 'e', 'f']);
    const logger = makeLogger();
    const report = validateRecords(records, allIds, { logger: logger.log });
    expect(report.overCap).toEqual([{ skill: 'a', count: 5 }]);
    expect(report.unresolved).toEqual([]);
    expect(logger.messages[0]).toMatch(/has 5 kins/);
    expect(logger.messages[0]).toMatch(/at most 3/);
  });

  it('reports both over-cap and unresolved in the same spell', () => {
    const records = [{ skill: 'a', kins: ['b', 'c', 'd', 'ghost', 'also-ghost'] }];
    const allIds = new Set(['a', 'b', 'c', 'd']);
    const logger = makeLogger();
    const report = validateRecords(records, allIds, { logger: logger.log });
    expect(report.overCap).toEqual([{ skill: 'a', count: 5 }]);
    expect(report.unresolved).toEqual([
      { from: 'a', to: 'ghost' },
      { from: 'a', to: 'also-ghost' },
    ]);
    expect(logger.messages).toHaveLength(3);
  });

  it('skips records whose kins field is not an array', () => {
    const records = [{ skill: 'a' }, { skill: 'b', kins: null }, { skill: 'c', kins: undefined }];
    const allIds = new Set(['a', 'b', 'c']);
    const logger = makeLogger();
    const report = validateRecords(records, allIds, { logger: logger.log });
    expect(report.overCap).toEqual([]);
    expect(report.unresolved).toEqual([]);
    expect(logger.messages).toEqual([]);
  });

  it('defaults to console.warn when no logger is provided', () => {
    const records = [{ skill: 'a', kins: ['ghost'] }];
    const allIds = new Set(['a']);
    const report = validateRecords(records, allIds);
    expect(report.unresolved).toEqual([{ from: 'a', to: 'ghost' }]);
    // Console.warn was called (not asserted directly to keep the test quiet).
  });

  it('boundary: exactly the cap (3 kins) is not flagged as over-cap', () => {
    const records = [{ skill: 'a', kins: ['b', 'c', 'd'] }];
    const allIds = new Set(['a', 'b', 'c', 'd']);
    const logger = makeLogger();
    const report = validateRecords(records, allIds, { logger: logger.log });
    expect(report.overCap).toEqual([]);
    expect(logger.messages).toEqual([]);
  });
});
