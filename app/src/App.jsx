import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import schools from './data/schools.js';
import { searchSpells, filterSpells } from './search.js';
import { witchLaugh, pageCreak, startAmbience } from './audio/sounds.js';
import Embers from './components/Embers.jsx';
import ScryingOrb from './components/ScryingOrb.jsx';
import TabBar from './components/TabBar.jsx';
import SchoolSection from './components/SchoolSection.jsx';
import SpellModal from './components/SpellModal.jsx';
import RecipeLab from './components/RecipeLab.jsx';
import WitchDoctorModal from './components/WitchDoctorModal.jsx';
import Footer from './components/Footer.jsx';
import BookSplash from './components/BookSplash.tsx';
import SpellCast from './components/SpellCast.tsx';
import RitualSection from './components/RitualSection.jsx';
import ApprenticeWelcome, { STORAGE_KEY as WELCOME_STORAGE_KEY } from './components/ApprenticeWelcome.jsx';
import BookmarkOfFirstRites from './components/BookmarkOfFirstRites.jsx';
import { getSpellTier, TIER_META } from './data/tiers.js';
import { REPO_URL } from './data/constants.js';
import { useSpellInteraction } from './hooks/useSpellInteraction.js';
import { useFavorites } from './hooks/useFavorites.js';
import { useRecentlyViewed } from './hooks/useRecentlyViewed.js';
import { useMarginalia } from './hooks/useMarginalia.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import LibrariansLedger from './components/LibrariansLedger.jsx';
import LegendOfSigils from './components/LegendOfSigils.jsx';
import ApprenticeMarginalia from './components/ApprenticeMarginalia.jsx';
import WhispersFromTheVoid from './components/WhispersFromTheVoid.jsx';
import Observatory from './components/Observatory.jsx';
import SummoningCircle from './components/SummoningCircle.jsx';
import TomeOfAilments from './components/TomeOfAilments.jsx';
import RecipeLabExplainer from './components/RecipeLabExplainer.jsx';
import LanguageToggle from './components/LanguageToggle.jsx';
import FilterChips from './components/FilterChips.jsx';
import StaleLinkBanner from './components/StaleLinkBanner.jsx';
import ShortcutsModal from './components/ShortcutsModal.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import { spellCatalog } from './data/spellCatalogInstance.js';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import SpellIndex from './components/SpellIndex.jsx';
import ChangelogSection from './components/ChangelogSection.jsx';
import SpellGraph from './components/SpellGraph.jsx';
import CompareSpellsModal from './components/CompareSpellsModal.jsx';
import ProblemIntakeModal from './components/ProblemIntakeModal.jsx';
import { useSignals } from './hooks/useSignals.js';
import { exportAsJson, exportAsMarkdown, copyToClipboard } from './utils/exporter.js';

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}

function AppInner() {
  const { t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [currentSchool, setCurrentSchool] = useState(schools[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [castEnabled, setCastEnabled] = useState(() => localStorage.getItem('grimoire-cast') !== 'off');
  const [welcomeOpen, setWelcomeOpen] = useState(() => localStorage.getItem(WELCOME_STORAGE_KEY) !== 'true');
  const [tomeOpen, setTomeOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState(new Set());
  const [tierFilter, setTierFilter] = useState(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const laughPlayedRef = useRef(false);
  const ambienceStartedRef = useRef(false);
  const initializedRef = useRef(false);

  // New feature states
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLeft, setCompareLeft] = useState(null);  // { spell, school }
  const [compareRight, setCompareRight] = useState(null);  // { spell, school }
  const [intakeOpen, setIntakeOpen] = useState(false);

  const { favorites, isFavorited, toggleFavorite } = useFavorites();
  const { recent, record: recordRecent } = useRecentlyViewed();
  const marginalia = useMarginalia();
  const { getVote, vote: castVote, aggregateFor } = useSignals();

  const searchResults = useMemo(
    () => searchSpells(schools, searchQuery),
    [searchQuery]
  );
  const filterResults = useMemo(
    () => filterSpells(schools, {
      query: searchQuery,
      schoolFilter: schoolFilter.size > 0 ? schoolFilter : null,
      tierFilter: tierFilter.size > 0 ? tierFilter : null,
      favoritesOnly,
      isFavorited,
    }),
    [searchQuery, schoolFilter, tierFilter, favoritesOnly, isFavorited]
  );
  const isLab = currentSchool === 'recipe-lab';
  const isRitual = currentSchool === 'ritual';
  const isIndex = currentSchool === 'index';
  const isGraph = currentSchool === 'graph';
  const isChangelog = currentSchool === 'changelog';
  const isSpecial = isLab || isRitual || isIndex || isGraph || isChangelog;

  const {
    modal,
    casting,
    witchDoctorOpen,
    setWitchDoctorOpen,
    handleSpellClick,
    handleCastComplete,
    handleModalClose,
    handleWitchDoctorSelect,
    handleWitchDoctorClose,
    notFoundSkill,
    dismissNotFound,
  } = useSpellInteraction(castEnabled);

  // Record spell view in history when modal opens
  useEffect(() => {
    if (modal) recordRecent(modal.spell.name, modal.spell.skill);
  }, [modal?.spell.skill, modal, recordRecent]);

  const toggleSchool = useCallback((id) => {
    setSchoolFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleTier = useCallback((key) => {
    setTierFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const toggleFavorites = useCallback(() => setFavoritesOnly((v) => !v), []);

  const clearAllFilters = useCallback(() => {
    setSchoolFilter(new Set());
    setTierFilter(new Set());
    setFavoritesOnly(false);
  }, []);

  const handleCastBones = useCallback(() => {
    const all = schools.flatMap((s) => s.spells.map((sp) => ({ spell: sp, school: s })));
    if (!all.length) return;
    const pick = all[Math.floor(Math.random() * all.length)];
    handleSpellClick(pick.spell, pick.school);
  }, [handleSpellClick]);

  const handleNotFoundSelect = useCallback((skill) => {
    const found = spellCatalog.resolveBySkill(skill);
    if (found) {
      dismissNotFound();
      handleSpellClick(found.spell, found.school);
    }
  }, [dismissNotFound, handleSpellClick]);

  // Compare spells helpers
  const handlePickCompareSlot = useCallback((slot, spell, school) => {
    if (slot === 'left') setCompareLeft({ spell, school });
    else setCompareRight({ spell, school });
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

  const keyboardHandlers = useMemo(() => ({
    openCheatsheet: () => setShortcutsOpen(true),
    focusSearch: () => {
      const input = document.getElementById('searchInput');
      if (input) { input.focus(); input.select?.(); }
    },
    handleGlobalEscape: () => {
      let handled = false;
      if (shortcutsOpen) { setShortcutsOpen(false); handled = true; }
      if (tomeOpen) { setTomeOpen(false); handled = true; }
      if (witchDoctorOpen) { setWitchDoctorOpen(false); handled = true; }
      if (compareOpen) { setCompareOpen(false); handled = true; }
      if (intakeOpen) { setIntakeOpen(false); handled = true; }
      if (modal) { handleModalClose(); handled = true; }
      if (welcomeOpen) { handleWelcomeCloseRef.current(); handled = true; }
      return handled;
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handleWelcomeCloseRef is a stable ref to the latest handleWelcomeClose
  }), [shortcutsOpen, tomeOpen, witchDoctorOpen, compareOpen, intakeOpen, modal, handleModalClose, welcomeOpen, setWitchDoctorOpen]);

  useKeyboardShortcuts(keyboardHandlers, loaded);

  useEffect(() => {
    const handler = () => {
      if (!ambienceStartedRef.current) {
        ambienceStartedRef.current = true;
        startAmbience();
      }
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      document.removeEventListener('touchstart', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  useEffect(() => {
    if (searchResults.total > 0 && !laughPlayedRef.current) {
      const t = setTimeout(() => { witchLaugh(); laughPlayedRef.current = true; }, 400);
      return () => clearTimeout(t);
    }
    if (searchResults.total === 0) laughPlayedRef.current = false;
  }, [searchResults.total]);

  const handleSchoolSelect = useCallback((id) => {
    setCurrentSchool(id);
    setSearchQuery('');
    setTimeout(pageCreak, 50);
  }, []);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
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

  const spellTier = useCallback((spell) => {
    const tier = getSpellTier(spell);
    return { tier, ...TIER_META[tier] };
  }, []);

  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="parchment">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="8" />
        </filter>
        <filter id="parchment-stain">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.15  0 0 0 0 0.08  0 0 0 0 0.03  0 0 0 0.08 0" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
        <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 0.18 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="leather-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="11" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="ink-blot" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>
      </svg>
      <BookSplash onFinish={() => setLoaded(true)} />
      {loaded && <>
      <Embers />
      {welcomeOpen && <ApprenticeWelcome onClose={handleWelcomeClose} />}
      <header>
        <div className="wax-seal-row">
          <div className="wax-seal">⛧</div>
          <a
            className="header-sigil"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the GrimoireStack repository on GitHub"
            title="Browse the source on GitHub"
          >
            <span className="header-sigil-glyph" aria-hidden="true">⟐</span>
            <span className="header-sigil-text">github</span>
          </a>
          <LanguageToggle />
        </div>
        <h1>{t('appTitle')}</h1>
        <div className="subtitle">{t('appSubtitle')}</div>
        <div className="flare"><span>⚜</span><span>✦</span><span>⚜</span></div>
      </header>

      <LibrariansLedger schools={schools} />

      <div className="hero-desc">
        A living collection of <em>agentic incantations</em> — skills for debugging, reasoning,
        code review, architecture, and more. Browse by school, <em>scry by affliction</em> in the
        orb below, or <span className="hero-tag">⚗ brew your own</span> recipe combinations.
        New: <em>describe your problem</em> in plain language, <em>compare spells</em>, and explore
        the <em>spell web</em>.
      </div>

      <ApprenticeMarginalia />

      <div style={{ textAlign: 'center', marginTop: -8, marginBottom: 10, zIndex: 2, position: 'relative' }}>
        <label style={{
          fontFamily: "'Cinzel', serif", fontSize: '0.5rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#a89878', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', border: '1px solid rgba(180,140,80,.22)', borderRadius: 4,
          transition: 'all .3s ease',
        }}>
          <input type="checkbox" checked={castEnabled}
            onChange={toggleCast}
            style={{ accentColor: '#8a6a30' }}
          />
          Cast animation
        </label>
      </div>

      <ScryingOrb searchQuery={searchQuery} onSearchChange={handleSearch} totalMatches={searchResults.total} onWizardOpen={() => setWitchDoctorOpen(true)} />

      <div style={{ textAlign: 'center', marginTop: -10, marginBottom: 14, zIndex: 2, position: 'relative', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <LegendOfSigils />
        <button
          type="button"
          className="tome-link"
          onClick={() => setIntakeOpen(true)}
          aria-label="Describe your problem"
        >
          <span aria-hidden="true">🜲</span>
          <span>Describe Your Problem</span>
        </button>
        <button
          type="button"
          className="tome-link"
          onClick={() => setCompareOpen(true)}
          aria-label="Compare two spells"
        >
          <span aria-hidden="true">⚖</span>
          <span>Compare Spells</span>
        </button>
        <button
          type="button"
          className="cast-bones-btn"
          onClick={handleCastBones}
          title={t('castBonesTitle')}
        >
          {t('castBones')}
        </button>
      </div>

      <FilterChips
        schools={schools}
        schoolFilter={schoolFilter}
        tierFilter={tierFilter}
        favoritesOnly={favoritesOnly}
        onToggleSchool={toggleSchool}
        onToggleTier={toggleTier}
        onToggleFavorites={toggleFavorites}
        onClear={clearAllFilters}
      />

      <TabBar schools={schools} currentSchool={currentSchool} onSelect={handleSchoolSelect} isLab={isLab} />
      <BookmarkOfFirstRites onSearchChange={handleSearch} onWizardOpen={() => setWitchDoctorOpen(true)} />

      <main className="grimoire" id="main-content">
        <div className="book-spread">
          <div className="spine-line" />
          <div className="page-stack-left" />
          <div className="page-stack-right" />
          <div className="page-layer-t" />
          <div className="page-layer-b" />
          <div className="page-layer-t2" />
          <div className="page-layer-b2" />
          <div className="ribbon" />
          <div className="cover-edge-left" />
          <div className="cover-edge-right" />
          <div className="page-edge" />
          <div className="page-edge-bottom" />
          <div className="rune-corner-tl">ᚦ ᛖ ᛒ</div>
          <div className="rune-corner-br">ᛟ ᚲ ᛉ</div>
          <div className="stain stain-1" />
          <div className="stain stain-2" />
          <div className="stain stain-3" />
          <div className="burn b1" />
          <div className="burn b2" />
          <div className="foxing f1" />
          <div className="foxing f2" />
          <div className="foxing f3" />
          <div className="foxing f4" />
          <div className="foxing f5" />
          <div className="ink-blot ib1" />
          <div className="ink-blot ib2" />
          <div className="ink-blot ib3" />
          <div className="marginalia m1">beware the recursion</div>
          <div className="marginalia m2">~ Fol. iii ~</div>
          <div className="folio">·  Folio III  ·</div>

          {schools.map((s) => {
            const filterActive = searchQuery || schoolFilter.size > 0 || tierFilter.size > 0 || favoritesOnly;
            const matchKeySet = filterActive
              ? new Set(filterResults.bySchool[s.id] || [])
              : null;
            const hasMatch = !filterActive || (filterResults.bySchool[s.id]?.length || 0) > 0;
            const visible = !isSpecial && (
              filterActive
                ? hasMatch
                : currentSchool === s.id
            );
            return (
              <SchoolSection
                key={s.id}
                school={s}
                isActive={visible}
                searchQuery={searchQuery}
                onSpellClick={handleSpellClick}
                isFavorited={isFavorited}
                onToggleFavorite={toggleFavorite}
                matchKeySet={matchKeySet}
              />
            );
          })}

          {searchQuery && searchResults.total === 0 && !notFoundSkill && (
            <WhispersFromTheVoid searchQuery={searchQuery} totalMatches={0} onWizardOpen={() => setWitchDoctorOpen(true)} />
          )}

          {notFoundSkill && (
            <StaleLinkBanner
              skill={notFoundSkill}
              onSelect={handleNotFoundSelect}
              onDismiss={dismissNotFound}
            />
          )}

          {!searchQuery && !isSpecial && (
            <Observatory schools={schools} onSpellClick={handleSpellClick} />
          )}

          {isRitual ? <RitualSection /> : null}
          {isLab ? <RecipeLab schools={schools} /> : null}
          {isIndex ? <SpellIndex onSpellClick={handleSpellClick} /> : null}
          {isGraph ? <SpellGraph schools={schools} onSpellClick={handleSpellClick} /> : null}
          {isChangelog ? <ChangelogSection onSpellClick={handleSpellClick} /> : null}
        </div>
      </main>

      {tomeOpen && (
        <TomeOfAilments
          schools={schools}
          onSelectSkill={(spell, sch) => { setTomeOpen(false); handleSpellClick(spell, sch); }}
          onClose={() => setTomeOpen(false)}
        />
      )}
      {witchDoctorOpen && <WitchDoctorModal schools={schools} onSelectSkill={(spell, sch) => { setWitchDoctorOpen(false); handleSpellClick(spell, sch); }} onClose={() => setWitchDoctorOpen(false)} />}
      {modal && <SpellModal spell={modal.spell} school={modal.school} onClose={handleModalClose} marginalia={marginalia} getVote={getVote} castVote={castVote} aggregateFor={aggregateFor} />}
      {casting && <SpellCast spellName={casting.spell.name} schoolSymbol={casting.school.symbol} onComplete={handleCastComplete} />}
      <RecipeLabExplainer visible={isLab} onDismiss={() => {}} />
      <SummoningCircle
        schools={schools}
        onSpellClick={handleSpellClick}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        recent={recent}
      />
      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}
      {compareOpen && (
        <CompareSpellsModal
          left={compareLeft?.spell}
          right={compareRight?.spell}
          onClose={() => { setCompareOpen(false); setCompareLeft(null); setCompareRight(null); }}
          onPickSlot={handlePickCompareSlot}
          onSelect={(spell, school) => {
            setCompareOpen(false);
            setCompareLeft(null);
            setCompareRight(null);
            if (spell && school) handleSpellClick(spell, school);
          }}
        />
      )}
      {intakeOpen && (
        <ProblemIntakeModal
          onClose={() => setIntakeOpen(false)}
          onSelectSpell={(spell, school) => {
            setIntakeOpen(false);
            if (spell && school) handleSpellClick(spell, school);
          }}
        />
      )}
      {exportToast ? (
        <div className="export-toast" role="status" aria-live="polite">{exportToast}</div>
      ) : null}
      <Footer
        onShowShortcuts={() => setShortcutsOpen(true)}
        onExportJson={handleExportJson}
        onExportMarkdown={handleExportMarkdown}
      />
      <InstallPrompt />
      </>}
    </>
  );
}
