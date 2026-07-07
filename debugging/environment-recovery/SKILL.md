---
source: "GrimoireStack"
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

Every other debugging skill assumes the environment is healthy. This one runs first.

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

**Done when:** exactly one fix was applied that corresponds to a Phase 1 finding. If no Phase 1 finding matched, the environment is healthy — do not run any fixes.

### Fix #1: Disk Full (ENOSPC)

```bash
du -sh node_modules .expo .turbo ~/.npm ~/.cache 2>/dev/null | sort -rh | head -5
rm -rf node_modules/.cache .expo .turbo
docker system df 2>/dev/null
du -sh ~/Library/Developer/Xcode 2>/dev/null
```

**Warning:** On small drives (< 50GB free), `npx expo run:ios` may need 15-20GB free. Consider clearing Simulator runtimes (`xcrun simctl delete unavailable`) or Xcode derived data.

### Fix #2: Wrong Tool Version Resolved

```bash
which -a node
which -a npm
which -a npx
source ~/.nvm/nvm.sh 2>/dev/null && nvm use
which -a python3
pyenv which python3 2>/dev/null
```

**Anti-pattern:** Installing a new tool version without checking what's already there. Always check `which -a` first.

### Fix #3: Dependency Conflict

```bash
# Determine which package manager owns this project
# If package-lock.json exists → npm
# If yarn.lock exists → yarn
# If pnpm-lock.yaml exists → pnpm
# NEVER mix package managers

rm -rf node_modules
rm -f package-lock.json  # only if lockfile is corrupted
npm install  # or yarn install, or pnpm install

# For peer dependency conflicts
npm ls <problem-package>
npm dedupe

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
lsof -i :8081  # Metro bundler
lsof -i :3000  # Common dev server
lsof -i :19000 -i :19001 -i :19002  # Expo dev
kill -9 <PID>
pkill -f node  # nuclear — kills everything
```

### Fix #5: Stale Cache

```bash
npx expo start --clear
rm -rf node_modules/.cache/metro
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null
rm -rf tsconfig.tsbuildinfo
rm -rf node_modules/.cache/typescript
rm -rf .turbo
```

### Fix #6: Permission Drift

```bash
sudo chown -R $(whoami) .
sudo chown -R $(whoami) node_modules
npm config get prefix
# Should NOT be /usr — if it is:
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Fix #7: Expo-Specific Environment Issues

```bash
xcodebuild -downloadPlatform iOS  # iOS Simulator runtime missing
echo $ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
npx expo --version
npx expo install expo --fix  # auto-fix version mismatches
```

---

## Phase 3: VERIFY

After applying any fix, verify the environment is now functional:

```bash
# 1. Re-run the command that originally failed
# 2. Verify tool resolution
which node && node --version
which npm && npm --version
# 3. Quick smoke test
npm run check  # or project-specific check command
```

**Done when:** the original failing command now passes, or it still fails (meaning the environment was healthy and the bug is in the code — switch to a code-level debugging skill).

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

## Quick Reference

```
Phase 1: VITALS CHECK → 8-command sweep (30s)
Phase 2: TARGETED REPAIR → fix only what Phase 1 found
Phase 3: VERIFY → re-run failing command
```

If Phase 1 is clean, the environment is NOT the problem. Stop fixing env and start debugging code.

## References

- [`references/common-failure-signatures.md`](references/common-failure-signatures.md) — fuller descriptions of ENOSPC, version resolution conflicts, permission drift, Expo/iOS-specific issues, and dependency hell patterns, with expanded debugging commands and hidden causes.
