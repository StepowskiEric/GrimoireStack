/**
 * GrimoireStack — Spell catalog instance
 *
 * Creates a shared spell catalog from the canonical `schools` data.
 * Other modules should import `spellCatalog` from here rather than
 * building their own indexes.
 */

import { createSpellCatalog } from './spellCatalog.js';
import schools from './schools.js';

export const spellCatalog = createSpellCatalog(schools);
