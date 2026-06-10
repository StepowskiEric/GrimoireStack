---
name: log-trace-correlation
category: debugging
description: Correlate error logs and stack traces to source code to identify root cause and suggest fixes.
version: 1.0
...



---

# Log-Trace Correlation Skill

## Purpose
When an error occurs, quickly map the logged stack trace to the exact location in the codebase, inspect surrounding context, and propose a minimal fix.

## When to Use
- You have an error log with a stack trace (or similar diagnostic output).
- You need to determine which file, function, and line caused the failure.
- You want to avoid guesswork and speed up debugging.

## Steps

1. Collect the trace
   - Copy the full error output (including timestamps, error message, and stack trace) into a temporary file or variable.
   - Example: error_log.txt.

2. Normalize file paths
   - Strip base directories, resolve ../ segments, and convert to repo-relative paths.
   - If the trace contains absolute paths, map them to the repo root using the current working directory.

3. Locate each frame
   - For each frame (file, line, function):
     - Use search_files with target="files" to find the file if the path is not exact.
     - Use read_file with offset and limit to view the surrounding lines (e.g., +/- 5 lines).
   - Record the exact snippet and any relevant variable names.

4. Inspect the surrounding code
   - Look for:
     - Null-dereference candidates.
     - Type mismatches.
     - Recent changes (use git log -p -S "<snippet>" via terminal if needed).
   - If the frame points to a library file, check whether the call originates from your own code (look at the previous frame).

5. Formulate a hypothesis
   - Based on the snippet and error message, write a one-sentence hypothesis of what went wrong.

6. Propose a fix
   - Write the minimal change (e.g., add a null check, correct a parameter order, handle an edge case).
   - Use patch to apply the change in a safe, reversible way (first run with dry_run:true if supported, or copy the file to a backup).

7. Verify
   - If there is a reproducing test or a way to trigger the error locally, run it to confirm the fix resolves the issue.
   - If no test exists, add a minimal test case that asserts the expected behavior.

## Outputs
- A list of frames with file, line, and surrounding code.
- Hypothesis statement.
- Suggested patch (unified diff).

## Pitfalls
- Path mismatches: Stack traces may show paths from a different machine or build container. Always verify by searching for the file name or using fuzzy matching.
- Optimized/minified code: Line numbers may be off; look at the function name and surrounding context.
- Async traces: The true cause may be earlier in the call stack; walk back multiple frames if the immediate frame looks benign.
- Third-party frames: Do not modify library code; instead adjust how you call it or wrap the call.

## Verification Checklist
- [ ] All frames mapped to existing files in the repo.
- [ ] Hypothesis matches the error message.
- [ ] Patch applies cleanly and does not introduce syntax errors.
- [ ] Reproduction steps (if any) now pass.
- [ ] No new lint or type errors introduced (run relevant linters if available).

## Example
Error: TypeError: Cannot read property 'length' of undefined
    at processItems (/src/utils.js:42:23)
    at handleRequest (/src/routes.js:10:5)
1. Normalize paths -> src/utils.js, src/routes.js.
2. Read src/utils.js around line 42 -> see items.length where items is undefined.
3. Hypothesis: processItems called without checking that items is defined.
4. Patch: Add if (!items) return []; at start of function.
5. Verify: Run the request handler with a test that passes undefined; should now return empty array.

___

