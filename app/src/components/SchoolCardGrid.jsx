import { useState, useMemo, useCallback } from 'react';
import { schoolColors } from '../utils/schoolColors.js';
import { getSpellTier, TIER_META } from '../data/tiers.js';
import AllSchoolsView from './AllSchoolsView.jsx';
import SchoolSigil from './SchoolSigil.tsx';
import { pageCreak } from '../audio/sounds.js';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { cn } from '../utils/cn.js';

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
      <div className="text-center mb-4 pb-3.5 border-b border-border">
        <h1 className="font-['Cinzel_Decorative'] font-black text-clamp-[1.2rem,3vw,1.6rem] text-text-primary tracking-wide"
          style={{ textShadow: '0 0 30px rgba(138,154,106,0.15), 0 0 60px rgba(138,154,106,0.06)', margin: '0 0 4px' }}>
          The Spine
        </h1>
        <p className="font-['Cormorant_Garamond'] italic text-[0.78rem] text-text-secondary m-0 tracking-wide">A catalogue of every entity bound within this grimoire</p>
      </div>

      {/* Pill Switcher */}
      {!isEditing && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Archive view">
            <button
              role="tab"
              aria-selected={viewMode === 'featured'}
              className={cn('font-display text-[0.6rem] font-semibold uppercase tracking-wider px-3.5 py-1.5 border rounded-sm cursor-pointer transition-all duration-200', viewMode === 'featured' ? 'bg-gradient-to-b from-[rgba(20,30,12,0.7)] to-[rgba(10,16,6,0.85)] border-border-hover text-sickly shadow-[0_0_12px_rgba(138,154,106,0.08)]' : 'bg-surface border-border text-text-primary hover:border-border-hover')}
              onClick={() => setViewMode('featured')}
              type="button"
            >
              Featured
            </button>
            <button
              role="tab"
              aria-selected={viewMode === 'all'}
              className={cn('font-display text-[0.6rem] font-semibold uppercase tracking-wider px-3.5 py-1.5 border rounded-sm cursor-pointer transition-all duration-200', viewMode === 'all' ? 'bg-gradient-to-b from-[rgba(20,30,12,0.7)] to-[rgba(10,16,6,0.85)] border-border-hover text-sickly shadow-[0_0_12px_rgba(138,154,106,0.08)]' : 'bg-surface border-border text-text-primary hover:border-border-hover')}
              onClick={() => setViewMode('all')}
              type="button"
            >
              All Schools
            </button>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center bg-surface border border-border rounded-sm text-text-primary text-[0.85rem] cursor-pointer transition-all duration-200 ml-1 hover:border-border-hover"
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
          <p className="font-['Cormorant_Garamond'] italic text-[0.9rem] text-text-muted text-center mb-4.5">Select up to 6 featured schools:</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2 mb-5 text-left">
            {Array.from(SCHOOL_MAP.values()).map(school => (
              <label
                key={school.id}
                className={cn('flex items-center gap-2.5 p-2.5 border rounded-sm cursor-pointer transition-all duration-200', tempFeatured.includes(school.id) ? 'bg-surface-raised border-border-hover shadow-[0_0_8px_rgba(138,154,106,0.08)]' : 'bg-surface-overlay border-border hover:bg-[rgba(20,28,40,0.6)] hover:border-danger/40')}
              >
                <input
                  type="checkbox"
                  checked={tempFeatured.includes(school.id)}
                  onChange={() => handleToggleFeatured(school.id)}
                  disabled={!tempFeatured.includes(school.id) && tempFeatured.length >= 6}
                  className="accent-sickly"
                />
                <span className="text-[1.1rem] w-6 text-center"><SchoolSigil schoolId={school.id} size={20} /></span>
                <span className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wider text-text-primary">{school.real}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <button className="px-4.5 py-2.5 rounded-sm font-['Cinzel'] text-[0.6rem] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 bg-gradient-to-b from-[rgba(20,30,12,0.7)] to-[rgba(10,16,6,0.85)] border border-border-hover text-sickly shadow-[0_0_12px_rgba(138,154,106,0.15)] hover:from-[rgba(30,42,18,0.85)] hover:to-[rgba(16,24,10,0.95)] hover:border-border-hover" onClick={handleSaveFeatured} type="button">
              Bind Selection
            </button>
            <button
              className="px-4.5 py-2.5 rounded-sm font-['Cinzel'] text-[0.6rem] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 bg-surface-raised border border-border text-text-muted hover:bg-[rgba(20,28,40,0.7)] hover:border-danger/40 hover:text-danger"
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
                className="group relative overflow-hidden border border-border bg-surface p-4 text-left transition-all duration-200 hover:border-border-hover"
                style={colors.cssVars}
                onClick={() => handleSchoolClick(school)}
                type="button"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-[rgba(138,154,106,0.18)] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,154,106,0.08),transparent_70%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true">
                  <div className="h-10 w-10 rounded-full border border-border bg-surface-overlay" />
                </div>
                <div className="relative z-[1] flex flex-col gap-1">
                  <div className="text-2xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]"><SchoolSigil schoolId={school.id} size={36} /></div>
                  <div className="font-['Cinzel'] text-[0.7rem] font-semibold tracking-wide text-text-primary" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>{school.real}</div>
                  <div className="font-['Cormorant_Garamond'] text-[0.78rem] text-text-secondary line-clamp-2">{school.desc}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-['Cinzel'] text-[0.55rem] uppercase tracking-widest text-text-muted">{school.spells.length} spells</span>
                    {tierMeta && (
                      <span
                        className={cn("font-['Cinzel'] text-[0.55rem] border px-1.5 py-0.5", {
                          'text-[#c47a7a] border-[rgba(196,71,71,0.4)] bg-[rgba(196,71,71,0.08)]': tier === 'archmage',
                          'text-[#d4af37] border-[rgba(212,175,55,0.4)] bg-[rgba(212,175,55,0.08)]': tier === 'master',
                          'text-[#8a9a6a] border-[rgba(138,154,106,0.4)] bg-[rgba(138,154,106,0.08)]': tier === 'adept',
                          'text-[#9a8aaa] border-[rgba(154,138,170,0.4)] bg-[rgba(154,138,170,0.08)]': tier === 'apprentice',
                          'text-[#9a9aa2] border-[rgba(154,154,162,0.4)] bg-[rgba(154,154,162,0.08)]': tier === 'faded',
                        })}
                      >
                        {tierMeta.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-[rgba(138,154,106,0.15)] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
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
