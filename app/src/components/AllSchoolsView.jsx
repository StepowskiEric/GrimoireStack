import { useMemo } from 'react';

export default function AllSchoolsView({
  schools,
  onSchoolSelect,
  isFavorited,
  onToggleFavorite,
  searchQuery,
}) {
  // Filter schools based on search query
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

  return (
    <div className="all-schools-view">
      <h2 className="all-schools-view__title">All Schools of Magic</h2>
      <p className="all-schools-view__desc">
        Browse all {schools.length} schools and their {schools.reduce((sum, s) => sum + s.spells.length, 0)} incantations.
      </p>

      <div className="all-schools-view__grid">
        {filteredSchools.map(school => (
          <button
            key={school.id}
            className="all-schools-view__card"
            onClick={() => onSchoolSelect(school.id)}
            type="button"
          >
            <div className="all-schools-view__symbol">{school.symbol}</div>
            <div className="all-schools-view__name">{school.name}</div>
            <div className="all-schools-view__real-name">{school.real}</div>
            <div className="all-schools-view__desc">{school.desc}</div>
            <div className="all-schools-view__count">{school.spells.length} spells</div>
          </button>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div className="all-schools-view__empty">
          <p>The abyss returns no wardens for this scrying. Try a different glyph.</p>
        </div>
      )}
    </div>
  );
}
