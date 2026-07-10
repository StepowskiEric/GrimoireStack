import { useMemo } from 'react';
import { WIZARD_DATA } from '../data/schools.js';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import SchoolSigil from './SchoolSigil.tsx';
import Icon from './Icon.jsx';
import '../components/IntakeOracle.css';

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

/**
 * OracleInlinePanel — the inline oracle UI for the eye-stage column.
 *
 * Controlled component: all state lives in useOracle hook in the parent.
 */
export default function OracleInlinePanel({
  query,
  onQueryChange,
  onAskOracle,
  results,
  loading,
  error,
  onSelectSpell,
  source,
  activeCategory,
  onCategoryChange,
  onBrowseLibrary,
  t,
}) {
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

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    // Prefer oracle results when available (more relevant to the query)
    if (results.length > 0) {
      const top = results[0];
      const entry = grimoireIndex.resolveBySkill(top.skill);
      if (entry) {
        onSelectSpell?.(entry.spell, entry.school, 'ai');
        return;
      }
    }
    if (matches.length > 0) {
      const top = matches[0];
      onSelectSpell?.(top.spell, top.school, 'local');
    }
  };

  const handleOpenSpell = (spell, origin) => {
    const entry = grimoireIndex.resolveBySkill(spell.skill);
    if (entry) onSelectSpell?.(entry.spell, entry.school, origin);
  };

  const handleChipClick = (catId) => {
    onCategoryChange?.(prev => prev === catId ? null : catId);
  };

  const categoryLabel = activeCategory
    ? t(`wizard_${activeCategory}`)
    : '';

  const suggestedNoun = matches.length === 1
    ? t('intakeSuggestedSingular')
    : t('intakeSuggestedPlural');

  return (
    <div className="oracle-inline-panel">
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

      <form className="oracle-inline-form" onSubmit={handleSubmit}>
        <textarea
          className="oracle-inline-textarea"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t('intakePlaceholder')}
          aria-label={t('intakeTextareaLabel')}
          rows={2}
        />

        <div className="oracle-inline-actions">
          <button
            type="button"
            className="oracle-inline-ask-btn"
            onClick={onAskOracle}
            disabled={!query.trim() || loading}
            aria-busy={loading}
          >
            {loading ? t('intakeOracleLoading') : t('intakeOracle')}
          </button>
          <button
            type="submit"
            className="oracle-inline-submit"
            disabled={matches.length === 0}
          >
            {activeCategory ? t('intakeFindSpell') : t('intakeSubmit')}
          </button>
        </div>
      </form>

      {/* Local matches */}
      {matches.length > 0 && (
        <div className="oracle-inline-matches">
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
                onClick={() => handleOpenSpell(m.spell, 'local')}
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
        </div>
      )}

      {/* Oracle results */}
      {error && (
        <div className="oracle-inline-error" role="alert">{error}</div>
      )}
      {results.length > 0 && (
        <div className="oracle-inline-results" aria-live="polite">
          <div className="oracle-inline-results-header">
            <span className="oracle-inline-results-title">
              {source === 'local' ? 'Local Reading' : t('intakeOracle')}
            </span>
            {onBrowseLibrary && (
              <button
                type="button"
                className="oracle-inline-library-btn"
                onClick={onBrowseLibrary}
                aria-label="Browse the Grimoire"
                title="Browse the Grimoire"
              >
                <Icon name="archive" size={14} />
              </button>
            )}
          </div>
          <div className="intake-results-list">
            {results.map((r, i) => {
              const entry = grimoireIndex.resolveBySkill(r.skill);
              if (!entry) return null;
              return (
                <button
                  key={r.skill}
                  type="button"
                  className="intake-result"
                  onClick={() => handleOpenSpell(entry.spell, 'ai')}
                >
                  <span className="intake-result-rank">#{i + 1}</span>
                  <span className="intake-result-symbol" aria-hidden="true"><SchoolSigil schoolId={entry.school.id} size={20} /></span>
                  <span className="intake-result-body">
                    <span className="intake-result-name">{r.name || entry.spell.name}</span>
                    <span className="intake-result-effect">{r.reason || entry.spell.effect}</span>
                    <span className="intake-result-school">
                      {r.school || entry.school.name}
                      {r.score != null && (
                        <span className="intake-result-score"> - {Math.round(r.score * 100)}% match</span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Examples shown when idle */}
      {!query && !activeCategory && matches.length === 0 && results.length === 0 && !error && (
        <div className="intake-examples">
          <div className="intake-examples-title">{t('intakeExamples')}</div>
          <div className="intake-examples-list">
            {EXAMPLE_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className="intake-example"
                onClick={() => onQueryChange(t(key))}
              >
                {t(key)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
