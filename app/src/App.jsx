import React, { useState, useEffect, useCallback, useRef } from 'react';
import schools from './data/schools.js';
import { witchLaugh, pageCreak, startAmbience } from './audio/sounds.js';

// ── Helper: find a spell by name across all schools ──
function findSpell(name) {
  for (const s of schools) {
    for (const sp of s.spells) {
      if (sp.name === name) return { spell: sp, school: s };
    }
  }
  return null;
}

// ── Embers ──
function Embers() {
  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const types = ['ember-amber', 'ember-gold', 'ember-rune'];
    for (let i = 0; i < 40; i++) {
      const e = document.createElement('div');
      e.className = 'ember ' + types[i % 3];
      e.style.left = Math.random() * 100 + '%';
      e.style.width = e.style.height = (2 + Math.random() * 3) + 'px';
      e.style.animationDuration = (15 + Math.random() * 25) + 's';
      e.style.animationDelay = (Math.random() * 20) + 's';
      el.appendChild(e);
    }
    for (let i = 0; i < 15; i++) {
      const e = document.createElement('div');
      e.className = 'ember ' + (i % 2 === 0 ? 'ember-amber' : 'ember-gold');
      e.style.left = Math.random() * 100 + '%';
      e.style.width = e.style.height = (5 + Math.random() * 8) + 'px';
      e.style.animationDuration = (35 + Math.random() * 30) + 's';
      e.style.animationDelay = (Math.random() * 30) + 's';
      el.appendChild(e);
    }
  }, []);
  return <div id="embers" ref={containerRef} />;
}

// ── SpellCard ──
function SpellCard({ spell, onClick, glow, dim, children }) {
  const statusClass = (spell.status || '').toLowerCase().replace(/[^a-z]/g, '');
  const tier = spell.status && spell.status !== '—' ? `✧ ${spell.status}` : '';
  return (
    <div
      className={`spell-card${glow ? ' glow' : ''}${dim ? ' dim' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      data-search={`${spell.name} ${spell.skill} ${spell.effect}`.toLowerCase()}
    >
      {tier ? <div className="spell-tier">{tier}</div> : null}
      <div className="spell-name">{spell.name}</div>
      <div className="spell-incantation">〈 {spell.skill} 〉</div>
      <div className="spell-effect">{spell.effect}</div>
      <div className="spell-footer">
        <span className={`spell-status ${statusClass}`}>{tier || 'common'}</span>
        <span className="spell-reveal-hint">{children || 'click to reveal'}</span>
      </div>
    </div>
  );
}

// ── SpellModal ──
function SpellModal({ spell, school, onClose }) {
  if (!spell) return null;
  const statusStr = spell.status && spell.status !== '—' ? spell.status : 'Common';
  const statusClass = (spell.status || 'common').toLowerCase().replace(/[^a-z]/g, '') || 'common';

  // Show note if present
  const note = document.querySelector('.modal-note');
  // (note is handled in JS below)

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <span className="modal-symbol">{school.symbol}</span>
        <div className="modal-school">
          {school.name} <span className="modal-school-real">({school.real})</span>
        </div>
        <div className="modal-title">{spell.name}</div>
        <div className="modal-incantation">〈 {spell.skill} 〉</div>

        {spell.note ? (
          <div className="modal-detail-row modal-note" style={{ display: 'flex' }}>
            <div className="modal-detail-label">Note</div>
            <div className="modal-detail-value">{spell.note}</div>
          </div>
        ) : null}

        <div className="modal-section-title">✦ Effect</div>
        <div className="modal-effect">{spell.effect}</div>
        <div className="modal-detail-row">
          <div className="modal-detail-label">Status</div>
          <div className="modal-detail-value">
            <span className={`tag ${statusClass}`}>{statusStr}</span>
          </div>
        </div>
        <div className="modal-detail-row">
          <div className="modal-detail-label">Skill Path</div>
          <div className="modal-detail-value">{spell.skill}</div>
        </div>

        {spell.combos && spell.combos.length > 0 ? (
          <div className="modal-synergies">
            <div className="syn-title">✦ Synergistic Pairings</div>
            <div className="syn-grid">
              {spell.combos.map(comboName => {
                const found = findSpell(comboName);
                return (
                  <span
                    key={comboName}
                    className="syn-chip"
                    onClick={() => found && onClose(found.spell, found.school)}
                    title={found ? `Open ${comboName}` : ''}
                  >
                    ✦ {comboName}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="modal-grimoire-ref">
          <code>〈 grimoirestack:{school.id}/{spell.skill} 〉</code>
        </div>
      </div>
    </div>
  );
}

// ── SchoolSection ──
function SchoolSection({ school, isActive, onSpellClick }) {
  return (
    <div className={`school-section${isActive ? ' active' : ''}`} id={`school-${school.id}`}>
      <div className="school-header">
        <span className="school-symbol">{school.symbol}</span>
        <h2>{school.name}</h2>
        <p className="school-desc">{school.desc}</p>
        <div className="school-meta">
          <span className="school-count">{school.spells.length} incantation{school.spells.length !== 1 ? 's' : ''}</span>
          <span className="school-real">also known as: {school.real}</span>
        </div>
      </div>
      <div className="spell-grid">
        {school.spells.map(sp => (
          <SpellCard key={sp.name + sp.skill} spell={sp} onClick={() => onSpellClick(sp, school)} />
        ))}
      </div>
    </div>
  );
}

// ── ScryingOrb ──
function ScryingOrb({ searchQuery, onSearchChange }) {
  const [totalMatches, setTotalMatches] = useState(0);

  const handleInput = (e) => {
    const q = e.target.value.toLowerCase().trim();
    onSearchChange(q);
  };

  const exampleQueries = ['bug', 'test', 'security', 'refactor', 'architecture', 'code review'];

  const handleExample = (query) => {
    onSearchChange(query);
    // Update input value
    const input = document.getElementById('searchInput');
    if (input) { input.value = query; input.focus(); }
    // Trigger search
    const event = new Event('input', { bubbles: true });
    if (input) input.dispatchEvent(event);
  };

  return (
    <div className="scrying-orb">
      <div
        className={`orb-vessel${searchQuery ? ' scrying' : ''}`}
        id="orbVessel"
        tabIndex={0}
        role="button"
        aria-label="Click to search"
        onClick={() => document.getElementById('searchInput')?.focus()}
      >
        <div className="orb-ring"></div>
        <div className="orb-ring orb-ring-2"></div>
        <div className="orb-rim"></div>
        <div className="orb-inner-glow"></div>
        <div className="orb-rune">⟐</div>
        <div className={`orb-result${searchQuery ? ' show' : ''}${totalMatches > 0 ? ' found' : searchQuery ? ' none' : ''}`}>
          {searchQuery ? (totalMatches > 0 ? `${totalMatches} incantation${totalMatches !== 1 ? 's' : ''} found` : 'none found') : ''}
        </div>
        <div className="orb-mist" id="orbMist"></div>
      </div>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <span className="orb-input-icon">⟐</span>
        <input
          type="text"
          id="searchInput"
          className="orb-input"
          placeholder="Search for a skill or describe your problem…"
          autoComplete="off"
          value={searchQuery}
          onInput={handleInput}
        />
      </div>
      <div className="orb-examples">
        <span className="ex-label">Try:</span>
        {exampleQueries.map(q => (
          <span key={q} className="ex-chip" onClick={() => handleExample(q)}>
            {q === 'bug' ? '🐛' : q === 'test' ? '🧪' : q === 'security' ? '🛡' : q === 'refactor' ? '🔧' : q === 'architecture' ? '🏛' : '📋'} {q}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── RecipeLab ──
function RecipeLab({ schools }) {
  const [selected, setSelected] = useState([]);
  const [brewed, setBrewed] = useState(null);

  const prefixes = ['Elixir', 'Potion', 'Tincture', 'Salve', 'Draught', 'Brew', 'Compound', 'Essence', 'Infusion', 'Extract'];
  const adjectives = ['Ancient', 'Crimson', 'Shadow', 'Arcane', 'Ethereal', 'Verdant', 'Ashen', 'Silver', 'Amber', 'Violet', 'Deep', 'Restorative', 'Binding', 'Surging', 'Quiet'];

  const nounMap = {
    debugging: 'Remediation', reasoning: 'Cognition', process: 'Refinement',
    'code-review': 'Scrutiny', architecture: 'Architecture', discovery: 'Discovery',
    documentation: 'Expression', planning: 'Foresight', learning: 'Knowledge',
    'anti-hallucination': 'Veracity', 'software-dev': 'Crafting', 'multi-agent': 'Confluence',
    risk: 'Warding', 'cognitive-load': 'Clarity', testing: 'Measurement'
  };

  const useCases = [
    'Investigating and resolving complex system failures',
    'Validating code quality before production deployment',
    'Navigating unfamiliar codebases with precision',
    'Preventing reasoning errors in multi-step analysis',
    'Coordinating multiple agents toward a shared goal',
    'Designing robust architecture under uncertainty',
    'Accelerating delivery while maintaining quality gates',
    'Eliminating hallucinated claims from agent output',
    'Refactoring legacy systems with zero regression risk',
    'Planning complex features with stakeholder confidence',
  ];

  const toggleSpell = (spell, school) => {
    setSelected(prev => {
      const idx = prev.findIndex(s => s.spell.name === spell.name);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      if (prev.length >= 5) return prev;
      return [...prev, { spell, school }];
    });
    setBrewed(null);
  };

  const brew = () => {
    if (selected.length < 2) return;

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const involvedSchools = [...new Set(selected.map(s => s.school.name))];
    let suffix;
    if (involvedSchools.length === 1) {
      suffix = nounMap[selected[0].school.id] || 'Power';
    } else if (involvedSchools.length === 2) {
      suffix = adj + ' Union';
    } else {
      suffix = adj + ' Convergence';
    }

    const allEffects = selected.map(s => s.spell.effect.toLowerCase());
    const keywords = ['trace', 'debug', 'test', 'code', 'reason', 'verify', 'review', 'design', 'plan', 'build', 'learn', 'coordinate', 'ward', 'refactor', 'analyze', 'diagnose', 'fix', 'search', 'navigate', 'structure', 'model'];
    const foundKeywords = [...new Set(keywords.filter(k => allEffects.some(e => e.includes(k))))];

    let effect = 'A custom ritual combining ';
    const names = selected.map(s => s.spell.name);
    if (names.length === 2) effect += `${names[0]} and ${names[1]}.`;
    else effect += names.slice(0, -1).join(', ') + ', and ' + names.slice(-1) + '.';
    effect += ' When cast together, these incantations provide ';
    effect += foundKeywords.length > 0 ? foundKeywords.slice(0, 3).join(', ') + ' capabilities.' : 'a broad spectrum of agentic power.';

    let bestUseCase = useCases[0];
    for (const uc of useCases) {
      const ucLower = uc.toLowerCase();
      const matches = foundKeywords.filter(k => ucLower.includes(k)).length;
      if (matches > 0) { bestUseCase = uc; break; }
    }

    const statuses = selected.map(s => s.spell.status);
    const hasProven = statuses.some(s => s === 'Proven');
    const hasMCP = statuses.some(s => s && s.includes('MCP'));
    let potency, potencyClass;
    if (hasProven && hasMCP) { potency = 'Archmage'; potencyClass = 'archmage'; }
    else if (hasProven && selected.length >= 3) { potency = 'Master'; potencyClass = 'master'; }
    else if (hasProven) { potency = 'Adept'; potencyClass = 'adept'; }
    else { potency = 'Apprentice'; potencyClass = 'apprentice'; }

    setBrewed({ name: `${prefix} of ${suffix}`, effect, bestUseCase, potency, potencyClass, names });
    witchLaugh();
  };

  return (
    <div className="lab-section active" id="school-recipe-lab">
      <div className="lab-header">
        <h2>⚗ Recipe Lab</h2>
        <p className="lab-sub">Select 2–5 incantations below and brew a custom ritual</p>
      </div>

      <div className={`lab-cauldron${selected.length > 0 ? ' has-spells' : ''}`} id="labCauldron">
        <div className="cauldron-label">✦ Cauldron</div>
        {selected.length === 0 ? (
          <div className="cauldron-empty">Select incantations from the grid below…</div>
        ) : null}
        <div className="cauldron-chips">
          {selected.map((item, i) => (
            <span key={i} className="cauldron-chip" onClick={() => toggleSpell(item.spell, item.school)} title="Click to remove">
              {item.school.symbol} {item.spell.name}
            </span>
          ))}
        </div>
        {selected.length > 0 ? <div className="cauldron-count">{selected.length} of 5 incantations selected</div> : null}
      </div>

      <div className="lab-brew-wrap">
        <button className={`lab-brew${selected.length < 2 ? ' disabled' : ''}`} disabled={selected.length < 2} onClick={brew}>
          ⚗ Brew Ritual
        </button>
      </div>

      {brewed ? (
        <div className="lab-output show" id="labOutput">
          <div className="recipe-card">
            <div className="rc-label">✦ Brewed Ritual</div>
            <div className="rc-name">{brewed.name}</div>
            <div className="rc-effect">{brewed.effect}</div>
            <div className="rc-row">
              <span className="rc-l">Potency</span>
              <span className="rc-v"><span className={`rc-potency ${brewed.potencyClass}`}>✦ {brewed.potency}</span></span>
            </div>
            <div className="rc-row">
              <span className="rc-l">Best Scribed For</span>
              <span className="rc-v">{brewed.bestUseCase}</span>
            </div>
            <div className="rc-row">
              <span className="rc-l">Incantations</span>
              <span className="rc-v">{brewed.names.map((n, i) => <em key={i}>{n}{i < brewed.names.length - 1 ? ', ' : ''}</em>)}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="spell-grid">
        {schools.map(school =>
          school.spells.map(sp => {
            const isSelected = selected.some(s => s.spell.name === sp.name);
            return (
              <div
                key={sp.name + sp.skill}
                className={`spell-card${isSelected ? ' glow' : ''}`}
                onClick={() => toggleSpell(sp, school)}
                style={{ cursor: 'pointer', borderColor: isSelected ? 'rgba(212,175,55,.3)' : '' }}
              >
                <div className="spell-name">{sp.name}</div>
                <div className="spell-incantation">〈 {sp.skill} 〉</div>
                <div className="spell-effect">{sp.effect}</div>
                <div className="spell-footer">
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: '.5rem', textTransform: 'uppercase', letterSpacing: '.06em', color: '#4a3a2a' }}>
                    {school.symbol} {school.name}
                  </span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '.7rem', color: '#3a2a2a' }}>
                    {isSelected ? 'selected' : 'click to add'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── App ──
export default function App() {
  const [currentSchool, setCurrentSchool] = useState(schools[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(null); // { spell, school } or null
  const laughPlayedRef = useRef(false);
  const ambienceStartedRef = useRef(false);

  // Start ambience on first interaction
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

  // Scrying orb mist
  useEffect(() => {
    const container = document.getElementById('orbMist');
    if (!container) return;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'mist-particle';
      p.style.left = (10 + Math.random() * 80) + '%';
      p.style.width = p.style.height = (2 + Math.random() * 6) + 'px';
      p.style.animationDuration = (4 + Math.random() * 6) + 's';
      p.style.animationDelay = (Math.random() * 4) + 's';
      container.appendChild(p);
    }
  }, []);

  const handleSchoolSelect = useCallback((id) => {
    setCurrentSchool(id);
    setSearchQuery('');
    // Reset spell cards
    document.querySelectorAll('.spell-card').forEach(el => {
      el.classList.remove('glow', 'dim');
      el.style.display = '';
    });
    const orb = document.getElementById('orbVessel');
    if (orb) orb.classList.remove('scrying');
    const orbResult = document.getElementById('orbResult');
    if (orbResult) { orbResult.className = 'orb-result'; orbResult.textContent = ''; }
    // Page creak
    setTimeout(pageCreak, 50);
  }, []);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    const orbVessel = document.getElementById('orbVessel');
    const orbResult = document.getElementById('orbResult');
    if (orbVessel) orbVessel.classList.toggle('scrying', q.length > 0);

    if (!q) {
      // Reset
      document.querySelectorAll('.spell-card').forEach(el => {
        el.classList.remove('glow', 'dim');
        el.style.display = '';
      });
      document.querySelectorAll('.no-spells').forEach(el => el.remove());
      if (orbResult) { orbResult.className = 'orb-result'; orbResult.textContent = ''; }
      return;
    }

    let totalMatches = 0;
    let firstMatch = true;

    document.querySelectorAll('.school-section').forEach(section => {
      const grid = section.querySelector('.spell-grid');
      if (!grid) return;
      let hasMatch = false;
      section.querySelectorAll('.spell-card').forEach(card => {
        const searchData = card.dataset.search || '';
        const match = searchData.includes(q);
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

    if (orbResult) {
      if (totalMatches > 0) {
        orbResult.textContent = `${totalMatches} incantation${totalMatches !== 1 ? 's' : ''} found`;
        orbResult.className = 'orb-result show found';
      } else {
        orbResult.textContent = 'none found';
        orbResult.className = 'orb-result show none';
      }
    }

    if (totalMatches > 0 && !laughPlayedRef.current) {
      setTimeout(() => { witchLaugh(); laughPlayedRef.current = true; }, 400);
    }
    if (totalMatches === 0) laughPlayedRef.current = false;
  }, []);

  const handleSpellClick = useCallback((spell, school) => {
    setModal({ spell, school });
    document.body.style.overflow = 'hidden';
  }, []);

  const handleModalClose = useCallback((nextSpell, nextSchool) => {
    if (nextSpell && nextSchool) {
      // Navigate to a combo spell
      setModal({ spell: nextSpell, school: nextSchool });
    } else {
      setModal(null);
      document.body.style.overflow = '';
    }
  }, []);

  const isLab = currentSchool === 'recipe-lab';

  return (
    <>
      <Embers />
      <header>
        <div className="wax-seal">⛧</div>
        <h1>GrimoireStack</h1>
        <div className="subtitle">The Warlock's Tome of Agent Incantations</div>
        <div className="flare"><span>⚜</span><span>✦</span><span>⚜</span></div>
      </header>

      <div className="hero-desc">
        A living collection of <em>agentic incantations</em> — skills for debugging, reasoning, code review, architecture, and more.
        Browse by school, <em>scry by affliction</em> in the orb below, or
        <span className="hero-tag">⚗ brew your own</span> recipe combinations.
      </div>

      <ScryingOrb searchQuery={searchQuery} onSearchChange={handleSearch} />

      <div className="tabs-wrapper">
        <nav className="tabs" id="tabContainer">
          {schools.map((s, i) => (
            <button
              key={s.id}
              className={`tab-btn${currentSchool === s.id && !searchQuery ? ' active' : ''}`}
              data-school={s.id}
              onClick={() => handleSchoolSelect(s.id)}
            >
              {s.symbol} {s.name} <span className="real-name">{s.real}</span>
            </button>
          ))}
          <button
            className={`tab-btn${isLab ? ' active' : ''}`}
            data-school="recipe-lab"
            onClick={() => handleSchoolSelect('recipe-lab')}
          >
            ⚗ Recipe Lab <span className="real-name">brew your own</span>
          </button>
        </nav>
      </div>

      <main className="grimoire">
        <div className="book-spread" id="bookSpread">
          <div className="spine-line"></div>
          <div className="page-edge"></div>
          <div className="page-edge-bottom"></div>

          {schools.map(s => (
            <SchoolSection
              key={s.id}
              school={s}
              isActive={currentSchool === s.id && !isLab && !searchQuery}
              onSpellClick={handleSpellClick}
            />
          ))}

          {isLab ? <RecipeLab schools={schools} /> : null}
        </div>
      </main>

      {modal ? (
        <SpellModal
          spell={modal.spell}
          school={modal.school}
          onClose={handleModalClose}
        />
      ) : null}

      <footer>
        <span className="footer-ornament">⚜ ❦ ⚜</span>
        <p>GrimoireStack &copy; 2026 &middot; Forge your own incantations</p>
        <p><a href="https://github.com/StepowskiEric/GrimoireStack" target="_blank">⟐ Browse the source on GitHub ⟐</a></p>
      </footer>
    </>
  );
}
