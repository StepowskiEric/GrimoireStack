/**
 * sanitize — HTML sanitization for user-originated or Markdown-derived content.
 *
 * Security-critical module. Every function here is an XSS boundary.
 * The pipeline is: `simpleMarkdownToHtml(md)` → `sanitizeHtml(html)` →
 * `dangerouslySetInnerHTML`.
 *
 * @module utils/sanitize
 */

/**
 * Strip dangerous HTML tags and attributes from a string that will be
 * injected via innerHTML / dangerouslySetInnerHTML.
 *
 * Removes: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`,
 * inline event handlers (`on*`), `javascript:` URIs, `data:` URIs.
 *
 * @param {string} html — unsanitized HTML
 * @returns {string} sanitized HTML — safe for DOM injection
 */
export function sanitizeHtml(html) {
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');

  return sanitized;
}

/**
 * Escape HTML special characters.
 *
 * Re-exported from markdown.js for convenience — avoids cross-module
 * import dependency for callers that compose their own pipeline.
 *
 * @param {string} text — raw text
 * @returns {string} HTML-escaped text
 */
export { escapeHtml } from './markdown.js';
