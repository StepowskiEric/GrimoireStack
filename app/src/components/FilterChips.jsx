import { TIER_META } from '../data/tiers.js';

const TIER_ORDER = ['apprentice', 'adept', 'master', 'archmage', 'faded'];

export default function FilterChips({
  schools,
  schoolFilter,
  tierFilter,
  favoritesOnly,
  onToggleSchool,
  onToggleTier,
  onToggleFavorites,
  onClear,
}) {
  const anyActive =
    (schoolFilter && schoolFilter.size > 0) ||
    (tierFilter && tierFilter.size > 0) ||
    favoritesOnly;

  return (
    <div className="filter-chips" role="group" aria-label="Filter incantations">
      <div className="filter-row" role="group" aria-label="Filter by school">
        <span className="filter-label" aria-hidden="true">School:</span>
        {schools.map((s) => {
          const active = schoolFilter?.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              className={`filter-chip${active ? ' active' : ''}`}
              onClick={() => onToggleSchool?.(s.id)}
              aria-pressed={!!active}
              title={s.real}
            >
              <span className="filter-chip-glyph" aria-hidden="true">{s.symbol}</span>
              <span className="filter-chip-text">{s.name.replace(/^School of /, '')}</span>
            </button>
          );
        })}
      </div>
      <div className="filter-row" role="group" aria-label="Filter by tier">
        <span className="filter-label" aria-hidden="true">Tier:</span>
        {TIER_ORDER.map((key) => {
          const meta = TIER_META[key];
          if (!meta) return null;
          const active = tierFilter?.has(key);
          return (
            <button
              key={key}
              type="button"
              className={`filter-chip filter-chip-tier ${meta.className}${active ? ' active' : ''}`}
              onClick={() => onToggleTier?.(key)}
              aria-pressed={!!active}
              title={meta.title}
            >
              <span className="filter-chip-glyph" aria-hidden="true">⟐</span>
              <span className="filter-chip-text">{meta.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          className={`filter-chip filter-chip-fav${favoritesOnly ? ' active' : ''}`}
          onClick={() => onToggleFavorites?.()}
          aria-pressed={!!favoritesOnly}
          title="Show only favorited incantations"
        >
          <span className="filter-chip-glyph" aria-hidden="true">⛧</span>
          <span className="filter-chip-text">Favorites</span>
        </button>
        {anyActive ? (
          <button
            type="button"
            className="filter-chip filter-chip-clear"
            onClick={onClear}
            title="Clear all filters"
          >
            ✕ Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
