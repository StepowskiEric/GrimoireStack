import { useMemo } from 'react';
import SpellCard from './SpellCard.jsx';

export default function SchoolSection({ school, isActive, onSpellClick, searchQuery }) {
  const matchingSet = useMemo(() => {
    if (!searchQuery) return null;
    const q = searchQuery.toLowerCase();
    const set = new Set();
    for (const sp of school.spells) {
      const searchable = `${sp.name} ${sp.skill} ${sp.effect}`.toLowerCase();
      if (searchable.includes(q)) set.add(sp.name + '\0' + sp.skill);
    }
    return set;
  }, [school, searchQuery]);

  const hasMatch = !matchingSet || matchingSet.size > 0;
  const show = isActive || (searchQuery && hasMatch);

  return (
    <div className={`school-section${show ? ' active' : ''}`} id={`school-${school.id}`}>
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
        {school.spells.map(sp => {
          const key = sp.name + '\0' + sp.skill;
          return (
            <SpellCard key={key} spell={sp}
              onClick={() => onSpellClick(sp, school)}
              matched={!searchQuery || matchingSet.has(key)} />
          );
        })}
        {searchQuery && !hasMatch ? (
          <div className="no-spells">The orb sees nothing matching your affliction…</div>
        ) : null}
      </div>
    </div>
  );
}
