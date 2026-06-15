import { useState, useMemo, useCallback } from 'react';
import SchoolSigil from './SchoolSigil.tsx';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';

export default function RecipeLabView({
  onCompareOpen,
  onCompareTwo,
}) {
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 60;

  const allSpells = useMemo(() => grimoireIndex.flatEntries(), []);

  const filteredSpells = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSpells;
    return allSpells.filter(({ spell, school }) => {
      return (
        spell.name.toLowerCase().includes(q) ||
        spell.skill.toLowerCase().includes(q) ||
        spell.effect.toLowerCase().includes(q) ||
        school.name.toLowerCase().includes(q) ||
        school.real.toLowerCase().includes(q)
      );
    });
  }, [allSpells, query]);

  const pageCount = Math.max(1, Math.ceil(filteredSpells.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filteredSpells.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const isSelected = useCallback(
    (spell) => selectedSpells.some(s => s.spell.skill === spell.skill),
    [selectedSpells]
  );

  const handleSpellSelect = useCallback((spellObj) => {
    setSelectedSpells((prev) => {
      const exists = prev.find(p => p.spell.skill === spellObj.spell.skill);
      if (exists) {
        return prev.filter(p => p.spell.skill !== spellObj.spell.skill);
      }
      if (prev.length < 2) {
        return [...prev, spellObj];
      }
      // Replace the oldest selection to keep two
      return [prev[1], spellObj];
    });
    setPage(0);
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedSpells.length !== 2) return;
    const [left, right] = selectedSpells;
    if (onCompareTwo) {
      onCompareTwo(left.spell, left.school, right.spell, right.school);
    } else {
      onCompareOpen?.();
    }
  }, [selectedSpells, onCompareTwo, onCompareOpen]);

  return (
    <div className="recipe-lab-view">
      <h2 className="recipe-lab-view__title">Rituals</h2>
      <p className="recipe-lab-view__desc">
        Select two incantations to summon a side-by-side comparison. The Eye will
        weigh which is fitter for your need.
      </p>

      {/* Selected spells for comparison */}
      <div className="recipe-lab-view__selected">
        <h3>Cauldron ({selectedSpells.length}/2)</h3>
        {selectedSpells.length === 0 ? (
          <p className="recipe-lab-view__empty">Mark two incantations from the grid below…</p>
        ) : (
          <div className="recipe-lab-view__selected-list">
            {selectedSpells.map((item) => (
              <div key={item.spell.skill} className="recipe-lab-view__selected-item">
                <span className="recipe-lab-view__symbol"><SchoolSigil schoolId={item.school.id} size={20} /></span>
                <span className="recipe-lab-view__name">{item.spell.name}</span>
                <button
                  className="recipe-lab-view__remove"
                  onClick={() => handleSpellSelect(item)}
                  type="button"
                  aria-label={`Remove ${item.spell.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {selectedSpells.length === 2 ? (
          <button
            className="recipe-lab-view__compare-btn"
            onClick={handleCompare}
            type="button"
          >
            Compare These Incantations
          </button>
        ) : null}
      </div>

      {/* Spell browser */}
      <div className="recipe-lab-view__browser">
        <h3>Incantations</h3>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder="Scry by name, skill, effect, or school…"
          className="recipe-lab-view__search"
          aria-label="Search incantations"
        />
        <div className="recipe-lab-view__count">
          {filteredSpells.length} {filteredSpells.length === 1 ? 'incantation' : 'incantations'}
          {pageCount > 1 ? ` · page ${safePage + 1} of ${pageCount}` : ''}
        </div>
        <div className="recipe-lab-view__spell-grid">
          {visible.map((item) => {
            const selected = isSelected(item.spell);
            return (
              <button
                key={item.spell.skill}
                className={`recipe-lab-view__spell-card${selected ? ' recipe-lab-view__spell-card--selected' : ''}`}
                onClick={() => handleSpellSelect(item)}
                type="button"
                aria-pressed={selected}
                title={item.spell.effect}
              >
                <span className="recipe-lab-view__spell-symbol"><SchoolSigil schoolId={item.school.id} size={20} /></span>
                <span className="recipe-lab-view__spell-name">{item.spell.name}</span>
                <span className="recipe-lab-view__spell-school">{item.school.real}</span>
              </button>
            );
          })}
        </div>
        {pageCount > 1 ? (
          <nav className="recipe-lab-view__pager" aria-label="Ritual incantation pagination">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
            >
              ← Earlier
            </button>
            <span>{safePage + 1} / {pageCount}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
            >
              Later →
            </button>
          </nav>
        ) : null}
      </div>

      {filteredSpells.length === 0 ? (
        <p className="recipe-lab-view__empty-large">
          The abyss returns nothing for this scrying.
        </p>
      ) : null}
    </div>
  );
}
