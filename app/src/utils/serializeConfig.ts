function escapeMd(s: unknown): string {
  return String(s ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
}

export function serializeConfig({
  favorites = [],
  marginalia = {},
  recent = [],
  meta,
}: {
  favorites?: Array<{ name: string; skill: string; addedAt?: number }>;
  marginalia?: Record<string, string>;
  recent?: Array<{ name: string; skill: string; viewedAt?: number }>;
  meta?: Record<string, unknown>;
} = {}): string {
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

export function serializeMarkdown({
  favorites = [],
  marginalia = {},
  recent = [],
}: {
  favorites?: Array<{ name: string; skill: string }>;
  marginalia?: Record<string, string>;
  recent?: Array<{ name: string; skill: string }>;
} = {}): string {
  const lines: string[] = [];
  lines.push('# GrimoireStack — Personal Config');
  lines.push('');
  lines.push(`Exported ${new Date().toISOString().slice(0, 10)}`);
  lines.push('');

  lines.push('## Favorites');
  if (favorites.length === 0) {
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
  if (recent.length === 0) {
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
  if (margKeys.length === 0) {
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
