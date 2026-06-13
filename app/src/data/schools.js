/**
 * schools.js — Thin re-export of the auto-generated registry.
 *
 * The schools[] array is generated from the filesystem by
 * scripts/generate-registry.mjs. To add a skill:
 *
 *   node scripts/skill.mjs add <id> <topic> "<Display Name>" "[description]"
 *
 * Don't edit the registry directly. Edit SKILL.md frontmatter in the
 * source directory instead.
 *
 * WIZARD_DATA stays hand-curated because it groups skills by user-intent
 * scenarios rather than by topic.
 */

import schools from './schoolsRegistry.js';
import { WIZARD_DATA } from './wizardData.js';

export default schools;
export { WIZARD_DATA };
