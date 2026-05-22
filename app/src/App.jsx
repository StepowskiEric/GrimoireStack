import { useState, useEffect, useCallback, useRef } from 'react';
import schools from './data/schools.js';
import { witchLaugh, pageCreak, startAmbience } from './audio/sounds.js';
import Embers from './components/Embers.jsx';
import ScryingOrb from './components/ScryingOrb.jsx';
import TabBar from './components/TabBar.jsx';
import SchoolSection from './components/SchoolSection.jsx';
import SpellModal from './components/SpellModal.jsx';
import RecipeLab from './components/RecipeLab.jsx';
import Footer from './components/Footer.jsx';
import BookSplash from './components/BookSplash.tsx';
import SpellCast from './components/SpellCast.tsx';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [currentSchool, setCurrentSchool] = useState(schools[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [casting, setCasting] = useState(null);
  const laughPlayedRef = useRef(false);
  const ambienceStartedRef = useRef(false);

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

  const resetSearch = useCallback(() => {
    document.querySelectorAll('.spell-card').forEach(el => el.classList.remove('glow', 'dim'));
    document.querySelectorAll('.no-spells').forEach(el => el.remove());
    const orb = document.getElementById('orbVessel');
    if (orb) orb.classList.remove('scrying');
    const r = document.getElementById('orbResult');
    if (r) { r.className = 'orb-result'; r.textContent = ''; }
  }, []);

  const handleSchoolSelect = useCallback((id) => {
    setCurrentSchool(id);
    setSearchQuery('');
    resetSearch();
    setTimeout(pageCreak, 50);
  }, [resetSearch]);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    const vessel = document.getElementById('orbVessel');
    const result = document.getElementById('orbResult');
    if (vessel) vessel.classList.toggle('scrying', q.length > 0);

    if (!q) { resetSearch(); return; }

    let totalMatches = 0, firstMatch = true;
    document.querySelectorAll('.school-section').forEach(section => {
      const grid = section.querySelector('.spell-grid');
      if (!grid) return;
      let hasMatch = false;
      section.querySelectorAll('.spell-card').forEach(card => {
        const match = (card.dataset.search || '').includes(q);
        card.classList.toggle('glow', match);
        card.classList.toggle('dim', !match);
        card.style.display = match ? '' : 'none';
        if (match) {
          hasMatch = true;
          totalMatches++;
          if (firstMatch) { firstMatch = false; card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }
      });
      grid.querySelectorAll('.no-spells').forEach(el => el.remove());
      if (!hasMatch) {
        const empty = document.createElement('div');
        empty.className = 'no-spells';
        empty.textContent = 'The orb sees nothing matching your affliction…';
        grid.appendChild(empty);
      }
      section.classList.toggle('active', hasMatch);
    });
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    if (result) {
      result.textContent = totalMatches > 0 ? `${totalMatches} incantation${totalMatches !== 1 ? 's' : ''} found` : 'none found';
      result.className = `orb-result show${totalMatches > 0 ? ' found' : ' none'}`;
    }

    if (totalMatches > 0 && !laughPlayedRef.current) {
      setTimeout(() => { witchLaugh(); laughPlayedRef.current = true; }, 400);
    }
    if (totalMatches === 0) laughPlayedRef.current = false;
  }, [resetSearch]);

  const handleSpellClick = useCallback((spell, school) => {
    setCasting({ spell, school });
  }, []);

  const handleCastComplete = useCallback(() => {
    setCasting(null);
    if (casting) {
      setModal({ spell: casting.spell, school: casting.school });
      document.body.style.overflow = 'hidden';
    }
  }, [casting]);

  const handleModalClose = useCallback((nextSpell, nextSchool) => {
    if (nextSpell && nextSchool) setModal({ spell: nextSpell, school: nextSchool });
    else { setModal(null); document.body.style.overflow = ''; }
  }, []);

  const isLab = currentSchool === 'recipe-lab';

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

      <ScryingOrb searchQuery={searchQuery} onSearchChange={handleSearch} />
      <TabBar schools={schools} currentSchool={currentSchool} onSelect={handleSchoolSelect} isLab={isLab} />

      <main className="grimoire">
        <div className="book-spread">
          <div className="spine-line" />
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
              onSpellClick={handleSpellClick} />
          ))}
          {isLab ? <RecipeLab schools={schools} /> : null}
        </div>
      </main>

      {modal && <SpellModal spell={modal.spell} school={modal.school} onClose={handleModalClose} />}
      {casting && <SpellCast spellName={casting.spell.name} schoolSymbol={casting.school.symbol} onComplete={handleCastComplete} />}
      <Footer />
      </>}
    </>
  );
}
