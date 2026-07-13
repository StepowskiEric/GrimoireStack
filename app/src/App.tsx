import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { pageCreak } from './audio/sounds.ts';
import LidlessEyeCast from './components/LidlessEyeCast.tsx';
import { grimoireIndex } from './data/grimoireIndexInstance.ts';
import type { GrimoireIndex } from './data/grimoireIndex.ts';
import type { School, Spell } from './data/schema.ts';
import { useAudioState } from './hooks/useAudioState.ts';
import './components/LidlessEyeCast.css';
import ApprenticeWelcome, {
  STORAGE_KEY as WELCOME_STORAGE_KEY,
} from './components/ApprenticeWelcome.tsx';
import CompareSpellsModal from './components/CompareSpellsModal.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import GrimoireStackLayout from './components/GrimoireStackLayout.tsx';
import InstallPrompt from './components/InstallPrompt.tsx';
import SVGFilters from './components/SVGFilters.tsx';
import SpellModal from './components/SpellModal.tsx';
import StaleLinkBanner from './components/StaleLinkBanner.tsx';
import { useExportToast } from './hooks/useExportToast.ts';
import { useEyeMood } from './hooks/useEyeMood.ts';
import { useFavoritesSync } from './hooks/useFavoritesSync.ts';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';
import { useMarginalia } from './hooks/useMarginalia.ts';
import { useRecentlyViewed } from './hooks/useRecentlyViewed.ts';
import { useSignals } from './hooks/useSignals.ts';
import { useSpellInteraction } from './hooks/useSpellInteraction.ts';
import { LanguageProvider } from './i18n/LanguageContext';
import './components/ModalSuspense.css';
import './components/ExportToast.css';

const ShortcutsModal = lazy(() => import('./components/ShortcutsModal.tsx'));

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

interface SpellSchoolPair {
  spell: Spell;
  school: School;
}

interface RecentEntry {
  name: string;
  skill: string;
  viewedAt: number;
}

interface FavoriteEntry {
  skill: string;
  name: string;
  addedAt: number;
}

interface SyncState {
  code: string | null;
  status: string;
  lastSyncedAt: number | null;
  error: string | null;
  enableSync: () => string;
  disableSync: () => void;
}

interface MarginaliaNotes {
  [skill: string]: string;
}

function AppInner() {
  const [currentSchool, setCurrentSchool] = useState<string>(() => {
    const schools = Array.from(grimoireIndex.getSchoolMap().values());
    return schools[0]?.id || 'debugging';
  });
  const { audioEnabled, toggleAudio } = useAudioState();
  const [castEnabled, setCastEnabled] = useState<boolean>(
    () => localStorage.getItem('grimoire-cast') !== 'off',
  );
  const [welcomeOpen, setWelcomeOpen] = useState<boolean>(
    () => localStorage.getItem(WELCOME_STORAGE_KEY) !== 'true',
  );
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const initializedRef = useRef(false);

  // Modal state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLeft, setCompareLeft] = useState<SpellSchoolPair | null>(null);
  const [compareRight, setCompareRight] = useState<SpellSchoolPair | null>(null);
  const { favorites, isFavorited, toggleFavorite, sync } = useFavoritesSync();
  const { recent, record: recordRecent } = useRecentlyViewed();
  const { mood, recordView } = useEyeMood();
  const marginalia = useMarginalia();
  const { getVote, vote: castVote, aggregateFor } = useSignals();

  const spellInteraction = useSpellInteraction(castEnabled) as {
    modal: SpellSchoolPair | null;
    casting: SpellSchoolPair | null;
    handleSpellClick: (spell: Spell, school: School) => void;
    handleCastComplete: () => void;
    handleModalClose: () => void;
    notFoundSkill: string | null;
    dismissNotFound: () => void;
  };
  const {
    modal,
    casting,
    handleSpellClick,
    handleCastComplete,
    handleModalClose,
    notFoundSkill,
    dismissNotFound,
  } = spellInteraction;

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
    (skill: string) => {
      const found = grimoireIndex.resolveBySkill(skill);
      if (found) {
        dismissNotFound();
        handleSpellClick(found.spell, found.school);
      }
    },
    [dismissNotFound, handleSpellClick],
  );

  // Compare spells helpers
  const handlePickCompareSlot = useCallback(
    (slot: 'left' | 'right', spell: Spell, school: School) => {
      if (slot === 'left') setCompareLeft({ spell, school });
      else setCompareRight({ spell, school });
    },
    [],
  );

  // Pre-fill both compare slots at once (used by the Rituals tab "Compare" button)
  const handleCompareTwo = useCallback(
    (leftSpell: Spell, leftSchool: School, rightSpell: Spell, rightSchool: School) => {
      setCompareLeft({ spell: leftSpell, school: leftSchool });
      setCompareRight({ spell: rightSpell, school: rightSchool });
      setCompareOpen(true);
    },
    [],
  );

  // Export state
  const { exportToast, handleExportJson, handleExportMarkdown } = useExportToast({
    favorites,
    marginalia: marginalia.notes,
    recent,
  });

  // Stable refs for callbacks declared further down — pattern 6a.
  // Lets keyboardHandlers (declared above the callbacks it closes over) avoid TDZ.
  const handleWelcomeCloseRef = useRef<(() => void) | null>(null);
  const handleModalCloseRef = useRef<(() => void) | null>(null);

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
          handleWelcomeCloseRef.current?.();
          handled = true;
        }
        return handled;
      },
    }),
    [shortcutsOpen, compareOpen, modal, handleModalClose, welcomeOpen],
  );

  useKeyboardShortcuts(keyboardHandlers);

  const handleSchoolSelect = useCallback((id: string) => {
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
  const [featuredSchools, setFeaturedSchools] = useState<string[]>(() => {
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
      <SVGFilters />
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
        onSchoolSelect={(id: string | null) => {
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
            onSelect={(spell: Spell | null, school: School | null) => {
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
