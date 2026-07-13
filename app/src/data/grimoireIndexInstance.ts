/**
 * GrimoireIndex singleton.
 *
 * Build the canonical spell index once, at module load, from `schools.js`.
 * Every consumer should import `grimoireIndex` from here — do not call
 * `createGrimoireIndex(schools)` directly outside of tests.
 */

import { createGrimoireIndex } from './grimoireIndex.ts';
import schools from './schools.ts';

export const grimoireIndex = createGrimoireIndex(schools);
