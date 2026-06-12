import { useState, useMemo } from 'react';

// Default featured schools if none specified
const DEFAULT_FEATURED = ['debugging', 'reasoning', 'process', 'architecture', 'testing', 'creativity'];

export default function SchoolCardGrid({
  schools,
  featuredSchools = DEFAULT_FEATURED,
  onSchoolSelect,
  onViewAll,
  isFavorited,
  onToggleFavorite,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempFeatured, setTempFeatured] = useState(featuredSchools);

  // Get featured school objects
  const featuredSchoolObjects = useMemo(() => {
    return featuredSchools
      .map(id => schools.find(s => s.id === id))
      .filter(Boolean)
      .slice(0, 6); // Max 6 featured
  }, [featuredSchools, schools]);

  const handleToggleFeatured = (schoolId) => {
    setTempFeatured(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      } else if (prev.length < 6) {
        return [...prev, schoolId];
      }
      return prev;
    });
  };

  const handleSaveFeatured = () => {
    localStorage.setItem('grimoire-featured-schools', JSON.stringify(tempFeatured));
    onFeaturedSchoolsChange?.(tempFeatured);
    setIsEditing(false);
  };

  return (
    <div className="school-card-grid">
      <h2 className="school-card-grid__title">Wardens of the Abyss</h2>
      
      {isEditing ? (
        <>
          <p className="school-card-grid__subtitle">Select up to 6 featured schools:</p>
          <div className="school-card-grid__edit-list">
            {schools.map(school => (
              <label
                key={school.id}
                className={`school-card-grid__edit-item ${tempFeatured.includes(school.id) ? 'school-card-grid__edit-item--selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={tempFeatured.includes(school.id)}
                  onChange={() => handleToggleFeatured(school.id)}
                  disabled={!tempFeatured.includes(school.id) && tempFeatured.length >= 6}
                />
                <span className="school-card-grid__edit-symbol">{school.symbol}</span>
                <span className="school-card-grid__edit-name">{school.name}</span>
              </label>
            ))}
          </div>
          <div className="school-card-grid__edit-actions">
            <button
              className="school-card-grid__edit-save"
              onClick={handleSaveFeatured}
              type="button"
            >
              Save Selection
            </button>
            <button
              className="school-card-grid__edit-cancel"
              onClick={() => {
                setTempFeatured(featuredSchools);
                setIsEditing(false);
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="school-card-grid__cards">
            {featuredSchoolObjects.map(school => (
              <button
                key={school.id}
                className="school-card"
                onClick={() => onSchoolSelect(school.id)}
                type="button"
              >
                <div className="school-card__symbol">{school.symbol}</div>
                <div className="school-card__name">{school.real}</div>
                <div className="school-card__spell-count">{school.spells.length} spells</div>
              </button>
            ))}
          </div>
          
          <div className="school-card-grid__actions">
            <button
              className="school-card-grid__view-all"
              onClick={onViewAll}
              type="button"
            >
              View All Schools
            </button>
            <button
              className="school-card-grid__customize"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              Customize
            </button>
          </div>
        </>
      )}
    </div>
  );
}
