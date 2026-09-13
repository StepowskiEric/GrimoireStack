#!/usr/bin/env python3
"""
Dafny Verified Code Synthesizer.

Takes a natural language spec (or existing code) and:
1. Generates or validates Dafny formal specification
2. Runs `dafny verify` to machine-check correctness
3. Transpiles to target language (Python, Go, C#, JavaScript)
4. Returns structured JSON with verification result

Usage:
    python dafny_verify.py --spec "function spec here" --language python [--output out.py]
    python dafny_verify.py --dafny "path/to/code.dfy" --language python
    python dafny_verify.py --spec "spec" --code "existing code" --language python --verify-only

Requirements:
    - `dafny` CLI in PATH (https://dafny.org/)
    - Python 3.8+ (stdlib only)

Exit codes:
    0 = verified (proved)
    1 = unproved or timed out (fix the spec or the proof)
    2 = environment/invocation error (fix the setup, not the spec)
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# ── Dafny generation helpers ──────────────────────────────────────────────────


def Dafny_from_spec(spec: str, target_lang: str = "python") -> str:
    """
    Attempt to generate Dafny from a natural language spec.
    This is a best-effort heuristic — for complex specs, use the LLM directly.

    For production use, call the LLM API to generate Dafny, then call this script
    with --verify-only to verify the LLM-generated Dafny code.
    """
    # Heuristic: if spec contains 'function' or 'method', treat as partial Dafny
    if "function" in spec or "method" in spec or "ensures" in spec:
        return spec

    # Simple pattern-based translation for basic specs
    lines = []
    lines.append("// Translated from natural language spec")
    lines.append("")

    # Try to extract function name
    fn_match = re.search(r"(?:function|method|def)\s+(\w+)", spec, re.IGNORECASE)
    fn_name = fn_match.group(1) if fn_match else "f"

    # Try to extract input types
    str_match = re.search(r"(?:string|str)", spec, re.IGNORECASE)
    seq_match = re.search(r"(?:seq|list|array)", spec, re.IGNORECASE)

    input_type = "int"
    if seq_match:
        input_type = "seq<int>"
    elif str_match:
        input_type = "string"

    # Try to extract postcondition
    post_match = re.search(
        r"(?:ensures|postcondition|returns?|=>)\s*([^,\n]+)", spec, re.IGNORECASE
    )
    postcondition = post_match.group(1).strip() if post_match else "true"

    # Generate simple function
    lines.append(f"function {fn_name}(x: {input_type}): int")
    lines.append("  requires true")
    lines.append(f"  ensures {postcondition}")
    lines.append("{")
    lines.append(f"  match {input_type}")
    lines.append("  case s: seq<int> =>")
    lines.append(f"    if |s| == 0 then 0 else s[0] + {fn_name}(s[1..])")
    lines.append("  case n: int => n >= 0 ? n : -n")
    lines.append("  case _ => 0")
    lines.append("}")

    return "\n".join(lines)


# ── Verification ──────────────────────────────────────────────────────────────


def run_dafny_verify(dafny_code: str, timeout: int = 60) -> tuple[str, int]:
    """
    Run `dafny verify` on the given Dafny code.
    Returns (output, exit_code).
    """
    dafny_path = shutil.which("dafny")
    if not dafny_path:
        return "ERROR: dafny not found in PATH. Install from https://dafny.org/", 2

    with tempfile.NamedTemporaryFile(suffix=".dfy", mode="w", delete=False) as f:
        f.write(dafny_code)
        temp_path = f.name

    try:
        result = subprocess.run(
            [dafny_path, "verify", temp_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        output = result.stdout + result.stderr
        return output, result.returncode
    except subprocess.TimeoutExpired:
        return f"ERROR: Dafny verify timed out after {timeout}s", 1
    except FileNotFoundError:
        return f"ERROR: Could not invoke dafny at {dafny_path}", 2
    finally:
        Path(temp_path).unlink(missing_ok=True)


def run_dafny_transpile(
    dafny_code: str, target_lang: str, timeout: int = 30
) -> tuple[str, int]:
    """
    Transpile Dafny to target language.
    Supported targets: python, go, cs (C#), java, js
    """
    dafny_path = shutil.which("dafny")
    if not dafny_path:
        return "ERROR: dafny not found in PATH", 2

    lang_map = {
        "python": "python",
        "go": "go",
        "cs": "cs",
        "csharp": "cs",
        "java": "java",
        "js": "js",
        "javascript": "js",
    }
    dafny_lang = lang_map.get(target_lang.lower(), target_lang.lower())

    with tempfile.NamedTemporaryFile(suffix=".dfy", mode="w", delete=False) as f:
        f.write(dafny_code)
        temp_path = f.name

    try:
        result = subprocess.run(
            [dafny_path, "translate", dafny_lang, temp_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        output = result.stdout + result.stderr
        return output, result.returncode
    except subprocess.TimeoutExpired:
        return f"ERROR: Transpilation timed out after {timeout}s", 1
    except FileNotFoundError:
        return f"ERROR: Could not invoke dafny at {dafny_path}", 2
    finally:
        Path(temp_path).unlink(missing_ok=True)


# ── Output parsing ────────────────────────────────────────────────────────────


def _extract_spec_claims(dafny_code: str) -> list[str]:
    """Extract ensures/requires claims from the Dafny source itself.

    The verifier log rarely echoes these, so the source — not the log —
    is the authority on what was supposedly proved.
    """
    claims = re.findall(r"(?:ensures|requires)\s+([^{\n;]+)", dafny_code)
    return [c.strip() for c in claims if c.strip()]


def parse_verification_output(
    output: str, exit_code: int, dafny_code: str = ""
) -> dict:
    """
    Parse `dafny verify` output into structured result.
    """
    proved_ok = False
    verification_errors: list[dict] = []
    warnings: list[str] = []

    # Parse lines for verified/warning/error patterns
    for line in output.splitlines():
        line = line.strip()

        # Verified run: "... N verified, 0 errors" in any phrasing.
        # Group 1 is the error count in the first shape, group 2 in the second.
        vm_old = re.match(
            r"(?:Proof|BVR|Dafny program) .*?verified with (?:\d+) verified?, (\d+) error",
            line,
        )
        vm_new = re.match(r".*?(\d+)\s+verified,\s*(\d+)\s+errors?", line)
        if (vm_old and vm_old.group(1) == "0") or (vm_new and vm_new.group(2) == "0"):
            proved_ok = True

        # Error line
        if "error" in line.lower() and ("DAFNY" in line or "Error:" in line):
            # Try to extract location and message
            loc_match = re.search(r"([^\s]+\.dfy[^\s]*|line \d+)", line)
            err_match = re.search(r"Error[:\s]+([^\n]+)", line, re.IGNORECASE)
            verification_errors.append(
                {
                    "raw": line,
                    "location": loc_match.group(1) if loc_match else "unknown",
                    "message": err_match.group(1).strip() if err_match else line,
                }
            )

        # Warning
        if "warning" in line.lower() and "DAFNY" in line:
            warnings.append(line)

    # Determine status. Environment errors are ONLY the script's own
    # dafny-missing messages — never log content. (A postcondition that
    # mentions "not found" is an unproved spec, not a broken setup.)
    lowered = output.lower()
    if "dafny not found in path" in lowered or "could not invoke dafny" in lowered:
        status = "error"
    elif "timed out" in lowered:
        status = "timeout"
    elif not verification_errors and exit_code == 0 and proved_ok:
        status = "proved"
    else:
        status = "unproved"

    spec_claims = _extract_spec_claims(dafny_code)

    return {
        "status": status,
        "verification_log": output.strip(),
        "proved_theorems": spec_claims if status == "proved" else [],
        "verification_errors": verification_errors,
        "warnings": warnings,
        "exit_code": exit_code,
    }


def parse_transpile_output(output: str, exit_code: int, target_lang: str) -> dict:
    """Parse transpilation output."""
    if exit_code != 0:
        return {
            "status": "transpile_failed",
            "transpiled_code": None,
            "transpile_log": output,
            "exit_code": exit_code,
        }

    return {
        "status": "transpiled",
        "transpiled_code": output.strip(),
        "transpile_log": "",
        "exit_code": 0,
    }


# ── Main ──────────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="Dafny verified code synthesizer and verifier"
    )
    parser.add_argument(
        "--spec",
        type=str,
        help="Natural language spec or partial Dafny code to generate from",
    )
    parser.add_argument(
        "--code",
        type=str,
        help="Existing code to verify (alternative to --spec for verify-only mode)",
    )
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Skip generation, just verify the provided spec/code",
    )
    parser.add_argument(
        "--language",
        choices=["python", "go", "cs", "csharp", "java", "js", "javascript"],
        default="python",
        help="Target language for transpilation",
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Output file path for transpiled code",
    )
    parser.add_argument(
        "--dafny",
        type=str,
        help="Path to Dafny file to verify (skip generation entirely)",
    )
    parser.add_argument(
        "--save-dafny",
        type=str,
        help="Write the verified Dafny source here (Step 5: commit it beside the code)",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=60,
        help="Timeout for verification in seconds (default: 60)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
    )
    args = parser.parse_args()

    # ── Step 1: Load Dafny code ───────────────────────────────────────────
    if args.dafny:
        try:
            dafny_code = Path(args.dafny).read_text()
        except OSError as exc:
            print(
                json.dumps(
                    {
                        "status": "error",
                        "verification_log": f"Cannot read Dafny file {args.dafny}: {exc}",
                        "proved_theorems": [],
                        "verification_errors": [],
                        "warnings": [],
                        "exit_code": 2,
                    },
                    indent=2,
                )
            )
            sys.exit(2)
    elif args.code:
        # Assume provided code IS Dafny (verify-only mode)
        dafny_code = args.code
    elif args.spec:
        if args.verify_only:
            dafny_code = args.spec
        else:
            # Generate Dafny from spec
            dafny_code = Dafny_from_spec(args.spec)
            if args.verbose:
                sys.stderr.write("Generated Dafny:\n")
                sys.stderr.write(dafny_code + "\n")
    else:
        sys.stderr.write("Error: provide --spec or --dafny or --code\n")
        sys.exit(2)

    # ── Step 2: Verify ──────────────────────────────────────────────────────
    if args.verbose:
        sys.stderr.write("Verifying with dafny...\n")

    verify_out, verify_rc = run_dafny_verify(dafny_code, timeout=args.timeout)
    verify_result = parse_verification_output(verify_out, verify_rc, dafny_code)

    if args.verbose:
        sys.stderr.write(f"Verification output:\n{verify_out}\n")

    # ── Step 3: Transpile (only if verified and output requested) ──────────
    transpiled_code = None
    if verify_result["status"] == "proved" and args.output:
        transpile_out, transpile_rc = run_dafny_transpile(dafny_code, args.language)
        transpile_result = parse_transpile_output(
            transpile_out, transpile_rc, args.language
        )

        if transpile_result["status"] == "transpiled":
            transpiled_code = transpile_result["transpiled_code"]
            Path(args.output).write_text(transpiled_code)
            if args.verbose:
                sys.stderr.write(f"Written transpiled code to {args.output}\n")
        elif args.verbose:
            sys.stderr.write(f"Transpilation failed: {transpile_out}\n")

    # ── Step 4: Persist the spec + build result ────────────────────────────
    if args.save_dafny:
        try:
            Path(args.save_dafny).write_text(dafny_code)
        except OSError as exc:
            print(
                f"  ! Cannot write Dafny file {args.save_dafny}: {exc}",
                file=sys.stderr,
            )
            sys.exit(2)

    result = {
        **verify_result,
        "dafny_code": dafny_code,
        "target_language": args.language,
    }
    if transpiled_code:
        result["transpiled_code"] = transpiled_code
    if args.output:
        result["output_file"] = args.output
    if args.save_dafny:
        result["dafny_file"] = args.save_dafny

    print(json.dumps(result, indent=2))

    # ── Exit code ──────────────────────────────────────────────────────────
    if verify_result["status"] == "proved":
        sys.exit(0)
    elif verify_result["status"] == "error":
        sys.exit(2)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
