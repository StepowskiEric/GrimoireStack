export function parseTables(html: string): string {
  const lines = html.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (l.startsWith('|') && l.endsWith('|')) {
          tableLines.push(l);
          i++;
        } else {
          break;
        }
      }
      if (tableLines.length >= 2) {
        const sep = tableLines[1].slice(1, -1);
        const isSep = sep.split('|').every((c) => /^[-:\s]+$/.test(c.trim()));
        if (isSep) {
          const headers = tableLines[0]
            .slice(1, -1)
            .split('|')
            .map((h) => h.trim());
          const bodyRows = tableLines.slice(2).map((row) =>
            row
              .slice(1, -1)
              .split('|')
              .map((c) => c.trim()),
          );
          const thead = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>`;
          const tbody = `<tbody>${bodyRows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
          out.push(`<table class="md-table">${thead}${tbody}</table>`);
        } else {
          tableLines.forEach((l) => out.push(l));
        }
      } else {
        tableLines.forEach((l) => out.push(l));
      }
    } else {
      out.push(lines[i]);
      i++;
    }
  }
  return out.join('\n');
}

export function wrapLists(html: string): string {
  const lines = html.split('\n');
  const out: string[] = [];
  let inList = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('<li')) {
      if (!inList) {
        inList = true;
        out.push('<ul>');
      }
      out.push(line);
    } else {
      if (inList) {
        inList = false;
        out.push('</ul>');
      }
      out.push(line);
    }
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

export function simpleMarkdownToHtml(md: string): string {
  const text = md.replace(/\r\n/g, '\n');

  const codeBlocks: string[] = [];
  let html = text.replace(/```[\s\S]*?```/g, (m) => {
    const content = m.slice(3, -3).replace(/^\w+\n/, '');
    codeBlocks.push(`<pre><code>${escapeHtml(content)}</code></pre>`);
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
  });

  html = parseTables(html);
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^#{1,6}\s+(.*)$/gm, (m, t) => {
    const level = m.match(/^#+/)?.[0].length || 1;
    return `<h${level}>${t}</h${level}>`;
  });
  html = html.replace(/^---\s*$/gm, '<hr />');
  html = html.replace(/^(\s*)-\s+(.*)$/gm, (_m, indent: string, txt: string) => {
    const depth = Math.floor(indent.length / 2);
    return `<li data-depth="${depth}">${txt}</li>`;
  });
  html = html.replace(/^(\s*)\d+\.\s+(.*)$/gm, (_m, indent: string, txt: string) => {
    const depth = Math.floor(indent.length / 2);
    return `<li data-depth="${depth}">${txt}</li>`;
  });
  html = html.replace(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/gm, (_m, _indent: string, checked: string, txt: string) => {
    const isChecked = checked.toLowerCase() === 'x';
    return `<li class="check-item"><span class="check-box${isChecked ? ' checked' : ''}"></span>${txt}</li>`;
  });
  html = wrapLists(html);
  html = html
    .split('\n')
    .map((l) => {
      const t = l.trim();
      if (!t) return '<br />';
      if (t.startsWith('<') && !t.startsWith('<br')) return l;
      return `<p>${t}</p>`;
    })
    .join('\n');

  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  html = html.replace(/___CODE_BLOCK_(\d+)___/g, (_, i) => codeBlocks[+i]);

  return html;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
