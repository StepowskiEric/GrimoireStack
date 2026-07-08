import { useState, useCallback, useRef } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';

/**
 * Runs local fallback matching against grimoireIndex and returns
 * mapped results. Returns empty array if nothing matches.
 */
function fallbackLocal(query, limit = 5) {
  const local = grimoireIndex.matchProblem(query, { limit });
  return local.map((r) => ({
    skill: r.spell.skill,
    name: r.spell.name,
    school: r.school.real,
    score: Math.min(1, r.score / 10),
    reason: r.spell.effect,
  }));
}

/**
 * useOracle — state machine for the Oracle Eye.
 *
 * Manages query, results, loading, error, and oracleState transitions.
 * Falls back to local matchProblem when the AI endpoint is unreachable
 * or returns empty results.
 *
 * State transitions:
 *   idle → consulting → answering  (AI / local success)
 *   idle → consulting → error → answering  (API fails, local fallback)
 *   idle → consulting → error  (API + local both fail)
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
      const apiResults = data.results || [];

      if (apiResults.length > 0) {
        setResults(apiResults);
        setSource(data.source || 'ai');
        setOracleState('answering');
        return;
      }

      // API returned empty — fall back to local matching
      const local = fallbackLocal(q);
      if (local.length > 0) {
        setResults(local);
        setSource('local');
        setOracleState('answering');
      } else {
        setError('No skills matched your query. Try different terms or browse by category.');
      }
    } catch (fetchErr) {
      console.error('[oracle] askOracle failed', fetchErr);
      // Local fallback when the API call itself fails
      const local = fallbackLocal(q);
      if (local.length > 0) {
        setResults(local);
        setSource('local');
        setOracleState('answering');
      } else {
        setError(fetchErr.message || 'Unknown error');
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
