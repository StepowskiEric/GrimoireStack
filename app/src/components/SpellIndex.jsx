import { useMemo, useState } from 'react';
import { getAlphabeticalIndex } from '../data/spellMetadata.js';
import { spellCatalog } from '../data/spellCatalogInstance.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function bucket(letter, entries) {
  return entries.filter((e) => e.spell.name.replace(/^[⟐⚔◇⚙◈]?\s*/, '').toUpperCase().startsWith(letter));
}

export default function SpellIndex({ onSpellClick, currentSchool }) {
  const [letter, setLetter] = useState(null);
  const [query, setQuery] = useState('');

  const all = useMemo(() => getAlphabeticalIndex(), []);

  const filtered = useMemo(() => {
    let list = all;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(({ spell, school }) =>
        spell.name.toLowerCase().includes(q) ||
        spell.skill.toLowerCase().includes(q) ||
        spell.effect.toLowerCase().includes(q) ||
        school.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [all, query]);

  const letterCounts = useMemo(() => {
    const counts = {};
    for (const L of ALPHABET) counts[L] = 0;
    for (const e of all) {
      const stripped = e.spell.name.replace(/^[⟐⚔◇⚙◈]?\s*/, '');
      const first = stripped.charAt(0).toUpperCase();
      if (counts[first] != null) counts[first] += 1;
    }
    return counts;
  }, [all]);

  const visible = useMemo(() => {
    if (!letter) return filtered;
    return filtered.filter((e) => {
      const stripped = e.spell.name.replace(/^[⟐⚔◇⚙◈]?\s*/, '');
      return stripped.toUpperCase().startsWith(letter);
    });
  }, [filtered, letter]);

  return (
    <div className="index-section active" id="school-index">
      <div className="index-header">
        <span className="index-sigil" aria-hidden="true">🗂</span>
        <h2>Spell Index</h2>
        <p className="index-sub">
          A flat alphabetical catalogue of every incantation, independent of school.
        </p>
      </div>

      <div className="index-controls">
        <div className="index-search">
          <span className="index-search-rune" aria-hidden="true">⟐</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter the index…"
            aria-label="Filter the spell index"
            className="index-search-input"
          />
        </div>
        <div className="index-alphabet" role="tablist" aria-label="Jump to letter">
          <button
            type="button"
            className={`index-alpha-btn${!letter ? ' active' : ''}`}
            onClick={() => setLetter(null)}
            aria-pressed={!letter}
            title="All"
          >
            All
          </button>
          {ALPHABET.map((L) => (
            <button
              key={L}
              type="button"
              className={`index-alpha-btn${letter === L ? ' active' : ''}${letterCounts[L] === 0 ? ' empty' : ''}`}
              onClick={() => setLetter(L)}
              aria-pressed={letter === L}
              disabled={letterCounts[L] === 0}
              title={`${letterCounts[L]} spell${letterCounts[L] === 1 ? '' : 's'}`}
            >
              {L}
            </button>
          ))}
        </div>
      </div>

      <div className="index-count">
        {visible.length} incantation{visible.length !== 1 ? 's' : ''}
        {letter ? ` starting with ${letter}` : ''}
        {query.trim() ? ` matching "${query}"` : ''}
      </div>

      {visible.length === 0 ? (
        <div className="index-empty">No spells match this filter.</div>
      ) : (
        <div className="index-list">
          {visible.map(({ spell, school }) => (
            <button
              key={spell.skill}
              type="button"
              className="index-row"
              onClick={() => onSpellClick?.(spell, school)}
            >
              <span className="index-row-symbol" aria-hidden="true">{school.symbol}</span>
              <span className="index-row-name">{spell.name}</span>
              <span className="index-row-school">{school.name.replace(/^School of /, '')}</span>
              <span className="index-row-skill">〈 {spell.skill} 〉</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
