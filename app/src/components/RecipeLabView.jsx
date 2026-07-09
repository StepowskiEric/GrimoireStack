import { useState, useMemo, useCallback } from 'react';
import SchoolSigil from './SchoolSigil.tsx';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { cn } from '../utils/cn.js';

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
    <div className="py-1">
      <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-center text-moonlight tracking-wide mt-1 mb-1"
        style={{ textShadow: '0 0 12px rgba(138,154,106,0.15)' }}>
        <span className="text-[rgba(196,71,71,0.5)] text-[0.7rem] align-middle mx-2.5">⛧</span>
        Rituals
        <span className="text-[rgba(196,71,71,0.5)] text-[0.7rem] align-middle mx-2.5">⛧</span>
      </h2>
      <p className="font-['Cormorant_Garamond'] italic text-center text-[0.82rem] text-silver-mute mb-4.5">
        Select two incantations to summon a side-by-side comparison. The Eye will
        weigh which is fitter for your need.
      </p>

      {/* Selected spells for comparison */}
      <div className="mb-5.5 p-3.5 border border-[rgba(138,154,106,0.22)] rounded-sm bg-gradient-to-b from-[rgba(8,12,18,0.7)] to-[rgba(4,6,10,0.85)] relative">
        <div className="absolute top-0 left-3.5 right-3.5 h-px bg-gradient-to-r from-transparent via-[rgba(196,71,71,0.5)] to-transparent" aria-hidden="true" />
        <h3 className="font-['Cinzel'] text-[0.68rem] font-bold uppercase tracking-widest text-sickly mb-3 flex items-center gap-2">
          Cauldron ({selectedSpells.length}/2)
          <span className="flex-1 h-px bg-gradient-to-r from-[rgba(138,154,106,0.25)] to-transparent" />
        </h3>
        {selectedSpells.length === 0 ? (
          <p className="text-[rgba(138,154,106,0.35)] text-[1.2rem] text-center my-5">⛧</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-3.5">
            {selectedSpells.map((item) => (
              <div key={item.spell.skill} className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-[rgba(2,2,4,0.5)] border border-[rgba(138,154,106,0.2)] rounded-sm">
                <span className="text-[1.1rem]"><SchoolSigil schoolId={item.school.id} size={20} /></span>
                <span className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wide text-moonlight">{item.spell.name}</span>
                <button
                  className="px-1.5 py-0.5 bg-[rgba(196,71,71,0.1)] border border-[rgba(196,71,71,0.3)] rounded-sm text-[0.75rem] text-[#c47a7a] cursor-pointer transition-all duration-200 hover:bg-[rgba(196,71,71,0.25)] hover:text-[#ff8a8a]"
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
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-gradient-to-b from-[rgba(40,32,8,0.7)] to-[rgba(28,20,6,0.85)] border border-[rgba(212,175,55,0.4)] rounded-sm font-['Cinzel'] text-[0.62rem] font-bold uppercase tracking-widest text-gold-bright cursor-pointer transition-all duration-200 hover:from-[rgba(60,48,12,0.85)] hover:to-[rgba(40,28,8,0.95)] hover:border-[rgba(212,175,55,0.6)] hover:shadow-[0_0_14px_rgba(212,175,55,0.15)]"
            onClick={handleCompare}
            type="button"
          >
            Compare These Incantations
          </button>
        ) : null}
      </div>

      {/* Spell browser */}
      <div>
        <h3 className="font-['Cinzel'] text-[0.7rem] font-bold uppercase tracking-widest text-sickly mb-3 flex items-center gap-2">
          Incantations
          <span className="flex-1 h-px bg-gradient-to-r from-[rgba(138,154,106,0.25)] to-transparent" />
        </h3>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder="Scry by name, skill, effect, or school…"
          className="w-full bg-[rgba(2,2,3,0.55)] border border-[rgba(138,154,106,0.18)] text-parchment font-inherit text-[0.95rem] p-2 rounded-sm mb-2 box-border focus:outline-3 focus:outline-offset-2 focus:border-[rgba(196,184,152,0.5)]"
          aria-label="Search incantations"
        />
        <div className="font-['Cinzel'] text-[0.72rem] uppercase tracking-widest text-silver-mute italic text-right mb-2">
          {filteredSpells.length} {filteredSpells.length === 1 ? 'incantation' : 'incantations'}
          {pageCount > 1 ? ` · page ${safePage + 1} of ${pageCount}` : ''}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
          {visible.map((item) => {
            const selected = isSelected(item.spell);
            return (
              <button
                key={item.spell.skill}
                className={cn('flex flex-col items-center p-2.5 text-center border rounded-sm cursor-pointer transition-all duration-200', selected ? 'bg-gradient-to-b from-[rgba(40,32,8,0.55)] to-[rgba(28,20,6,0.7)] border-[rgba(212,175,55,0.5)] shadow-[0_0_10px_rgba(212,175,55,0.15)]' : 'bg-[rgba(2,2,4,0.5)] border-[rgba(138,154,106,0.15)] hover:bg-[rgba(20,28,40,0.6)] hover:border-[rgba(196,71,71,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_8px_rgba(196,71,71,0.1)]')}
                onClick={() => handleSpellSelect(item)}
                type="button"
                aria-pressed={selected}
                title={item.spell.effect}
              >
                <span className="text-[1.4rem] mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"><SchoolSigil schoolId={item.school.id} size={20} /></span>
                <span className="font-['Cormorant_Garamond'] text-[0.75rem] text-moonlight leading-snug">{item.spell.name}</span>
                <span className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-silver-mute mt-1 text-center">{item.school.real}</span>
              </button>
            );
          })}
        </div>
        {pageCount > 1 ? (
          <nav className="flex items-center justify-center gap-3.5 mt-3 pt-2 border-t border-dashed border-[rgba(122,58,90,0.18)]" aria-label="Ritual incantation pagination">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="font-['Cinzel'] text-[0.7rem] uppercase tracking-widest border border-[rgba(138,154,106,0.3)] text-silver-mute px-2.5 py-1 rounded-sm cursor-pointer transition-all duration-200 hover:border-[#6a0e0e] hover:text-parchment hover:bg-[rgba(122,14,14,0.2)] disabled:opacity-35 disabled:cursor-not-allowed"
            >
              ← Earlier
            </button>
            <span className="font-['Cinzel'] text-[0.74rem] text-silver-mute tracking-widest">{safePage + 1} / {pageCount}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="font-['Cinzel'] text-[0.7rem] uppercase tracking-widest border border-[rgba(138,154,106,0.3)] text-silver-mute px-2.5 py-1 rounded-sm cursor-pointer transition-all duration-200 hover:border-[#6a0e0e] hover:text-parchment hover:bg-[rgba(122,14,14,0.2)] disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Later →
            </button>
          </nav>
        ) : null}
      </div>

      {filteredSpells.length === 0 ? (
        <p className="text-center text-silver-mute italic py-6">
          The abyss returns nothing for this scrying.
        </p>
      ) : null}
    </div>
  );
}
