import { useState, useMemo } from 'react';
import { getRecentlyUpdated, getNewlyAdded } from '../data/changeFeed.js';

function ChangelogEntry({ item }) {
  return (
    <div key={item.skill} className="changelog-view__entry">
      <div className="changelog-view__entry-content">
        <div className="changelog-view__entry-header">
          <span className="changelog-view__entry-name">{item.name}</span>
          <span className="changelog-view__entry-school">{item.school.real}</span>
          {item.status === 'New' && (
            <span className="changelog-view__entry-badge" aria-hidden="true">New</span>
          )}
        </div>
        <div className="changelog-view__entry-date">{item.lastUpdated}</div>
        {item.note && (
          <div className="changelog-view__entry-note">{item.note}</div>
        )}
      </div>
    </div>
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
  const groups = {
    today: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };
  
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

export default function ChangelogView() {
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const allUpdates = useMemo(() => showNewOnly ? getNewlyAdded(50) : getRecentlyUpdated(50), [showNewOnly]);
  
  const filtered = useMemo(() => {
    let items = allUpdates;
    
    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.skill.toLowerCase().includes(q) ||
        (item.note && item.note.toLowerCase().includes(q))
      );
    }
    
    // Filter by school
    if (schoolFilter !== 'all') {
      items = items.filter(item => item.school.id === schoolFilter);
    }
    
    // Filter by date range
    if (dateRange.from) {
      items = items.filter(item => item.lastUpdated >= dateRange.from);
    }
    if (dateRange.to) {
      items = items.filter(item => item.lastUpdated <= dateRange.to);
    }
    
    return items;
  }, [allUpdates, query, schoolFilter, dateRange]);
  
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  
  return (
    <div className="changelog-view">
      <div className="changelog-view__header">
        <div className="changelog-view__crest" aria-hidden="true">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(138,154,106,0.18)" strokeWidth="0.8" />
            <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(138,154,106,0.12)" strokeWidth="0.6" strokeDasharray="3 4" />
            {/* Scroll icon */}
            <path d="M 25 20 L 55 20 L 55 60 L 25 60 Z" fill="none" stroke="rgba(138,154,106,0.2)" strokeWidth="0.8" />
            <path d="M 30 30 L 50 30 M 30 40 L 50 40 M 30 50 L 45 50" stroke="rgba(138,154,106,0.15)" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="changelog-view__heading">
          <h2 className="changelog-view__title">Changelog</h2>
          <p className="changelog-view__sub">
            Recent inscriptions and updates to the grimoire. Filter by school or date to track changes.
          </p>
        </div>
        <div className="changelog-view__stats">
          <div className="changelog-view__stat">
            <span className="changelog-view__stat-num">{filtered.length}</span>
            <span className="changelog-view__stat-label">Updates</span>
          </div>
          <div className="changelog-view__stat">
            <span className="changelog-view__stat-num">{allUpdates.length}</span>
            <span className="changelog-view__stat-label">Total</span>
          </div>
        </div>
      </div>

      <div className="changelog-view__filters">
        <div className="changelog-view__filter-toggle">
          <button
            type="button"
            className={`changelog-view__new-toggle ${showNewOnly ? 'changelog-view__new-toggle--active' : ''}`}
            onClick={() => setShowNewOnly((prev) => !prev)}
          >
            {showNewOnly ? 'Showing new only' : 'Show new only'}
          </button>
        </div>
        
        <div className="changelog-view__search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search changelog..."
            className="changelog-view__search-input"
            aria-label="Search changelog"
          />
        </div>
        
        <div className="changelog-view__filter-row">
          <div className="changelog-view__filter-group">
            <label className="changelog-view__filter-label" htmlFor="school-filter">School</label>
            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select
              id="school-filter"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="changelog-view__select"
              aria-label="Filter by school"
            >
              {SCHOOLS.map(school => (
                <option key={school.id} value={school.id}>{school.label}</option>
              ))}
            </select>
          </div>
          
          <div className="changelog-view__filter-group">
            <fieldset className="changelog-view__fieldset">
              <legend className="changelog-view__filter-label">Date Range</legend>
              <div className="changelog-view__date-range">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="changelog-view__date-input"
                  aria-label="From date"
                />
                <span className="changelog-view__date-separator">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="changelog-view__date-input"
                  aria-label="To date"
                />
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="changelog-view__timeline">
        {filtered.length === 0 ? (
          <div className="changelog-view__empty">
            <p>The chronicle holds no entries for this search.</p>
          </div>
        ) : (
          <>
            {grouped.today.length > 0 && (
              <div className="changelog-view__group">
                <h3 className="changelog-view__group-title">Today</h3>
                {grouped.today.map(item => (
                  <ChangelogEntry key={item.skill} item={item} />
                ))}
              </div>
            )}
            
            {grouped.thisWeek.length > 0 && (
              <div className="changelog-view__group">
                <h3 className="changelog-view__group-title">This Week</h3>
                {grouped.thisWeek.map(item => (
                  <ChangelogEntry key={item.skill} item={item} />
                ))}
              </div>
            )}
            
            {grouped.thisMonth.length > 0 && (
              <div className="changelog-view__group">
                <h3 className="changelog-view__group-title">This Month</h3>
                {grouped.thisMonth.map(item => (
                  <ChangelogEntry key={item.skill} item={item} />
                ))}
              </div>
            )}
            
            {grouped.older.length > 0 && (
              <div className="changelog-view__group">
                <h3 className="changelog-view__group-title">Older</h3>
                {grouped.older.map(item => (
                  <ChangelogEntry key={item.skill} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="changelog-view__footer">
        <div className="changelog-view__footer-ornament" aria-hidden="true">
          <span>⟐</span>
          <span className="changelog-view__footer-rune">ᚦ</span>
          <span>⟐</span>
        </div>
      </div>
    </div>
  );
}
