import { useState, useCallback } from 'react';

export default function SpellDetailView({
  school,
  onBack,
  isFavorited,
  onToggleFavorite,
  getVote,
}) {
  const [activeSpell, setActiveSpell] = useState(null);
  const [note, setNote] = useState('');

  const handleSpellSelect = useCallback((spell) => {
    setActiveSpell(spell);
  }, []);

  const handleBackToSchool = useCallback(() => {
    setActiveSpell(null);
  }, []);

  if (!school) return null;

  // If viewing a specific spell
  if (activeSpell) {
    const vote = getVote ? getVote(activeSpell.skill) : null;
    const { name: tierName } = vote || { name: 'Common' };
    const favorited = isFavorited(activeSpell.name, activeSpell.skill);

    return (
      <div className="spell-detail">
        <button className="spell-detail__back" onClick={handleBackToSchool} type="button">
          ← Back to {school.name}
        </button>

        <div className="spell-detail__header">
          <span className="spell-detail__symbol">{school.symbol}</span>
          <h2 className="spell-detail__name">{activeSpell.name}</h2>
          <div className="spell-detail__meta">
            <span className="spell-detail__tier">{tierName}</span>
            {activeSpell.status && (
              <span className={`spell-detail__status spell-detail__status--${activeSpell.status.toLowerCase()}`}>
                {activeSpell.status}
              </span>
            )}
          </div>
        </div>

        <div className="spell-detail__effect">
          <h3>Effect</h3>
          <p>{activeSpell.effect}</p>
        </div>

        {activeSpell.note && (
          <div className="spell-detail__note">
            <h3>Note</h3>
            <p>{activeSpell.note}</p>
          </div>
        )}

        {activeSpell.combos && activeSpell.combos.length > 0 && (
          <div className="spell-detail__combos">
            <h3>Combinations</h3>
            <div className="spell-detail__combo-list">
              {activeSpell.combos.map((combo) => (
                <span key={combo} className="spell-detail__combo-tag">{combo}</span>
              ))}
            </div>
          </div>
        )}

        <div className="spell-detail__actions">
          <button
            className={`spell-detail__fav ${favorited ? 'spell-detail__fav--active' : ''}`}
            onClick={() => onToggleFavorite(activeSpell.name, activeSpell.skill)}
            type="button"
          >
            {favorited ? '★ Favorited' : '☆ Add to Favorites'}
          </button>
        </div>

        {/* Marginalia */}
        <div className="spell-detail__marginalia">
          <h3>Marginalia</h3>
          <textarea
            className="spell-detail__note-input"
            placeholder="Add your notes here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    );
  }

  // School view with spell list
  return (
    <div className="spell-detail">
      <button className="spell-detail__back" onClick={onBack} type="button">
        ← Back to Library
      </button>
      
      <div className="spell-detail__header">
        <span className="spell-detail__symbol">{school.symbol}</span>
        <h2 className="spell-detail__name">{school.name}</h2>
        <p className="spell-detail__desc">{school.desc}</p>
      </div>

      <div className="spell-detail__spell-list">
        <h3>Incantations ({school.spells.length})</h3>
        <div className="spell-detail__spells">
          {school.spells.map((spell) => (
            <button
              key={spell.skill}
              className="spell-detail__spell-item"
              onClick={() => handleSpellSelect(spell)}
              type="button"
            >
              <div className="spell-detail__spell-name">{spell.name}</div>
              <div className="spell-detail__spell-effect">{spell.effect.slice(0, 100)}...</div>
              {spell.status && (
                <span className={`spell-detail__spell-status spell-detail__spell-status--${spell.status.toLowerCase()}`}>
                  {spell.status}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
