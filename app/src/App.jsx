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

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [currentSchool, setCurrentSchool] = useState(schools[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [casting, setCasting] = useState(null);
  const [witchDoctorOpen, setWitchDoctorOpen] = useState(false);
  const [castEnabled, setCastEnabled] = useState(() => localStorage.getItem('grimoire-cast') !== 'off');
  const laughPlayedRef = useRef(false);
  const ambienceStartedRef = useRef(false);

  const searchResults = useMemo(() => searchSpells(schools, searchQuery), [searchQuery]);
  const isLab = currentSchool === 'recipe-lab';

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

  // Handle ?s= deep link on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skillId = params.get('s');
    if (skillId) {
      for (const s of schools) {
        for (const sp of s.spells) {
          if (sp.skill === skillId) {
            setTimeout(() => {
              setModal({ spell: sp, school: s });
              document.body.style.overflow = 'hidden';
            }, 300);
            return;
          }
        }
      }
    }
  }, []);

  // Witch laugh on first search match
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

  const handleSpellClick = useCallback((spell, school) => {
    if (castEnabled) {
      setCasting({ spell, school });
    } else {
      setModal({ spell, school });
      document.body.style.overflow = 'hidden';
    }
  }, [castEnabled]);

  const handleCastComplete = useCallback(() => {
    setCasting(null);
  }, []);

  const prevCastingRef = useRef(null);
  useEffect(() => {
    if (casting) {
      prevCastingRef.current = casting;
    } else if (prevCastingRef.current && !modal) {
      const prev = prevCastingRef.current;
      prevCastingRef.current = null;
      setTimeout(() => {
        setModal({ spell: prev.spell, school: prev.school });
        document.body.style.overflow = 'hidden';
      }, 50);
    }
  }, [casting, modal]);

  const handleModalClose = useCallback((nextSpell, nextSchool) => {
    if (nextSpell && nextSchool) setModal({ spell: nextSpell, school: nextSchool });
    else { setModal(null); document.body.style.overflow = ''; }
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
      </svg>
      <BookSplash onFinish={() => setLoaded(true)} />
      {loaded && <>
      <Embers />
      <header>
        <div className="wax-seal">⛧</div>
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
          letterSpacing: '0.08em', color: '#6a5a3a', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', border: '1px solid rgba(160,120,70,.1)', borderRadius: 4,
          transition: 'all .3s ease',
        }}>
          <input type="checkbox" checked={castEnabled}
            onChange={() => {
              const next = !castEnabled;
              setCastEnabled(next);
              localStorage.setItem('grimoire-cast', next ? 'on' : 'off');
            }}
            style={{ accentColor: '#8a6a30' }}
          />
          Cast animation
        </label>
      </div>

      <ScryingOrb searchQuery={searchQuery} onSearchChange={handleSearch} totalMatches={searchResults.total} onWizardOpen={() => setWitchDoctorOpen(true)} />
      <TabBar schools={schools} currentSchool={currentSchool} onSelect={handleSchoolSelect} isLab={isLab} />

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
          {schools.map(s => (
            <SchoolSection key={s.id} school={s}
              isActive={currentSchool === s.id && !isLab && !searchQuery}
              searchQuery={searchQuery}
              onSpellClick={handleSpellClick} />
          ))}
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
