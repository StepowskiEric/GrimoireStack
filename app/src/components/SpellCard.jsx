export default function SpellCard({ spell, onClick, matched, children }) {
  const statusClass = (spell.status || '').toLowerCase().replace(/[^a-z]/g, '');
  const tier = spell.status && spell.status !== '—' ? `✧ ${spell.status}` : '';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`spell-card${matched === true ? ' glow' : ''}${matched === false ? ' dim' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${spell.name} — ${tier || 'common'} — ${spell.effect}`}
      style={{ cursor: 'pointer', display: matched === false ? 'none' : '' }}
    >
      {tier ? <div className="spell-tier">{tier}</div> : null}
      <div className="spell-name">{spell.name}</div>
      <div className="spell-incantation">〈 {spell.skill} 〉</div>
      <div className="spell-effect">{spell.effect}</div>
      <div className="spell-footer">
        <span className={`spell-status ${statusClass}`}>{tier || 'common'}</span>
        <span className="spell-reveal-hint">{children || 'click to reveal'}</span>
      </div>
    </div>
  );
}
