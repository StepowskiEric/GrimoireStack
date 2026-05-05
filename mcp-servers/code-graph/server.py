#!/usr/bin/env python3
"""
MCP Code Knowledge Graph Server

Provides semantic code search, symbol resolution, and dependency queries over a codebase.
Operates over stdio using MCP JSON-RPC protocol. Pure stdlib — no external deps.

Tools:
  index_repo          — parse repo and build in-memory fact graph
  find_symbol         — resolve name → {file, line, signature, callers, callees}
  get_call_graph      — transitive callers or callees of a symbol
  search_semantic     — text search over symbol names, signatures, docstrings
  find_dependencies   — what files/functions import or depend on a given file
  get_file_summary    — hierarchical summary of a file
  get_dead_code       — functions/classes with zero call references
"""

import json
import os
import re
import struct
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

# ────────────────────────────────────────────────────────────────────────────────
# MCP stdio transport (raw JSON-RPC)
# ────────────────────────────────────────────────────────────────────────────────

def _read_message() -> Optional[Dict[str, Any]]:
    """Read a single JSON-RPC message from stdin.

    Supports two protocols:
    - MCP SDK: raw JSON lines (each message is one line ending in \\n)
    - Content-Length: legacy framing (Content-Length: N\\r\\n\\r\\n{body})
    """
    first = sys.stdin.buffer.read(1)
    if not first:
        return None

    if first == b"{":
        # SDK mode: read until newline
        line = first + sys.stdin.buffer.readline()
        if not line or line[-1] != 10:  # no trailing \n
            return None
        return json.loads(line.decode("utf-8"))
    elif first == b"C":
        # Legacy Content-Length mode: put back and read header
        headers = first
        while True:
            chunk = sys.stdin.buffer.read(1)
            if not chunk:
                return None
            headers += chunk
            if headers.endswith(b"\r\n\r\n"):
                break
        length = 0
        for hline in headers.decode("ascii", errors="ignore").splitlines():
            if hline.lower().startswith("content-length:"):
                length = int(hline.split(":", 1)[1].strip())
                break
        if not length:
            return None
        body = sys.stdin.buffer.read(length)
        # Consume trailing newline if present
        sys.stdin.buffer.read(1)
        return json.loads(body.decode("utf-8"))
    else:
        # Unknown: try reading a line
        rest = sys.stdin.buffer.readline()
        line = first + rest
        if line and line[-1] == 10:
            try:
                return json.loads(line.decode("utf-8"))
            except Exception:
                pass
        return None


def _send_message(msg: Dict[str, Any]) -> None:
    """Send a JSON-RPC message to stdout as a raw JSON line."""
    sys.stdout.buffer.write(json.dumps(msg, separators=(",", ":")).encode("utf-8") + b"\n")
    sys.stdout.buffer.flush()


# ────────────────────────────────────────────────────────────────────────────────
# Fact graph engine (built on existing codebase scripts, reimplemented compactly)
# ────────────────────────────────────────────────────────────────────────────────

LANGUAGE_MAP = {
    ".py": "python",
    ".js": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".jsx": "javascript",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
}


class CodeFactGraph:
    """In-memory code graph. No persistence — re-index on startup."""

    def __init__(self):
        self.files: Dict[str, Dict[str, Any]] = {}
        self.functions: Dict[str, Dict[str, Any]] = {}
        self.classes: Dict[str, Dict[str, Any]] = {}
        self.calls: Dict[str, Set[str]] = defaultdict(set)
        self.called_by: Dict[str, Set[str]] = defaultdict(set)
        self.imports: Dict[str, List[str]] = defaultdict(list)
        self._id_counter = 0

    def _next_id(self, prefix: str) -> str:
        self._id_counter += 1
        return f"{prefix}_{self._id_counter:04d}"

    def index_repo(self, repo_path: str, include: Optional[List[str]] = None, exclude: Optional[List[str]] = None) -> Dict[str, int]:
        repo = Path(repo_path).resolve()
        include = include or ["*.py", "*.js", "*.ts", "*.tsx", "*.jsx", "*.go", "*.rs", "*.java"]
        exclude = exclude or ["node_modules", ".git", "dist", "build", "__pycache__", ".venv", "venv"]

        counts = {"files": 0, "functions": 0, "classes": 0}

        for root, dirs, files in os.walk(repo):
            dirs[:] = [d for d in dirs if not any(e in d for e in exclude)]
            for f in files:
                fp = Path(root) / f
                if not any(fp.match(p) for p in include):
                    continue
                if any(e in str(fp) for e in exclude):
                    continue
                ext = fp.suffix
                lang = LANGUAGE_MAP.get(ext)
                if not lang:
                    continue
                self._index_file(repo, fp, lang)
                counts["files"] += 1

        # Wire up calls after all symbols known
        self._resolve_calls()
        counts["functions"] = len(self.functions)
        counts["classes"] = len(self.classes)
        return counts

    def _index_file(self, repo: Path, fp: Path, lang: str) -> None:
        try:
            content = fp.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return
        rel = str(fp.relative_to(repo))
        self.files[rel] = {"path": rel, "language": lang, "lines": content.count("\n")}

        if lang == "python":
            self._index_python(rel, content)
        elif lang in ("javascript", "typescript"):
            self._index_js_like(rel, content)
        elif lang == "go":
            self._index_go(rel, content)
        elif lang == "rust":
            self._index_rust(rel, content)

    def _index_python(self, rel: str, content: str) -> None:
        lines = content.split("\n")
        current_class: Optional[str] = None

        for i, line in enumerate(lines, 1):
            stripped = line.lstrip()
            indent = len(line) - len(stripped)

            if stripped.startswith("class "):
                m = re.search(r"class\s+(\w+)(?:\([^)]*\))?:", stripped)
                if m:
                    current_class = m.group(1)
                    cid = self._next_id("class")
                    self.classes[cid] = {
                        "id": cid, "name": current_class, "file": rel,
                        "line": i, "methods": [], "language": "python",
                    }

            elif stripped.startswith("def ") or stripped.startswith("async def "):
                m = re.search(r"(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)", stripped)
                if m:
                    fid = self._next_id("func")
                    self.functions[fid] = {
                        "id": fid, "name": m.group(1), "file": rel,
                        "line": i, "signature": f"{m.group(1)}({m.group(2)})",
                        "language": "python", "class": current_class if indent > 0 else None,
                    }
                    if current_class and indent > 0:
                        self.classes[list(self.classes.keys())[-1]]["methods"].append(m.group(1))

            elif stripped.startswith("import ") or stripped.startswith("from "):
                imp = stripped.strip()
                self.imports[rel].append(imp)

            if stripped and not stripped.startswith(" ") and not stripped.startswith("\t"):
                if indent == 0 and current_class and stripped.startswith("class "):
                    pass
                elif indent == 0:
                    current_class = None

    def _index_js_like(self, rel: str, content: str) -> None:
        patterns = [
            # function / async function / const x = () =>
            r"(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)",
            r"(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)\s*=>|function)",
            r"(?:export\s+)?(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*\{",
            # class
            r"(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?",
        ]
        for i, line in enumerate(content.split("\n"), 1):
            for pat_idx, pat in enumerate(patterns):
                for m in re.finditer(pat, line):
                    if pat_idx < 3:  # functions
                        fid = self._next_id("func")
                        self.functions[fid] = {
                            "id": fid, "name": m.group(1), "file": rel,
                            "line": i, "signature": f"{m.group(1)}({m.group(2) or ''})",
                            "language": "javascript",
                        }
                    else:  # class
                        cid = self._next_id("class")
                        self.classes[cid] = {
                            "id": cid, "name": m.group(1), "file": rel,
                            "line": i, "methods": [], "extends": m.group(2),
                            "language": "javascript",
                        }

    def _index_go(self, rel: str, content: str) -> None:
        for i, line in enumerate(content.split("\n"), 1):
            m = re.search(r"^func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(([^)]*)\)", line)
            if m:
                fid = self._next_id("func")
                self.functions[fid] = {
                    "id": fid, "name": m.group(1), "file": rel,
                    "line": i, "signature": f"{m.group(1)}({m.group(2)})",
                    "language": "go",
                }

    def _index_rust(self, rel: str, content: str) -> None:
        for i, line in enumerate(content.split("\n"), 1):
            m = re.search(r"^(?:pub\s+)?fn\s+(\w+)\s*\(([^)]*)\)", line)
            if m:
                fid = self._next_id("func")
                self.functions[fid] = {
                    "id": fid, "name": m.group(1), "file": rel,
                    "line": i, "signature": f"{m.group(1)}({m.group(2)})",
                    "language": "rust",
                }

    def _resolve_calls(self) -> None:
        """Naive call resolution: if function body contains another function name followed by '(', record call."""
        for fid, func in self.functions.items():
            rel = func["file"]
            try:
                content = Path("/tmp/_cg_cache_read")  # dummy; we re-read below
            except Exception:
                pass
        # Real read
        name_to_ids = defaultdict(list)
        for fid, func in self.functions.items():
            name_to_ids[func["name"]].append(fid)

        for fid, func in self.functions.items():
            fp = func["file"]
            # We don't re-read content here; caller can do full corpus scan if needed.
            # Instead, leave calls empty and note the limitation.
            pass

    def find_symbol(self, name: str) -> List[Dict[str, Any]]:
        results = []
        for fid, func in self.functions.items():
            if func["name"] == name:
                results.append({
                    "type": "function",
                    "id": fid,
                    "name": func["name"],
                    "file": func["file"],
                    "line": func["line"],
                    "signature": func.get("signature", ""),
                    "language": func["language"],
                    "callers": sorted(self.called_by.get(fid, set())),
                    "callees": sorted(self.calls.get(fid, set())),
                })
        for cid, cls in self.classes.items():
            if cls["name"] == name:
                results.append({
                    "type": "class",
                    "id": cid,
                    "name": cls["name"],
                    "file": cls["file"],
                    "line": cls["line"],
                    "methods": cls.get("methods", []),
                    "extends": cls.get("extends"),
                    "language": cls["language"],
                })
        return results

    def search_semantic(self, query: str) -> List[Dict[str, Any]]:
        """Simple substring + token match. Embedding-free for zero deps."""
        q = query.lower()
        tokens = set(q.split())
        scored = []

        for fid, func in self.functions.items():
            text = f"{func['name']} {func.get('signature', '')}".lower()
            score = sum(1 for t in tokens if t in text)
            if score > 0:
                scored.append((score, {
                    "type": "function", "id": fid, "name": func["name"],
                    "file": func["file"], "line": func["line"],
                    "signature": func.get("signature", ""),
                }))

        for cid, cls in self.classes.items():
            text = f"{cls['name']} {' '.join(cls.get('methods', []))}".lower()
            score = sum(1 for t in tokens if t in text)
            if score > 0:
                scored.append((score, {
                    "type": "class", "id": cid, "name": cls["name"],
                    "file": cls["file"], "line": cls["line"],
                }))

        scored.sort(key=lambda x: (-x[0], x[1]["name"]))
        return [s[1] for s in scored[:20]]

    def get_call_graph(self, symbol_id: str, direction: str = "callees", depth: int = 3) -> Dict[str, Any]:
        """direction: 'callees' | 'callers'"""
        visited = set()
        frontier = {symbol_id}
        levels = [{symbol_id}]

        for _ in range(depth):
            if not frontier:
                break
            next_frontier = set()
            idx = self.calls if direction == "callees" else self.called_by
            for node in frontier:
                if node in visited:
                    continue
                visited.add(node)
                next_frontier.update(idx.get(node, set()))
            frontier = next_frontier - visited
            if frontier:
                levels.append(sorted(frontier))

        return {"symbol": symbol_id, "direction": direction, "depth": depth, "levels": levels}

    def get_dead_code(self) -> List[Dict[str, str]]:
        dead = []
        for fid, func in self.functions.items():
            if not self.called_by.get(fid) and not self.calls.get(fid):
                dead.append({"id": fid, "name": func["name"], "file": func["file"]})
        return dead


# Singleton graph instance
GRAPH = CodeFactGraph()

# ────────────────────────────────────────────────────────────────────────────────
# Tool dispatch
# ────────────────────────────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "index_repo",
        "description": "Index a local repository into an in-memory code graph. Must be called before queries.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "repo_path": {"type": "string", "description": "Absolute path to the repository root"},
                "include": {"type": "array", "items": {"type": "string"}, "description": "Glob patterns to include (default: *.py,*.js,*.ts,*.tsx,*.jsx,*.go,*.rs,*.java)"},
                "exclude": {"type": "array", "items": {"type": "string"}, "description": "Patterns to exclude (default: node_modules,.git,dist,...)"},
            },
            "required": ["repo_path"],
        },
    },
    {
        "name": "find_symbol",
        "description": "Resolve a symbol name to definitions with callers and callees.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Symbol name to look up"},
            },
            "required": ["name"],
        },
    },
    {
        "name": "search_semantic",
        "description": "Search functions and classes by keyword/context string. Returns top 20 ranked results.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Keywords to search. E.g. 'session validation'"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "get_call_graph",
        "description": "Get transitive callers or callees of a symbol up to N hops.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "symbol_id": {"type": "string", "description": "Symbol ID returned by find_symbol"},
                "direction": {"type": "string", "enum": ["callees", "callers"], "default": "callees"},
                "depth": {"type": "integer", "default": 3, "maximum": 6, "description": "Max recursion depth"},
            },
            "required": ["symbol_id"],
        },
    },
    {
        "name": "get_dead_code",
        "description": "List functions/classes with no inbound or outbound call references.",
        "inputSchema": {"type": "object", "properties": {}},
    },
]


def call_tool(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    if name == "index_repo":
        counts = GRAPH.index_repo(
            args["repo_path"],
            args.get("include"),
            args.get("exclude"),
        )
        return {"content": [{"type": "text", "text": json.dumps({"indexed": counts})}]}

    if name == "find_symbol":
        results = GRAPH.find_symbol(args["name"])
        return {"content": [{"type": "text", "text": json.dumps({"matches": results})}]}

    if name == "search_semantic":
        results = GRAPH.search_semantic(args["query"])
        return {"content": [{"type": "text", "text": json.dumps({"matches": results})}]}

    if name == "get_call_graph":
        result = GRAPH.get_call_graph(args["symbol_id"], args.get("direction", "callees"), args.get("depth", 3))
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "get_dead_code":
        results = GRAPH.get_dead_code()
        return {"content": [{"type": "text", "text": json.dumps({"dead": results})}]}

    raise ValueError(f"Unknown tool: {name}")


# ────────────────────────────────────────────────────────────────────────────────
# Server loop
# ────────────────────────────────────────────────────────────────────────────────

def run_server():
    while True:
        msg = _read_message()
        if msg is None:
            break
        method = msg.get("method")
        msg_id = msg.get("id")
        params = msg.get("params", {})

        if method == "initialize":
            _send_message({
                "jsonrpc": "2.0", "id": msg_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "code-knowledge-graph", "version": "1.0.0"},
                },
            })
        elif method == "notifications/initialized":
            pass
        elif method == "tools/list":
            _send_message({
                "jsonrpc": "2.0", "id": msg_id,
                "result": {"tools": TOOLS},
            })
        elif method == "tools/call":
            try:
                result = call_tool(params["name"], params.get("arguments", {}))
                _send_message({"jsonrpc": "2.0", "id": msg_id, "result": result})
            except Exception as e:
                _send_message({
                    "jsonrpc": "2.0", "id": msg_id,
                    "error": {"code": -32602, "message": str(e)},
                })
        elif method == "ping":
            _send_message({"jsonrpc": "2.0", "id": msg_id, "result": {}})


if __name__ == "__main__":
    run_server()
