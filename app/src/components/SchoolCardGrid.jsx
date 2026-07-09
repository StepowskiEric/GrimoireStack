import { useState, useMemo, useCallback } from 'react';
import { schoolColors } from '../utils/schoolColors.js';
import { getSpellTier, TIER_META } from '../data/tiers.js';
import AllSchoolsView from './AllSchoolsView.jsx';
import SchoolSigil from './SchoolSigil.tsx';
import { pageCreak } from '../audio/sounds.js';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';

const DEFAULT_FEATURED = ['debugging', 'reasoning', 'process', 'architecture', 'testing', 'creativity'];
const SCHOOL_MAP = grimoireIndex.getSchoolMap();

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

export default function SchoolCardGrid({
  featuredSchools = DEFAULT_FEATURED,
  onSchoolSelect,
  onFeaturedSchoolsChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempFeatured, setTempFeatured] = useState(featuredSchools);
  const [viewMode, setViewMode] = useState('featured');

  const featuredSchoolObjects = useMemo(() => {
    return featuredSchools
      .map(id => SCHOOL_MAP.get(id))
      .filter(Boolean)
      .slice(0, 6);
  }, [featuredSchools]);

  const handleToggleFeatured = (schoolId) => {
    setTempFeatured(prev => {
      if (prev.includes(schoolId)) return prev.filter(id => id !== schoolId);
      if (prev.length < 6) return [...prev, schoolId];
      return prev;
    });
  };

  const handleSaveFeatured = () => {
    localStorage.setItem('grimoire-featured-schools', JSON.stringify(tempFeatured));
    onFeaturedSchoolsChange?.(tempFeatured);
    setIsEditing(false);
  };

  const handleSchoolClick = useCallback((school) => {
    pageCreak();
    onSchoolSelect(school.id);
  }, [onSchoolSelect]);

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-4 pb-3.5 border-b border-[rgba(138,154,106,0.08)]">
        <h1 className="font-['Cinzel_Decorative'] font-black text-clamp-[1.2rem,3vw,1.6rem] text-moonlight tracking-wide"
          style={{ textShadow: '0 0 30px rgba(138,154,106,0.15), 0 0 60px rgba(138,154,106,0.06)', margin: '0 0 4px' }}>
          The Spine
        </h1>
        <p className="font-['Cormorant_Garamond'] italic text-[0.78rem] text-parchment-dark m-0 tracking-wide">A catalogue of every entity bound within this grimoire</p>
      </div>

      {/* Pill Switcher */}
      {!isEditing && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Archive view">
            <button
              role="tab"
              aria-selected={viewMode === 'featured'}
              className={`font-['Cinzel'] text-[0.6rem] font-semibold uppercase tracking-wider px-3.5 py-1.5 border rounded-sm cursor-pointer transition-all duration-200 ${viewMode === 'featured' ? 'bg-gradient-to-b from-[rgba(20,30,12,0.7)] to-[rgba(10,16,6,0.85)] border-[rgba(138,154,106,0.45)] text-sickly shadow-[0_0_12px_rgba(138,154,106,0.08)]' : 'bg-[rgba(8,10,16,0.6)] border-[rgba(138,154,106,0.12)] text-moonlight hover:border-[rgba(138,154,106,0.3)]'}`}
              onClick={() => setViewMode('featured')}
              type="button"
            >
              Featured
            </button>
            <button
              role="tab"
              aria-selected={viewMode === 'all'}
              className={`font-['Cinzel'] text-[0.6rem] font-semibold uppercase tracking-wider px-3.5 py-1.5 border rounded-sm cursor-pointer transition-all duration-200 ${viewMode === 'all' ? 'bg-gradient-to-b from-[rgba(20,30,12,0.7)] to-[rgba(10,16,6,0.85)] border-[rgba(138,154,106,0.45)] text-sickly shadow-[0_0_12px_rgba(138,154,106,0.08)]' : 'bg-[rgba(8,10,16,0.6)] border-[rgba(138,154,106,0.12)] text-moonlight hover:border-[rgba(138,154,106,0.3)]'}`}
              onClick={() => setViewMode('all')}
              type="button"
            >
              All Schools
            </button>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center bg-[rgba(8,10,16,0.6)] border border-[rgba(138,154,106,0.12)] rounded-sm text-moonlight text-[0.85rem] cursor-pointer transition-all duration-200 ml-1 hover:border-[rgba(138,154,106,0.3)]"
            onClick={() => setIsEditing(true)}
            type="button"
            title="Customize featured schools"
          >
            &#x2699;
          </button>
        </div>
      )}

      {/* Content */}
      {isEditing ? (
        <div className="py-1">
          <p className="font-['Cormorant_Garamond'] italic text-[0.9rem] text-silver-mute text-center mb-4.5">Select up to 6 featured schools:</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2 mb-5 text-left">
            {Array.from(SCHOOL_MAP.values()).map(school => (
              <label
                key={school.id}
                className={`flex items-center gap-2.5 p-2.5 border rounded-sm cursor-pointer transition-all duration-200 ${tempFeatured.includes(school.id) ? 'bg-[rgba(20,30,12,0.5)] border-[rgba(138,154,106,0.4)] shadow-[0_0_8px_rgba(138,154,106,0.08)]' : 'bg-[rgba(2,2,4,0.5)] border-[rgba(138,154,106,0.12)] hover:bg-[rgba(20,28,40,0.6)] hover:border-[rgba(196,71,71,0.35)]'}`}
              >
                <input
                  type="checkbox"
                  checked={tempFeatured.includes(school.id)}
                  onChange={() => handleToggleFeatured(school.id)}
                  disabled={!tempFeatured.includes(school.id) && tempFeatured.length >= 6}
                  className="accent-[#8a9a6a]"
                />
                <span className="text-[1.1rem] w-6 text-center"><SchoolSigil schoolId={school.id} size={20} /></span>
                <span className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wider text-moonlight">{school.real}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <button className="px-4.5 py-2.5 rounded-sm font-['Cinzel'] text-[0.6rem] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 bg-gradient-to-b from-[rgba(20,30,12,0.7)] to-[rgba(10,16,6,0.85)] border border-[rgba(138,154,106,0.45)] text-sickly shadow-[0_0_12px_rgba(138,154,106,0.15)] hover:from-[rgba(30,42,18,0.85)] hover:to-[rgba(16,24,10,0.95)] hover:border-[rgba(138,154,106,0.6)]" onClick={handleSaveFeatured} type="button">
              Bind Selection
            </button>
            <button
              className="px-4.5 py-2.5 rounded-sm font-['Cinzel'] text-[0.6rem] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 bg-[rgba(8,12,18,0.7)] border border-[rgba(138,154,106,0.15)] text-silver-mute hover:bg-[rgba(20,28,40,0.7)] hover:border-[rgba(196,71,71,0.4)] hover:text-[#c47a7a]"
              onClick={() => { setTempFeatured(featuredSchools); setIsEditing(false); }}
              type="button"
            >
              Dispel
            </button>
          </div>
        </div>
      ) : viewMode === 'featured' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featuredSchoolObjects.map(school => {
            const colors = schoolColors(school.id);
            const tier = getDominantTier(school.spells);
            const tierMeta = TIER_META[tier];
            return (
              <button
                key={school.id}
                className="spine-card"
                style={colors.cssVars}
                onClick={() => handleSchoolClick(school)}
                type="button"
              >
                <div className="spine-card__drip-top" aria-hidden="true" />
                <div className="spine-card__glow" aria-hidden="true" />
                <div className="spine-card__eye" aria-hidden="true">
                  <div className="spine-card__pupil" />
                </div>
                <div className="spine-card__content">
                  <div className="spine-card__symbol"><SchoolSigil schoolId={school.id} size={36} /></div>
                  <div className="spine-card__name">{school.real}</div>
                  <div className="spine-card__desc">{school.desc}</div>
                  <div className="spine-card__footer">
                    <span className="spine-card__count">{school.spells.length} spells</span>
                    {tierMeta && (
                      <span className={`spine-card__tier spine-card__tier--${tier}`}>
                        {tierMeta.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="spine-card__drip-bottom" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ) : (
        <AllSchoolsView
          onSchoolSelect={onSchoolSelect}
        />
      )}
    </div>
  );
}
