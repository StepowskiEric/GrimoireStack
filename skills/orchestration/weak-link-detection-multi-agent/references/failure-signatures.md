# Failure Signatures in Multi-Agent Systems

This reference catalogs common failure signatures in multi-agent systems, describing their characteristics and providing detection patterns for early identification.

## 1. Cascading Failures

**Description:** A failure in one agent propagates to downstream agents that depend on its output, causing a chain reaction of failures. The initial error is amplified as each subsequent agent builds on incorrect information.

**Typical Scenario:**
- Agent A produces incorrect output
- Agent B uses Agent A's output as input and produces flawed output
- Agent C uses Agent B's output, further degrading quality
- The final result is significantly worse than any single agent's output

**Detection Patterns:**
- Monitor error rates across agents; look for sequential failures
- Track dependency graph; failures following a topological pattern
- Correlate upstream errors with downstream quality metrics
- Sudden drop in aggregate confidence scores across multiple agents
- Error messages referencing previous agent outputs

**Metrics to Watch:**
- Error propagation ratio: (downstream errors) / (upstream errors)
- Time between upstream failure and downstream failure
- Number of agents affected by a single point of failure

## 2. Silent Drops

**Description:** An agent fails to produce any output or return a response without raising an explicit error. This leads to missing data, incomplete aggregation, or deadlocks where the system waits indefinitely.

**Typical Scenario:**
- Agent B is supposed to return a result but encounters an internal issue
- No exception is raised; the agent simply returns nothing or an empty response
- Downstream agents expecting Agent B's output either fail or proceed with incomplete data
- The orchestrator may not notice the missing output until timeout

**Detection Patterns:**
- Track expected vs actual number of responses received
- Monitor for agents that return empty/None/null without explicit error
- Set heartbeat/acknowledgment timeouts for each agent
- Log and alert when an agent fails to produce output within a reasonable time
- Compare response payload sizes across agents; unusually small responses may indicate silent drops

**Metrics to Watch:**
- Response rate: (responses received) / (agents invoked)
- Empty response count per agent
- Time between request and response (or timeout)

## 3. Timeout Chains

**Description:** Delays propagate through the system as agents wait for each other, causing overall latency to spike. A slow agent can block subsequent steps, creating a cascade of timeouts even if no agent fails outright.

**Typical Scenario:**
- Agent A takes 10x longer than expected due to resource contention
- Agent B waits for Agent A's output, then times out
- Agent C waits for Agent B's output, also timing out
- The entire pipeline exceeds its deadline, even though individual agents might eventually succeed

**Detection Patterns:**
- Measure end-to-end latency per task; track p95/p99 latencies
- Instrument each agent's processing time; identify bottlenecks
- Set per-agent timeout thresholds and monitor timeout rates
- Look for correlation between slow agents and downstream timeouts
- Visualize task execution timelines to spot blocking dependencies

**Metrics to Watch:**
- Agent processing time distribution
- Timeout frequency per agent
- End-to-end task latency vs SLA
- Queue wait times between agents

## 4. Data Corruption

**Description:** Incorrect, malformed, or inconsistent data is passed between agents, leading to incorrect processing, crashes, or subtle errors that may not be immediately apparent.

**Typical Scenario:**
- Agent A outputs a JSON object with missing required fields
- Agent B expects those fields and crashes or produces garbage output
- Agent C receives Agent B's corrupted output and generates invalid results
- The error may manifest far from the source, making diagnosis difficult

**Detection Patterns:**
- Validate data schemas at every handoff point
- Use checksums or hashes to detect data integrity issues
- Monitor for unexpected values (NaNs, nulls, out-of-range numbers)
- Track data quality metrics (completeness, validity, consistency)
- Log data samples at boundaries; diff outputs across agents for same input

**Metrics to Watch:**
- Schema validation failure rate
- Data completeness score (percentage of required fields present)
- Anomaly detection scores for output distributions
- Error rates referencing data parsing/processing

## 5. Priority Inversion

**Description:** Lower-priority tasks or agents block higher-priority ones, causing critical tasks to be delayed. This often occurs due to resource contention, locking, or scheduling policies that don't account for priority levels.

**Typical Scenario:**
- High-priority task H needs a resource held by low-priority task L
- Medium-priority task M preempts L, preventing L from releasing the resource
- Task H is blocked indefinitely while M runs
- The system fails to meet its real-time or critical path requirements

**Detection Patterns:**
- Monitor task priority vs completion order; high-priority tasks completing after low-priority ones is a red flag
- Track wait times for high-priority tasks; spikes indicate potential inversion
- Instrument resource acquisition and release events
- Alert when a high-priority task has been waiting longer than a threshold
- Analyze lock contention and resource holding times

**Metrics to Watch:**
- Wait time by priority level
- Time-to-first-response for high-priority tasks
- Resource hold time per task
- Priority inversion count (high-priority blocked by lower-priority)

## General Detection Strategies

### Observability Pillars
- **Logging:** Structured logs at every handoff with correlation IDs
- **Tracing:** Distributed tracing to follow a request through all agents
- **Metrics:** Quantitative health indicators per agent and per pipeline
- **Alerting:** Threshold-based alerts on error rates, latencies, and anomaly scores

### Proactive Monitoring
- Synthetic probes that exercise critical multi-agent workflows
- Canary tests that run reduced versions of pipelines to detect degradation
- Periodic audits of agent outputs for quality and consistency

### Circuit Breakers
- Implement circuit breakers around agent calls to prevent cascading failures
- Track failure rates; open circuit after threshold is exceeded
- Fallback mechanisms when an agent is unavailable

### Health Scoring
- Assign each agent a health score based on recent performance
- Weight aggregation by health scores; deprioritize unhealthy agents
- Automatically quarantine agents with sustained poor health

## Conclusion

Recognizing these failure signatures early allows orchestrators to intervene before errors amplify. Combine automated detection with human review for critical systems.
