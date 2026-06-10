     1|---|
     2|name: weak-link-detection-multi-agent|
     3|description: Identify and isolate the weakest reasoning chain in multi-agent outputs before aggregation. Prevents error amplification when one agent fails. Based on weak-link optimization research (arXiv:2604.15972).|
     4|category: orchestration|
     5|tags: [multi-agent, weak-link, error-detection, aggregation, quality-control]|
     6|author: Research synthesis|
     7|date: 2026-04-20|
     8|version: 1.0.0|
     9|...|
    10||
    11||
    12||
    13|---|
    14||
    15|# Weak-Link Detection for Multi-Agent Systems|
    16||
    17|## When to Use|
    18||
    19|Use this skill when:|
    20|- Aggregating outputs from multiple agents|
    21|- One agent's error could pollute the collective result|
    22|- Need to ensure multi-agent collaboration is robust|
    23|- Previous multi-agent runs produced inconsistent results|
    24|- Quality of individual agent outputs varies significantly|
    25||
    26|## The Problem|
    27||
    28|In multi-agent systems, **error amplification** occurs when:|
    29|- One agent produces incorrect output|
    30|- Other agents build on that incorrect output|
    31|- Final aggregated result is worse than any individual agent|
    32||
    33|The "weak link" is the agent whose output, if wrong, most damages the final result.|
    34||
    35|## State Machine Protocol|
    36||
    37|```|
    38|┌─────────────┐|
    39|│    INIT     │|
    40|└──────┬──────┘|
    41|       │|
    42|       ▼|
    43|┌─────────────┐|
    44|│   COLLECT   │|
    45|└──────┬──────┘|
    46|       │|
    47|       ▼|
    48|┌─────────────┐|
    49|│   ASSESS    │|
    50|└──────┬──────┘|
    51|       │|
    52|       ▼|
    53|┌─────────────┐     ┌─────────────┐|
    54|│   SCORE     │────▶│   IDENTIFY  │|
    55|└─────────────┘     └──────┬──────┘|
    56|                           │|
    57|              ┌────────────┴────────────┐|
    58|              │                         │|
    59|              ▼                         ▼|
    60|       ┌─────────────┐           ┌─────────────┐|
    61|       │   WEAK      │           │   STRONG    │|
    62|       │   FOUND     │           │   ENOUGH    │|
    63|       └──────┬──────┘           └──────┬──────┘|
    64|              │                         │|
    65|              ▼                         ▼|
    66|       ┌─────────────┐           ┌─────────────┐|
    67|       │   ISOLATE   │           │   AGGREGATE │|
    68|       └──────┬──────┘           └──────┬──────┘|
    69|              │                           │|
    70|              │                 ┌─────────┴─────────┐|
    71|              │                 │                   │|
    72|              │                 ▼                   ▼|
    73|              │          ┌─────────────┐     ┌─────────────┐|
    74|              │          │   REPAIR    │     │   EXCLUDE   │|
    75|              │          └──────┬──────┘     └──────┬──────┘|
    76|              │                 │                   │|
    77|              │                 └─────────┬─────────┘|
    78|              │                           │|
    79|              └─────────────┬─────────────┘|
    80|                            │|
    81|                            ▼|
    82|                     ┌─────────────┐|
    83|                     │   FINAL     │|
    84|                     │   OUTPUT    │|
    85|                     └──────┬──────┘|
    86|                            │|
    87|                            ▼|
    88|                     ┌─────────────┐|
    89|                     │    DONE     │|
    90|                     └─────────────┘|
    91|```|
    92||
    93|## States|
    94||
    95|### INIT|
    96|**Purpose:** Setup weak-link detection|
    97||
    98|**Entry Actions:**|
    99|- Identify participating agents|
   100|- Define aggregation strategy (consensus, voting, weighted, etc.)|
   101|- Set weak-link threshold (when to trigger isolation)|
   102|- Define repair vs exclude criteria|
   103||
   104|**Exit Conditions:** Always → COLLECT|
   105||
   106|**Output Format:**|
   107|```yaml|
   108|multi_agent_config:|
   109|  agents: [agent_1, agent_2, ...]|
   110|  aggregation_strategy: "consensus|voting|weighted"|
   111|  weak_link_threshold: 0.5|
   112|  repair_attempts: 2|
   113|  exclusion_allowed: true|
   114|```|
   115||
   116|___|
   117||
   118||
   119|### COLLECT|
   120|**Purpose:** Gather outputs from all agents|
   121||
   122|**Entry Actions:**|
   123|- Request output from each agent|
   124|- Preserve raw outputs without modification|
   125|- Note any agent-specific metadata (confidence, reasoning, etc.)|
   126||
   127|**Exit Conditions:** All outputs collected → ASSESS|
   128||
   129|___|
   130||
   131||
   132|### ASSESS|
   133|**Purpose:** Evaluate each agent output individually|
   134||
   135|**Entry Actions:**|
   136|For each agent output, assess:|
   137|- Internal consistency (does it contradict itself?)|
   138|- Confidence score (if provided)|
   139|- Evidence quality (sources cited, reasoning depth)|
   140|- Domain appropriateness (is this agent's expertise relevant?)|
   141||
   142|**Prompt Template (per agent):**|
   143|```|
   144|Assess Agent {{N}} output:|
   145||
   146|Output: {{agent_output}}|
   147||
   148|Evaluation:|
   149|- Internal consistency: [PASS/FAIL/PARTIAL]|
   150|- Evidence quality: [HIGH/MEDIUM/LOW]|
   151|- Reasoning clarity: [CLEAR/UNCLEAR/ABSENT]|
   152|- Confidence indicators: [list any]|
   153|- Potential issues: [list concerns]|
   154||
   155|Preliminary quality score: [0-1]|
   156|```|
   157||
   158|**Exit Conditions:** All assessed → SCORE|
   159||
   160|___|
   161||
   162||
   163|### SCORE|
   164|**Purpose:** Calculate weakness score for each agent|
   165||
   166|**Entry Actions:**|
   167|Calculate weakness based on:|
   168|- Low individual quality score|
   169|- High deviation from consensus (if applicable)|
   170|- Missing critical components|
   171|- Logical flaws|
   172||
   173|**Weakness Score Formula:**|
   174|```|
   175|weakness = (1 - quality) * 0.4 +|
   176|           deviation_from_consensus * 0.3 +|
   177|           critical_gaps * 0.2 +|
   178|           logical_flaws * 0.1|
   179|```|
   180||
   181|Higher = weaker link|
   182||
   183|**Exit Conditions:** All scored → IDENTIFY|
   184||
   185|___|
   186||
   187||
   188|### IDENTIFY|
   189|**Purpose:** Find the weakest link(s)|
   190||
   191|**Entry Actions:**|
   192|- Rank agents by weakness score|
   193|- Identify if any exceed weak_link_threshold|
   194|- Determine if aggregation is safe or needs intervention|
   195||
   196|**Decision Rules:**|
   197|- If max(weakness) < 0.3 → STRONG ENOUGH (aggregate all)|
   198|- If 0.3 ≤ max(weakness) < 0.7 → WEAK FOUND (isolate and repair)|
   199|- If max(weakness) ≥ 0.7 → WEAK FOUND (isolate and consider exclude)|
   200||
   201|**Exit Conditions:**|
   202|- Decision = STRONG → AGGREGATE|
   203|- Decision = WEAK → ISOLATE|
   204||
   205|___|
   206||
   207||
   208|### ISOLATE|
   209|**Purpose:** Quarantine weak agent output|
   210||
   211|**Entry Actions:**|
   212|- Identify which agent(s) are weak links|
   213|- Separate their output from strong outputs|
   214|- Analyze why they're weak|
   215||
   216|**Prompt Template:**|
   217|```|
   218|WEAK LINK ANALYSIS|
   219||
   220|Weak agent(s): {{agent_ids}}|
   221|Weakness scores: {{scores}}|
   222||
   223|Analysis:|
   224|What makes this output weak?|
   225|- [Specific issue 1]|
   226|- [Specific issue 2]|
   227||
   228|Impact on aggregation:|
   229|If included, this would [describe harm]|
   230||
   231|Repairable? YES / NO|
   232|- If YES: What's needed to fix it?|
   233|- If NO: Why must it be excluded?|
   234|```|
   235||
   236|**Exit Conditions:**|
   237|- Repairable = YES → REPAIR|
   238|- Repairable = NO → EXCLUDE|
   239||
   240|___|
   241||
   242||
   243|### REPAIR|
   244|**Purpose:** Attempt to fix weak agent output|
   245||
   246|**Entry Actions:**|
   247|- Send feedback to weak agent|
   248|- Request revised output with specific corrections|
   249|- Limit repair attempts (config.repair_attempts)|
   250||
   251|**Prompt Template:**|
   252|```|
   253|REPAIR REQUEST|
   254||
   255|Agent: {{weak_agent}}|
   256|Original output: {{original_output}}|
   257||
   258|Issues to address:|
   259|1. {{issue_1}}|
   260|2. {{issue_2}}|
   261||
   262|Please provide revised output addressing these issues.|
   263||
   264|Attempt {{N}} of {{max_attempts}}|
   265|```|
   266||
   267|**Exit Conditions:**|
   268|- Repair successful → Return to ASSESS|
   269|- Repair failed → EXCLUDE|
   270|- Max attempts reached → EXCLUDE|
   271||
   272|___|
   273||
   274||
   275|### EXCLUDE|
   276|**Purpose:** Remove weak agent from aggregation|
   277||
   278|**Entry Actions:**|
   279|- Document why agent was excluded|
   280|- Adjust aggregation to use remaining agents|
   281|- Check if minimum agent count remains (if required)|
   282||
   283|**Exit Conditions:**|
   284|- Minimum agents remain → AGGREGATE|
   285|- Too few agents → Escalate to human|
   286||
   287|___|
   288||
   289||
   290|### AGGREGATE|
   291|**Purpose:** Combine strong agent outputs|
   292||
   293|**Entry Actions:**|
   294|Apply aggregation strategy:|
   295||
   296|**Consensus:** Find common elements across all outputs|
   297|**Voting:** Take majority/plurality position on each decision|
   298|**Weighted:** Weight by agent quality scores|
   299|**Best-of:** Select single highest-quality output|
   300||
   301|**Prompt Template:**|
   302|```|
   303|AGGREGATION|
   304||
   305|Participating agents: {{agent_list}}|
   306|Aggregation strategy: {{strategy}}|
   307||
   308|Process:|
   309|{% if strategy == "consensus" %}| 
   310|- Find elements present in all/most outputs|
   311|- Note areas of disagreement|
   312|- Resolve conflicts using evidence quality|
   313|{% elif strategy == "voting" %}| 
   314|- For each decision point, count agent positions|
   315|- Select majority position|
   316|- Note dissenting views|
   317|{% elif strategy == "weighted" %}| 
   318|- Weight each agent by quality score|
   319|- Combine weighted contributions|
   320|{% endif %}| 
   321||
   322|Aggregated result:|
   323|[Final combined output]|
   324||
   325|Confidence: [based on agreement level]|
   326|Dissent areas: [if any]|
   327|```|
   328||
   329|**Exit Conditions:** Always → FINAL OUTPUT|
   330||
   331|___|
   332||
   333||
   334|### FINAL OUTPUT|
   335|**Purpose:** Present aggregated result|
   336||
   337|**Entry Actions:**|
   338|- Format final output|
   339|- Include weak-link handling summary|
   340|- Note any excluded agents and why|
   341||
   342|**Output Format:**|
   343|```markdown|
   344|## Aggregated Result|
   345||
   346|[Final output]|
   347||
   348|## Process Summary|
   349|- Total agents: {{N}}|
   350|- Weak links identified: {{count}}|
   351|- Agents excluded: {{list}}|
   352|- Agents repaired: {{list}}|
   353|- Final aggregation: {{strategy}}|
   354||
   355|## Confidence Assessment|
   356|- Agreement level: {{percentage}}|
   357|- Quality of contributing agents: {{assessment}}|
   358|- Overall confidence: {{score}}|
   359||
   360|## Dissent Notes|
   361|[If any agents disagreed significantly, note their positions]|
   362|```|
   363||
   364|**Exit Conditions:** Always → DONE|
   365||
   366|___|
   367||
   368||
   369|### DONE|
   370|**Purpose:** Return final result|
   371||
   372|**Entry Actions:**|
   373|- Return aggregated output|
   374|- Include process transparency|
   375||
   376|## Example Usage|
   377||
   378|```markdown|
   379|Task: Analyze code for security issues|
   380||
   381|[INIT] 3 security agents with consensus aggregation|
   382||
   383|[COLLECT] Gather outputs from:|
   384|- Agent A: Static analysis expert|
   385|- Agent B: Dynamic testing expert|
   386|- Agent C: Manual review expert|
   387||
   388|[ASSESS]|
   389|Agent A:|
   390|- Found 5 issues|
   391|- Clear evidence for each|
   392|- Quality: HIGH (0.9)|
   393||
   394|Agent B:|
   395|- Found 2 runtime vulnerabilities|
   396|- One finding lacks evidence|
   397|- Quality: MEDIUM (0.6)|
   398||
   399|Agent C:|
   400|- Found 1 logic flaw|
   401|- Well-reasoned|
   402|- Quality: HIGH (0.85)|
   403||
   404|[SCORE] Weakness scores:|
   405|- Agent A: 0.1 (strong)|
   406|- Agent B: 0.4 (concerning - missing evidence)|
   407|- Agent C: 0.15 (strong)|
   408||
   409|[IDENTIFY] Agent B is weak link (score 0.4 > threshold 0.3)|
   410||
   411|[ISOLATE] Agent B's finding #2 lacks evidence|
   412||
   413|[REPAIR] Request Agent B provide evidence for finding #2|
   414||
   415|[ASSESS] Revised Agent B output:|
   416|- Now provides evidence|
   417|- Quality improved to 0.8|
   418||
   419|[SCORE] New weakness: 0.2 (acceptable)|
   420||
   421|[AGGREGATE] All 3 agents now strong enough|
   422|- Combine findings: 5 + 2 + 1 = 8 unique issues|
   423|- Consensus on severity ratings|
   424|- Final report generated|
   425||
   426|[FINAL OUTPUT] Security analysis with 8 confirmed issues|
   427|```|
   428||
   429|## Pitfalls|
   430||
   431|1. **Over-exclusion:** Don't exclude agents too aggressively — diversity matters|
   432|2. **Repair loops:** Limit repair attempts to prevent infinite loops|
   433|3. **Consensus bias:** Don't force consensus when legitimate disagreement exists|
   434|4. **Quality overconfidence:** Self-assigned confidence scores can be inflated|
   435|5. **Ignoring context:** Sometimes the "weak" agent is actually correct and others are wrong|
   436||
   437|## Integration|
   438||
   439|Combine with:|
   440|- `agentic-design-patterns-orchestrator`: For multi-agent workflow management|
   441|- `self-consistency`: Cross-check agent outputs for consistency|
   442|- `separation-of-concerns`: Assign different aspects to different agents|
   443||
   444|## Research Basis|
   445||
   446|- Weak-Link Optimization for Multi-Agent Reasoning (arXiv:2604.15972)|
   447|- Error propagation in collaborative AI systems|
