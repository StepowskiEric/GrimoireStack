let audioCtx = null;
let pageCreakAudio = null;
let ambienceStarted = false;
const ambienceNodes = [];

// ── Master audio gate ───────────────────────────────────
// `audioEnabled` is the single switch for all sounds on the site.
// When false, every audio function below is a no-op and any running
// ambience / whisper scheduler stops. The React side (App.jsx) owns
// the persisted preference and calls setAudioEnabled() to sync.
let audioEnabled = true;

function setAudioEnabled(enabled) {
  audioEnabled = !!enabled;
  if (!audioEnabled) {
    stopAmbience();
    stopWhispers();
  }
}

function witchLaugh() {
  if (!audioEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const _now = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.gain.value = 0.25;
    master.connect(audioCtx.destination);
    const reverbLen = audioCtx.sampleRate * 0.4;
    const impulse = audioCtx.createBuffer(1, reverbLen, audioCtx.sampleRate);
    const data = impulse.getChannelData(0);
    for (let i = 0; i < reverbLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (reverbLen * 0.3));
    const convolver = audioCtx.createConvolver();
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
  } catch (e) { console.warn('[audio]', e); }
}

function pageCreak() {
  if (!audioEnabled) return;
  try {
    if (!pageCreakAudio) {
      pageCreakAudio = new Audio('/turning-the-page.mp3');
      pageCreakAudio.volume = 0.25;
    } else {
      pageCreakAudio.currentTime = 0;
    }
    pageCreakAudio.play();
  } catch (e) { console.warn('[audio]', e); }
}

let pageTurnAudio = null;

function pageTurn() {
  if (!audioEnabled) return;
  try {
    if (!pageTurnAudio) {
      pageTurnAudio = new Audio('/turning-the-page.mp3');
      pageTurnAudio.volume = 0.3;
    } else {
      pageTurnAudio.currentTime = 0;
    }
    pageTurnAudio.play();
  } catch (e) { console.warn('[audio]', e); }
}

function startAmbience() {
  if (!audioEnabled) return;
  if (ambienceStarted) return;
  ambienceStarted = true;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const _now = audioCtx.currentTime;
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
        } catch (e) { console.warn('[audio crackle]', e); }
        if (ambienceStarted) scheduleCrackle();
      }, nextCrackle * 1000);
    }
    scheduleCrackle();
  } catch (e) { console.warn('[audio]', e); }
}


// ── Lidless Eye Cast SFX ─────────────────────────────
// Four short synthesized cues for the Bloodborne / Cthulhu cast effect.
// All use the shared audioCtx singleton and are wrapped in try/catch
// to match the existing defensive pattern.

function ensureCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Tear down the running ambience. All nodes are stopped and disconnected;
// the recursive crackle scheduler exits because `ambienceStarted` flips.
function stopAmbience() {
  ambienceStarted = false;
  for (const node of ambienceNodes) {
    try {
      if (typeof node.stop === 'function') node.stop();
      if (typeof node.disconnect === 'function') node.disconnect();
    } catch (e) { console.warn('[audio stop]', e); }
  }
  ambienceNodes.length = 0;
}

function castTear() {
  if (!audioEnabled) return;
  try {
    const ctx = ensureCtx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    const dur = 0.2;
    const len = Math.floor(dur * ctx.sampleRate);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1200;
    bp.Q.value = 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.4, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(now);
    src.stop(now + dur + 0.02);
  } catch (e) { console.warn('[audio]', e); }
}

function castBoom() {
  if (!audioEnabled) return;
  try {
    const ctx = ensureCtx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    // Sine sub-bass with pitch drop
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.4);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0, now);
    og.gain.linearRampToValueAtTime(0.5, now + 0.008);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(og); og.connect(master);
    osc.start(now); osc.stop(now + 0.65);
    // Sub-bass noise burst
    const nDur = 0.25;
    const nLen = Math.floor(nDur * ctx.sampleRate);
    const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
    const nCh = nBuf.getChannelData(0);
    for (let i = 0; i < nLen; i++) nCh[i] = (Math.random() * 2 - 1) * (1 - i / nLen);
    const nSrc = ctx.createBufferSource();
    nSrc.buffer = nBuf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 120;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.3, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + nDur);
    nSrc.connect(lp); lp.connect(ng); ng.connect(master);
    nSrc.start(now);
  } catch (e) { console.warn('[audio]', e); }
}

function castScratch() {
  if (!audioEnabled) return;
  try {
    const ctx = ensureCtx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    // 6 short high-frequency bursts, like a sigil being scratched into stone
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.1;
      const dur = 0.06;
      const len = Math.floor(dur * ctx.sampleRate);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let j = 0; j < len; j++) ch[j] = (Math.random() * 2 - 1) * (1 - j / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3000 + Math.random() * 3000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.15 + Math.random() * 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(hp); hp.connect(g); g.connect(master);
      src.start(t);
    }
  } catch (e) { console.warn('[audio]', e); }
}

function castThud() {
  if (!audioEnabled) return;
  try {
    const ctx = ensureCtx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    const dur = 0.2;
    const len = Math.floor(dur * ctx.sampleRate);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.6, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(lp); lp.connect(g); g.connect(master);
    src.start(now);
    src.stop(now + dur + 0.02);
  } catch (e) { console.warn('[audio]', e); }
}

// ── Spine Interaction SFX ─────────────────────────────
// Faint, unsettling sounds for the cosmic horror Archives experience.

function hoverWhisper() {
  if (!audioEnabled) return;
  try {
    const ctx = ensureCtx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.06;
    master.connect(ctx.destination);
    // Breathy whisper: filtered noise with fast attack/decay
    const dur = 0.15;
    const len = Math.floor(dur * ctx.sampleRate);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.sin(Math.PI * i / len);
      ch[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800 + Math.random() * 400;
    bp.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.value = 0.4;
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(now);
  } catch (e) { console.warn('[audio]', e); }
}

function wetTendril() {
  if (!audioEnabled) return;
  try {
    const ctx = ensureCtx();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.08;
    master.connect(ctx.destination);
    // Wet squelch: two filtered noise bursts with pitch sweep
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.06;
      const dur = 0.08;
      const len = Math.floor(dur * ctx.sampleRate);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let j = 0; j < len; j++) {
        const env = Math.exp(-j / (len * 0.3));
        ch[j] = (Math.random() * 2 - 1) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(600, t);
      lp.frequency.exponentialRampToValueAtTime(200, t + dur);
      const g = ctx.createGain();
      g.gain.value = 0.5;
      src.connect(lp); lp.connect(g); g.connect(master);
      src.start(t);
    }
  } catch (e) { console.warn('[audio]', e); }
}
// ── Background whispers ────────────────────────────────
// Occasional short whispers layered over the ambience to thicken the
// atmosphere. Plays at a sparse, randomized interval (30–90s) and at
// low volume so it stays background.
//
// The scheduler is owned by module-level state, not a React effect.
// It checks the master `audioEnabled` flag at every step, so flipping
// the Settings "Enable sounds" toggle off mid-session stops both the
// currently-playing whisper and the next scheduled one.

const WHISPER_URLS = [
  '/whispering_1.mp3',
  '/whispering_2.mp3',
  '/whispering_3.mp3',
  '/whispering_4.mp3',
  '/whispering_5.mp3',
  '/whispering_6.mp3',
  '/whispering_7.mp3',
];

// Gap between whispers. Lower bound is high enough that the longest
// recorded whisper finishes before the next one can start. Upper bound
// is sparse so the user is not constantly interrupted.
const WHISPER_FIRST_DELAY_MS = 18000;     // first whisper ~18s in
const WHISPER_MIN_GAP_MS = 30000;         // 30s minimum between whispers
const WHISPER_MAX_GAP_MS = 90000;         // up to 90s between whispers
const WHISPER_VOLUME = 0.18;              // background level

let whispersStarted = false;
let whisperTimer = null;

function pickWhisperUrl() {
  return WHISPER_URLS[Math.floor(Math.random() * WHISPER_URLS.length)];
}

function playOneWhisper() {
  if (!audioEnabled) return;
  try {
    const url = pickWhisperUrl();
    const audio = new Audio(url);
    audio.volume = WHISPER_VOLUME;
    // Play() returns a promise that can reject if the user has not
    // interacted with the page; we deliberately swallow that error.
    audio.play().catch(() => {});
  } catch (e) { console.warn('[audio]', e); }
}

function scheduleNextWhisper() {
  if (!whispersStarted) return;
  if (!audioEnabled) return;
  const gap =
    WHISPER_MIN_GAP_MS + Math.random() * (WHISPER_MAX_GAP_MS - WHISPER_MIN_GAP_MS);
  whisperTimer = setTimeout(() => {
    if (!whispersStarted) return;
    if (!audioEnabled) return;
    playOneWhisper();
    scheduleNextWhisper();
  }, gap);
}

function startWhispers() {
  if (whispersStarted) return;
  if (!audioEnabled) return;
  whispersStarted = true;
  // First whisper: 18–25s after start, so the ambience has time to
  // settle before the first whisper layers on top.
  const firstDelay = WHISPER_FIRST_DELAY_MS + Math.random() * 7000;
  whisperTimer = setTimeout(() => {
    if (!whispersStarted) return;
    if (!audioEnabled) return;
    playOneWhisper();
    scheduleNextWhisper();
  }, firstDelay);
}

function stopWhispers() {
  whispersStarted = false;
  if (whisperTimer) {
    clearTimeout(whisperTimer);
    whisperTimer = null;
  }
}

export {
  witchLaugh,
  pageCreak,
  pageTurn,
  startAmbience,
  stopAmbience,
  castTear,
  castBoom,
  castScratch,
  castThud,
  hoverWhisper,
  wetTendril,
  startWhispers,
  stopWhispers,
  setAudioEnabled,
};