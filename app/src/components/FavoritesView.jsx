import { useMemo } from 'react';
import SchoolSigil from './SchoolSigil.tsx';
import Icon from './Icon.jsx';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';

export default function FavoritesView({
  favorites,
  recent,
  marginalia,
  onSpellClick,
  isFavorited,
  onToggleFavorite,
}) {
  const allSpells = useMemo(() => grimoireIndex.flatEntries(), []);

  // Get all favorite spells
  const favoriteSpells = useMemo(() => {
    return allSpells.filter(({ spell }) => favorites.includes(spell.name));
  }, [allSpells, favorites]);

  // Get recently viewed spells
  const recentSpells = useMemo(() => {
    const recentNames = recent.map(r => r.name);
    return recentNames
      .map(name => allSpells.find(({ spell }) => spell.name === name))
      .filter(Boolean)
      .slice(0, 10);
  }, [allSpells, recent]);

  return (
    <div className="py-1">
      <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-center text-moonlight tracking-wide mt-1 mb-4.5"
        style={{ textShadow: '0 0 12px rgba(138,154,106,0.15)' }}>
        <span className="text-[rgba(196,71,71,0.5)] text-[0.7rem] align-middle mx-2.5">✦</span>
        The Vault
        <span className="text-[rgba(196,71,71,0.5)] text-[0.7rem] align-middle mx-2.5">✦</span>
      </h2>

      {/* Favorites section */}
      <div className="mb-5.5 p-3.5 border border-[rgba(138,154,106,0.15)] rounded-sm bg-gradient-to-b from-[rgba(8,12,18,0.6)] to-[rgba(4,6,10,0.8)] relative">
        <div className="absolute top-0 left-3.5 right-3.5 h-px bg-gradient-to-r from-transparent via-[rgba(138,154,106,0.35)] to-transparent" aria-hidden="true" />
        <h3 className="font-['Cinzel'] text-[0.7rem] font-bold uppercase tracking-widest text-sickly mb-3 flex items-center gap-2">
          Bound Incantations ({favoriteSpells.length})
          <span className="flex-1 h-px bg-gradient-to-r from-[rgba(138,154,106,0.25)] to-transparent" />
        </h3>
        {favoriteSpells.length === 0 ? (
          <p className="font-['Cormorant_Garamond'] italic text-center text-[0.92rem] text-silver-mute py-5 px-3 relative">
            <span className="block text-[rgba(196,71,71,0.35)] text-[1.2rem] mb-1.5">⛧</span>
            The circle is silent. No entity is yet bound to your service — seal one with the star to keep it near.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {favoriteSpells.map(({ spell, school }) => (
              <div
                key={spell.name}
                className="flex items-center gap-3 p-2.5 border border-[rgba(138,154,106,0.1)] rounded-sm bg-[rgba(2,2,4,0.4)] cursor-pointer transition-all duration-200 hover:bg-[rgba(20,28,40,0.55)] hover:border-[rgba(196,71,71,0.4)] hover:translate-x-1 hover:shadow-[-2px_0_0_rgba(196,71,71,0.4)]"
                onClick={() => onSpellClick(spell, school)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSpellClick(spell, school); } }}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 text-[1.4rem] bg-[rgba(8,12,18,0.6)] border border-[rgba(138,154,106,0.15)] rounded-sm flex-shrink-0"><SchoolSigil schoolId={school.id} size={22} /></span>
                <div className="flex-1 min-w-0">
                  <div className="font-['Cinzel'] text-[0.78rem] font-bold text-moonlight leading-tight">{spell.name}</div>
                  <div className="text-[0.78rem] text-silver-mute">{school.name}</div>
                </div>
                <button
                  className={`inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 font-['Cinzel'] text-[0.58rem] uppercase tracking-wider transition-all duration-200 ${isFavorited(spell.name) ? 'border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.12)] text-gold-bright shadow-[0_0_6px_rgba(212,175,55,0.3)]' : 'border-[rgba(212,175,55,0.25)] bg-[rgba(42,26,10,0.75)] text-[rgba(212,175,55,0.55)] hover:bg-[rgba(196,71,71,0.12)] hover:border-[rgba(196,71,71,0.5)] hover:text-[#c47a7a]'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(spell.name);
                  }}
                  type="button"
                  aria-label={isFavorited(spell.name) ? 'Unbind' : 'Bind'}
                  data-testid="warded-seal"
                >
                  <Icon name="warded-seal" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently viewed section */}
      <div className="mb-5.5 p-3.5 border border-[rgba(138,154,106,0.15)] rounded-sm bg-gradient-to-b from-[rgba(8,12,18,0.6)] to-[rgba(4,6,10,0.8)] relative">
        <div className="absolute top-0 left-3.5 right-3.5 h-px bg-gradient-to-r from-transparent via-[rgba(138,154,106,0.35)] to-transparent" aria-hidden="true" />
        <h3 className="font-['Cinzel'] text-[0.7rem] font-bold uppercase tracking-widest text-sickly mb-3 flex items-center gap-2">
          Trail of Recent Summons
          <span className="flex-1 h-px bg-gradient-to-r from-[rgba(138,154,106,0.25)] to-transparent" />
        </h3>
        {recentSpells.length === 0 ? (
          <p className="font-['Cormorant_Garamond'] italic text-center text-[0.92rem] text-silver-mute py-5 px-3 relative">
            <span className="block text-[rgba(196,71,71,0.35)] text-[1.2rem] mb-1.5">⛧</span>
            The trail is cold. No incantation has yet been opened in the Eye.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {recentSpells.map(({ spell, school }) => (
              <div
                key={spell.name}
                className="flex items-center gap-3 p-2.5 border border-[rgba(138,154,106,0.1)] rounded-sm bg-[rgba(2,2,4,0.4)] cursor-pointer transition-all duration-200 hover:bg-[rgba(20,28,40,0.55)] hover:border-[rgba(196,71,71,0.4)] hover:translate-x-1 hover:shadow-[-2px_0_0_rgba(196,71,71,0.4)]"
                onClick={() => onSpellClick(spell, school)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSpellClick(spell, school); } }}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 text-[1.4rem] bg-[rgba(8,12,18,0.6)] border border-[rgba(138,154,106,0.15)] rounded-sm flex-shrink-0"><SchoolSigil schoolId={school.id} size={22} /></span>
                <div className="flex-1 min-w-0">
                  <div className="font-['Cinzel'] text-[0.78rem] font-bold text-moonlight leading-tight">{spell.name}</div>
                  <div className="text-[0.78rem] text-silver-mute">{school.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Marginalia section */}
      <div className="mb-5.5 p-3.5 border border-[rgba(138,154,106,0.15)] rounded-sm bg-gradient-to-b from-[rgba(8,12,18,0.6)] to-[rgba(4,6,10,0.8)] relative">
        <div className="absolute top-0 left-3.5 right-3.5 h-px bg-gradient-to-r from-transparent via-[rgba(138,154,106,0.35)] to-transparent" aria-hidden="true" />
        <h3 className="font-['Cinzel'] text-[0.7rem] font-bold uppercase tracking-widest text-sickly mb-3 flex items-center gap-2">
          Marginalia — Your Annotations
          <span className="flex-1 h-px bg-gradient-to-r from-[rgba(138,154,106,0.25)] to-transparent" />
        </h3>
        {(() => {
          const notesObj = marginalia?.notes || marginalia || {};
          const entries = Object.entries(notesObj);
          if (entries.length === 0) {
            return <p className="font-['Cormorant_Garamond'] italic text-center text-[0.92rem] text-silver-mute py-5 px-3 relative">
              <span className="block text-[rgba(196,71,71,0.35)] text-[1.2rem] mb-1.5">⛧</span>
              The page is clean. No annotations have yet been inscribed in the margin.
            </p>;
          }
          return (
            <div className="flex flex-col gap-1.5">
              {entries.map(([spellName, note]) => (
                <div key={spellName} className="flex flex-col gap-1.5 p-3 border border-[rgba(138,154,106,0.18)] rounded-sm bg-gradient-to-br from-[rgba(20,30,12,0.4)] to-[rgba(8,12,4,0.6)]">
                  <div className="font-['Cinzel'] text-[0.68rem] font-bold text-sickly tracking-wide">{spellName}</div>
                  <div className="font-['Cormorant_Garamond'] italic text-[0.85rem] text-parchment-dark leading-relaxed">{typeof note === 'string' ? note : ''}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
