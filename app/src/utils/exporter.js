/**
 * GrimoireStack — Export helpers
 *
 * Browser-side adapter. Serialization is pure (in serializeConfig.js);
 * this module owns the localStorage reads and clipboard writes.
 */

function safeParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function loadArray(key) {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(key), []);
}

function loadObject(key) {
  if (typeof window === 'undefined') return {};
  return safeParse(window.localStorage.getItem(key), {});
}

export function loadFavorites() {
  return loadArray('grimoire-favorites');
}

export function loadMarginalia() {
  return loadObject('grimoire-marginalia');
}

export function loadRecent() {
  return loadArray('grimoire-recent');
}

import { serializeConfig, serializeMarkdown } from './serializeConfig.js';

/**
 * Serialize user state as JSON. Pass hook state directly for purity;
 * omit arguments to fall back to localStorage (legacy behavior).
 *
 * @param {Object} opts
 * @param {Array}  [opts.favorites]
 * @param {Object} [opts.marginalia]
 * @param {Array}  [opts.recent]
 * @param {Object} [opts.meta]
 * @returns {string}
 */
export function exportAsJson({ favorites, marginalia, recent, meta } = {}) {
  const favs = favorites ?? loadFavorites();
  const marg = marginalia ?? loadMarginalia();
  const rec = recent ?? loadRecent();
  return serializeConfig({ favorites: favs, marginalia: marg, recent: rec, meta });
}

/**
 * Serialize user state as Markdown. Pass hook state directly for purity;
 * omit arguments to fall back to localStorage (legacy behavior).
 *
 * @param {Object} opts
 * @param {Array}  [opts.favorites]
 * @param {Object} [opts.marginalia]
 * @param {Array}  [opts.recent]
 * @returns {string}
 */
export function exportAsMarkdown({ favorites, marginalia, recent } = {}) {
  const favs = favorites ?? loadFavorites();
  const marg = marginalia ?? loadMarginalia();
  const rec = recent ?? loadRecent();
  return serializeMarkdown({ favorites: favs, marginalia: marg, recent: rec });
}

export async function copyToClipboard(text) {
  if (typeof navigator === 'undefined') return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through
    }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Parse a previously-exported JSON config string.
 * Returns { favorites, marginalia, recent } on success,
 * or null on failure.
 */
export function importConfig(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  if (parsed.schema !== 'grimoirestack.config.v1') return null;
  const favorites = Array.isArray(parsed.favorites) ? parsed.favorites : [];
  const marginalia = parsed.marginalia && typeof parsed.marginalia === 'object' && !Array.isArray(parsed.marginalia)
    ? parsed.marginalia
    : {};
  const recent = Array.isArray(parsed.recent) ? parsed.recent : [];
  return { favorites, marginalia, recent };
}
