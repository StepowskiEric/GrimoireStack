import { describe, it, expect } from 'vitest';
import { sanitizeHtml, escapeHtml } from '../utils/sanitize.js';

describe('sanitizeHtml', () => {
  it('strips script tags', () => {
    expect(sanitizeHtml('hello <script>alert(1)</script> world')).toBe('hello  world');
  });

  it('strips iframe tags', () => {
    expect(sanitizeHtml('<iframe src="https://evil.com"></iframe>')).toBe('');
  });

  it('strips object tags', () => {
    expect(sanitizeHtml('<object data="evil.swf"></object>')).toBe('');
  });

  it('strips embed tags with proper closing', () => {
    expect(sanitizeHtml('<embed>evil</embed>')).toBe('');
  });

  it('strips form tags and their contents', () => {
    expect(sanitizeHtml('<form action="phish"><input></form>')).toBe('');
  });

  it('removes inline event handlers (double-quoted), leaving a trailing space', () => {
    expect(sanitizeHtml('<div onclick="evil()">x</div>')).toBe('<div >x</div>');
  });

  it('removes inline event handlers (single-quoted), leaving a trailing space', () => {
    expect(sanitizeHtml("<div onload='steal()'>x</div>")).toBe('<div >x</div>');
  });

  it('strips javascript: URIs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">link</a>')).toBe('<a href="alert(1)">link</a>');
  });

  it('removes data: prefix from URIs', () => {
    expect(sanitizeHtml('<img src="data:image/svg+xml,...">')).toBe('<img src="image/svg+xml,...">');
  });

  it('preserves safe HTML', () => {
    const safe = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(safe)).toBe(safe);
  });

  it('handles empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('handles nested dangerous tags', () => {
    const input = '<div><script>nested</script></div>';
    expect(sanitizeHtml(input)).toBe('<div></div>');
  });

  it('strips multiple script tags including their content', () => {
    const input = 'a<script>b</script>c<script>d</script>e';
    expect(sanitizeHtml(input)).toBe('ace');
  });
});

describe('escapeHtml re-export', () => {
  it('escapes & < > and "', () => {
    expect(escapeHtml('<test&co>')).toBe('&lt;test&amp;co&gt;');
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });
});
