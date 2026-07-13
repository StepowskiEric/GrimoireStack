import { useEffect, useRef } from 'react';
import { useConsultation } from '../hooks/useConsultation.js';
import { cn } from '../utils/cn.js';
import InsightMeter from './consultation/InsightMeter.jsx';
import QuestionCard from './consultation/QuestionCard.jsx';
import ResultCard from './consultation/ResultCard.jsx';
import SanityMeter from './consultation/SanityMeter.jsx';
import SigilPicker from './consultation/SigilPicker.jsx';
import SigilSvg from './consultation/SigilSvg.jsx';
import TentacleSvg from './consultation/TentacleSvg.jsx';
import Icon from './Icon.jsx';
import './RitualPanel.css';

/**
 * CommuneView — the Séance, a new tab in the bottom nav.
 *
 * Renders the appropriate panel for the current stage of the
 * consultation state machine. The visual decay (vignette, desat,
 * sigil distortion, whispers) is driven by the `sanity` value:
 *   - sanity 5 : calm, full color
 *   - sanity 4 : subtle
 *   - sanity 3 : medium
 *   - sanity 2 : heavy, darker pool activated
 *   - sanity 1 : bleed
 *   - sanity 0 : Beasthood ending, fully corrupted
 *
 * Audio: starts whispers when sanity drops below 4 (only if the
 * user's audioEnabled prop is on; the audio module is the source of
 * truth and the prop is a hint).
 */
export default function CommuneView({ onSpellClick, audioEnabled = false }) {
  const {
    stage,
    sanity,
    insight,
    currentPool,
    currentQuestion,
    result,
    pickSigil,
    tapOption,
    reset,
  } = useConsultation();

  // Audio: nudge the audio module to start whispers when sanity drops.
  // The audio module is the source of truth; this just gates the import
  // and ensures we only call startWhispers once per downward crossing.
  const whispersStartedRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !audioEnabled) return;
    if (sanity <= 3 && !whispersStartedRef.current) {
      whispersStartedRef.current = true;
      import('../audio/sounds.js').then((mod) => mod.startWhispers?.());
    }
  }, [sanity, audioEnabled]);

  const onRevealSpell = (spell, school) => {
    if (onSpellClick) onSpellClick(spell, school);
  };

  return (
    <div
      className={cn('seance', `seance--sanity-${sanity}`, result?.beasthood && 'seance--beasthood')}
      data-stage={stage}
      data-sanity={sanity}
      role="region"
      aria-label="The Séance"
    >
      {/* Atmospheric backdrops — re-used from the app's visual primitives */}
      <div className="absolute inset-0" aria-hidden="true" />
      <SigilSvg sanity={sanity} />
      <TentacleSvg sanity={sanity} />

      <header className="text-center max-w-[520px] mx-auto z-[2]">
        <h1 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide">
          The Séance
        </h1>
        <p className="text-text-secondary text-[0.82rem] mt-1">
          Six domains. Six wounds. Find the incantation that names what ails you.
        </p>
      </header>

      <div className="flex gap-4">
        <SanityMeter sanity={sanity} />
        <InsightMeter insight={insight} />
      </div>

      <main className="w-full max-w-[680px]">
        {stage === 'sigil' && <SigilPicker onPick={pickSigil} />}

        {stage === 'asking' && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            pool={currentPool}
            onTap={tapOption}
            disabled={false}
          />
        )}

        {stage === 'result' && result && (
          <ResultCard result={result} onRevealSpell={onRevealSpell} onReset={reset} />
        )}
      </main>

      <footer className="flex justify-center mt-2">
        {stage !== 'sigil' && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-text-muted text-[0.68rem] uppercase tracking-wider transition-colors hover:border-border-hover hover:text-text-primary"
            onClick={reset}
          >
            <Icon name="close" size={14} /> Abandon the Ritual
          </button>
        )}
      </footer>
    </div>
  );
}
