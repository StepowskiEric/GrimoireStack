export default function SpellCard({ spell, onClick, glow, dim, children }) {
  const statusClass = (spell.status || '').toLowerCase().replace(/[^a-z]/g, '');
  const tier = spell.status && spell.status !== '—' ? `✧ ${spell.status}` : '';
  return (
    <div
      className={`spell-card${glow ? ' glow' : ''}${dim ? ' dim' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      data-search={`${spell.name} ${spell.skill} ${spell.effect}`.toLowerCase()}
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
