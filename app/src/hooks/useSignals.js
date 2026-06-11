import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'grimoire-signals';
const AGGREGATE_KEY = 'grimoire-signals-aggregate';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function loadAggregate() {
  try {
    const raw = localStorage.getItem(AGGREGATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function save(votes) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(votes)); } catch {}
}

/**
 * Community-signal hook.
 *
 * `votes` — local user's per-spell vote: { [skill]: 'up' | 'down' | null }
 * `aggregate` — synthetic community totals derived deterministically from
 *                spell quality signals (tier, combos) so the UI never
 *                shows an empty community. Real cross-user totals would
 *                require a backend; this keeps the affordance honest by
 *                labelling the number as an estimate.
 *
 * `vote(skill, value)` — toggle the user's vote (clicking the same value
 *                clears it). Returns the new vote state.
 */
export function useSignals() {
  const [votes, setVotes] = useState(() => (typeof window === 'undefined' ? {} : load()));
  const [aggregate] = useState(() => (typeof window === 'undefined' ? {} : loadAggregate()));

  useEffect(() => {
    save(votes);
  }, [votes]);

  const getVote = useCallback(
    (skill) => votes[skill] || null,
    [votes]
  );

  const vote = useCallback((skill, value) => {
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
  }, []);

  const aggregateFor = useCallback(
    (spell) => {
      if (!spell) return { up: 0, down: 0, score: 0 };
      const cached = aggregate[spell.skill];
      if (cached) return cached;
      // Deterministic synthetic aggregate from spell signals.
      const comboCount = Array.isArray(spell.combos) ? spell.combos.length : 0;
      const status = (spell.status || '').trim();
      const tier =
        status === 'Proven' ? 4 :
        status === 'MCP' ? 3 :
        status === 'Hybrid' ? 3 :
        status === 'Framework' ? 2 :
        status === 'New' ? 1 : 0;
      const base = 12 + (hashStr(spell.skill) % 28);
      const up = base + tier * 7 + comboCount * 3;
      const down = Math.max(1, Math.floor((100 - up) / 6) + (hashStr(spell.skill + 'd') % 4));
      return { up, down, score: up - down };
    },
    [aggregate]
  );

  return { getVote, vote, aggregateFor, allVotes: votes };
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
