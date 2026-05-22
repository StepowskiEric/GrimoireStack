/* ══════════════════════════════════════════════════════════════
   GrimoireStack — Site Application
   ES module loaded by index.html (and affliction.html)
   ══════════════════════════════════════════════════════════════ */

import { schools, WIZARD_DATA } from './data.js';
import { searchSpells } from '../app/src/search.js';

// ══════════════════════════════════════════════════════════════
//  WIZARD — Affliction navigation
// ══════════════════════════════════════════════════════════════

const wizardOverlay = document.getElementById('wizardOverlay');
const wizardClose   = document.getElementById('wizardClose');
const wizardInner   = document.getElementById('wizardInner');
const wizardBack    = document.getElementById('wizardBack');
const wizardNext    = document.getElementById('wizardNext');
const wizardProgress = document.getElementById('wizardProgress');
const wizardUnsure  = document.getElementById('wizardUnsure');

let wizStep = 0;
let wizCategory = null;
let wizSituation = null;

function openWizard() {
  wizStep = 0; wizCategory = null; wizSituation = null;
  wizardOverlay.classList.add('open');
  renderWizardStep();
}

function closeWizard() {
  wizardOverlay.classList.remove('open');
}

wizardClose.addEventListener('click', closeWizard);
wizardOverlay.addEventListener('click', e => { if (e.target === wizardOverlay) closeWizard(); });
wizardBack.addEventListener('click', () => { if (wizStep > 0) { wizStep--; renderWizardStep(); } });
wizardNext.addEventListener('click', () => {
  if (wizStep === 0 && wizCategory) { wizStep++; renderWizardStep(); }
  else if (wizStep === 1 && wizSituation) { wizStep++; renderWizardStep(); }
});

// Event delegation for wizard options (replaces onclick= strings)
wizardInner.addEventListener('click', e => {
  const option = e.target.closest('.wizard-option');
  if (!option) return;
  const id = option.dataset.id;
  if (!id) return;
  if (wizStep === 0) { selectCategory(id); }
  else if (wizStep === 1) { selectSituation(id); }
});

wizardUnsure.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (btn && btn.textContent.includes('Close')) closeWizard();
});

function renderWizardProgress() {
  wizardProgress.innerHTML =
    '<div class="wizard-step-pip ' + (wizStep >= 0 ? 'done' : '') + '"></div>' +
    '<div class="wizard-step-pip ' + (wizStep >= 1 ? (wizStep >= 2 ? 'done' : 'active') : '') + '"></div>' +
    '<div class="wizard-step-pip ' + (wizStep >= 2 ? 'done' : '') + '"></div>';
}

function renderWizardStep() {
  renderWizardProgress();
  wizardUnsure.innerHTML = '';

  if (wizStep === 0) {
    wizardInner.innerHTML =
      '<div class="wizard-question">What is happening?</div>' +
      '<div class="wizard-subtitle">Select the category that best describes your situation</div>' +
      '<div class="wizard-options">' +
      WIZARD_DATA.map(cat =>
        `<div class="wizard-option" data-id="${cat.id}">` +
        `<span class="opt-label">${cat.label}</span>` +
        `<span class="opt-desc">${cat.desc}</span></div>`
      ).join('') + '</div>';
    wizardBack.classList.add('hidden');
    wizardNext.classList.remove('ready');
    wizardNext.textContent = 'Continue →';
    wizardNext.style.display = '';

  } else if (wizStep === 1) {
    const cat = WIZARD_DATA.find(c => c.id === wizCategory);
    wizardInner.innerHTML =
      '<div class="wizard-question">What is your situation?</div>' +
      `<div class="wizard-subtitle">${cat.label}</div>` +
      '<div class="wizard-options">' +
      cat.situations.map(sit =>
        `<div class="wizard-option" data-id="${sit.id}">` +
        `<span class="opt-label">${sit.label}</span>` +
        `<span class="opt-desc">${sit.desc}</span></div>`
      ).join('') + '</div>';
    wizardBack.classList.remove('hidden');
    wizardNext.classList.remove('ready');
    wizardNext.textContent = 'Reveal Skill →';
    wizardNext.style.display = '';

  } else if (wizStep === 2) {
    const cat = WIZARD_DATA.find(c => c.id === wizCategory);
    const sit = cat.situations.find(s => s.id === wizSituation);
    const spellName = getSpellNameBySkill(sit.skill);

    let altChips = '';
    if (sit.alt) {
      altChips =
        '<div class="wr-alts">Or perhaps:</div>' +
        '<div class="wr-alt-grid">' +
        `<span class="wr-alt-chip" data-skill="${sit.alt}">${getSpellNameBySkill(sit.alt)}</span>` +
        '</div>';
    }

    wizardInner.innerHTML =
      '<div class="wizard-result">' +
      `<div class="wr-skill-name">${spellName || sit.skill}</div>` +
      `<div class="wr-effect">${sit.effect}</div>` +
      `<div class="wr-reason">${sit.reason}</div>` +
      `<span class="wr-cta" data-action="wiz-open" data-skill="${sit.skill}">⚔ Open in Grimoire →</span>` +
      altChips +
      '</div>';

    wizardBack.classList.remove('hidden');
    wizardBack.textContent = '← Start over';
    wizardNext.style.display = 'none';
    wizardUnsure.innerHTML = '<button data-action="wizard-close">Not what you needed? Close and try the scrying orb instead.</button>';

    // Wire up the "Open in Grimoire" and alt chip clicks
    wizardInner.querySelector('[data-action="wiz-open"]')?.addEventListener('click', () => wizGoToSkill(sit.skill));
    wizardInner.querySelectorAll('.wr-alt-chip').forEach(chip => {
      chip.addEventListener('click', () => wizGoToSkill(chip.dataset.skill));
    });
  }
}

function selectCategory(id) {
  wizCategory = id;
  document.querySelectorAll('.wizard-option').forEach(o => {
    o.style.borderColor = o.dataset.id === id ? 'rgba(212,175,55,.3)' : '';
    o.style.background = o.dataset.id === id ? 'rgba(212,175,55,.04)' : '';
  });
  wizardNext.classList.add('ready');
}

function selectSituation(id) {
  wizSituation = id;
  document.querySelectorAll('.wizard-option').forEach(o => {
    o.style.borderColor = o.dataset.id === id ? 'rgba(212,175,55,.3)' : '';
    o.style.background = o.dataset.id === id ? 'rgba(212,175,55,.04)' : '';
  });
  wizardNext.classList.add('ready');
}

function wizGoToSkill(skillId) {
  closeWizard();
  let foundSpell = null, foundSchool = null;
  for (const school of schools) {
    const spell = school.spells.find(s => s.skill === skillId);
    if (spell) { foundSpell = spell; foundSchool = school; break; }
  }
  if (foundSpell) {
    openSpell(foundSpell, foundSchool);
  } else {
    searchInput.value = skillId;
    doSearch(searchInput.value.toLowerCase().trim());
  }
}

function getSpellNameBySkill(skillId) {
  for (const school of schools) {
    const spell = school.spells.find(s => s.skill === skillId);
    if (spell) return spell.name;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
//  BUILD THE GRIMOIRE
// ══════════════════════════════════════════════════════════════

const tabsEl = document.getElementById('tabContainer');
const bookEl = document.getElementById('bookSpread');

try {
schools.forEach((s, i) => {
  const btn = document.createElement('button');
  btn.className = 'tab-btn' + (i === 0 ? ' active' : '');
  btn.dataset.school = s.id;
  btn.innerHTML = `${s.symbol} ${s.name} <span class="real-name">${s.real}</span>`;
  btn.addEventListener('click', () => selectSchool(s.id));
  tabsEl.appendChild(btn);
});

const labTab = document.createElement('button');
labTab.className = 'tab-btn';
labTab.dataset.school = 'recipe-lab';
labTab.innerHTML = '⚗ Recipe Lab <span class="real-name">brew your own</span>';
labTab.addEventListener('click', () => selectSchool('recipe-lab'));
tabsEl.appendChild(labTab);

schools.forEach((s, i) => {
  const section = document.createElement('div');
  section.className = 'school-section' + (i === 0 ? ' active' : '');
  section.id = `school-${s.id}`;
  section.dataset.school = s.id;

  const header = document.createElement('div');
  header.className = 'school-header';
  header.innerHTML = `
    <span class="school-symbol">${s.symbol}</span>
    <h2>${s.name}</h2>
    <p class="school-desc">${s.desc}</p>
    <div class="school-meta">
      <span class="school-count">${s.spells.length} incantation${s.spells.length !== 1 ? 's' : ''}</span>
      <span class="school-real">also known as: ${s.real}</span>
    </div>`;
  section.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'spell-grid';
  grid.id = `grid-${s.id}`;

  s.spells.forEach(sp => {
    const card = document.createElement('div');
    card.className = 'spell-card';
    card.dataset.search = `${sp.name} ${sp.skill} ${sp.effect}`.toLowerCase();
    card.dataset.spellName = sp.name;
    card.dataset.skill = sp.skill;
    card.dataset.schoolId = s.id;
    const statusClass = (sp.status || '').toLowerCase().replace(/[^a-z]/g,'');
    const tier = sp.status && sp.status !== '—' ? `✧ ${sp.status}` : '';
    card.innerHTML = `
      ${tier ? `<div class="spell-tier">${tier}</div>` : ''}
      <div class="spell-name">${sp.name}</div>
      <div class="spell-incantation">〈 ${sp.skill} 〉</div>
      <div class="spell-effect">${sp.effect}</div>
      <div class="spell-footer">
        <span class="spell-status ${statusClass}">${tier || 'common'}</span>
        <span class="spell-reveal-hint">click to reveal</span>
      </div>`;
    card.addEventListener('click', () => openSpell(sp, s));
    grid.appendChild(card);
  });

  section.appendChild(grid);
  bookEl.appendChild(section);
});

// — Recipe Lab section —
const labSection = document.createElement('div');
labSection.className = 'lab-section';
labSection.id = 'school-recipe-lab';
labSection.dataset.school = 'recipe-lab';

const labHeader = document.createElement('div');
labHeader.className = 'lab-header';
labHeader.innerHTML = '<h2>⚗ Recipe Lab</h2><p class="lab-sub">Select 2–5 incantations below and brew a custom ritual</p>';
labSection.appendChild(labHeader);

const cauldron = document.createElement('div');
cauldron.className = 'lab-cauldron';
cauldron.id = 'labCauldron';
cauldron.innerHTML = `
  <div class="cauldron-label">✦ Cauldron</div>
  <div class="cauldron-empty" id="cauldronEmpty">Select incantations from the grid below…</div>
  <div class="cauldron-chips" id="cauldronChips"></div>
  <div class="cauldron-count" id="cauldronCount"></div>`;
labSection.appendChild(cauldron);

const brewWrap = document.createElement('div');
brewWrap.className = 'lab-brew-wrap';
const brewBtnEl = document.createElement('button');
brewBtnEl.className = 'lab-brew disabled';
brewBtnEl.id = 'brewBtn';
brewBtnEl.textContent = '⚗ Brew Ritual';
brewBtnEl.disabled = true;
brewWrap.appendChild(brewBtnEl);
labSection.appendChild(brewWrap);

const output = document.createElement('div');
output.className = 'lab-output';
output.id = 'labOutput';
output.innerHTML = `
  <div class="recipe-card">
    <div class="rc-label">✦ Brewed Ritual</div>
    <div class="rc-name" id="rcName">—</div>
    <div class="rc-effect" id="rcEffect"></div>
    <div class="rc-row"><span class="rc-l">Potency</span><span class="rc-v"><span class="rc-potency" id="rcPotency">—</span></span></div>
    <div class="rc-row"><span class="rc-l">Best Scribed For</span><span class="rc-v" id="rcUseCase">—</span></div>
    <div class="rc-row"><span class="rc-l">Incantations</span><span class="rc-v" id="rcSpells">—</span></div>
  </div>`;
labSection.appendChild(output);

const pickerGrid = document.createElement('div');
pickerGrid.className = 'spell-grid';
pickerGrid.id = 'labPickerGrid';

schools.forEach(s => {
  s.spells.forEach(sp => {
    const card = document.createElement('div');
    card.className = 'spell-card';
    card.dataset.spellName = sp.name;
    card.dataset.skill = sp.skill;
    card.dataset.schoolId = s.id;
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="spell-name">${sp.name}</div>
      <div class="spell-incantation">〈 ${sp.skill} 〉</div>
      <div class="spell-effect">${sp.effect}</div>
      <div class="spell-footer">
        <span style="font-family:'Cinzel',serif;font-size:.5rem;text-transform:uppercase;letter-spacing:.06em;color:#4a3a2a">${s.symbol} ${s.name}</span>
        <span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.7rem;color:#3a2a2a">click to select</span>
      </div>`;
    card.addEventListener('click', () => toggleLabSpell(sp, s, card));
    pickerGrid.appendChild(card);
  });
});
labSection.appendChild(pickerGrid);
bookEl.appendChild(labSection);
} catch(e) {
  console.error('GrimoireStack init error:', e);
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'color:#c97a7a;text-align:center;padding:30px;font-family:monospace;font-size:.85rem;background:rgba(30,10,10,.6);border:1px solid rgba(200,50,50,.15);border-radius:4px;margin:20px;z-index:10;position:relative';
  errDiv.textContent = '⚠ ' + e.message;
  document.querySelector('.book-spread')?.prepend(errDiv);
}

// ══════════════════════════════════════════════════════════════
//  INTERACTIONS
// ══════════════════════════════════════════════════════════════

let currentSchool = schools[0].id;

function selectSchool(id) {
  currentSchool = id;
  document.querySelectorAll('.school-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.lab-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  const section = document.getElementById(`school-${id}`);
  if (section) section.classList.add('active');
  const tab = document.querySelector(`.tab-btn[data-school="${id}"]`);
  if (tab) tab.classList.add('active');
  searchInput.value = '';
  document.querySelectorAll('.spell-card').forEach(el => { el.style.display = ''; el.classList.remove('glow', 'dim'); });
  document.querySelectorAll('.no-spells').forEach(el => el.remove());
  const orbResult = document.getElementById('orbResult');
  if (orbResult) { orbResult.className = 'orb-result'; orbResult.textContent = ''; }
  const orb = document.getElementById('orbVessel');
  if (orb) orb.classList.remove('scrying');
  setTimeout(pageCreak, 50);
}

// ══════════════════════════════════════════════════════════════
//  WITCH LAUGH & PAGE CREAK — Audio synthesis
// ══════════════════════════════════════════════════════════════

let audioCtx = null;
let laughPlayed = false;

function witchLaugh() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const master = audioCtx.createGain();
    master.gain.value = 0.25;
    master.connect(audioCtx.destination);
    const convolver = audioCtx.createConvolver();
    const reverbLen = audioCtx.sampleRate * 0.4;
    const impulse = audioCtx.createBuffer(1, reverbLen, audioCtx.sampleRate);
    const data = impulse.getChannelData(0);
    for (let i = 0; i < reverbLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (reverbLen * 0.3));
    convolver.buffer = impulse;
    convolver.connect(master);
    const reverbGain = audioCtx.createGain();
    reverbGain.gain.value = 0.3;
    const laughs = [
      { t: 0, f1: 750, f2: 820, dur: 0.13 }, { t: 0.16, f1: 680, f2: 590, dur: 0.1 },
      { t: 0.3, f1: 820, f2: 700, dur: 0.12 }, { t: 0.48, f1: 600, f2: 520, dur: 0.18 },
      { t: 0.7, f1: 880, f2: 760, dur: 0.1 }, { t: 0.85, f1: 520, f2: 450, dur: 0.2 },
    ];
    laughs.forEach(({ t, f1, f2, dur }) => {
      [0, 1].forEach(voice => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc.type = voice === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f1, t);
        osc.frequency.exponentialRampToValueAtTime(f2, t + dur * 0.6);
        filter.type = 'bandpass';
        filter.frequency.value = voice === 0 ? 1200 : 800;
        filter.Q.value = 1.5;
        const vib = audioCtx.createOscillator();
        vib.frequency.value = 35 + Math.random() * 15;
        const vibG = audioCtx.createGain();
        vibG.gain.value = 30 + Math.random() * 20;
        vib.connect(vibG); vibG.connect(osc.frequency); vib.start(); vib.stop(t + dur + 0.05);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3 - voice * 0.08, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter); filter.connect(gain);
        gain.connect(reverbGain); reverbGain.connect(convolver);
        gain.connect(master);
        osc.start(t); osc.stop(t + dur + 0.02);
      });
    });
    for (let n = 0; n < 3; n++) {
      const noiseDur = 0.08 + Math.random() * 0.06;
      const noiseStart = 0.08 + n * 0.25;
      const buf = audioCtx.createBuffer(1, noiseDur * audioCtx.sampleRate, audioCtx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.04, noiseStart);
      ng.gain.exponentialRampToValueAtTime(0.001, noiseStart + noiseDur);
      src.connect(ng); ng.connect(reverbGain);
      src.start(noiseStart);
    }
  } catch(e) {}
}

let pageCreakAudio = null;

function pageCreak() {
  try {
    if (!pageCreakAudio) { pageCreakAudio = new Audio('/turning-the-page.mp3'); pageCreakAudio.volume = 0.25; }
    else { pageCreakAudio.currentTime = 0; }
    pageCreakAudio.play();
  } catch(e) {}
}

let ambienceStarted = false;
let ambienceNodes = [];

function startAmbience() {
  if (ambienceStarted) return;
  ambienceStarted = true;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const ambMaster = audioCtx.createGain();
    ambMaster.gain.value = 0.035;
    ambMaster.connect(audioCtx.destination);
    ambienceNodes.push(ambMaster);
    const drone1 = audioCtx.createOscillator();
    drone1.type = 'sine'; drone1.frequency.value = 52;
    const drone1G = audioCtx.createGain(); drone1G.gain.value = 0.4;
    drone1.connect(drone1G); drone1G.connect(ambMaster); drone1.start();
    ambienceNodes.push(drone1);
    const drone2 = audioCtx.createOscillator();
    drone2.type = 'sine'; drone2.frequency.value = 55.3;
    const drone2G = audioCtx.createGain(); drone2G.gain.value = 0.3;
    drone2.connect(drone2G); drone2G.connect(ambMaster); drone2.start();
    ambienceNodes.push(drone2);
    const drone3 = audioCtx.createOscillator();
    drone3.type = 'sine'; drone3.frequency.value = 31;
    const drone3G = audioCtx.createGain(); drone3G.gain.value = 0.2;
    drone3.connect(drone3G); drone3G.connect(ambMaster); drone3.start();
    ambienceNodes.push(drone3);
    const airLen = audioCtx.sampleRate * 4;
    const airBuf = audioCtx.createBuffer(1, airLen, audioCtx.sampleRate);
    const airCh = airBuf.getChannelData(0);
    for (let i = 0; i < airLen; i++) airCh[i] = Math.random() * 2 - 1;
    const airSrc = audioCtx.createBufferSource();
    airSrc.buffer = airBuf; airSrc.loop = true;
    const airBP = audioCtx.createBiquadFilter();
    airBP.type = 'bandpass'; airBP.frequency.value = 400; airBP.Q.value = 0.3;
    const airG = audioCtx.createGain(); airG.gain.value = 0.3;
    airSrc.connect(airBP); airBP.connect(airG); airG.connect(ambMaster);
    airSrc.start(); ambienceNodes.push(airSrc);
    function scheduleCrackle() {
      if (!ambienceStarted) return;
      const nextCrackle = 2 + Math.random() * 8;
      setTimeout(() => {
        try {
          if (!ambienceStarted) return;
          const cNow = audioCtx.currentTime;
          const cDur = 0.04 + Math.random() * 0.06;
          const cLen = audioCtx.sampleRate * cDur;
          const cBuf = audioCtx.createBuffer(1, cLen, audioCtx.sampleRate);
          const cCh = cBuf.getChannelData(0);
          for (let i = 0; i < cLen; i++) cCh[i] = (Math.random() * 2 - 1) * (1 - i / cLen);
          const cSrc = audioCtx.createBufferSource();
          cSrc.buffer = cBuf;
          const cBP = audioCtx.createBiquadFilter();
          cBP.type = 'bandpass'; cBP.frequency.value = 2000 + Math.random() * 1500; cBP.Q.value = 2;
          const cG = audioCtx.createGain();
          cG.gain.setValueAtTime(0.15 + Math.random() * 0.1, cNow);
          cG.gain.exponentialRampToValueAtTime(0.001, cNow + cDur);
          cSrc.connect(cBP); cBP.connect(cG); cG.connect(ambMaster);
          cSrc.start(cNow);
        } catch(e) {}
        if (ambienceStarted) scheduleCrackle();
      }, nextCrackle * 1000);
    }
    scheduleCrackle();
  } catch(e) {}
}

// ── SCRYING ORB — Search
// ══════════════════════════════════════════════════════════════

const searchInput = document.getElementById('searchInput');

function doSearch(q) {
  const orbResult = document.getElementById('orbResult');
  orbVessel.classList.toggle('scrying', q.length > 0);

  if (!q) {
    selectSchool(currentSchool);
    orbResult.className = 'orb-result';
    orbResult.textContent = '';
    return;
  }

  const { bySchool, total } = searchSpells(schools, q);
  let firstMatch = true;

  document.querySelectorAll('.school-section').forEach(section => {
    const grid = section.querySelector('.spell-grid');
    const matches = bySchool[section.dataset.school] || [];
    const hasMatch = matches.length > 0;

    grid.querySelectorAll('.no-spells').forEach(el => el.remove());

    section.querySelectorAll('.spell-card').forEach(card => {
      const key = card.dataset.spellName + '\0' + card.dataset.skill;
      const match = matches.includes(key);
      card.classList.toggle('glow', match);
      card.classList.toggle('dim', !match);
      card.style.display = match ? '' : 'none';
      if (match && firstMatch) { firstMatch = false; card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });

    if (!hasMatch) {
      const empty = document.createElement('div');
      empty.className = 'no-spells';
      empty.textContent = 'The orb sees nothing matching your affliction…';
      grid.appendChild(empty);
    }
    section.classList.toggle('active', hasMatch);
  });
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  if (total > 0) {
    orbResult.textContent = `${total} incantation${total !== 1 ? 's' : ''} found`;
    orbResult.className = 'orb-result show found';
  } else {
    orbResult.textContent = 'none found';
    orbResult.className = 'orb-result show none';
  }

  if (total > 0 && !laughPlayed) {
    if (laughingDebounce) clearTimeout(laughingDebounce);
    laughingDebounce = setTimeout(() => { witchLaugh(); laughPlayed = true; }, 400);
  }
  if (total === 0) laughPlayed = false;
}

const orbVessel = document.getElementById('orbVessel');

// Init orb mist particles (replaces IIFE)
(function initOrbMist() {
  const container = document.getElementById('orbMist');
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'mist-particle';
    p.style.left = (10 + Math.random() * 80) + '%';
    p.style.width = p.style.height = (2 + Math.random() * 6) + 'px';
    p.style.animationDuration = (4 + Math.random() * 6) + 's';
    p.style.animationDelay = (Math.random() * 4) + 's';
    container.appendChild(p);
  }
})();

orbVessel.addEventListener('click', () => searchInput.focus());

document.querySelectorAll('.ex-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    searchInput.value = chip.dataset.query;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.focus();
  });
});

let laughingDebounce = null;

searchInput.addEventListener('input', () => {
  doSearch(searchInput.value.toLowerCase().trim());
});

// ══════════════════════════════════════════════════════════════
//  RECIPE LAB
// ══════════════════════════════════════════════════════════════

const labSelected = [];
const cauldronChips = document.getElementById('cauldronChips');
const cauldronEmpty = document.getElementById('cauldronEmpty');
const cauldronCount = document.getElementById('cauldronCount');
const brewBtn = document.getElementById('brewBtn');
const labOutput = document.getElementById('labOutput');

const potionPrefixes = ['Elixir','Potion','Tincture','Salve','Draught','Brew','Compound','Essence','Infusion','Extract'];
const potionAdjectives = ['Ancient','Crimson','Shadow','Arcane','Ethereal','Verdant','Ashen','Silver','Amber','Violet','Deep','Restorative','Binding','Surging','Quiet'];

function toggleLabSpell(spell, school, cardEl) {
  const idx = labSelected.findIndex(s => s.name === spell.name);
  if (idx >= 0) {
    labSelected.splice(idx, 1);
    cardEl.classList.remove('glow');
    cardEl.style.borderColor = '';
  } else if (labSelected.length < 5) {
    labSelected.push({ spell, school });
    cardEl.classList.add('glow');
    cardEl.style.borderColor = 'rgba(212,175,55,.3)';
  }
  updateCauldron();
}

function updateCauldron() {
  cauldronChips.innerHTML = '';
  labSelected.forEach(item => {
    const chip = document.createElement('span');
    chip.className = 'cauldron-chip';
    chip.textContent = `${item.school.symbol} ${item.spell.name}`;
    chip.addEventListener('click', () => {
      const cards = document.getElementById('labPickerGrid').querySelectorAll('.spell-card');
      for (const c of cards) { if (c.dataset.spellName === item.spell.name) { c.click(); break; } }
    });
    chip.title = 'Click to remove';
    cauldronChips.appendChild(chip);
  });
  cauldronEmpty.style.display = labSelected.length > 0 ? 'none' : '';
  cauldronCount.textContent = labSelected.length > 0 ? `${labSelected.length} of 5 incantations selected` : '';
  document.getElementById('labCauldron').classList.toggle('has-spells', labSelected.length > 0);
  const ready = labSelected.length >= 2;
  brewBtn.classList.toggle('disabled', !ready);
  brewBtn.disabled = !ready;
}

brewBtn.addEventListener('click', brewRitual);

function brewRitual() {
  if (labSelected.length < 2) return;
  const prefix = potionPrefixes[Math.floor(Math.random() * potionPrefixes.length)];
  const adj = potionAdjectives[Math.floor(Math.random() * potionAdjectives.length)];
  const involvedSchools = [...new Set(labSelected.map(s => s.school.name))];
  let suffix;
  if (involvedSchools.length === 1) {
    const nounMap = {
      debugging:'Remediation',reasoning:'Cognition',process:'Refinement',
      'code-review':'Scrutiny',architecture:'Architecture',discovery:'Discovery',
      documentation:'Expression',planning:'Foresight',learning:'Knowledge',
      'anti-hallucination':'Veracity','software-dev':'Crafting','multi-agent':'Confluence',
      risk:'Warding','cognitive-load':'Clarity',testing:'Measurement'
    };
    suffix = nounMap[labSelected[0].school.id] || 'Power';
  } else if (involvedSchools.length === 2) { suffix = `${adj} Union`; }
  else { suffix = `${adj} Convergence`; }

  document.getElementById('rcName').textContent = `${prefix} of ${suffix}`;
  const allEffects = labSelected.map(s => s.spell.effect.toLowerCase());
  const keywords = ['trace','debug','test','code','reason','verify','review','design','plan','build','learn','coordinate','ward','refactor','analyze','diagnose','fix','search','navigate','structure','model'];
  const foundKeywords = keywords.filter(k => allEffects.some(e => e.includes(k)));
  const uniqueKw = [...new Set(foundKeywords)];
  const names = labSelected.map(s => s.spell.name);
  let effect = 'A custom ritual combining ';
  effect += names.length === 2 ? `${names[0]} and ${names[1]}.` : names.slice(0, -1).join(', ') + ', and ' + names.slice(-1) + '.';
  effect += ' When cast together, these incantations provide ';
  effect += uniqueKw.length > 0 ? uniqueKw.slice(0, 3).join(', ') + ' capabilities.' : 'a broad spectrum of agentic power.';
  document.getElementById('rcEffect').textContent = effect;

  const statuses = labSelected.map(s => s.spell.status);
  const hasProven = statuses.some(s => s === 'Proven');
  const hasMCP = statuses.some(s => s && s.includes('MCP'));
  let potency, cls;
  if (hasProven && hasMCP) { potency = 'Archmage'; cls = 'archmage'; }
  else if (hasProven && labSelected.length >= 3) { potency = 'Master'; cls = 'master'; }
  else if (hasProven) { potency = 'Adept'; cls = 'adept'; }
  else { potency = 'Apprentice'; cls = 'apprentice'; }
  const potEl = document.getElementById('rcPotency');
  potEl.textContent = `✦ ${potency}`;
  potEl.className = 'rc-potency ' + cls;
  document.getElementById('rcSpells').innerHTML = labSelected.map(s => `<em>${s.spell.name}</em>`).join(', ');
  labOutput.classList.add('show');
  labOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  witchLaugh();
}

// ══════════════════════════════════════════════════════════════
//  SPELL DETAIL MODAL
// ══════════════════════════════════════════════════════════════

const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

function openSpell(spell, school) {
  const statusStr = spell.status && spell.status !== '—' ? spell.status : 'Common';
  const statusClass = (spell.status || 'common').toLowerCase().replace(/[^a-z]/g,'') || 'common';
  document.getElementById('modalSymbol').textContent = school.symbol;
  document.getElementById('modalSchool').textContent = school.name;
  document.getElementById('modalSchoolReal').textContent = `(${school.real})`;
  document.getElementById('modalTitle').textContent = spell.name;
  document.getElementById('modalIncantation').textContent = `〈 ${spell.skill} 〉`;
  document.getElementById('modalEffect').textContent = spell.effect;
  const ms = document.getElementById('modalStatus');
  ms.textContent = statusStr;
  ms.className = 'tag ' + statusClass;
  document.getElementById('modalPath').textContent = spell.skill;

  if (spell.note) {
    let noteEl = document.querySelector('.modal-note');
    if (!noteEl) {
      noteEl = document.createElement('div');
      noteEl.className = 'modal-detail-row modal-note';
      document.querySelector('.modal .modal-incantation').after(noteEl);
    }
    noteEl.innerHTML = `<div class="modal-detail-label">Note</div><div class="modal-detail-value">${spell.note}</div>`;
    noteEl.style.display = 'flex';
  } else {
    const noteEl = document.querySelector('.modal-note');
    if (noteEl) noteEl.style.display = 'none';
  }

  const synGrid = document.getElementById('synGrid');
  const synSection = document.getElementById('modalSynergies');
  synGrid.innerHTML = '';
  if (spell.combos && spell.combos.length > 0) {
    synSection.style.display = 'block';
    spell.combos.forEach(comboName => {
      let found = null;
      for (const s of schools) {
        for (const sp of s.spells) { if (sp.name === comboName) { found = { spell: sp, school: s }; break; } }
        if (found) break;
      }
      const chip = document.createElement('span');
      chip.className = 'syn-chip';
      chip.textContent = found ? `✦ ${comboName}` : comboName;
      if (found) { chip.addEventListener('click', () => openSpell(found.spell, found.school)); chip.title = `Open ${comboName}`; }
      synGrid.appendChild(chip);
    });
  } else { synSection.style.display = 'none'; }

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

const modal = document.getElementById('modal');
document.getElementById('modalClose').addEventListener('click', () => { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; });
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; } });

// ══════════════════════════════════════════════════════════════
//  EMBER PARTICLE EFFECT
// ══════════════════════════════════════════════════════════════

(function initEmbers() {
  const container = document.getElementById('embers');
  const types = ['ember-amber','ember-gold','ember-rune'];
  for (let i = 0; i < 40; i++) {
    const e = document.createElement('div');
    e.className = 'ember ' + types[i % 3];
    e.style.left = Math.random() * 100 + '%';
    e.style.width = e.style.height = (2 + Math.random() * 3) + 'px';
    e.style.animationDuration = (15 + Math.random() * 25) + 's';
    e.style.animationDelay = (Math.random() * 20) + 's';
    container.appendChild(e);
  }
  for (let i = 0; i < 15; i++) {
    const e = document.createElement('div');
    e.className = 'ember ' + (i % 2 === 0 ? 'ember-amber' : 'ember-gold');
    e.style.left = Math.random() * 100 + '%';
    e.style.width = e.style.height = (5 + Math.random() * 8) + 'px';
    e.style.animationDuration = (35 + Math.random() * 30) + 's';
    e.style.animationDelay = (Math.random() * 30) + 's';
    container.appendChild(e);
  }
})();

// ── AMBIENCE — starts on first interaction
// ══════════════════════════════════════════════════════════════

function tryStartAmbience() {
  if (!ambienceStarted) startAmbience();
  document.removeEventListener('click', tryStartAmbience);
  document.removeEventListener('keydown', tryStartAmbience);
  document.removeEventListener('touchstart', tryStartAmbience);
}
document.addEventListener('click', tryStartAmbience);
document.addEventListener('keydown', tryStartAmbience);
document.addEventListener('touchstart', tryStartAmbience);
