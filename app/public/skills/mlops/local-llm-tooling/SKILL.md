---
name: local-llm-tooling
category: mlops
description: Skills for running, prompting, and extracting structured output from local LLMs (e.g., Ollama, llama.cpp).
version: 1.0
...



---

# Local LLM Tooling Skill

## Purpose
Provide a reliable workflow for interacting with locally hosted LLMs: starting the server, crafting prompts, handling model-specific quirks, and extracting structured JSON or text outputs.

## When to Use
- You need to run an LLM locally for agent tasks, data extraction, or generation.
- You want to avoid API rate limits, costs, or privacy concerns.
- You are using tools like Ollama, llama.cpp, or text-generation-webui.

## Steps

### 1. Choose and Start the Backend
- **Ollama**: `ollama run <model>` (handles server internally) or `ollama serve` then `ollama run`.
- **llama.cpp**: Use `./main -m <model.gguf> -n 256 --repeat_last_n 64` or start the server mode.
- **text-generation-webui**: `python server.py --model <path> --listen`.
- Ensure the backend is listening on a known port (default Ollama: 11434, llama.cpp server: 8080).

### 2. Verify the Model is Loaded
- Send a minimal probe request to confirm responsiveness.
  - Ollama: `curl http://localhost:11434/api/generate -d '{"model":"<name>","prompt":"Hi","stream":false}'`
  - llama.cpp server: POST to `/completion` with similar payload.
- Check for errors: model not found, OOM, or server not running.

### 3. Craft the Prompt
- Use clear, task-specific instructions.
- For structured output, explicitly request JSON and specify the schema.
  - Bad: “Extract the name and age.”
  - Good: “Return a JSON object with exactly two fields: `name` (string) and `age` (integer). No extra text.”
- If the model struggles with JSON, consider:
  - Using a format guard: “```json\n{...}\n```”.
  - Asking for a short reasoning step first, then the JSON on a new line.
- Keep prompts concise; long prompts increase latency and may exceed context window.

### 4. Handle Model Quirks
- **Stop tokens**: Configure the backend to stop at `\n\n` or a custom token to prevent runaway generation.
- **Temperature**: Lower (0.1–0.3) for factual extraction; higher (0.7+) for creative tasks.
- **Repeating prompts**: Some models echo the prompt; strip it from the response if needed.
- **Tool use**: If the model was fine-tuned for tool calls (e.g., HuggingFace agents), adhere to its exact format.

### 5. Extract and Validate Output
- **Text parsing**: If JSON is requested, isolate the first `{` and last `}`; use a JSON parser with fallback.
- **Validation**: Check that required fields exist and have correct types.
- **Retry logic**: On parse failure, optionally:
  - Retry with a corrected prompt (“Your last response was not valid JSON. Please output only JSON.”).
  - Fallback to a simpler schema or heuristic extraction.

### 6. Clean Up Resources
- When done, unload the model to free VRAM/RAM:
  - Ollama: `ollama stop <model>`.
  - llama.cpp server: kill the process.
  - Alternatively, keep it loaded if you’ll reuse it soon to avoid reload latency.

## Outputs
- Server process ID or endpoint.
- Raw model response.
- Parsed/structured data (if applicable).
- Latency and token usage metrics (if available from backend).

## Pitfalls
- **Context window overflow**: Long prompts + generation may exceed limits, causing truncation or errors. Measure token count.
- **Model hallucination**: Especially with weak prompts; always validate outputs against known facts or constraints.
- **Server instability**: Some backends crash on invalid requests; start with a health check.
- **Port conflicts**: Ensure the chosen port is free; check with `lsof -i:<port>`.
- **VRAM exhaustion**: Monitor GPU memory; offload to CPU if needed (slower but works).

## Verification Checklist
- [ ] Backend server is running and reachable.
- [ ] Model loads without OOM or errors.
- [ ] A simple prompt returns a coherent response.
- [ ] Structured output (if requested) parses to valid JSON/schema.
- [ ] No stray text before/after JSON when isolation is attempted.
- [ ] Resources can be cleaned up (server stops, memory freed).

## Example (Ollama)
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
    "prompt":"From this text: \\\"Apple Inc. was founded by Steve Jobs in 1976.\\\" Return JSON with fields: company (string), founder (string), year (integer). No extra text.",
    "stream":false,
    "options":{"temperature":0.1}
  }' | jq -r '.response')

# Parse and validate
echo "$response" | jq '{
  company: .company,
  founder: .founder,
  year: .year|tonumber
}'
```
___

