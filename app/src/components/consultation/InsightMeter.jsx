import { SEANCE_MAX_QUESTIONS } from '../../data/consultationData.js';

/**
 * InsightMeter — a counter of questions asked, plus a thin bar
 * showing progress toward the question cap.
 */
export default function InsightMeter({ insight, max = SEANCE_MAX_QUESTIONS }) {
  const ratio = Math.min(1, insight / max);
  return (
    <div
      className="seance-insight"
      role="meter"
      aria-label="Insight"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={insight}
    >
      <span className="seance-insight__label">Insight</span>
      <div className="seance-insight__bar" aria-hidden="true">
        <div
          className="seance-insight__fill"
          style={{ width: `${Math.max(0, ratio) * 100}%` }}
        />
      </div>
      <span className="seance-insight__count">{insight}/{max}</span>
    </div>
  );
}
