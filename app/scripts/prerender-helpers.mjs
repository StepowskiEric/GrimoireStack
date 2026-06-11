/**
 * Pure helpers used by the prerender build step.
 * Kept side-effect-free so they can be unit-tested in jsdom/vitest.
 */

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function truncateDescription(text, max = 200) {
  const trimmed = String(text || '').trim();
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  const base = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return base.replace(/[.,;:!?-]*$/, '') + '…';
}

/**
 * Inject per-spell <title>, description, OG, Twitter, and canonical link
 * into the SPA shell HTML, while preserving all existing tags.
 */
export function injectSpellMeta(shellHtml, { name, effect, skill, origin }) {
  const safeName = escapeHtml(name);
  const safeEffect = escapeHtml(truncateDescription(effect));
  const safePath = `/s/${encodeURIComponent(skill)}`;
  const originTrimmed = String(origin).replace(/\/$/, '');

  const title = `<title>GrimoireStack — ${safeName}</title>`;
  const description = `<meta name="description" content="${safeEffect}">`;
  const ogTitle = `<meta property="og:title" content="${safeName} — GrimoireStack">`;
  const ogDescription = `<meta property="og:description" content="${safeEffect}">`;
  const ogType = `<meta property="og:type" content="article">`;
  const ogUrl = `<meta property="og:url" content="${originTrimmed}${safePath}">`;
  const ogImage = `<meta property="og:image" content="${originTrimmed}/og-image.png">`;
  const twCard = `<meta name="twitter:card" content="summary_large_image">`;
  const twTitle = `<meta name="twitter:title" content="${safeName} — GrimoireStack">`;
  const twDescription = `<meta name="twitter:description" content="${safeEffect}">`;
  const twImage = `<meta name="twitter:image" content="${originTrimmed}/og-image.png">`;
  const canonical = `<link rel="canonical" href="${originTrimmed}${safePath}">`;

  const metaBlock = [
    title,
    description,
    ogTitle,
    ogDescription,
    ogType,
    ogUrl,
    ogImage,
    twCard,
    twTitle,
    twDescription,
    twImage,
    canonical,
  ].join('\n  ');

  return shellHtml.replace(/<title>[\s\S]*?<\/title>/, metaBlock);
}
