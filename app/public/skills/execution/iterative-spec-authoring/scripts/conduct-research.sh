#!/usr/bin/env bash
# conduct-research.sh — Tool-assisted research for spec authoring
#
# Runs bounded web searches and page fetches to ground a spec in current
# best practices, security standards, and known pitfalls.
#
# Usage:
#   bash conduct-research.sh "Describe the feature or change you're specifying"
#
# Output: research_notes.md in the working directory
#
# Requires: curl, python3 (stdlib only)
# Uses: Brave Search API (free tier) or fallback DuckDuckGo
#
# Set env vars:
#   BRAVE_API_KEY  — optional, for Brave Search (better results)
#   RESEARCH_MODEL — optional LLM model name (default: "anthropic/claude-sonnet-4-mini")

set -euo pipefail

TOPIC="${1:-}"
if [ -z "$TOPIC" ]; then
  echo "Usage: bash conduct-research.sh \"<feature or change description>\"" >&2
  exit 1
fi

# Configuration
MAX_SEARCHES=7
MAX_FETCHES=3
OUTPUT_FILE="research_notes.md"
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M UTC")

echo "🔍 Researching: $TOPIC"
echo "   Max searches: $MAX_SEARCHES | Max fetches: $MAX_FETCHES"
echo ""

# --- Search Queries (designed to be diverse, not redundant) ---
QUERIES=(
  "best practices $TOPIC 2024 2025"
  "$TOPIC common pitfalls security vulnerabilities"
  "$TOPIC library comparison recommended approach"
  "$TOPIC OWASP security guidelines"
  "$TOPIC breaking changes deprecation recent"
  "$TOPIC alternative architecture patterns"
  "$TOPIC performance optimization caching strategy"
)

# --- Output header ---
cat > "$OUTPUT_FILE" << 'HEADER'
# Research Notes

**Topic:** [to be filled]
**Date Retrieved:** TIMESTAMP_PLACEHOLDER
**Confidence key:** 🟢 High (verified from authoritative source) | 🟡 Medium (likely correct, cross-reference if critical) | 🔴 Low (single source or uncertain)

---

## Search Queries Used

HEADER

# Fill in topic and queries
sed -i "s/\[to be filled\]/$TOPIC/" "$OUTPUT_FILE"
sed -i "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$OUTPUT_FILE"

for q in "${QUERIES[@]}"; do
  echo "- \`$q\`" >> "$OUTPUT_FILE"
done

echo "" >> "$OUTPUT_FILE"
echo "## Findings" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# --- Brave Search Helper ---
brave_search() {
  local query="$1"
  if [ -n "${BRAVE_API_KEY:-}" ]; then
    curl -s "https://api.search.brave.com/res/v1/web/search" \
      -H "Accept: application/json" \
      -H "X-Subscription-Token: $BRAVE_API_KEY" \
      -d "{\"q\":\"$query\",\"count\":3}" \
      | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    results = data.get('web', {}).get('results', [])
    for r in results[:3]:
        title = r.get('title', 'No title')
        url = r.get('url', '')
        desc = r.get('description', '')[:200]
        print(f'### {title}')
        print(f'- URL: {url}')
        print(f'- Summary: {desc}')
        print()
except Exception as e:
    print(f'# Brave search result parse error: {e}', file=sys.stderr)
" 2>/dev/null || echo "# Brave search failed or no results"
  else
    echo "# Brave API key not set — skipping search: $query"
  fi
}

# --- DuckDuckGo fallback ---
ddg_search() {
  local query="$1"
  curl -s "https://api.duckduckgo.com/?q=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$query")&format=json&no_html=1" \
    | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    topics = data.get('RelatedTopics', [])
    count = 0
    for t in topics:
        if isinstance(t, dict) and 'FirstURL' in t and count < 3:
            print(f'### {t.get(\"Text\", \"No title\")[:100]}')
            print(f'- URL: {t.get(\"FirstURL\", \"\")}')
            print()
            count += 1
    if count == 0:
        print('# No DuckDuckGo results found')
except Exception as e:
    print(f'# DuckDuckGo search error: {e}', file=sys.stderr)
" 2>/dev/null || echo "# DuckDuckGo search failed"
}

# --- Web Fetch (extract content) ---
fetch_page() {
  local url="$1"
  local max_chars=3000
  curl -sL --max-time 15 "$url" \
    | python3 -c "
import sys, re, html
text = sys.stdin.read()
# Strip HTML tags
text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL|re.IGNORECASE)
text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL|re.IGNORECASE)
text = re.sub(r'<[^>]+>', ' ', text)
text = html.unescape(text)
text = re.sub(r'\s+', ' ', text).strip()
print(text[:$max_chars])
" 2>/dev/null | head -c "$max_chars"
}

# --- Run Searches ---
SEARCH_COUNT=0
for query in "${QUERIES[@]}"; do
  SEARCH_COUNT=$((SEARCH_COUNT + 1))
  if [ $SEARCH_COUNT -gt $MAX_SEARCHES ]; then
    break
  fi

  echo "---" >> "$OUTPUT_FILE"
  echo "### Search $SEARCH_COUNT: $query" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"

  echo "  Search $SEARCH_COUNT/$MAX_SEARCHES: $query"

  # Try Brave first, fall back to DuckDuckGo
  if [ -n "${BRAVE_API_KEY:-}" ]; then
    brave_search "$query" >> "$OUTPUT_FILE" 2>/dev/null || \
      ddg_search "$query" >> "$OUTPUT_FILE" 2>/dev/null
  else
    ddg_search "$query" >> "$OUTPUT_FILE" 2>/dev/null || \
      echo "# Search unavailable" >> "$OUTPUT_FILE"
  fi

  # Small delay to be a good citizen
  sleep 0.5
done

# --- Fetch Key Pages ---
echo "" >> "$OUTPUT_FILE"
echo "## Key Page Summaries" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Extract top URLs from findings and fetch a few
URLS=$(grep -oP '(?<=URL: )\S+' "$OUTPUT_FILE" 2>/dev/null | head -n "$MAX_FETCHES" || true)
FETCH_COUNT=0

if [ -n "$URLS" ]; then
  for url in $URLS; do
    FETCH_COUNT=$((FETCH_COUNT + 1))
    if [ $FETCH_COUNT -gt $MAX_FETCHES ]; then
      break
    fi

    echo "---" >> "$OUTPUT_FILE"
    echo "### Fetched: $url" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    echo "  Fetch $FETCH_COUNT/$MAX_FETCHES: $url"

    CONTENT=$(fetch_page "$url")
    if [ -n "$CONTENT" ]; then
      echo "$CONTENT" >> "$OUTPUT_FILE"
    else
      echo "# Could not fetch or parse this page" >> "$OUTPUT_FILE"
    fi
    echo "" >> "$OUTPUT_FILE"

    sleep 0.5
  done
fi

# --- Summary ---
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## Research Summary" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "- **Searches performed:** $SEARCH_COUNT" >> "$OUTPUT_FILE"
echo "- **Pages fetched:** $FETCH_COUNT" >> "$OUTPUT_FILE"
echo "- **Date:** $TIMESTAMP" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "### Key Takeaways" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "_To be filled by the agent after reviewing findings:_" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "1. " >> "$OUTPUT_FILE"
echo "2. " >> "$OUTPUT_FILE"
echo "3. " >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "### Open Questions" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "_Questions that need human or deeper investigation:_" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "1. " >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo ""
echo "✅ Research complete → $OUTPUT_FILE"
echo "   $SEARCH_COUNT searches, $FETCH_COUNT pages fetched"