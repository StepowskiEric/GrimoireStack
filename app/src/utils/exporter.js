/**
 * GrimoireStack — Export helpers
 *
 * Pure functions for serializing user state (favorites, marginalia,
 * recent spells) as Markdown and JSON. Kept side-effect free so
 * they can be unit-tested.
 */

function escapeMd(s) {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

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

export function exportAsJson({ favorites, marginalia, recent, meta } = {}) {
  const favs = favorites ?? loadFavorites();
  const marg = marginalia ?? loadMarginalia();
  const rec = recent ?? loadRecent();
  const payload = {
    schema: 'grimoirestack.config.v1',
    exportedAt: new Date().toISOString(),
    meta: meta || { source: 'GrimoireStack' },
    favorites: favs,
    recent: rec,
    marginalia: marg,
  };
  return JSON.stringify(payload, null, 2);
}

export function exportAsMarkdown({ favorites, marginalia, recent } = {}) {
  const favs = favorites ?? loadFavorites();
  const marg = marginalia ?? loadMarginalia();
  const rec = recent ?? loadRecent();
  const lines = [];
  lines.push('# GrimoireStack — Personal Config');
  lines.push('');
  lines.push(`Exported ${new Date().toISOString().slice(0, 10)}`);
  lines.push('');

  lines.push('## Favorites');
  if (!favs.length) {
    lines.push('_None yet — star spells to bind them here._');
  } else {
    for (const f of favs) {
      const note = marg[f.skill];
      lines.push(`- **${f.name}** (\`${f.skill}\`)`);
      if (note) lines.push(`  - Note: ${escapeMd(note)}`);
    }
  }
  lines.push('');

  lines.push('## Recently viewed');
  if (!rec.length) {
    lines.push('_Empty._');
  } else {
    for (const r of rec) {
      const note = marg[r.skill];
      lines.push(`- ${r.name} (\`${r.skill}\`)`);
      if (note) lines.push(`  - Note: ${escapeMd(note)}`);
    }
  }
  lines.push('');

  lines.push('## Marginalia');
  const margKeys = Object.keys(marg);
  if (!margKeys.length) {
    lines.push('_No notes scribbled yet._');
  } else {
    for (const skill of margKeys) {
      lines.push(`### \`${skill}\``);
      lines.push('');
      lines.push(marg[skill]);
      lines.push('');
    }
  }

  return lines.join('\n');
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
