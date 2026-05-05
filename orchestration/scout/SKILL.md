---
name: scout
category: orchestration
description: Fast context scout — a lightweight sub-agent reads files and returns only distilled, relevant context for the main model. Saves tokens, reduces distraction, and prevents the main model from getting lost in large codebases.
version: 1.0
---

# Scout

A fast auxiliary agent that pre-reads files and distills only the context the main model actually needs.

**Core problem:** The main model wastes context and attention searching through files, or gets distracted by irrelevant code. Scout intercepts file-reading tasks, does the scouting work fast, and returns only what's relevant.

**Three Scout modes:**

| Mode | Speed | LLM Cost | Best For |
|------|-------|----------|----------|
| **Lite** | Instant | $0 | You know the filenames or patterns. Fast pre-filter. |
| **Full** | ~10-30s | ~$0.01-0.10 | You need comprehension, summarization, or cross-file synthesis. |
| **Hybrid** | Medium | ~$0.01 | Narrow down with Lite, deepen with Full. |

---

## Scout-Lite (Deterministic — No LLM)

When you know what you're looking for, use `search_files` (backed by ripgrep).

```python
# Example: Main model asks "what files handle auth?"
# Instead of reading 50 files, Scout-Lite does:

goal = "Find files related to authentication, JWT, sessions, or login"
files = ["src/", "lib/", "app/"]

# Step 1: Fast rg for auth-related patterns
patterns = ["jwt", "session", "auth", "login", "password", "token"]
for pattern in patterns:
    results = search_files(pattern=pattern, target="content", path=repo_root)
    # Collect matching files

# Step 2: Read only the most relevant files (top 5 by match count)
top_files = rank_by_match_count(results)
for f in top_files[:5]:
    content = read_file(f)
    # Return only relevant snippets
```

**Efficiency rules for Lite:**
- Use `rg --no-heading` to suppress file:line headers (cleaner output)
- Use `rg --max-count N` per file to avoid spam
- Use `rg --files-with-matches` to get just filenames, not line-by-line
- Limit scope: `search_files(path="src/", ...)` not `search_files(path=".", ...)`
- Set a file cap: stop reading after top 5-8 files

**When to use Lite:**
- You have specific filenames or function names to look up
- The codebase has consistent naming conventions
- You just need to confirm a file exists or extract a few lines
- You want zero latency and zero cost

---

## Scout-Full (LLM Scout Agent)

When you need understanding, not just matching.

```python
scout_goal = """You are a code scout. Read these files and return a concise summary
of the relevant context for the main task.

MAIN TASK: {main_task}
FILES TO READ: {file_list}

Return a JSON object:
{{
  "relevant_findings": ["specific fact 1", "specific fact 2"],
  "key_files": {{"file.py": "one-line description of what's relevant"}},
  "gaps": "what's missing or unclear"
}}

Be terse. Only include what directly answers the main task."""

# Spawn fast sub-agent
result = delegate_task(
    goal=scout_goal,
    context=f"main_task: {task}\nfiles: {files_to_scout}",
    toolsets=["terminal", "file"],
    model="claude-haiku-3-20250514"  # or gpt-4o-mini, etc.
)
```

**When to use Full:**
- The codebase is large and you don't know where relevant code lives
- You need cross-file synthesis (e.g., "how does X affect Y?")
- The files are complex and need summarization, not just extraction
- You're about to make a significant change and want full context

**Recommended fast models for Scout-Full:**
| Model | Speed | Context | Cost | Notes |
|-------|-------|---------|------|-------|
| `claude-haiku-3-20250514` | Fast | 200K | ~$0.001/K | Anthropic's fast model |
| `gpt-4o-mini` | Fast | 128K | ~$0.001/K | OpenAI's fast model |
| `deepseek-chat` | Fast | 128K | ~$0.001/K | Cheap, good for code |
| Local: `llama3.2-3b` | Instant | 128K | $0 | Via Ollama, no API needed |

---

## Scout-Hybrid (Recommended Default)

Combine speed with comprehension.

```
1. Scout-Lite: Fast rg to narrow to top 5-8 candidate files (target="files")
2. Scout-Full: Fast LLM reads those files and extracts relevant context
3. Return distilled summary to main model
```

**When to use Hybrid:**
- Default for unfamiliar codebases
- When Lite finds too many or too few matches
- When you're about to do refactoring, debugging, or feature work

---

## Workflow: When to Invoke Scout

```
Main Model Task
      │
      ▼
┌─────────────────────────────────┐
│ Does this task need file        │
│ context you don't already have? │
└─────────────────────────────────┘
      │
      ├── No ──→ Proceed without Scout
      │
      └── Yes ─→ Which best describes your need?
                 │
                 ├─ "Find the function that does X" ──→ Scout-Lite
                 ├─ "Explain how this subsystem works" ──→ Scout-Full
                 ├─ "What changes would I need to make for Y?" ──→ Scout-Hybrid
                 └─ "Debug this crash" ──→ Scout-Hybrid (narrow scope first)
```

---

## Anti-Patterns

| Don't | Do |
|-------|-----|
| Scout every file in a large repo | Scout only the relevant subsystem |
| Use Full when Lite suffices | Use Lite for known patterns |
| Ask Scout vague questions like "what does this repo do?" | Be specific: "How does the auth flow work for API requests?" |
| Return entire file contents | Return only distilled snippets |
| Let Scout take >60s | Set a timeout; if it overruns, use Lite instead |

---

## Token Savings

Scout reduces main model context waste:

| Approach | Main Model Reads | Wasted Context |
|----------|-----------------|-----------------|
| No Scout | 50 files, 100K tokens | ~80% irrelevant |
| Scout-Lite | 5 files, 10K tokens | ~20% irrelevant |
| Scout-Full | Distilled summary, 2K tokens | ~5% irrelevant |

**Rule of thumb:** If Scout returns >8 files or >3K tokens, you're scouting too broadly. Narrow the scope first with `rg --files-with-matches`.

---

## Companion Scripts

The `references/` directory contains:
- `scout-config.yaml` — configurable model selection, timeouts, and scope limits
- `model-comparison.md` — benchmark data for Scout-Full model selection
- `scouting-patterns.md` — common scouting scenarios with mode selection

---

## Verification

After Scout returns context:
- [ ] Does the distilled info directly answer the main task?
- [ ] Are only relevant files referenced?
- [ ] Did Scout return in under 60s (Full) or 5s (Lite)?
- [ ] Is the main model's context savings >50% vs. reading raw files?
