import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { TIER_META, getSpellTier } from '../data/tiers.js';
import { spellCatalog } from '../data/spellCatalogInstance.js';
import { buildShareUrl } from '../utils/urlSpellSync.js';

function findSpell(name) {
  const entry = spellCatalog.resolveByName(name);
  return entry ? { spell: entry.spell, school: entry.school } : null;
}

let mapCache = null;
const mdCache = new Map();

async function fetchSkillMap() {
  if (mapCache) return mapCache;
  try {
    const res = await fetch('/skills/_map.json');
    if (!res.ok) throw new Error('Not found');
    mapCache = await res.json();
    return mapCache;
  } catch {
    mapCache = {};
    return mapCache;
  }
}

async function fetchSkillMd(skillId) {
  if (mdCache.has(skillId)) return mdCache.get(skillId);
  const map = await fetchSkillMap();
  const path = map[skillId];
  if (!path) {
    mdCache.set(skillId, '');
    return '';
  }
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Not found');
    const text = await res.text();
    mdCache.set(skillId, text);
    return text;
  } catch {
    mdCache.set(skillId, '');
    return '';
  }
}

function parseTables(html) {
  const lines = html.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (l.startsWith('|') && l.endsWith('|')) {
          tableLines.push(l);
          i++;
        } else {
          break;
        }
      }
      if (tableLines.length >= 2) {
        const sep = tableLines[1].slice(1, -1);
        const isSep = sep.split('|').every(c => /^[-:\s]+$/.test(c.trim()));
        if (isSep) {
          const headers = tableLines[0].slice(1, -1).split('|').map(h => h.trim());
          const bodyRows = tableLines.slice(2).map(row => row.slice(1, -1).split('|').map(c => c.trim()));
          const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
          const tbody = `<tbody>${bodyRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
          out.push(`<table class="md-table">${thead}${tbody}</table>`);
        } else {
          tableLines.forEach(l => out.push(l));
        }
      } else {
        tableLines.forEach(l => out.push(l));
      }
    } else {
      out.push(lines[i]);
      i++;
    }
  }
  return out.join('\n');
}

function wrapLists(html) {
  const lines = html.split('\n');
  const out = [];
  let inList = false;
  let listType = 'ul';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('<li')) {
      if (!inList) {
        inList = true;
        listType = line.includes('class="check-item"') ? 'ul' : 'ul';
        out.push(`<${listType}>`);
      }
      out.push(line);
    } else {
      if (inList) {
        inList = false;
        out.push(`</${listType}>`);
      }
      out.push(line);
    }
  }
  if (inList) out.push(`</${listType}>`);
  return out.join('\n');
}

function simpleMarkdownToHtml(md) {
  const text = md.replace(/\r\n/g, '\n');

  // Phase 1: Extract fenced code blocks to placeholders
  const codeBlocks = [];
  let html = text.replace(/```[\s\S]*?```/g, (m) => {
    const content = m.slice(3, -3).replace(/^\w+\n/, '');
    codeBlocks.push(`<pre><code>${escapeHtml(content)}</code></pre>`);
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
  });

  // Phase 2: Block-level elements
  // Tables
  html = parseTables(html);
  // Blockquotes
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>');
  // Headers
  html = html.replace(/^#{1,6}\s+(.*)$/gm, (m, t) => {
    const level = m.match(/^#+/)[0].length;
    return `<h${level}>${t}</h${level}>`;
  });
  // Horizontal rule
  html = html.replace(/^---\s*$/gm, '<hr />');
  // Unordered lists
  html = html.replace(/^(\s*)-\s+(.*)$/gm, (m, indent, txt) => {
    const depth = Math.floor(indent.length / 2);
    return `<li data-depth="${depth}">${txt}</li>`;
  });
  // Ordered lists
  html = html.replace(/^(\s*)\d+\.\s+(.*)$/gm, (m, indent, txt) => {
    const depth = Math.floor(indent.length / 2);
    return `<li data-depth="${depth}">${txt}</li>`;
  });
  // Checkboxes
  html = html.replace(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/gm, (m, indent, checked, txt) => {
    const isChecked = checked.toLowerCase() === 'x';
    return `<li class="check-item"><span class="check-box${isChecked ? ' checked' : ''}"></span>${txt}</li>`;
  });
  // Wrap consecutive list items
  html = wrapLists(html);
  // Paragraphs for remaining non-tag lines
  html = html.split('\n').map(l => {
    const t = l.trim();
    if (!t) return '<br />';
    if (t.startsWith('<') && !t.startsWith('<br')) return l;
    return `<p>${t}</p>`;
  }).join('\n');

  // Phase 3: Inline elements
  // Strikethrough
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Phase 4: Restore code blocks
  html = html.replace(/___CODE_BLOCK_(\d+)___/g, (_, i) => codeBlocks[+i]);

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const INSCRIBE_AGENTS = [
  { id: 'claude', label: 'Claude Code', prefix: 'npx jerry-skills install --agent claude' },
  { id: 'codex', label: 'OpenAI Codex', prefix: 'npx jerry-skills install --agent codex' },
  { id: 'copilot', label: 'VS Code Copilot', prefix: 'npx jerry-skills install --agent copilot' },
  { id: 'hermes', label: 'Hermes', prefix: 'npx jerry-skills install --agent hermes' },
  { id: 'antigravity', label: 'Antigravity', prefix: 'npx jerry-skills install --agent antigravity' },
  { id: 'factory-droid', label: 'Factory Droid', prefix: 'Copy skill to ~/.factory/skills/' },
];

export default function SpellModal({ spell, school, onClose, marginalia, getVote, castVote, aggregateFor }) {
  // Stable per-day timestamp so the metadata line doesn't flicker on re-render
  const firstSeen = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const [viewMode, setViewMode] = useState('plain'); // 'plain' | 'full'
  const [mdContent, setMdContent] = useState(null);
  const [mdLoading, setMdLoading] = useState(false);
  const [inscribeAgent, setInscribeAgent] = useState('claude');
  const [note, setNote] = useState(marginalia?.getNote(spell?.skill) || '');
  const [noteStatus, setNoteStatus] = useState('');
  const noteTimerRef = useRef(null);

  const statusStr = spell?.status && spell?.status !== '—' ? spell?.status : 'Common';
  const statusClass = (spell?.status || 'common').toLowerCase().replace(/[^a-z]/g, '') || 'common';
  const { label, className: tierClass, title: tierTitle } = TIER_META[getSpellTier(spell || { skill: '' })];
  const modalRef = useRef(null);

  const loadMd = useCallback(async () => {
    if (!spell) return;
    if (mdContent !== null || mdLoading) return;
    setMdLoading(true);
    const text = await fetchSkillMd(spell.skill);
    if (text) {
      const html = await simpleMarkdownToHtml(text);
      setMdContent(html);
    } else {
      setMdContent('');
    }
    setMdLoading(false);
  }, [spell, mdContent, mdLoading]);

  useEffect(() => {
    if (viewMode === 'full' && mdContent === null && !mdLoading) {
      loadMd();
    }
  }, [viewMode, mdContent, mdLoading, loadMd]);

  useEffect(() => {
    if (!spell) return;
    // Reset when spell changes: default to 'full' if a markdown entry exists
    setMdContent(null);
    setMdLoading(false);
    setNote(marginalia?.getNote(spell.skill) || '');
    setNoteStatus('');
    fetchSkillMap().then(map => {
      if (map[spell.skill]) {
        setViewMode('full');
        // loadMd will be triggered by the viewMode effect below
      } else {
        setViewMode('plain');
      }
    });
  }, [spell, spell?.skill, marginalia]);

  useEffect(() => () => {
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
  }, []);

  const handleNoteChange = (e) => {
    if (!spell) return;
    const value = e.target.value;
    setNote(value);
    setNoteStatus('saving…');
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      marginalia?.setNote(spell.skill, value);
      setNoteStatus('saved');
      noteTimerRef.current = setTimeout(() => setNoteStatus(''), 1400);
    }, 350);
  };

  const handleClearNote = () => {
    if (!spell) return;
    setNote('');
    marginalia?.clear(spell.skill);
    setNoteStatus('cleared');
    setTimeout(() => setNoteStatus(''), 1400);
  };

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose, viewMode, mdContent, spell]);

  const hasFullEntry = useRef(false);
  useEffect(() => {
    if (!spell) return;
    fetchSkillMap().then(map => {
      hasFullEntry.current = !!map[spell.skill];
    });
  }, [spell, spell?.skill]);

  if (!spell) return null;

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Background peering eyes — drift + occasional blink, decorative */}
      {/* eslint-disable-next-line react/no-array-index-key */}
      <div className="modal-bg-eyes" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={`modal-bg-eye modal-bg-eye--${i + 1}`}>
            <svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="12" rx="18" ry="10" fill="#0a0a0a" stroke="rgba(196,184,152,0.18)" strokeWidth="0.6" />
              <ellipse cx="20" cy="12" rx="11" ry="8" fill="rgba(138,154,106,0.35)" />
              <ellipse cx="20" cy="12" rx="4.5" ry="3.2" fill="#020203" />
              <ellipse cx="20" cy="12" rx="1.2" ry="1.2" fill="rgba(196,184,152,0.45)" />
            </svg>
          </span>
        ))}
      </div>

      <div className="modal modal-wide" ref={modalRef} role="dialog" aria-modal="true" aria-label={`${spell.name} spell details`}>
        {/* Corner tentacle claws — tapered, multi-curved, with prominent
            suckers, dorsal spines, and a grasping hook at the tip. */}
        {['tl', 'tr', 'bl', 'br'].map((corner) => {
          const mirror = corner === 'tr' ? 'translate(160,0) scale(-1,1)'
            : corner === 'bl' ? 'translate(0,160) scale(1,-1)'
            : corner === 'br' ? 'translate(160,160) scale(-1,-1)'
            : null;
          return (
            <svg key={corner} className={`modal-tentacle modal-tentacle--${corner}`} viewBox="0 0 160 160" aria-hidden="true">
              <g transform={mirror || undefined}>
                {/* Secondary smaller tendril — behind main, doesn't curl */}
                <path d="M 0 55 C 14 62, 30 78, 38 98 C 44 116, 38 134, 24 138"
                  fill="none" stroke="rgba(8,8,6,0.85)" strokeWidth="7" strokeLinecap="round" />
                <path d="M 0 55 C 14 62, 30 78, 38 98 C 44 116, 38 134, 24 138"
                  fill="none" stroke="rgba(30,34,22,0.7)" strokeWidth="3" strokeLinecap="round" />
                {/* Small suckers on the secondary tendril */}
                <circle cx="22" cy="74" r="2.2" fill="rgba(180,200,130,0.4)" stroke="rgba(8,8,6,0.9)" strokeWidth="0.6" />
                <circle cx="34" cy="98" r="1.8" fill="rgba(180,200,130,0.4)" stroke="rgba(8,8,6,0.9)" strokeWidth="0.6" />
                <circle cx="36" cy="122" r="1.4" fill="rgba(180,200,130,0.4)" stroke="rgba(8,8,6,0.9)" strokeWidth="0.6" />

                {/* Dorsal spines — small triangular spikes along the outer edge
                    of the main tentacle. Reads as "predatory" not "plant". */}
                <g className="t-spines" fill="rgba(38,44,22,0.95)" stroke="rgba(6,6,4,0.9)" strokeWidth="0.5" strokeLinejoin="round">
                  <path d="M 30 4 L 38 -5 L 44 10 Z" />
                  <path d="M 56 14 L 68 4 L 78 28 Z" />
                  <path d="M 84 32 L 100 22 L 110 50 Z" />
                  <path d="M 108 56 L 124 48 L 132 72 Z" />
                  <path d="M 122 86 L 138 80 L 138 102 Z" />
                </g>

                {/* Main tentacle — 5 layered strokes for organic taper */}
                <path d="M 0 0 C 30 6, 60 18, 85 40 C 110 62, 125 90, 118 115 C 110 138, 85 145, 70 130 C 58 118, 65 100, 82 98 C 100 98, 112 112, 105 130"
                  fill="none" stroke="rgba(4,4,3,0.98)" strokeWidth="24" strokeLinecap="round" />
                <path d="M 0 0 C 30 6, 60 18, 85 40 C 110 62, 125 90, 118 115 C 110 138, 85 145, 70 130 C 58 118, 65 100, 82 98 C 100 98, 112 112, 105 130"
                  fill="none" stroke="rgba(18,20,14,0.95)" strokeWidth="17" strokeLinecap="round" />
                <path d="M 0 0 C 30 6, 60 18, 85 40 C 110 62, 125 90, 118 115 C 110 138, 85 145, 70 130 C 58 118, 65 100, 82 98 C 100 98, 112 112, 105 130"
                  fill="none" stroke="rgba(32,38,24,0.95)" strokeWidth="11" strokeLinecap="round" />
                <path d="M 0 0 C 30 6, 60 18, 85 40 C 110 62, 125 90, 118 115 C 110 138, 85 145, 70 130 C 58 118, 65 100, 82 98 C 100 98, 112 112, 105 130"
                  fill="none" stroke="rgba(60,70,42,0.9)" strokeWidth="5" strokeLinecap="round" />
                <path d="M 0 0 C 30 6, 60 18, 85 40 C 110 62, 125 90, 118 115"
                  fill="none" stroke="rgba(110,130,70,0.55)" strokeWidth="1.6" strokeLinecap="round" />

                {/* Suckers along the underside — concentric rings: dark outer
                    rim, pale sickly flesh, dark center hole. Clearly anatomical. */}
                <g className="t-suckers">
                  <g transform="translate(48 18) rotate(22)">
                    <ellipse rx="7" ry="4.4" fill="rgba(10,8,6,0.95)" />
                    <ellipse rx="6" ry="3.6" fill="rgba(170,190,120,0.32)" />
                    <ellipse rx="4.4" ry="2.6" fill="rgba(210,225,165,0.62)" />
                    <ellipse rx="1.8" ry="1.1" fill="rgba(8,8,6,0.95)" />
                    <ellipse cx="-1.2" cy="-0.7" rx="1" ry="0.6" fill="rgba(240,245,200,0.5)" />
                  </g>
                  <g transform="translate(82 42) rotate(45)">
                    <ellipse rx="6.5" ry="4" fill="rgba(10,8,6,0.95)" />
                    <ellipse rx="5.5" ry="3.2" fill="rgba(170,190,120,0.32)" />
                    <ellipse rx="4" ry="2.3" fill="rgba(210,225,165,0.62)" />
                    <ellipse rx="1.6" ry="0.95" fill="rgba(8,8,6,0.95)" />
                    <ellipse cx="-1" cy="-0.6" rx="0.9" ry="0.55" fill="rgba(240,245,200,0.5)" />
                  </g>
                  <g transform="translate(110 72) rotate(65)">
                    <ellipse rx="5.6" ry="3.5" fill="rgba(10,8,6,0.95)" />
                    <ellipse rx="4.7" ry="2.8" fill="rgba(170,190,120,0.32)" />
                    <ellipse rx="3.4" ry="2" fill="rgba(210,225,165,0.6)" />
                    <ellipse rx="1.4" ry="0.85" fill="rgba(8,8,6,0.95)" />
                    <ellipse cx="-0.9" cy="-0.5" rx="0.8" ry="0.5" fill="rgba(240,245,200,0.5)" />
                  </g>
                  <g transform="translate(115 102) rotate(90)">
                    <ellipse rx="4.6" ry="2.9" fill="rgba(10,8,6,0.95)" />
                    <ellipse rx="3.8" ry="2.3" fill="rgba(170,190,120,0.32)" />
                    <ellipse rx="2.7" ry="1.6" fill="rgba(210,225,165,0.6)" />
                    <ellipse rx="1.1" ry="0.7" fill="rgba(8,8,6,0.95)" />
                  </g>
                  <g transform="translate(96 128) rotate(115)">
                    <ellipse rx="3.6" ry="2.3" fill="rgba(10,8,6,0.95)" />
                    <ellipse rx="3" ry="1.8" fill="rgba(170,190,120,0.32)" />
                    <ellipse rx="2.1" ry="1.3" fill="rgba(210,225,165,0.6)" />
                    <ellipse rx="0.9" ry="0.55" fill="rgba(8,8,6,0.95)" />
                  </g>
                  <g transform="translate(78 132) rotate(135)">
                    <ellipse rx="2.6" ry="1.7" fill="rgba(10,8,6,0.95)" />
                    <ellipse rx="2.1" ry="1.3" fill="rgba(170,190,120,0.32)" />
                    <ellipse rx="1.4" ry="0.9" fill="rgba(210,225,165,0.6)" />
                    <ellipse rx="0.6" ry="0.4" fill="rgba(8,8,6,0.95)" />
                  </g>
                </g>

                {/* Grasping hook at the tip — small curved claw */}
                <path d="M 102 128 C 112 130, 122 138, 120 150 C 118 158, 108 160, 102 154 C 96 148, 100 138, 108 136"
                  fill="rgba(8,8,6,0.95)" stroke="rgba(4,4,3,1)" strokeWidth="0.8" />
                <path d="M 102 128 C 112 130, 122 138, 120 150"
                  fill="none" stroke="rgba(120,140,80,0.4)" strokeWidth="0.8" />
              </g>
            </svg>
          );
        })}

        <button type="button" className="modal-close" onClick={onClose} aria-label="Close spell details">✕</button>

        {/* Eldritch whisper — Cthulhu-mythos preamble at the top of the scroll */}
        <p className="modal-whisper">
          <em>“That is not dead which can eternal lie, and with strange aeons even death may die.”</em>
        </p>

        {/* Tentacle-carved title — symbol gripped by small tendrils */}
        <div className="modal-title-carved">
          <svg className="modal-tendril modal-tendril--l" viewBox="0 0 40 60" aria-hidden="true">
            <path d="M 40 0 C 28 12, 22 24, 26 36 C 28 44, 34 50, 38 56 C 40 58, 40 60, 40 60"
              fill="none" stroke="rgba(40,48,28,0.85)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 40 0 C 28 12, 22 24, 26 36 C 28 44, 34 50, 38 56"
              fill="none" stroke="rgba(20,22,18,0.6)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="modal-symbol">{school.symbol}</span>
          <svg className="modal-tendril modal-tendril--r" viewBox="0 0 40 60" aria-hidden="true">
            <path d="M 0 0 C 12 12, 18 24, 14 36 C 12 44, 6 50, 2 56 C 0 58, 0 60, 0 60"
              fill="none" stroke="rgba(40,48,28,0.85)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 0 0 C 12 12, 18 24, 14 36 C 12 44, 6 50, 2 56"
              fill="none" stroke="rgba(20,22,18,0.6)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="modal-school">
          {school.name} <span className="modal-school-real">({school.real})</span>
        </div>
        <div className="modal-title">{spell.name}</div>
        <div className="modal-incantation">〈 {spell.skill} 〉</div>
        <div className="modal-metadata">
          Inscribed by the Scribe of the Unseen · First seen in the depths on {firstSeen}
        </div>

        {/* View mode toggle */}
        <div className="modal-view-toggle">
          <button
            type="button"
            className={viewMode === 'plain' ? 'active' : ''}
            onClick={() => setViewMode('plain')}
            aria-pressed={viewMode === 'plain'}
          >
            ✦ Plain English
          </button>
          <button
            type="button"
            className={viewMode === 'full' ? 'active' : ''}
            onClick={() => setViewMode('full')}
            aria-pressed={viewMode === 'full'}
          >
            ✦ Full Grimoire Entry
          </button>
        </div>

        {viewMode === 'plain' ? (
          <>
            {spell.note ? (
              <div className="modal-detail-row modal-note" style={{ display: 'flex' }}>
                <div className="modal-detail-label">Note</div>
                <div className="modal-detail-value">{spell.note}</div>
              </div>
            ) : null}

            <div className="modal-section-title">✦ Effect</div>
            <div className="modal-effect">{spell.effect}</div>
            <div className="modal-detail-row">
              <div className="modal-detail-label">Status</div>
              <div className="modal-detail-value">
                <span className={`tag ${statusClass}`}>{statusStr}</span>
              </div>
            </div>
            <div className="modal-detail-row">
              <div className="modal-detail-label">Arcane Tier</div>
              <div className="modal-detail-value">
                <span className={`sigil-tier ${tierClass}`} title={tierTitle}>
                  <span className="sigil-mark" aria-hidden="true">⟐</span>
                  <span className="sigil-label">{label}</span>
                </span>
              </div>
            </div>
            <div className="modal-detail-row">
              <div className="modal-detail-label">Skill Path</div>
              <div className="modal-detail-value">{spell.skill}</div>
            </div>

            {spell.combos?.length > 0 ? (
              <div className="modal-synergies">
                <div className="syn-title">✦ Synergistic Pairings</div>
                <div className="syn-grid">
                  {spell.combos.map(comboName => {
                    const found = findSpell(comboName);
                    return (
                      <span key={comboName} className="syn-chip"
                        onClick={() => found && onClose(found.spell, found.school)}
                        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && found) onClose(found.spell, found.school); }}
                        role="button"
                        tabIndex={0}
                        title={found ? `Open ${comboName}` : ''}>
                        ✦ {comboName}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="marginalia-section">
              <div className="marginalia-header">
                <span className="marginalia-title">✎ Apprentice Marginalia</span>
                {note ? (
                  <button type="button" className="marginalia-clear" onClick={handleClearNote}>
                    ✕ Erase
                  </button>
                ) : null}
              </div>
              <textarea
                className="marginalia-textarea"
                value={note}
                onChange={handleNoteChange}
                placeholder="Scribe your own notes here. They stay on this device."
                aria-label="Personal notes for this spell"
                spellCheck="false"
              />
              <div className="marginalia-status" aria-live="polite">{noteStatus}</div>
            </div>

            {getVote && aggregateFor ? (() => {
              const userVote = getVote(spell.skill);
              const agg = aggregateFor(spell);
              return (
                <div className="signal-section" aria-label="Community signal">
                  <div className="signal-row">
                    <span className="signal-question">Did this help?</span>
                    <div className="signal-buttons">
                      <button
                        type="button"
                        className={`signal-btn signal-up${userVote === 'up' ? ' active' : ''}`}
                        onClick={() => castVote?.(spell.skill, 'up')}
                        aria-label="This spell helped me"
                        title="This helped"
                      >
                        <span aria-hidden="true">▲</span>
                        <span className="signal-count">{agg.up}</span>
                      </button>
                      <button
                        type="button"
                        className={`signal-btn signal-down${userVote === 'down' ? ' active' : ''}`}
                        onClick={() => castVote?.(spell.skill, 'down')}
                        aria-label="This spell did not help"
                        title="Did not help"
                      >
                        <span aria-hidden="true">▼</span>
                        <span className="signal-count">{agg.down}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })() : null}
          </>
        ) : (
          <div className="modal-full-entry">
            {mdLoading ? (
              <div className="modal-md-loading">
                <span className="md-loading-rune">⟐</span>
                <span>Unfurling the scroll...</span>
              </div>
            ) : mdContent === '' ? (
              <div className="modal-md-empty">
                <p>No full grimoire entry found for this incantation.</p>
                <p className="modal-md-empty-hint">The scroll may still be in the scribe's hands.</p>
              </div>
            ) : (
              // eslint-disable-next-line react/no-danger
              <div className="modal-md-content" dangerouslySetInnerHTML={{ __html: mdContent }} />
            )}
          </div>
        )}

        <div className="modal-grimoire-ref">
          <code>〈 grimoirestack:{school.id}/{spell.skill} 〉</code>
        </div>

        <p className="modal-warning">Speak not of this to those who sleep.</p>

        <div className="modal-actions">
          <button type="button" className="modal-share modal-share-half modal-goo-btn" onClick={(e) => {
            const url = buildShareUrl(window.location.origin, spell.skill);
            const btn = e.currentTarget;
            const restore = () => { btn.innerHTML = btn.dataset.originalHtml; };
            if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
            if (navigator.share) {
              navigator.share({ title: spell.name, text: spell.effect, url }).catch(() => {});
            } else if (navigator.clipboard) {
              navigator.clipboard.writeText(url).then(() => {
                btn.innerHTML = '✦ Link Copied!';
                btn.classList.add('modal-goo-btn--broken');
                setTimeout(restore, 2000);
              }).catch(() => {
                btn.innerHTML = '✦ Copy failed';
                setTimeout(restore, 2000);
              });
            }
          }}
          >
            <span className="modal-goo-seal" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" /><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" /><path d="M 12 4 L 13 11 L 20 12 L 13 13 L 12 20 L 11 13 L 4 12 L 11 11 Z" fill="currentColor" opacity="0.6" /></svg>
            </span>
            <span className="modal-goo-label">✦ Share</span>
          </button>
          <div className="modal-inscribe-group">
            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select
              className="modal-inscribe-select"
              value={inscribeAgent}
              onChange={(e) => setInscribeAgent(e.target.value)}
              aria-label="Select target agent"
            >
              {INSCRIBE_AGENTS.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.label}</option>
              ))}
            </select>
            <button type="button" className="modal-share modal-share-half modal-inscribe modal-goo-btn" onClick={(e) => {
              const agent = INSCRIBE_AGENTS.find(a => a.id === inscribeAgent);
              const cmd = agent.id === 'factory-droid'
                ? `Copy ${spell.skill}/SKILL.md into ~/.factory/skills/${spell.skill}/`
                : `${agent.prefix} --skill ${spell.skill}`;
              const btn = e.currentTarget;
              const restore = () => { btn.innerHTML = btn.dataset.originalHtml; btn.classList.remove('modal-goo-btn--broken'); };
              if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
              if (!navigator.clipboard) {
                btn.innerHTML = '✦ Copy unsupported';
                setTimeout(restore, 2000);
                return;
              }
              navigator.clipboard.writeText(cmd).then(() => {
                btn.innerHTML = '✦ Incantation Inscribed';
                btn.classList.add('modal-goo-btn--broken');
                setTimeout(restore, 2000);
              }).catch(() => {
                btn.innerHTML = '✦ Copy failed';
                setTimeout(restore, 2000);
              });
            }}>
              <span className="modal-goo-seal" aria-hidden="true">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" /><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" /><path d="M 12 4 L 13 11 L 20 12 L 13 13 L 12 20 L 11 13 L 4 12 L 11 11 Z" fill="currentColor" opacity="0.6" /></svg>
              </span>
              <span className="modal-goo-label">✦ Inscribe to your Workshop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
