/**
 * serializeConfig — pure serialization of user state.
 *
 * No DOM, no localStorage, no React. Takes plain data objects and
 * returns strings. The browser-side exporter delegates here.
 */

function escapeMd(s) {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/**
 * Serialize user state as a JSON string.
 *
 * @param {Object} opts
 * @param {Array}  opts.favorites  — [{ name, skill, addedAt? }, ...]
 * @param {Object} opts.marginalia — { [skill]: string, ... }
 * @param {Array}  opts.recent     — [{ name, skill, viewedAt? }, ...]
 * @param {Object} [opts.meta]     — optional metadata object
 * @returns {string} JSON payload
 */
export function serializeConfig({ favorites = [], marginalia = {}, recent = [], meta } = {}) {
  const payload = {
    schema: 'grimoirestack.config.v1',
    exportedAt: new Date().toISOString(),
    meta: meta || { source: 'GrimoireStack' },
    favorites,
    recent,
    marginalia,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Serialize user state as a Markdown string.
 *
 * @param {Object} opts
 * @param {Array}  opts.favorites
 * @param {Object} opts.marginalia
 * @param {Array}  opts.recent
 * @returns {string} Markdown document
 */
export function serializeMarkdown({ favorites = [], marginalia = {}, recent = [] } = {}) {
  const lines = [];
  lines.push('# GrimoireStack — Personal Config');
  lines.push('');
  lines.push(`Exported ${new Date().toISOString().slice(0, 10)}`);
  lines.push('');

  lines.push('## Favorites');
  if (!favorites.length) {
    lines.push('_None yet — star spells to bind them here._');
  } else {
    for (const f of favorites) {
      lines.push(`- **${f.name}** (\`${f.skill}\`)`);
      const note = marginalia[f.skill];
      if (note) lines.push(`  - Note: ${escapeMd(note)}`);
    }
  }
  lines.push('');

  lines.push('## Recently viewed');
  if (!recent.length) {
    lines.push('_Empty._');
  } else {
    for (const r of recent) {
      lines.push(`- ${r.name} (\`${r.skill}\`)`);
      const note = marginalia[r.skill];
      if (note) lines.push(`  - Note: ${escapeMd(note)}`);
    }
  }
  lines.push('');

  lines.push('## Marginalia');
  const margKeys = Object.keys(marginalia);
  if (!margKeys.length) {
    lines.push('_No notes scribbled yet._');
  } else {
    for (const skill of margKeys) {
      lines.push(`### \`${skill}\``);
      lines.push('');
      lines.push(marginalia[skill]);
      lines.push('');
    }
  }

  return lines.join('\n');
}
