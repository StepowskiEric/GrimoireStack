import { useState, useCallback } from 'react';
import { spellCatalog } from '../data/spellCatalogInstance.js';

export default function SummoningCircle({ schools, onSpellClick, favorites, onToggleFavorite }) {
  const [open, setOpen] = useState(false);

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
        title="Summoning Circle (favorites)"
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

          {favorites.length === 0 ? (
            <div className="circle-empty">
              <div className="circle-empty-rune" aria-hidden="true">
                ⟐
              </div>
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
          )}
        </div>
      )}
    </>
  );
}


