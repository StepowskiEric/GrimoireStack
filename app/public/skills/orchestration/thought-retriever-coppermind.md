# Skill: Thought-Retriever with Coppermind

## Purpose

Enable sub-agents to build collective reasoning memory using the Coppermind three-layer memory architecture. Instead of just returning answers, agents store structured "thoughts" (intermediate reasoning) that future agents can retrieve and build upon.

This skill bridges the paper's Thought-Retriever algorithm with Coppermind's actual implementation: **episodes** (immutable audit) → **memories** (promoted durable records with lifecycle) → **edges** (graph relationships).

---

## When to Use

- Complex multi-step problems where future similar tasks will arise
- When you want agents to learn from each other's problem-solving approaches  
- Debugging, research, design tasks where "how we got here" matters as much as "what we concluded"
- Cross-session work where memory must persist beyond a single conversation

---

## Coppermind Architecture (Verified)

Coppermind uses three tables in SurrealDB:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COPPERMIND MEMORY ARCHITECTURE                   │
├─────────────────┬─────────────────┬─────────────────────────────────┤
│    episode      │    memories     │      Edge Tables                │
│  (immutable)    │  (promoted)     │    (graph relations)            │
├─────────────────┼─────────────────┼─────────────────────────────────┤
│ raw_text        │ content         │ supersedes (new → old)          │
│ created_at      │ search_text     │ contradicts (bidirectional)     │
│ source          │ importance      │ related_to (memories → memories)│
│ actor           │ memory_type     │ derived_from (mem → episode)    │
│ promotion       │ status*         │                                 │
│ memory_entry_id │ durability*     │                                 │
│                 │ canonical_key*  │                                 │
│                 │ episode_id      │                                 │
└─────────────────┴─────────────────┴─────────────────────────────────┘

* Phase 2 lifecycle fields
```

**Episode Table:** Immutable raw audit trail. Every ingest starts here. Links to promoted memory via `memory_entry_id`.

**Memories Table:** Durable truth with lifecycle. Status = `active|stale|superseded|archived|pending_review`. Durability = `ephemeral|working|durable|canonical_candidate`.

**Edge Tables:** Graph relationships using SurrealDB `TYPE RELATION`. Enable traversal from memories to related memories or source episodes.

---

## Mapping Thought-Retriever to Coppermind

| Thought Type | Coppermind Storage | Lifecycle | Edges Created |
|--------------|-------------------|-----------|---------------|
| `observation` | Episode → Memory | `durability: working` | `derived_from` (mem → episode) |
| `inference` | Memory directly | `durability: durable` | `related_to` links to supporting observations |
| `hypothesis` | Episode (if unverified) | `status: pending_review` | None until validated |
| `uncertainty` | Episode | `promotion: none` (audit only) | None |
| `conclusion` | Memory | `durability: durable`, `canonical_candidate: true` | `supersedes` old conclusions |

**Key Fields for Thought Retrieval:**
- `memory_type`: Store thought type here ("observation", "inference", etc.)
- `metadata`: Store confidence, source agent, task ID, related thought IDs
- `tags`: Domain tags for filtering ("auth", "performance", "security")
- `canonical_key`: For deduplication (e.g., "thought:auth:ssr-issue")
- `scene_trace`: Encoding context — what was the agent trying to do

---

## Pattern

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Sub-agent  │────▶│  Thought Store   │────▶│  Coppermind      │
│  solves task│     │  (structured)    │     │  Episode         │
└─────────────┘     └──────────────────┘     └────────┬─────────┘
                                                       │
                              ┌────────────────────────┘
                              │ (promotion on validation)
                              ▼
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Sub-agent  │◀────│  Retrieved       │◀────│  Memories        │
│  builds on  │     │  Thoughts        │     │  (active status) │
│  prior work │     │  + Edges         │     │                  │
└─────────────┘     └──────────────────┘     └──────────────────┘
                              │
                              │ (graph traversal)
                              ▼
                       ┌──────────────┐
                       │  Edge Tables │
                       │  (context)   │
                       └──────────────┘
```

---

## Mandatory Thought Structure

Every thought stored in Coppermind must include:

```yaml
thought:
  id: "<entry_id UUID>"              # Coppermind primary key
  type: "observation|inference|hypothesis|uncertainty|conclusion"
  content: "The actual reasoning content"
  confidence: 0.0-1.0                 # Stored in metadata.confidence
  source:                             # Stored in metadata
    agent_id: "<sub-agent-name>"
    task_id: "<parent-task-id>"
    session_id: "<session-id>"
  context:                            # Stored in tags + metadata
    domain: "auth|performance|security|etc"
    tags: ["jwt", "react", "ssr"]
    related_files: ["/middleware/auth.ts"]
    canonical_key: "thought:auth:ssr-issue"  # For dedup
  temporal:
    created: "<ISO-timestamp>"        # created_at field
    valid_at: "<ISO-timestamp>"       # Phase 2: when thought becomes valid
  relations:                          # Stored as edges
    derives_from: ["<episode_id>"]    # For observations
    supports: ["<thought_id>"]        # For inferences → observations
    contradicts: ["<thought_id>"]   # For conflicting conclusions
    supersedes: ["<thought_id>"]      # For updated conclusions
```

---

## Workflow

### Phase 1: Thought Generation (During Task Execution)

As the sub-agent works, it generates thoughts and stores to Coppermind:

```
## State: Generate → Store Episode

When making observations:
- Create episode record with raw_text = observation content
- promotion = "none" initially
- source = "agent_thought", actor = agent_id
- canonical_key = auto-generated from domain + topic

When drawing inferences:
- Create episode (raw)
- After validation, promote to memory:
  - durability = "durable"
  - memory_type = "inference"
  - status = "active"
  - episode_id links back to source episode
- Create edges:
  - derived_from (memory → episode)
  - related_to (inference → supporting observations)

When encountering gaps:
- Create episode with promotion = "none"
- Store as uncertainty for audit trail
- These become valuable when future agents hit same gap

When completing:
- Create memory directly (skip episode for efficiency)
- durability = "durable", canonical_candidate = true
- If supersedes prior conclusion:
  - Create supersedes edge (new → old)
  - Mark old memory status = "superseded"
  - Set old memory invalid_at timestamp
```

### Phase 2: Thought Retrieval (For New Tasks)

```
## State: Retrieve → Prior Work Integration

Before starting new task:
1. Query Coppermind memories table:
   - Filter: status = "active"
   - Filter: tags overlap with query domain
   - Sort: importance DESC, last_accessed_at DESC

2. For each candidate memory, traverse edges:
   - Follow related_to for supporting context
   - Follow derived_from to see raw source
   - Check contradicts for alternative perspectives

3. Rank by relevance + confidence + liveness:
   - Semantic match on search_text (BM25 + vector if embedded)
   - metadata.confidence threshold (default: 0.7)
   - liveness = times_confirmed / days_since_access

4. Update access metrics:
   - Increment times_confirmed if used
   - Update last_accessed_at timestamp

5. Inject retrieved thoughts as context:
   - Include content + source traceability
   - Preserve uncertainty markers
   - Surface conflicting conclusions if present
```

---

## Example Usage

### Parent Agent Spawns Researcher

```yaml
delegate_task:
  goal: "Research authentication patterns in this codebase"
  context: |
    Focus on JWT handling, token refresh, and session management.
    Use thought-retriever pattern: store observations, inferences, 
    and uncertainties as you discover them.
```

### Sub-Agent Stores Thoughts to Coppermind

```yaml
# 1. Observation thought → Episode
coppermind_ingest:
  raw_text: "Middleware pattern in /middleware/auth.ts uses edge runtime"
  source: "agent_thought"
  actor: "auth-researcher"
  metadata:
    thought_type: "observation"
    confidence: 0.95
    task_id: "auth-pattern-research"
    related_files: ["/middleware/auth.ts"]
  tags: ["auth", "middleware", "edge", "jwt"]
  canonical_key: "thought:auth:middleware-edge"

# 2. Inference thought → Memory (after validation)
coppermind_ingest:
  content: "Hook pattern couples auth state with React lifecycle - potential SSR issues"
  search_text: "Hook auth state React lifecycle SSR issues"
  memory_type: "inference"
  durability: "durable"
  status: "active"
  importance: 0.8
  metadata:
    thought_type: "inference"
    confidence: 0.80
    task_id: "auth-pattern-research"
    supports: ["<observation_episode_id>"]  # Links to supporting obs
  tags: ["auth", "hooks", "react", "ssr", "lifecycle"]
  canonical_key: "thought:auth:hook-ssr-risk"

# 3. Uncertainty → Episode (audit only, not promoted)
coppermind_ingest:
  raw_text: "HOC pattern usage unclear - may be legacy, needs verification"
  source: "agent_thought"
  actor: "auth-researcher"
  metadata:
    thought_type: "uncertainty"
    confidence: 0.40
    task_id: "auth-pattern-research"
  tags: ["auth", "hoc", "legacy", "verification-needed"]
  # No canonical_key — not confident enough for dedup
```

### Later: Different Sub-Agent Queries

```yaml
thought_retriever:
  query: "What auth patterns have SSR compatibility issues?"
  filters:
    tags: ["auth", "ssr"]
    status: "active"
    metadata.confidence_min: 0.70
    thought_types: ["inference", "conclusion"]
  
# Coppermind query:
# SELECT * FROM memories 
# WHERE status = "active" 
#   AND tags CONTAINSANY ["auth", "ssr"]
#   AND metadata.confidence >= 0.70
# ORDER BY importance DESC

# Returns:
retrieved_thoughts:
  - entry_id: "<uuid>"
    content: "Hook pattern couples auth state with React lifecycle - potential SSR issues"
    memory_type: "inference"
    confidence: 0.80
    source:
      agent_id: "auth-researcher"
      task_id: "auth-pattern-research"
      created_at: "2025-04-20T10:30:00Z"
    edges:
      derived_from: "<episode_id>"  # Raw observation
      related_to: ["<other_observation>"]  # Supporting evidence
```

---

## Integration with Coppermind MCP Tools

### Storing Thoughts

```
Use mcp_coppermind_run with function "ingest":
- For observations: include raw_text, source="agent_thought", metadata.thought_type
- For inferences/conclusions: include content, memory_type, durability="durable"
- Always set canonical_key for deduplication
- Use tags for domain classification
```

### Retrieving Thoughts

```
Use mcp_coppermind_run with function "search":
- query: natural language description
- filters: tags, status="active", metadata fields
- Returns memories ranked by relevance

For graph traversal:
Use mcp_coppermind_query_graph with pattern:
- "children_of" to find thoughts in same task
- "related_to" to find supporting/contradicting thoughts
```

### Creating Edges

```
Edge creation happens automatically during ingest for:
- derived_from: when memory promoted from episode
- supersedes: when canonical_key conflict resolved

For manual relationships (inference → observation):
Use mcp_coppermind_run with custom mutation:
- RELATE $inference_id->related_to->$observation_id
```

---

## Confidence Thresholds

| Confidence | Durability | Status | Retrieval |
|------------|------------|--------|-----------|
| 0.90-1.0 | durable | active | Always, high priority |
| 0.70-0.89 | durable | active | Yes, standard priority |
| 0.50-0.69 | working | active | Yes, with uncertainty flag |
| 0.30-0.49 | ephemeral | pending_review | No — needs validation |
| <0.30 | ephemeral | archived | No — audit only |

---

## Memory Lifecycle

Thoughts in Coppermind follow this lifecycle:

```
Episode Created
      │
      ├─► promotion = "none" ──► Archived after TTL
      │
      ├─► promotion = "pending_review" ──► Manual review
      │
      └─► promotion = "promoted" ──► Memory Created
              │
              ├─► status = "active" ──► Retrieved, updated
              │        │
              │        ├─► Superseded ──► status="superseded", supersedes edge
              │        │
              │        ├─► Contradicted ──► contradicts edge, review job
              │        │
              │        └─► Stale ──► status="stale" after no access
              │
              └─► durability = "canonical_candidate" ──► Canonical truth
```

**Liveness Decay:**
- `last_accessed_at` updated on each retrieval
- `times_confirmed` incremented when used in reasoning
- Old thoughts decay: `importance *= 0.95` per week without access

---

## Anti-Patterns

**Don't:**
- Store raw outputs without thought structure in metadata
- Create memories without canonical_key (prevents dedup)
- Forget to link inferences to supporting observations (loses traceability)
- Retrieve pending_review or superseded thoughts without flagging
- Store every thought as durable (use ephemeral for speculative)

**Do:**
- Be explicit about uncertainty — store low-confidence as episodes only
- Link related thoughts via edges (not just metadata references)
- Use canonical_key for deduplication (e.g., "thought:{domain}:{topic}")
- Update access metrics when retrieving (keeps thoughts alive)
- Mark old conclusions superseded when new evidence arrives

---

## Verification Checklist

Before using this skill, verify Coppermind daemon is running:

```bash
coppermind doctor
```

Check that three-layer schema is provisioned:

```sql
-- In SurrealDB (via coppermind debug)
INFO FOR DB;
-- Should show: episode, memories, supersedes, contradicts, related_to, derived_from tables
```

---

## See Also

- Paper: "Thought-Retriever: Don't Just Retrieve Raw Data, Retrieve Thoughts" (arXiv:2604.12231)
- Coppermind skill: `coppermind-three-layer-memory` — full architecture details
- `rashomon-triad-hybrid` — for when multiple conflicting perspectives exist
