# Skill: Compression-as-Understanding

## Purpose

Verify understanding by compressing knowledge into its minimal essential form, then testing whether that compressed representation can reconstruct the original. If you can't compress it, you don't understand it.

Based on Kolmogorov complexity theory: the shortest program that generates a string is the true measure of its complexity — and understanding that program means understanding the string.

---

## When to Use

- After exploring a large codebase to verify understanding
- Before explaining a complex system to others
- When you need to distinguish "familiar with" from "understands"
- For knowledge handoffs — can the compressed form be decompressed by others?
- Any time you feel "I get this" but haven't tested it

**Don't use when:**
- You need exhaustive documentation (compression loses detail)
- Time is critical (this is a verification step, not a shortcut)
- The system is trivial (compression adds no value)

---

## Core Concept

**Kolmogorov Complexity:** The length of the shortest program that produces a given output.

**Applied to understanding:**
- If you truly understand a system, you can describe it concisely
- If your description is bloated, you don't know what's essential
- The test: can you reconstruct the important details from your summary?

**Compression ratio as understanding metric:**
```
understanding_score = 1 - (compressed_size / original_size)

High ratio (80%+): Deep understanding — you've identified the essence
Medium ratio (50-80%): Partial understanding — some noise remains  
Low ratio (<50%): Poor understanding — mostly parroting
```

---

## Protocol

### Phase 1: Exploration (Normal)

Explore the codebase/system as you normally would. Take notes, read files, trace flows.

**No special constraints.** Just learn.

---

### Phase 2: Compression

Summarize the system into the smallest form that captures its essential structure.

**Constraints:**
- Maximum 10 sentences OR 200 words (whichever is shorter)
- Must include: inputs, outputs, core transformation, key dependencies
- Must exclude: implementation details, file paths, specific technologies (unless essential)
- Format: Plain language, no bullet points (forces flow and coherence)

**Example — Good Compression:**
```
This authentication system validates JWTs from a header, extracts user claims,
and attaches them to the request context. It handles token expiration by
returning 401s and refreshes tokens via a separate endpoint. The core
complexity is in key rotation — new keys must be accepted before old ones
are revoked to prevent outages.
```

**Example — Bad Compression (too much detail):**
```
The auth system uses the jsonwebtoken library version 9.0.2. It reads the
Authorization header from req.headers. The validateJWT function is in
/src/middleware/auth.ts. It calls jwt.verify with the secret from env. 
If it fails, it returns 401. There's also a refresh endpoint at /auth/refresh
that uses the refresh token cookie. Key rotation is handled by the keyManager
class which has methods for addKey and revokeKey...
```

**Example — Bad Compression (too vague):**
```
This system handles authentication and security stuff. It validates tokens
and manages users. There are some edge cases with keys.
```

---

### Phase 3: Decompression Test

Given only the compressed summary, attempt to reconstruct key details.

**Test:**
```yaml
decompression_test:
  original_system: "The codebase you explored"
  compressed_summary: "Your 10-sentence summary"
  
  reconstruction_attempts:
    - question: "What are the inputs to the system?"
      answer_from_summary: "JWT from Authorization header"
      verify_against_original: true
      
    - question: "What happens on token expiration?"
      answer_from_summary: "Returns 401, uses separate refresh endpoint"
      verify_against_original: true
      
    - question: "What's the core complexity?"
      answer_from_summary: "Key rotation requiring overlap period"
      verify_against_original: true
      
    - question: "What would break this system?"
      answer_from_summary: "Revoking old key before new one accepted, or clock skew"
      verify_against_original: true
      
  reconstruction_accuracy: 0.85  # % of questions answered correctly
```

**Exit condition:** Reconstruction accuracy ≥ 80% or identify gaps.

---

### Phase 4: Gap Analysis

If reconstruction accuracy < 80%, analyze what's missing.

```yaml
gap_analysis:
  failed_reconstructions:
    - question: "How are keys distributed to validators?"
      why_failed: "Not mentioned in compression — assumed it was detail"
      actually_essential: true
      insight: "Key distribution is core architecture, not implementation detail"
      
  compression_errors:
    - type: "omitted_essential"
      description: "Key distribution mechanism"
      fix: "Include in compression: 'Keys distributed via signed URL with 5-min TTL'"
      
    - type: "included_noise"
      description: "Mentioned specific library versions"
      fix: "Remove versions, keep 'uses JWT standard'"
      
  understanding_assessment:
    level: "partial"  # partial | surface | deep
    blind_spots: ["Key distribution", "Failure mode: clock skew"]
    needs_re_exploration: true
```

---

### Phase 5: Re-Compression (if needed)

If gaps found, re-explore and compress again.

**Iteration:**
```
Explore → Compress → Test → Gaps? → Re-explore → Compress → Test → Pass
```

**Success criteria:**
- Reconstruction accuracy ≥ 80%
- No essential components omitted
- No noise included
- Can answer "what would break this?" from summary alone

---

## Example: Full Workflow

### System: Complex E-commerce Checkout

**Phase 1: Exploration**
- Read 15 files
- Traced payment flow, inventory flow, notification flow
- Identified 6 edge cases
- Took detailed notes

**Phase 2: Compression**
```
The checkout system reserves inventory before payment to prevent overselling,
processes payment via third-party gateway, and confirms orders only after
both succeed. It handles partial failures by releasing inventory if payment
fails, and queuing retry if payment succeeds but confirmation fails. The
critical complexity is maintaining consistency across inventory, payment,
and notification systems during distributed failures.
```

**Phase 3: Decompression Test**
```yaml
questions:
  - "What's the order of operations?"
    answer: "Reserve inventory → Process payment → Confirm order"
    correct: true
    
  - "What happens if payment fails?"
    answer: "Release inventory"
    correct: true
    
  - "What happens if payment succeeds but confirmation fails?"
    answer: "Queue retry"
    correct: true
    
  - "What prevents overselling?"
    answer: "Inventory reservation before payment"
    correct: true
    
  - "What's the core complexity?"
    answer: "Consistency across distributed systems during failures"
    correct: true
    
  - "How are notifications sent?"
    answer: "...not in summary"
    correct: false  # Gap identified
    
reconstruction_accuracy: 83%  # 5/6 correct
```

**Phase 4: Gap Analysis**
```yaml
gap: "Notification flow not mentioned"
assessment: "Notifications are async, not critical path — acceptable omission"
action: "No re-compression needed, but add to mental model"
```

**Phase 5: Resolution**
```yaml
final_assessment:
  understanding_level: "deep"
  compression_quality: "good"
  verified_understanding: true
  
compressed_summary_can_be_used_for:
  - "Explaining system to new team member"
  - "Architecture decision context"
  - "Identifying where changes would have impact"
```

---

## Compression Quality Rubric

| Aspect | Excellent | Good | Poor |
|--------|-----------|------|------|
| **Brevity** | <100 words, captures essence | 100-200 words, minor noise | >200 words or too vague |
| **Accuracy** | 90%+ reconstruction | 80-90% reconstruction | <80% reconstruction |
| **Essence** | Identifies core complexity | Mentions key flows | Just lists components |
| **Independence** | Stands alone without context | Needs minimal context | Requires original docs |

---

## Anti-Patterns

**Don't:**
- Include file paths or line numbers (implementation, not essence)
- Use bullet points (hides flow and relationships)
- Skip the decompression test (unverified compression is worthless)
- Accept <80% reconstruction (indicates shallow understanding)

**Do:**
- Focus on "what would break this?" as the key test
- Iterate when gaps found
- Use the compressed form for actual communication (docs, handoffs)
- Compare your compression to others' (calibration)

---

## Integration

- Use **after** exploring a codebase, before modifying it
- Use **before** `thought-retriever` to store compressed essence, not raw notes
- Use **with** `metacognitive-monitoring` to assess confidence in compression

---

## See Also

- Kolmogorov complexity theory
- Minimum Description Length (MDL) principle
- `feynman-technique` — similar "explain simply" approach
- `how-to-solve-it-state-machine` — for structured problem-solving
