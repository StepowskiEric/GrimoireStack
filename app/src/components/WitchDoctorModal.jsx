import { useState, useCallback, useEffect, useRef } from 'react';
import { WIZARD_DATA } from '../data/schools.js';

const DIVIDER_RUNES = ['ᚦ ᛖ ᛒ', 'ᛟ ᚲ ᛉ', 'ᚠ ᛗ ᚱ'];
const PROGRESS_RUNES = ['ᚦ', 'ᛖ', 'ᛟ'];
const VOICE_FILES = ['/witch_doctor_voice_1.mp3','/witch_doctor_voice_2.mp3','/witch_doctor_voice_3.mp3','/witch_doctor_voice_4.mp3'];

function playRandomVoice() {
  const src = VOICE_FILES[Math.floor(Math.random() * VOICE_FILES.length)];
  try {
    const a = new Audio(src);
    a.volume = 0.6;
    a.play().catch(() => {});
  } catch(e) {}
}
const STEP_RUNES = ['ᚦ', 'ᛖ', 'ᛟ'];

// Category cluster groups
const CLUSTERS = [
  {
    id: 'fix', label: 'Fix it', emoji: '🐛',
    categories: ['bug', 'api-data'],
  },
  {
    id: 'build', label: 'Build it', emoji: '🛠',
    categories: ['architecture', 'refactoring'],
  },
  {
    id: 'check', label: 'Check it', emoji: '✅',
    categories: ['code-review', 'testing-skill', 'output-quality'],
  },
  {
    id: 'figure', label: 'Figure it out', emoji: '🎯',
    categories: ['reasoning', 'collaboration', 'cognition', 'other'],
  },
];

const GRADIENT_STEPS = [
  'linear-gradient(135deg, rgba(28,18,40,0.95), rgba(18,12,28,0.95))',
  'linear-gradient(135deg, rgba(35,22,18,0.95), rgba(22,16,12,0.95))',
  'linear-gradient(135deg, rgba(40,26,12,0.95), rgba(28,18,10,0.95))',
];

function getClusterForCategory(catId) {
  return CLUSTERS.find(c => c.categories.includes(catId)) || null;
}

export default function WitchDoctorModal({ schools, onSelectSkill, onClose }) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [situation, setSituation] = useState(null);
  const [activeCluster, setActiveCluster] = useState(null);
  const [animSkip, setAnimSkip] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const handleClose = useCallback(() => {
    playRandomVoice();
    onClose();
  }, [onClose]);

  const modalRef = useRef(null);
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const animTimeoutRef = useRef(null);

  // Reduce motion — skip all animations
  const shouldAnimate = !prefersReduced.current && !animSkip;

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handler = (e) => {
      if (e.key === 'Escape') { handleClose(); return; }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose]);

  // Trigger reveal animation on step 2
  useEffect(() => {
    if (step === 2 && !revealing) {
      setRevealing(true);
    } else if (step < 2 && revealing) {
      setRevealing(false);
    }
  }, [step, revealing]);

  // Click to skip animation
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget && shouldAnimate && flipping) {
      setAnimSkip(true);
      setFlipping(false);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    }
  }, [shouldAnimate, flipping]);

  const selectCategory = useCallback((id) => {
    setCategory(id);
    setSituation(null);
    playRandomVoice();
  }, []);

  const selectSituation = useCallback((id) => {
    setSituation(id);
    playRandomVoice();
  }, []);

  const goNext = useCallback(() => {
    playRandomVoice();
    if (step === 0 && category) {
      if (shouldAnimate) {
        setFlipping(true);
        animTimeoutRef.current = setTimeout(() => {
          setStep(1);
          setFlipping(false);
        }, 300);
      } else {
        setStep(1);
      }
    } else if (step === 1 && situation) {
      if (shouldAnimate) {
        setFlipping(true);
        animTimeoutRef.current = setTimeout(() => {
          setStep(2);
          setFlipping(false);
        }, 300);
      } else {
        setStep(2);
      }
    }
  }, [step, category, situation, shouldAnimate]);

  const goBack = useCallback(() => {
    playRandomVoice();
    if (step === 1) {
      if (shouldAnimate) {
        setFlipping(true);
        animTimeoutRef.current = setTimeout(() => {
          setStep(0);
          setSituation(null);
          setFlipping(false);
        }, 300);
      } else {
        setStep(0);
        setSituation(null);
      }
    } else if (step === 2) {
      if (shouldAnimate) {
        setFlipping(true);
        animTimeoutRef.current = setTimeout(() => {
          setStep(1);
          setFlipping(false);
        }, 300);
      } else {
        setStep(1);
      }
    }
  }, [step, shouldAnimate]);

  const catData = category ? WIZARD_DATA.find(c => c.id === category) : null;
  const sitData = situation && catData ? catData.situations.find(s => s.id === situation) : null;

  const openSkill = useCallback((skillId) => {
    playRandomVoice();
    for (const school of schools) {
      const spell = school.spells.find(s => s.skill === skillId);
      if (spell) { onSelectSkill(spell, school); return; }
    }
    handleClose();
  }, [schools, onSelectSkill, onClose, handleClose]);

  const getSpellNameBySkill = useCallback((skillId) => {
    for (const school of schools) {
      const spell = school.spells.find(s => s.skill === skillId);
      if (spell) return spell.name;
    }
    return null;
  }, [schools]);

  // Select cluster: show only that group's categories
  const selectCluster = useCallback((clusterId) => {
    setActiveCluster(activeCluster === clusterId ? null : clusterId);
    playRandomVoice();
  }, [activeCluster]);

  // Categories to display based on active cluster
  const filteredCategories = activeCluster
    ? WIZARD_DATA.filter(c => CLUSTERS.find(cl => cl.id === activeCluster)?.categories.includes(c.id))
    : [];

  // Which clusters are currently visible
  const visibleClusters = activeCluster
    ? CLUSTERS.filter(c => c.id === activeCluster)
    : CLUSTERS;

  return (
    <div
      className="wd-overlay open"
      id="wdOverlay"
      onClick={handleOverlayClick}
    >
      <div
        className={`wd-modal ${shouldAnimate ? 'wd-page-peal' : ''} ${flipping ? 'wd-flipping' : ''}`}
        id="wdModal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Witch Doctor skill recommendation"
        style={{ background: GRADIENT_STEPS[step] }}
      >
        <button className="wd-close" onClick={onClose}>✕</button>

        {/* Witch Doctor portrait */}
        <div className={`wd-doctor ${revealing ? 'revealing' : ''}`}>
          <img
            src="/witch_doctor.png"
            alt="Witch Doctor"
            className="wd-doctor-img"
          />
        </div>

        {/* Rune progress pips */}
        <div className="wd-progress">
          {PROGRESS_RUNES.map((rune, i) => (
            <span
              key={i}
              className={`wd-step-rune ${step >= i ? 'done' : ''} ${step === i ? 'active' : ''}`}
            >
              {rune}
            </span>
          ))}
        </div>

        {/* Floating dust motes */}
        <div className="wd-dust" aria-hidden="true">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="wd-dust-particle" style={{
              left: `${10 + (i * 11) % 80}%`,
              animationDelay: `${i * 1.3}s`,
              animationDuration: `${8 + (i % 4) * 2}s`,
              width: `${1.5 + (i % 3)}px`,
              height: `${1.5 + (i % 3)}px`,
            }} />
          ))}
        </div>

        {/* Step 0: Pick a cluster — then pick a category */}
        {step === 0 && (
          <>
            <div className="wd-question">What's happening?</div>
            <div className="wd-subtitle">Tell the Witch Doctor your situation</div>

            {/* Cluster cards — always visible */}
            <div className={`wd-cluster-grid ${activeCluster ? 'has-selection' : ''}`}>
              {CLUSTERS.map(cluster => {
                const isActive = activeCluster === cluster.id;
                return (
                  <div
                    key={cluster.id}
                    className={`wd-cluster-card ${isActive ? 'active' : ''}`}
                    onClick={() => selectCluster(cluster.id)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') selectCluster(cluster.id); }}
                  >
                    <span className="wd-cluster-emoji">{cluster.emoji}</span>
                    <span className="wd-cluster-label">{cluster.label}</span>
                    <span className="wd-cluster-count">{cluster.categories.length}</span>
                  </div>
                );
              })}
            </div>

            {/* Categories — only visible when a cluster is active */}
            {activeCluster && (
              <div className="wd-options wd-options-reveal">
                {filteredCategories.length === 0 && (
                  <div className="wd-hint">No categories in this group</div>
                )}
                {filteredCategories.map((cat, ci) => {
                  const isSelected = category === cat.id;
                  const catClusterIdx = CLUSTERS.findIndex(c => c.categories.includes(cat.id));
                  const nextClusterIdx = ci < filteredCategories.length - 1
                    ? CLUSTERS.findIndex(c => c.categories.includes(filteredCategories[ci + 1].id))
                    : catClusterIdx;
                  return (
                    <div key={cat.id}>
                      <div
                        className={`wd-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => selectCategory(cat.id)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') selectCategory(cat.id); }}
                      >
                        <span className="opt-label">{cat.label}</span>
                        <span className="opt-desc">{cat.desc}</span>
                      </div>
                      {/* Rune divider when next category is in a different group */}
                      {nextClusterIdx > catClusterIdx && (
                        <div className="wd-divider" aria-hidden="true">
                          <span className="wd-divider-runes">{DIVIDER_RUNES[catClusterIdx]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Step 1: Pick situation */}
        {step === 1 && catData && (
          <>
            <div className="wd-question">Which situation?</div>
            <div className="wd-subtitle">{catData.label}</div>
            <div className="wd-options">
              {catData.situations.map(sit => (
                <div
                  key={sit.id}
                  className={`wd-option ${situation === sit.id ? 'selected' : ''}`}
                  onClick={() => selectSituation(sit.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={situation === sit.id}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') selectSituation(sit.id); }}
                >
                  <span className="opt-label">{sit.label}</span>
                  <span className="opt-desc">{sit.desc}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Result */}
        {step === 2 && sitData && (
          <div className="wd-result">
            {/* School symbol badge */}
            {(() => {
              let sym = null;
              for (const s of schools) {
                const sp = s.spells.find(sp => sp.skill === sitData.skill);
                if (sp) { sym = s.symbol; break; }
              }
              return sym ? <div className="wr-badge">{sym}</div> : null;
            })()}

            <div className="wr-skill-name">{getSpellNameBySkill(sitData.skill) || sitData.skill}</div>
            <div className="wr-effect">{sitData.effect}</div>

            {/* Parchment reason block */}
            <div className="wr-reason">
              <span className="wr-reason-rune-tl">ᚦ</span>
              <span className="wr-reason-rune-br">ᛟ</span>
              {sitData.reason}
            </div>

            <span className="wr-cta" onClick={() => openSkill(sitData.skill)} role="button" tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openSkill(sitData.skill); }}>
              ⚔ Open in Grimoire →
            </span>

            {sitData.alt ? (
              <>
                <div className="wr-alts">Or perhaps:</div>
                <div className="wr-alt-grid">
                  <span className="wr-alt-chip" onClick={() => openSkill(sitData.alt)} role="button" tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openSkill(sitData.alt); }}>
                    {getSpellNameBySkill(sitData.alt) || sitData.alt}
                  </span>
                </div>
              </>
            ) : null}

            {/* "More like this" worm */}
            <div className="wr-more">
              Not quite right? Try searching{' '}
              <span className="wr-more-link" onClick={() => {
                const input = document.getElementById('searchInput');
                if (input) {
                  const cat = WIZARD_DATA.find(c => c.situations && c.situations.some(s => s.id === sitData.id));
                  const keywords = cat ? cat.label.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(' ').slice(0, 2).join(' ') : sitData.skill;
                  input.value = keywords;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }
                handleClose();
              }}>
                {(() => {
                  const cat = WIZARD_DATA.find(c => c.situations && c.situations.some(s => s.id === sitData.id));
                  return cat ? cat.label.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(' ').slice(0, 2).join(' ') : sitData.skill;
                })()}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="wd-nav">
          {step > 0 ? (
            <button className="wd-back" onClick={goBack}>
              {step === 1 ? '← Back' : '← Start over'}
            </button>
          ) : <div />}
          {step < 2 && (
            <button
              className={`wd-next${(step === 0 && category) || (step === 1 && situation) ? ' ready' : ''}`}
              onClick={goNext}
              disabled={!((step === 0 && category) || (step === 1 && situation))}
            >
              {step === 0 ? 'Continue →' : 'Reveal Skill →'}
            </button>
          )}
        </div>

        <div className="wd-unsure">
          <button onClick={handleClose}>Not what you needed? Try searching instead.</button>
        </div>
      </div>
    </div>
  );
}
