import { useMemo } from 'react';
import { getRecentlyUpdated } from '../data/spellMetadata.js';
import { useLanguage } from '../i18n/LanguageContext';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function groupByDate(entries) {
  const groups = new Map();
  for (const e of entries) {
    const key = e.lastUpdated;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function ChangelogSection({ onSpellClick }) {
  const { t } = useLanguage();
  const entries = useMemo(() => getRecentlyUpdated(40), []);
  const groups = useMemo(() => groupByDate(entries), [entries]);
  const totalUpdated = entries.filter((e) => e.isExplicit).length;
  const totalSpells = entries.length;

  return (
    <div className="changelog-section active" id="school-changelog">
      <div className="changelog-header">
        <span className="changelog-sigil" aria-hidden="true">📜</span>
        <h2>Changelog</h2>
        <p className="changelog-sub">
          Recently inscribed and revised incantations. Spells with explicit
          dates are real changes; the rest are part of the historical record.
        </p>
      </div>

      <div className="changelog-stats">
        <div className="changelog-stat">
          <span className="changelog-stat-value">{totalUpdated}</span>
          <span className="changelog-stat-label">Curated updates</span>
        </div>
        <div className="changelog-stat">
          <span className="changelog-stat-value">{totalSpells}</span>
          <span className="changelog-stat-label">Tracked spells</span>
        </div>
        <div className="changelog-stat">
          <span className="changelog-stat-value">{groups.length}</span>
          <span className="changelog-stat-label">Active dates</span>
        </div>
      </div>

      {groups.map(([date, items]) => (
        <div key={date} className="changelog-day">
          <div className="changelog-day-head">
            <span className="changelog-day-date">{formatDate(date)}</span>
            <span className="changelog-day-count">
              {items.length} change{items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="changelog-day-list">
            {items.map((e) => (
              <button
                key={e.skill}
                type="button"
                className={`changelog-item${e.isExplicit ? ' explicit' : ' historical'}`}
                onClick={() => onSpellClick?.(e.spell, e.school)}
                title={e.isExplicit ? 'Real change' : 'Historical record'}
              >
                <span className="changelog-item-symbol" aria-hidden="true">
                  {e.school.symbol}
                </span>
                <span className="changelog-item-body">
                  <span className="changelog-item-name">{e.name}</span>
                  <span className="changelog-item-skill">〈 {e.skill} 〉</span>
                  {e.note ? (
                    <span className="changelog-item-note">{e.note}</span>
                  ) : null}
                </span>
                <span className="changelog-item-school">{e.school.real}</span>
                {e.isExplicit ? (
                  <span className="changelog-item-badge" aria-label="Curated update">★</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
