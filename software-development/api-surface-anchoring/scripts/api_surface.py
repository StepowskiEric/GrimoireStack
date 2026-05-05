#!/usr/bin/env python3
"""api-surface-anchoring companion script — verify API surfaces from authoritative docs."""

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone


API_SURFACE_FILE = "api-surface.jsonl"

# Heuristic: patterns for import statements that reveal external packages
IMPORT_PATTERNS = [
    re.compile(r"^\s*import\s+(\w+)"),
    re.compile(r"^\s*from\s+(\w+(?:\.\w+)*)\s+import"),
]


# ── helpers ──────────────────────────────────────────────────────────────


def _stdout(msg: str = "") -> None:
    print(msg)


def _stderr(msg: str) -> None:
    print(msg, file=sys.stderr)


def load_surfaces(path: str | None = None) -> list[dict]:
    """Load all anchored surfaces from api-surface.jsonl."""
    p = path or API_SURFACE_FILE
    if not os.path.exists(p):
        return []
    records = []
    with open(p, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def save_surfaces(records: list[dict], path: str | None = None) -> None:
    """Write records to api-surface.jsonl."""
    p = path or API_SURFACE_FILE
    with open(p, "w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, sort_keys=True) + "\n")


def _fetch(url: str, timeout: int = 15) -> str | None:
    """Fetch a URL and return text content, or None on failure."""
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "api-surface-anchoring/1.0 (research assistant)"
            },
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            content = resp.read()
            # Try UTF-8, fall back to latin-1
            try:
                return content.decode("utf-8")
            except UnicodeDecodeError:
                return content.decode("latin-1")
    except (urllib.error.URLError, OSError, ValueError) as exc:
        _stderr(f"  ! fetch failed: {exc}")
        return None


def _html_to_text(html: str) -> str:
    """Crude HTML-to-text conversion — good enough for signature extraction."""
    # Remove tags
    text = re.sub(r"<[^>]+>", " ", html)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text)
    # Decode common entities
    text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&quot;", '"').replace("&#39;", "'")
    return text.strip()


# ── subcommands ──────────────────────────────────────────────────────────


def cmd_init(args: argparse.Namespace) -> None:
    """Create an empty api-surface.jsonl in the current directory."""
    p = args.path or API_SURFACE_FILE
    if os.path.exists(p):
        _stderr(f"  ! {p} already exists ({len(load_surfaces(p))} records)")
        return
    save_surfaces([], p)
    _stdout(f"  ✓ Created {p}")


def cmd_verify(args: argparse.Namespace) -> None:
    """Verify a package symbol from authoritative docs."""
    package = args.package
    symbol = args.symbol
    version = args.version

    sources = [
        ("PyPI", f"https://pypi.org/project/{package}/"),
        ("GitHub", f"https://raw.githubusercontent.com/{package.replace('-', '/')}/main/README.md"),
    ]

    _stdout(f"  Searching for {package}" + (f" {version}" if version else "") + (f"::{symbol}" if symbol else "") + " ...")

    found_html = ""
    source_url = ""

    for source_name, url in sources:
        html = _fetch(url)
        if html:
            found_html = html
            source_url = url
            _stdout(f"    ✓ Found at {source_name}: {url}")
            break

    if not found_html:
        _stderr("  ! Could not find authoritative docs. Try --symbol with exact name.")
        _stderr("  ! Suggested: web_search for the official documentation.")
        return

    # Try to extract signature for the symbol
    extracted = ""
    if symbol:
        # Look for code blocks containing the symbol
        text = found_html
        # Try <code> blocks
        code_blocks = re.findall(r"<code>(.*?)</code>", text, re.DOTALL)
        for block in code_blocks:
            if symbol in block:
                extracted = _html_to_text(block)
                break
        # Try markdown code blocks
        if not extracted:
            md_blocks = re.findall(r"```(?:python)?\s*(.*?)```", text, re.DOTALL)
            for block in md_blocks:
                if symbol in block:
                    extracted = block.strip()
                    break
        # Try def/class lines
        if not extracted:
            lines = text.split("\n")
            for i, line in enumerate(lines):
                if symbol in line and ("def " in line or "class " in line or "(" in line):
                    extracted = line.strip()
                    # Grab next few lines if they look like params
                    for j in range(i + 1, min(i + 5, len(lines))):
                        if ")" in lines[j] or lines[j].strip().startswith("->"):
                            extracted += " " + lines[j].strip()
                            break
                        extracted += " " + lines[j].strip()
                    break

    if extracted:
        _stdout(f"\n    ── {package}::{symbol} ──")
        _stdout(f"    {extracted[:500]}")
    else:
        _stdout(f"\n    No exact signature found for '{symbol}'.")
        _stdout(f"    Docs page extracted. Try manually from: {source_url}")

    # Prompt to save
    _stdout("")
    _stdout(f"    Save to {API_SURFACE_FILE}? Run with --save and provide --signature.")


def cmd_verify_api(args: argparse.Namespace) -> None:
    """Verify a REST API endpoint."""
    url = args.url
    method = args.method or "GET"

    _stdout(f"  Fetching {method} {url} ...")

    req = urllib.request.Request(url, method=method)
    for header in args.headers or []:
        if ":" in header:
            key, val = header.split(":", 1)
            req.add_header(key.strip(), val.strip())

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content_type = resp.headers.get("Content-Type", "")
            status = resp.status
            body = resp.read().decode("utf-8", errors="replace")[:2000]

            _stdout(f"    Status: {status}")
            _stdout(f"    Content-Type: {content_type}")
            _stdout(f"    Response (first 2000 chars):")
            _stdout(f"    {body[:500]}")
    except urllib.error.HTTPError as exc:
        _stderr(f"  ! HTTP {exc.code}: {exc.reason}")
        _stderr(f"    Body: {exc.read().decode('utf-8', errors='replace')[:500]}")
    except Exception as exc:
        _stderr(f"  ! Request failed: {exc}")


def cmd_fetch_docs(args: argparse.Namespace) -> None:
    """Fetch and extract signature information from a docs page."""
    url = args.url
    _stdout(f"  Fetching {url} ...")

    html = _fetch(url)
    if not html:
        _stderr("  ! Failed to fetch URL")
        return

    text = _html_to_text(html)

    # Extract anything that looks like a function/class signature
    _stdout("\n  ── Extracted signatures ──")

    # Look for patterns like "def name(", "class name(", or "name(params)"
    sigs = re.findall(r"(?:def\s+|class\s+)?(\w+)\s*\(([^)]*)\)\s*(?:->\s*(\w+))?", text)
    for name, params, ret in sigs[:20]:
        param_str = params.strip()
        ret_str = f" -> {ret}" if ret else ""
        _stdout(f"    {name}({param_str}){ret_str}")

    if not sigs:
        _stderr("  (no function/class signatures found in extracted text)")
        _stderr(f"  Page title/extract: {text[:300]}")


def cmd_status(args: argparse.Namespace) -> None:
    """Show all verified surfaces for the current session."""
    records = load_surfaces()
    if not records:
        _stdout(f"  No surfaces in {API_SURFACE_FILE}.")
        _stdout("  Run 'api_surface.py init' to create one, then 'verify' to add entries.")
        return

    high = [r for r in records if r.get("yield") == "high"]
    medium = [r for r in records if r.get("yield") == "medium"]
    low = [r for r in records if r.get("yield") == "low"]

    _stdout(f"  API Surface Anchoring Status")
    _stdout(f"  ─────────────────────────────")
    _stdout(f"  Total surfaces: {len(records)}")
    _stdout(f"    High (used in code): {len(high)}")
    _stdout(f"    Medium (looked up): {len(medium)}")
    _stdout(f"    Low (exploratory):  {len(low)}")

    _stdout("")
    for rec in records:
        sym = rec.get("symbol", "?")
        imp = rec.get("import", "")
        ver = rec.get("version", "")
        y = rec.get("yield", "?")
        src = rec.get("source", "")
        _stdout(f"  [{y}] {sym}" + (f" ({ver})" if ver else ""))
        if imp:
            _stdout(f"        import: {imp}")
        if src:
            _stdout(f"        source: {src}")

    if args.gap_analysis:
        _stdout("")
        _stdout("  Gap Analysis: Check for unverified surfaces in code")
        _stdout("  (Run: python api_surface.py check <file>)")


def cmd_check(args: argparse.Namespace) -> None:
    """Scan a source file for unverified external calls."""
    filepath = args.file
    if not os.path.exists(filepath):
        _stderr(f"  ! File not found: {filepath}")
        return

    surfaces = load_surfaces()
    verified_symbols = {s.get("symbol", "") for s in surfaces}
    verified_imports = {s.get("import", "") for s in surfaces}

    _stdout(f"  Scanning {filepath} ...")

    with open(filepath, encoding="utf-8") as f:
        content = f.read()

    lines = content.split("\n")

    # Find imports
    imports_found = []
    for i, line in enumerate(lines, 1):
        for pat in IMPORT_PATTERNS:
            m = pat.match(line)
            if m:
                imports_found.append((i, m.group(1), line.strip()))

    if not imports_found:
        _stdout("    No external imports found in file.")
        return

    unverified = []
    for lineno, module, imp_line in imports_found:
        # Check if any part of this module is in verified surfaces
        is_verified = any(
            module in vs or vs in module
            for vs in verified_symbols | verified_imports
        )
        status = "✓ verified" if is_verified else "! UNVERIFIED"
        if not is_verified:
            unverified.append((lineno, module, imp_line))
        _stdout(f"    [{status}] line {lineno}: {imp_line}")

    if unverified:
        _stdout("")
        _stderr(f"  ⚠ {len(unverified)} unverified import(s) found.")
        _stderr("  Run: python api_surface.py verify <package> [symbol]")
    else:
        _stdout(f"\n  ✓ All {len(imports_found)} imports are verified.")


# ── main ─────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(
        description="API Surface Anchoring — verify API signatures from authoritative docs."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # init
    p_init = sub.add_parser("init", help="Create an empty api-surface.jsonl")
    p_init.add_argument("--path", default=API_SURFACE_FILE, help="Path to surface file")

    # verify
    p_verify = sub.add_parser("verify", help="Verify a package symbol from authoritative docs")
    p_verify.add_argument("package", help="Package name (e.g. httpx, boto3)")
    p_verify.add_argument("symbol", nargs="?", default="", help="Symbol name (e.g. AsyncClient, upload_file)")
    p_verify.add_argument("--version", default="", help="Package version to verify against")
    p_verify.add_argument("--save", action="store_true", help="Save verified surface to file")
    p_verify.add_argument("--signature", default="", help="Signature string (required with --save)")

    # verify-api
    p_vapi = sub.add_parser("verify-api", help="Verify a REST API endpoint")
    p_vapi.add_argument("url", help="API endpoint URL")
    p_vapi.add_argument("method", nargs="?", default="GET", help="HTTP method (default: GET)")
    p_vapi.add_argument("--headers", nargs="*", default=[], help="Request headers (Key: Value)")

    # fetch-docs
    p_docs = sub.add_parser("fetch-docs", help="Fetch and extract signatures from a docs page")
    p_docs.add_argument("url", help="Docs page URL")

    # status
    p_status = sub.add_parser("status", help="Show all verified surfaces")
    p_status.add_argument("--gap-analysis", action="store_true", help="Run gap analysis")

    # check
    p_check = sub.add_parser("check", help="Scan a file for unverified external calls")
    p_check.add_argument("file", help="Source file to scan")

    args = parser.parse_args()

    commands = {
        "init": cmd_init,
        "verify": cmd_verify,
        "verify-api": cmd_verify_api,
        "fetch-docs": cmd_fetch_docs,
        "status": cmd_status,
        "check": cmd_check,
    }

    fn = commands.get(args.command)
    if fn:
        fn(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
