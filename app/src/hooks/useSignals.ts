import { useCallback } from 'react';
import { useLocalStorageState } from './useLocalStorageState.ts';

const STORAGE_KEY = 'grimoire-signals';
const AGGREGATE_KEY = 'grimoire-signals-aggregate';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function useSignals() {
  const { value: votes, setValue: setVotes } = useLocalStorageState<Record<string, string>>({
    key: STORAGE_KEY,
    initial: () => ({}),
  });
  const { value: aggregate } = useLocalStorageState<Record<string, { up: number; down: number; score: number }>>({
    key: AGGREGATE_KEY,
    initial: () => ({}),
  });

  const getVote = useCallback((skill: string) => votes[skill] || null, [votes]);

  const vote = useCallback(
    (skill: string, value: string) => {
      if (!skill) return null;
      setVotes((prev) => {
        const next = { ...prev };
        if (next[skill] === value) {
          delete next[skill];
        } else {
          next[skill] = value;
        }
        return next;
      });
      return value;
    },
    [setVotes],
  );

  const aggregateFor = useCallback(
    (spell: { skill: string; combos?: string[]; status?: string } | null) => {
      if (!spell) return { up: 0, down: 0, score: 0 };
      const cached = aggregate[spell.skill];
      if (cached) return cached;
      const comboCount = Array.isArray(spell.combos) ? spell.combos.length : 0;
      const status = (spell.status || '').trim();
      const tier =
        status === 'Proven'
          ? 4
          : status === 'MCP'
            ? 3
            : status === 'Hybrid'
              ? 3
              : status === 'Framework'
                ? 2
                : status === 'New'
                  ? 1
                  : 0;
      const base = 12 + (hashStr(spell.skill) % 28);
      const up = base + tier * 7 + comboCount * 3;
      const down = Math.max(1, Math.floor((100 - up) / 6) + (hashStr(`${spell.skill}d`) % 4));
      return { up, down, score: up - down };
    },
    [aggregate],
  );

  return { getVote, vote, aggregateFor, allVotes: votes };
}
