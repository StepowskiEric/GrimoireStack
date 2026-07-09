import { useMemo, useState } from 'react';
import { schoolColors } from '../utils/schoolColors.js';
import { getSpellTier, TIER_META } from '../data/tiers.js';
import { getSpellSearchableText } from '../data/spellDisplay.js';
import SchoolSigil from './SchoolSigil.tsx';
import { pageCreak } from '../audio/sounds.js';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { cn } from '../utils/cn.js';

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

const TIER_STYLES = {
  archmage: 'border-danger/40 text-danger',
  master: 'border-accent/40 text-accent',
  adept: 'border-border-hover text-text-primary',
  apprentice: 'border-[rgba(154,138,170,0.4)] text-[#9a8aaa]',
  faded: 'border-[rgba(154,154,162,0.4)] text-[#9a9aa2]',
};

export default function AllSchoolsView({
  onSchoolSelect,
  searchQuery,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(-1);

  const allSchools = useMemo(() => Array.from(grimoireIndex.getSchoolMap().values()), []);

  const filteredSchools = useMemo(() => {
    if (!searchQuery) return allSchools;
    const query = searchQuery.toLowerCase();
    return allSchools.filter(school =>
      school.name.toLowerCase().includes(query) ||
      school.real.toLowerCase().includes(query) ||
      school.desc.toLowerCase().includes(query) ||
      school.spells.some(spell => getSpellSearchableText(spell).includes(query))
    );
  }, [allSchools, searchQuery]);

  const handleClick = (school) => {
    pageCreak();
    onSchoolSelect(school.id);
  };

  return (
    <div className="py-1">
      {!searchQuery && (
        <div className="panel p-3.5 mb-4">
          <p className="text-text-secondary text-[0.82rem]">
            Browse all {grimoireIndex.getStats().totalSchools} schools and their {grimoireIndex.getStats().totalSpells} incantations.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filteredSchools.map((school, idx) => {
          const colors = schoolColors(school.id);
          const tier = getDominantTier(school.spells);
          const tierMeta = TIER_META[tier];
          const isNear = hoveredIdx >= 0 && Math.abs(hoveredIdx - idx) <= 1;
          const isHover = hoveredIdx === idx;
          return (
            <button
              key={school.id}
              data-testid="bestiary-index-row"
              className={cn('w-full text-left border rounded-sm p-3 transition-all duration-200', isHover ? 'border-border-hover bg-surface-raised' : isNear ? 'border-border bg-surface' : 'border-border bg-surface opacity-70')}
              style={colors.cssVars}
              onClick={() => handleClick(school)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(-1)}
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="text-sickly"><SchoolSigil schoolId={school.id} size={32} /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wide text-text-primary">{school.real}</div>
                  <div className="text-text-secondary text-[0.82rem] truncate">{school.desc}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-['Cinzel'] text-[0.68rem] text-text-muted">{school.spells.length} spells</span>
                  {tierMeta && (
                    <span className={cn('font-display text-[0.6rem] uppercase tracking-widest border rounded-sm px-1.5 py-0.5', TIER_STYLES[tier] || 'border-border text-text-muted')}>
                      {tierMeta.label}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredSchools.length === 0 && (
        <div className="panel p-4 text-center">
          <p className="text-text-muted italic">The abyss returns no wardens for this scrying. Try a different glyph.</p>
        </div>
      )}
    </div>
  );
}
