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
  return base.replace(/[.,;:!?-]*$/, '') + '\u2026';
}

/**
 * Build a fallback description for a spell when its effect is empty
 * or set to the default placeholder.
 */
export function fallbackDescription(name, skill) {
  const readable = skill.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return `How to use the "${name}" agent skill (${readable}) — what it does, when to reach for it, and what you'll get out of it.`;
}

/**
 * Build JSON-LD Article schema for a spell page.
 * Accepts pre-resolved `descriptionText` so the fallback logic lives
 * in one place (injectSpellMeta, the sole caller).
 */
export function buildArticleLdJson({ name, descriptionText, skill, origin }) {
  const safePath = `/s/${encodeURIComponent(skill)}`;
  const originTrimmed = String(origin).replace(/\/$/, '');
  const url = `${originTrimmed}${safePath}`;
  const json = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: name,
    description: descriptionText,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: { '@type': 'Organization', name: 'GrimoireStack' },
  });
  // Escape < and > so the JSON doesn't break the parent <script> tag
  return json.replace(/</g, '\\u003C').replace(/>/g, '\\u003E');
}

/**
 * Inject per-spell <title>, description, OG, Twitter, canonical link,
 * and JSON-LD Article schema into the SPA shell HTML.
 */
export function injectSpellMeta(shellHtml, { name, effect, skill, origin }) {
  const safeName = escapeHtml(name);
  const descriptionText = (effect && effect !== 'No description provided.')
    ? effect
    : fallbackDescription(name, skill);
  const safeEffect = escapeHtml(truncateDescription(descriptionText));
  const safePath = `/s/${encodeURIComponent(skill)}`;
  const originTrimmed = String(origin).replace(/\/$/, '');

  const ldJson = buildArticleLdJson({ name, descriptionText: truncateDescription(descriptionText), skill, origin });

  const title = `<title>GrimoireStack \u2014 ${safeName}</title>`;
  const description = `<meta name="description" content="${safeEffect}">`;
  const ogTitle = `<meta property="og:title" content="${safeName} \u2014 GrimoireStack">`;
  const ogDescription = `<meta property="og:description" content="${safeEffect}">`;
  const ogType = `<meta property="og:type" content="article">`;
  const ogUrl = `<meta property="og:url" content="${originTrimmed}${safePath}">`;
  const ogImage = `<meta property="og:image" content="${originTrimmed}/og-image.png">`;
  const twCard = `<meta name="twitter:card" content="summary_large_image">`;
  const twTitle = `<meta name="twitter:title" content="${safeName} \u2014 GrimoireStack">`;
  const twDescription = `<meta name="twitter:description" content="${safeEffect}">`;
  const twImage = `<meta name="twitter:image" content="${originTrimmed}/og-image.png">`;
  const canonical = `<link rel="canonical" href="${originTrimmed}${safePath}">`;
  const schema = `<script type="application/ld+json">${ldJson}</script>`;

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
    schema,
  ].join('\n  ');

  return shellHtml.replace(/<title>[\s\S]*?<\/title>/, metaBlock);
}
