import { useState } from 'react';

export default function ArcaneToolsView({
  schools,
  onSpellClick,
}) {
  const [activeTool, setActiveTool] = useState('index');

  const tools = [
    { id: 'index', name: 'Spell Index', icon: '📖' },
    { id: 'graph', name: 'Spell Graph', icon: '🕸' },
    { id: 'ritual', name: 'Ritual Section', icon: '🔮' },
    { id: 'tome', name: 'Tome of Ailments', icon: '📜' },
  ];

  return (
    <div className="arcane-tools-view">
      <h2 className="arcane-tools-view__title">Arcane Tools</h2>
      
      {/* Tool selector */}
      <div className="arcane-tools-view__selector">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`arcane-tools-view__tool-btn ${activeTool === tool.id ? 'arcane-tools-view__tool-btn--active' : ''}`}
            onClick={() => setActiveTool(tool.id)}
            type="button"
          >
            <span className="arcane-tools-view__tool-icon">{tool.icon}</span>
            <span className="arcane-tools-view__tool-name">{tool.name}</span>
          </button>
        ))}
      </div>

      {/* Tool content */}
      <div className="arcane-tools-view__content">
        {activeTool === 'index' && (
          <div className="arcane-tools-view__placeholder">
            <h3>Spell Index</h3>
            <p>Browse all spells alphabetically across all schools.</p>
            <div className="arcane-tools-view__spell-list">
              {schools.flatMap(s => s.spells).slice(0, 10).map((spell, i) => (
                <div key={i} className="arcane-tools-view__spell-item">
                  {spell.name}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTool === 'graph' && (
          <div className="arcane-tools-view__placeholder">
            <h3>Spell Graph</h3>
            <p>Visualize relationships between spells and schools.</p>
            <div className="arcane-tools-view__graph-placeholder">
              <div className="arcane-tools-view__graph-node">🔍 Debugging</div>
              <div className="arcane-tools-view__graph-node">◇ Reasoning</div>
              <div className="arcane-tools-view__graph-node">⚙ Process</div>
            </div>
          </div>
        )}
        
        {activeTool === 'ritual' && (
          <div className="arcane-tools-view__placeholder">
            <h3>Ritual Section</h3>
            <p>Perform complex multi-step rituals combining multiple spells.</p>
          </div>
        )}
        
        {activeTool === 'tome' && (
          <div className="arcane-tools-view__placeholder">
            <h3>Tome of Ailments</h3>
            <p>Find spells by the problems they solve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
