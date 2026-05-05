# New Skills Overview

This document provides detailed information about the four skills recently added to Jerry's Agent Skills repository:

## 1. log-trace-correlation (debugging)

### Purpose
Correlate error logs and stack traces to source code to identify root cause and suggest fixes.

### When to Use
- You have an error log with a stack trace (or similar diagnostic output)
- You need to determine which file, function, and line caused the failure
- You want to avoid guesswork and speed up debugging

### Detailed Workflow

#### Step 1: Collect the Trace
- Copy the full error output (including timestamps, error message, and stack trace) into a temporary file or variable
- Example: `error_log.txt`

#### Step 2: Normalize File Paths
- Strip base directories, resolve `../` segments, and convert to repo-relative paths
- If the trace contains absolute paths, map them to the repo root using the current working directory

#### Step 3: Locate Each Frame
- For each frame (file, line, function):
  - Use `search_files` with `target="files"` to find the file if the path is not exact
  - Use `read_file` with `offset` and `limit` to view the surrounding lines (e.g., ±5 lines)
- Record the exact snippet and any relevant variable names

#### Step 4: Inspect the Surrounding Code
- Look for:
  - Null-dereference candidates
  - Type mismatches
  - Recent changes (use `git log -p -S "<snippet>"` via `terminal` if needed)
- If the frame points to a library file, check whether the call originates from your own code (look at the previous frame)

#### Step 5: Formulate a Hypothesis
- Based on the snippet and error message, write a one-sentence hypothesis of what went wrong

#### Step 6: Propose a Fix
- Write the minimal change (e.g., add a null check, correct a parameter order, handle an edge case)
- Use `patch` to apply the change in a safe, reversible way (first run with `dry_run:true` if supported, or copy the file to a backup)

#### Step 7: Verify
- If there is a reproducing test or a way to trigger the error locally, run it to confirm the fix resolves the issue
- If no test exists, add a minimal test case that asserts the expected behavior

### Outputs
- A list of frames with file, line, and surrounding code
- Hypothesis statement
- Suggested patch (unified diff)

### Pitfalls
- **Path mismatches**: Stack traces may show paths from a different machine or build container. Always verify by searching for the file name or using fuzzy matching.
- **Optimized/minified code**: Line numbers may be off; look at the function name and surrounding context.
- **Async traces**: The true cause may be earlier in the call stack; walk back multiple frames if the immediate frame looks benign.
- **Third‑party frames**: Do not modify library code; instead adjust how you call it or wrap the call.

### Verification Checklist
- [ ] All frames mapped to existing files in the repo
- [ ] Hypothesis matches the error message
- [ ] Patch applies cleanly and does not introduce syntax errors
- [ ] Reproduction steps (if any) now pass
- [ ] No new lint or type errors introduced (run relevant linters if available)

### Example
```
Error: TypeError: Cannot read property 'length' of undefined
    at processItems (/src/utils.js:42:23)
    at handleRequest (/src/routes.js:10:5)
```
1. Normalize paths → `src/utils.js`, `src/routes.js`
2. Read `src/utils.js` around line 42 → see `items.length` where `items` is undefined
3. Hypothesis: `processItems` called without checking that `items` is defined
4. Patch: Add `if (!items) return [];` at start of function
5. Verify: Run the request handler with a test that passes `undefined`; should now return empty array

---

## 2. local-llm-tooling (mlops)

### Purpose
Skills for running, prompting, and extracting structured output from local LLMs (e.g., Ollama, llama.cpp).

### When to Use
- You need to run an LLM locally for agent tasks, data extraction, or generation
- You want to avoid API rate limits, costs, or privacy concerns
- You are using tools like Ollama, llama.cpp, or text-generation-webui

### Detailed Workflow

#### Step 1: Choose and Start the Backend
- **Ollama**: `ollama run <model>` (handles server internally) or `ollama serve` then `ollama run`
- **llama.cpp**: Use `./main -m <model.gguf> -n 256 --repeat_last_n 64` or start the server mode
- **text-generation-webui**: `python server.py --model <path> --listen`
- Ensure the backend is listening on a known port (default Ollama: 11434, llama.cpp server: 8080)

#### Step 2: Verify the Model is Loaded
- Send a minimal probe request to confirm responsiveness
  - Ollama: `curl http://localhost:11434/api/generate -d '{"model":"<name>","prompt":"Hi","stream":false}'`
  - llama.cpp server: POST to `/completion` with similar payload
- Check for errors: model not found, OOM, or server not running

#### Step 3: Craft the Prompt
- Use clear, task-specific instructions
- For structured output, explicitly request JSON and specify the schema
  - Bad: "Extract the name and age."
  - Good: "Return a JSON object with exactly two fields: `name` (string) and `age` (integer). No extra text."
- If the model struggles with JSON, consider:
  - Using a format guard: "```json\n{...}\n```"
  - Asking for a short reasoning step first, then the JSON on a new line
- Keep prompts concise; long prompts increase latency and may exceed context window

#### Step 4: Handle Model Quirks
- **Stop tokens**: Configure the backend to stop at `\n\n` or a custom token to prevent runaway generation
- **Temperature**: Lower (0.1–0.3) for factual extraction; higher (0.7+) for creative tasks
- **Repeating prompts**: Some models echo the prompt; strip it from the response if needed
- **Tool use**: If the model was fine-tuned for tool calls (e.g., HuggingFace agents), adhere to its exact format

#### Step 5: Extract and Validate Output
- **Text parsing**: If JSON is requested, isolate the first `{` and last `}`; use a JSON parser with fallback
- **Validation**: Check that required fields exist and have correct types
- **Retry logic**: On parse failure, optionally:
  - Retry with a corrected prompt ("Your last response was not valid JSON. Please output only JSON.")
  - Fallback to a simpler schema or heuristic extraction

#### Step 6: Clean Up Resources
- When done, unload the model to free VRAM/RAM:
  - Ollama: `ollama stop <model>`
  - llama.cpp server: kill the process
  - Alternatively, keep it loaded if you'll reuse it soon to avoid reload latency

### Outputs
- Server process ID or endpoint
- Raw model response
- Parsed/structured data (if applicable)
- Latency and token usage metrics (if available from backend)

### Pitfalls
- **Context window overflow**: Long prompts + generation may exceed limits, causing truncation or errors. Measure token count.
- **Model hallucination**: Especially with weak prompts; always validate outputs against known facts or constraints
- **Server instability**: Some backends crash on invalid requests; start with a health check
- **Port conflicts**: Ensure the chosen port is free; check with `lsof -i:<port>`
- **VRAM exhaustion**: Monitor GPU memory; offload to CPU if needed (slower but works)

### Verification Checklist
- [ ] Backend server is running and reachable
- [ ] Model loads without OOM or errors
- [ ] A simple prompt returns a coherent response
- [ ] Structured output (if requested) parses to valid JSON/schema
- [ ] No stray text before/after JSON when isolation is attempted
- [ ] Resources can be cleaned up (server stops, memory freed)

### Example (Ollama)
```bash
# Start model
ollama run llama3:8b

# Probe
curl -s http://localhost:11434/api/generate \
  -d '{"model":"llama3:8b","prompt":"Say OK","stream":false}'

# Extraction task
response=$(curl -s http://localhost:11434/api/generate \
  -d '{
    "model":"llama3:8b",
    "prompt":"From this text: \"Apple Inc. was founded by Steve Jobs in 1976.\" Return JSON with fields: company (string), founder (string), year (integer). No extra text.",
    "stream":false,
    "options":{"temperature":0.1}
  }' | jq -r '.response')

# Parse and validate
}' | jq '{
  company: .company,
  founder: .founder,
  year: .year|tonumber
}'
```

---

## 3. intent-specification-protocol (protocol)

### Purpose
State machine protocol forcing crystallization of intent into executable specs before coding. Addresses the bottleneck: specification quality, not model capability.

### When to Use
- Before writing any code, to formalize what the system should do
- When intent is vague or multi-step, requiring explicit state transitions
- To ensure alignment between human intent and generated code
- As a pre-coding step in agent workflows

### Research Basis
- **Project Prometheus** (2604.17464): Intent-driven specification for code generation
- **AdaCoder** (2504.04220): Adaptive intent specification for code completion
- **Self-repair research** (2604.10508): Iterative specification refinement

### Detailed Workflow

#### Step 1: Capture Raw Intent
- Collect natural-language description of desired behavior
- Identify constraints, edge cases, and success criteria

#### Step 2: Define State Machine
- Enumerate states (e.g., INITIAL, PARSING, VALIDATING, SPECIFIED, FAILED)
- Define transitions triggered by specification events
- Each state produces an artifact (raw intent → draft spec → validated spec → executable spec)

#### Step 3: Crystallize into Executable Spec
- Convert natural-language intent into machine-parseable format (JSON/YAML with strict types)
- Include preconditions, postconditions, and invariants
- Specify input/output schemas with exact types

#### Step 4: Validate Spec
- Check completeness: all states covered, all transitions defined
- Check consistency: no contradictory constraints
- Run automated checks if spec language supports them

#### Step 5: Lock and Commit
- Once spec is validated, lock it as the contract for code generation
- Any subsequent code must satisfy this spec

### Outputs
- State machine diagram or transition table
- Executable specification (JSON/YAML with schemas)
- Validation report

### Pitfalls
- Skipping spec step when intent seems "obvious" — leads to misalignment later
- Under-specifying edge cases — code passes simple tests but fails in production
- Over-specifying with premature optimization — wastes time, limits flexibility
- Treating spec as static — should evolve with new understanding

### Verification Checklist
- [ ] All states reachable from INITIAL
- [ ] All transitions have valid triggers
- [ ] Executable spec parses without errors
- [ ] Schema types match implementation language
- [ ] Edge cases have explicit handling in spec

## 2. structured-feature-planning (execution)

### Purpose
Structured 7-phase planning workflow for implementing new features — read files, search for patterns, self-review twice, then execute. Designed for correctness-critical features where quality matters more than speed.

### When to Use
- Starting a new feature of any complexity
- Ambiguous requests that need clarification before coding
- Features touching architecture you haven't read yet
- When you catch yourself about to "just start coding" without a plan

### Governing Rule
**Never hallucinate when confused.** If you don't understand something, stop. Search for it. Get more context. Ask. A partial plan with honest questions is infinitely better than a confident plan built on guessed assumptions.

### Detailed Workflow

#### Phase 1: Explore
Read files relevant to the feature. For each file, emit a structured finding:
```jsonl
{"phase": "file_read", "path": "...", "relevant_to": "...", "key_findings": ["..."], "gaps_or_questions": ["..."]}
```

#### Phase 2: Search
3-5 targeted searches. Each MUST have a PURPOSE line before the query:
```jsonl
{"phase": "search", "purpose": "Why am I searching this?", "query": "...", "findings": "...", "useful": true|false}
```

#### Phase 3: Stuck Detection
If uncertain and search could resolve it → search. If search cannot resolve it → emit NEEDS_CLARIFICATION and STOP.

#### Phase 4: Write Plan
```jsonl
{"phase": "plan", "steps": [{"n": 1, "action": "...", "files_affected": [], "confidence": "HIGH|MEDIUM|LOW", "assumptions": [], "verification": "..."}], "out_of_scope": [], "what_i_dont_know": [], "risks": []}
```

#### Phase 5: Self-Review Pass 1
Diff plan against original request. Did scope creep? Correct if needed.

#### Phase 6: Self-Review Pass 2 (Pre-Mortem)
For each step: "if this ships and fails, why?" Map failure modes to plan gaps.

#### Phase 7: Summary + Execute
```jsonl
{"phase": "summary", "plain_english": "...", "top_risks": [], "confidence": "...", "steps_total": N}
```

### Outputs
- `feature_plan.jsonl` — structured JSONL artifact of all phases
- Plain-English summary of what the plan does and why
- Explicitly flagged unknown items and risks

### Pitfalls
- Fabricating an answer instead of emitting NEEDS_CLARIFICATION
- Skipping Phase 1-2 exploration when you "already know the codebase"
- Writing HIGH confidence when you actually have MEDIUM or LOW
- Treating the plan as locked instead of updating when new information emerges

### Verification Checklist
- [ ] All files relevant to the feature have been read
- [ ] All gaps or questions are either resolved or flagged as NEEDS_CLARIFICATION
- [ ] Each plan step has explicit confidence level (not just HIGH)
- [ ] All MEDIUM/LOW steps have documented assumptions
- [ ] Review Pass 1 confirms plan matches original request scope
- [ ] Review Pass 2 has mitigations for all non-trivial failure modes
- [ ] Summary is plain-English readable by a human

### Includes
- `scripts/structured_planner.py` — pure stdlib companion script
  - Modes: explore, plan, execute, full, resume, status, reset
  - Enforces phase ordering, validates JSONL output
  - Halts on unresolved clarifications

---

## 3. evolutionary-tool-composer (mcp-servers)

### Purpose
Run an evolutionary algorithm to discover and optimize agent tool chains, prompt strategies, and code solutions. Based on AlphaEvolve (Google DeepMind) and OpenEvolve principles — LLM-driven evolutionary search with automated fitness evaluation.

### When to Use
- You want the agent to discover tool combinations or prompt strategies that outperform human intuition
- You have a well-defined fitness function for evaluating solutions
- You want automated exploration of a solution space beyond single-pass generation

### Detailed Workflow

#### Step 1: Define the Problem and Fitness
```
evolve_init(
  task="Find the fastest SQL query to join orders to customers",
  initial_genes="SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id",
  fitness_fn="lambda genes, task: (genes.count('JOIN') + genes.count('SELECT')) * 0.2 + (1.0 if 'WHERE' in genes else 0.0)",
  population_size=20,
)
```

#### Step 2: Run Generations
```
evolve_step(mutate_rate=0.3, tournament_k=3)
→ {"generation": 1, "best_fitness": 0.8, "avg_fitness": 0.5, "improvement_vs_init": 0.2}
```
Repeat 5-15 times until fitness plateaus.

#### Step 3: Retrieve Best Solution
```
evolve_get_best()
→ {"id": "ind_0007", "genes": "SELECT orders.id, customers.name FROM orders JOIN ...", "fitness": 0.8, ...}
```

### Key Concepts
- **Population:** Set of candidate solutions, evolved each generation
- **Fitness function:** Python lambda that scores a solution (higher = better)
- **Mutation:** Insert, delete, replace, scramble, invert lines
- **Crossover:** Uniform crossover — randomly merge lines from two parents
- **Selection:** Tournament selection — pick k random, keep fittest
- **Elitism:** Top 2 individuals survive unchanged each generation

### Fitness Function Design
```python
# Simple: prefer shorter queries with JOINs
"lambda genes, task: (genes.count('JOIN')) * 0.3 - len(genes) * 0.001"

# Composite: correctness signal + quality signal
"lambda genes, task: ('SELECT' in genes) * 0.5 + ('WHERE' in genes) * 0.3 + ('JOIN' in genes) * 0.2"

# Prompt strategy
"lambda genes, task: min(1.0, len(genes.split()) / 50.0) * 0.5 + ('Step' in genes or '1.' in genes) * 0.5"
```

### Outputs
- Best individual (genes + fitness + origin)
- Full population ranked by fitness
- Generation history (best/avg fitness per generation)

### Pitfalls
- Fitness function returns -1000: the fitness subprocess errored — check the expression syntax
- All individuals get same fitness: population is not differentiating — make the fitness function more granular
- Population stuck at local optimum: increase `mutate_rate` to 0.5 and re-initialize

### Verification Checklist
- [ ] Fitness function returns a float on valid input
- [ ] Population initializes with non-identical individuals
- [ ] Best fitness improves over generations (check evolve_step output)
- [ ] Best genes are syntactically valid for the target domain

### Includes
- `server.py` — pure stdlib MCP server (zero external dependencies)
  - Tools: evolve_init, evolve_step, evolve_get_best, evolve_crossover, evolve_get_population, evolve_migrate, evolve_reset

---

## 4. active-inference-agent (mcp-servers)

### Purpose
Implement a practical Active Inference agent based on Karl Friston's Free Energy Principle. The agent maintains hierarchical beliefs about system states, computes Expected Free Energy (EFE) for each action, selects policies that minimize predicted surprise, and updates beliefs on observation.

### When to Use
- The agent needs to make decisions under uncertainty with incomplete information
- Actions have uncertain outcomes and some actions are more informative than others
- You want a principled,Bayesian theory of decision-making rather than ad-hoc heuristics
- Exploration vs. exploitation tradeoff is critical (information-gathering actions)

### The Core Math
```
Variational Free Energy:  F = KL(q(θ|o,m) || p(θ|o,m))
  — How surprised are we by observations given our model?

Expected Free Energy:    G(a) = E_q[KL(q(s|a,m) || p(s|m))] - H[p(o|s,a)]
  — Predicted cost of not knowing + expected informativeness of action

Action selection:         π* = argmin_π G(π)
  — Do the thing that will surprise you least while getting good outcomes
```

### Detailed Workflow

#### Step 1: Initialize the Belief Model
```
init_beliefs(
  state_labels=["healthy", "memory_leak", "network_issue", "down"],
  action_labels=["check_logs", "run_diag", "restart_pod", "scale_replicas"],
  outcome_labels=["ok", "warning", "error", "timeout"],
  outcome_preferences=[3.0, 0.5, -5.0, -3.0],  # reward signal
)
```
`outcome_preferences` is the only domain knowledge — it encodes what outcomes are good/bad.

#### Step 2: Ask for Next Action
```
select_policy()
→ {"chosen_action": "run_diag", "efe": -2.1, "risk": 0.8, "info_gain": 0.5, ...}
```
The agent recommends the action with minimum Expected Free Energy.

#### Step 3: Observe Result and Update
```
add_outcome(outcome="error")  # or outcome=2
→ {"generation": 1, "state_belief": {"healthy": 0.05, "memory_leak": 0.35, "network_issue": 0.10, "down": 0.50}, ...}
```
Beliefs update based on the observation. "down" and "memory_leak" become more likely after seeing "error".

#### Step 4: Repeat
```
select_policy()
→ now biased toward actions that fix memory issues or restart
```

### Hyperparameters
| Parameter | Default | Effect |
|-----------|---------|--------|
| `learning_rate` | 0.5 | Belief update speed (0=slow, 1=fast) |
| `temperature` | 1.0 | Softmax randomness (>1=explore, <1=exploit) |
| `efe_weight` | 0.7 | Weight on information gain in EFE |
| `prior_weight` | 0.3 | Weight on outcome preference in EFE |

**Tuning guide:**
- High `efe_weight` (0.9): Agent prefers diagnostic actions that reduce uncertainty
- High `prior_weight` (0.9): Agent prefers actions that immediately get good outcomes
- High `temperature` (2.0): More random exploration of different action types

### Outputs
- Current state beliefs (probability distribution over hidden states)
- Action recommendation with EFE breakdown (risk, information gain, uncertainty)
- Full observation/action history

### Pitfalls
- `outcome_preferences` is zero everywhere: all actions become equally informative — set clear rewards
- Single-step greedy policy: for multi-step goals, provide explicit multi-step `policies` to init_beliefs
- Beliefs never converge: try lowering `learning_rate` to 0.2 for more stable updates

### Verification Checklist
- [ ] init_beliefs called with non-empty labels
- [ ] select_policy returns an action from action_labels
- [ ] add_outcome updates beliefs (entropy should generally decrease over time)
- [ ] After multiple rounds, preferred actions align with outcome_preferences

### Includes
- `server.py` — pure stdlib MCP server (zero external dependencies)
  - Tools: init_beliefs, add_outcome, compute_efe, select_policy, get_beliefs, get_history, set_hyperparams, reset

