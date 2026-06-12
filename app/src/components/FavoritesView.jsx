import { useMemo } from 'react';

export default function FavoritesView({
  schools,
  favorites,
  recent,
  marginalia,
  onSpellClick,
  isFavorited,
  onToggleFavorite,
}) {
  // Get all favorite spells
  const favoriteSpells = useMemo(() => {
    const allSpells = schools.flatMap(s => s.spells.map(sp => ({ spell: sp, school: s })));
    return allSpells.filter(({ spell }) => favorites.includes(spell.name));
  }, [schools, favorites]);

  // Get recently viewed spells
  const recentSpells = useMemo(() => {
    const allSpells = schools.flatMap(s => s.spells.map(sp => ({ spell: sp, school: s })));
    const recentNames = recent.map(r => r.name);
    return recentNames
      .map(name => allSpells.find(({ spell }) => spell.name === name))
      .filter(Boolean)
      .slice(0, 10);
  }, [schools, recent]);

  return (
    <div className="favorites-view">
      <h2 className="favorites-view__title">The Vault</h2>
      
      {/* Favorites section */}
      <div className="favorites-view__section">
        <h3>★ Bound Incantations ({favoriteSpells.length})</h3>
        {favoriteSpells.length === 0 ? (
          <p className="favorites-view__empty">The circle is silent. No entity is yet bound to your service — seal one with the star to keep it near.</p>
        ) : (
          <div className="favorites-view__list">
            {favoriteSpells.map(({ spell, school }) => (
              <div
                key={spell.name}
                className="favorites-view__item"
                onClick={() => onSpellClick(spell, school)}
              >
                <span className="favorites-view__symbol">{school.symbol}</span>
                <div className="favorites-view__info">
                  <div className="favorites-view__name">{spell.name}</div>
                  <div className="favorites-view__school">{school.name}</div>
                </div>
                <button
                  className={`favorites-view__fav ${isFavorited(spell.name) ? 'favorites-view__fav--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(spell.name);
                  }}
                  type="button"
                >
                  ★
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently viewed section */}
      <div className="favorites-view__section">
        <h3>🕐 Trail of Recent Summons</h3>
        {recentSpells.length === 0 ? (
          <p className="favorites-view__empty">The trail is cold. No incantation has yet been opened in the Eye.</p>
        ) : (
          <div className="favorites-view__list">
            {recentSpells.map(({ spell, school }) => (
              <div
                key={spell.name}
                className="favorites-view__item"
                onClick={() => onSpellClick(spell, school)}
              >
                <span className="favorites-view__symbol">{school.symbol}</span>
                <div className="favorites-view__info">
                  <div className="favorites-view__name">{spell.name}</div>
                  <div className="favorites-view__school">{school.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Marginalia section */}
      <div className="favorites-view__section">
        <h3>📝 Marginalia — Your Annotations</h3>
        {(() => {
          // Handle both hook object { notes } and plain notes object
          const notesObj = marginalia?.notes || marginalia || {};
          const entries = Object.entries(notesObj);
          if (entries.length === 0) {
            return <p className="favorites-view__empty">The page is clean. No annotations have yet been inscribed in the margin.</p>;
          }
          return (
            <div className="favorites-view__list">
              {entries.map(([spellName, note]) => (
                <div key={spellName} className="favorites-view__item favorites-view__item--note">
                  <div className="favorites-view__note-spell">{spellName}</div>
                  <div className="favorites-view__note-text">{typeof note === 'string' ? note : ''}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
