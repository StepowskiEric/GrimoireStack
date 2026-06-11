import { useCallback, useRef } from 'react';

export default function TabBar({ schools, currentSchool, onSelect, isLab }) {
  const tabRefs = useRef({});

  const allIds = [
    ...schools.map(s => s.id),
    'index', 'graph', 'changelog',
    'ritual', 'recipe-lab',
  ];

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
            id={`tab-${s.id}`}
            ref={el => tabRefs.current[s.id] = el}
            role="tab"
            aria-selected={currentSchool === s.id}
            aria-controls={`school-${s.id}`}
            tabIndex={currentSchool === s.id ? 0 : -1}
            className={`tab-btn${currentSchool === s.id ? ' active' : ''}`}
            data-school={s.id}
            onClick={() => onSelect(s.id)}
            onKeyDown={e => onKeyDown(e, i)}>
            {s.symbol} {s.name} <span className="real-name">{s.real}</span>
          </button>
        ))}

        {/* Utility tabs */}
        <button key="index"
          id="tab-index"
          ref={el => tabRefs.current['index'] = el}
          role="tab"
          aria-selected={currentSchool === 'index'}
          aria-controls="school-index"
          tabIndex={currentSchool === 'index' ? 0 : -1}
          className={`tab-btn${currentSchool === 'index' ? ' active' : ''}`}
          data-school="index"
          onClick={() => onSelect('index')}
          onKeyDown={e => onKeyDown(e, schools.length)}>
          🗂 Index <span className="real-name">alphabetical</span>
        </button>
        <button key="graph"
          id="tab-graph"
          ref={el => tabRefs.current['graph'] = el}
          role="tab"
          aria-selected={currentSchool === 'graph'}
          aria-controls="school-graph"
          tabIndex={currentSchool === 'graph' ? 0 : -1}
          className={`tab-btn${currentSchool === 'graph' ? ' active' : ''}`}
          data-school="graph"
          onClick={() => onSelect('graph')}
          onKeyDown={e => onKeyDown(e, schools.length + 1)}>
          🕸 Graph <span className="real-name">spell web</span>
        </button>
        <button key="changelog"
          id="tab-changelog"
          ref={el => tabRefs.current['changelog'] = el}
          role="tab"
          aria-selected={currentSchool === 'changelog'}
          aria-controls="school-changelog"
          tabIndex={currentSchool === 'changelog' ? 0 : -1}
          className={`tab-btn${currentSchool === 'changelog' ? ' active' : ''}`}
          data-school="changelog"
          onClick={() => onSelect('changelog')}
          onKeyDown={e => onKeyDown(e, schools.length + 2)}>
          📜 Changelog <span className="real-name">recent updates</span>
        </button>

        <button key="ritual"
          id="tab-ritual"
          ref={el => tabRefs.current['ritual'] = el}
          role="tab"
          aria-selected={currentSchool === 'ritual'}
          aria-controls="school-ritual"
          tabIndex={currentSchool === 'ritual' ? 0 : -1}
          className={`tab-btn tab-btn-ritual${currentSchool === 'ritual' ? ' active' : ''}`}
          data-school="ritual"
          onClick={() => onSelect('ritual')}
          onKeyDown={e => onKeyDown(e, schools.length + 3)}>
          ⛧ Ritual <span className="real-name">summon the grimoire</span>
        </button>
        <button key="recipe-lab"
          id="tab-recipe-lab"
          ref={el => tabRefs.current['recipe-lab'] = el}
          role="tab"
          aria-selected={isLab}
          aria-controls="school-recipe-lab"
          tabIndex={isLab ? 0 : -1}
          className={`tab-btn${isLab ? ' active' : ''}`}
          data-school="recipe-lab"
          onClick={() => onSelect('recipe-lab')}
          onKeyDown={e => onKeyDown(e, schools.length + 4)}>
          ⚗ Recipe Lab <span className="real-name">brew your own</span>
        </button>
      </nav>
    </div>
  );
}
