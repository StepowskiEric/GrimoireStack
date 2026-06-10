import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import schools from './data/schools.js';
import { searchSpells } from './search.js';
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
import BestialityOfAfflictions from './components/BestialityOfAfflictions.jsx';
import { getSpellTier, TIER_META } from './data/tiers.js';
import { REPO_URL } from './data/constants.js';
import { useSpellInteraction } from './hooks/useSpellInteraction.js';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [currentSchool, setCurrentSchool] = useState(schools[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [castEnabled, setCastEnabled] = useState(() => localStorage.getItem('grimoire-cast') !== 'off');
  const [welcomeOpen, setWelcomeOpen] = useState(() => localStorage.getItem(WELCOME_STORAGE_KEY) !== 'true');
  const laughPlayedRef = useRef(false);
  const ambienceStartedRef = useRef(false);
  const initializedRef = useRef(false);

  const searchResults = useMemo(() => searchSpells(schools, searchQuery), [searchQuery]);
  const isLab = currentSchool === 'recipe-lab';
  const isRitual = currentSchool === 'ritual';

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
  } = useSpellInteraction(castEnabled);

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

  const spellTier = useCallback((spell) => {
    const tier = getSpellTier(spell);
    return { tier, ...TIER_META[tier] };
  }, []);

  const handleOpenAfflictionSkill = useCallback((skillId, schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    const spell = school?.spells.find((sp) => sp.skill === skillId);
    if (spell && school) {
      handleSpellClick(spell, school);
    } else {
      const input = document.getElementById('searchInput');
      if (input) {
        input.value = skillId;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      }
    }
  }, [handleSpellClick]);

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
        </div>
        <h1>GrimoireStack</h1>
        <div className="subtitle">The Warlock's Tome of Agent Incantations</div>
        <div className="flare"><span>⚜</span><span>✦</span><span>⚜</span></div>
      </header>

      <div className="hero-desc">
        A living collection of <em>agentic incantations</em> — skills for debugging, reasoning,
        code review, architecture, and more. Browse by school, <em>scry by affliction</em> in the
        orb below, or <span className="hero-tag">⚗ brew your own</span> recipe combinations.
      </div>

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

          <BestialityOfAfflictions onOpenSkill={handleOpenAfflictionSkill} />

          {schools.map((s) => (
            <SchoolSection key={s.id} school={s}
              isActive={currentSchool === s.id && !isLab && !isRitual && !searchQuery}
              searchQuery={searchQuery}
              onSpellClick={handleSpellClick} />
          ))}
          {isRitual ? <RitualSection /> : null}
          {isLab ? <RecipeLab schools={schools} /> : null}
        </div>
      </main>

      {witchDoctorOpen && <WitchDoctorModal schools={schools} onSelectSkill={(spell, sch) => { setWitchDoctorOpen(false); handleSpellClick(spell, sch); }} onClose={() => setWitchDoctorOpen(false)} />}
      {modal && <SpellModal spell={modal.spell} school={modal.school} onClose={handleModalClose} />}
      {casting && <SpellCast spellName={casting.spell.name} schoolSymbol={casting.school.symbol} onComplete={handleCastComplete} />}
      <Footer />
      </>}
    </>
  );
}
