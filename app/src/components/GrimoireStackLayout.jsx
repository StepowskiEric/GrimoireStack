import { useState, useCallback, lazy, Suspense } from 'react';
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
import VoidIncantations from './VoidIncantations.jsx';

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
  const [pageKey, setPageKey] = useState('home');
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
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-3 py-2 border border-border text-text-muted text-[0.68rem] uppercase tracking-wider transition-colors hover:border-border-hover hover:text-text-primary"
              onClick={() => handleTabSelect(TABS.LIBRARY)}
              aria-label="Back to all schools"
            >
              ← All Schools
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sickly"><SchoolSigil schoolId={activeSchool.id} size={36} /></span>
              <div>
                <h2 className="font-['Cinzel'] text-[1rem] font-bold text-text-primary tracking-wide">{activeSchool.real}</h2>
                <p className="text-text-muted text-[0.78rem]">
                  {activeSchool.spells.length} {activeSchool.spells.length === 1 ? 'spell' : 'spells'}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
    <div
      className="flex min-h-screen flex-col relative z-[1]"
      data-gaze={gaze}
      style={{ '--gaze-veil': gaze }}
    >
      {/* Abyssal background with floating particles */}
      <div className="abyss-background" aria-hidden="true" />

      {/* Corner tentacle decorations */}
      <svg className="absolute top-0 left-0 w-[200px] h-[200px] pointer-events-none" viewBox="0 0 200 200" preserveAspectRatio="xMinYMin meet">
        <path d="M 0,40 C 40,35 60,60 80,50 C 100,40 110,70 130,55 C 150,40 160,80 180,65" 
          fill="none" stroke="rgba(138,154,106,0.06)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 0,55 C 35,50 55,75 75,65 C 95,55 105,85 125,70 C 145,55 155,95 175,80" 
          fill="none" stroke="rgba(122,58,90,0.04)" strokeWidth="1" strokeLinecap="round" />
        <path d="M 0,25 C 30,20 50,45 70,35 C 90,25 100,55 120,40" 
          fill="none" stroke="rgba(138,154,106,0.04)" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
      <svg className="absolute top-0 right-0 w-[200px] h-[200px] pointer-events-none" viewBox="0 0 200 200" preserveAspectRatio="xMaxYMin meet">
        <path d="M 200,40 C 160,35 140,60 120,50 C 100,40 90,70 70,55 C 50,40 40,80 20,65" 
          fill="none" stroke="rgba(138,154,106,0.06)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 200,55 C 165,50 145,75 125,65 C 105,55 95,85 75,70 C 55,55 45,95 25,80" 
          fill="none" stroke="rgba(122,58,90,0.04)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-[200px] h-[200px] pointer-events-none" viewBox="0 0 200 200" preserveAspectRatio="xMinYMax meet">
        <path d="M 0,160 C 40,165 60,140 80,150 C 100,160 110,130 130,145 C 150,160 160,120 180,135" 
          fill="none" stroke="rgba(138,154,106,0.06)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 0,145 C 35,150 55,125 75,135 C 95,145 105,115 125,130 C 145,145 155,105 175,120" 
          fill="none" stroke="rgba(122,58,90,0.04)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-[200px] h-[200px] pointer-events-none" viewBox="0 0 200 200" preserveAspectRatio="xMaxYMax meet">
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
      {/* Cosmic tendrils at peak gaze — Slice 09 */}
      <div className="gaze-tentacles" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMin slice">
          <defs>
            <linearGradient id="tentacleGradShell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a6cff" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#7fd4ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#b04a8a" stopOpacity="0" />
            </linearGradient>
            <filter id="tentacleSoftShell" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
          </defs>
          <g filter="url(#tentacleSoftShell)" fill="none" stroke="url(#tentacleGradShell)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M 180 0 C 150 70, 210 140, 170 210 S 140 300, 190 350" />
            <path d="M 400 0 C 430 60, 360 130, 405 200 S 440 290, 395 345" />
            <path d="M 620 0 C 590 65, 655 135, 610 205 S 580 295, 630 348" />
            <path d="M 840 0 C 870 70, 805 140, 850 210 S 885 300, 835 352" />
          </g>
        </svg>
      </div>
      {/* Void incantations — the eye listens at peak gaze (Slice 10) */}
      <VoidIncantations gaze={gaze} />
      <div className="flex flex-1 w-full flex-col px-3 pb-20 pt-5 md:p-5 md:flex-row">
        {/* Left sidebar */}
        <aside className="w-full min-w-full flex-row flex-wrap gap-2 p-3 mb-3 md:w-60 md:min-w-60 md:flex-col md:p-4 bg-[rgba(8,10,16,0.6)] border border-[rgba(138,154,106,0.08)] rounded-lg backdrop-blur-md" aria-label="Sidebar">
          <div className="w-full mb-3 pb-3 border-b border-[rgba(138,154,106,0.1)] md:text-center md:mb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center text-sickly drop-shadow-[0_0_8px_rgba(138,154,106,0.3)]"><Icon name="archive" size="20" /></span>
              <span className="font-display font-black text-[1.2rem] text-[#c8d8e0] tracking-wide">GrimoireStack</span>
            </div>
            <div className="flex justify-center gap-2">
              <div className="flex flex-col items-center p-1.5 bg-[rgba(138,154,106,0.04)] border border-[rgba(138,154,106,0.1)] rounded">
                <span className="font-['Cinzel'] text-[1.1rem] font-bold text-sickly">{totalSchools}</span>
                <span className="font-['Cinzel'] text-[0.5rem] uppercase tracking-widest text-silver-dim">Schools</span>
              </div>
              <div className="flex flex-col items-center p-1.5 bg-[rgba(138,154,106,0.04)] border border-[rgba(138,154,106,0.1)] rounded">
                <span className="font-['Cinzel'] text-[1.1rem] font-bold text-sickly">{totalSpells}</span>
                <span className="font-['Cinzel'] text-[0.5rem] uppercase tracking-widest text-silver-dim">Spells</span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex md:flex-col md:gap-1 md:flex-1" aria-label="Sidebar navigation">
            {Object.entries(TAB_LABELS).map(([key, { name, icon }]) => (
              <button
                key={key}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-all duration-200 ${activeTab === key ? 'bg-[rgba(138,154,106,0.12)] border border-[rgba(138,154,106,0.35)] shadow-[0_0_18px_rgba(138,154,106,0.1),inset_0_1px_0_rgba(138,154,106,0.05)]' : 'bg-[rgba(138,154,106,0.02)] border border-transparent hover:bg-[rgba(138,154,106,0.05)] hover:border-[rgba(138,154,106,0.1)] hover:shadow-[0_0_10px_rgba(138,154,106,0.04)]'}`}
                onClick={() => handleTabSelect(key)}
                type="button"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 text-sickly flex-shrink-0"><Icon name={icon} size="18" /></span>
                <span className={`font-['Cinzel'] text-[0.65rem] font-semibold uppercase tracking-wide ${activeTab === key ? 'text-sickly-bright' : 'text-silver'}`}>{name}</span>
              </button>
            ))}
          </nav>

          <div className="w-full mt-2 pt-2 border-t border-[rgba(138,154,106,0.08)] flex flex-wrap gap-2 justify-center md:mt-auto md:pt-3">
            <LanguageToggle />
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(138,154,106,0.12)] to-transparent" />
            <button className="px-3 py-1.5 border border-border text-text-muted text-[0.68rem] uppercase tracking-wider transition-colors hover:border-border-hover hover:text-text-primary" onClick={onShowShortcuts} type="button">
              <Icon name="sigil" size={14} /> Shortcuts
            </button>
            <button className="px-3 py-1.5 border border-border text-text-muted text-[0.68rem] uppercase tracking-wider transition-colors hover:border-border-hover hover:text-text-primary" onClick={onExportJson} type="button">
              <Icon name="archive" size={14} /> Export JSON
            </button>
            <button className="px-3 py-1.5 border border-border text-text-muted text-[0.68rem] uppercase tracking-wider transition-colors hover:border-border-hover hover:text-text-primary" onClick={onExportMarkdown} type="button">
              <Icon name="clipboard" size={14} /> Export Markdown
            </button>
          </div>
        </aside>

        {/* Center stage - The Great Eye */}
        <main className="flex flex-1 flex-col items-center justify-start relative min-h-[500px] overflow-y-auto gap-3 p-4 pb-8">
          <GrimoireEye
            mood={eyeMood}
            gaze={gaze}
          />

          {/* The Ritual — the only path for guided problem intake */}
          <div className={`w-full max-w-[480px] flex flex-col gap-2 mt-1 ${ritualOrch.activePanel ? 'max-w-[520px]' : ''}`}>
            {!ritualOrch.activePanel && (
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-b from-[rgba(20,28,40,.7)] to-[rgba(10,14,22,.9)] border border-[rgba(138,154,106,.25)] rounded-lg cursor-pointer transition-all duration-200 font-['Cinzel'] text-[0.85rem] font-semibold uppercase tracking-widest text-sickly-bright hover:border-[rgba(138,154,106,.5)] hover:shadow-[0_0_20px_rgba(138,154,106,.15)]"
                onClick={ritualOrch.openRitual}
                aria-label="Begin the Ritual"
              >
                <span className="inline-flex items-center justify-center text-sickly"><Icon name="oracle" size={20} /></span>
                <span className="flex-1 text-center">Begin the Ritual</span>
                <span className="ml-auto h-2 w-2 rotate-45 border-r border-b border-[rgba(138,154,106,.4)]" />
              </button>
            )}
            {ritualOrch.activePanel === 'ritual' && (
              <div className="pt-2 pb-1">
                <RitualPanel
                  ritual={ritualOrch.ritual}
                  onConverge={ritualOrch.handleRitualConverge}
                />
              </div>
            )}
          </div>
        </main>

        {/* Right panel - content */}
        <aside className="w-full min-w-full p-5 md:flex-1 md:min-w-[420px] bg-[rgba(8,10,16,0.6)] border border-[rgba(138,154,106,0.08)] rounded-lg backdrop-blur-md overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-[calc(100dvh-120px)]" aria-label="Main content">
          <div className="text-silver" id="main-content" key={`${activeTab}-${pageKey}-${searchQuery || ''}`}>
            {renderContent()}
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around py-2 bg-[rgba(5,5,8,0.95)] border-t border-[rgba(138,154,106,0.1)] z-[100] backdrop-blur-md md:hidden">
        {Object.entries(TAB_LABELS).map(([key, { name, icon }]) => (
          <button
            key={key}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all duration-200 ${activeTab === key ? 'bg-[rgba(138,154,106,0.08)]' : 'bg-transparent hover:bg-[rgba(138,154,106,0.05)]'}`}
            onClick={() => handleTabSelect(key)}
            type="button"
          >
            <span className="inline-flex items-center justify-center text-sickly"><Icon name={icon} size="20" /></span>
            <span className={`font-['Cinzel'] text-[0.5rem] font-semibold uppercase tracking-wide ${activeTab === key ? 'text-sickly' : 'text-silver-dim'}`}>{name}</span>
          </button>
        ))}
      </nav>

      {/* Footer tagline */}
      <footer className="flex justify-between items-center px-6 py-3 border-t border-[rgba(138,154,106,0.06)] font-['Cormorant_Garamond'] text-[0.72rem] text-silver-dim">
        <span className="italic text-sickly-dim">"All eyes remain open."</span>
        <a
          href="https://github.com/StepowskiEric/GrimoireStack"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GrimoireStack on GitHub"
          title="GrimoireStack on GitHub"
          className="inline-flex items-center gap-2 text-silver-dim transition-colors hover:text-sickly"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.28-1.67-1.28-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          <span className="text-[0.72rem]">Source</span>
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
