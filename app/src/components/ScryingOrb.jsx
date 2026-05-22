import { useEffect } from 'react';

export default function ScryingOrb({ searchQuery, onSearchChange }) {
  // Init orb mist particles
  useEffect(() => {
    const container = document.getElementById('orbMist');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'mist-particle';
      p.style.left = (10 + Math.random() * 80) + '%';
      p.style.width = p.style.height = (2 + Math.random() * 6) + 'px';
      p.style.animationDuration = (4 + Math.random() * 6) + 's';
      p.style.animationDelay = (Math.random() * 4) + 's';
      container.appendChild(p);
    }
  }, []);

  const exampleQueries = [
    { label: 'bug', icon: '🐛' }, { label: 'test', icon: '🧪' },
    { label: 'security', icon: '🛡' }, { label: 'refactor', icon: '🔧' },
    { label: 'architecture', icon: '🏛' }, { label: 'code review', icon: '📋' },
  ];

  return (
    <div className="scrying-orb">
      <div className={`orb-vessel${searchQuery ? ' scrying' : ''}`} id="orbVessel"
        tabIndex={0} role="button" aria-label="Click to search"
        onClick={() => document.getElementById('searchInput')?.focus()}>
        <div className="orb-ring" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-rim" />
        <div className="orb-inner-glow" />
        <div className="orb-rune">⟐</div>
        <div id="orbResult" className={`orb-result${searchQuery ? ' show' : ''}`} />
        <div className="orb-mist" id="orbMist" />
      </div>
      <div className="orb-input-wrap">
        <span className="orb-input-icon">⟐</span>
        <input type="text" id="searchInput" className="orb-input"
          placeholder="Search for a skill or describe your problem…"
          autoComplete="off" defaultValue={searchQuery}
          onInput={e => onSearchChange(e.target.value.toLowerCase().trim())} />
      </div>
      <div className="orb-examples">
        <span className="ex-label">Try:</span>
        {exampleQueries.map(q => (
          <span key={q.label} className="ex-chip" onClick={() => {
            const input = document.getElementById('searchInput');
            if (input) { input.value = q.label; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); }
          }}>
            {q.icon} {q.label}
          </span>
        ))}
      </div>
    </div>
  );
}
