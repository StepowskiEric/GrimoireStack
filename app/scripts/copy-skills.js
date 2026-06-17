import { promises as fs } from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const PUBLIC_SKILLS = path.resolve(import.meta.dirname, '../public/skills');

// Top-level directories to scan (matching the repo structure)
const SCAN_DIRS = [
  'debugging',
  'execution',
  'judgment-and-routing',
  'mcp-servers',
  'mlops',
  'orchestration',
  'output-quality',
  'reasoning',
  'software-development',
  'systems-and-architecture',
  'testing',
  'development',
  'research',
];

async function findSkillFiles(dir) {
  const results = [];
  for (const scanDir of SCAN_DIRS) {
    const rootPath = path.join(dir, scanDir);
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
        // Check for SKILL.md inside
        const skillMd = path.join(fullPath, 'SKILL.md');
        try {
          await fs.access(skillMd);
          results.push({ skillId: ent.name, src: skillMd, relDir: `${scanDir}/${ent.name}` });
        } catch {
          // Also scan one level deeper for .md files in subdirectories
          const subEntries = await fs.readdir(fullPath, { withFileTypes: true });
          for (const sub of subEntries) {
            if (sub.isDirectory()) {
              const subSkillMd = path.join(fullPath, sub.name, 'SKILL.md');
              try {
                await fs.access(subSkillMd);
                results.push({ skillId: sub.name, src: subSkillMd, relDir: `${scanDir}/${ent.name}/${sub.name}` });
              } catch {}
            } else if (sub.name.endsWith('.md') && sub.name !== 'README.md') {
              const skillId = sub.name.replace(/\.md$/, '');
              results.push({ skillId, src: path.join(fullPath, sub.name), relDir: `${scanDir}/${ent.name}` });
            }
          }
        }
      } else if (ent.name.endsWith('.md') && ent.name !== 'README.md') {
        const skillId = ent.name.replace(/\.md$/, '');
        results.push({ skillId, src: fullPath, relDir: scanDir });
      }
    }
  }
  return results;
}

async function main() {
  await fs.mkdir(PUBLIC_SKILLS, { recursive: true });
  const skills = await findSkillFiles(REPO_ROOT);
  const mapping = {};
  for (const s of skills) {
    const destDir = path.join(PUBLIC_SKILLS, s.relDir);
    await fs.mkdir(destDir, { recursive: true });
    const destFile = path.join(destDir, path.basename(s.src));
    await fs.copyFile(s.src, destFile);
    mapping[s.skillId] = `/skills/${s.relDir}/${path.basename(s.src)}`;
  }
  await fs.writeFile(
    path.join(PUBLIC_SKILLS, '_map.json'),
    JSON.stringify(mapping, null, 2)
  );
  console.log(`Copied ${skills.length} skill files to public/skills/`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
