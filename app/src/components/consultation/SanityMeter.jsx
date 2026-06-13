/* eslint-disable react/no-array-index-key -- fixed-size static pip array */

import { SEANCE_MAX_SANITY } from '../../data/consultationData.js';

/**
 * SanityMeter — five pips that drain as Sanity drops.
 *
 * The visual classes are derived from the current sanity value so CSS
 * can apply the layered decay (vignette, desat, sigil distortion).
 * The class `seance-sanity--n` is appended to the meter container for
 * each level, letting App.css scope per-threshold styles.
 */
export default function SanityMeter({ sanity, maxSanity = SEANCE_MAX_SANITY }) {
  const pips = Array.from({ length: maxSanity }, (_, i) => i < sanity);
  return (
    <div
      className={`seance-sanity seance-sanity--${sanity}`}
      role="meter"
      aria-label="Sanity"
      aria-valuemin={0}
      aria-valuemax={maxSanity}
      aria-valuenow={sanity}
      data-sanity={sanity}
    >
      <span className="seance-sanity__label">Sanity</span>
      <div className="seance-sanity__pips" aria-hidden="true">
        {pips.map((filled, i) => (
          <span
            key={`pip-${i}`}
            className={`seance-sanity__pip ${filled ? 'seance-sanity__pip--filled' : 'seance-sanity__pip--drained'}`}
          />
        ))}
      </div>
    </div>
  );
}
