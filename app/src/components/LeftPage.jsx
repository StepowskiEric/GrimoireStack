// Tab constants (defined locally to avoid circular dependency with BookLayout)
const TABS = {
  LIBRARY: 'library',
  SPELLBOOK: 'spellbook',
  RECIPE_LAB: 'recipe-lab',
  ARCANE_TOOLS: 'arcane-tools',
  SETTINGS: 'settings',
};

const TAB_LABELS = {
  [TABS.LIBRARY]: { name: 'The Archives', icon: '👁️' },
  [TABS.SPELLBOOK]: { name: 'The Vault', icon: '🔒' },
  [TABS.RECIPE_LAB]: { name: "Alchemist's Workshop", icon: '⚗️' },
  [TABS.ARCANE_TOOLS]: { name: 'Arcane Tools', icon: '🔮' },
  [TABS.SETTINGS]: { name: 'Settings', icon: '⚙️' },
};

export default function LeftPage({
  activeTab,
  onTabSelect,
  searchQuery,
  onSearchChange,
  totalMatches,
  onWizardOpen,
  castEnabled,
  onToggleCast,
  onShowShortcuts,
  onExportJson,
  onExportMarkdown,
  schools,
  favorites,
  recent,
  marginalia,
}) {
  const totalSchools = schools.length;
  const totalSpells = schools.reduce((sum, s) => sum + s.spells.length, 0);

  return (
    <div className="left-page">
      {/* Page decorations */}
      <div className="page-corner page-corner--tl">ᚦ ᛖ ᛒ</div>
      <div className="page-corner page-corner--bl">ᛟ ᚲ ᛉ</div>
      <div className="page-stain page-stain--1" />
      <div className="page-burn page-burn--1" />
      
      {/* Title */}
      <div className="left-page__header">
        <h1 className="left-page__title">ELDRITCHEYE</h1>

        {/* Stats */}
        <div className="left-page__stats">
          <div className="stat-box">
            <span className="stat-number">{totalSchools}</span>
            <span className="stat-label">WARDENS</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{totalSpells}</span>
            <span className="stat-label">ENTITIES CATALOGED</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="left-page__search">
        <div className="search-input-wrap">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Scry the archives... describe your affliction or need..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search spells"
          />
        </div>
        {searchQuery && totalMatches > 0 && (
          <div className="search-results-count">{totalMatches} matches found</div>
        )}
        {searchQuery && totalMatches === 0 && (
          <button
            className="wizard-btn"
            onClick={onWizardOpen}
            type="button"
          >
            Consult the Wizard
          </button>
        )}
      </div>

      {/* Navigation tabs */}
      <nav className="left-page__nav" aria-label="Main navigation">
        {Object.entries(TAB_LABELS).map(([key, { name, icon }]) => (
          <button
            key={key}
            className={`nav-tab ${activeTab === key ? 'nav-tab--active' : ''}`}
            onClick={() => onTabSelect(key)}
            type="button"
            aria-current={activeTab === key ? 'page' : undefined}
          >
            <span className="nav-tab__icon" aria-hidden="true">{icon}</span>
            <span className="nav-tab__name">{name}</span>
          </button>
        ))}
      </nav>

      {/* Settings quick access */}
      <div className="left-page__footer">
        <label className="cast-toggle">
          <input
            type="checkbox"
            checked={castEnabled}
            onChange={onToggleCast}
          />
          <span>Cast animation</span>
        </label>
        
        <div className="footer-links">
          <button
            className="footer-link"
            onClick={onShowShortcuts}
            type="button"
          >
            ⌨ Shortcuts
          </button>
          <button
            className="footer-link"
            onClick={onExportJson}
            type="button"
          >
            📋 Export JSON
          </button>
          <button
            className="footer-link"
            onClick={onExportMarkdown}
            type="button"
          >
            📄 Export MD
          </button>
        </div>
      </div>
    </div>
  );
}
