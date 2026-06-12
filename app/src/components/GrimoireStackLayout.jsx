import { useState, useCallback, useEffect } from 'react';
import SchoolCardGrid from './SchoolCardGrid.jsx';
import SpellDetailView from './SpellDetailView.jsx';
import SpellCard from './SpellCard.jsx';
import FavoritesView from './FavoritesView.jsx';
import RecipeLabView from './RecipeLabView.jsx';
import BestiaryCodex from './BestiaryCodex.jsx';
import SettingsView from './SettingsView.jsx';
import AllSchoolsView from './AllSchoolsView.jsx';
import GrimoireEye from './GrimoireEye.jsx';
import Icon from './Icon.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import { pageTurn } from '../audio/sounds.js';

const TABS = {
  LIBRARY: 'library',
  SPELLBOOK: 'spellbook',
  RECIPE_LAB: 'recipe-lab',
  ARCANE_TOOLS: 'arcane-tools',
  SETTINGS: 'settings',
};

const TAB_LABELS = {
  [TABS.LIBRARY]: { name: 'The Archives', icon: 'archive' },
  [TABS.SPELLBOOK]: { name: 'The Vault', icon: 'vault' },
  [TABS.RECIPE_LAB]: { name: "Alchemist's Workshop", icon: 'alembic' },
  [TABS.ARCANE_TOOLS]: { name: 'Arcane Tools', icon: 'tools' },
  [TABS.SETTINGS]: { name: 'Settings', icon: 'sigil' },
};

export default function GrimoireStackLayout({
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
  _castVote,
  _aggregateFor,
  castEnabled,
  onToggleCast,
  _onIntakeOpen,
  onCompareOpen,
  onCompareTwo,
  _onCastBones,
  onExportJson,
  onExportMarkdown,
  onShowShortcuts,
  _schoolFilter,
  _tierFilter,
  _favoritesOnly,
  _onToggleSchool,
  _onToggleTier,
  _onToggleFavorites,
  _onClearFilters,
  _filterResults,
  featuredSchools,
  _onFeaturedSchoolsChange,
}) {
  // hasNote lookup for the Bestiary Codex "Annotated" filter
  const hasNote = useCallback(
    (skill) => {
      const notes = marginalia?.notes || marginalia;
      if (!notes || typeof notes !== 'object') return false;
      return Boolean(notes[skill] && String(notes[skill]).trim());
    },
    [marginalia]
  );
  const [activeTab, setActiveTab] = useState(TABS.LIBRARY);
  const [pageKey, setPageKey] = useState('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsSearching(searchQuery.length > 0);
  }, [searchQuery]);

  const handleTabSelect = useCallback((tab) => {
    setActiveTab(tab);
    setPageKey(tab);
    pageTurn();
  }, []);

  const handleSchoolCardClick = useCallback((schoolId) => {
    onSchoolSelect(schoolId);
    setPageKey('school-detail');
  }, [onSchoolSelect]);

  const handleSpellCardClick = useCallback((spell, school) => {
    onSpellClick(spell, school);
    setPageKey('spell-detail');
  }, [onSpellClick]);

  const totalSchools = schools.length;
  const totalSpells = schools.reduce((sum, s) => sum + s.spells.length, 0);

  // Position featured schools around the eye
  const featured = featuredSchools
    .map(id => schools.find(s => s.id === id))
    .filter(Boolean)
    .slice(0, 6);

  const eyeRadius = isMobile ? 140 : 220;

  // Resolve the current school object from the id prop
  const activeSchool = currentSchool && currentSchool !== 'all'
    ? schools.find(s => s.id === currentSchool)
    : null;

  // Render the active content panel
  const renderContent = () => {
    if (pageKey === 'spell-detail' && activeSchool) {
      return (
        <SpellDetailView
          school={activeSchool}
          onBack={() => handleSchoolCardClick(activeSchool.id)}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          getVote={getVote}
        />
      );
    }
    if (pageKey === 'all-schools') {
      return (
        <AllSchoolsView
          schools={schools}
          onSchoolSelect={handleSchoolCardClick}
          searchQuery={searchQuery}
        />
      );
    }
    if (pageKey === 'school-detail' && activeSchool) {
      return (
        <div className="school-detail">
          <div className="school-detail__header">
            <button
              type="button"
              className="school-detail__back"
              onClick={() => handleTabSelect(TABS.LIBRARY)}
              aria-label="Back to all schools"
            >
              ← All Schools
            </button>
            <div className="school-detail__title">
              <span className="school-detail__symbol">{activeSchool.symbol}</span>
              <div>
                <h2 className="school-detail__name">{activeSchool.real}</h2>
                <p className="school-detail__count">
                  {activeSchool.spells.length} {activeSchool.spells.length === 1 ? 'spell' : 'spells'}
                </p>
              </div>
            </div>
          </div>
          <div className="school-detail__grid">
            {activeSchool.spells.map((spell) => (
              <SpellCard
                key={spell.name}
                spell={spell}
                onClick={() => handleSpellCardClick(spell, activeSchool)}
                isFavorited={isFavorited(spell.name, spell.skill)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case TABS.LIBRARY:
        return searchQuery ? (
          <AllSchoolsView
            schools={schools}
            onSchoolSelect={handleSchoolCardClick}
            searchQuery={searchQuery}
          />
        ) : (
          <SchoolCardGrid
            schools={schools}
            featuredSchools={featuredSchools}
            onSchoolSelect={handleSchoolCardClick}
            onViewAll={() => handleSchoolCardClick(null)}
          />
        );
      case TABS.SPELLBOOK:
        return (
          <FavoritesView
            schools={schools}
            favorites={favorites}
            recent={recent}
            marginalia={marginalia}
            onSpellClick={handleSpellCardClick}
            isFavorited={isFavorited}
            onToggleFavorite={onToggleFavorite}
          />
        );
      case TABS.RECIPE_LAB:
        return (
          <RecipeLabView
            schools={schools}
            onSpellClick={handleSpellCardClick}
            onCompareOpen={onCompareOpen}
            onCompareTwo={onCompareTwo}
          />
        );
      case TABS.ARCANE_TOOLS:
        return (
          <BestiaryCodex
            schools={schools}
            onSpellClick={handleSpellCardClick}
            isFavorited={isFavorited}
            hasNote={hasNote}
          />
        );
      case TABS.SETTINGS:
        return (
          <SettingsView
            castEnabled={castEnabled}
            onToggleCast={onToggleCast}
            onShowShortcuts={onShowShortcuts}
            onExportJson={onExportJson}
            onExportMarkdown={onExportMarkdown}
          />
        );
      default:
        return (
          <SchoolCardGrid
            schools={schools}
            featuredSchools={featuredSchools}
            onSchoolSelect={handleSchoolCardClick}
            onViewAll={() => handleSchoolCardClick(null)}
            isFavorited={isFavorited}
            onToggleFavorite={onToggleFavorite}
          />
        );
    }
  };

  return (
    <div className={`grimoirestack-layout ${isMobile ? 'grimoirestack-layout--mobile' : ''}`}>
      {/* Abyssal background with floating particles */}
      <div className="abyss-background" />

      {/* Corner tentacle decorations */}
      <svg className="corner-vines corner-vines--tl" viewBox="0 0 200 200" preserveAspectRatio="xMinYMin meet">
        <path d="M 0,40 C 40,35 60,60 80,50 C 100,40 110,70 130,55 C 150,40 160,80 180,65" 
          fill="none" stroke="rgba(138,154,106,0.06)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 0,55 C 35,50 55,75 75,65 C 95,55 105,85 125,70 C 145,55 155,95 175,80" 
          fill="none" stroke="rgba(122,58,90,0.04)" strokeWidth="1" strokeLinecap="round" />
        <path d="M 0,25 C 30,20 50,45 70,35 C 90,25 100,55 120,40" 
          fill="none" stroke="rgba(138,154,106,0.04)" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
      <svg className="corner-vines corner-vines--tr" viewBox="0 0 200 200" preserveAspectRatio="xMaxYMin meet">
        <path d="M 200,40 C 160,35 140,60 120,50 C 100,40 90,70 70,55 C 50,40 40,80 20,65" 
          fill="none" stroke="rgba(138,154,106,0.06)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 200,55 C 165,50 145,75 125,65 C 105,55 95,85 75,70 C 55,55 45,95 25,80" 
          fill="none" stroke="rgba(122,58,90,0.04)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <svg className="corner-vines corner-vines--bl" viewBox="0 0 200 200" preserveAspectRatio="xMinYMax meet">
        <path d="M 0,160 C 40,165 60,140 80,150 C 100,160 110,130 130,145 C 150,160 160,120 180,135" 
          fill="none" stroke="rgba(138,154,106,0.06)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 0,145 C 35,150 55,125 75,135 C 95,145 105,115 125,130 C 145,145 155,105 175,120" 
          fill="none" stroke="rgba(122,58,90,0.04)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <svg className="corner-vines corner-vines--br" viewBox="0 0 200 200" preserveAspectRatio="xMaxYMax meet">
        <path d="M 200,160 C 160,165 140,140 120,150 C 100,160 90,130 70,145 C 50,160 40,120 20,135" 
          fill="none" stroke="rgba(138,154,106,0.06)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 200,145 C 165,150 145,125 125,135 C 105,145 95,115 75,130 C 55,145 45,105 25,120" 
          fill="none" stroke="rgba(122,58,90,0.04)" strokeWidth="1" strokeLinecap="round" />
      </svg>

      {/* Top nav tabs */}
      {!isMobile && (
        <nav className="eye-top-nav" aria-label="Main navigation">
          {[
            { id: TABS.LIBRARY, label: 'ARCHIVE' },
            { id: TABS.SPELLBOOK, label: 'THE VAULT' },
            { id: TABS.RECIPE_LAB, label: 'RITUALS' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`eye-top-tab ${activeTab === tab.id ? 'eye-top-tab--active' : ''}`}
              onClick={() => handleTabSelect(tab.id)}
              type="button"
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      <div className="eye-main">
        {/* Left sidebar */}
        <aside className="eye-sidebar">
          <div className="eye-sidebar__header">
            <div className="eye-brand">
              <span className="eye-brand__icon"><Icon name="archive" size="20" /></span>
              <span className="eye-brand__name">GrimoireStack</span>
            </div>
            <div className="eye-stats">
              <div className="eye-stat">
                <span className="eye-stat__num">{totalSchools}</span>
                <span className="eye-stat__label">Wardens</span>
              </div>
              <div className="eye-stat">
                <span className="eye-stat__num">{totalSpells}</span>
                <span className="eye-stat__label">Entities</span>
              </div>
            </div>

            {/* Warden Badge */}
            <div className="warden-badge">
              <div className="warden-badge__title">The Great Eye</div>
              <div className="warden-badge__status">
                <span className="warden-badge__status-dot" />
                Weakened
              </div>
              <div className="warden-badge__progress">
                <div className="warden-badge__progress-bar">
                  <div className="warden-badge__progress-fill" style={{ width: '100%' }} />
                </div>
                <span className="warden-badge__progress-text">6 of 6 Schools Researched</span>
              </div>
            </div>
          </div>

          <nav className="eye-sidebar__nav" aria-label="Sidebar navigation">
            {Object.entries(TAB_LABELS).map(([key, { name, icon }]) => (
              <button
                key={key}
                className={`eye-nav-btn ${activeTab === key ? 'eye-nav-btn--active' : ''}`}
                onClick={() => handleTabSelect(key)}
                type="button"
              >
                <span className="eye-nav-btn__icon"><Icon name={icon} size="18" /></span>
                <span className="eye-nav-btn__name">{name}</span>
              </button>
            ))}
          </nav>

          <div className="eye-sidebar__footer">
            <LanguageToggle />
            <button className="eye-footer-link" onClick={onShowShortcuts} type="button">
              ⌨ Shortcuts
            </button>
            <button className="eye-footer-link" onClick={onExportJson} type="button">
              📋 Export JSON
            </button>
            <button className="eye-footer-link" onClick={onExportMarkdown} type="button">
              📄 Export MD
            </button>
          </div>
        </aside>

        {/* Center stage - The Great Eye */}
        <main className="eye-stage">
          <GrimoireEye
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            totalMatches={totalMatches}
            featuredSchools={featured}
            onSchoolSelect={handleSchoolCardClick}
            isSearching={isSearching}
            eyeRadius={eyeRadius}
          />
        </main>

        {/* Right panel - content */}
        <aside className="eye-panel">
          <div className="eye-panel__content">
            {renderContent()}
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav className="eye-bottom-nav">
          {Object.entries(TAB_LABELS).map(([key, { name, icon }]) => (
            <button
              key={key}
              className={`eye-bottom-btn ${activeTab === key ? 'eye-bottom-btn--active' : ''}`}
              onClick={() => handleTabSelect(key)}
              type="button"
            >
              <span className="eye-bottom-btn__icon"><Icon name={icon} size="20" /></span>
              <span className="eye-bottom-btn__label">{name}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Footer tagline */}
      <footer className="eye-footer">
        <span className="eye-footer__quote">"All eyes remain open."</span>
        <a
          className="eye-footer__github"
          href="https://github.com/StepowskiEric/GrimoireStack"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GrimoireStack on GitHub"
          title="GrimoireStack on GitHub"
        >
          <svg
            className="eye-footer__github-icon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.28-1.67-1.28-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          <span className="eye-footer__github-label">Source</span>
        </a>
      </footer>
    </div>
  );
}
