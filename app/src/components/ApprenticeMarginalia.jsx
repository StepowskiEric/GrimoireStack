import { useState } from 'react';

export default function ApprenticeMarginalia() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="marginalia-wrapper">
      <button
        type="button"
        className={`marginalia-trigger${expanded ? ' expanded' : ''}`}
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse note' : 'Expand note: What is a skill?'}
      >
        <span className="marginalia-icon" aria-hidden="true">✦</span>
        <span className="marginalia-trigger-text">
          {expanded ? 'The Apprentice\'s Note (click to fold)' : 'What is a skill? — An apprentice\'s note'}
        </span>
        <span className="marginalia-chevron" aria-hidden="true">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="marginalia-content">
          <p>
            An <strong>agent skill</strong> is a reusable instruction set — like a spell — that guides
            an AI agent (such as Claude, Codex, or Copilot) to perform a specific task with
            discipline and consistency.
          </p>
          <p>
            Each skill in this grimoire is a structured prompt or workflow, organized by school
            (topic) and spell (specific technique). You invoke them through your agent's skill
            system — often via the command line or an MCP server.
          </p>
          <p>
            <em>Think of it as a cookbook for AI behavior:</em> instead of asking "help me debug this,"
            you cast <strong>Trace Sight</strong> — a proven methodology that maps stack traces to
            source code and suggests the most likely fix.
          </p>
          <div className="marginalia-footer">
            <span className="marginalia-rune" aria-hidden="true">ᚦ</span>
            <span>Folded by the Archivist</span>
          </div>
        </div>
      )}
    </div>
  );
}
