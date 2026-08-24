---
source: "GrimoireStack"
name: environment-recovery
description: "Diagnose and fix broken development environments — missing tools, wrong versions, corrupted caches, full disks, permission drift, and dependency hell. The skill every other debugging skill assumes."
triggers:
  - command-not-found-but-installed
  - silent-build-failure
  - eacces-enspoc-eaddrinuse
  - wrong-tool-version
  - stale-cache-symptoms
  - peer-dependency-conflict
  - lockfile-out-of-sync
disable-model-invocation: true
---

# Environment Recovery

**Every other debugging skill assumes the environment is healthy — this one runs first.** Commands failing with no clear error, builds failing silently, wrong versions resolving, caches serving old code: 80% of environment issues come from 8 common causes, and a 30-second structured sweep catches them. Vitals first, targeted repair only for what the sweep found, then verify.

## The Move

### 1. Vitals check — 8-command sweep, 30 seconds
1. Disk space (`df -h .`)
2. Tool resolution (`which node && node --version && which npm && npm --version`)
3. Lockfile presence (`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`)
4. Port conflicts (`lsof -i :8081 -i :3000 -i :19000-19002`)
5. Cache size and timestamps (`du -sh node_modules/.cache .expo .turbo`)
6. Permission drift (`ls -la node_modules/.cache`)
7. Git state (`git status --porcelain`)
8. `.env` existence

**Route by what you find:**

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Disk usage > 95% | ENOSPC — disk full | #1 |
| `node --version` mismatch | nvm/pyenv path conflict | #2 |
| Multiple lockfiles | package manager conflict | #3 |
| Port in use | zombie process | #4 |
| Cache dir > 500MB or old timestamps | stale cache | #5 |
| Permission denied on own files | ownership drift | #6 |
| `EACCES` on global install | npm global prefix wrong | #7 |

**If all vitals pass clean, the environment is healthy — the bug is in the code. Stop fixing env and switch to a code-level debugging skill.**

### 2. Targeted repair — fix only what Phase 1 found
Apply exactly the fix matching your finding; do not run fixes for problems you do not have — each fix takes time and can introduce new issues. The seven fixes (disk, version resolution, dependency conflict, port, cache, permissions, Expo/iOS) with their commands are in Reference. Check `which -a` before installing anything — installing a new version without seeing what is already resolved is the classic mistake.

### 3. Verify
Re-run the command that originally failed, re-check tool resolution, and run the project's quick smoke check. Done when the original command passes — or still fails, meaning the environment was healthy and the bug is in the code.

## Reference
For the full fix command sets (disk cleanup, version resolution, dependency conflict decision tree, port killing, cache clearing, permission repair, Expo/iOS specifics), common failure signatures, and failure modes, see [`references/common-failure-signatures.md`](references/common-failure-signatures.md).

## Rules
- **Do** run the vitals sweep before any fix — `npm install` as a first response to any error makes dependency conflicts worse.
- **Do** apply exactly one fix per finding; fixes for problems you do not have cause new ones.
- **Do** check `which -a` before installing any tool version.
- **Do** pick one package manager per project and stay with it.
- **Do** stop fixing the environment the moment Phase 1 is clean — that is a code bug.
