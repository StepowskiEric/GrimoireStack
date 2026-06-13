/**
 * generate-registry.mjs — Generate data files from the filesystem.
 *
 * The filesystem is the single source of truth for which skills exist.
 * This script reads every SKILL.md (or *.md in skills directories) and
 * generates:
 *
 *   1. app/src/data/schoolsRegistry.js  — the schools[] array
 *   2. app/src/data/spellMetadata.js    — explicit dates and notes
 *   3. app/public/skills/_map.json      — URL map (already done by build-skill-map.mjs)
 *
 * The generated files include:
 *   - skills: name, skill (id), effect, status, note, combos (from frontmatter)
 *   - schools: id, real, name, desc (one school per topic)
 *
 * Hand-curated fields:
 *   - school.real, school.name, school.desc (per topic)
 *   - WIZARD_DATA situations
 *
 * Run as part of `npm run build` and `npm run sync`.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { REPO_ROOT, APP_DIR, SCAN_DIRS } from '../../scripts/lib/constants.mjs';

const SCHOOLS_REGISTRY = path.join(APP_DIR, 'src', 'data', 'schoolsRegistry.js');
const SPELL_METADATA = path.join(APP_DIR, 'src', 'data', 'spellMetadata.js');
const CURATED_OVERLAY = path.join(APP_DIR, 'src', 'data', 'curatedOverlay.js');

// Hand-curated per-topic metadata: school name, description, display id
const TOPIC_META = {
  'debugging': {
    id: 'debugging', real: 'Debugging', name: 'School of Remediation',
    desc: 'Incantations to banish bugs and restore order to broken code.',
  },
  'execution': {
    id: 'execution', real: 'Execution & Improvement', name: 'School of Execution',
    desc: 'Rituals for solving problems, executing plans, and improving systems over time.',
  },
  'judgment-and-routing': {
    id: 'judgment-and-routing', real: 'Judgment & Decision-Making', name: 'School of Judgment',
    desc: 'Incantations for routing decisions, weighing tradeoffs, and routing problems to the right approach.',
  },
  'orchestration': {
    id: 'orchestration', real: 'Agent Orchestration', name: 'School of Confluence',
    desc: 'Incantations for orchestrating multiple agents, sharing reasoning memory, and coordinating parallel workstreams.',
  },
  'output-quality': {
    id: 'output-quality', real: 'Output Quality', name: 'School of Refinement',
    desc: 'Incantations for improving, verifying, and stress-testing output before it ships.',
  },
  'reasoning': {
    id: 'reasoning', real: 'Reasoning & Faithfulness', name: 'School of Cognition',
    desc: 'Mental models and structured thought for when the problem itself is unclear or risks hallucination.',
  },
  'software-development': {
    id: 'software-development', real: 'Software Development', name: 'School of Crafting',
    desc: 'Practical incantations for building, renaming, searching through, and shipping code.',
  },
  'systems-and-architecture': {
    id: 'systems-and-architecture', real: 'Systems & Architecture', name: 'School of Architecture',
    desc: 'Design rituals for systems that endure across dimensions of scale, time, and team boundaries.',
  },
  'discovery': {
    id: 'discovery', real: 'Algorithm & Tool Discovery', name: 'School of Discovery',
    desc: 'Algorithms and automated tools that find solutions beyond human intuition.',
  },
  'planning': {
    id: 'planning', real: 'Planning & Estimation', name: 'School of Foresight',
    desc: 'Rituals for estimating timelines, surfacing risks, and creating disciplined plans.',
  },
  'learning': {
    id: 'learning', real: 'Learning & Documentation', name: 'School of Lore',
    desc: 'Spells for capturing knowledge, onboarding new agents, and preserving institutional wisdom.',
  },
  'anti-hallucination': {
    id: 'anti-hallucination', real: 'Anti-Hallucination', name: 'School of Verification',
    desc: 'Defensive incantations against hallucination, fabrication, and unverified claims.',
  },
  'mcp-servers': {
    id: 'mcp-servers', real: 'MCP Servers', name: 'School of Conduits',
    desc: 'Model Context Protocol servers that extend agent capabilities with structured tools.',
  },
  'multi-agent': {
    id: 'multi-agent', real: 'Multi-Agent', name: 'School of Many Minds',
    desc: 'Patterns for distributing work across multiple cooperating agents.',
  },
  'risk': {
    id: 'risk', real: 'Risk & Safety', name: 'School of Warding',
    desc: 'Protective incantations for safety-critical changes and threat analysis.',
  },
  'cognitive-load': {
    id: 'cognitive-load', real: 'Cognitive Load Management', name: 'School of Clarity',
    desc: 'Rituals for managing finite attention and reducing overhead.',
  },
  'testing': {
    id: 'testing', real: 'Testing & Measurement', name: 'School of Measurement',
    desc: 'Empirical measurement of skill effectiveness and code quality.',
  },
  'development': {
    id: 'development', real: 'Development & Tooling', name: 'School of Tools',
    desc: 'Tooling, utilities, and workflows for development tasks.',
  },
};

// ─────────────────────────────────────────────
//  PARSE FRONTMATTER
// ─────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { meta: {}, body: content };
  const fmBody = match[1];
  const meta = {};
  for (const line of fmBody.split(/\r?\n/)) {
    const m = line.match(/^([a-z0-9_-]+):\s*(.*)$/i);
    if (!m) continue;
    const key = m[1];
    let value = m[2].trim();
    // strip quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // arrays: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    }
    meta[key] = value;
  }
  return { meta, body: content.slice(match[0].length) };
}

// ─────────────────────────────────────────────
//  DISCOVER SKILLS
// ─────────────────────────────────────────────

async function findSkillFiles() {
  const results = [];
  for (const topic of SCAN_DIRS) {
    const rootPath = path.join(REPO_ROOT, topic);
    let entries;
    try {
      entries = await fs.readdir(rootPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (ent.name.startsWith('.')) continue;
      const fullPath = path.join(rootPath, ent.name);
      if (ent.isDirectory()) {
        const skillMd = path.join(fullPath, 'SKILL.md');
        try {
          await fs.access(skillMd);
          results.push({ skillId: ent.name, src: skillMd, topic });
        } catch {}
      } else if (ent.name.endsWith('.md') && ent.name !== 'README.md') {
        const skillId = ent.name.replace(/\.md$/, '');
        results.push({ skillId, src: fullPath, topic });
      }
    }
  }
  return results;
}

function deriveDisplayName(meta, skillId, body) {
  if (meta['display-name']) return meta['display-name'];
  // Try H1 or "Skill: ..." heading — but only if the heading is short
  // and looks like a title (no "for AI Agents" subtitle spam)
  const h1 = body.match(/^#\s+(?:Skill:\s*)?(.+)$/m);
  if (h1) {
    const candidate = h1[1].trim();
    // Skip if the title is too long (>60 chars) or contains " for AI Agents" suffix
    if (candidate.length <= 60 && !/\bfor AI Agents$/i.test(candidate)) {
      return candidate;
    }
  }
  // Humanize skill id: critical-system-interrogation -> Critical System Interrogation
  // Keep all-uppercase tokens (AI, MCP, API, ...) intact
  return skillId
    .split('-')
    .map(w => /^[A-Z]{2,}$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function deriveEffect(meta, body) {
  if (meta.description) return meta.description;
  // Find the first non-heading, non-empty paragraph after any leading H1
  const lines = body.split(/\r?\n/);
  let pastFirstH1 = false;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.match(/^#\s/)) {
      pastFirstH1 = true;
      continue;
    }
    if (!pastFirstH1) continue;
    if (line.match(/^##\s/)) continue;  // skip sub-headings
    if (line.match(/^[*\->]/)) continue;  // skip bullet markers
    return line.trim();
  }
  return 'No description provided.';
}

function fileMtime(filePath) {
  return fs.stat(filePath).then(s => s.mtime).catch(() => new Date());
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

async function loadOverlay() {
  try {
    const url = new URL(`file://${CURATED_OVERLAY}`);
    const mod = await import(url.href);
    return {
      spells: mod.CURATED_OVERLAY || {},
      schools: mod.CURATED_SCHOOLS || {},
    };
  } catch (err) {
    console.warn(`[registry] no curated overlay (${err.message}); using auto-generated defaults`);
    return { spells: {}, schools: {} };
  }
}

// ─────────────────────────────────────────────
//  GENERATE schoolsRegistry.js
// ─────────────────────────────────────────────

async function generateSchoolsRegistry() {
  const skills = await findSkillFiles();
  const parsed = [];

  // Load the curated overlay (preserves hand-curated grimoire names,
  // statuses, notes, and combos from the legacy schools.js).
  const overlay = await loadOverlay();

  for (const s of skills) {
    const content = await fs.readFile(s.src, 'utf8');
    const { meta, body } = parseFrontmatter(content);
    const curated = overlay.spells[s.skillId] || {};
    parsed.push({
      skill: s.skillId,
      topic: s.topic,
      name: curated.displayName || deriveDisplayName(meta, s.skillId, body),
      effect: deriveEffect(meta, body),
      status: curated.status || meta.status || '—',
      note: curated.note || meta.note || null,
      combos: curated.combos || (Array.isArray(meta.combos) ? meta.combos : null),
    });
  }

  // Group by topic
  const byTopic = new Map();
  for (const s of parsed) {
    if (!byTopic.has(s.topic)) byTopic.set(s.topic, []);
    byTopic.get(s.topic).push(s);
  }

  // Build schools array, only including topics that have skills
  const schools = [];
  for (const [topic, topicSkills] of byTopic) {
    const meta = overlay.schools[topic] || TOPIC_META[topic] || {
      id: topic,
      real: topic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      name: `School of ${topic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
      desc: `Skills related to ${topic.replace(/-/g, ' ')}.`,
    };
    // Sort spells within a school alphabetically by name
    topicSkills.sort((a, b) => a.name.localeCompare(b.name));
    schools.push({
      id: meta.id,
      real: meta.real,
      name: meta.name,
      desc: meta.desc,
      spells: topicSkills.map(s => {
        const spell = { name: s.name, skill: s.skill, effect: s.effect, status: s.status };
        if (s.note) spell.note = s.note;
        if (s.combos) spell.combos = s.combos;
        return spell;
      }),
    });
  }

  // Sort schools by their display name
  schools.sort((a, b) => a.name.localeCompare(b.name));

  // Write the generated file
  const fileContent = `// AUTO-GENERATED by scripts/generate-registry.mjs — DO NOT EDIT
// To change a spell, edit the SKILL.md frontmatter in its source directory.

const schools = ${JSON.stringify(schools, null, 2)};

export default schools;
`;
  await fs.writeFile(SCHOOLS_REGISTRY, fileContent, 'utf8');
  const schoolsRel = path.relative(REPO_ROOT, SCHOOLS_REGISTRY);
  console.log(`[registry] wrote ${schools.length} schools, ${parsed.length} spells to ${schoolsRel}`);

  return { schools, skills: parsed };
}

// ─────────────────────────────────────────────
//  GENERATE spellMetadata.js
// ─────────────────────────────────────────────

async function generateSpellMetadata() {
  const skills = await findSkillFiles();
  const EXPLICIT = {};

  for (const s of skills) {
    const content = await fs.readFile(s.src, 'utf8');
    const { meta } = parseFrontmatter(content);
    const mtime = await fileMtime(s.src);
    // Allow frontmatter to override the date (for skills whose content
    // didn't change but whose metadata did)
    const lastUpdated = meta['last-updated'] || isoDate(mtime);
    const entry = { lastUpdated };
    if (meta.note) entry.note = meta.note;
    EXPLICIT[s.skillId] = entry;
  }

  // Sort by skill id for stable output
  const sortedKeys = Object.keys(EXPLICIT).sort();
  const lines = ["/**", " * AUTO-GENERATED by scripts/generate-registry.mjs — DO NOT EDIT",
    " *",
    " * The EXPLICIT map is generated from the filesystem (file mtime +",
    " * optional `note` from frontmatter).",
    " *",
    " * Helper functions are appended below the auto-generated block.",
    " */", "",
    "import { grimoireIndex } from './grimoireIndexInstance.js';", "",
    "const EXPLICIT = {"];
  for (const key of sortedKeys) {
    const entry = EXPLICIT[key];
    const fields = [`lastUpdated: '${entry.lastUpdated}'`];
    if (entry.note) fields.push(`note: ${JSON.stringify(entry.note)}`);
    lines.push(`  '${key}': { ${fields.join(', ')} },`);
  }
  lines.push("};");
  lines.push("");
  // Helpers (preserved verbatim from the previous hand-written spellMetadata.js)
  lines.push("// ──────────── helpers (not auto-generated) ────────────");
  lines.push("");
  lines.push("const ISO = (date) => date.toISOString().slice(0, 10);");
  lines.push("");
  lines.push("function hashStringToInt(str) {");
  lines.push("  let h = 2166136261;");
  lines.push("  for (let i = 0; i < str.length; i++) {");
  lines.push("    h ^= str.charCodeAt(i);");
  lines.push("    h = Math.imul(h, 16777619);");
  lines.push("  }");
  lines.push("  return h >>> 0;");
  lines.push("}");
  lines.push("");
  lines.push("function deterministicDate(skill) {");
  lines.push("  const h = hashStringToInt(skill);");
  lines.push("  const daysAgo = 30 + (h % 300);");
  lines.push("  const d = new Date();");
  lines.push("  d.setUTCDate(d.getUTCDate() - daysAgo);");
  lines.push("  return ISO(d);");
  lines.push("}");
  lines.push("");
  lines.push("export function getSpellLastUpdated(skill) {");
  lines.push("  if (!skill) return null;");
  lines.push("  const explicit = EXPLICIT[skill];");
  lines.push("  if (explicit?.lastUpdated) return explicit.lastUpdated;");
  lines.push("  return deterministicDate(skill);");
  lines.push("}");
  lines.push("");
  lines.push("export function getSpellNote(skill) {");
  lines.push("  if (!skill) return null;");
  lines.push("  return EXPLICIT[skill]?.note || null;");
  lines.push("}");
  lines.push("");
  lines.push("export function isExplicitlyUpdated(skill) {");
  lines.push("  return !!EXPLICIT[skill];");
  lines.push("}");
  lines.push("");
  lines.push("export function getRecentlyUpdated(limit = 12) {");
  lines.push("  return grimoireIndex.allEntries()");
  lines.push("    .map(({ spell, school }) => ({");
  lines.push("      skill: spell.skill,");
  lines.push("      name: spell.name,");
  lines.push("      spell,");
  lines.push("      school,");
  lines.push("      lastUpdated: getSpellLastUpdated(spell.skill),");
  lines.push("      isExplicit: isExplicitlyUpdated(spell.skill),");
  lines.push("      note: getSpellNote(spell.skill),");
  lines.push("    }))");
  lines.push("    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))");
  lines.push("    .slice(0, limit);");
  lines.push("}");
  lines.push("");
  lines.push("export function getChangeFeed(limit = 30) {");
  lines.push("  return getRecentlyUpdated(limit);");
  lines.push("}");
  lines.push("");
  lines.push("export function getAlphabeticalIndex() {");
  lines.push("  return grimoireIndex.allEntries()");
  lines.push("    .slice()");
  lines.push("    .sort((a, b) => a.spell.name.localeCompare(b.spell.name));");
  lines.push("}");

  await fs.writeFile(SPELL_METADATA, lines.join("\n") + "\n", 'utf8');
  console.log(`[registry] wrote ${sortedKeys.length} metadata entries to ${path.relative(REPO_ROOT, SPELL_METADATA)}`);
}

// ─────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────

async function main() {
  await generateSchoolsRegistry();
  await generateSpellMetadata();
}

main().catch(err => {
  console.error('[registry] failed:', err);
  process.exit(1);
});
