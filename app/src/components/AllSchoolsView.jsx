import { useMemo, useState } from 'react';
import { schoolColors } from '../utils/schoolColors.js';
import { getSpellTier, TIER_META } from '../data/tiers.js';
import SchoolSigil from './SchoolSigil.tsx';
import { pageCreak, wetTendril } from '../audio/sounds.js';

function getDominantTier(spells) {
  const counts = {};
  for (const sp of spells) {
    const t = getSpellTier(sp);
    counts[t] = (counts[t] || 0) + 1;
  }
  let best = 'faded';
  let bestCount = 0;
  for (const [t, c] of Object.entries(counts)) {
    if (c > bestCount) { best = t; bestCount = c; }
  }
  return best;
}

export default function AllSchoolsView({
  schools,
  onSchoolSelect,
  searchQuery,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  const filteredSchools = useMemo(() => {
    if (!searchQuery) return schools;
    const query = searchQuery.toLowerCase();
    return schools.filter(school =>
      school.name.toLowerCase().includes(query) ||
      school.real.toLowerCase().includes(query) ||
      school.desc.toLowerCase().includes(query) ||
      school.spells.some(spell => {
        const searchable = `${spell.name} ${spell.skill} ${spell.effect}`.toLowerCase();
        return searchable.includes(query);
      })
    );
  }, [schools, searchQuery]);

  const handleClick = (school) => {
    pageCreak();
    onSchoolSelect(school.id);
  };

  return (
    <div className="bestiary-index">
      {!searchQuery && (
        <div className="bestiary-index__header">
          <p className="bestiary-index__desc">
            Browse all {schools.length} schools and their {schools.reduce((sum, s) => sum + s.spells.length, 0)} incantations.
          </p>
        </div>
      )}

      <div className="bestiary-index__spine" aria-hidden="true">
        <div className="bestiary-index__ichor" />
      </div>

      <div className="bestiary-index__list">
        {filteredSchools.map((school, idx) => {
          const colors = schoolColors(school.id);
          const tier = getDominantTier(school.spells);
          const tierMeta = TIER_META[tier];
          const isNear = hoveredIdx >= 0 && Math.abs(hoveredIdx - idx) <= 1;
          return (
            <button
              key={school.id}
              className={`bestiary-index__row ${isNear ? 'bestiary-index__row--near' : ''} ${hoveredIdx === idx ? 'bestiary-index__row--hover' : ''}`}
              style={colors.cssVars}
              onClick={() => handleClick(school)}
              onMouseEnter={() => { setHoveredIdx(idx); wetTendril(); }}
              onMouseLeave={() => setHoveredIdx(-1)}
              type="button"
            >
              <div className="bestiary-index__row-symbol"><SchoolSigil schoolId={school.id} size={32} /></div>
              <div className="bestiary-index__row-body">
                <div className="bestiary-index__row-name">{school.real}</div>
                <div className="bestiary-index__row-desc">{school.desc}</div>
              </div>
              <div className="bestiary-index__row-meta">
                <span className="bestiary-index__row-count">{school.spells.length} spells</span>
                {tierMeta && (
                  <span className={`bestiary-index__row-tier bestiary-index__row-tier--${tier}`}>
                    {tierMeta.label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredSchools.length === 0 && (
        <div className="bestiary-index__empty">
          <p>The abyss returns no wardens for this scrying. Try a different glyph.</p>
        </div>
      )}
    </div>
  );
}
