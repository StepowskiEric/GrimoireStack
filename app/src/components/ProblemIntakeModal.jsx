import { useEffect, useRef, useState, useMemo } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { WIZARD_DATA } from '../data/schools.js';
import ModalEye from './ModalEye.tsx';
import SchoolSigil from './SchoolSigil.tsx';
import Icon from './Icon.jsx';
import { useLanguage } from '../i18n/LanguageContext';

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

const EXAMPLE_KEYS = [
  'intakeExample1', 'intakeExample2', 'intakeExample3', 'intakeExample4',
  'intakeExample5', 'intakeExample6', 'intakeExample7', 'intakeExample8',
];

export default function ProblemIntakeModal({ onClose, onSelectSpell }) {
  const { t } = useLanguage();
  const modalRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !focusable.length) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose]);

  const categorySkillIds = useMemo(() => {
    if (!activeCategory) return null;
    const cat = WIZARD_DATA.find(c => c.id === activeCategory);
    if (!cat) return null;
    return new Set(cat.situations.map(s => s.skill));
  }, [activeCategory]);

  const matches = useMemo(() => {
    const textResults = query.trim()
      ? grimoireIndex.matchProblem(query, { limit: 12 })
      : [];

    if (!categorySkillIds) {
      return textResults.slice(0, 6);
    }

    const textMap = new Map();
    for (const r of textResults) {
      textMap.set(r.spell.skill, { ...r, score: r.score });
    }

    const boosted = [];
    for (const skillId of categorySkillIds) {
      const entry = grimoireIndex.resolveBySkill(skillId);
      if (!entry) continue;
      const existing = textMap.get(skillId);
      if (existing) {
        existing.score += 3;
        boosted.push(existing);
        textMap.delete(skillId);
      } else {
        boosted.push({ spell: entry.spell, school: entry.school, score: 3 });
      }
    }

    for (const r of textMap.values()) {
      boosted.push(r);
    }

    boosted.sort((a, b) => b.score - a.score);
    return boosted.slice(0, 6);
  }, [query, categorySkillIds]);

  const examples = useMemo(() => EXAMPLE_KEYS, []);

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

  const categoryLabel = activeCategory
    ? t(`wizard_${activeCategory}`)
    : '';

  const suggestedNoun = matches.length === 1
    ? t('intakeSuggestedSingular')
    : t('intakeSuggestedPlural');

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose(); } }}>
      <div className="modal intake-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={t('intakeAriaLabel')}>
        <button className="modal-close" onClick={onClose} aria-label={t('intakeClose')} type="button">
          <Icon name="close" size={18} />
        </button>
        <span className="modal-symbol"><ModalEye size={36} /></span>
        <div className="modal-title">{t('intakeTitle')}</div>
        <div className="modal-school">{t('intakeSubtitle')}</div>

        {/* Category chips */}
        <div className="intake-chips" role="group" aria-label={t('intakeCategoriesLabel')}>
          {WIZARD_DATA.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`intake-chip${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => handleChipClick(cat.id)}
              aria-pressed={activeCategory === cat.id}
            >
              <Icon name={CATEGORY_ICONS[cat.id] || 'help-circle'} size={13} />
              <span>{t(`wizard_${cat.id}`)}</span>
            </button>
          ))}
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          <textarea
            className="intake-textarea"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('intakePlaceholder')}
            aria-label={t('intakeTextareaLabel')}
            rows={2}
          />

          <div className="intake-actions">
            {activeCategory && (
              <button
                type="button"
                className="intake-clear-filter"
                onClick={() => { setActiveCategory(null); setQuery(''); }}
              >
                {t('intakeClearFilter')}
              </button>
            )}
            <button
              type="submit"
              className="intake-submit"
              disabled={matches.length === 0}
            >
              {activeCategory ? t('intakeFindSpell') : t('intakeSubmit')}
            </button>
          </div>
        </form>

        <div className="intake-results">
          {matches.length === 0 ? (
            <div className="intake-empty">
              {activeCategory
                ? t('intakeEmptyCategory', { category: categoryLabel })
                : t('intakeNoMatch')}
            </div>
          ) : (
            <>
              <div className="intake-results-title">
                {matches.length} {suggestedNoun}
                {activeCategory ? ` ${t('intakeInCategory', { category: categoryLabel })}` : ''}
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
            <div className="intake-examples-title">{t('intakeExamples')}</div>
            <div className="intake-examples-list">
              {examples.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="intake-example"
                  onClick={() => setQuery(t(key))}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
