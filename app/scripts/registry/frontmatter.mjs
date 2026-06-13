/**
 * frontmatter.mjs — Parse YAML frontmatter from SKILL.md files.
 *
 * Supports a deliberately small subset of YAML:
 *   key: value
 *   key: "quoted value"
 *   key: [a, b, c]
 *
 * Anything more complex (nested mappings, multiline, block scalars)
 * is not supported. Skills should use flat frontmatter; richer
 * structure belongs in the body, not the frontmatter.
 *
 * Returns { meta, body } — the parsed key/value pairs and the
 * post-frontmatter body content.
 */

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { meta: {}, body: content, hasFrontmatter: false };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-z0-9_-]+):\s*(.*)$/i);
    if (!m) continue;
    meta[m[1]] = parseValue(m[2].trim());
  }
  return { meta, body: content.slice(match[0].length), hasFrontmatter: true };
}

function parseValue(raw) {
  // Quoted string
  if ((raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  // Inline array: [a, b, c]
  if (raw.startsWith('[') && raw.endsWith(']')) {
    return raw.slice(1, -1)
      .split(',')
      .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  return raw;
}
