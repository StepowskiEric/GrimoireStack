import { useState, useCallback, useRef } from 'react';
import { pageCreak } from '../audio/sounds.js';
import { REPO_URL } from '../data/constants.js';

const PRIMARY_AGENT = 'claude';
const AGENTS = [
  { id: 'codex', label: 'Codex', desc: '~/.agents/skills/' },
  { id: 'copilot', label: 'VS Code Copilot', desc: '~/.copilot/skills/' },
  { id: 'hermes', label: 'Hermes', desc: '~/.hermes/skills/' },
  { id: 'claude', label: 'Claude Code', desc: '~/.claude/skills/' },
  { id: 'antigravity', label: 'Antigravity', desc: '~/.antigravity/skills/' },
  { id: 'factory-droid', label: 'Factory Droid', desc: '~/.factory/skills/ (manual)' },
];

function CopyButton({ value, label = 'Copy', copiedLabel = '✦ Inscribed', onCopied, className = 'copy-btn' }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const handleCopy = useCallback(async () => {
    const showCopied = () => {
      setCopied(true);
      onCopied?.();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    };
    try {
      await navigator.clipboard.writeText(value);
      showCopied();
    } catch (e) {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      document.body.removeChild(ta);
      if (ok) showCopied();
    }
  }, [value, onCopied]);

  return (
    <button
      type="button"
      className={`${className}${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

export default function RitualSection() {
  const [summoned, setSummoned] = useState(false);
  const toastTimerRef = useRef(null);

  const handleSummon = useCallback(() => {
    setSummoned(true);
    pageCreak();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setSummoned(false), 2200);
  }, []);

  return (
    <div className="ritual-section active" id="school-ritual">
      <div className="ritual-header">
        <span className="ritual-sigil" aria-hidden="true">⛧</span>
        <h2>Ritual of Summoning</h2>
        <p className="ritual-sub">
          To bind these incantations to your own workshop, inscribe them into your agent's
          grimoire. The following rites summon the full collection or any single spell.
        </p>
      </div>

      {/* Primary seal — GitHub */}
      <a
        className="ritual-seal"
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the GrimoireStack repository on GitHub"
      >
        <span className="ritual-seal-rune" aria-hidden="true">⟐</span>
        <span className="ritual-seal-text">
          <span className="ritual-seal-eyebrow">✦ The Source ✦</span>
          <span className="ritual-seal-title">github.com/StepowskiEric/GrimoireStack</span>
          <span className="ritual-seal-hint">Browse the source, open issues, contribute spells →</span>
        </span>
      </a>

      {/* Primary incantation — bulk install */}
      <div className="ritual-block">
        <div className="ritual-block-title">✦ The Primary Incantation</div>
        <p className="ritual-block-desc">
          Summon every incantation in the grimoire. The picker will guide you through agent and spell selection.
        </p>
        <div className="ritual-cmd-row">
          <code className="ritual-cmd">npx jerry-skills install</code>
          <CopyButton
            value="npx jerry-skills install"
            label="✦ Inscribe"
            copiedLabel="✦ Inscribed"
            onCopied={handleSummon}
          />
        </div>
      </div>

      {/* Codex of agents */}
      <div className="ritual-block">
        <div className="ritual-block-title">✦ Codex of Agents</div>
        <p className="ritual-block-desc">
          Each agent receives a different folder format. Choose yours and inscribe the whole collection.
        </p>
        <div className="ritual-agent-grid">
          {AGENTS.map(agent => (
            <div key={agent.id} className="ritual-agent-card">
              <div className="ritual-agent-head">
                <span className="ritual-agent-name">{agent.label}</span>
                <span className="ritual-agent-path">{agent.desc}</span>
              </div>
              <div className="ritual-cmd-row ritual-cmd-row-mini">
                <code className="ritual-cmd ritual-cmd-mini">npx jerry-skills install --agent {agent.id}</code>
                <CopyButton
                  value={`npx jerry-skills install --agent ${agent.id}`}
                  label="✦"
                  copiedLabel="✦"
                  className="copy-btn copy-btn-mini"
                  onCopied={handleSummon}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-skill inscribing */}
      <div className="ritual-block">
        <div className="ritual-block-title">✦ Single-Spell Inscription</div>
        <p className="ritual-block-desc">
          For when you only need one incantation. Repeat the <code className="inline-code">--skill</code> flag to inscribe several at once.
        </p>
        <div className="ritual-cmd-row">
          <code className="ritual-cmd">npx jerry-skills install --agent {PRIMARY_AGENT} --skill checklist-manifesto</code>
          <CopyButton
            value={`npx jerry-skills install --agent ${PRIMARY_AGENT} --skill checklist-manifesto`}
            label="✦ Inscribe"
            copiedLabel="✦ Inscribed"
            onCopied={handleSummon}
          />
        </div>
        <div className="ritual-hint">
          Partial names work too: <code className="inline-code">--skill "six-thinking"</code> finds
          <em> six-thinking-hats</em>.
        </div>
      </div>

      {/* Reference format */}
      <div className="ritual-block ritual-block-muted">
        <div className="ritual-block-title">✦ The Grimoire Reference</div>
        <p className="ritual-block-desc">
          Each spell card in this tome bears a reference in the form:
        </p>
        <div className="ritual-ref">
          <code>〈 grimoirestack:&lt;topic&gt;/&lt;spell-name&gt; 〉</code>
        </div>
        <p className="ritual-block-desc ritual-block-desc-tight">
          The <code className="inline-code">&lt;spell-name&gt;</code> is what you pass to
          <code className="inline-code"> --skill</code>. The <code className="inline-code">&lt;topic&gt;</code> is the
          school of magic (debugging, reasoning, architecture, and so on) — useful as a filter in your own notes.
        </p>
      </div>

      {/* Companion tooling */}
      <div className="ritual-block">
        <div className="ritual-block-title">✦ Companion Tooling</div>
        <p className="ritual-block-desc">
          Two optional companions ship alongside the incantations:
        </p>
        <div className="ritual-cmd-row ritual-cmd-row-mini">
          <code className="ritual-cmd ritual-cmd-mini">npx jerry-skills install --with-scripts --with-mcp</code>
          <CopyButton
            value="npx jerry-skills install --with-scripts --with-mcp"
            label="✦"
            copiedLabel="✦"
            className="copy-btn copy-btn-mini"
            onCopied={handleSummon}
          />
        </div>
        <ul className="ritual-list">
          <li><strong>Companion scripts</strong> — stdlib-only Python helpers (e.g. <code className="inline-code">lint_battalion.py</code>, <code className="inline-code">git_surgery.py</code>) shipped with specific skills.</li>
          <li><strong>MCP servers</strong> — stdio JSON-RPC servers in <code className="inline-code">mcp-servers/</code> for code-graph navigation and unified lint/test diagnostics.</li>
        </ul>
      </div>

      {summoned ? (
        <div className="ritual-toast" role="status" aria-live="polite">
          ✦ The incantation has been inscribed. Paste it into your terminal to summon.
        </div>
      ) : null}
    </div>
  );
}
