import schools from '../data/schools.js';

function findSpell(name) {
  for (const s of schools) {
    for (const sp of s.spells) {
      if (sp.name === name) return { spell: sp, school: s };
    }
  }
  return null;
}

export default function SpellModal({ spell, school, onClose }) {
  if (!spell) return null;
  const statusStr = spell.status && spell.status !== '—' ? spell.status : 'Common';
  const statusClass = (spell.status || 'common').toLowerCase().replace(/[^a-z]/g, '') || 'common';

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <span className="modal-symbol">{school.symbol}</span>
        <div className="modal-school">
          {school.name} <span className="modal-school-real">({school.real})</span>
        </div>
        <div className="modal-title">{spell.name}</div>
        <div className="modal-incantation">〈 {spell.skill} 〉</div>

        {spell.note ? (
          <div className="modal-detail-row modal-note" style={{ display: 'flex' }}>
            <div className="modal-detail-label">Note</div>
            <div className="modal-detail-value">{spell.note}</div>
          </div>
        ) : null}

        <div className="modal-section-title">✦ Effect</div>
        <div className="modal-effect">{spell.effect}</div>
        <div className="modal-detail-row">
          <div className="modal-detail-label">Status</div>
          <div className="modal-detail-value">
            <span className={`tag ${statusClass}`}>{statusStr}</span>
          </div>
        </div>
        <div className="modal-detail-row">
          <div className="modal-detail-label">Skill Path</div>
          <div className="modal-detail-value">{spell.skill}</div>
        </div>

        {spell.combos?.length > 0 ? (
          <div className="modal-synergies">
            <div className="syn-title">✦ Synergistic Pairings</div>
            <div className="syn-grid">
              {spell.combos.map(comboName => {
                const found = findSpell(comboName);
                return (
                  <span key={comboName} className="syn-chip"
                    onClick={() => found && onClose(found.spell, found.school)}
                    title={found ? `Open ${comboName}` : ''}>
                    ✦ {comboName}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="modal-grimoire-ref">
          <code>〈 grimoirestack:{school.id}/{spell.skill} 〉</code>
        </div>

        <button className="modal-share" onClick={() => {
          const url = `${window.location.origin}${window.location.pathname}?s=${encodeURIComponent(spell.skill)}`;
          if (navigator.share) {
            navigator.share({ title: spell.name, text: spell.effect, url });
          } else {
            navigator.clipboard.writeText(url).then(() => {
              const btn = document.querySelector('.modal-share');
              if (btn) { btn.textContent = '✦ Link Copied!'; setTimeout(() => { btn.textContent = '✦ Share'; }, 2000); }
            });
          }
        }}>✦ Share</button>
      </div>
    </div>
  );
}
