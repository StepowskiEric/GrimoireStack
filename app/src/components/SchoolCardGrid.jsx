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
    <div className="spine-view">
      {/* Header */}
      <div className="spine-header">
        <h1 className="spine-title">The Spine</h1>
        <p className="spine-subtitle">A catalogue of every entity bound within this grimoire</p>
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
            {Array.from(SCHOOL_MAP.values()).map(school => (
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
          onSchoolSelect={onSchoolSelect}
        />
      )}
    </div>
  );
}
