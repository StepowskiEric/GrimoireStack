#!/usr/bin/env python3
"""MCP server for Intent Specification Protocol — crystallize vague requests into testable specs via stdio JSON-RPC."""

import json
import sys
import re
from datetime import datetime, timezone


def send_response(id: int, result: dict) -> None:
    """Send JSON-RPC response to stdout."""
    response = {"jsonrpc": "2.0", "id": id, "result": result}
    sys.stdout.write(json.dumps(response) + "\n")
    sys.stdout.flush()


def send_error(id: int, code: int, message: str) -> None:
    """Send JSON-RPC error to stdout."""
    response = {
        "jsonrpc": "2.0",
        "id": id,
        "error": {"code": code, "message": message},
    }
    sys.stdout.write(json.dumps(response) + "\n")
    sys.stdout.flush()


def crystallize_intent(vague_request: str) -> dict:
    """
    Convert a vague request into a precise, testable intent specification.
    This is the core logic from intent-specification-protocol skill.
    """
    # Extract key components
    intent = {
        "original": vague_request,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": {},
    }

    # 1. What — the core action
    what_patterns = [
        r"(build|create|make|implement|design|develop)\s+(.+?)(?:\s+that|\s+with|\s+for|\s*$)",
        r"(fix|debug|repair)\s+(.+?)(?:\s+that|\s+in|\s*$)",
        r"(analyze|review|audit|test)\s+(.+?)(?:\s+for|\s+to|\s*$)",
    ]
    for pattern in what_patterns:
        match = re.search(pattern, vague_request, re.I)
        if match:
            intent["components"]["action"] = match.group(1).lower()
            intent["components"]["target"] = match.group(2).strip()
            break

    # 2. Constraints — explicit limits
    constraints = []
    constraint_patterns = [
        r"within\s+(\d+\s*(?:hours?|days?|weeks?))",
        r"using\s+(\w+)",
        r"without\s+(.+?)(?:\s+and|\s*$)",
        r"with\s+(?:no\s+)?(.+?)(?:\s+and|\s*$)",
    ]
    for pattern in constraint_patterns:
        matches = re.findall(pattern, vague_request, re.I)
        constraints.extend(matches)
    if constraints:
        intent["components"]["constraints"] = constraints

    # 3. Success criteria — how to verify
    criteria = []
    vague_words = ["fast", "good", "nice", "better", "optimized", "efficient"]
    for word in vague_words:
        if word in vague_request.lower():
            criteria.append(f"Define measurable metric for '{word}'")

    if "test" not in vague_request.lower():
        criteria.append("Add at least one test or verification step")
    if "document" not in vague_request.lower():
        criteria.append("Add documentation for key components")

    intent["components"]["success_criteria"] = criteria if criteria else ["Manual verification required"]

    # 4. Edge cases to consider
    edge_cases = []
    if "user" in vague_request.lower():
        edge_cases.append("Invalid user input")
    if "api" in vague_request.lower() or "call" in vague_request.lower():
        edge_cases.append("API failure / timeout")
    if "file" in vague_request.lower() or "read" in vague_request.lower():
        edge_cases.append("File not found / permission denied")

    intent["components"]["edge_cases"] = edge_cases if edge_cases else ["None identified"]

    return intent


def generate_spec(intent: dict) -> str:
    """Generate a human-readable spec from crystallized intent."""
    comp = intent.get("components", {})
    lines = [
        "## Crystallized Intent Specification",
        "",
        f"**Original request:** {intent['original']}",
        "",
        "### What",
        f"Action: {comp.get('action', 'N/A')}",
        f"Target: {comp.get('target', 'N/A')}",
        "",
    ]

    if "constraints" in comp:
        lines.append("### Constraints")
        for c in comp["constraints"]:
            lines.append(f"- {c}")
        lines.append("")

    lines.append("### Success Criteria")
    for c in comp.get("success_criteria", []):
        lines.append(f"- [ ] {c}")
    lines.append("")

    if comp.get("edge_cases"):
        lines.append("### Edge Cases to Handle")
        for e in comp["edge_cases"]:
            lines.append(f"- {e}")
        lines.append("")

    lines.append(f"_Crystallized at {intent['timestamp']}_")
    return "\n".join(lines)


def handle_request(method: str, params: dict, id: int) -> None:
    """Route MCP tool calls."""

    if method == "tools/list":
        tools = [
            {
                "name": "crystallize_intent",
                "description": "Transform a vague user request into a precise, testable intent specification with action, target, constraints, success criteria, and edge cases.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "vague_request": {
                            "type": "string",
                            "description": "The original vague or ambiguous user request",
                        }
                    },
                    "required": ["vague_request"],
                },
            },
            {
                "name": "generate_spec",
                "description": "Convert a crystallized intent (from crystallize_intent) into a human-readable specification document.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "intent_json": {
                            "type": "string",
                            "description": "JSON string of crystallized intent (output from crystallize_intent)",
                        }
                    },
                    "required": ["intent_json"],
                },
            },
            {
                "name": "check_vague_words",
                "description": "Scan text for vague words (fast, good, nice, better, optimized, efficient) that need measurable definitions.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "Text to scan for vague language",
                        }
                    },
                    "required": ["text"],
                },
            },
        ]
        send_response(id, {"tools": tools})

    elif method == "tools/call":
        tool_name = params.get("name")
        arguments = params.get("arguments", {})

        if tool_name == "crystallize_intent":
            vague = arguments.get("vague_request", "")
            if not vague:
                send_error(id, -32602, "Missing 'vague_request' argument")
                return
            result = crystallize_intent(vague)
            send_response(id, {
                "content": [{"type": "text", "text": json.dumps(result, indent=2)}]
            })

        elif tool_name == "generate_spec":
            intent_json = arguments.get("intent_json", "")
            try:
                intent = json.loads(intent_json)
                spec = generate_spec(intent)
                send_response(id, {
                    "content": [{"type": "text", "text": spec}]
                })
            except json.JSONDecodeError:
                send_error(id, -32602, "Invalid JSON in 'intent_json'")

        elif tool_name == "check_vague_words":
            text = arguments.get("text", "")
            vague_words = ["fast", "good", "nice", "better", "optimized", "efficient", "robust", "scalable"]
            found = [w for w in vague_words if w in text.lower()]
            result = {
                "vague_words_found": found,
                "needs_definition": len(found) > 0,
                "suggestion": "Replace with measurable criteria (e.g., 'responds in <200ms' instead of 'fast')" if found else "No vague language detected",
            }
            send_response(id, {
                "content": [{"type": "text", "text": json.dumps(result, indent=2)}]
            })

        else:
            send_error(id, -32601, f"Unknown tool: {tool_name}")

    else:
        send_error(id, -32601, f"Unknown method: {method}")


def main() -> None:
    """Run the MCP server over stdio."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
            method = request.get("method", "")
            params = request.get("params", {})
            id = request.get("id", 0)
            handle_request(method, params, id)
        except json.JSONDecodeError:
            send_error(0, -32700, "Parse error")
        except Exception as e:
            send_error(0, -32603, f"Internal error: {str(e)}")


if __name__ == "__main__":
    main()
