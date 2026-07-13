import { useMemo, useState } from 'react';
import { getNewlyAdded, getRecentlyUpdated, getUpdated } from '../data/changeFeed.js';

function ChangelogEntry({ item, onSpellClick }) {
  const handleClick = () => {
    if (onSpellClick) {
      onSpellClick(item.spell, item.school);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="panel p-3.5 w-full text-left transition-all duration-200 hover:bg-[rgba(138,154,106,0.06)] hover:border-[rgba(138,154,106,0.18)] cursor-pointer"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wide text-text-primary">
          {item.name}
        </span>
        <span className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted">
          {item.school.real}
        </span>
        {item.status === 'New' && (
          <span
            className="font-['Cinzel'] text-[0.6rem] font-bold uppercase tracking-widest text-accent border border-accent/40 rounded-sm px-1.5 py-0.5"
            aria-hidden="true"
          >
            New
          </span>
        )}
        {item.status !== 'New' && item.isExplicit && (
          <span
            className="font-['Cinzel'] text-[0.6rem] font-bold uppercase tracking-widest text-text-muted border border-border-hover rounded-sm px-1.5 py-0.5"
            aria-hidden="true"
          >
            Updated
          </span>
        )}
      </div>
      <div className="mt-1 font-['Cinzel'] text-[0.68rem] text-text-muted">{item.lastUpdated}</div>
      {item.note && <div className="mt-1 text-text-secondary text-[0.82rem]">{item.note}</div>}
    </button>
  );
}

const SCHOOLS = [
  { id: 'all', label: 'All Schools' },
  { id: 'debugging', label: 'Debugging' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'process', label: 'Process' },
  { id: 'code-review', label: 'Code Review' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'planning', label: 'Planning' },
  { id: 'learning', label: 'Learning' },
  { id: 'anti-hallucination', label: 'Anti-Hallucination' },
  { id: 'software-dev', label: 'Software Dev' },
  { id: 'multi-agent', label: 'Multi-Agent' },
  { id: 'risk', label: 'Risk' },
  { id: 'cognitive-load', label: 'Cognitive Load' },
  { id: 'testing', label: 'Testing' },
];

function groupByDate(items) {
  const groups = { today: [], thisWeek: [], thisMonth: [], older: [] };

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  for (const item of items) {
    const date = item.lastUpdated;
    if (date === today) {
      groups.today.push(item);
    } else if (date >= weekAgo) {
      groups.thisWeek.push(item);
    } else if (date >= monthAgo) {
      groups.thisMonth.push(item);
    } else {
      groups.older.push(item);
    }
  }

  return groups;
}

export default function ChangelogView({ onSpellClick }) {
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showUpdatedOnly, setShowUpdatedOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const allUpdates = useMemo(() => {
    if (showNewOnly) return getNewlyAdded(50);
    if (showUpdatedOnly) return getUpdated(50);
    return getRecentlyUpdated(50);
  }, [showNewOnly, showUpdatedOnly]);

  const filtered = useMemo(() => {
    let items = allUpdates;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.skill.toLowerCase().includes(q) ||
          item.note?.toLowerCase().includes(q),
      );
    }

    if (schoolFilter !== 'all') {
      items = items.filter((item) => item.school.id === schoolFilter);
    }

    if (dateRange.from) {
      items = items.filter((item) => item.lastUpdated >= dateRange.from);
    }
    if (dateRange.to) {
      items = items.filter((item) => item.lastUpdated <= dateRange.to);
    }

    return items;
  }, [allUpdates, query, schoolFilter, dateRange]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="py-1">
      <div className="panel p-4 mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sickly" aria-hidden="true">
              <svg viewBox="0 0 80 80" className="h-12 w-12">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="rgba(138,154,106,0.18)"
                  strokeWidth="0.8"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="28"
                  fill="none"
                  stroke="rgba(138,154,106,0.12)"
                  strokeWidth="0.6"
                  strokeDasharray="3 4"
                />
                <path
                  d="M 25 20 L 55 20 L 55 60 L 25 60 Z"
                  fill="none"
                  stroke="rgba(138,154,106,0.2)"
                  strokeWidth="0.8"
                />
                <path
                  d="M 30 30 L 50 30 M 30 40 L 50 40 M 30 50 L 45 50"
                  stroke="rgba(138,154,106,0.15)"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide">
                Changelog
              </h2>
              <p className="text-text-secondary text-[0.82rem]">
                Recent inscriptions and updates to the grimoire. Filter by school or date to track
                changes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-['Cinzel'] text-[0.9rem] font-bold text-text-primary">
                {filtered.length}
              </div>
              <div className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted">
                Updates
              </div>
            </div>
            <div className="text-center">
              <div className="font-['Cinzel'] text-[0.9rem] font-bold text-text-primary">
                {allUpdates.length}
              </div>
              <div className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted">
                Total
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel p-3.5 mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => setShowNewOnly((prev) => !prev)}
            className={
              showNewOnly
                ? 'section-title px-2.5 py-1.5 border border-accent/40 text-accent'
                : 'section-title px-2.5 py-1.5 border border-border hover:border-border-hover text-text-muted'
            }
          >
            {showNewOnly ? 'Showing new only' : 'Show new only'}
          </button>
          <button
            type="button"
            onClick={() => setShowUpdatedOnly((prev) => !prev)}
            className={
              showUpdatedOnly
                ? 'section-title px-2.5 py-1.5 border border-accent/40 text-accent'
                : 'section-title px-2.5 py-1.5 border border-border hover:border-border-hover text-text-muted'
            }
          >
            {showUpdatedOnly ? 'Showing updated only' : 'Show updated only'}
          </button>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search changelog..."
            className="w-full bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted text-[0.95rem] p-2 rounded-sm md:w-72 focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
            aria-label="Search changelog"
          />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="section-title mb-1 block" htmlFor="school-filter">
              School
            </label>
            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select
              id="school-filter"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full bg-surface-overlay border border-border text-text-primary text-[0.95rem] p-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
              aria-label="Filter by school"
            >
              {SCHOOLS.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <fieldset className="border border-border rounded-sm p-2">
              <legend className="section-title px-1">Date Range</legend>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                    className="bg-surface-overlay border border-border text-text-primary text-[0.95rem] p-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
                    aria-label="From date"
                  />
                  <span className="text-text-muted text-[0.82rem]">to</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                    className="bg-surface-overlay border border-border text-text-primary text-[0.95rem] p-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
                    aria-label="To date"
                  />
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="panel p-4 text-center">
            <p className="text-text-muted italic">
              The chronicle holds no entries for this search.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {grouped.today.length > 0 && (
              <section>
                <div className="relative flex items-center gap-2 mb-2">
                  <h3 className="section-title">Today</h3>
                </div>
                <div className="grid gap-2">
                  {grouped.today.map((item) => (
                    <ChangelogEntry key={item.skill} item={item} onSpellClick={onSpellClick} />
                  ))}
                </div>
              </section>
            )}

            {grouped.thisWeek.length > 0 && (
              <section>
                <div className="relative flex items-center gap-2 mb-2">
                  <h3 className="section-title">This Week</h3>
                </div>
                <div className="grid gap-2">
                  {grouped.thisWeek.map((item) => (
                    <ChangelogEntry key={item.skill} item={item} onSpellClick={onSpellClick} />
                  ))}
                </div>
              </section>
            )}

            {grouped.thisMonth.length > 0 && (
              <section>
                <div className="relative flex items-center gap-2 mb-2">
                  <h3 className="section-title">This Month</h3>
                </div>
                <div className="grid gap-2">
                  {grouped.thisMonth.map((item) => (
                    <ChangelogEntry key={item.skill} item={item} onSpellClick={onSpellClick} />
                  ))}
                </div>
              </section>
            )}

            {grouped.older.length > 0 && (
              <section>
                <div className="relative flex items-center gap-2 mb-2">
                  <h3 className="section-title">Older</h3>
                </div>
                <div className="grid gap-2">
                  {grouped.older.map((item) => (
                    <ChangelogEntry key={item.skill} item={item} onSpellClick={onSpellClick} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-text-muted" aria-hidden="true">
        <span>⟐</span>
        <span className="mx-2">ᚦ</span>
        <span>⟐</span>
      </div>
    </div>
  );
}
