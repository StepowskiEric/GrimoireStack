/**
 * markdown — simple Markdown-to-HTML converter.
 *
 * Pure functions, no React, no app state. Each step is independently
 * exported so consumers can test or compose them. The main entry point
 * is `simpleMarkdownToHtml(md)` which runs the full pipeline.
 *
 * Security: use with `sanitizeHtml()` from `./sanitize.js` when the
 * output will be injected into the DOM via innerHTML or dangerouslySetInnerHTML.
 *
 * @module utils/markdown
 */

/**
 * Parse pipe-table Markdown lines into HTML `<table>` elements.
 *
 * @param {string} html — intermediate HTML with pipe-table lines
 * @returns {string} HTML with pipe tables replaced by `<table>` elements
 */
export function parseTables(html) {
  const lines = html.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines = [];
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
        const isSep = sep.split('|').every(c => /^[-:\s]+$/.test(c.trim()));
        if (isSep) {
          const headers = tableLines[0].slice(1, -1).split('|').map(h => h.trim());
          const bodyRows = tableLines.slice(2).map(row => row.slice(1, -1).split('|').map(c => c.trim()));
          const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
          const tbody = `<tbody>${bodyRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
          out.push(`<table class="md-table">${thead}${tbody}</table>`);
        } else {
          tableLines.forEach(l => out.push(l));
        }
      } else {
        tableLines.forEach(l => out.push(l));
      }
    } else {
      out.push(lines[i]);
      i++;
    }
  }
  return out.join('\n');
}

/**
 * Wrap consecutive `<li>` elements in `<ul>` tags.
 * The input is assumed to have raw `<li>` lines from regex replacements.
 *
 * @param {string} html — intermediate HTML with loose `<li>` elements
 * @returns {string} HTML with `<li>` elements wrapped in `<ul>`
 */
export function wrapLists(html) {
  const lines = html.split('\n');
  const out = [];
  let inList = false;
  let listType = 'ul';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('<li')) {
      if (!inList) {
        inList = true;
        out.push(`<${listType}>`);
      }
      out.push(line);
    } else {
      if (inList) {
        inList = false;
        out.push(`</${listType}>`);
      }
      out.push(line);
    }
  }
  if (inList) out.push(`</${listType}>`);
  return out.join('\n');
}

/**
 * Convert a Markdown string to HTML.
 *
 * Supports: headings, blockquotes, code blocks, inline code, bold,
 * italic, strikethrough, links, tables, unordered/ordered lists,
 * checkboxes, horizontal rules, paragraphs.
 *
 * @param {string} md — raw Markdown text
 * @returns {string} HTML string (not sanitized — call sanitizeHtml() separately)
 */
export function simpleMarkdownToHtml(md) {
  const text = md.replace(/\r\n/g, '\n');

  // Phase 1: Extract fenced code blocks to placeholders
  const codeBlocks = [];
  let html = text.replace(/```[\s\S]*?```/g, (m) => {
    const content = m.slice(3, -3).replace(/^\w+\n/, '');
    codeBlocks.push(`<pre><code>${escapeHtml(content)}</code></pre>`);
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
  });

  // Phase 2: Block-level elements
  html = parseTables(html);
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^#{1,6}\s+(.*)$/gm, (m, t) => {
    const level = m.match(/^#+/)[0].length;
    return `<h${level}>${t}</h${level}>`;
  });
  html = html.replace(/^---\s*$/gm, '<hr />');
  html = html.replace(/^(\s*)-\s+(.*)$/gm, (m, indent, txt) => {
    const depth = Math.floor(indent.length / 2);
    return `<li data-depth="${depth}">${txt}</li>`;
  });
  html = html.replace(/^(\s*)\d+\.\s+(.*)$/gm, (m, indent, txt) => {
    const depth = Math.floor(indent.length / 2);
    return `<li data-depth="${depth}">${txt}</li>`;
  });
  html = html.replace(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/gm, (m, indent, checked, txt) => {
    const isChecked = checked.toLowerCase() === 'x';
    return `<li class="check-item"><span class="check-box${isChecked ? ' checked' : ''}"></span>${txt}</li>`;
  });
  html = wrapLists(html);
  html = html.split('\n').map(l => {
    const t = l.trim();
    if (!t) return '<br />';
    if (t.startsWith('<') && !t.startsWith('<br')) return l;
    return `<p>${t}</p>`;
  }).join('\n');

  // Phase 3: Inline elements
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Phase 4: Restore code blocks
  html = html.replace(/___CODE_BLOCK_(\d+)___/g, (_, i) => codeBlocks[+i]);

  return html;
}

/**
 * Escape HTML special characters.
 *
 * @param {string} text — raw text
 * @returns {string} HTML-escaped text
 */
export function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
