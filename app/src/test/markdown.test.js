import { describe, expect, it } from 'vitest';
import { escapeHtml, parseTables, simpleMarkdownToHtml, wrapLists } from '../utils/markdown.js';

describe('escapeHtml', () => {
  it('escapes & < > and "', () => {
    expect(escapeHtml('<script>alert("x&y")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&amp;y&quot;)&lt;/script&gt;',
    );
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('returns plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('parseTables', () => {
  it('converts a pipe-table to an HTML table', () => {
    const input = [
      '| Header A | Header B |',
      '| --- | --- |',
      '| Cell 1 | Cell 2 |',
      '| Cell 3 | Cell 4 |',
    ].join('\n');
    const result = parseTables(input);
    expect(result).toContain('<table class="md-table">');
    expect(result).toContain('<th>Header A</th>');
    expect(result).toContain('<th>Header B</th>');
    expect(result).toContain('<td>Cell 1</td>');
    expect(result).toContain('<td>Cell 4</td>');
    expect(result).toContain('</table>');
  });

  it('passes non-table lines through unchanged', () => {
    const input = 'Hello\n\nWorld';
    expect(parseTables(input)).toBe(input);
  });
});

describe('wrapLists', () => {
  it('wraps consecutive li elements in ul', () => {
    const input = '<li>Alpha</li>\n<li>Beta</li>\n<p>gap</p>\n<li>Gamma</li>';
    const result = wrapLists(input);
    expect(result).toContain('<ul>');
    expect(result).toContain('</ul>');
    // Two separate lists
    expect(result.match(/<ul>/g)).toHaveLength(2);
    expect(result.match(/<\/ul>/g)).toHaveLength(2);
  });

  it('handles no list items', () => {
    expect(wrapLists('<p>Just a para</p>')).toBe('<p>Just a para</p>');
  });

  it('handles empty input', () => {
    expect(wrapLists('')).toBe('');
  });
});

describe('simpleMarkdownToHtml', () => {
  it('converts headings', () => {
    expect(simpleMarkdownToHtml('# Title')).toContain('<h1>Title</h1>');
    expect(simpleMarkdownToHtml('## Section')).toContain('<h2>Section</h2>');
    expect(simpleMarkdownToHtml('### Sub')).toContain('<h3>Sub</h3>');
  });

  it('converts bold and italic', () => {
    const result = simpleMarkdownToHtml('**bold** and *italic*');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  it('converts inline code', () => {
    const result = simpleMarkdownToHtml('Use `foo()`');
    expect(result).toContain('<code>foo()</code>');
  });

  it('converts links', () => {
    const result = simpleMarkdownToHtml('[click](https://example.com)');
    expect(result).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">click</a>',
    );
  });

  it('converts fenced code blocks', () => {
    const md = '```js\nconst x = 1;\n```';
    const result = simpleMarkdownToHtml(md);
    expect(result).toContain('<pre><code>');
    expect(result).toContain('const x = 1;');
    expect(result).toContain('</code></pre>');
  });

  it('converts blockquotes', () => {
    expect(simpleMarkdownToHtml('> quote')).toContain('<blockquote>quote</blockquote>');
  });

  it('converts strikethrough', () => {
    expect(simpleMarkdownToHtml('~~strike~~')).toContain('<del>strike</del>');
  });

  it('wraps paragraphs', () => {
    const result = simpleMarkdownToHtml('First para\n\nSecond para');
    expect(result).toContain('<p>First para</p>');
    expect(result).toContain('<p>Second para</p>');
  });

  it('preserves code block content escaping', () => {
    const md = '```\n<script>danger</script>\n```';
    const result = simpleMarkdownToHtml(md);
    // The code block content should be HTML-escaped
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('handles empty input', () => {
    expect(simpleMarkdownToHtml('')).toBe('<br />');
  });
});
