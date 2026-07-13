import { describe, expect, it } from 'vitest';
import {
  getOptionById,
  SEANCE_CONVERGENCE_RUN,
  SEANCE_DARKNESS_THRESHOLD,
  SEANCE_MAX_QUESTIONS,
  SEANCE_MAX_SANITY,
  SEANCE_QUESTIONS,
  SEANCE_SIGILS,
} from '../data/consultationData.ts';
import { grimoireIndex } from '../data/grimoireIndexInstance.ts';

describe('consultationData — sigils', () => {
  it('has exactly 6 sigils', () => {
    expect(SEANCE_SIGILS).toHaveLength(6);
  });

  it('every sigil has the required fields', () => {
    for (const sigil of SEANCE_SIGILS) {
      expect(sigil).toHaveProperty('id');
      expect(typeof sigil.id).toBe('string');
      expect(sigil).toHaveProperty('schoolId');
      expect(sigil).toHaveProperty('crypticName');
      expect(sigil).toHaveProperty('crypticLine');
    }
  });

  it('sigil ids are unique', () => {
    const ids = SEANCE_SIGILS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('sigil schoolIds are unique', () => {
    const ids = SEANCE_SIGILS.map((s) => s.schoolId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every sigil schoolId resolves in grimoireIndex', () => {
    for (const sigil of SEANCE_SIGILS) {
      const school = grimoireIndex.getSchoolForSkill(grimoireIndex.allEntries()[0].spell.skill);
      // We only need to confirm the schoolId is a known school.
      // The seam: pick a known skill from that school, then look it up.
      // Easier: just confirm there's at least one spell in the registry
      // whose schoolId matches.
      const found = grimoireIndex.allEntries().some((e) => e.school.id === sigil.schoolId);
      expect(found, `sigil ${sigil.id} schoolId ${sigil.schoolId} not in registry`).toBe(true);
      // Suppress unused warning.
      void school;
    }
  });
});

describe('consultationData — questions', () => {
  const schoolsWithQuestions = Object.keys(SEANCE_QUESTIONS);

  it('has questions for every sigil school', () => {
    for (const sigil of SEANCE_SIGILS) {
      expect(schoolsWithQuestions, `school ${sigil.schoolId} has no question bank`).toContain(
        sigil.schoolId,
      );
    }
  });

  it('every school has a narrowing pool with at least 3 questions', () => {
    for (const schoolId of schoolsWithQuestions) {
      const narrowing = SEANCE_QUESTIONS[schoolId].narrowing;
      expect(
        Array.isArray(narrowing) && narrowing.length >= 3,
        `${schoolId} narrowing pool has fewer than 3 questions`,
      ).toBe(true);
    }
  });

  it('every school has a darker pool with at least 1 question', () => {
    for (const schoolId of schoolsWithQuestions) {
      const darker = SEANCE_QUESTIONS[schoolId].darker;
      expect(Array.isArray(darker) && darker.length > 0, `${schoolId} darker pool is empty`).toBe(
        true,
      );
    }
  });

  it('every question has the required fields and 3-4 options', () => {
    for (const schoolId of schoolsWithQuestions) {
      for (const pool of ['narrowing', 'darker']) {
        for (const q of SEANCE_QUESTIONS[schoolId][pool]) {
          expect(q).toHaveProperty('id');
          expect(q).toHaveProperty('question');
          expect(typeof q.question).toBe('string');
          expect(q.question.length).toBeGreaterThan(0);
          expect(Array.isArray(q.options)).toBe(true);
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(q.options.length).toBeLessThanOrEqual(4);
        }
      }
    }
  });

  it('option ids are unique within a question', () => {
    for (const schoolId of schoolsWithQuestions) {
      for (const pool of ['narrowing', 'darker']) {
        for (const q of SEANCE_QUESTIONS[schoolId][pool]) {
          const ids = q.options.map((o) => o.id);
          expect(new Set(ids).size, `dup ids in ${q.id}`).toBe(ids.length);
        }
      }
    }
  });

  it('every option has primary + alt skill ids that resolve in the registry', () => {
    for (const schoolId of schoolsWithQuestions) {
      for (const pool of ['narrowing', 'darker']) {
        for (const q of SEANCE_QUESTIONS[schoolId][pool]) {
          for (const opt of q.options) {
            expect(typeof opt.primary).toBe('string');
            expect(typeof opt.alt).toBe('string');
            const primary = grimoireIndex.resolveBySkill(opt.primary);
            const alt = grimoireIndex.resolveBySkill(opt.alt);
            expect(primary, `primary ${opt.primary} in ${opt.id} not found`).not.toBeNull();
            expect(alt, `alt ${opt.alt} in ${opt.id} not found`).not.toBeNull();
          }
        }
      }
    }
  });

  it('option ids are unique across the whole bank', () => {
    const seen = new Set();
    for (const schoolId of schoolsWithQuestions) {
      for (const pool of ['narrowing', 'darker']) {
        for (const q of SEANCE_QUESTIONS[schoolId][pool]) {
          for (const opt of q.options) {
            expect(seen.has(opt.id), `duplicate option id ${opt.id}`).toBe(false);
            seen.add(opt.id);
          }
        }
      }
    }
  });
});

describe('consultationData — constants', () => {
  it('SEANCE_MAX_SANITY is 5', () => {
    expect(SEANCE_MAX_SANITY).toBe(5);
  });
  it('SEANCE_MAX_QUESTIONS is 5', () => {
    expect(SEANCE_MAX_QUESTIONS).toBe(5);
  });
  it('SEANCE_CONVERGENCE_RUN is 2', () => {
    expect(SEANCE_CONVERGENCE_RUN).toBe(2);
  });
  it('SEANCE_DARKNESS_THRESHOLD is 2', () => {
    expect(SEANCE_DARKNESS_THRESHOLD).toBe(2);
  });
});

describe('consultationData — helpers', () => {
  it('getOptionById returns the option, question, and pool', () => {
    const found = getOptionById('debugging', 'dbg-n1-a');
    expect(found).not.toBeNull();
    expect(found.option.id).toBe('dbg-n1-a');
    expect(found.question.id).toBe('dbg-n1');
    expect(found.pool).toBe('narrowing');
  });

  it('getOptionById returns null for unknown option', () => {
    expect(getOptionById('debugging', 'not-an-option')).toBeNull();
  });
});
