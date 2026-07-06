import { useState, useCallback, useRef } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';

/**
 * useOracle — state machine for the Oracle Eye.
 *
 * Manages query, results, loading, error, and oracleState transitions.
 * Falls back to local matchProblem when the AI endpoint is unreachable.
 *
 * State transitions:
 *   idle → consulting → answering  (AI success)
 *   idle → consulting → error → answering  (AI fails, local fallback)
 *   idle → error  (immediate failure, no fallback)
 */
export function useOracle() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [oracleState, setOracleState] = useState('idle');
  const [source, setSource] = useState(null);
  const loadingRef = useRef(false);

  const askOracle = useCallback(async () => {
    const q = query.trim();
    if (!q || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setResults([]);
    setOracleState('consulting');
    setSource(null);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error (${res.status})`);
      }
      const data = await res.json();
      setResults(data.results || []);
      setSource('ai');
      setOracleState('answering');
    } catch (fetchErr) {
      // Try local fallback
      setOracleState('error');
      try {
        const local = grimoireIndex.matchProblem(q, { limit: 5 });
        if (local.length > 0) {
          const mapped = local.map((r) => ({
            skill: r.spell.skill,
            name: r.spell.name,
            school: r.school.real,
            score: Math.min(1, r.score / 10),
            reason: r.spell.effect,
          }));
          setResults(mapped);
          setSource('local');
          setOracleState('answering');
        } else {
          setError(fetchErr.message);
        }
      } catch {
        setError(fetchErr.message);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [query]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setOracleState('idle');
    setSource(null);
    setLoading(false);
    loadingRef.current = false;
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    oracleState,
    source,
    askOracle,
    clear,
  };
}
