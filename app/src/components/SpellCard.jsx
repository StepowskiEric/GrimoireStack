import { getSpellTier, TIER_META } from '../data/tiers.js';
import { hasDistinctTrueName } from '../data/spellDisplay.js';
import Icon from './Icon.jsx';
import './ExportToast.css';

export default function SpellCard({ spell, onClick, matched, children, isFavorited, onToggleFavorite }) {
  const statusClass = (spell.status || '').toLowerCase().replace(/[^a-z]/g, '');
  const legacyTier = spell.status && spell.status !== '—' ? `${spell.status}` : '';
  const tierInfo = TIER_META[getSpellTier(spell)];
  const showTierBadge = spell.status && spell.status !== '—';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    const result = onToggleFavorite?.(spell.name, spell.skill);
    // Show a brief toast if the favorites cap was reached
    if (result === false) {
      const toast = document.createElement('div');
      toast.className = 'export-toast';
      toast.textContent = 'Binding circle is full (max 12)';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2200);
    }
  };

  const hasTrueName = hasDistinctTrueName(spell);
  const cardTitle = hasTrueName ? `${spell.trueName} (${spell.name})` : spell.name;

  return (
    <div
      data-testid="spell-card"
      className={`relative overflow-hidden rounded-sm border border-[rgba(120,90,40,0.25)] bg-gradient-to-br from-[#f2e6c8] to-[#e6d5a8] p-4 transition-all duration-200 ${matched === true ? 'glow border-[rgba(212,175,55,0.35)] shadow-[0_0_20px_rgba(212,175,55,0.1),0_0_40px_rgba(212,175,55,0.05),inset_0_0_30px_rgba(212,175,55,0.04)]' : ''} ${matched === false ? 'dim opacity-35 grayscale-[80%] pointer-events-none' : 'hover:border-[rgba(212,175,55,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.35),0_0_15px_rgba(212,175,55,0.06)] active:scale-[0.98]'}${hasTrueName ? ' has-true-name' : ''}`}
      data-skill={spell.skill}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${cardTitle}, ${tierInfo.label}, ${spell.effect}`}
      title={tierInfo.title}
      style={{ cursor: 'pointer', display: matched === false ? 'none' : undefined }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(180,140,60,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(120,80,20,0.06),transparent_50%)] opacity-60 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.04%22/></svg>')] opacity-80 mix-blend-multiply pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-2 right-2.5 text-[0.5rem] text-[rgba(160,120,60,0.12)] pointer-events-none" aria-hidden="true">✦</div>
      <div className="mb-1 flex items-center justify-between">
        <div data-testid="spell-tier">
          {showTierBadge ? (
            <span className={`inline-flex items-center gap-1 rounded-full border border-[rgba(140,110,60,0.4)] bg-[rgba(60,40,15,0.35)] px-2.5 py-1 font-['Cinzel'] text-[0.58rem] uppercase tracking-wider ${tierInfo.className}`} title={tierInfo.title}>
              <span className="text-[0.7rem] text-[#c8a86c]" aria-hidden="true">⟐</span>
              <span>{tierInfo.label}</span>
            </span>
          ) : (
            <span className="font-['Cinzel'] text-[0.55rem] uppercase tracking-wider text-[#6b4a2a]">{legacyTier || 'common'}</span>
          )}
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            className={`absolute top-2 right-2 flex h-11 w-11 items-center justify-center rounded-full border bg-[rgba(42,26,10,0.75)] text-[0.9rem] transition-all duration-200 ${isFavorited ? 'border-[rgba(212,175,55,0.65)] text-gold-bright shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-[rgba(212,175,55,0.25)] text-[rgba(212,175,55,0.55)] hover:text-gold-bright hover:border-[rgba(212,175,55,0.55)] hover:scale-110'}`}
            onClick={handleStarClick}
            aria-label={isFavorited ? 'Unbind from Summoning Circle' : 'Bind to Summoning Circle'}
            title={isFavorited ? 'Unbind' : 'Bind to Circle'}
            data-testid="warded-seal"
          >
            <Icon name="warded-seal" size={18} />
          </button>
        )}
      </div>
      {hasTrueName ? (
        <>
          <div className="spell-true-name font-['Cormorant_Garamond'] text-[1.18rem] font-semibold leading-tight text-[#3e2712]" style={{ textShadow: '0 0 8px rgba(160,120,60,0.1)' }}>{spell.trueName}</div>
          <div data-testid="spell-name--secondary" className="spell-name--secondary font-['Cinzel'] text-[0.72rem] font-normal italic text-[#6b4a2a] mt-0.5 lowercase tracking-wider">{spell.name}</div>
        </>
      ) : (
        <div className="spell-name font-['Cinzel'] text-[1rem] font-semibold leading-tight text-[#3e2712]">{spell.name}</div>
      )}
      <div className="font-['Special_Elite'] text-[0.7rem] text-[#5a3d22] my-0.5">〈 {spell.skill} 〉</div>
      <div className="text-[0.88rem] leading-snug text-[#4a3020] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">{spell.effect}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`font-['Cinzel'] rounded-md border px-2 py-0.5 text-[0.5rem] uppercase tracking-wider ${statusClass === 'proven' ? 'text-[#c8e8c8] border-[rgba(106,170,106,0.55)] bg-[#1a2e1a]' : statusClass === 'new' ? 'text-[#f0dcb0] border-[rgba(201,168,76,0.55)] bg-[#2e2210]' : statusClass === 'framework' ? 'text-[#d8cce8] border-[rgba(138,122,170,0.55)] bg-[#1e1828]' : statusClass === 'hybrid' ? 'text-[#c8e4ec] border-[rgba(122,184,201,0.55)] bg-[#122428]' : statusClass === 'includes' ? 'text-[#ecc8c8] border-[rgba(201,122,122,0.55)] bg-[#2a1414]' : 'text-[#3e2712] border-[rgba(100,70,30,0.35)] bg-[rgba(35,22,12,0.55)]'}`}>{legacyTier || 'common'}</span>
        <span className="font-['Cormorant_Garamond'] italic text-[0.7rem] text-[#2a1a0a] transition-colors duration-200 group-hover:text-[#5a4428]">{children || 'click to reveal'}</span>
      </div>
    </div>
  );
}
