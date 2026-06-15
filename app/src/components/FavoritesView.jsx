import { useMemo } from 'react';
import SchoolSigil from './SchoolSigil.tsx';
import Icon from './Icon.jsx';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';

export default function FavoritesView({
  favorites,
  recent,
  marginalia,
  onSpellClick,
  isFavorited,
  onToggleFavorite,
}) {
  const allSpells = useMemo(() => grimoireIndex.flatEntries(), []);

  // Get all favorite spells
  const favoriteSpells = useMemo(() => {
    return allSpells.filter(({ spell }) => favorites.includes(spell.name));
  }, [allSpells, favorites]);

  // Get recently viewed spells
  const recentSpells = useMemo(() => {
    const recentNames = recent.map(r => r.name);
    return recentNames
      .map(name => allSpells.find(({ spell }) => spell.name === name))
      .filter(Boolean)
      .slice(0, 10);
  }, [allSpells, recent]);

  return (
    <div className="favorites-view">
      <h2 className="favorites-view__title">The Vault</h2>
      
      {/* Favorites section */}
      <div className="favorites-view__section">
        <h3>Bound Incantations ({favoriteSpells.length})</h3>
        {favoriteSpells.length === 0 ? (
          <p className="favorites-view__empty">The circle is silent. No entity is yet bound to your service — seal one with the star to keep it near.</p>
        ) : (
          <div className="favorites-view__list">
            {favoriteSpells.map(({ spell, school }) => (
              <div
                key={spell.name}
                className="favorites-view__item"
                onClick={() => onSpellClick(spell, school)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSpellClick(spell, school); } }}
              >
                <span className="favorites-view__symbol"><SchoolSigil schoolId={school.id} size={22} /></span>
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
                  aria-label={isFavorited(spell.name) ? 'Unbind' : 'Bind'}
                  data-testid="warded-seal"
                >
                  <Icon name="warded-seal" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently viewed section */}
      <div className="favorites-view__section">
        <h3>Trail of Recent Summons</h3>
        {recentSpells.length === 0 ? (
          <p className="favorites-view__empty">The trail is cold. No incantation has yet been opened in the Eye.</p>
        ) : (
          <div className="favorites-view__list">
            {recentSpells.map(({ spell, school }) => (
              <div
                key={spell.name}
                className="favorites-view__item"
                onClick={() => onSpellClick(spell, school)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSpellClick(spell, school); } }}
              >
                <span className="favorites-view__symbol"><SchoolSigil schoolId={school.id} size={22} /></span>
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
        <h3>Marginalia — Your Annotations</h3>
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
