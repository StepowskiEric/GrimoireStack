/* eslint-disable react/no-array-index-key -- fixed-size static pip array */

import { useEffect, useRef, useState } from 'react';
import { SEANCE_MAX_SANITY } from '../../data/consultationData.js';

/**
 * SanityMeter — five pips that drain as Sanity drops.
 *
 * The visual classes are derived from the current sanity value so CSS
 * can apply the layered decay (vignette, desat, sigil distortion).
 * The class `seance-sanity--n` is appended to the meter container for
 * each level, letting App.css scope per-threshold styles.
 *
 * When sanity drops, the pip that just turned off receives a
 * `seance-sanity__pip--draining` class for one animation cycle so CSS
 * can run the collapse-inward animation.
 */
export default function SanityMeter({ sanity, maxSanity = SEANCE_MAX_SANITY }) {
  const [drainingIndex, setDrainingIndex] = useState(null);
  const prevSanityRef = useRef(sanity);

  useEffect(() => {
    const prev = prevSanityRef.current;
    if (sanity < prev) {
      // The pip at index `sanity` just turned off (e.g. 5→4 drains pip index 4).
      setDrainingIndex(sanity);
      // Clear the draining marker after the animation completes.
      const timer = setTimeout(() => setDrainingIndex(null), 400);
      return () => clearTimeout(timer);
    }
    prevSanityRef.current = sanity;
  }, [sanity]);

  const pips = Array.from({ length: maxSanity }, (_, i) => i < sanity);
  const justDrained = drainingIndex !== null;

  return (
    <div
      className={`seance-sanity seance-sanity--${sanity}${justDrained ? ' seance-sanity--jolt' : ''}`}
      role="meter"
      aria-label="Sanity"
      aria-valuemin={0}
      aria-valuemax={maxSanity}
      aria-valuenow={sanity}
      data-sanity={sanity}
    >
      <span className="font-['Cinzel'] text-[0.68rem] uppercase tracking-widest text-text-muted">
        Sanity
      </span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {pips.map((filled, i) => (
          <span
            key={`pip-${i}`}
            data-testid={filled ? 'sanity-pip-filled' : undefined}
            className={[
              'h-2 w-2 rounded-full border border-border transition-all duration-200',
              filled ? 'bg-accent shadow-[0_0_8px_rgba(212,175,55,0.35)]' : 'bg-surface-overlay',
              i === drainingIndex ? 'seance-sanity__pip--draining' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
    </div>
  );
}
