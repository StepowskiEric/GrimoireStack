import { useEffect, useRef } from 'react';
import { useConsultation } from '../hooks/useConsultation.js';
import SigilPicker from './consultation/SigilPicker.jsx';
import QuestionCard from './consultation/QuestionCard.jsx';
import SanityMeter from './consultation/SanityMeter.jsx';
import InsightMeter from './consultation/InsightMeter.jsx';
import ResultCard from './consultation/ResultCard.jsx';
import SigilSvg from './consultation/SigilSvg.jsx';
import TentacleSvg from './consultation/TentacleSvg.jsx';
import Icon from './Icon.jsx';

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
      className={`seance seance--sanity-${sanity} ${result?.beasthood ? 'seance--beasthood' : ''}`}
      data-stage={stage}
      data-sanity={sanity}
      role="region"
      aria-label="The Séance"
    >
      {/* Atmospheric backdrops — re-used from the app's visual primitives */}
      <div className="seance__backdrop" aria-hidden="true" />
      <SigilSvg sanity={sanity} />
      <TentacleSvg sanity={sanity} />

      <header className="seance__header">
        <h1 className="seance__title">The Séance</h1>
        <p className="seance__subtitle">
          Six domains. Six wounds. Find the incantation that names what ails you.
        </p>
      </header>

      <div className="seance__meters">
        <SanityMeter sanity={sanity} />
        <InsightMeter insight={insight} />
      </div>

      <main className="seance__stage">
        {stage === 'sigil' && (
          <SigilPicker onPick={pickSigil} />
        )}

        {stage === 'asking' && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            pool={currentPool}
            onTap={tapOption}
            disabled={false}
          />
        )}

        {stage === 'result' && result && (
          <ResultCard
            result={result}
            onRevealSpell={onRevealSpell}
            onReset={reset}
          />
        )}
      </main>

      <footer className="seance__footer">
        {stage !== 'sigil' && (
          <button type="button" className="seance__abandon" onClick={reset}>
            <Icon name="close" size={14} /> Abandon the Ritual
          </button>
        )}
      </footer>
    </div>
  );
}
