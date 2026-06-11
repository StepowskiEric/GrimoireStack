import { useState, useCallback, useMemo } from 'react';
import LeftPage from './LeftPage.jsx';
import RightPage from './RightPage.jsx';
import BottomNav from './BottomNav.jsx';

export const TABS = {
  LIBRARY: 'library',
  SPELLBOOK: 'spellbook',
  RECIPE_LAB: 'recipe-lab',
  ARCANE_TOOLS: 'arcane-tools',
  SETTINGS: 'settings',
};

export const TAB_LABELS = {
  [TABS.LIBRARY]: { name: 'The Archives', icon: '👁️' },
  [TABS.SPELLBOOK]: { name: 'The Vault', icon: '🔒' },
  [TABS.RECIPE_LAB]: { name: "Alchemist's Workshop", icon: '⚗️' },
  [TABS.ARCANE_TOOLS]: { name: 'Arcane Tools', icon: '🔮' },
  [TABS.SETTINGS]: { name: 'Settings', icon: '⚙️' },
};

export default function BookLayout({
  schools,
  currentSchool,
  onSchoolSelect,
  searchQuery,
  onSearchChange,
  totalMatches,
  onSpellClick,
  isFavorited,
  onToggleFavorite,
  favorites,
  recent,
  marginalia,
  getVote,
  castVote,
  aggregateFor,
  castEnabled,
  onToggleCast,
  onWizardOpen,
  onIntakeOpen,
  onCompareOpen,
  onCastBones,
  onExportJson,
  onExportMarkdown,
  onShowShortcuts,
  schoolFilter,
  tierFilter,
  favoritesOnly,
  onToggleSchool,
  onToggleTier,
  onToggleFavorites,
  onClearFilters,
  filterResults,
  featuredSchools,
  onFeaturedSchoolsChange,
}) {
  const [activeTab, setActiveTab] = useState(TABS.LIBRARY);
  const [rightPageKey, setRightPageKey] = useState('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect mobile
  useMemo(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabSelect = useCallback((tab) => {
    setActiveTab(tab);
    setRightPageKey(tab);
  }, []);

  const handleSchoolCardClick = useCallback((schoolId) => {
    onSchoolSelect(schoolId);
    setRightPageKey('school-detail');
  }, [onSchoolSelect]);

  const handleSpellCardClick = useCallback((spell, school) => {
    onSpellClick(spell, school);
    setRightPageKey('spell-detail');
  }, [onSpellClick]);

  // Top navigation tabs (desktop only)
  const topTabs = [
    { id: TABS.LIBRARY, label: 'ARCHIVE' },
    { id: TABS.SPELLBOOK, label: 'THE VAULT' },
    { id: TABS.RECIPE_LAB, label: 'RITUALS' },
  ];

  return (
    <div className={`book-layout ${isMobile ? 'book-layout--mobile' : 'book-layout--desktop'}`}>
      {/* Stone pedestal background */}
      <div className="stone-background" />
      
      {/* Top navigation tabs (desktop only) */}
      {!isMobile && (
        <nav className="top-nav-tabs" aria-label="Main navigation">
          {topTabs.map((tab) => (
            <button
              key={tab.id}
              className={`top-nav-tab ${activeTab === tab.id ? 'top-nav-tab--active' : ''}`}
              onClick={() => handleTabSelect(tab.id)}
              type="button"
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}
      
      {/* Book container */}
      <div className="book-container">
        {/* Left page */}
        <LeftPage
          activeTab={activeTab}
          onTabSelect={handleTabSelect}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          totalMatches={totalMatches}
          onWizardOpen={onWizardOpen}
          castEnabled={castEnabled}
          onToggleCast={onToggleCast}
          onShowShortcuts={onShowShortcuts}
          onExportJson={onExportJson}
          onExportMarkdown={onExportMarkdown}
          schools={schools}
          favorites={favorites}
          recent={recent}
          marginalia={marginalia}
        />
        
        {/* Book spine */}
        <div className="book-spine" />
        
        {/* Right page */}
        <RightPage
          activeTab={activeTab}
          pageKey={rightPageKey}
          schools={schools}
          currentSchool={currentSchool}
          onSchoolSelect={handleSchoolCardClick}
          onSpellClick={handleSpellCardClick}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          favorites={favorites}
          recent={recent}
          marginalia={marginalia}
          getVote={getVote}
          castVote={castVote}
          aggregateFor={aggregateFor}
          onIntakeOpen={onIntakeOpen}
          onCompareOpen={onCompareOpen}
          onCastBones={onCastBones}
          schoolFilter={schoolFilter}
          tierFilter={tierFilter}
          favoritesOnly={favoritesOnly}
          onToggleSchool={onToggleSchool}
          onToggleTier={onToggleTier}
          onToggleFavorites={onToggleFavorites}
          onClearFilters={onClearFilters}
          filterResults={filterResults}
          featuredSchools={featuredSchools}
          onFeaturedSchoolsChange={onFeaturedSchoolsChange}
        />
      </div>
      
      {/* Mobile bottom nav */}
      {isMobile && (
        <BottomNav
          activeTab={activeTab}
          onTabSelect={handleTabSelect}
        />
      )}
    </div>
  );
}
