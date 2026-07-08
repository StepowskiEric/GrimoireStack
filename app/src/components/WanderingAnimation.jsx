import { useState, useEffect, useCallback } from 'react';

const CHAMBERS = [
  {
    id: 'corridor',
    label: 'The Corridor of Stone',
    text: 'A torch-lit passage stretches into darkness...',
    duration: 2500,
  },
  {
    id: 'flooded',
    label: 'The Flooded Passage',
    text: 'Stale water ripples at your feet. Something stirs beneath...',
    duration: 2500,
  },
  {
    id: 'watchers',
    label: 'The Hall of Watchers',
    text: 'Unblinking eyes track your passage from between the shelves...',
    duration: 3000,
  },
  {
    id: 'crevice',
    label: 'The Narrowing Crevice',
    text: 'The walls press inward. The keeper guides you through...',
    duration: 2500,
  },
  {
    id: 'reveal',
    label: 'The Scroll Chamber',
    text: 'A presence bids you take the scroll...',
    duration: 3000,
  },
];

export default function WanderingAnimation({ skillName, onComplete }) {
  const [chamberIdx, setChamberIdx] = useState(0);

  const advance = useCallback(() => {
    setChamberIdx((prev) => {
      const next = prev + 1;
      if (next >= CHAMBERS.length) {
        onComplete?.();
        return prev;
      }
      return next;
    });
  }, [onComplete]);

  useEffect(() => {
    if (chamberIdx >= CHAMBERS.length) return;
    const timer = setTimeout(advance, CHAMBERS[chamberIdx].duration);
    return () => clearTimeout(timer);
  }, [chamberIdx, advance]);

  const chamber = CHAMBERS[chamberIdx];
  if (!chamber) return null;

  return (
    <div className="wandering-overlay" key={chamber.id}>
      {/* Chamber-specific visuals */}
      <div className={`wandering-chamber wandering-chamber--${chamber.id}`}>
        {/* Chamber 1: stone walls + torches */}
        {chamber.id === 'corridor' && (
          <>
            <div className="corridor-wall corridor-wall--left" />
            <div className="corridor-wall corridor-wall--right" />
            <div className="corridor-torch corridor-torch--left">
              <div className="torch-flame" />
              <div className="torch-glow" />
            </div>
            <div className="corridor-torch corridor-torch--right">
              <div className="torch-flame" />
              <div className="torch-glow" />
            </div>
            <div className="corridor-arch" />
          </>
        )}

        {/* Chamber 2: flooded passage */}
        {chamber.id === 'flooded' && (
          <>
            <div className="flood-water" />
            <div className="flood-ripple flood-ripple--1" />
            <div className="flood-ripple flood-ripple--2" />
            <div className="flood-ripple flood-ripple--3" />
            <div className="flood-submerged" />
          </>
        )}

        {/* Chamber 3: hall of watchers */}
        {chamber.id === 'watchers' && (
          <>
            <div className="watcher watcher--1"><div className="watcher-pupil" /></div>
            <div className="watcher watcher--2"><div className="watcher-pupil" /></div>
            <div className="watcher watcher--3"><div className="watcher-pupil" /></div>
            <div className="watcher watcher--4"><div className="watcher-pupil" /></div>
            <div className="watcher watcher--5"><div className="watcher-pupil" /></div>
            <div className="watcher watcher--6"><div className="watcher-pupil" /></div>
          </>
        )}

        {/* Chamber 4: narrowing crevice */}
        {chamber.id === 'crevice' && (
          <>
            <div className="crevice-wall crevice-wall--left" />
            <div className="crevice-wall crevice-wall--right" />
            <div className="crevice-glow" />
          </>
        )}

        {/* Chamber 5: scroll chamber */}
        {chamber.id === 'reveal' && (
          <>
            <div className="reveal-glow" />
            <div className="reveal-light" />
            <div className="reveal-scroll">
              <span className="reveal-skill-name">{skillName}</span>
            </div>
            <div className="reveal-particles" />
          </>
        )}
      </div>

      {/* Narration footer */}
      <div className="wandering-narration">
        <span className="wandering-chamber-title">{chamber.label}</span>
        <span className="wandering-chamber-text">{chamber.text}</span>
      </div>
    </div>
  );
}
