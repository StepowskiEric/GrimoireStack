#!/usr/bin/env bash
# openrouter-judge.sh — Send a spec review prompt to an LLM via OpenRouter
#
# Usage:
#   echo "YOUR SPEC CONTENT" | bash openrouter-judge.sh <MODEL> "<TASK_DESCRIPTION>"
#
# Environment variables:
#   OPENROUTER_API_KEY — required (get from openrouter.ai)
#   JUDGE_MODEL — optional override, defaults to first arg
#
# Example:
#   cat spec.md | bash references/openrouter-judge.sh "anthropic/claude-sonnet-4" "Implement a JWT auth system"

set -euo pipefail

MODEL="${1:-$JUDGE_MODEL}"
TASK="${2:-}"

if [ -z "$MODEL" ]; then
  echo "Usage: echo SPEC | bash openrouter-judge.sh <MODEL> \"<TASK_DESCRIPTION>\"" >&2
  echo "  Or set JUDGE_MODEL env var" >&2
  exit 1
fi

if [ -z "$OPENROUTER_API_KEY" ]; then
  echo "Error: OPENROUTER_API_KEY environment variable is not set" >&2
  echo "Get a key at https://openrouter.ai/settings/keys" >&2
  exit 1
fi

if [ -z "$TASK" ]; then
  echo "Warning: No task description provided. Review accuracy may be reduced." >&2
fi

# Read spec from stdin
SPEC=$(cat)
# Escape for JSON embedding
ESCAPED_SPEC=$(printf '%s' "$SPEC" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")
ESCAPED_TASK=$(printf '%s' "$TASK" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")

# Build the JSON payload in a python script to avoid bash escaping hell
PAYLOAD=$(python3 -c "
import json
payload = {
    'model': '$MODEL',
    'messages': [
        {
            'role': 'system',
            'content': 'You are a senior principal engineer. Review every specification you receive with extreme rigor. Find every weakness -- missing acceptance criteria, wrong assumptions, security gaps, infeasible steps, missing dependencies. Be specific. Cite section numbers.'
        },
        {
            'role': 'user',
            'content': 'You are a senior principal engineer reviewing a technical specification. Your job is to find every weakness before this spec is approved for implementation.\n\nTASK: $TASK\n\nCURRENT SPEC:\n$SPEC\n\nReview each section:\n1. Overview -- Is the goal clear? Is scope well-defined?\n2. Acceptance Criteria -- Are they testable, complete, and unambiguous?\n3. Technical Implementation Plan -- Is the plan feasible? Missing steps? Wrong assumptions?\n4. File-by-File Changes -- Are all necessary files covered? Any missed dependencies?\n5. Testing Strategy -- Does it cover integration, edge cases, regression?\n6. Security & Compliance -- Are there gaps (auth, input validation, PII, rate limiting)?\n7. Dependencies & Risks -- Are dependencies realistic? Are risks identified?\n8. Performance & Monitoring -- Are there performance targets and observability hooks?\n9. Research & References -- Are cited sources reliable and current?\n\nFor each issue found, provide:\n- Section number and name\n- Severity: CRITICAL | MAJOR | MINOR | NIT\n- Description of the specific issue\n- Suggested fix\n\nIMPORTANT -- You may request additional research:\n- If you spot a knowledge gap, say: \"NEEDS_RESEARCH: [topic]\"\n- The author will run one additional focused research pass before revising.\n\nIf no issues found, respond ONLY with: APPROVED'
        }
    ],
    'temperature': 0.2,
    'max_tokens': 4000
}
print(json.dumps(payload))
")

curl -s https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'error' in data:
        print('API Error: {}'.format(json.dumps(data['error'], indent=2)), file=sys.stderr)
        sys.exit(1)
    print(data['choices'][0]['message']['content'])
except (json.JSONDecodeError, KeyError) as e:
    print('Failed to parse response: {}'.format(e), file=sys.stderr)
    sys.exit(1)
"