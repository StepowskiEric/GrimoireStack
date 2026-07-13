/* eslint-disable react/no-array-index-key -- fixed-size decorative modal background eyes */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSpellTier, TIER_META } from '../data/tiers.ts';
import { cn } from '../utils/cn.ts';
import { simpleMarkdownToHtml } from '../utils/markdown.ts';
import { sanitizeHtml } from '../utils/sanitize.ts';
import { buildShareUrl } from '../utils/urlSpellSync.ts';
import { findSpell, fetchSkillMap, fetchSkillMd } from '../utils/skillContent.ts';
import Icon from './Icon.tsx';
import SchoolSigil from './SchoolSigil.tsx';
import ModalBgEyes from './ModalBgEyes.tsx';
import ModalTentacle from './ModalTentacle.tsx';
import MarginaliaSection from './MarginaliaSection.tsx';
import SignalSection from './SignalSection.tsx';
import './SpellModal.css';
import './IntakeOracle.css';

const INSCRIBE_AGENTS = [
  { id: 'claude', label: 'Claude Code', prefix: 'npx GrimoireStack install --agent claude' },
  { id: 'codex', label: 'OpenAI Codex', prefix: 'npx GrimoireStack install --agent codex' },
  { id: 'copilot', label: 'VS Code Copilot', prefix: 'npx GrimoireStack install --agent copilot' },
  { id: 'hermes', label: 'Hermes', prefix: 'npx GrimoireStack install --agent hermes' },
  {
    id: 'antigravity',
    label: 'Antigravity',
    prefix: 'npx GrimoireStack install --agent antigravity',
  },
  { id: 'factory-droid', label: 'Factory Droid', prefix: 'Copy skill to ~/.factory/skills/' },
];

export default function SpellModal({
  spell,
  school,
  onClose,
  marginalia,
  getVote,
  castVote,
  aggregateFor,
}: {
  spell?: any;
  school?: any;
  onClose?: any;
  marginalia?: any;
  getVote?: any;
  castVote?: any;
  aggregateFor?: any;
}) {
  // Stable per-day timestamp so the metadata line doesn't flicker on re-render
  const firstSeen = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [viewMode, setViewMode] = useState('plain'); // 'plain' | 'full'
  const [mdContent, setMdContent] = useState<string | null>(null);
  const [mdLoading, setMdLoading] = useState(false);
  const [inscribeAgent, setInscribeAgent] = useState('claude');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null); // null | 'copied' | 'failed'
  const [inscribeFeedback, setInscribeFeedback] = useState<string | null>(null); // null | 'inscribed' | 'unsupported' | 'failed'

  const statusStr = spell?.status && spell?.status !== '—' ? spell?.status : 'Common';
  const statusClass = (spell?.status || 'common').toLowerCase().replace(/[^a-z]/g, '') || 'common';
  const {
    label,
    className: tierClass,
    title: tierTitle,
  } = TIER_META[getSpellTier(spell || { skill: '' })];
  const modalRef = useRef<HTMLDivElement>(null);

  const loadMd = useCallback(async () => {
    if (!spell) return;
    if (mdContent !== null || mdLoading) return;
    setMdLoading(true);
    const text = await fetchSkillMd(spell.skill);
    if (text) {
      const html = await simpleMarkdownToHtml(text);
      setMdContent(sanitizeHtml(html));
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
    fetchSkillMap()
      .then((map) => {
        if (map[spell.skill]) {
          setViewMode('full');
          // loadMd will be triggered by the viewMode effect below
        } else {
          setViewMode('plain');
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch skill map:', error);
        setViewMode('plain');
      });
  }, [spell, spell?.skill, marginalia]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = [...modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )];
    const first = focusable[0];
    const last = focusable.at(-1);
    first?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose, viewMode, mdContent, spell]);

  // Share button handler — Web Share API with clipboard fallback
  const handleShare = useCallback(() => {
    const url = buildShareUrl(window.location.origin, spell.skill);
    const copyToClip = () =>
      navigator.clipboard
        .writeText(url)
        .then(() => setShareFeedback('copied'))
        .catch((err) => {
          console.warn('Clipboard copy failed:', err);
          setShareFeedback('failed');
        });
    if (navigator.share) {
      navigator.share({ title: spell.name, text: spell.effect, url }).catch((err) => {
        console.warn('Web Share API failed, falling back to clipboard:', err);
        copyToClip();
      });
    } else if (navigator.clipboard) {
      copyToClip();
    }
  }, [spell]);

  // Inscribe button handler — copy install command to clipboard
  const handleInscribe = useCallback(() => {
    const agent = INSCRIBE_AGENTS.find((a) => a.id === inscribeAgent);
    if (!agent) return;
    const cmd =
      agent.id === 'factory-droid'
        ? `Copy ${spell.skill}/SKILL.md into ~/.factory/skills/${spell.skill}/`
        : `${agent.prefix} --skill ${spell.skill}`;
    if (!navigator.clipboard) {
      setInscribeFeedback('unsupported');
      return;
    }
    navigator.clipboard
      .writeText(cmd)
      .then(() => setInscribeFeedback('inscribed'))
      .catch((err) => {
        console.warn('Inscribe clipboard copy failed:', err);
        setInscribeFeedback('failed');
      });
  }, [inscribeAgent, spell]);

  // Clear feedback timers
  useEffect(() => {
    if (!(shareFeedback || inscribeFeedback)) return;
    const timer = setTimeout(() => {
      setShareFeedback(null);
      setInscribeFeedback(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [shareFeedback, inscribeFeedback]);

  if (!spell) return null;

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="modal-overlay open flex"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-testid="spell-modal-overlay"
    >
      {/* Background peering eyes — drift + occasional blink, decorative */}
      <ModalBgEyes />

      <div
        className="modal modal-wide"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${spell.name} spell details`}
        data-testid="spell-modal-dialog"
      >
        {['tl', 'tr', 'bl', 'br'].map((corner) => (
          <ModalTentacle key={corner} corner={corner} />
        ))}

        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close spell details"
        >
          <Icon name="close" size={18} />
        </button>

        {/* Eldritch whisper — Cthulhu-mythos preamble at the top of the scroll */}
        <p className="modal-whisper">
          <em>
            “That is not dead which can eternal lie, and with strange aeons even death may die.”
          </em>
        </p>

        <div className="modal-title-carved">
          <span className="modal-symbol">
            <SchoolSigil schoolId={school.id} size={28} />
          </span>
        </div>
        <div className="modal-school">
          {school.name} <span className="modal-school-real">({school.real})</span>
        </div>
        <div className="modal-title" data-testid="spell-modal-title">
          {spell.name}
        </div>
        <div className="modal-incantation">〈 {spell.skill} 〉</div>
        <div className="modal-metadata">
          Inscribed by the Scribe of the Unseen · First seen in the depths on {firstSeen}
        </div>

        {viewMode === 'plain' ? (
          <>
            {spell.note ? (
              <div className="modal-detail-row modal-note flex" style={{ display: 'flex' }}>
                <div className="modal-detail-label">Note</div>
                <div className="modal-detail-value">{spell.note}</div>
              </div>
            ) : null}

            <div className="modal-section-title">Effect</div>
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
                  <span className="sigil-mark" aria-hidden="true">
                    ⟐
                  </span>
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
                <div className="syn-title">Synergistic Pairings</div>
                <div className="syn-grid">
                  {spell.combos.map((comboName) => {
                    const found = findSpell(comboName);
                    return (
                      <span
                        key={comboName}
                        className="syn-chip"
                        onClick={() => found && onClose(found.spell, found.school)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if ((e.key === 'Enter' || e.key === ' ') && found)
                            onClose(found.spell, found.school);
                        }}
                        role="button"
                        tabIndex={0}
                        title={found ? `Open ${comboName}` : ''}
                      >
                        {comboName}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <MarginaliaSection skill={spell.skill} marginalia={marginalia} />

            <SignalSection skill={spell.skill} getVote={getVote} castVote={castVote} aggregateFor={aggregateFor} />
          </>
        ) : (
          <div className="modal-full-entry" role="region" aria-label="Spell description">
            {mdLoading ? (
              <div className="modal-md-loading">
                <span className="md-loading-rune">⟐</span>
                <span>Unfurling the scroll...</span>
              </div>
            ) : mdContent === '' ? (
              <div className="modal-md-empty">
                <p>No full grimoire entry found for this incantation.</p>
                <p className="modal-md-empty-hint">
                  The scroll may still be in the scribe's hands.
                </p>
              </div>
            ) : (
              // eslint-disable-next-line react/no-danger
              <div className="modal-md-content" dangerouslySetInnerHTML={{ __html: mdContent || '' }} />
            )}
          </div>
        )}

        <div className="modal-grimoire-ref">
          <code>
            〈 grimoirestack:{school.id}/{spell.skill} 〉
          </code>
        </div>

        <p className="modal-warning">Speak not of this to those who sleep.</p>

        <div className="modal-actions">
          <button
            type="button"
            className={cn('modal-share modal-share-half modal-goo-btn', 'w-full')}
            onClick={handleShare}
          >
            <span className="modal-goo-seal" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <path
                  d="M 12 4 L 13 11 L 20 12 L 13 13 L 12 20 L 11 13 L 4 12 L 11 11 Z"
                  fill="currentColor"
                  opacity="0.6"
                />
              </svg>
            </span>
            <span className="modal-goo-label">
              {shareFeedback === 'copied'
                ? 'Link Copied!'
                : shareFeedback === 'failed'
                  ? 'Copy failed'
                  : 'Share'}
            </span>
          </button>
          <div className="modal-inscribe-group">
            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select
              className="modal-inscribe-select"
              value={inscribeAgent}
              onChange={(e) => setInscribeAgent(e.target.value)}
              aria-label="Select target agent"
            >
              {INSCRIBE_AGENTS.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={cn(
                'modal-share modal-share-half modal-inscribe modal-goo-btn',
                'w-full',
                inscribeFeedback === 'inscribed' && 'modal-goo-btn--broken',
              )}
              onClick={handleInscribe}
            >
              <span className="modal-goo-seal" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M 12 4 L 13 11 L 20 12 L 13 13 L 12 20 L 11 13 L 4 12 L 11 11 Z"
                    fill="currentColor"
                    opacity="0.6"
                  />
                </svg>
              </span>
              <span className="modal-goo-label">
                {inscribeFeedback === 'inscribed'
                  ? 'Incantation Inscribed'
                  : inscribeFeedback === 'unsupported'
                    ? 'Copy unsupported'
                    : inscribeFeedback === 'failed'
                      ? 'Copy failed'
                      : 'Inscribe to your Workshop'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
