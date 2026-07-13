import { useCallback, useState } from 'react';
import { schoolColors } from '../utils/schoolColors.js';
import Icon from './Icon.jsx';
import SchoolSigil from './SchoolSigil.tsx';
import './ExportToast.css';

export default function SpellDetailView({
  school,
  onBack,
  isFavorited,
  onToggleFavorite,
  getVote,
}) {
  const [activeSpell, setActiveSpell] = useState(null);
  const [note, setNote] = useState('');
  const colors = school ? schoolColors(school.id) : {};

  const handleSpellSelect = useCallback((spell) => {
    setActiveSpell(spell);
  }, []);

  const handleBackToSchool = useCallback(() => {
    setActiveSpell(null);
  }, []);

  if (!school) return null;

  // If viewing a specific spell
  if (activeSpell) {
    const vote = getVote ? getVote(activeSpell.skill) : null;
    const { name: tierName } = vote || { name: 'Common' };
    const favorited = isFavorited(activeSpell.name, activeSpell.skill);

    return (
      <div className="panel p-4" style={colors.cssVars}>
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(196,71,71,0.5)] to-transparent"
          aria-hidden="true"
        />
        <button className="section-title mb-3" onClick={handleBackToSchool} type="button">
          ← Back to {school.real}
        </button>

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-sickly">
            <SchoolSigil schoolId={school.id} size={42} />
          </span>
          <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide">
            {activeSpell.name}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-['Cinzel'] text-[0.68rem] uppercase tracking-widest text-text-muted">
              {tierName}
            </span>
            {activeSpell.status && (
              <span className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-accent border border-accent/40 rounded-sm px-1.5 py-0.5">
                {activeSpell.status}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="relative flex items-center gap-2 mb-2">
            <h3 className="section-title">Effect</h3>
          </div>
          <p className="text-text-secondary text-[0.95rem]">{activeSpell.effect}</p>
        </div>

        {activeSpell.note && (
          <div className="mt-4" data-testid="spell-detail-note">
            <div className="relative flex items-center gap-2 mb-2">
              <h3 className="section-title">Note</h3>
            </div>
            <p className="text-text-secondary text-[0.95rem]">{activeSpell.note}</p>
          </div>
        )}

        {activeSpell.combos && activeSpell.combos.length > 0 && (
          <div className="mt-4">
            <div className="relative flex items-center gap-2 mb-2">
              <h3 className="section-title">Combinations</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeSpell.combos.map((combo) => (
                <span
                  key={combo}
                  className="font-['Cinzel'] text-[0.68rem] uppercase tracking-widest text-text-muted border border-border rounded-sm px-2 py-1"
                >
                  {combo}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <button
            className={
              favorited
                ? 'section-title px-3 py-2 border border-accent/40 text-accent'
                : 'section-title px-3 py-2 border border-border hover:border-border-hover text-text-muted'
            }
            onClick={() => {
              const result = onToggleFavorite(activeSpell.name, activeSpell.skill);
              if (result === false) {
                const toast = document.createElement('div');
                toast.className = 'export-toast';
                toast.textContent = 'Binding circle is full (max 12)';
                toast.setAttribute('role', 'status');
                toast.setAttribute('aria-live', 'polite');
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2200);
              }
            }}
            type="button"
            data-testid="warded-seal"
          >
            <Icon name="warded-seal" size={16} />
            <span className="ml-2">{favorited ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>

        <div className="mt-5">
          <div className="relative flex items-center gap-2 mb-2">
            <h3 className="section-title">Marginalia</h3>
          </div>
          <textarea
            className="mt-2 w-full bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted text-[0.95rem] p-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
            placeholder="Add your notes here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    );
  }

  // School view with spell list
  return (
    <div className="panel p-4" style={colors.cssVars}>
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(196,71,71,0.5)] to-transparent"
        aria-hidden="true"
      />
      <button className="section-title mb-3" onClick={onBack} type="button">
        ← Back to The Spine
      </button>

      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-sickly">
          <SchoolSigil schoolId={school.id} size={48} />
        </span>
        <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide">
          {school.real}
        </h2>
        <p className="text-text-secondary text-[0.95rem]">{school.desc}</p>
        <div className="font-['Cinzel'] text-[0.68rem] uppercase tracking-widest text-text-muted">
          {school.spells.length} incantations
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {school.spells.map((spell) => (
          <button
            key={spell.skill}
            className="panel-raised text-left p-3 transition-all duration-200 hover:border-border-hover"
            onClick={() => handleSpellSelect(spell)}
            type="button"
          >
            <div className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wide text-text-primary">
              {spell.name}
            </div>
            <div className="text-text-secondary text-[0.82rem]">
              {spell.effect.slice(0, 120)}
              {spell.effect.length > 120 ? '...' : ''}
            </div>
            {spell.status && spell.status !== '—' && (
              <span
                className="mt-1 inline-block font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-accent border border-accent/40 rounded-sm px-1.5 py-0.5"
                data-testid="spell-status"
              >
                {spell.status}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
