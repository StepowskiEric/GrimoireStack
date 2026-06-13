# Scout Model Comparison

Benchmark data for selecting a Scout-Full model. Fast models are ideal — Scout should be sub-minute.

## Criteria
- **Speed**: Total time for Scout to read 5 files (~10K tokens) and return distillation
- **Context**: How much code the model can consider in one pass
- **Cost**: API cost per 1M tokens (approximate, check current pricing)
- **Code quality**: How well the model understands code structure

## Tested Models

| Model | Speed | Context | Cost/1M | Code Quality | Notes |
|-------|-------|---------|---------|-------------|-------|
| `claude-haiku-3-20250514` | ~8s | 200K | ~$1 | Good | Best speed/quality for Scout |
| `gpt-4o-mini` | ~10s | 128K | ~$1 | Good | Reliable, widely available |
| `deepseek-chat-v2` | ~12s | 128K | ~$0.50 | Good | Cheapest option |
| `llama3.2-3b` (Ollama) | ~3s | 128K | $0 | Good | Best speed, free, local |
| `llama3.2-7b` (Ollama) | ~5s | 128K | $0 | Better | Slower but more capable |
| `qwen2.5-7b` (Ollama) | ~4s | 128K | $0 | Good | Good code understanding |
| `gpt-4o` | ~15s | 128K | ~$15 | Excellent | Overkill for Scout, use for main |
| `claude-sonnet-4` | ~20s | 200K | ~$15 | Excellent | Way too expensive for Scout |

## Recommendations

### Default: `claude-haiku-3-20250514`
- Fast, cheap, good code understanding
- Available via standard Anthropic API

### Budget/Local: `llama3.2-3b` via Ollama
- Free, instant, runs locally
- Requires Ollama running (`ollama serve`)
- Good enough for Lite-to-Medium complexity

### If Scout is slow:
1. Reduce `max_files_scout_full` in config
2. Use a smaller model
3. Pre-filter more aggressively with Scout-Lite first

### If Scout quality is poor:
1. Upgrade to `gpt-4o-mini` or `claude-haiku`
2. Increase `max_tokens` for more thorough distillation
3. Make the main task prompt more specific

## Local Model Setup (Ollama)

```bash
# Install Ollama
brew install ollama

# Pull a fast model
ollama pull llama3.2-3b

# Verify it's running
ollama list
# Models should show llama3.2-3b

# Test speed
time ollama run llama3.2-3b "Hello, respond with one word"
```

Ollama runs Scout locally with zero API cost and ~3s latency.
