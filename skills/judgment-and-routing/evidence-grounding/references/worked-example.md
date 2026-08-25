# Worked Episode

Task: fix a failing auth test in a service repo.

## Without grounding

The agent reads the test report left in `/tmp/last-run.txt` (written yesterday,
before a dependency bump), concludes the failure is a missing mock, adds the mock,
and reports "fixed, tests green." The suite still fails today for a different
reason — the bump changed token expiry handling. The false path cost an hour.

## With grounding

1. Load-bearing observation: `/tmp/last-run.txt` — classified stale (yesterday,
   written by a previous session). Re-run the single failing test:
   `pytest tests/test_auth.py -x` → different error than the report describes.
2. Early probe after reading the expiry-handling change:
   `pytest tests/test_auth.py -k expired -x` → confirms the real cause in seconds.
3. Fix applied; receipt shipped:

   ```
   pytest tests/test_auth.py -x
   ================== 12 passed, 1 skipped in 4.31s ==================
   ```

Every claim in the final report traces to output fetched this episode.
