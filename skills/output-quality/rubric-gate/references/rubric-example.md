# Worked Gate

Task: add a `/api/status` endpoint returning service health JSON.

Rubric drafted before implementation:

| # | Criterion | Check |
|---|-----------|-------|
| 1 | GET /api/status returns 200 with JSON body containing `status` key | curl in dev server |
| 2 | Response includes uptime seconds > 0 | curl + jq '.uptime > 0' |
| 3 | Unknown routes still 404 (endpoint adds no catch-all) | curl /api/nope |
| 4 | Unit test covers handler for ok and degraded states | npx vitest run status.test |
| 5 | Handler has no direct DB dependency (injects a client) | read handler source |

Scored gate:

```
1 PASS — curl → {"status":"ok",...}
2 PASS — jq → uptime=8412
3 FAIL — /api/nope returned 200 echo page; router patch matched all paths
3 PASS — narrowed route registration; /api/nope → 404 (re-run)
4 PASS — vitest 2/2 green
5 PASS — handler takes client via argument, src/routes/status.js:12
```

One defect found and fixed at the gate; final pass shows zero FAIL lines.
The scored table ships in the PR description.
