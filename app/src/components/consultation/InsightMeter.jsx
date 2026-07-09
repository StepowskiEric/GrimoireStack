import { SEANCE_MAX_QUESTIONS } from '../../data/consultationData.js';

/**
 * InsightMeter — a counter of questions asked, plus a thin bar
 * showing progress toward the question cap.
 */
export default function InsightMeter({ insight, max = SEANCE_MAX_QUESTIONS }) {
  const ratio = Math.min(1, insight / max);
  return (
    <div
      className="flex items-center gap-2"
      role="meter"
      aria-label="Insight"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={insight}
    >
      <span className="font-['Cinzel'] text-[0.68rem] uppercase tracking-widest text-text-muted">Insight</span>
      <div className="h-1.5 flex-1 bg-surface-overlay rounded-full overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-accent"
          style={{ width: `${Math.max(0, ratio) * 100}%` }}
        />
      </div>
      <span className="font-['Cinzel'] text-[0.68rem] text-text-muted">{insight}/{max}</span>
    </div>
  );
}
