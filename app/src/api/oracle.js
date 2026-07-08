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

  console.log('[oracle-api] request', { mode, queryLength: query?.length, historyLength: history?.length });

  const res = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('[oracle-api] non-ok response', { status: res.status, body: errText.slice(0, 500) });
    let err;
    try { err = JSON.parse(errText); } catch { err = {}; }
    throw new Error(err.error || `Server error (${res.status})`);
  }

  const data = await res.json();
  console.log('[oracle-api] response', { type: data.type, resultsCount: data.results?.length, source: data.source });
  return data;
}
