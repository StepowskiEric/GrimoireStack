let audioCtx = null;
let pageCreakAudio = null;
let ambienceStarted = false;
let ambienceNodes = [];

function witchLaugh() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
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
  } catch(e) {}
}

function pageCreak() {
  try {
    if (!pageCreakAudio) {
      pageCreakAudio = new Audio('/turning-the-page.mp3');
      pageCreakAudio.volume = 0.25;
    } else {
      pageCreakAudio.currentTime = 0;
    }
    pageCreakAudio.play();
  } catch(e) {}
}

function startAmbience() {
  if (ambienceStarted) return;
  ambienceStarted = true;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
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

export { witchLaugh, pageCreak, startAmbience };