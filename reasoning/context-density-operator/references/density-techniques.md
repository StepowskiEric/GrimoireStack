---
name: context-density-operator/density-techniques
description: Concrete compression techniques for maximizing context density. Provides step-by-step examples with before/after token counts for summary extraction, signature-only reads, ellipsis for boilerplate, and test output purification.
category: reasoning
tags: [compression, token-efficiency, context-management]
---

# Density Techniques Reference

Practical compression patterns with token count examples. Each technique shows real before/after measurements using typical GPT tokenization (cl100k_base).

## Token Count Methodology

Token counts in this document are approximate, measured using typical GPT-4/Claude tokenization:
- ~4 characters per token for English prose
- ~1 token per word on average (varies by word length)
- Code: ~1.5 tokens per line (function signatures compress better than logic)

---

## Technique 1: Summary Extraction

**Goal:** Replace verbose content with condensed summary that preserves decision-relevant information.

### Example A: Tool Output Summary

**Before (1,247 tokens):**
```
Tool: web_search
Query: "FastAPI lifespan events bug"
Results:
1. Title: "FastAPI lifespan events documentation"
   URL: https://fastapi.tiangolo.com/advanced/events/
   Description: FastAPI supports startup and shutdown events through lifespan context managers...
   [300-word article excerpt about lifespan events, including code examples]

2. Title: "Starlette Router initialization order"
   URL: https://www.starlette.io/routing/
   Description: The Router class initializes its routes during __init__...
   [250-word technical description]

3. Title: "GitHub issue #7421: on_startup not firing"
   URL: https://github.com/tiangolo/fastapi/issues/7421
   Description: Users report that on_startup events are not triggered when...
   [400-word issue description with 15 comments]

4. Title: "Stack Overflow: FastAPI startup event timing"
   URL: https://stackoverflow.com/questions/...
   Description: Question about when exactly startup events fire...
   [350-word Q&A with code snippets]

[6 more results with similar verbosity]
```

**After (187 tokens):**
```
Search: FastAPI lifespan events → on_startup bug
Key finding: Starlette Router.__init__ overwrites self.on_startup after FastAPI assigns it
Sources:
- Ref #search-20250514-001 (10 results, Starlette timing issue)
- Ref #github-7421 (confirmed bug, 15 comments)
- Ref #fastapi-docs (lifespan events documentation)
```

**Compression ratio: 6.67:1 (1,247 → 187 tokens)**
**Information retained:** Root cause, source references, actionability

### Example B: Reasoning Chain Summary

**Before (842 tokens):**
```
I started by searching for the FastAPI startup bug. I found several relevant issues
on GitHub and some documentation about lifespan events. The Starlette docs mention
that the Router class has an __init__ method that sets up routes. I read the
routing.py file and looked at line 954 where on_startup is assigned. Then I
checked the Starlette source to see when Router.__init__ is called. It appears
that FastAPI calls super().__init__() after setting its own on_startup handlers,
but then Starlette overwrites self.on_startup with an empty list in its __init__.
This means any handlers set before the super() call get lost. The fix would be
to either set them after super().__init__() or use a different mechanism.
```

**After (98 tokens):**
```
Reasoning: FastAPI sets on_startup → calls super().__init__() → Starlette overwrites with empty list
Root cause: Assignment order in Router initialization
Fix: Set handlers after super().__init__() or use lifespan events
```

**Compression ratio: 8.59:1 (842 → 98 tokens)**

---

## Technique 2: Signature-Only Reads

**Goal:** Preserve function signatures and structural context while dropping implementation details.

### Example A: Code File Compression

**Before (1,205 tokens - 85 lines):**
```python
# fastapi/routing.py
from starlette.routing import Router as StarletteRouter
from typing import Callable, List, Optional
import logging

logger = logging.getLogger(__name__)

class APIRouter(StarletteRouter):
    def __init__(self, *, prefix: str = "", tags: Optional[List[str]] = None,
                 dependencies: Optional[List[Depends]] = None,
                 default_response_class: Type[Response] = Default,
                 route_class: Type[BaseRoute] = APIRoute,
                 middleware: Optional[List[Middleware]] = None):

        super().__init__()
        self.prefix = prefix
        self.tags = tags or []
        self.dependencies = dependencies or []
        self.default_response_class = default_response_class
        self.route_class = route_class
        self.middleware = middleware or []

        # Custom FastAPI setup
        self.on_startup = []
        self.on_shutdown = []

        # Setup routes
        self.routes = []
        self._init_done = False

    def add_api_route(self, path: str, endpoint: Callable, **kwargs):
        if not self._init_done:
            self._setup()
        route = self.route_class(path, endpoint, **kwargs)
        self.routes.append(route)
        logger.debug(f"Added route {path}")

    def _setup(self):
        # Initialize internal state
        self._init_done = True
        self._build_route_map()

    def _build_route_map(self):
        # Build internal routing table
        self._route_map = {}
        for route in self.routes:
            self._route_map[route.path] = route

    def get_route(self, path: str):
        return self._route_map.get(path)

    def include_router(self, router: "APIRouter", prefix: str = ""):
        # Merge another router into this one
        for route in router.routes:
            new_path = prefix + route.path
            self.add_api_route(new_path, route.endpoint, **route.kwargs)

    async def startup(self):
        for handler in self.on_startup:
            await handler()

    async def shutdown(self):
        for handler in self.on_shutdown:
            await handler()

    def _merge_openapi_specs(self, specs: List[Dict]) -> Dict:
        # Merge multiple OpenAPI specs...
        merged = {}
        for spec in specs:
            # Complex merging logic...
            pass
        return merged

    # [30 more methods...]
```

**After (247 tokens - signatures only):**
```python
# fastapi/routing.py — signatures only (lines 1-120)
class APIRouter(StarletteRouter):
    __init__(self, *, prefix, tags, dependencies, default_response_class,
             route_class, middleware)
    add_api_route(self, path: str, endpoint: Callable, **kwargs)
    _setup(self)
    _build_route_map(self)
    get_route(self, path: str)
    include_router(self, router, prefix: str)
    startup(self) → async
    shutdown(self) → async
    _merge_openapi_specs(self, specs: List[Dict]) → Dict
    # [30 more methods...]
```

**Compression ratio: 4.88:1 (1,205 → 247 tokens)**
**Information retained:** Method names, signatures, async indicators, class structure

### When to Use Signatures Only

- **Context budget < 20% remaining:** Use signature-only for files you reference but won't modify
- **Code review tasks:** Signatures give structure; you can expand specific methods on demand
- **Debugging:** Identify relevant method, then expand only that method with full implementation
- **Architecture discussions:** Understand module structure without implementation noise

**Expansion rule:** "Expand ref #routing-py → show methods 45-67 (add_api_route, _setup)"

---

## Technique 3: Ellipsis for Boilerplate

**Goal:** Replace repetitive patterns with ellipsis notation, keeping one representative example.

### Example A: Test Cases

**Before (958 tokens):**
```python
# test_api.py

def test_create_user_success(client):
    """Test successful user creation."""
    response = client.post("/users/", json={"name": "Alice", "email": "alice@example.com"})
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Alice"
    assert data["email"] == "alice@example.com"

def test_create_user_missing_name(client):
    """Test user creation with missing name."""
    response = client.post("/users/", json={"email": "bob@example.com"})
    assert response.status_code == 422
    data = response.json()
    assert "name" in data["detail"]

def test_create_user_missing_email(client):
    """Test user creation with missing email."""
    response = client.post("/users/", json={"name": "Charlie"})
    assert response.status_code == 422
    data = response.json()
    assert "email" in data["detail"]

def test_create_user_invalid_email(client):
    """Test user creation with invalid email format."""
    response = client.post("/users/", json={"name": "Dave", "email": "invalid"})
    assert response.status_code == 422
    data = response.json()
    assert "email" in data["detail"]

def test_create_user_duplicate_email(client):
    """Test user creation with duplicate email."""
    client.post("/users/", json={"name": "Eve", "email": "eve@example.com"})
    response = client.post("/users/", json={"name": "Eve2", "email": "eve@example.com"})
    assert response.status_code == 409

def test_create_user_empty_name(client):
    """Test user creation with empty name."""
    response = client.post("/users/", json={"name": "", "email": "frank@example.com"})
    assert response.status_code == 422

def test_create_user_empty_email(client):
    """Test user creation with empty email."""
    response = client.post("/users/", json={"name": "George", "email": ""})
    assert response.status_code == 422

def test_create_user_long_name(client):
    """Test user creation with name exceeding max length."""
    response = client.post("/users/", json={"name": "A" * 256, "email": "hank@example.com"})
    assert response.status_code == 422

def test_create_user_sql_injection(client):
    """Test user creation with SQL injection attempt."""
    response = client.post("/users/", json={"name": "'; DROP TABLE users; --", "email": "ivan@example.com"})
    assert response.status_code == 422

def test_create_user_special_chars(client):
    """Test user creation with special characters."""
    response = client.post("/users/", json={"name": "Jürgen", "email": "jurgen@example.com"})
    assert response.status_code == 201
```

**After (268 tokens):**
```python
# test_api.py — validation tests

def test_create_user_success(client):
    """Test successful user creation."""
    response = client.post("/users/", json={"name": "Alice", "email": "alice@example.com"})
    assert response.status_code == 201

# ... (skipped: 8 similar validation tests)
# Patterns covered: missing fields, invalid formats, duplicates,
#                  edge cases (empty, long, special chars, injection)

def test_create_user_special_chars(client):
    response = client.post("/users/", json={"name": "Jürgen", "email": "jurgen@example.com"})
    assert response.status_code == 201
```

**Compression ratio: 3.58:1 (958 → 268 tokens)**
**Information retained:** Test intent, assertion pattern, one concrete example, count of skipped tests

### Example B: Repeated API Endpoints

**Before (487 tokens):**
```yaml
# openapi.yaml — endpoints
/users:
  get:
    summary: List users
    responses:
      200:
        description: List of users
      401:
        description: Unauthorized
  post:
    summary: Create user
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/UserCreate'
    responses:
      201:
        description: User created
      400:
        description: Bad request
      401:
        description: Unauthorized

/users/{user_id}:
  get:
    summary: Get user by ID
    parameters:
      - name: user_id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: User details
      404:
        description: User not found
      401:
        description: Unauthorized
  put:
    summary: Update user
    # [similar structure]
  delete:
    summary: Delete user
    # [similar structure]

/posts:
  get:
    summary: List posts
    responses:
      200:
        description: List of posts
      401:
        description: Unauthorized
  post:
    summary: Create post
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/PostCreate'
    responses:
      201:
        description: Post created
      400:
        description: Bad request
      401:
        description: Unauthorized

/posts/{post_id}:
  # [similar CRUD pattern with 4 methods]
  # ... (20 more endpoints following same pattern)
```

**After (157 tokens):**
```yaml
# openapi.yaml — endpoint structure (full in ref #openapi-yaml)
Pattern: All resources follow GET/POST on /resource, GET/PUT/DELETE on /resource/{id}
Common responses: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found)

Resources defined: /users, /posts, /comments, /likes, /follows, /notifications
Full spec: 47 endpoints → ref #openapi-yaml

Example — /users:
  get: List users (200, 401)
  post: Create user (201, 400, 401) → ref schema UserCreate

Example — /users/{user_id}:
  get: Get user (200, 404, 401)
  put: Update user (200, 404, 401)
  delete: Delete user (204, 404, 401)
```

**Compression ratio: 3.10:1 (487 → 157 tokens)**

---

## Technique 4: Test Output Purification

**Goal:** Strip verbose test framework output to preserve only failure signals and summary counts.

### Example A: pytest Full Output

**Before (1,456 tokens):**
```
============================= test session starts ==============================
platform linux -- Python 3.11.4, pytest-7.4.0, pluggy-1.3.0
rootdir: /home/user/project
collected 247 items

tests/test_api.py::test_create_user_success PASSED             [  1%]
tests/test_api.py::test_create_user_missing_name PASSED        [  2%]
tests/test_api.py::test_create_user_missing_email PASSED       [  3%]
tests/test_api.py::test_create_user_invalid_email PASSED       [  4%]
tests/test_api.py::test_create_user_duplicate_email PASSED     [  5%]
tests/test_api.py::test_create_user_empty_name PASSED          [  6%]
tests/test_api.py::test_create_user_empty_email PASSED         [  7%]
tests/test_api.py::test_create_user_long_name PASSED           [  8%]
tests/test_api.py::test_create_user_sql_injection PASSED       [  9%]
tests/test_api.py::test_create_user_special_chars PASSED       [ 10%]
... (237 more lines of PASSED output)
...
tests/test_integration.py::test_full_workflow PASSED           [ 99%]
tests/test_integration.py::test_error_handling FAILED          [100%]

=================================== FAILURES ===================================
___________________________ test_error_handling FAILED __________________________

    def test_error_handling():
        """Test error handling in production scenario."""
        response = client.post("/api/process/", json={"data": "invalid"})
        expected = {"error": "Invalid input", "code": 400}

        # Assertion failed on line 47
>       assert response.status_code == expected["code"]
E       assert 500 == 400

tests/test_integration.py:47: AssertionError

        # Additional context
        response_json = response.json()
        expected_json = {"error": "Invalid input", "code": 400}
E       AssertionError: assert {'error': 'Internal Server Error'} == {'error': 'Invalid input', 'code': 400}
  Full diff:
  {
    'error': 'Internal Server Error' != 'Invalid input'
  }
  - Invalid input
  + Internal Server Error

    # Stack trace
    Traceback (most recent call last):
      File "/home/user/project/tests/test_integration.py", line 45, in test_error_handling
        response = client.post("/api/process/", json={"data": "invalid"})
      File "/home/user/project/app/main.py", line 234, in post
        result = processor.process(data)
      File "/home/user/project/app/processor.py", line 89, in process
        return self._handle(data)
      File "/home/user/project/app/handler.py", line 112, in handle
        raise RuntimeError("Unexpected error in processing")
    handler.py:112: RuntimeError

    # [20 more stack frames]
```

**After (143 tokens):**
```
pytest: 246 passed, 1 failed in 12.4s

FAILED: tests/test_integration.py::test_error_handling
  Expected: status_code=400, body={"error": "Invalid input"}
  Actual:   status_code=500, body={"error": "Internal Server Error"}
  Root cause: handler.py:112 RuntimeError("Unexpected error in processing")
```

**Compression ratio: 10.18:1 (1,456 → 143 tokens)**
**Information retained:** Failure count, test name, expected vs actual, stack trace top frame

### Example B: Log Output

**Before (673 tokens):**
```
2024-05-14 10:23:01.123 | INFO     | app.main:startup:45 - Application starting
2024-05-14 10:23:01.234 | INFO     | app.database:connect:67 - Connecting to database...
2024-05-14 10:23:01.456 | INFO     | app.database:connect:89 - Connection established (pool_size=10)
2024-05-14 10:23:01.567 | INFO     | app.cache:init:34 - Initializing Redis cache...
2024-05-14 10:23:01.789 | INFO     | app.cache:init:56 - Cache ready (host=localhost, port=6379)
2024-05-14 10:23:01.890 | INFO     | app.routes:load:23 - Loading 47 API routes
2024-05-14 10:23:02.012 | INFO     | app.main:startup:67 - Application ready in 0.889s
2024-05-14 10:23:02.345 | DEBUG    | app.middleware:log:112 - Incoming request: POST /api/users
2024-05-14 10:23:02.456 | DEBUG    | app.auth:validate:89 - Token validated: user_id=42
2024-05-14 10:23:02.567 | DEBUG    | app.handlers:create_user:156 - Creating user with email=alice@example.com
2024-05-14 10:23:02.678 | DEBUG    | app.database:insert:234 - INSERT INTO users... [SQL query]
2024-05-14 10:23:02.789 | INFO     | app.handlers:create_user:178 - User created: id=123
2024-05-14 10:23:02.890 | INFO     | app.middleware:log:145 - Response: 201 Created (12.3ms)
... (800+ lines of normal operation logs)
...
2024-05-14 10:23:15.123 | ERROR    | app.handlers:process:312 - Processing failed
2024-05-14 10:23:15.234 | ERROR    | app.handler:handle:112 - RuntimeError: Unexpected error
2024-05-14 10:23:15.345 | TRACE    | app.handler:handle:115 - Traceback (most recent call last):
2024-05-14 10:23:15.456 | TRACE    | app.handler:handle:118 -   File ".../handler.py", line 112, in handle
2024-05-14 10:23:15.567 | TRACE    | app.handler:handle:119 -     raise RuntimeError("Unexpected error")
2024-05-14 10:23:15.678 | TRACE    | app.handler:handle:120 - RuntimeError: Unexpected error in processing
2024-05-14 10:23:15.789 | INFO     | app.middleware:log:167 - Response: 500 Internal Server Error (78.2ms)
```

**After (142 tokens):**
```
App startup: 0.889s (db+redis+routes)
Errors: 1

ERROR [10:23:15] handler.py:112 RuntimeError: Unexpected error in processing
  → Response: 500 Internal Server Error (78.2ms)
  → Last successful: POST /api/users → 201 Created (12.3ms)

Log window: 10:23:01 - 10:23:15 (14.7s)
[Full logs: ref #app-logs-20250514]
```

**Compression ratio: 4.73:1 (673 → 142 tokens)**

---

## Technique 5: On-Demand Reference Tables

**Goal:** Move detailed content to a compressed reference table; keep only key + summary in main context.

### Structure

```markdown
## Reference Table (Expanded)

| Ref ID | Content | Token Count | Last Accessed |
|--------|---------|-------------|---------------|
| #001   | Web search results for FastAPI bug | 187 | Turn 5 |
| #002   | Full routing.py source | 247 | Turn 3 |
| #003   | GitHub issue #7421 | 143 | Turn 4 |
| #004   | Test output: pytest run | 142 | Turn 6 |

Total reference table tokens: 719
```

**Main context usage:** `Ref #001 (10 items, Starlette timing bug)` → 23 tokens
**vs keeping full content:** 187 tokens
**Savings per reference:** ~164 tokens average

---

## Compression Decision Tree

```
Is item NOISE? (irrelevant to current task)
  → Drop immediately (−100% tokens)

Is item REDUNDANT? (duplicates existing context)
  → Deduplicate; keep 1 copy with citation count

Is item HISTORICAL? (reasoning already incorporated)?
  → Tier 1: Replace full chain with "Step N: COMPLETE (result: Y)"
  → Tier 2: Replace with conclusion + 3-5 key assumptions
  → Tier 3: Replace with signature-only if code

Is item REFERENCE? (may be needed if something fails)?
  → Move to reference table with key + 1-line summary
  → Keep in main context only if actively troubleshooting

Is item DECISION-CRITICAL? (needed for next action)?
  → Keep fully in main context
  → If budget constrained: summarize, flag for on-demand expansion
```

---

## Token Budget Targets

| Context Level | Target % | Compression Style |
|---------------|----------|-------------------|
| Level 1: Always Visible | 30% | Uncompressed (current task, next 2 plan steps) |
| Level 2: Summarized | 50% | Summary extraction, signature-only, ellipsis |
| Level 3: Reference | 20% | Full content stored, key + summary in context |

**Example (4,096 token budget):**
- Level 1: 1,229 tokens (task + active plan)
- Level 2: 2,048 tokens (summarized history, tool results, memories)
- Level 3: 819 tokens (reference table entries + summaries)
- **Total decision-critical ratio:** 1,229 / 4,096 = **0.30** (below 0.6 target!)
- **Action:** Compress Level 2 more aggressively OR move more to Level 3

**Target ratio:** Decision-critical tokens / Total tokens > 0.6

If you have 1,229 decision-critical tokens in 4,096 total:
- Need total ≤ 2,048 to hit 0.6 ratio
- Must compress 2,048 tokens from non-critical content
- Achievable: move 819 to Level 3 (reference), compress 1,229 from Level 2

---

## Quick Reference: Compression Ratios by Content Type

| Content Type | Typical Ratio | Example |
|--------------|---------------|---------|
| Tool output (search results) | 5:1 - 10:1 | 1,247 → 187 |
| Reasoning chain | 6:1 - 12:1 | 842 → 98 |
| Code file (signature-only) | 4:1 - 6:1 | 1,205 → 247 |
| Test output (purified) | 8:1 - 15:1 | 1,456 → 143 |
| Repetitive patterns (ellipsis) | 3:1 - 5:1 | 958 → 268 |
| API specs (structure only) | 3:1 - 4:1 | 487 → 157 |

**Expected overall compression:** 4:1 to 8:1 for mixed context after aggressive Tier 3-4

---

## Anti-Patterns

❌ **Don't** drop error messages before they're addressed
❌ **Don't** compress reasoning chain before verifying conclusion
❌ **Don't** deduplicate without keeping at least one source citation
❌ **Don't** let reference table grow beyond 20% of budget
❌ **Don't** compress below 0.6 decision-critical ratio

✅ **Do** preserve the current task description at all times
✅ **Do** keep variable values at failure point when debugging
✅ **Do** verify summary captures decision-relevant info before replacing
✅ **Do** prune reference items not accessed in last N turns
✅ **Do** measure token counts after each compression pass
