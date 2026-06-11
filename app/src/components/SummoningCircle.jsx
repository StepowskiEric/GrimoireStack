import { useState, useCallback } from 'react';
import { spellCatalog } from '../data/spellCatalogInstance.js';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function SummoningCircle({ schools, onSpellClick, favorites, onToggleFavorite, recent = [] }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('favorites');

  const findSpell = useCallback(
    (skill) => {
      const entry = spellCatalog.resolveBySkill(skill);
      return entry ? { spell: entry.spell, school: entry.school } : null;
    },
    []
  );

  return (
    <>
      <button
        type="button"
        className="circle-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close Summoning Circle' : 'Open Summoning Circle'}
        title="Summoning Circle (favorites & recent)"
      >
        <span aria-hidden="true">⛧</span>
        <span className="circle-count" aria-label={`${favorites.length} favorites`}>
          {favorites.length}
        </span>
      </button>

      {open && (
        <div className="circle-panel" aria-label="Summoning Circle">
          <div className="circle-header">
            <span className="circle-title">The Summoning Circle</span>
            <button type="button" className="circle-close" onClick={() => setOpen(false)} aria-label="Close circle">
              ✕
            </button>
          </div>

          <div className="circle-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'favorites'}
              className={`circle-tab${tab === 'favorites' ? ' active' : ''}`}
              onClick={() => setTab('favorites')}
            >
              Favorites ({favorites.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'recent'}
              className={`circle-tab${tab === 'recent' ? ' active' : ''}`}
              onClick={() => setTab('recent')}
            >
              Recently Cast ({recent.length})
            </button>
          </div>

          {tab === 'favorites' ? (
            favorites.length === 0 ? (
              <div className="circle-empty">
                <div className="circle-empty-rune" aria-hidden="true">⟐</div>
                <div className="circle-empty-text">The circle is silent…</div>
                <div className="circle-empty-hint">Star a spell from any card to bind it here.</div>
              </div>
            ) : (
              <div className="circle-glyphs">
                {favorites.map((fav) => {
                  const found = findSpell(fav.skill);
                  return (
                    <div key={fav.skill} className="circle-glyph">
                      <button
                        type="button"
                        className="circle-glyph-inner"
                        onClick={() => {
                          if (found) onSpellClick(found.spell, found.school);
                          setOpen(false);
                        }}
                        title={`${fav.name} — click to open`}
                      >
                        <span className="circle-glyph-symbol" aria-hidden="true">
                          {found?.school?.symbol || '✦'}
                        </span>
                        <span className="circle-glyph-name">{fav.name}</span>
                      </button>
                      <button
                        type="button"
                        className="circle-glyph-unbind"
                        onClick={() => onToggleFavorite(fav.name, fav.skill)}
                        aria-label={`Unbind ${fav.name}`}
                        title="Unbind"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : recent.length === 0 ? (
            <div className="circle-empty-recency">No spells cast yet. Open one to begin your trail.</div>
          ) : (
            <div className="recent-list">
              {recent.map((r) => {
                const found = findSpell(r.skill);
                return (
                  <button
                    key={r.skill}
                    type="button"
                    className="circle-glyph-inner"
                    onClick={() => {
                      if (found) onSpellClick(found.spell, found.school);
                      setOpen(false);
                    }}
                    title={`${r.name} — click to open`}
                  >
                    <span className="circle-glyph-symbol" aria-hidden="true">
                      {found?.school?.symbol || '✦'}
                    </span>
                    <span className="circle-glyph-name">{r.name}</span>
                    <span className="recent-time">{timeAgo(r.viewedAt)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}


