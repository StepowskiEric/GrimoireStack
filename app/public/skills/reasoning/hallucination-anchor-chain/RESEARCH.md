# Research Basis

This skill is informed by research on hallucination prevention and factual verification:

- **Chain-of-Verification (CoVe)** (arXiv:2309.11495, Sep 2023) — Reduces hallucination by generating verification questions for each claim, answering them independently, and identifying inconsistencies. Shows 15-25% reduction in hallucinated facts.
- **Self-Consistency** (arXiv:2203.11171, Mar 2022) — Multiple reasoning paths that agree are more likely to be factual. Use agreement across independent sources as a confidence signal.
- **Grounded Chain-of-Thought** (arXiv:2503.12799, Mar 2025) — Forces reasoning chains to reference specific evidence before making claims. Reduces visual and factual hallucinations in multimodal models.
- **Mitigating Hallucination via RAG** (arXiv:2510.24476, Oct 2025) — Retrieval-augmented generation with grounding reduces hallucination rates by 40-60% across domains.
- **Domain-Grounded Tiered Retrieval** (arXiv:2603.17872, Mar 2026) — Tiered retrieval with domain grounding achieves near-zero hallucination in specialized domains.
- **Self-Verification in LLMs** (arXiv:2506.01369, Jun 2025) — Training LLMs to self-verify their outputs improves factuality by 12-18% without external tools.
