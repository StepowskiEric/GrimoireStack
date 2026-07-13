import { serializeConfig, serializeMarkdown } from './serializeConfig.ts';

function safeParse(raw: string | null, fallback: unknown): unknown {
  try {
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function loadArray(key: string): unknown[] {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(key), []) as unknown[];
}

function loadObject(key: string): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  return safeParse(window.localStorage.getItem(key), {}) as Record<string, unknown>;
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

export function exportAsJson({
  favorites,
  marginalia,
  recent,
  meta,
}: {
  favorites?: unknown[];
  marginalia?: Record<string, unknown>;
  recent?: unknown[];
  meta?: Record<string, unknown>;
} = {}): string {
  const favs = favorites ?? loadFavorites();
  const marg = (marginalia ?? loadMarginalia()) as Record<string, string>;
  const rec = recent ?? loadRecent();
  return serializeConfig({
    favorites: favs as Array<{ name: string; skill: string; addedAt?: number }>,
    marginalia: marg,
    recent: rec as Array<{ name: string; skill: string; viewedAt?: number }>,
    meta,
  });
}

export function exportAsMarkdown({
  favorites,
  marginalia,
  recent,
}: {
  favorites?: unknown[];
  marginalia?: Record<string, unknown>;
  recent?: unknown[];
} = {}): string {
  const favs = favorites ?? loadFavorites();
  const marg = (marginalia ?? loadMarginalia()) as Record<string, string>;
  const rec = recent ?? loadRecent();
  return serializeMarkdown({
    favorites: favs as Array<{ name: string; skill: string }>,
    marginalia: marg,
    recent: rec as Array<{ name: string; skill: string }>,
  });
}

export async function copyToClipboard(text: string): Promise<boolean> {
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

export function importConfig(raw: string): {
  favorites: unknown[];
  marginalia: Record<string, unknown>;
  recent: unknown[];
} | null {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  if (parsed.schema !== 'grimoirestack.config.v1') return null;
  const favorites = Array.isArray(parsed.favorites) ? parsed.favorites : [];
  const marginalia =
    parsed.marginalia && typeof parsed.marginalia === 'object' && !Array.isArray(parsed.marginalia)
      ? (parsed.marginalia as Record<string, unknown>)
      : {};
  const recent = Array.isArray(parsed.recent) ? parsed.recent : [];
  return { favorites, marginalia, recent };
}
