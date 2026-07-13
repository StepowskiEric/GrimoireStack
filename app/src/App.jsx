import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { pageCreak } from './audio/sounds.js';
import LidlessEyeCast from './components/LidlessEyeCast.tsx';
import { grimoireIndex } from './data/grimoireIndexInstance.js';
import { useAudioState } from './hooks/useAudioState.js';
import './components/LidlessEyeCast.css';
import ApprenticeWelcome, {
  STORAGE_KEY as WELCOME_STORAGE_KEY,
} from './components/ApprenticeWelcome.jsx';
import CompareSpellsModal from './components/CompareSpellsModal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import GrimoireStackLayout from './components/GrimoireStackLayout.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import SpellModal from './components/SpellModal.jsx';
import StaleLinkBanner from './components/StaleLinkBanner.jsx';
import { useEyeMood } from './hooks/useEyeMood.js';
import { useFavoritesSync } from './hooks/useFavoritesSync.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { useMarginalia } from './hooks/useMarginalia.js';
import { useRecentlyViewed } from './hooks/useRecentlyViewed.js';
import { useSignals } from './hooks/useSignals.js';
import { useSpellInteraction } from './hooks/useSpellInteraction.js';
import { LanguageProvider } from './i18n/LanguageContext';
import { copyToClipboard, exportAsJson, exportAsMarkdown } from './utils/exporter.js';
import './components/ModalSuspense.css';
import './components/ExportToast.css';

const ShortcutsModal = lazy(() => import('./components/ShortcutsModal.jsx'));

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/*" element={<AppInner />} />
          </Routes>
        </ErrorBoundary>
      </LanguageProvider>
    </BrowserRouter>
  );
}

function AppInner() {
  const [currentSchool, setCurrentSchool] = useState(() => {
    const schools = Array.from(grimoireIndex.getSchoolMap().values());
    return schools[0]?.id || 'debugging';
  });
  const { audioEnabled, toggleAudio } = useAudioState();
  const [castEnabled, setCastEnabled] = useState(
    () => localStorage.getItem('grimoire-cast') !== 'off',
  );
  const [welcomeOpen, setWelcomeOpen] = useState(
    () => localStorage.getItem(WELCOME_STORAGE_KEY) !== 'true',
  );
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const initializedRef = useRef(false);

  // Modal state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLeft, setCompareLeft] = useState(null); // { spell, school }
  const [compareRight, setCompareRight] = useState(null); // { spell, school }
  const { favorites, isFavorited, toggleFavorite, sync } = useFavoritesSync();
  const { recent, record: recordRecent } = useRecentlyViewed();
  const { mood, recordView } = useEyeMood();
  const marginalia = useMarginalia();
  const { getVote, vote: castVote, aggregateFor } = useSignals();

  const {
    modal,
    casting,
    handleSpellClick,
    handleCastComplete,
    handleModalClose,
    notFoundSkill,
    dismissNotFound,
  } = useSpellInteraction(castEnabled);

  // Record spell view in history when modal opens
  useEffect(() => {
    if (modal) recordRecent(modal.spell.name, modal.spell.skill);
  }, [modal?.spell.skill, modal, recordRecent]);

  const handleCastBones = useCallback(() => {
    const all = grimoireIndex.flatEntries();
    if (all.length === 0) return;
    const pick = all[Math.floor(Math.random() * all.length)];
    handleSpellClick(pick.spell, pick.school);
  }, [handleSpellClick]);

  const handleNotFoundSelect = useCallback(
    (skill) => {
      const found = grimoireIndex.resolveBySkill(skill);
      if (found) {
        dismissNotFound();
        handleSpellClick(found.spell, found.school);
      }
    },
    [dismissNotFound, handleSpellClick],
  );

  // Compare spells helpers
  const handlePickCompareSlot = useCallback((slot, spell, school) => {
    if (slot === 'left') setCompareLeft({ spell, school });
    else setCompareRight({ spell, school });
  }, []);

  // Pre-fill both compare slots at once (used by the Rituals tab "Compare" button)
  const handleCompareTwo = useCallback((leftSpell, leftSchool, rightSpell, rightSchool) => {
    setCompareLeft({ spell: leftSpell, school: leftSchool });
    setCompareRight({ spell: rightSpell, school: rightSchool });
    setCompareOpen(true);
  }, []);

  // Export config
  const [exportToast, setExportToast] = useState('');
  const exportTimerRef = useRef(null);

  const handleExportJson = useCallback(async () => {
    const json = exportAsJson({ favorites, marginalia, recent });
    const ok = await copyToClipboard(json);
    setExportToast(ok ? 'JSON copied!' : 'Copy failed');
    if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
    exportTimerRef.current = setTimeout(() => setExportToast(''), 2200);
  }, [favorites, marginalia, recent]);

  const handleExportMarkdown = useCallback(async () => {
    const md = exportAsMarkdown({ favorites, marginalia, recent });
    const ok = await copyToClipboard(md);
    setExportToast(ok ? 'Markdown copied!' : 'Copy failed');
    if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
    exportTimerRef.current = setTimeout(() => setExportToast(''), 2200);
  }, [favorites, marginalia, recent]);

  // Stable refs for callbacks declared further down — pattern 6a.
  // Lets keyboardHandlers (declared above the callbacks it closes over) avoid TDZ.
  const handleWelcomeCloseRef = useRef(null);
  const handleModalCloseRef = useRef(null);

  const keyboardHandlers = useMemo(
    () => ({
      openCheatsheet: () => setShortcutsOpen(true),
      handleGlobalEscape: () => {
        let handled = false;
        if (shortcutsOpen) {
          setShortcutsOpen(false);
          handled = true;
        }
        if (compareOpen) {
          setCompareOpen(false);
          handled = true;
        }
        if (modal) {
          handleModalClose();
          handled = true;
        }
        if (welcomeOpen) {
          handleWelcomeCloseRef.current();
          handled = true;
        }
        return handled;
      },
    }),
    [shortcutsOpen, compareOpen, modal, handleModalClose, welcomeOpen],
  );

  useKeyboardShortcuts(keyboardHandlers);

  const handleSchoolSelect = useCallback((id) => {
    setCurrentSchool(id);
    setTimeout(pageCreak, 50);
  }, []);

  const toggleCast = useCallback(() => {
    setCastEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('grimoire-cast', next ? 'on' : 'off');
      return next;
    });
  }, []);

  const handleWelcomeClose = useCallback(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
    }
    setWelcomeOpen(false);
  }, []);

  // Render-side ref sync (pattern 6a) — keep the refs current with the latest
  // stable callbacks so keyboardHandlers can read them without TDZ.
  handleWelcomeCloseRef.current = handleWelcomeClose;
  handleModalCloseRef.current = handleModalClose;

  // Featured schools state — lifted so the eye re-renders when the user
  // customizes the selection in SchoolCardGrid. The SchoolCardGrid now calls
  // onFeaturedSchoolsChange (lifting state) AND writes to localStorage; the
  // initial state on mount reads from the same localStorage key.
  const [featuredSchools, setFeaturedSchools] = useState(() => {
    try {
      const saved = localStorage.getItem('grimoire-featured-schools');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      'debugging',
      'reasoning',
      'execution',
      'systems-and-architecture',
      'testing',
      'output-quality',
      'orchestration',
      'software-development',
      'research',
    ];
  });

  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="parchment">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="8" />
        </filter>
        <filter id="parchment-stain">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.15  0 0 0 0 0.08  0 0 0 0 0.03  0 0 0 0.08 0"
          />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
        <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="5"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.18  0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 0.18 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="leather-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="2"
            seed="11"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 0.35 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="ink-blot" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>
      </svg>
      {welcomeOpen && <ApprenticeWelcome onClose={handleWelcomeClose} />}
      {notFoundSkill && (
        <StaleLinkBanner
          skill={notFoundSkill}
          onDismiss={dismissNotFound}
          onSelectSkill={handleNotFoundSelect}
        />
      )}

      {/* GrimoireStack Layout */}
      <GrimoireStackLayout
        currentSchool={currentSchool}
        onSchoolSelect={(id) => {
          if (id === null) {
            // View all schools
            setCurrentSchool('all');
          } else {
            setCurrentSchool(id);
            handleSchoolSelect(id);
          }
        }}
        onSpellClick={handleSpellClick}
        isFavorited={isFavorited}
        onToggleFavorite={toggleFavorite}
        favorites={favorites}
        recent={recent}
        marginalia={marginalia}
        getVote={getVote}
        castEnabled={castEnabled}
        onToggleCast={toggleCast}
        audioEnabled={audioEnabled}
        onToggleAudio={toggleAudio}
        onCompareOpen={() => setCompareOpen(true)}
        onCompareTwo={handleCompareTwo}
        onCastBones={handleCastBones}
        onExportJson={handleExportJson}
        onExportMarkdown={handleExportMarkdown}
        onShowShortcuts={() => setShortcutsOpen(true)}
        sync={sync}
        eyeMood={mood}
        onSpellView={recordView}
        featuredSchools={featuredSchools}
        onFeaturedSchoolsChange={setFeaturedSchools}
      />

      {/* Modals — lazy-loaded with themed fallback */}
      {shortcutsOpen && (
        <Suspense fallback={<div className="modal-suspense-fallback">Summoning...</div>}>
          <ShortcutsModal onClose={() => setShortcutsOpen(false)} />
        </Suspense>
      )}
      {compareOpen && (
        <Suspense fallback={<div className="modal-suspense-fallback">Summoning...</div>}>
          <CompareSpellsModal
            left={compareLeft}
            right={compareRight}
            onClose={() => {
              setCompareOpen(false);
              setCompareLeft(null);
              setCompareRight(null);
            }}
            onPickSlot={handlePickCompareSlot}
            onSelect={(spell, school) => {
              setCompareOpen(false);
              setCompareLeft(null);
              setCompareRight(null);
              if (spell && school) handleSpellClick(spell, school);
            }}
          />
        </Suspense>
      )}
      {modal && (
        <Suspense fallback={<div className="modal-suspense-fallback">Summoning...</div>}>
          <SpellModal
            spell={modal.spell}
            school={modal.school}
            onClose={handleModalClose}
            marginalia={marginalia}
            getVote={getVote}
            castVote={castVote}
            aggregateFor={aggregateFor}
          />
        </Suspense>
      )}
      {casting && (
        <LidlessEyeCast
          spell={casting.spell}
          school={casting.school}
          onComplete={handleCastComplete}
        />
      )}
      {exportToast && (
        <div className="export-toast" role="status" aria-live="polite">
          {exportToast}
        </div>
      )}
      <InstallPrompt />
    </>
  );
}
