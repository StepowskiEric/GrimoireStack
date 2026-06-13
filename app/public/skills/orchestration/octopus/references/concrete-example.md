# Octopus Pattern: Concrete Example

## Scenario: Build a Feature Flag Dashboard

**Task**: Given a feature-flag service with a REST API, build a dashboard frontend (React) + backend proxy (Express) + automated test suite.

### Step 1 — Contract-Driven Decomposition

First, define the shared contract: the API types both frontend and backend will use.

**Shared contract**: `types/api.ts`

```typescript
// Shared between frontend and backend
export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
  updatedAt: string;
}

export interface FlagToggleRequest {
  enabled: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
```

**Subtasks identified:**

| Subtask | Dependencies | Type |
|---|---|---|
| S0: Define `types/api.ts` | None | Contract |
| S1: Express backend proxy | S0 | Parallel (after S0) |
| S2: React dashboard UI | S0 | Parallel (after S0) |
| S3: Integration tests | S1, S2 | Sequential (after both) |

### Step 2 — Workspace Setup

```
workspace/flag-dashboard/
  _contracts/
    api.ts          # created by main agent
  _status/
    arm-backend.json
    arm-frontend.json
    arm-tests.json
  _artifacts/
    backend/        # created by arm-backend
    frontend/       # created by arm-frontend
  _wip/
```

### Step 3 — Parallel Delegation

After S0 creates `workspace/_contracts/api.ts`, launch S1 and S2 simultaneously:

```
arm-backend → creates backend/src/server.ts, backend/src/routes.ts
arm-frontend → creates frontend/src/App.tsx, frontend/src/FeatureList.tsx
```

Both arms import from `workspace/_contracts/api.ts`. Neither depends on the other's code — just the contract.

### Step 4 — Local Adaptability

While building the backend, `arm-backend` needs to know what port the frontend expects. Instead of asking the main agent, it reads `workspace/_status/arm-frontend.json` and sees the frontend wrote:

```json
{"status": "running", "expected_api_port": 4000}
```

`arm-backend` adjusts its Express server to listen on port 4000. No escalation needed.

### Step 5 — Retraction & Aggregation

**arm-backend** reports:
```json
{
  "status": "success",
  "artifacts": ["backend/src/server.ts", "backend/src/routes.ts", "backend/package.json"],
  "summary": "Express server on port 4000, GET /api/flags and POST /api/flags/:id/toggle",
  "errors": []
}
```

**arm-frontend** reports:
```json
{
  "status": "partial",
  "artifacts": ["frontend/src/App.tsx", "frontend/src/FeatureList.tsx"],
  "summary": "Dashboard renders feature flag list and toggle buttons",
  "errors": ["Toggle button API call returns CORS error"]
}
```

Main agent reads the CORS error, adds a CORS middleware to the backend (quick merge), then launches S3 (tests).

**Final summary:**
```
✅ Completed:
  - types/api.ts
  - backend/src/server.ts + routes.ts
  - frontend/src/App.tsx + FeatureList.tsx

⚠️ Conflicts: none

❌ Failed: none

🩹 Auto-heals:
  - arm-frontend CORS issue → main agent added cors() middleware to backend
```
