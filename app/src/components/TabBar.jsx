import { useCallback, useRef } from 'react';

export default function TabBar({ schools, currentSchool, onSelect, isLab }) {
  const tabRefs = useRef({});

  const allIds = [...schools.map(s => s.id), 'recipe-lab'];

  const onKeyDown = useCallback((e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % allIds.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + allIds.length) % allIds.length;
    else return;

    e.preventDefault();
    const nextId = allIds[nextIndex];
    onSelect(nextId);
    tabRefs.current[nextId]?.focus();
  }, [allIds, onSelect]);

  return (
    <div className="tabs-wrapper">
      <nav className="tabs" id="tabContainer" role="tablist" aria-label="Schools">
        {schools.map((s, i) => (
          <button key={s.id}
            ref={el => tabRefs.current[s.id] = el}
            role="tab"
            aria-selected={currentSchool === s.id}
            tabIndex={currentSchool === s.id ? 0 : -1}
            className={`tab-btn${currentSchool === s.id ? ' active' : ''}`}
            data-school={s.id}
            onClick={() => onSelect(s.id)}
            onKeyDown={e => onKeyDown(e, i)}>
            {s.symbol} {s.name} <span className="real-name">{s.real}</span>
          </button>
        ))}
        <button key="recipe-lab"
          ref={el => tabRefs.current['recipe-lab'] = el}
          role="tab"
          aria-selected={isLab}
          tabIndex={isLab ? 0 : -1}
          className={`tab-btn${isLab ? ' active' : ''}`}
          data-school="recipe-lab"
          onClick={() => onSelect('recipe-lab')}
          onKeyDown={e => onKeyDown(e, allIds.length - 1)}>
          ⚗ Recipe Lab <span className="real-name">brew your own</span>
        </button>
      </nav>
    </div>
  );
}
