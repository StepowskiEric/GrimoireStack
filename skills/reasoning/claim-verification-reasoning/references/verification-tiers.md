# Verification Tiers — Concrete Commands

A tiered escalation strategy for verifying claims. Start at Tier 0 and stop as soon as the
claim is resolved. Do **not** skip tiers unless you already know the tool won't help.

---

## Tier 0 — Self-Check

**Goal:** Catch inconsistencies in your own reasoning without touching any tool.

| Check | Command / action |
|-------|-----------------|
| Every UNCERTAIN/SPECULATIVE claim has a verification action? | Mentally scan your claim list; if any claim has no action listed, flag it now. |
| Confidence labels are consistent with evidence? | For each CERTAIN claim, can you point to the source file/line? If not, downgrade to LIKELY or UNCERTAIN. |
| Dependency graph has no cycles? | Trace each claim's ancestors; if A→B→A, break by finding an external verification point. |
| Conclusion confidence matches worst ancestor? | If any ancestor is LIKELY the conclusion must be at most LIKELY. |

---

## Tier 1 — Pattern Search (`rg` / ripgrep)

**Goal:** Find whether a claim is supported or contradicted by existing code/docs without reading
files in full.

```bash
# 1. Find all definitions of a function or class
rg "def authenticate" --type py
rg "class APIRouter" --type py

# 2. Search for a specific pattern near a file
rg "on_startup" path/to/routing.py

# 3. Show context lines to understand usage
rg "on_startup" path/to/routing.py -C 3

# 4. Search only filenames (is the file even present?)
rg --files | rg "auth_middleware"

# 5. Narrow to a specific directory
rg "set_cookie" src/ --type py

# 6. Search config / env files
rg "DATABASE_URL" --glob '*.env*' --glob 'config/*'

# 7. Find test files related to a module
rg "test.*auth" --type py -l
```

**Interpretation rule:** `rg` only tells you *whether* a pattern exists, not *what it does*.
A match is a lead, not proof. Always confirm with Tier 2.

---

## Tier 2 — Runtime Read / Run

**Goal:** Confirm the claim by reading the exact source or executing a command.

### 2a. Read source at specific lines

```bash
# Read file with line numbers (use read_file tool with line range)
read_file("src/routing.py", offset=940, limit=20)
```

**Tip:** Always verify at the exact line number cited by a Tier 1 match. Do not rely on
search snippets.

### 2b. Run a focused command

```bash
# Execute a one-liner to inspect a variable / return value
python -c "import mymodule; print(mymodule.__version__)"

# Grep a running process or log
grep "ERROR" /var/log/app.log | tail -20

# Git: inspect what a commit actually changed
git show HEAD -- path/to/file.py

# DB: check schema or a specific row
psql mydb -c "\d+ users"
psql mydb -c "SELECT * FROM users WHERE id=1 LIMIT 1;"

# HTTP: call an endpoint and inspect the response
curl -s https://api.example.com/health | python -m json.tool
```

### 2c. Run existing tests

```bash
# Run all tests in a file
pytest tests/test_auth.py -v

# Run a single test function
pytest tests/test_auth.py::test_login_success -v

# Run with a marker (e.g. integration)
pytest -m integration -v
```

---

## Tier 3 — Write a Test

**Goal:** When no existing test covers the claim, write the smallest possible test that
*falsifies* or *confirms* it. A passing test upgrades the claim to CERTAIN.

### Pattern: reproduction → assertion → run

```bash
# Step 1: Write the test file
write_file("test_claim_verification.py", content='''
def test_on_startup_not_overwritten():
    """Claim: Starlette Router.__init__ does NOT clobber on_startup handlers."""
    from starlette.routing import Router
    calls = []

    async def handler(request):
        calls.append(1)

    router = Router(on_startup=[handler])
    # If handler is lost, calls will be empty after startup
    assert len(router.on_startup) == 1, "on_startup was overwritten — claim FALSIFIED"
''')

# Step 2: Run it
pytest test_claim_verification.py -v
```

### Pass → Falsify matrix

| Test result | Claim update |
|-------------|-------------|
| ✅ PASSES as written | Upgrade to **CERTAIN**; cite the test file + line |
| ❌ FAILS (assertion hit) | Mark **FALSE**; backtrack to last valid ancestor in the dependency graph |
| ⚠️ FAILS (unrelated error) | Fix the test, re-run; do not draw conclusions from a broken test |

### Good test characteristics

- **Minimal** — one claim per test; no setup beyond what the claim needs.
- **Falsifiable** — the `assert` must be able to fail; a test that always passes proves nothing.
- **Named for the claim** — `test_<short_claim_description>` so the result is easy to cite.

---

## Tier Selection Cheat Sheet

| Situation | Start at |
|-----------|----------|
| Checking your own reasoning for gaps | Tier 0 |
| "Does function X exist?" / "Is Y mentioned anywhere?" | Tier 1 |
| "What does line N actually do?" / "What does this endpoint return?" | Tier 2 |
| No existing test covers this; need hard proof | Tier 3 |
| Tier N is inconclusive | Escalate to N+1 |

---

## Examples by Claim Type

| Claim | Tiers to run |
|-------|-------------|
| "`authenticate()` is called in `login()`" | 1 → 2 |
| "The DB query returns 0 rows for user X" | 2 → 3 |
| "Rate limiter resets after 60 s" | 1 → 2 → 3 |
| "My conclusion follows from premises A and B" | 0 (self-check only; reasoning errors are handled by a different skill) |
| "Config key `MAX_RETRIES` is set to 3 in staging" | 1 → 2 |
