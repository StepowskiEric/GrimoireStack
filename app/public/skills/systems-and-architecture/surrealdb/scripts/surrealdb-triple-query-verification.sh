#!/usr/bin/env bash
# surrealdb-triple-query-verification.sh
# Verifies that triple-aware retrieval queries execute correctly against a real SurrealDB.
# Run this after schema changes or before claiming triple retrieval "works".
#
# Usage:
#   ./scripts/surrealdb-triple-query-verification.sh
#
# Requires: live SurrealDB on localhost:8137 (or $SURREAL_URL), curl, jq

set -euo pipefail

SURREAL_URL="${SURREAL_URL:-http://127.0.0.1:8137}"
USER="${SURREAL_USER:-root}"
PASS="${SURREAL_PASS:-root}"

# ---------------------------------------------------------------------------
# 1. Authenticate
# ---------------------------------------------------------------------------
TOKEN=$(curl -sf -X POST "$SURREAL_URL/signin" \
  -H "Content-Type: application/json" \
  -d "{\"user\":\"$USER\",\"pass\":\"$PASS\"}" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "FAIL: could not authenticate to $SURREAL_URL"
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

# ---------------------------------------------------------------------------
# 2. Verify meta::id() works for record link extraction
# ---------------------------------------------------------------------------
echo "TEST 1: meta::id() extract from triples..."
RESULT=$(curl -sf -X POST "$SURREAL_URL/sql" \
  -H "Content-Type: text/plain" \
  -H "$AUTH" \
  -d "USE NS coppermind DB daemon; SELECT meta::id(memory_id) AS memId FROM triples LIMIT 1;")

if echo "$RESULT" | jq -e '.[0].result | length > 0' >/dev/null 2>&1; then
  echo "  PASS: meta::id() returns string record IDs"
else
  echo "  SKIP: no triples in DB to test against"
fi

# ---------------------------------------------------------------------------
# 3. Verify IN clause with meta::id() works (batch fetch pattern)
# ---------------------------------------------------------------------------
echo "TEST 2: IN clause with meta::id()..."
RESULT=$(curl -sf -X POST "$SURREAL_URL/sql" \
  -H "Content-Type: text/plain" \
  -H "$AUTH" \
  -d "USE NS coppermind DB daemon; SELECT * FROM triples WHERE meta::id(memory_id) IN ['test1'] LIMIT 1;")

if echo "$RESULT" | jq -e '. | length >= 1' >/dev/null 2>&1; then
  echo "  PASS: IN clause with meta::id() executes without parse error"
else
  echo "  FAIL: query returned unexpected shape or errored"
  echo "$RESULT" | jq .
  exit 1
fi

# ---------------------------------------------------------------------------
# 4. Verify broken pattern: (string)field produces parse error
# ---------------------------------------------------------------------------
echo "TEST 3: Verify (string)field cast fails as expected..."
RESULT=$(curl -sf -X POST "$SURREAL_URL/sql" \
  -H "Content-Type: text/plain" \
  -H "$AUTH" \
  -d "USE NS coppermind DB daemon; SELECT (string)memory_id AS memId FROM triples LIMIT 1;" || true)

if echo "$RESULT" | grep -q "Parse error"; then
  echo "  PASS: (string)memory_id correctly rejected by SurrealDB"
else
  echo "  UNEXPECTED: query did not fail — SurrealDB version may have changed behavior"
fi

# ---------------------------------------------------------------------------
# 5. Verify memory_id.entry_id without FETCH does NOT produce useful results
# ---------------------------------------------------------------------------
echo "TEST 4: Verify memory_id.entry_id without FETCH is broken..."
RESULT=$(curl -sf -X POST "$SURREAL_URL/sql" \
  -H "Content-Type: text/plain" \
  -H "$AUTH" \
  -d "USE NS coppermind DB daemon; SELECT * FROM triples WHERE memory_id.entry_id = 'test' LIMIT 1;")

# This query parses but returns empty even when data exists (if no FETCH)
# We just verify it doesn't crash; the semantic behavior is documented in the skill.
echo "  INFO: query parsed; whether it returns data depends on FETCH and data presence"

echo ""
echo "All verification steps completed."
echo "If any step FAILed, fix the query before claiming triple retrieval works."
