/**
 * Shared API primitive for the /api/recommend endpoint.
 *
 * Both useOracle (single-query) and useRitual (multi-turn interview)
 * call this endpoint. This module is the single owner of the fetch
 * contract so error handling and response parsing stay in one place.
 */

export async function callRecommendApi({ query, history, mode } = {}) {
  const body = { query };
  if (mode) body.mode = mode;
  if (history) body.history = history;

  const res = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error (${res.status})`);
  }

  return res.json();
}
