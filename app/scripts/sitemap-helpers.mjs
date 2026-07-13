/**
 * Pure helpers for sitemap.xml generation.
 */

export function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build a sitemap.xml string from an origin and a list of URL paths.
 * Paths should start with `/`. The home URL is always included.
 */
export function buildSitemapXml({ origin, paths = [] }) {
  const base = String(origin).replace(/\/$/, '');
  const allPaths = ['/', ...paths.filter((p) => p && p !== '/')];
  const urls = allPaths
    .map((p) => `  <url>\n    <loc>${escapeXml(base + p)}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
