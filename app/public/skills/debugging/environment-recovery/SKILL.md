---
source: "jerry-skills"
name: environment-recovery
description: "Diagnose and fix broken development environments — missing tools, wrong versions, corrupted caches, full disks, permission drift, and dependency hell. The skill every other debugging skill assumes."
triggers:
  - Commands fail with no clear error or misleading errors
  - "command not found" but the tool is installed
  - Builds or tests fail silently
  - EACCES, ENOSPC, EADDRINUSE errors
  - Wrong tool version resolved (nvm/pyenv conflict)
  - Stale cache symptoms — HMR not refreshing, old code running
  - peer dependency warnings that are actually errors
  - Transitive dependency version conflicts
  - Lockfile out of sync with package.json
  - Agent ran npm install / pip install and things got worse
  - "It works on my machine" — environment-specific failures
---

# Environment Recovery

**Biological analog:** A paramedic checking vitals before diagnosing the disease. Every other debugging skill assumes the patient is breathing.

## When to Use

- Any command fails before you get to the actual bug
- `npm run check`, `npm run build`, or `npx expo start` fails with cryptic errors
- Tests can't run because the environment is broken
- Agent ran install commands and things got worse, not better
- "It was working yesterday" — something changed in the environment
- You've been debugging for 10+ minutes and haven't reached the actual code yet

## When NOT to Use

- Code logic bugs where the environment is known-good
- Feature implementation (not fixing anything)
- The error message clearly points to a specific code issue

---

## Phase 1: VITALS CHECK

Run a structured sweep of the 8 most common environment failures. This takes 30 seconds and catches 80% of env issues.

```bash
# 1. Disk space
df -h . | tail -1

# 2. Node resolution
which node && node --version && which npm && npm --version

# 3. Package manager lockfile consistency
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null

# 4. Port conflicts (common Expo/RN ports)
lsof -i :8081 -i :3000 -i :19000 -i :19001 -i :19002 2>/dev/null | head -5

# 5. Stale cache indicators
du -sh node_modules/.cache .expo .turbo 2>/dev/null

# 6. Permission drift
ls -la node_modules/.cache 2>/dev/null | head -3

# 7. Git state (uncommitted changes that might affect build)
git status --porcelain | head -5

# 8. Environment variables / .env existence
ls -la .env .env.local .env.production 2>/dev/null
```

**Decision rules:**

| Symptom | Likely Cause | Skip to |
|---------|-------------|---------|
| Disk usage > 95% | ENOSPC — disk full | Phase 2, Fix #1 |
| `node --version` mismatch | nvm/pyenv path conflict | Phase 2, Fix #2 |
| Multiple lockfiles | Package manager conflict | Phase 2, Fix #3 |
| Port in use | Zombie process | Phase 2, Fix #4 |
| Cache dir > 500MB or old timestamps | Stale cache | Phase 2, Fix #5 |
| Permission denied on own files | Ownership drift | Phase 2, Fix #6 |
| `EACCES` on global install | npm global prefix wrong | Phase 2, Fix #7 |

If all vitals pass clean → the environment is healthy. The bug is in the code. Use a different debugging skill.

---

## Phase 2: TARGETED REPAIR

Apply the fix matching your Phase 1 finding. Do NOT run fixes for problems you don't have.

### Fix #1: Disk Full (ENOSPC)

```bash
# Identify what's eating space
du -sh node_modules .expo .turbo ~/.npm ~/.cache 2>/dev/null | sort -rh | head -5

# Nuclear option (safe — only removes caches, not source)
rm -rf node_modules/.cache .expo .turbo

# If still full — check for Docker images, OrbStack, old builds
docker system df 2>/dev/null
du -sh ~/Library/Developer/Xcode 2>/dev/null
```

**Warning:** On small drives (< 50GB free), `npx expo run:ios` may need 15-20GB free. Consider clearing Simulator runtimes (`xcrun simctl delete unavailable`) or Xcode derived data.

### Fix #2: Wrong Tool Version Resolved

```bash
# Check what's resolved vs what's expected
which -a node
which -a npm
which -a npx

# If nvm is installed but shell not loading it
source ~/.nvm/nvm.sh
nvm use

# If pyenv conflict
which -a python3
pyenv which python3
```

**Anti-pattern:** Installing a new tool version without checking what's already there. Always check `which -a` first.

### Fix #3: Dependency Conflict

```bash
# Determine which package manager owns this project
# If package-lock.json exists → npm
# If yarn.lock exists → yarn
# If pnpm-lock.yaml exists → pnpm
# NEVER mix package managers

# Clean install (nuclear — deletes node_modules and reinstalls)
rm -rf node_modules
rm -f package-lock.json  # only if lockfile is corrupted
npm install  # or yarn install, or pnpm install

# For peer dependency conflicts
npm ls <problem-package>  # see who depends on it
npm dedupe  # flatten dependency tree

# For Expo/RN native deps
npx pod-install  # iOS
cd android && ./gradlew clean  # Android
```

**Decision tree:**
- `ERESOLVE` errors → dependency version conflict → `npm install --legacy-peer-deps` (temporary) or fix the conflict
- `node-gyp` rebuild errors → native module needs rebuild → `npm rebuild`
- `ENOTFOUND` registry errors → npm config check (`npm config list`)
- Post-install script failures → check Node version compatibility

### Fix #4: Port Conflicts

```bash
# Find what's using the port
lsof -i :8081  # Metro bundler
lsof -i :3000  # Common dev server
lsof -i :19000 -i :19001 -i :19002  # Expo dev

# Kill specific process
kill -9 <PID>

# Kill all node processes (nuclear — kills everything)
pkill -f node
```

### Fix #5: Stale Cache

```bash
# React Native / Expo
npx expo start --clear

# Metro bundler
rm -rf node_modules/.cache/metro
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null

# TypeScript
rm -rf tsconfig.tsbuildinfo
rm -rf node_modules/.cache/typescript

# Turbopack
rm -rf .turbo

# Nuclear: clear all caches
npx expo start --clear
```

### Fix #6: Permission Drift

```bash
# Fix ownership of project files
sudo chown -R $(whoami) .

# Fix node_modules specifically
sudo chown -R $(whoami) node_modules

# Fix npm global prefix (common cause of EACCES)
npm config get prefix
# Should NOT be /usr — if it is:
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Fix #7: Expo-Specific Environment Issues

```bash
# iOS Simulator runtime missing (err 70)
xcodebuild -downloadPlatform iOS

# Android SDK not found
echo $ANDROID_HOME
# Should point to SDK dir — if empty:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Expo CLI version mismatch
npx expo --version
npx expo install expo --fix  # auto-fix version mismatches
```

---

## Phase 3: VERIFY

After applying any fix, verify the environment is now functional:

```bash
# 1. Re-run the command that originally failed
# (the specific npm run check, build, or start command)

# 2. Verify tool resolution
which node && node --version
which npm && npm --version

# 3. Quick smoke test
npm run check  # or project-specific check command
```

**If the original command still fails after environment fix:**
- The environment was healthy; the bug is in the code
- Switch to a code-level debugging skill (specter, debug-to-fix-pipeline, root-cause-analysis)

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| `npm install` as first response to any error | Installs new deps without understanding the problem; can make dependency conflicts worse |
| `rm -rf node_modules && npm install` as first response | Nuclear option; 30-120 seconds of wasted time if the issue is a port conflict or disk space |
| Running fixes for problems you don't have | Each fix takes time and can introduce new issues; Phase 1 first |
| Ignoring `EACCES` and `sudo npm install` | Masks permission problems with root; creates worse permission drift |
| Switching package managers mid-project | npm ↔ yarn ↔ pnpm creates conflicting lockfiles; pick one and stay |
| Assuming the env is fine because "it worked yesterday" | Something changed — a new dep, a version bump, a cache invalidation |

---

## Combination Opportunities

- **Before `specter` or `debug-to-fix-pipeline`:** Run Phase 1 vitals. If env is broken, fix env first. Code-level debugging on a broken environment wastes time and produces misleading results.
- **After `environment-recovery` + still broken:** The env is fine. The bug is in the code. Switch to code-level debugging.
- **With `trajectory-guard`:** If `trajectory-guard` detects you've been running env fixes for >3 cycles without progress, the problem may not be environmental — escalate to `escalation-ladder`.

---

## Quick Reference

```
Phase 1: VITALS CHECK → 8-command sweep (30s)
Phase 2: TARGETED REPAIR → fix only what Phase 1 found
Phase 3: VERIFY → re-run failing command
```

If Phase 1 is clean, the environment is NOT the problem. Stop fixing env and start debugging code.