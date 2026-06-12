import { useState, useCallback } from 'react';
import { schoolColors } from '../utils/schoolColors.js';
import SchoolSigil from './SchoolSigil.tsx';
import Icon from './Icon.jsx';

export default function SpellDetailView({
  school,
  onBack,
  isFavorited,
  onToggleFavorite,
  getVote,
}) {
  const [activeSpell, setActiveSpell] = useState(null);
  const [note, setNote] = useState('');
  const colors = school ? schoolColors(school.id) : {};

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
      <div className="spell-detail" style={colors.cssVars}>
        <div className="spell-detail__spine-deco" aria-hidden="true" />
        <button className="spell-detail__back" onClick={handleBackToSchool} type="button">
          ← Back to {school.real}
        </button>

        <div className="spell-detail__header spell-detail__header--spell">
          <span className="spell-detail__symbol"><SchoolSigil schoolId={school.id} size={42} /></span>
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
            onClick={() => {
              const result = onToggleFavorite(activeSpell.name, activeSpell.skill);
              if (result === false) {
                const toast = document.createElement('div');
                toast.className = 'export-toast';
                toast.textContent = 'Binding circle is full (max 12)';
                toast.setAttribute('role', 'status');
                toast.setAttribute('aria-live', 'polite');
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2200);
              }
            }}
            type="button"
            data-testid="warded-seal"
          >
            <Icon name="warded-seal" size={16} />
            <span>{favorited ? 'Favorited' : 'Add to Favorites'}</span>
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
    <div className="spell-detail" style={colors.cssVars}>
      <div className="spell-detail__spine-deco" aria-hidden="true" />
      <button className="spell-detail__back" onClick={onBack} type="button">
        ← Back to The Spine
      </button>
      
      <div className="spell-detail__header">
        <span className="spell-detail__symbol"><SchoolSigil schoolId={school.id} size={48} /></span>
        <h2 className="spell-detail__name">{school.real}</h2>
        <p className="spell-detail__desc">{school.desc}</p>
        <div className="spell-detail__school-count">{school.spells.length} incantations</div>
      </div>

      <div className="spell-detail__spell-list">
        <div className="spell-detail__spells">
          {school.spells.map((spell) => (
            <button
              key={spell.skill}
              className="spell-detail__spell-item"
              onClick={() => handleSpellSelect(spell)}
              type="button"
            >
              <div className="spell-detail__spell-name">{spell.name}</div>
              <div className="spell-detail__spell-effect">{spell.effect.slice(0, 120)}{spell.effect.length > 120 ? '...' : ''}</div>
              {spell.status && spell.status !== '—' && (
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
