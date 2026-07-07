---
name: log-trace-correlation
category: debugging
description: "Map error logs and stack traces to source code to identify root cause and suggest fixes. Use when you have an error log with a stack trace and need to determine which file, function, and line caused the failure."
triggers:
  - Error log with a stack trace (or similar diagnostic output)
  - Need to determine which file, function, and line caused the failure
  - Want to avoid guesswork and speed up debugging
version: 1.0
last-updated: 2026-05-22
---

# Log-Trace Correlation Skill

## Steps

1. **Collect the trace**
   - Copy the full error output (including timestamps, error message, and stack trace) into a temporary file or variable.
   - **Done when:** the full error output is stored verbatim, not paraphrased.

2. **Normalize file paths**
   - Strip base directories, resolve ../ segments, and convert to repo-relative paths.
   - If the trace contains absolute paths, map them to the repo root using the current working directory.
   - **Done when:** every file mentioned in the trace has a repo-relative path, confirmed by searching for the file name.

3. **Locate each frame**
   - For each frame (file, line, function):
     - Search for the file if the path is not exact.
     - Read the surrounding lines (e.g., +/- 5 lines).
   - Record the exact snippet and any relevant variable names.
   - **Done when:** every user-code frame is mapped to a real file:line in the repo, and the surrounding context has been read for each.

4. **Inspect the surrounding code**
   - Look for:
     - Null-dereference candidates.
     - Type mismatches.
     - Recent changes (use git log -p -S "<snippet>" if needed).
   - If the frame points to a library file, check whether the call originates from your own code (look at the previous frame).
   - **Done when:** at least one candidate defect is identified per frame, or the frame is ruled out as library code with no originating call in your codebase.

5. **Formulate a hypothesis**
   - Based on the snippet and error message, write a one-sentence hypothesis of what went wrong.
   - **Done when:** a single falsifiable hypothesis is written that explains the error message and the candidate defect.

6. **Propose a fix**
   - Write the minimal change (e.g., add a null check, correct a parameter order, handle an edge case).
   - **Done when:** the fix is written as a concrete code change, not a description of what to change.

7. **Verify**
   - If there is a reproducing test or a way to trigger the error locally, run it to confirm the fix resolves the issue.
   - If no test exists, add a minimal test case that asserts the expected behavior.
   - **Done when:** the fix is confirmed (test passes) or the verification test documents the expected behavior.

## Pitfalls

- Path mismatches: Stack traces may show paths from a different machine or build container. Always verify by searching for the file name or using fuzzy matching.
- Optimized/minified code: Line numbers may be off; look at the function name and surrounding context.
- Async traces: The true cause may be earlier in the call stack; walk back multiple frames if the immediate frame looks benign.
- Third-party frames: Do not modify library code; instead adjust how you call it or wrap the call.

## Example

Error: TypeError: Cannot read property 'length' of undefined
    at processItems (/src/utils.js:42:23)
    at handleRequest (/src/routes.js:10:5)
1. Normalize paths -> src/utils.js, src/routes.js.
2. Read src/utils.js around line 42 -> see items.length where items is undefined.
3. Hypothesis: processItems called without checking that items is defined.
4. Patch: Add if (!items) return []; at start of function.
5. Verify: Run the request handler with a test that passes undefined; should now return empty array.
