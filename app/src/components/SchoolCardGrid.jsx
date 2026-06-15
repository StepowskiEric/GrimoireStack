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
  schools,
  featuredSchools = DEFAULT_FEATURED,
  onSchoolSelect,
  onFeaturedSchoolsChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempFeatured, setTempFeatured] = useState(featuredSchools);
  const [viewMode, setViewMode] = useState('featured');

  const featuredSchoolObjects = useMemo(() => {
    return featuredSchools
      .map(id => schools.find(s => s.id === id) || SCHOOL_MAP.get(id))
      .filter(Boolean)
      .slice(0, 6);
  }, [featuredSchools, schools]);

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
    <div className="spine-view">
      {/* Watching Eye Header */}
      <div className="spine-header">
        <div className="spine-eye" aria-hidden="true">
          <svg viewBox="0 0 200 120" className="spine-eye__svg">
            <ellipse cx="100" cy="60" rx="90" ry="50" fill="none" stroke="rgba(138,154,106,0.12)" strokeWidth="1" />
            <ellipse cx="100" cy="60" rx="75" ry="40" fill="none" stroke="rgba(138,154,106,0.08)" strokeWidth="0.6" strokeDasharray="4 5" />
            <ellipse cx="100" cy="60" rx="65" ry="34" fill="rgba(8,8,6,0.95)" stroke="rgba(196,184,152,0.2)" strokeWidth="0.8" />
            <ellipse cx="100" cy="60" rx="38" ry="22" fill="rgba(138,154,106,0.15)" className="spine-eye__iris" />
            <ellipse cx="100" cy="60" rx="14" ry="10" fill="#020203" className="spine-eye__pupil" />
            <ellipse cx="95" cy="55" rx="4" ry="2.5" fill="rgba(196,184,152,0.35)" />
            <path d="M 100 26 L 97 18 L 94 12" stroke="#5a0a0a" strokeWidth="0.8" fill="none" opacity="0.7" />
            <path d="M 100 94 L 103 102 L 106 108" stroke="#5a0a0a" strokeWidth="0.8" fill="none" opacity="0.7" />
            <path d="M 35 60 L 25 57 L 18 58" stroke="#5a0a0a" strokeWidth="0.6" fill="none" opacity="0.5" />
            <path d="M 165 60 L 175 63 L 182 62" stroke="#5a0a0a" strokeWidth="0.6" fill="none" opacity="0.5" />
          </svg>
        </div>
        <h1 className="spine-title">The Spine</h1>
        <p className="spine-subtitle">A catalogue of every entity bound within this grimoire</p>
        <div className="spine-stats">
          <div className="spine-stat">
            <span className="spine-stat__num">{grimoireIndex.getStats().totalSchools}</span>
            <span className="spine-stat__label">Schools</span>
          </div>
          <div className="spine-stat">
            <span className="spine-stat__num">{grimoireIndex.getStats().totalSpells}</span>
            <span className="spine-stat__label">Spells</span>
          </div>
        </div>
      </div>

      {/* Pill Switcher */}
      {!isEditing && (
        <div className="spine-pills-wrap">
          <div className="spine-pills" role="tablist" aria-label="Archive view">
            <button
              role="tab"
              aria-selected={viewMode === 'featured'}
              className={`spine-pill ${viewMode === 'featured' ? 'spine-pill--active' : ''}`}
              onClick={() => setViewMode('featured')}
              type="button"
            >
              Featured
            </button>
            <button
              role="tab"
              aria-selected={viewMode === 'all'}
              className={`spine-pill ${viewMode === 'all' ? 'spine-pill--active' : ''}`}
              onClick={() => setViewMode('all')}
              type="button"
            >
              All Schools
            </button>
          </div>
          <button
            className="spine-customize-btn"
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
        <div className="spine-edit">
          <p className="spine-edit__subtitle">Select up to 6 featured schools:</p>
          <div className="spine-edit__list">
            {schools.map(school => (
              <label
                key={school.id}
                className={`spine-edit__item ${tempFeatured.includes(school.id) ? 'spine-edit__item--selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={tempFeatured.includes(school.id)}
                  onChange={() => handleToggleFeatured(school.id)}
                  disabled={!tempFeatured.includes(school.id) && tempFeatured.length >= 6}
                />
                <span className="spine-edit__symbol"><SchoolSigil schoolId={school.id} size={20} /></span>
                <span className="spine-edit__name">{school.real}</span>
              </label>
            ))}
          </div>
          <div className="spine-edit__actions">
            <button className="spine-edit__save" onClick={handleSaveFeatured} type="button">
              Bind Selection
            </button>
            <button
              className="spine-edit__cancel"
              onClick={() => { setTempFeatured(featuredSchools); setIsEditing(false); }}
              type="button"
            >
              Dispel
            </button>
          </div>
        </div>
      ) : viewMode === 'featured' ? (
        <div className="spine-featured">
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
          schools={schools}
          onSchoolSelect={onSchoolSelect}
        />
      )}
    </div>
  );
}
