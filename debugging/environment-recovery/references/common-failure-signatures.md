# Common Environment Failure Signatures

## ENOSPC (Disk Full)

Symptoms:
- TypeScript: `error TS5083: Cannot write file '...' it would overwrite input file`
- Vite/HMR: Changes not reflecting in browser despite saving
- npm: `ENOSPC: no space left on device, write`
- Expo: Build fails silently, `npx expo run:ios` exits with error 70

Hidden causes:
- `~/Library/Developer/Xcode/DerivedData/` can grow to 50GB+
- Docker images: `docker system df` to check
- `.expo/` and `node_modules/.cache/` can be 500MB-2GB
- iOS Simulator runtimes: 5-10GB each in `~/Library/Developer/CoreSimulator/`

## Version Resolution Conflicts

Symptoms:
- `node --version` shows wrong version
- `npm run` uses different node than terminal
- `command not found` but package is in node_modules/.bin

Common causes:
- nvm not sourced in non-interactive shell (agents, CI)
- pyenv shim intercepting python
- local node_modules/.bin not in PATH
- Multiple node installations (homebrew, nvm, volta, asdf)

## Permission Drift (EACCES)

Symptoms:
- `EACCES: permission denied` on files you just created
- `npm install -g` requires sudo
- `.expo/` or cache files owned by root

Common causes:
- Ran `sudo npm install` once → created root-owned files
- Docker container wrote files as root into mounted volume
- CI system runs as different user

Fix (macOS/Linux):
```bash
# Find root-owned files in project
find . -user root -not -path './.git/*' 2>/dev/null

# Fix ownership
sudo chown -R $(whoami) .
```

## Expo/iOS-Specific

- `err 70` from `npx expo run:ios` → missing simulator runtime
  Fix: `xcodebuild -downloadPlatform iOS` (8.5 GB download)
  
- Apple Sign-In hangs on simulator → known bug, use physical device
  (expo/issues #11995, #38996)

- Metro bundler caching stale code → `npx expo start --clear`

- Podfile out of sync → `cd ios && pod install && cd ..`

## Dependency Hell

- `ERESOLVE unable to resolve dependency tree` → peer dep conflict
  Fix: `npm install --legacy-peer-deps` (temporary) or resolve the conflict
  
- `npm WARN deprecated` → not an error, just a warning. Only fix if the deprecated package is actually breaking something.

- Transitive dependency conflict (A needs X@2, B needs X@3)
  ```bash
  npm ls <package>   # see who depends on it
  npm dedupe         # try to flatten
  ```