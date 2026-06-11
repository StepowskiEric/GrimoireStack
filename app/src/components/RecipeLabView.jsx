import { useState, useMemo } from 'react';

export default function RecipeLabView({
  schools,
  onSpellClick,
  onCompareOpen,
}) {
  const [selectedSpells, setSelectedSpells] = useState([]);

  const allSpells = useMemo(() => {
    return schools.flatMap(s => s.spells.map(sp => ({ spell: sp, school: s })));
  }, [schools]);

  const handleSpellSelect = (spellObj) => {
    setSelectedSpells(prev => {
      const exists = prev.find(p => p.spell.name === spellObj.spell.name);
      if (exists) {
        return prev.filter(p => p.spell.name !== spellObj.spell.name);
      }
      if (prev.length < 2) {
        return [...prev, spellObj];
      }
      return [prev[1], spellObj];
    });
  };

  return (
    <div className="recipe-lab-view">
      <h2 className="recipe-lab-view__title">Recipe Lab</h2>
      <p className="recipe-lab-view__desc">
        Select two spells to compare them, or browse spell combinations.
      </p>

      {/* Selected spells for comparison */}
      {selectedSpells.length > 0 && (
        <div className="recipe-lab-view__selected">
          <h3>Selected Spells</h3>
          <div className="recipe-lab-view__selected-list">
            {selectedSpells.map((item, i) => (
              <div key={i} className="recipe-lab-view__selected-item">
                <span className="recipe-lab-view__symbol">{item.school.symbol}</span>
                <span className="recipe-lab-view__name">{item.spell.name}</span>
                <button
                  className="recipe-lab-view__remove"
                  onClick={() => handleSpellSelect(item)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {selectedSpells.length === 2 && (
            <button
              className="recipe-lab-view__compare-btn"
              onClick={onCompareOpen}
              type="button"
            >
              Compare Spells
            </button>
          )}
        </div>
      )}

      {/* Spell browser */}
      <div className="recipe-lab-view__browser">
        <h3>Select Spells to Compare</h3>
        <div className="recipe-lab-view__spell-grid">
          {allSpells.slice(0, 20).map((item, i) => (
            <button
              key={i}
              className={`recipe-lab-view__spell-card ${selectedSpells.some(s => s.spell.name === item.spell.name) ? 'recipe-lab-view__spell-card--selected' : ''}`}
              onClick={() => handleSpellSelect(item)}
              type="button"
            >
              <span className="recipe-lab-view__spell-symbol">{item.school.symbol}</span>
              <span className="recipe-lab-view__spell-name">{item.spell.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
