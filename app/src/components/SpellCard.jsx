import { getSpellTier, TIER_META } from '../data/tiers.js';
import { hasDistinctTrueName } from '../data/spellDisplay.js';
import Icon from './Icon.jsx';

export default function SpellCard({ spell, onClick, matched, children, isFavorited, onToggleFavorite }) {
  const statusClass = (spell.status || '').toLowerCase().replace(/[^a-z]/g, '');
  const legacyTier = spell.status && spell.status !== '—' ? `${spell.status}` : '';
  const tierInfo = TIER_META[getSpellTier(spell)];
  const showTierBadge = spell.status && spell.status !== '—';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    const result = onToggleFavorite?.(spell.name, spell.skill);
    // Show a brief toast if the favorites cap was reached
    if (result === false) {
      const toast = document.createElement('div');
      toast.className = 'export-toast';
      toast.textContent = 'Binding circle is full (max 12)';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2200);
    }
  };

  const hasTrueName = hasDistinctTrueName(spell);
  const cardTitle = hasTrueName ? `${spell.trueName} (${spell.name})` : spell.name;

  return (
    <div
      className={`spell-card${matched === true ? ' glow' : ''}${matched === false ? ' dim' : ''}${hasTrueName ? ' has-true-name' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${cardTitle} — ${tierInfo.label} — ${spell.effect}`}
      title={tierInfo.title}
      style={{ cursor: 'pointer', display: matched === false ? 'none' : '' }}
    >
      <div className="spell-tier">
        {showTierBadge ? (
          <span className={`sigil-tier ${tierInfo.className}`} title={tierInfo.title}>
            <span className="sigil-mark" aria-hidden="true">⟐</span>
            <span className="sigil-label">{tierInfo.label}</span>
          </span>
        ) : (
          <span className="sigil-tier-text">{legacyTier || 'common'}</span>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            className={`spell-star${isFavorited ? ' favorited' : ''}`}
            onClick={handleStarClick}
            aria-label={isFavorited ? 'Unbind from Summoning Circle' : 'Bind to Summoning Circle'}
            title={isFavorited ? 'Unbind' : 'Bind to Circle'}
            data-testid="warded-seal"
          >
            <Icon name="warded-seal" size={18} />
          </button>
        )}
      </div>
      {hasTrueName ? (
        <>
          <div className="spell-true-name">{spell.trueName}</div>
          <div className="spell-name spell-name--secondary">{spell.name}</div>
        </>
      ) : (
        <div className="spell-name">{spell.name}</div>
      )}
      <div className="spell-incantation">〈 {spell.skill} 〉</div>
      <div className="spell-effect">{spell.effect}</div>
      <div className="spell-footer">
        <span className={`spell-status ${statusClass}`}>{legacyTier || 'common'}</span>
        <span className="spell-reveal-hint">{children || 'click to reveal'}</span>
      </div>
    </div>
  );
}
