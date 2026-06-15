import { useEffect, useRef, useState, useMemo } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { WIZARD_DATA } from '../data/schools.js';
import ModalEye from './ModalEye.tsx';
import SchoolSigil from './SchoolSigil.tsx';
import Icon from './Icon.jsx';

const CATEGORY_ICONS = {
  'bug': 'search',
  'reasoning': 'oracle',
  'code-review': 'warded-seal',
  'architecture': 'graph',
  'refactoring': 'tools',
  'testing-skill': 'search',
  'api-data': 'graph',
  'output-quality': 'warded-seal',
  'collaboration': 'profile',
  'cognition': 'oracle',
  'other': 'index',
};

const SUGGEST_EXAMPLE_PROBLEMS = [
  'My tests are failing in CI but pass locally',
  'I have a production bug with no clear repro',
  'Need to refactor a 2000-line legacy module safely',
  'Designing a new microservice and worried about coupling',
  'My code review is taking forever, want to focus on real issues',
  'The agent keeps hallucinating APIs that do not exist',
  'Need to coordinate three subagents without losing context',
  'Want to verify an answer before I commit to it',
];

export default function ProblemIntakeModal({ onClose, onSelectSpell }) {
  const modalRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

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

  // Build skill-id set for the active category
  const categorySkillIds = useMemo(() => {
    if (!activeCategory) return null;
    const cat = WIZARD_DATA.find(c => c.id === activeCategory);
    if (!cat) return null;
    return new Set(cat.situations.map(s => s.skill));
  }, [activeCategory]);

  // Combined scoring: text match + optional category boost
  const matches = useMemo(() => {
    // Always get text-based matches (even if query is empty, we still need something)
    const textResults = query.trim()
      ? grimoireIndex.matchProblem(query, { limit: 12 })
      : [];

    // If no category active, return pure text results (limited to 6)
    if (!categorySkillIds) {
      return textResults.slice(0, 6);
    }

    // With category: merge text results with category members not in text results
    const textMap = new Map();
    for (const r of textResults) {
      textMap.set(r.spell.skill, { ...r, score: r.score });
    }

    // Add category skills not already covered by text, with boost score
    const boosted = [];
    for (const skillId of categorySkillIds) {
      const entry = grimoireIndex.resolveBySkill(skillId);
      if (!entry) continue;
      const existing = textMap.get(skillId);
      if (existing) {
        // Boost existing text match
        existing.score += 3;
        boosted.push(existing);
        textMap.delete(skillId);
      } else {
        // Add category skill with base boost score
        boosted.push({ spell: entry.spell, school: entry.school, score: 3 });
      }
    }

    // Add remaining non-category text matches
    for (const r of textMap.values()) {
      boosted.push(r);
    }

    boosted.sort((a, b) => b.score - a.score);
    return boosted.slice(0, 6);
  }, [query, categorySkillIds]);

  const examples = useMemo(() => SUGGEST_EXAMPLE_PROBLEMS, []);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (matches.length > 0) {
      const top = matches[0];
      onSelectSpell?.(top.spell, top.school);
    }
  };

  const handleOpenSpell = (spell) => {
    const entry = grimoireIndex.resolveBySkill(spell.skill);
    if (entry) onSelectSpell?.(entry.spell, entry.school);
    else onClose?.();
  };

  const handleChipClick = (catId) => {
    setActiveCategory(prev => prev === catId ? null : catId);
  };

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose(); } }}>
      <div className="modal intake-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Describe your problem">
        <button className="modal-close" onClick={onClose} aria-label="Close intake" type="button">
          <Icon name="close" size={18} />
        </button>
        <span className="modal-symbol"><ModalEye size={36} /></span>
        <div className="modal-title">What Ails You?</div>
        <div className="modal-school">Pick a category or describe your problem — the orb will suggest incantations.</div>

        {/* Category chips */}
        <div className="intake-chips" role="group" aria-label="Problem categories">
          {WIZARD_DATA.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`intake-chip${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => handleChipClick(cat.id)}
              aria-pressed={activeCategory === cat.id}
            >
              <Icon name={CATEGORY_ICONS[cat.id] || 'help-circle'} size={13} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          <textarea
            className="intake-textarea"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'I have a flaky test that only fails in CI' or 'I need to coordinate three agents'…"
            aria-label="Describe your problem"
            rows={2}
          />

          <div className="intake-actions">
            {activeCategory && (
              <button
                type="button"
                className="intake-clear-filter"
                onClick={() => { setActiveCategory(null); setQuery(''); }}
              >
                Clear filter
              </button>
            )}
            <button
              type="submit"
              className="intake-submit"
              disabled={matches.length === 0}
            >
              {activeCategory ? 'Find Spell' : 'Reveal Suggestions'}
            </button>
          </div>
        </form>

        <div className="intake-results">
          {matches.length === 0 ? (
            <div className="intake-empty">
              {activeCategory
                ? `No spells found in ${WIZARD_DATA.find(c => c.id === activeCategory)?.label}. Try a different category or add more detail.`
                : 'The orb sees no clear match. Try broader terms, or browse by school.'}
            </div>
          ) : (
            <>
              <div className="intake-results-title">
                {matches.length} suggested incantation{matches.length !== 1 ? 's' : ''}
                {activeCategory ? ` in ${WIZARD_DATA.find(c => c.id === activeCategory)?.label}` : ''}
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

        {!matches.length && !activeCategory && (
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
