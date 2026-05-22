import SpellCard from './SpellCard.jsx';

export default function SchoolSection({ school, isActive, onSpellClick }) {
  return (
    <div className={`school-section${isActive ? ' active' : ''}`} id={`school-${school.id}`}>
      <div className="school-header">
        <span className="school-symbol">{school.symbol}</span>
        <h2>{school.name}</h2>
        <p className="school-desc">{school.desc}</p>
        <div className="school-meta">
          <span className="school-count">
            {school.spells.length} incantation{school.spells.length !== 1 ? 's' : ''}
          </span>
          <span className="school-real">also known as: {school.real}</span>
        </div>
      </div>
      <div className="spell-grid">
        {school.spells.map(sp => (
          <SpellCard key={sp.name + sp.skill} spell={sp} onClick={() => onSpellClick(sp, school)} />
        ))}
      </div>
    </div>
  );
}
