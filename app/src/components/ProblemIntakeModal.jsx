import { useEffect, useRef, useState, useMemo } from 'react';
import { matchProblemToSpells, suggestExampleProblems } from '../utils/problemMatch.js';
import { spellCatalog } from '../data/spellCatalogInstance.js';
import ModalEye from './ModalEye.tsx';
import SchoolSigil from './SchoolSigil.tsx';
import Icon from './Icon.jsx';

export default function ProblemIntakeModal({ onClose, onSelectSpell }) {
  const modalRef = useRef(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    first?.focus();
    const last = focusable[focusable.length - 1];
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose]);

  const matches = useMemo(() => {
    return matchProblemToSpells(query, { limit: 6 });
  }, [query]);

  const examples = useMemo(() => suggestExampleProblems(), []);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (matches.length > 0) {
      const top = matches[0];
      onSelectSpell?.(top.spell, top.school);
    }
  };

  const handleOpenSpell = (spell) => {
    const entry = spellCatalog.resolveBySkill(spell.skill);
    if (entry) onSelectSpell?.(entry.spell, entry.school);
    else onClose?.();
  };

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose(); } }}>
      <div className="modal intake-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Describe your problem">
        <button className="modal-close" onClick={onClose} aria-label="Close intake" type="button">
          <Icon name="close" size={18} />
        </button>
        <span className="modal-symbol"><ModalEye size={36} /></span>
        <div className="modal-title">What Ails You?</div>
        <div className="modal-school">Describe your problem in plain language — the orb will suggest incantations.</div>

        <form className="intake-form" onSubmit={handleSubmit}>
          {/* eslint-disable jsx-a11y/no-autofocus */}
          <textarea
            className="intake-textarea"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'I have a flaky test that only fails in CI' or 'I need to coordinate three agents'…"
            aria-label="Describe your problem"
            rows={3}
            autoFocus
          />
          {/* eslint-enable jsx-a11y/no-autofocus */}
          <button
            type="submit"
            className="intake-submit"
            disabled={!query.trim() || matches.length === 0}
          >
            Reveal Suggestions
          </button>
        </form>

        {query.trim() ? (
          <div className="intake-results">
            {matches.length === 0 ? (
              <div className="intake-empty">
                The orb sees no clear match. Try broader terms, or browse by school.
              </div>
            ) : (
              <>
                <div className="intake-results-title">
                  {matches.length} suggested incantation{matches.length !== 1 ? 's' : ''}
                </div>
                <div className="intake-results-list">
                  {matches.map((m, i) => (
                    <button
                      key={m.spell.skill}
                      type="button"
                      className="intake-result"
                      onClick={() => handleOpenSpell(m.spell)}
                    >
                      <span className="intake-result-rank">#{i + 1}</span>
                      <span className="intake-result-symbol" aria-hidden="true"><SchoolSigil schoolId={m.school.id} size={20} /></span>
                      <span className="intake-result-body">
                        <span className="intake-result-name">{m.spell.name}</span>
                        <span className="intake-result-effect">{m.spell.effect}</span>
                        <span className="intake-result-school">{m.school.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="intake-examples">
            <div className="intake-examples-title">Or try a sample problem:</div>
            <div className="intake-examples-list">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className="intake-example"
                  onClick={() => setQuery(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
