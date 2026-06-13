# Common Scouting Patterns

Concrete scenarios with recommended Scout mode selection and exact commands.

## 1. Find a Specific Function

**Scenario:** "Where is the `authenticate_user` function defined?"

| Approach | Mode | Tools | Steps |
|----------|------|-------|-------|
| Fastest | Lite | `rg` | 1. `search_files("def authenticate_user", target="content")`<br>2. Read the file containing the definition |
| Output | Lite | Summary | File path, function signature, first 20 lines |

**Lite command:**
```python
# Fast: find just files containing the pattern
results = search_files(pattern="def authenticate_user", target="files", path=repo_root)
# Then read only the defining file
```

**Efficiency:** Use `target="files"` first (returns filenames only, no line-by-line). Only switch to `target="content"` when you need to confirm the match.

## 2. Understand a Subsystem

**Scenario:** "How does the auth system work end-to-end?"

| Approach | Mode | Tools | Steps |
|----------|------|-------|-------|
| Recommended | Hybrid | Lite → Full | 1. Lite: grep for auth files<br>2. Full: distill key flows |

**Hybrid approach:**
```
# Step 1: Lite - narrow down
auth_files = search_files(
    pattern="auth|jwt|login|session|token",
    target="files",
    path="src/"
)

# Step 2: Full - distill
scout_goal = f"""Read these auth-related files and explain the authentication flow:
{auth_files[:8]}

MAIN TASK: Explain how auth works from login to request authentication
Return a JSON with: "flow_steps", "key_files", "where_session_stored"
"""
```

## 3. Before Refactoring

**Scenario:** "What would I need to change to move auth to a separate service?"

| Approach | Mode | Steps |
|----------|------|-------|
| Required | Full | Scout-Full reads auth files, returns coupling analysis |

**Full prompt:**
```
Read these files and identify:
1. What other systems does auth depend on?
2. What would break if auth were extracted?
3. What interfaces would need to change?

Files: [list of auth files]
```

## 4. Debugging a Crash

**Scenario:** "Why is the checkout flow failing?"

| Approach | Mode | Steps |
|----------|------|-------|
| Initial triage | Lite | 1. Find error in logs<br>2. `rg` for error string<br>3. Read only the error-handling code |
| Root cause | Hybrid | 1. Lite: narrow to relevant files<br>2. Full: understand the flow leading to error |

**Lite triage (efficient):**
```python
# Step 1: Get files with the error — fast filename scan
results = search_files(pattern="checkout|CheckoutError|cart_id", target="files", path="src/")

# Step 2: Rank by match count (already done by search_files output)
# Step 3: Read only top 3 files — don't read everything
for f in results[:3]:
    content = read_file(f)
```

## 5. Large Codebase Orientation

**Scenario:** "I just joined this project. What's the overall structure?"

| Approach | Mode | Why |
|----------|------|-----|
| Best | Full | Need cross-file synthesis to understand architecture |

**Full prompt:**
```
Read the top-level files and directory structure:
- README.md (if exists)
- package.json OR pyproject.toml OR Cargo.toml
- src/ or lib/ directory listing
- Any ARCHITECTURE.md or docs/

Return a JSON:
{{
  "project_type": "web app / API / library / CLI",
  "main_modules": ["list of top-level modules and their purpose"],
  "entry_points": "how the app starts",
  "key_files": {{"file": "one-line purpose"}}
}}
```

## 6. API Contract Discovery

**Scenario:** "What endpoints does this API expose?"

| Approach | Mode | Tools |
|----------|------|-------|
| Fastest | Lite | `rg` for route decorators |

**Lite commands (efficient `rg` patterns):**
```python
# Python/FastAPI — use target="files" first to get file list, then content
routes = search_files(pattern="@(app|router)\\.(get|post|put|delete|patch)", target="files", path=".")

# JavaScript/Express
routes = search_files(pattern="(app|router)\\.(get|post|put|delete)", target="files", path=".")

# Go
routes = search_files(pattern="http\\.(HandleFunc|Handle)|\\.ServeHTTP", target="files", path=".")
```

**Efficiency:** Always `target="files"` for initial discovery. Only read line content when you need the full route path and handler name.

## Mode Selection Cheat Sheet

| Question | Answer | Mode |
|----------|--------|------|
| Do you know the filename or function name? | Yes | Lite |
| Is the codebase >50 files? | Yes + need comprehension | Hybrid |
| Do you need cross-file synthesis? | Yes | Full |
| Is Scout taking >60s? | Yes | Lite |
| Is the codebase <20 files? | Yes | Lite (Full is overkill) |
| Are you about to make a significant change? | Yes | Hybrid |
| Is this for debugging? | Yes | Lite first, then Hybrid if needed |
| Is this for learning a new codebase? | Yes | Full |

## Output Templates

### Lite Output (file list + snippets)

```json
{
  "matched_files": [
    {"file": "src/auth.py", "matches": 5, "snippet": "def authenticate_user(...): ..."},
    {"file": "src/middleware.py", "matches": 2, "snippet": "auth_middleware(...): ..."}
  ],
  "total_matches": 7
}
```

**Efficient Lite pattern:**
1. `search_files(pattern, target="files")` → get filenames only (fast, no line noise)
2. Count matches per file to rank relevance
3. `search_files(pattern, target="content")` on top 3-5 files only → get snippets
4. Discard the rest — no need to read 50 files

### Full Output (distilled summary)
```json
{
  "relevant_findings": [
    "authenticate_user() validates JWT token from Authorization header",
    "Session stored in Redis with 24h TTL",
    "middleware.py applies auth_middleware to all /api/* routes"
  ],
  "key_files": {
    "src/auth.py": "Core authentication logic, JWT validation",
    "src/middleware.py": "Auth middleware registration",
    "src/session.py": "Redis session management"
  },
  "gaps": "Token refresh flow not implemented - returns 401 on expiry"
}
```
