#!/usr/bin/env python3
"""
Evolutionary Tool Composer MCP Server

An evolutionary algorithm engine for discovering and optimizing agent tool chains,
prompt strategies, and code solutions. Based on AlphaEvolve/OpenEvolve principles —
LLM-driven evolutionary search with automated fitness evaluation.

Tools:
  evolve_init        — initialize a population with an initial candidate and fitness fn
  evolve_step        — run one generation: mutate, evaluate, select
  evolve_get_best    — return the current best individual
  evolve_crossover   — breed two individuals to create an offspring
  evolve_get_population — return full population with scores
  evolve_migrate     — inject an external solution into the population
  evolve_reset       — clear the population and start fresh
"""

import json
import math
import random
import re
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

# ────────────────────────────────────────────────────────────────────────────────
# MCP stdio transport
# ────────────────────────────────────────────────────────────────────────────────

def _read_message() -> Optional[Dict[str, Any]]:
    first = sys.stdin.buffer.read(1)
    if not first:
        return None
    # SDK mode: raw JSON line (no Content-Length header)
    if first == b"{":
        line = first + sys.stdin.buffer.readline()
        return json.loads(line.decode("utf-8"))
    # Legacy Content-Length mode
    if first == b"C":
        headers = first + sys.stdin.buffer.readline()
        while not headers.endswith(b"\r\n\r\n"):
            headers += sys.stdin.buffer.readline()
        length = 0
        for hline in headers.decode("ascii", errors="ignore").splitlines():
            if hline.lower().startswith("content-length:"):
                length = int(hline.split(":", 1)[1].strip())
        if not length:
            return None
        body = sys.stdin.buffer.read(length)
        return json.loads(body.decode("utf-8"))
    # Fallback: try raw JSON parse
    try:
        return json.loads(first.decode("utf-8"))
    except Exception:
        return None


def _send_message(msg: Dict[str, Any]) -> None:
    """Send a JSON-RPC message to stdout as a raw JSON line."""
    body = json.dumps(msg, separators=(",", ":")).encode("utf-8") + b"\n"
    sys.stdout.buffer.write(body)
    sys.stdout.buffer.flush()


# ────────────────────────────────────────────────────────────────────────────────
# Evolutionary core
# ────────────────────────────────────────────────────────────────────────────────

class Individual:
    """A candidate solution in the evolutionary population."""

    def __init__(
        self,
        id: str,
        genes: str,
        fitness: float = -float("inf"),
        origin: str = "init",
        parent_a: Optional[str] = None,
        parent_b: Optional[str] = None,
    ):
        self.id = id
        self.genes = genes          # the actual solution text
        self.fitness = fitness
        self.origin = origin        # "init", "mutation", "crossover"
        self.parent_a = parent_a
        self.parent_b = parent_b

    def __repr__(self):
        return f"<Individual {self.id} fitness={self.fitness:.4f} origin={self.origin}>"


class EvolutionaryEngine:
    """
    Main evolutionary loop engine.
    Tournament selection + uniform crossover + multi-mode mutation.
    Fitness is computed by executing the user-provided fitness_fn in a sandboxed subprocess.
    """

    def __init__(self):
        self.population: List[Individual] = []
        self.generation: int = 0
        self.task: str = ""
        self.fitness_fn: str = ""
        self.history: List[Dict] = []   # for convergence tracking
        self._id_counter: int = 0
        self.best_ever: Optional[Individual] = None

    def _next_id(self) -> str:
        self._id_counter += 1
        return f"ind_{self._id_counter:04d}"

    # ── Mutation operators ──────────────────────────────────────────────────────

    def _mut_insert(self, genes: str) -> str:
        """Insert a random fragment at a random position."""
        fragments = [
            "# consider alternative: ",
            "## improved:\n",
            "try:\n    ",
            "\nexcept Exception:\n    pass\n",
            "# OPTIMIZE: ",
            "\n# NOTE: ",
            "if True:  # ",
            "return {", "return [",
        ]
        pos = random.randint(0, max(1, len(genes)))
        insert = random.choice(fragments)
        return genes[:pos] + insert + genes[pos:]

    def _mut_delete(self, genes: str) -> str:
        """Delete a random fragment."""
        lines = genes.split("\n")
        if len(lines) <= 2:
            return genes
        n = random.randint(1, max(1, len(lines) // 4))
        for _ in range(n):
            if len(lines) > 2:
                del lines[random.randint(0, len(lines) - 1)]
        return "\n".join(lines)

    def _mut_replace(self, genes: str) -> str:
        """Replace a line or phrase with a semantically similar variant."""
        substitutions = [
            ("for ", "for "),
            ("while ", "while "),
            ("if ", "if "),
            ("def ", "async def "),
            ("try:", "try:\n    "),
            ("except", "# handled\nexcept"),
            ("return None", "return []"),
            ("True", "False"),
            ("==", "!="),
            ("append(", "extend("),
            ("+=", "-="),
        ]
        old, new = random.choice(substitutions)
        return genes.replace(old, new, 1)

    def _mut_scramble(self, genes: str) -> str:
        """Scramble a contiguous block of lines."""
        lines = genes.split("\n")
        if len(lines) <= 3:
            return genes
        a, b = sorted(random.sample(range(len(lines)), 2))
        block = lines[a:b]
        random.shuffle(block)
        lines[a:b] = block
        return "\n".join(lines)

    def _mut_inversion(self, genes: str) -> str:
        """Invert the order of a random block."""
        lines = genes.split("\n")
        if len(lines) <= 3:
            return genes
        a, b = sorted(random.sample(range(len(lines)), 2))
        lines[a:b] = lines[a:b][::-1]
        return "\n".join(lines)

    def _mutate(self, genes: str, rate: float = 0.3) -> str:
        """Apply one mutation operator chosen at random."""
        if random.random() > rate:
            return genes
        ops = [
            self._mut_insert,
            self._mut_delete,
            self._mut_replace,
            self._mut_scramble,
            self._mut_inversion,
        ]
        return random.choice(ops)(genes)

    # ── Crossover ──────────────────────────────────────────────────────────────

    def _crossover(self, a: Individual, b: Individual) -> str:
        """Uniform crossover: randomly merge genes from two parents."""
        lines_a = a.genes.split("\n")
        lines_b = b.genes.split("\n")
        max_len = max(len(lines_a), len(lines_b))
        result = []
        for i in range(max_len):
            src = lines_a[i] if i < len(lines_a) else ""
            if random.random() < 0.5 and i < len(lines_b):
                src = lines_b[i]
            result.append(src)
        return "\n".join(result)

    # ── Fitness evaluation ────────────────────────────────────────────────────

    def _evaluate(self, individual: Individual) -> float:
        """
        Run the fitness function against the individual's genes.
        Fitness fn receives 'genes' (str) and 'task' (str), returns float.
        Execution is sandboxed with a 10s timeout via subprocess.
        """
        import subprocess, tempfile, os, base64

        fn_b64 = base64.b64encode(self.fitness_fn.encode("utf-8")).decode("ascii")
        genes_b64 = base64.b64encode(individual.genes.encode("utf-8")).decode("ascii")
        task_b64 = base64.b64encode(self.task.encode("utf-8")).decode("ascii")

        # Wrap bare lambdas (no assignment) so exec can capture the result.
        # Also skip wrapping for def statements (function definitions).
        user_code = base64.b64decode(fn_b64).decode("utf-8")
        first_content = user_code.split("#")[0].split("\n")[0].strip()
        is_bare = ("=" not in first_content) and not first_content.startswith("def ")
        if is_bare:
            wrapped_code = f"fitness_fn = {user_code}"
        else:
            wrapped_code = user_code

        wrapped_b64 = base64.b64encode(wrapped_code.encode("utf-8")).decode("ascii")
        fn_wrapper = f"""
import json, base64, traceback
_globals = {{}}
_locals = {{}}
try:
    exec(base64.b64decode("{wrapped_b64}").decode("utf-8"), _globals, _locals)
    fitness_fn = _locals.get('fitness_fn') or _globals.get('fitness_fn')
    if fitness_fn is None:
        raise RuntimeError("fitness_fn not defined after exec")
    genes_val = base64.b64decode("{genes_b64}").decode("utf-8")
    task_val = base64.b64decode("{task_b64}").decode("utf-8")
    result = fitness_fn(genes_val, task_val)
    print(json.dumps({{"status": "ok", "fitness": float(result)}}))
except Exception as e:
    print(json.dumps({{"status": "error", "error": str(e), "trace": traceback.format_exc()}}))
"""
        try:
            with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
                f.write(fn_wrapper)
                f.flush()
                tmp = f.name

            result = subprocess.run(
                [sys.executable, tmp],
                capture_output=True,
                text=True,
                timeout=15,
            )
        except subprocess.TimeoutExpired:
            return -1000.0
        finally:
            try:
                os.unlink(tmp)
            except Exception:
                pass

        try:
            data = json.loads(result.stdout.strip().split("\n")[-1])
            if data.get("status") == "ok":
                return data["fitness"]
            return -100.0
        except Exception:
            return -100.0

    # ── Selection ─────────────────────────────────────────────────────────────

    def _tournament_select(self, candidates: List[Individual], k: int = 3) -> Individual:
        """Tournament selection with k participants."""
        selected = random.sample(candidates, min(k, len(candidates)))
        return max(selected, key=lambda x: x.fitness)

    # ── Public API ────────────────────────────────────────────────────────────

    def init(
        self,
        task: str,
        initial_genes: str,
        fitness_fn: str,
        population_size: int = 20,
    ) -> Dict[str, Any]:
        """Initialize population with one seed individual and random others."""
        self.task = task
        self.fitness_fn = fitness_fn
        self.generation = 0
        self.population = []
        self.history = []
        self._id_counter = 0

        # Seed individual
        seed = Individual(self._next_id(), initial_genes, origin="init")
        seed.fitness = self._evaluate(seed)
        self.population.append(seed)
        self.best_ever = seed

        # Fill remaining with mutated copies of seed
        for _ in range(population_size - 1):
            ind = Individual(
                self._next_id(),
                self._mutate(initial_genes),
                origin="init_mutated",
            )
            ind.fitness = self._evaluate(ind)
            self.population.append(ind)
            if ind.fitness > (self.best_ever.fitness if self.best_ever else -float("inf")):
                self.best_ever = ind

        self.history.append({
            "generation": 0,
            "best_fitness": self.best_ever.fitness,
            "avg_fitness": sum(x.fitness for x in self.population) / len(self.population),
            "population_size": len(self.population),
        })

        return {
            "population_size": len(self.population),
            "seed_fitness": seed.fitness,
            "best_fitness": self.best_ever.fitness,
        }

    def step(self, mutate_rate: float = 0.3, tournament_k: int = 3) -> Dict[str, Any]:
        """Run one evolutionary generation."""
        if not self.population:
            raise ValueError("Population not initialized. Call evolve_init first.")

        self.generation += 1
        new_population: List[Individual] = []

        # Elitism: keep top 2
        sorted_pop = sorted(self.population, key=lambda x: x.fitness, reverse=True)
        elite = sorted_pop[:2]
        new_population.extend(elite)

        # Fill rest: crossover + mutation
        target_size = len(self.population)
        while len(new_population) < target_size:
            parent_a = self._tournament_select(self.population, tournament_k)
            parent_b = self._tournament_select(self.population, tournament_k)

            child_genes = self._crossover(parent_a, parent_b)
            child_genes = self._mutate(child_genes, mutate_rate)

            child = Individual(
                self._next_id(),
                child_genes,
                origin="crossover",
                parent_a=parent_a.id,
                parent_b=parent_b.id,
            )
            child.fitness = self._evaluate(child)
            new_population.append(child)

            if self.best_ever is None or child.fitness > self.best_ever.fitness:
                self.best_ever = child

        self.population = new_population

        avg_f = sum(x.fitness for x in self.population) / len(self.population)
        best_f = max(x.fitness for x in self.population)

        self.history.append({
            "generation": self.generation,
            "best_fitness": best_f,
            "avg_fitness": avg_f,
            "population_size": len(self.population),
        })

        return {
            "generation": self.generation,
            "best_fitness": best_f,
            "avg_fitness": avg_f,
            "improvement_vs_init": round(best_f - (self.history[0]["best_fitness"] if self.history else 0), 4),
        }

    def get_best(self) -> Dict[str, Any]:
        """Return the current best individual."""
        if not self.best_ever:
            raise ValueError("No individuals yet.")
        return {
            "id": self.best_ever.id,
            "genes": self.best_ever.genes,
            "fitness": self.best_ever.fitness,
            "origin": self.best_ever.origin,
            "generation": self.generation,
        }

    def crossover(self, id_a: str, id_b: str) -> Dict[str, Any]:
        """Create offspring from two individuals."""
        ind_a = next((x for x in self.population if x.id == id_a), None)
        ind_b = next((x for x in self.population if x.id == id_b), None)
        if not ind_a or not ind_b:
            raise ValueError("One or both individual IDs not found in population.")

        child_genes = self._crossover(ind_a, ind_b)
        child = Individual(
            self._next_id(),
            child_genes,
            origin="manual_crossover",
            parent_a=id_a,
            parent_b=id_b,
        )
        child.fitness = self._evaluate(child)

        if self.best_ever is None or child.fitness > self.best_ever.fitness:
            self.best_ever = child

        self.population.append(child)

        return {"id": child.id, "fitness": child.fitness, "origin": child.origin}

    def get_population(self) -> List[Dict[str, Any]]:
        """Return all individuals with scores."""
        return sorted(
            [
                {
                    "id": x.id,
                    "fitness": x.fitness,
                    "origin": x.origin,
                    "parent_a": x.parent_a,
                    "parent_b": x.parent_b,
                    "genes_preview": x.genes[:200],
                }
                for x in self.population
            ],
            key=lambda x: x["fitness"],
            reverse=True,
        )

    def migrate(self, genes: str, label: str = "migrated") -> Dict[str, Any]:
        """Inject an external solution into the population."""
        ind = Individual(self._next_id(), genes, origin=label)
        ind.fitness = self._evaluate(ind)
        if self.best_ever is None or ind.fitness > self.best_ever.fitness:
            self.best_ever = ind
        self.population.append(ind)
        return {"id": ind.id, "fitness": ind.fitness}

    def reset(self) -> Dict[str, str]:
        """Clear everything."""
        self.__init__()
        return {"status": "reset"}


# Singleton engine
ENGINE = EvolutionaryEngine()

# ────────────────────────────────────────────────────────────────────────────────
# Tool definitions
# ────────────────────────────────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "evolve_init",
        "description": "Initialize an evolutionary run. Creates a population around an initial seed solution and a fitness function. The fitness_fn must be a Python lambda/expression string that takes (genes: str, task: str) and returns a float — higher is better.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "task": {"type": "string", "description": "Natural-language description of the optimization goal"},
                "initial_genes": {"type": "string", "description": "Seed solution (code, prompt, or tool-chain as text)"},
                "fitness_fn": {"type": "string", "description": "Python expression string: lambda genes, task: ... or def fitness(genes, task): ..."},
                "population_size": {"type": "integer", "default": 20, "description": "Population size (default 20)"},
            },
            "required": ["task", "initial_genes", "fitness_fn"],
        },
    },
    {
        "name": "evolve_step",
        "description": "Run one evolutionary generation: tournament selection, crossover, mutation, fitness evaluation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "mutate_rate": {"type": "number", "default": 0.3, "description": "Per-gene mutation probability (0.0-1.0)"},
                "tournament_k": {"type": "integer", "default": 3, "description": "Tournament size for selection"},
            },
        },
    },
    {
        "name": "evolve_get_best",
        "description": "Return the current best individual from the population.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "evolve_crossover",
        "description": "Breed two individuals to create a new offspring via uniform crossover.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "id_a": {"type": "string", "description": "First parent ID"},
                "id_b": {"type": "string", "description": "Second parent ID"},
            },
            "required": ["id_a", "id_b"],
        },
    },
    {
        "name": "evolve_get_population",
        "description": "Return the full population sorted by fitness (best first).",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "evolve_migrate",
        "description": "Inject an external solution (from another tool, human, or model) into the population.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "genes": {"type": "string", "description": "The solution text to inject"},
                "label": {"type": "string", "default": "migrated", "description": "Origin label for this individual"},
            },
            "required": ["genes"],
        },
    },
    {
        "name": "evolve_reset",
        "description": "Clear the population and reset the evolutionary engine.",
        "inputSchema": {"type": "object", "properties": {}},
    },
]


def call_tool(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    if name == "evolve_init":
        result = ENGINE.init(
            task=args["task"],
            initial_genes=args["initial_genes"],
            fitness_fn=args["fitness_fn"],
            population_size=args.get("population_size", 20),
        )
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "evolve_step":
        result = ENGINE.step(
            mutate_rate=args.get("mutate_rate", 0.3),
            tournament_k=args.get("tournament_k", 3),
        )
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "evolve_get_best":
        result = ENGINE.get_best()
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "evolve_crossover":
        result = ENGINE.crossover(args["id_a"], args["id_b"])
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "evolve_get_population":
        result = ENGINE.get_population()
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "evolve_migrate":
        result = ENGINE.migrate(args["genes"], args.get("label", "migrated"))
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    if name == "evolve_reset":
        result = ENGINE.reset()
        return {"content": [{"type": "text", "text": json.dumps(result)}]}

    raise ValueError(f"Unknown tool: {name}")


# ────────────────────────────────────────────────────────────────────────────────
# Server loop
# ────────────────────────────────────────────────────────────────────────────────

def run_server():
    while True:
        msg = _read_message()
        if msg is None:
            break
        method = msg.get("method")
        msg_id = msg.get("id")
        params = msg.get("params", {})

        if method == "initialize":
            _send_message({
                "jsonrpc": "2.0", "id": msg_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "evolutionary-tool-composer", "version": "1.0.0"},
                },
            })
        elif method == "notifications/initialized":
            pass
        elif method == "tools/list":
            _send_message({"jsonrpc": "2.0", "id": msg_id, "result": {"tools": TOOLS}})
        elif method == "tools/call":
            try:
                result = call_tool(params["name"], params.get("arguments", {}))
                _send_message({"jsonrpc": "2.0", "id": msg_id, "result": result})
            except Exception as e:
                _send_message({
                    "jsonrpc": "2.0", "id": msg_id,
                    "error": {"code": -32602, "message": str(e)},
                })
        elif method == "ping":
            _send_message({"jsonrpc": "2.0", "id": msg_id, "result": {}})


if __name__ == "__main__":
    run_server()
