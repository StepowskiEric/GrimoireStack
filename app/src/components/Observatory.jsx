import { useMemo } from 'react';

export default function Observatory({ schools }) {
  const recentSpells = useMemo(() => {
    const spells = [];
    for (const school of schools) {
      for (const sp of school.spells) {
        if (sp.status === 'New') {
          spells.push({
            name: sp.name,
            skill: sp.skill,
            school: school.name,
            schoolSymbol: school.symbol,
            schoolId: school.id,
          });
        }
      }
    }
    return spells.slice(0, 8);
  }, [schools]);

  if (recentSpells.length === 0) return null;

  return (
    <div className="observatory-wrapper" aria-label="Observatory — newly inscribed spells">
      <div className="observatory-header">
        <span className="observatory-sigil" aria-hidden="true">✧</span>
        <span className="observatory-title">The Observatory</span>
        <span className="observatory-subtitle">New stars in the grimoire</span>
      </div>
      <div className="observatory-grid">
        {recentSpells.map((sp) => (
          <div key={sp.skill} className="observatory-star">
            <span className="star-symbol" aria-hidden="true">{sp.schoolSymbol}</span>
            <span className="star-name">{sp.name}</span>
            <span className="star-school">{sp.school}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
