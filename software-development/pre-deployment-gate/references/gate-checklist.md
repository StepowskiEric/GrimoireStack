# Pre-Push / Pre-Deploy Checklist

A concrete, copy-pasteable checklist of automated checks to run before pushing code or deploying to production.

---

## 1. Typecheck

Verify all types are correct across the codebase.

**TypeScript / JavaScript:**
```bash
npx tsc --noEmit
```

**Python:**
```bash
mypy .
```

**Go:**
```bash
go build ./...
```

**Rust:**
```bash
cargo check
```

---

## 2. Lint

Run the linter and auto-fix safe issues.

**JavaScript / TypeScript (ESLint):**
```bash
npx eslint . --fix
```

**Python (Ruff):**
```bash
ruff check . --fix
```

**Python (Flake8):**
```bash
flake8 .
```

**CSS:**
```bash
stylelint "**/*.css" --fix
```

**YAML:**
```bash
yamllint .
```

---

## 3. Tests

Run the full test suite. No exceptions.

**JavaScript / TypeScript (Jest / Vitest):**
```bash
npm test
# or
npx vitest run
```

**Python (pytest):**
```bash
pytest
```

**Go:**
```bash
go test ./...
```

**Rust:**
```bash
cargo test
```

**End-to-end / integration:**
```bash
npm run test:e2e
# or
playwright test
```

---

## 4. Dependency Check

Audit dependencies for vulnerabilities and outdated packages.

**JavaScript / TypeScript (npm):**
```bash
npm audit --audit-level=high
npm outdated
```

**JavaScript / TypeScript (pnpm):**
```bash
pnpm audit
pnpm outdated
```

**Python:**
```bash
pip-audit
# or
safety check
```

**Go:**
```bash
go list -m -u all
govulncheck ./...
```

---

## 5. Bundle Size

Check that the production bundle hasn't grown unexpectedly.

**JavaScript / TypeScript (Vite / Rollup):**
```bash
npm run build
npx vite build --mode production
# View sizes
du -sh dist/
# Or use bundlesize / bundlesize CLI
npx bundlesize
```

**Bundle analyzer:**
```bash
npx vite-bundle-analyzer dist
# or
npx source-map-explorer dist/**/*.js
```

**Threshold check (fail if bundle exceeds limit):**
```bash
BUNDLE_LIMIT=500KB du -sm dist/ | awk '$1 * 1024 > BUNDLE_LIMIT { exit 1 }'
```

---

## 6. Environment Variables

Validate that required env vars are present and defaults are safe.

**List all required env vars and check they are set:**
```bash
# Source .env and check required vars
set -a && source .env && set +a

# Check specific required vars (bash)
: "${API_KEY:?Missing API_KEY}"
: "${DATABASE_URL:?Missing DATABASE_URL}"
: "${NODE_ENV:?Missing NODE_ENV}"
```

**Validate .env.example matches actual usage:**
```bash
# Compare .env.example keys against code/env usage
comm -23 <(grep -oE '^[A-Z_]+' .env.example | sort -u) <(grep -rhoE '\$[A-Z_]+' src/ | grep -oE '[A-Z_]+' | sort -u)
```

**Check for production-inappropriate defaults:**
```bash
# Scan for debug: true, NODE_ENV=development in config files
grep -rnE '(debug\s*[:=]\s*true|NODE_ENV.*development)' src/ config/ || echo "OK"
```

---

## 7. Secrets Scan

Detect accidentally committed or staged secrets.

**Scan the working tree and staged diff:**
```bash
# Check staged diff for common secret patterns
git diff --staged | grep -iE '(api_key|secret|token|password|credential|private_key|authorization)'

# Scan full working tree (requires gitleaks or trufflehog)
gitleaks detect --source . --verbose
# or
trufflehog git file://. --since-commit HEAD
```

**Check git log for secrets in history:**
```bash
git log -p | grep -iE '(api_key|secret|token|password|credential|private_key)' || echo "clean"
```

**Quick in-code scan (before commit):**
```bash
grep -rnE '(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|xox[baprs]-[0-9a-zA-Z-]+)' . || echo "no common tokens found"
```

---

## Pre-Push Gate Script

Combine all checks into a single script for CI or local hooks:

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "=== Typecheck ==="
npx tsc --noEmit

echo "=== Lint ==="
npx eslint . --max-warnings=0

echo "=== Tests ==="
npm test

echo "=== Dependency Audit ==="
npm audit --audit-level=high

echo "=== Bundle Size ==="
npm run build
du -sm dist/

echo "=== Env Vars ==="
: "${API_KEY:?Missing API_KEY}"
: "${DATABASE_URL:?Missing DATABASE_URL}"

echo "=== Secrets Scan ==="
git diff --staged | grep -iE '(api_key|secret|token|password|credential)' || echo "clean"

echo "All checks passed."
```

Save this as `scripts/pre-push.sh` and add it as a `pre-push` git hook.
