import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'grimoire-favorites';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {}
}

export default function SummoningCircle({ schools, onSpellClick }) {
  const [favorites, setFavorites] = useState(loadFavorites);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggleFavorite = useCallback((spellName, skill) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.skill === skill);
      if (exists) return prev.filter((f) => f.skill !== skill);
      if (prev.length >= 12) return prev;
      return [...prev, { name: spellName, skill, addedAt: Date.now() }];
    });
  }, []);

  const findSpell = useCallback(
    (skill) => {
      for (const school of schools) {
        const spell = school.spells.find((s) => s.skill === skill);
        if (spell) return { spell, school };
      }
      return null;
    },
    [schools]
  );

  const isFavorited = useCallback(
    (skill) => favorites.some((f) => f.skill === skill),
    [favorites]
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
                      onClick={() => toggleFavorite(fav.name, fav.skill)}
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


