---
source: "jerry-skills"
name: evolutionary-tool-composer
category: mcp-servers
description: >
  MCP server that runs an evolutionary algorithm to discover and optimize agent tool chains,
  prompt strategies, and code solutions. Based on AlphaEvolve/OpenEvolve principles — LLM-driven
  evolutionary search with automated fitness evaluation.
---

# Evolutionary Tool Composer

An MCP server that runs an evolutionary algorithm to discover and optimize agent solutions. Given a task description and a fitness function, it evolves a population of candidate solutions across generations, selecting fitter individuals via crossover and mutation. Based on the same principles as AlphaEvolve (Google DeepMind) and the open-source OpenEvolve.

**Use it when:** You want the agent to discover tool combinations, prompt strategies, or code solutions that outperform human intuition. The evolutionary loop finds solutions that would not emerge from a single-pass generation.

**Skill type:** MCP server (pure stdlib Python; zero external dependencies beyond the Python standard library).

---

## Tools

| Tool | Purpose |
|------|---------|
| `evolve_init` | Initialize an evolutionary run with task + fitness function + seed solution |
| `evolve_step` | Run one generation (mutation, crossover, selection, evaluation) |
| `evolve_get_best` | Return the current best individual |
| `evolve_crossover` | Breed two individuals manually |
| `evolve_get_population` | Return full population ranked by fitness |
| `evolve_migrate` | Inject an external solution into the population |
| `evolve_reset` | Clear the engine |

---

## Quick Start

```
evolve_init(task="Write a SQL query that joins orders to customers and filters by date",
            initial_genes="SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id WHERE orders.date > '2024-01-01'",
            fitness_fn="lambda genes, task: min(1.0, len(genes.split('JOIN')) * 0.4 + len(genes.split('WHERE')) * 0.3)",
            population_size=20)
```
Then call `evolve_step()` repeatedly, checking `evolve_get_best()` each time.

---

## Fitness Function

The fitness function is a Python lambda/expression that receives:
- `genes: str` — the candidate solution text
- `task: str` — the task description

Returns a `float` — higher is better. The fitness function is executed in a sandboxed subprocess with a 10-second timeout.

**Examples:**

```python
# Prompt length + quality score
"lambda genes, task: len([w for w in genes.split() if w in ['analyze', 'explain', 'compare']]) / max(len(genes.split()), 1)"

# Code: runs without error (passes basic syntax check)
"lambda genes, task: 1.0 if genes.count('def ') > 0 and genes.count('return') > 0 else 0.0"

# Composite score
"lambda genes, task: (genes.count('SELECT') + genes.count('JOIN')) * 0.3 - abs(len(genes) - 200) * 0.01"
```

**Note:** The server calls your fitness function with **positional args**: `fitness_fn(genes_val, task_val)`. Your parameter names don't matter — only the positional order does. Named functions using `def fitness_fn(genes, task):` work correctly.

---

## Example Workflow

### Optimize a SQL query

```
1. evolve_init
   task: "Find the fastest SQL query to get all orders with customer name and total"
   initial_genes: "SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id"
   fitness_fn: "lambda genes, task: (genes.count('JOIN') + genes.count('SELECT')) * 0.2 + (1.0 if 'WHERE' in genes else 0.0)"
   population_size: 20

2. evolve_step(mutate_rate=0.3, tournament_k=3)
   → returns {"generation": 1, "best_fitness": 0.8, "avg_fitness": 0.5, "improvement_vs_init": 0.2}

3. evolve_get_best()
   → returns {"id": "ind_0007", "genes": "SELECT orders.id, customers.name FROM orders JOIN customers ON ...", "fitness": 0.8, ...}

4. [repeat step 2-3 for N generations until fitness plateaus]
```

### Evolve a prompt strategy

```
1. evolve_init
   task: "Write a system prompt for a code reviewer that catches bugs"
   initial_genes: "You are a code reviewer. Check for bugs and suggest improvements."
   fitness_fn: "lambda genes, task: min(1.0, len(genes.split()) / 50.0) * 0.5 + ('Step' in genes or '1.' in genes) * 0.5"
   population_size: 20

2. [evolve_step × 10]
3. evolve_get_best() → best prompt strategy
```

### Tool-chain discovery

```
1. evolve_init
   task: "Discover the best sequence of grep → awk → sort to extract unique usernames from a log"
   initial_genes: "grep 'user' log.txt | awk '{print $2}'"
   fitness_fn: "lambda genes, task: genes.count('sort') * 0.3 + genes.count('uniq') * 0.3 + (1.0 if 'awk' in genes else 0.0)"
   population_size: 15

2. [evolve_step × 15]
3. evolve_get_best() → refined pipeline
```

---

## Algorithm Details

- **Selection:** Tournament selection (default k=3)
- **Crossover:** Uniform crossover — randomly merges lines from two parents
- **Mutation operators:** Insert, Delete, Replace, Scramble, Inversion (each applied with `mutate_rate` probability)
- **Elitism:** Top 2 individuals survive unchanged each generation
- **Fitness evaluation:** Subprocess sandbox, 10s timeout, -1000 on error/-timeout
- **Population:** Fixed size, initialized from mutated seed

---

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `population_size` | 20 | Number of individuals per generation |
| `mutate_rate` | 0.3 | Per-line mutation probability per generation |
| `tournament_k` | 3 | Tournament size for selection |

---

## Limitations

- Fitness function must be a simple Python expression (no imports, no multi-line defs). For complex fitness logic, encode it in the initial seed and use a scoring expression.
- The agent should call `evolve_step` 5-15 times before calling `evolve_get_best` — evolutionary algorithms need generations to work.
- If all individuals get fitness -1000 (fitness function errors), the population is stuck. Fix the fitness expression.

---

## References

- [AlphaEvolve (Google DeepMind, 2025)](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)
- [OpenEvolve (HuggingFace, open-source port)](https://huggingface.co/blog/codelion/openevolve)
- [AlphaEvolve paper (arXiv:2506.13131)](https://arxiv.org/abs/2506.13131)
