import { useCallback, useMemo, useState } from 'react';
import { getSpellLastUpdated } from '../data/changeFeed.js';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { getSpellTier, TIER_META } from '../data/tiers.js';
import { cn } from '../utils/cn.js';
import SchoolCardGrid from './SchoolCardGrid.jsx';
import SchoolSigil from './SchoolSigil.tsx';

const TIER_ORDER = ['archmage', 'master', 'adept', 'apprentice', 'faded'];

const SORT_OPTIONS = [
  { id: 'alpha', label: 'Alphabetical' },
  { id: 'tier', label: 'By Arcane Tier' },
  { id: 'recent', label: 'Recently Inscribed' },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'Proven', label: 'Proven' },
  { id: 'MCP', label: 'MCP' },
  { id: 'Hybrid', label: 'Hybrid' },
  { id: 'Framework', label: 'Framework' },
  { id: 'New', label: 'New' },
  { id: 'Common', label: 'Common' },
];

const TIER_STYLES = {
  archmage: 'border-danger/40 text-danger',
  master: 'border-accent/40 text-accent',
  adept: 'border-border-hover text-text-primary',
  apprentice: 'border-[rgba(154,138,170,0.4)] text-[#9a8aaa]',
  faded: 'border-[rgba(154,154,162,0.4)] text-[#9a9aa2]',
};

export default function LibraryContent({
  featuredSchools,
  onFeaturedSchoolsChange,
  onSchoolSelect,
  onSpellClick,
  isFavorited,
  marginalia,
}) {
  const [query, setQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState(() => new Set());
  const [tierFilter, setTierFilter] = useState(() => new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [combosOnly, setCombosOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [annotatedOnly, setAnnotatedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('alpha');
  const [page, setPage] = useState(0);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const PAGE_SIZE = 50;

  const all = useMemo(() => grimoireIndex.flatEntries(), []);
  const schoolMap = useMemo(() => grimoireIndex.getSchoolMap(), []);

  const hasNote = useCallback(
    (skill) => {
      const notes = marginalia?.notes || marginalia;
      if (!notes || typeof notes !== 'object') return false;
      return Boolean(notes[skill] && String(notes[skill]).trim());
    },
    [marginalia],
  );

  const hasActiveFilters =
    query.trim() !== '' ||
    schoolFilter.size > 0 ||
    tierFilter.size > 0 ||
    statusFilter !== 'all' ||
    combosOnly ||
    favoritesOnly ||
    annotatedOnly;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all;
    if (q) {
      list = list.filter(
        ({ spell, school }) =>
          spell.name.toLowerCase().includes(q) ||
          spell.skill.toLowerCase().includes(q) ||
          spell.effect.toLowerCase().includes(q) ||
          school.name.toLowerCase().includes(q),
      );
    }
    if (schoolFilter.size > 0) {
      list = list.filter(({ school }) => schoolFilter.has(school.id));
    }
    if (tierFilter.size > 0) {
      list = list.filter(({ spell }) => tierFilter.has(getSpellTier(spell)));
    }
    if (statusFilter !== 'all') {
      list = list.filter(({ spell }) => (spell.status || 'Common') === statusFilter);
    }
    if (combosOnly) {
      list = list.filter(({ spell }) => Array.isArray(spell.combos) && spell.combos.length > 0);
    }
    if (favoritesOnly) {
      list = list.filter(({ spell }) => isFavorited?.(spell.name, spell.skill));
    }
    if (annotatedOnly) {
      list = list.filter(({ spell }) => hasNote(spell.skill));
    }
    return list;
  }, [
    all,
    query,
    schoolFilter,
    tierFilter,
    statusFilter,
    combosOnly,
    favoritesOnly,
    annotatedOnly,
    isFavorited,
    hasNote,
  ]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'alpha') {
      arr.sort((a, b) => a.spell.name.localeCompare(b.spell.name));
    } else if (sortBy === 'tier') {
      arr.sort((a, b) => {
        const ta = TIER_ORDER.indexOf(getSpellTier(a.spell));
        const tb = TIER_ORDER.indexOf(getSpellTier(b.spell));
        if (ta !== tb) return ta - tb;
        return a.spell.name.localeCompare(b.spell.name);
      });
    } else if (sortBy === 'recent') {
      arr.sort((a, b) => {
        const da = getSpellLastUpdated(a.spell.skill) || '';
        const db = getSpellLastUpdated(b.spell.skill) || '';
        if (da !== db) return db.localeCompare(da);
        return a.spell.name.localeCompare(b.spell.name);
      });
    }
    return arr;
  }, [filtered, sortBy]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const toggleSchool = useCallback((id) => {
    setSchoolFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPage(0);
  }, []);

  const toggleTier = useCallback((key) => {
    setTierFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setPage(0);
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setSchoolFilter(new Set());
    setTierFilter(new Set());
    setStatusFilter('all');
    setCombosOnly(false);
    setFavoritesOnly(false);
    setAnnotatedOnly(false);
    setPage(0);
  }, []);

  return (
    <div className="py-1">
      {/* Search bar + filter toggles — always visible */}
      <div className="panel p-3.5 mb-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <span
              className="absolute inset-y-0 left-2.5 flex items-center text-sickly"
              aria-hidden="true"
            >
              ⟐
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Scry by name, skill, effect, or school…"
              aria-label="Search the library"
              className="w-full bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted text-[0.95rem] pl-8 pr-2 py-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
            />
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="font-['Cinzel'] text-[0.72rem] uppercase tracking-widest text-text-muted">
                {sorted.length} {sorted.length === 1 ? 'result' : 'results'}
                {pageCount > 1 ? ` · page ${safePage + 1} of ${pageCount}` : ''}
              </span>
              <button
                type="button"
                className="font-['Cinzel'] text-[0.6rem] uppercase tracking-wider border border-border text-text-muted px-2 py-1 rounded-sm hover:border-border-hover hover:text-text-primary transition-all duration-200"
                onClick={() => setFiltersVisible((v) => !v)}
                aria-expanded={filtersVisible}
                aria-label="Toggle filters"
              >
                {filtersVisible ? 'Hide Filters' : 'Filters'}
              </button>
              <button
                type="button"
                className="font-['Cinzel'] text-[0.6rem] uppercase tracking-wider border border-border text-text-muted px-2 py-1 rounded-sm hover:border-border-hover hover:text-text-primary transition-all duration-200"
                onClick={clearAll}
                title="Clear all filters"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Collapsible filter panel */}
        {filtersVisible && (
          <div className="mt-3 space-y-3">
            <div>
              <div className="section-title mb-1.5" aria-hidden="true">
                School
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(schoolMap.values()).map((s) => {
                  const active = schoolFilter.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={cn(
                        'flex items-center gap-1.5 border rounded-sm px-2 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider transition-all duration-200',
                        active
                          ? 'border-border-hover bg-surface-raised text-text-primary'
                          : 'border-border bg-surface text-text-muted hover:border-border-hover',
                      )}
                      onClick={() => toggleSchool(s.id)}
                      aria-pressed={active}
                      title={s.real}
                    >
                      <span className="text-sickly" aria-hidden="true">
                        <SchoolSigil schoolId={s.id} size={14} />
                      </span>
                      <span>{s.real}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="section-title mb-1.5" aria-hidden="true">
                Tier
              </div>
              <div className="flex flex-wrap gap-2">
                {TIER_ORDER.map((key) => {
                  const meta = TIER_META[key];
                  if (!meta) return null;
                  const active = tierFilter.has(key);
                  const style = TIER_STYLES[key] || 'border-border text-text-muted';
                  return (
                    <button
                      key={key}
                      type="button"
                      className={cn(
                        'flex items-center gap-1.5 border rounded-sm px-2 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider transition-all duration-200',
                        active
                          ? style
                          : 'border-border bg-surface text-text-muted hover:border-border-hover',
                      )}
                      onClick={() => toggleTier(key)}
                      aria-pressed={active}
                      title={meta.title}
                    >
                      <span aria-hidden="true">⟐</span>
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="section-title mb-1.5" aria-hidden="true">
                  Status
                </div>
                {/* eslint-disable-next-line jsx-a11y/no-onchange */}
                <select
                  className="w-full bg-surface-overlay border border-border text-text-primary text-[0.95rem] p-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  aria-label="Filter by status"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="section-title mb-1.5" aria-hidden="true">
                  Sort
                </div>
                {/* eslint-disable-next-line jsx-a11y/no-onchange */}
                <select
                  className="w-full bg-surface-overlay border border-border text-text-primary text-[0.95rem] p-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort entries"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-text-primary text-[0.82rem]">
                <input
                  type="checkbox"
                  checked={combosOnly}
                  onChange={(e) => {
                    setCombosOnly(e.target.checked);
                    setPage(0);
                  }}
                />
                <span>Synergies</span>
              </label>
              <label className="flex items-center gap-2 text-text-primary text-[0.82rem]">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => {
                    setFavoritesOnly(e.target.checked);
                    setPage(0);
                  }}
                />
                <span>Favorited</span>
              </label>
              <label className="flex items-center gap-2 text-text-primary text-[0.82rem]">
                <input
                  type="checkbox"
                  checked={annotatedOnly}
                  onChange={(e) => {
                    setAnnotatedOnly(e.target.checked);
                    setPage(0);
                  }}
                />
                <span>Annotated</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Content area — SchoolCardGrid when idle, results when filtering */}
      {!hasActiveFilters ? (
        <SchoolCardGrid
          featuredSchools={featuredSchools}
          onFeaturedSchoolsChange={onFeaturedSchoolsChange}
          onSchoolSelect={onSchoolSelect}
        />
      ) : visible.length === 0 ? (
        <div className="panel p-4 text-center">
          <p className="text-text-muted italic">The abyss returns nothing for this filter.</p>
          <button
            type="button"
            className="mt-2 section-title px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised"
            onClick={clearAll}
          >
            Lift the binding
          </button>
        </div>
      ) : (
        <>
          <div className="panel overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="section-title px-3 py-2 border-b border-border">Skill</th>
                  <th className="section-title px-3 py-2 border-b border-border">Tier</th>
                  <th className="section-title px-3 py-2 border-b border-border">Effect</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ spell, school }) => {
                  const tier = getSpellTier(spell);
                  const tierMeta = TIER_META[tier];
                  const statusStr = spell.status && spell.status !== '—' ? spell.status : 'Common';
                  const comboCount = Array.isArray(spell.combos) ? spell.combos.length : 0;
                  const compactLabel = tierMeta.label.split(' ')[0];
                  return (
                    <tr
                      key={`${school.id}::${spell.skill}`}
                      data-testid="bestiary-row"
                      className="cursor-pointer transition-all duration-200 hover:bg-surface-raised"
                      onClick={() => onSpellClick?.(spell, school)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onSpellClick?.(spell, school);
                      }}
                    >
                      <td className="px-3 py-2.5 border-b border-border">
                        <div className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wide text-text-primary">
                          {spell.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sickly">
                            <SchoolSigil schoolId={school.id} size={16} />
                          </span>
                          {statusStr !== 'Common' ? (
                            <span
                              data-testid="bestiary-status"
                              className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-accent border border-accent/40 rounded-sm px-1.5 py-0.5"
                            >
                              {statusStr}
                            </span>
                          ) : null}
                          {comboCount > 0 ? (
                            <span
                              data-testid="bestiary-combos"
                              className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted border border-border rounded-sm px-1.5 py-0.5"
                            >
                              {comboCount}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-b border-border">
                        <span
                          data-testid="bestiary-tier"
                          className={cn(
                            'inline-flex items-center gap-1.5 border rounded-sm px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-wider',
                            TIER_STYLES[tier] || 'border-border text-text-muted',
                          )}
                          title={tierMeta.title}
                        >
                          <span aria-hidden="true">⟐</span>
                          <span>{compactLabel}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 border-b border-border text-text-secondary text-[0.82rem]">
                        {spell.effect}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pageCount > 1 ? (
            <nav className="mt-3 flex items-center justify-center gap-3.5" aria-label="Pagination">
              <button
                type="button"
                className="font-['Cinzel'] text-[0.7rem] uppercase tracking-widest border border-border text-text-muted px-2.5 py-1 rounded-sm cursor-pointer transition-all duration-200 hover:border-border-hover hover:text-text-primary disabled:opacity-35 disabled:cursor-not-allowed"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                aria-label="Previous page"
              >
                ← Earlier
              </button>
              <span className="font-['Cinzel'] text-[0.74rem] text-text-muted tracking-widest">
                {safePage + 1} / {pageCount}
              </span>
              <button
                type="button"
                className="font-['Cinzel'] text-[0.7rem] uppercase tracking-widest border border-border text-text-muted px-2.5 py-1 rounded-sm cursor-pointer transition-all duration-200 hover:border-border-hover hover:text-text-primary disabled:opacity-35 disabled:cursor-not-allowed"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage >= pageCount - 1}
                aria-label="Next page"
              >
                Later →
              </button>
            </nav>
          ) : null}

          <div className="mt-6 text-center text-text-muted" aria-hidden="true">
            <span>⟐</span>
            <span className="mx-2">ᚦ</span>
            <span>⟐</span>
          </div>
        </>
      )}
    </div>
  );
}
