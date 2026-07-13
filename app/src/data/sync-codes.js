/**
 * sync-codes.js — Single source of truth for the favorites sync code alphabet
 * and length. Imported by both the frontend (`useFavoritesSync.js`) and the
 * Cloudflare Pages Function (`favorites-sync.js`) so the two never drift.
 *
 * The alphabet is 32 chars (24 letters + 8 digits, excluding 0/1/i/l/o for
 * visual clarity) so `b % 32` produces a uniform distribution from
 * `crypto.getRandomValues` bytes — 256 divides evenly by 32 (8 times),
 * so no modulo bias.
 *
 * 16 chars × 32^16 = 2^80 possible codes.
 */

// Excluded: 0, 1, i, l, o — too easily confused with each other.
export const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export const CODE_LEN = 16;

export function isValidSyncCode(value) {
  return (
    typeof value === 'string' &&
    value.length === CODE_LEN &&
    value.split('').every((c) => ALPHABET.includes(c))
  );
}
