import { useEffect, useRef, useState, useCallback } from 'react';
import { TIER_META, getSpellTier } from '../data/tiers.js';
import { spellCatalog } from '../data/spellCatalogInstance.js';

function findSpell(name) {
  const entry = spellCatalog.resolveByName(name);
  return entry ? { spell: entry.spell, school: entry.school } : null;
}

let mapCache = null;
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
  const map = await fetchSkillMap();
  const path = map[skillId];
  if (!path) return null;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Not found');
    return await res.text();
  } catch {
    return null;
  }
}

function simpleMarkdownToHtml(md) {
  let html = md
    .replace(/\r\n/g, '\n')
    // code blocks
    .replace(/```[\s\S]*?```/g, (m) => {
      const content = m.slice(3, -3).replace(/^\w+\n/, '');
      return `<pre><code>${escapeHtml(content)}</code></pre>`;
    })
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // headers
    .replace(/^#{1,6}\s+(.*)$/gm, (m, t) => {
      const level = m.match(/^#+/)[0].length;
      return `<h${level}>${t}</h${level}>`;
    })
    // bold / italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // horizontal rule
    .replace(/^---\s*$/gm, '<hr />')
    // unordered lists
    .replace(/^(\s*)-\s+(.*)$/gm, (m, indent, text) => {
      const depth = Math.floor(indent.length / 2);
      return `<li data-depth="${depth}">${text}</li>`;
    })
    // ordered lists
    .replace(/^(\s*)\d+\.\s+(.*)$/gm, (m, indent, text) => {
      const depth = Math.floor(indent.length / 2);
      return `<li data-depth="${depth}">${text}</li>`;
    })
    // checkboxes
    .replace(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/gm, (m, indent, checked, text) => {
      const isChecked = checked.toLowerCase() === 'x';
      return `<li class="check-item"><span class="check-box${isChecked ? ' checked' : ''}"></span>${text}</li>`;
    });

  // Wrap consecutive li elements in ul/ol
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
  html = out.join('\n');

  // paragraphs for non-tag lines
  html = html.split('\n').map(l => {
    const t = l.trim();
    if (!t) return '<br />';
    if (t.startsWith('<') && !t.startsWith('<br')) return l;
    return `<p>${t}</p>`;
  }).join('\n');

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function SpellModal({ spell, school, onClose }) {
  if (!spell) return null;

  const [viewMode, setViewMode] = useState('plain'); // 'plain' | 'full'
  const [mdContent, setMdContent] = useState(null);
  const [mdLoading, setMdLoading] = useState(false);

  const statusStr = spell.status && spell.status !== '—' ? spell.status : 'Common';
  const statusClass = (spell.status || 'common').toLowerCase().replace(/[^a-z]/g, '') || 'common';
  const { label, className: tierClass, title: tierTitle } = TIER_META[getSpellTier(spell)];
  const modalRef = useRef(null);

  const loadMd = useCallback(async () => {
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
  }, [spell.skill, mdContent, mdLoading]);

  useEffect(() => {
    if (viewMode === 'full' && mdContent === null && !mdLoading) {
      loadMd();
    }
  }, [viewMode, mdContent, mdLoading, loadMd]);

  useEffect(() => {
    // Reset when spell changes
    setViewMode('plain');
    setMdContent(null);
    setMdLoading(false);
  }, [spell.skill]);

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
  }, [onClose, viewMode, mdContent]);

  const hasFullEntry = useRef(false);
  useEffect(() => {
    fetchSkillMap().then(map => {
      hasFullEntry.current = !!map[spell.skill];
    });
  }, [spell.skill]);

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-wide" ref={modalRef} role="dialog" aria-modal="true" aria-label={`${spell.name} spell details`}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <span className="modal-symbol">{school.symbol}</span>
        <div className="modal-school">
          {school.name} <span className="modal-school-real">({school.real})</span>
        </div>
        <div className="modal-title">{spell.name}</div>
        <div className="modal-incantation">〈 {spell.skill} 〉</div>

        {/* View mode toggle */}
        <div className="modal-view-toggle">
          <button
            className={viewMode === 'plain' ? 'active' : ''}
            onClick={() => setViewMode('plain')}
            aria-pressed={viewMode === 'plain'}
          >
            ✦ Plain English
          </button>
          <button
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
                        title={found ? `Open ${comboName}` : ''}>
                        ✦ {comboName}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}
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
              <div className="modal-md-content" dangerouslySetInnerHTML={{ __html: mdContent }} />
            )}
          </div>
        )}

        <div className="modal-grimoire-ref">
          <code>〈 grimoirestack:{school.id}/{spell.skill} 〉</code>
        </div>

        <div className="modal-actions">
          <button className="modal-share modal-share-half" onClick={(e) => {
            const url = `${window.location.origin}${window.location.pathname}?s=${encodeURIComponent(spell.skill)}`;
            const btn = e.currentTarget;
            const restore = () => { btn.textContent = '✦ Share'; };
            if (navigator.share) {
              navigator.share({ title: spell.name, text: spell.effect, url }).catch(() => {});
            } else if (navigator.clipboard) {
              navigator.clipboard.writeText(url).then(() => {
                btn.textContent = '✦ Link Copied!';
                setTimeout(restore, 2000);
              }).catch(() => {
                btn.textContent = '✦ Copy failed';
                setTimeout(restore, 2000);
              });
            }
          }}>✦ Share</button>
          <button className="modal-share modal-share-half modal-inscribe" onClick={(e) => {
            const cmd = `npx jerry-skills install --agent claude --skill ${spell.skill}`;
            const btn = e.currentTarget;
            const restore = () => { btn.textContent = '✦ Inscribe to your Workshop'; };
            if (!navigator.clipboard) {
              btn.textContent = '✦ Copy unsupported';
              setTimeout(restore, 2000);
              return;
            }
            navigator.clipboard.writeText(cmd).then(() => {
              btn.textContent = '✦ Incantation Inscribed';
              setTimeout(restore, 2000);
            }).catch(() => {
              btn.textContent = '✦ Copy failed';
              setTimeout(restore, 2000);
            });
          }}>✦ Inscribe to your Workshop</button>
        </div>
      </div>
    </div>
  );
}
