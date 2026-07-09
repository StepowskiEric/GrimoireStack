import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SchoolCardGrid from './SchoolCardGrid.jsx';
import SpellDetailView from './SpellDetailView.jsx';
import SpellCard from './SpellCard.jsx';
import FavoritesView from './FavoritesView.jsx';
import RecipeLabView from './RecipeLabView.jsx';
import BestiaryCodex from './BestiaryCodex.jsx';
import SpellWeb from './SpellWeb.jsx';
import ChangelogView from './ChangelogView.jsx';
import SettingsView from './SettingsView.jsx';
import AllSchoolsView from './AllSchoolsView.jsx';
import GrimoireEye from './GrimoireEye.jsx';
import SchoolSigil from './SchoolSigil.tsx';
import Icon from './Icon.jsx';
import AboutView from './AboutView.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import RitualPanel from './RitualPanel.jsx';
import { useRitualOrchestrator } from '../hooks/useRitualOrchestrator.js';
import { useGaze } from '../hooks/useGaze.js';
import WanderingAnimation from './WanderingAnimation.jsx';

const SCHOOL_MAP = grimoireIndex.getSchoolMap();

const CommuneView = lazy(() => import('./CommuneView.jsx'));
const GazePreview = import.meta.env.DEV ? lazy(() => import('../views/GazePreview.jsx')) : null;

const TABS = {
  ABOUT: 'about',
  LIBRARY: 'library',
  SPELLBOOK: 'spellbook',
  RECIPE_LAB: 'rituals',
  ARCANE_TOOLS: 'bestiary',
  SPELL_WEB: 'spellweb',
  CHANGELOG: 'changelog',
  SETTINGS: 'settings',
  SEANCE: 'seance',
};

const TAB_ROUTES = {
  [TABS.ABOUT]: '/about',
  [TABS.LIBRARY]: '/',
  [TABS.SPELLBOOK]: '/vault',
  [TABS.RECIPE_LAB]: '/rituals',
  [TABS.ARCANE_TOOLS]: '/bestiary',
  [TABS.SPELL_WEB]: '/spellweb',
  [TABS.CHANGELOG]: '/changelog',
  [TABS.SETTINGS]: '/settings',
  [TABS.SEANCE]: '/commune',
};

const TAB_LABELS = {
  [TABS.ABOUT]: { name: 'The Tome', icon: 'index' },
  [TABS.LIBRARY]: { name: 'The Spine', icon: 'archive' },
  [TABS.SPELLBOOK]: { name: 'The Vault', icon: 'vault' },
  [TABS.RECIPE_LAB]: { name: 'The Crucible', icon: 'alembic' },
  [TABS.ARCANE_TOOLS]: { name: 'The Bestiary', icon: 'tools' },
  [TABS.SPELL_WEB]: { name: 'Spell Web', icon: 'graph' },
  [TABS.CHANGELOG]: { name: 'Changelog', icon: 'changelog' },
  [TABS.SETTINGS]: { name: 'Settings', icon: 'sigil' },
  [TABS.SEANCE]: { name: 'The Séance', icon: 'oracle' },
};

export default function GrimoireStackLayout({
  currentSchool,
  onSchoolSelect,
  searchQuery,
  onSpellClick,
  isFavorited,
  onToggleFavorite,
  favorites,
  recent,
  marginalia,
  getVote,
  castEnabled,
  onToggleCast,
  audioEnabled,
  onToggleAudio,
  onCompareOpen,
  onCompareTwo,
  onExportJson,
  onExportMarkdown,
  onShowShortcuts,
  sync,
  filterResults: _filterResults,
  featuredSchools,
  eyeMood = 'neutral',
  onSpellView,
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
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track page state for sub-views
  const [pageKey, setPageKey] = useState('home');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabSelect = useCallback((tab) => {
    const route = TAB_ROUTES[tab] || '/';
    setPageKey('home');
    navigate(route);
  }, [navigate]);

  const navigateToLibrary = useCallback(() => handleTabSelect(TABS.LIBRARY), [handleTabSelect]);

  // Wandering animation state — set when the ritual converges on a result
  const [wandering, setWandering] = useState(null);

  // Intercept spell opens from the ritual flow to show the wandering animation first
  const handleRitualSpellOpen = useCallback((spell, school) => {
    setWandering({ spell, school });
  }, []);

  const ritualOrch = useRitualOrchestrator({ onSpellClick: handleRitualSpellOpen, navigateToLibrary });
  const { gaze } = useGaze(ritualOrch.ritual);

  const handleWanderingComplete = useCallback(() => {
    if (wandering) {
      onSpellClick(wandering.spell, wandering.school);
      setWandering(null);
    }
  }, [wandering, onSpellClick]);

  // Derive active tab from URL
  const activeTab = (() => {
    const path = location.pathname;
    if (path === '/about') return TABS.ABOUT;
    if (path === '/') return TABS.LIBRARY;
    if (path === '/vault') return TABS.SPELLBOOK;
    if (path === '/rituals') return TABS.RECIPE_LAB;
    if (path === '/bestiary') return TABS.ARCANE_TOOLS;
    if (path === '/spellweb') return TABS.SPELL_WEB;
    if (path === '/changelog') return TABS.CHANGELOG;
    if (path === '/settings') return TABS.SETTINGS;
    if (path === '/commune') return TABS.SEANCE;
    return TABS.LIBRARY;
  })();

  const handleSchoolCardClick = useCallback((schoolId) => {
    onSchoolSelect(schoolId);
    setPageKey('school-detail');
  }, [onSchoolSelect]);

  const handleSpellCardClick = useCallback((spell, school) => {
    onSpellClick(spell, school);
    setPageKey('spell-detail');
    onSpellView?.(spell.skill);
  }, [onSpellClick, onSpellView]);

  const { totalSchools, totalSpells } = grimoireIndex.getStats();



  // Resolve the current school object from the id prop
  const activeSchool = currentSchool && currentSchool !== 'all'
    ? SCHOOL_MAP.get(currentSchool)
    : null;

  // Render the active content panel
  const renderContent = () => {
    // Handle sub-views within tabs
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
              <span className="school-detail__symbol"><SchoolSigil schoolId={activeSchool.id} size={36} /></span>
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

    // Main tab content
    switch (activeTab) {
      case TABS.ABOUT:
        return <AboutView />;
      case TABS.LIBRARY:
        return searchQuery ? (
          <AllSchoolsView
            onSchoolSelect={handleSchoolCardClick}
            searchQuery={searchQuery}
          />
        ) : (
          <SchoolCardGrid
            featuredSchools={featuredSchools}
            onSchoolSelect={handleSchoolCardClick}
          />
        );
      case TABS.SPELLBOOK:
        return (
          <FavoritesView
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
            onSpellClick={handleSpellCardClick}
            onCompareOpen={onCompareOpen}
            onCompareTwo={onCompareTwo}
          />
        );
      case TABS.ARCANE_TOOLS:
        return (
          <BestiaryCodex
            onSpellClick={handleSpellCardClick}
            isFavorited={isFavorited}
            hasNote={hasNote}
          />
        );
      case TABS.SPELL_WEB:
        return (
          <SpellWeb
            onSpellClick={handleSpellCardClick}
          />
        );
      case TABS.CHANGELOG:
        return (
          <ChangelogView />
        );
      case TABS.SETTINGS:
        return (
          <SettingsView
            castEnabled={castEnabled}
            onToggleCast={onToggleCast}
            audioEnabled={audioEnabled}
            onToggleAudio={onToggleAudio}
            onShowShortcuts={onShowShortcuts}
            onExportJson={onExportJson}
            onExportMarkdown={onExportMarkdown}
            sync={sync}
          />
        );
      case TABS.SEANCE:
        return (
          <Suspense fallback={<div className="modal-suspense-fallback">Summoning...</div>}>
            <CommuneView onSpellClick={onSpellClick} audioEnabled={audioEnabled} />
          </Suspense>
        );
      default:
        return (
          <SchoolCardGrid
            featuredSchools={featuredSchools}
            onSchoolSelect={handleSchoolCardClick}
          />
        );
    }
  };

  // Dev-only gaze fixture: short-circuit the whole shell at /gaze-preview.
  // GazePreview is lazy-imported only in DEV, so prod never bundles it.
  if (import.meta.env.DEV && location.pathname === '/gaze-preview' && GazePreview) {
    return (
      <Suspense fallback={<div className="modal-suspense-fallback">Summoning the gaze…</div>}>
        <GazePreview />
      </Suspense>
    );
  }
  return (
    <div className={`grimoirestack-layout ${isMobile ? 'grimoirestack-layout--mobile' : ''}`} data-gaze={gaze} style={{ '--gaze-veil': gaze }}>
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

      {/* Ritual Walk candlelight overlay */}
      {ritualOrch.ritualWalkHook.phase !== 'idle' && (
        <div className={`ritual-walk-overlay ritual-walk-overlay--${ritualOrch.ritualWalkHook.phase}`} aria-hidden="true" />
      )}
      {/* Whole-page gaze veil — void vignette + cold desaturation (Slice 08) */}
      <div className="gaze-veil" aria-hidden="true" />
      <div className="eye-main">
        {/* Left sidebar */}
        <aside className="eye-sidebar" aria-label="Sidebar">
          <div className="eye-sidebar__header">
            <div className="eye-brand">
              <span className="eye-brand__icon"><Icon name="archive" size="20" /></span>
              <span className="eye-brand__name">GrimoireStack</span>
            </div>
            <div className="eye-stats">
              <div className="eye-stat">
                <span className="eye-stat__num">{totalSchools}</span>
                <span className="eye-stat__label">Schools</span>
              </div>
              <div className="eye-stat">
                <span className="eye-stat__num">{totalSpells}</span>
                <span className="eye-stat__label">Spells</span>
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
            <div className="eye-sidebar__footer-divider" />
            <button className="eye-footer-link" onClick={onShowShortcuts} type="button">
              <Icon name="sigil" size={14} /> Shortcuts
            </button>
            <button className="eye-footer-link" onClick={onExportJson} type="button">
              <Icon name="archive" size={14} /> Export JSON
            </button>
            <button className="eye-footer-link" onClick={onExportMarkdown} type="button">
              <Icon name="clipboard" size={14} /> Export Markdown
            </button>
          </div>
        </aside>

        {/* Center stage - The Great Eye */}
        <main className="eye-stage">
          <GrimoireEye
            mood={eyeMood}
            gaze={gaze}
          />

          {/* The Ritual — the only path for guided problem intake */}
          <div className={`oracle-cta ${ritualOrch.activePanel ? 'oracle-cta--open' : ''}`}>
            {!ritualOrch.activePanel && (
              <button
                type="button"
                className="oracle-cta__btn oracle-cta__btn--ritual"
                onClick={ritualOrch.openRitual}
                aria-label="Begin the Ritual"
              >
                <span className="oracle-cta__icon"><Icon name="oracle" size={20} /></span>
                <span className="oracle-cta__label">Begin the Ritual</span>
                <span className="oracle-cta__chevron" />
              </button>
            )}
            {ritualOrch.activePanel === 'ritual' && (
              <div className="oracle-cta__body">
                <RitualPanel
                  ritual={ritualOrch.ritual}
                  onConverge={ritualOrch.handleRitualConverge}
                />
              </div>
            )}
          </div>
        </main>

        {/* Right panel - content */}
        <aside className="eye-panel" aria-label="Main content">
          <div className="eye-panel__content" id="main-content" key={`${activeTab}-${pageKey}-${searchQuery || ''}`}>
            <div className="spine-transition">
              {renderContent()}
            </div>
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
      {wandering && (
        <WanderingAnimation
          skillName={wandering.spell.name}
          onComplete={handleWanderingComplete}
        />
      )}
    </div>
  );
}
