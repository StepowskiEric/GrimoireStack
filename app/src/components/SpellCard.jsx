import { getSpellTier, TIER_META } from '../data/tiers.js';

export default function SpellCard({ spell, onClick, matched, children, isFavorited, onToggleFavorite }) {
  const statusClass = (spell.status || '').toLowerCase().replace(/[^a-z]/g, '');
  const legacyTier = spell.status && spell.status !== '—' ? `✧ ${spell.status}` : '';
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
    onToggleFavorite?.(spell.name, spell.skill);
  };

  return (
    <div
      className={`spell-card${matched === true ? ' glow' : ''}${matched === false ? ' dim' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${spell.name} — ${tierInfo.label} — ${spell.effect}`}
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
          >
            {isFavorited ? '⛧' : '☆'}
          </button>
        )}
      </div>
      <div className="spell-name">{spell.name}</div>
      <div className="spell-incantation">〈 {spell.skill} 〉</div>
      <div className="spell-effect">{spell.effect}</div>
      <div className="spell-footer">
        <span className={`spell-status ${statusClass}`}>{legacyTier || 'common'}</span>
        <span className="spell-reveal-hint">{children || 'click to reveal'}</span>
      </div>
    </div>
  );
}
