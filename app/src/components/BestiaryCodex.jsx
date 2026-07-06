import { useState, useMemo, useCallback } from 'react';
import { TIER_META, getSpellTier } from '../data/tiers.js';
import { getSpellLastUpdated } from '../data/changeFeed.js';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
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

function statusClass(status) {
  return (status || 'common').toLowerCase().replace(/[^a-z]/g, '') || 'common';
}

function _formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function BestiaryCodex({
  onSpellClick,
  isFavorited,
  hasNote,
}) {
  const [query, setQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState(new Set());
  const [tierFilter, setTierFilter] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [combosOnly, setCombosOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [annotatedOnly, setAnnotatedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('alpha');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const all = useMemo(() => grimoireIndex.flatEntries(), []);
  const schoolMap = useMemo(() => grimoireIndex.getSchoolMap(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all;
    if (q) {
      list = list.filter(({ spell, school }) =>
        spell.name.toLowerCase().includes(q) ||
        spell.skill.toLowerCase().includes(q) ||
        spell.effect.toLowerCase().includes(q) ||
        school.name.toLowerCase().includes(q)
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
      list = list.filter(({ spell }) => hasNote?.(spell.skill));
    }
    return list;
  }, [all, query, schoolFilter, tierFilter, statusFilter, combosOnly, favoritesOnly, annotatedOnly, isFavorited, hasNote]);

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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setPage(0);
  }, []);

  const toggleTier = useCallback((key) => {
    setTierFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
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

  const anyActive =
    query.trim() !== '' ||
    schoolFilter.size > 0 ||
    tierFilter.size > 0 ||
    statusFilter !== 'all' ||
    combosOnly ||
    favoritesOnly ||
    annotatedOnly;

  // Aggregate counts for the header
  const totalSpells = all.length;

  return (
    <div className="bestiary-codex">
      {/* Header */}
      <header className="bestiary-codex__header">
        <div className="bestiary-codex__heading">
          <h2 className="bestiary-codex__title">The Bestiary Codex</h2>
          <p className="bestiary-codex__sub">
            A complete catalogue of every entity bound within this grimoire.
            Filter the abyss, mark what binds you, and read what you dare.
          </p>
        </div>

        {/* Filter rail */}
        <div className="bestiary-codex__filters">
          <div className="bestiary-codex__search">
            <span className="bestiary-codex__search-rune" aria-hidden="true">⟐</span>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Scry by name, skill, effect, or school…"
              aria-label="Search the bestiary"
              className="bestiary-codex__search-input"
            />
          </div>

          <div className="bestiary-codex__filter-rows">
            <div className="bestiary-codex__filter-row">
              <span className="bestiary-codex__filter-label" aria-hidden="true">School</span>
              <div className="bestiary-codex__chips">
                {Array.from(schoolMap.values()).map((s) => {
                  const active = schoolFilter.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`bestiary-codex__chip${active ? ' is-active' : ''}`}
                      onClick={() => toggleSchool(s.id)}
                      aria-pressed={active}
                      title={s.real}
                    >
                      <span className="bestiary-codex__chip-glyph" aria-hidden="true"><SchoolSigil schoolId={s.id} size={14} /></span>
                      <span className="bestiary-codex__chip-text">{s.real}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bestiary-codex__filter-row">
              <span className="bestiary-codex__filter-label" aria-hidden="true">Tier</span>
              <div className="bestiary-codex__chips">
                {TIER_ORDER.map((key) => {
                  const meta = TIER_META[key];
                  if (!meta) return null;
                  const active = tierFilter.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`bestiary-codex__chip bestiary-codex__chip--${meta.className.split('-').pop()}${active ? ' is-active' : ''}`}
                      onClick={() => toggleTier(key)}
                      aria-pressed={active}
                      title={meta.title}
                    >
                      <span className="bestiary-codex__chip-glyph" aria-hidden="true">⟐</span>
                      <span className="bestiary-codex__chip-text">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bestiary-codex__filter-rows">
            <div className="bestiary-codex__filter-row">
              <span className="bestiary-codex__filter-label" aria-hidden="true">Status</span>
              {/* eslint-disable-next-line jsx-a11y/no-onchange */}
              <select
                className="bestiary-codex__select"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                aria-label="Filter by status"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <span className="bestiary-codex__filter-label" aria-hidden="true">Sort</span>
              {/* eslint-disable-next-line jsx-a11y/no-onchange */}
              <select
                className="bestiary-codex__select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort entries"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="bestiary-codex__filter-row bestiary-codex__filter-row--toggles">
              <label className="bestiary-codex__toggle">
                <input
                  type="checkbox"
                  checked={combosOnly}
                  onChange={(e) => { setCombosOnly(e.target.checked); setPage(0); }}
                />
                <span>Synergies</span>
              </label>
              <label className="bestiary-codex__toggle">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => { setFavoritesOnly(e.target.checked); setPage(0); }}
                />
                <span>Favorited</span>
              </label>
              <label className="bestiary-codex__toggle">
                <input
                  type="checkbox"
                  checked={annotatedOnly}
                  onChange={(e) => { setAnnotatedOnly(e.target.checked); setPage(0); }}
                />
                <span>Annotated</span>
              </label>
              {anyActive ? (
                <button
                  type="button"
                  className="bestiary-codex__clear"
                  onClick={clearAll}
                  title="Clear all filters"
                >
                  Purge
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Result count */}
      <div className="bestiary-codex__count">
        {sorted.length} {sorted.length === 1 ? 'entity' : 'entities'}
        {sorted.length !== totalSpells ? ` of ${totalSpells}` : ''}
        {pageCount > 1 ? ` · page ${safePage + 1} of ${pageCount}` : ''}
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="bestiary-codex__empty">
          <p>The abyss returns nothing for this filter.</p>
          {anyActive ? (
            <button type="button" className="bestiary-codex__empty-btn" onClick={clearAll}>
              Lift the binding
            </button>
          ) : null}
        </div>
      ) : (
        <div className="bestiary-codex__table-wrap">
          <table className="bestiary-codex__table">
            <thead>
              <tr>
                <th className="bestiary-codex__th bestiary-codex__th--name">Skill</th>
                <th className="bestiary-codex__th bestiary-codex__th--tier">Tier</th>
                <th className="bestiary-codex__th bestiary-codex__th--effect">Effect</th>
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
                    key={school.id + '::' + spell.skill}
                    className={`bestiary-codex__tr bestiary-codex__tr--${tier}`}
                    onClick={() => onSpellClick?.(spell, school)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSpellClick?.(spell, school); }}
                  >
                    <td className="bestiary-codex__td bestiary-codex__td--name">
                      <span className="bestiary-codex__td-name">{spell.name}</span>
                      <span className="bestiary-codex__td-meta">
                        <span className="bestiary-codex__td-school"><SchoolSigil schoolId={school.id} size={16} /></span>
                        {statusStr !== 'Common' ? (
                          <span className={`bestiary-codex__td-status ${statusClass(statusStr)}`}>{statusStr}</span>
                        ) : null}
                        {comboCount > 0 ? (
                          <span className="bestiary-codex__td-combos">{comboCount}</span>
                        ) : null}
                      </span>
                    </td>
                    <td className="bestiary-codex__td bestiary-codex__td--tier">
                      <span
                        className={`bestiary-codex__tier-badge ${tierMeta.className}`}
                        title={tierMeta.title}
                      >
                        <span className="bestiary-codex__tier-mark" aria-hidden="true">⟐</span>
                        <span className="bestiary-codex__tier-label">{compactLabel}</span>
                      </span>
                    </td>
                    <td className="bestiary-codex__td bestiary-codex__td--effect">
                      {spell.effect}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 ? (
        <nav className="bestiary-codex__pager" aria-label="Bestiary pagination">
          <button
            type="button"
            className="bestiary-codex__pager-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            aria-label="Previous page"
          >
            ← Earlier
          </button>
          <span className="bestiary-codex__pager-info">
            {safePage + 1} / {pageCount}
          </span>
          <button
            type="button"
            className="bestiary-codex__pager-btn"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            aria-label="Next page"
          >
            Later →
          </button>
        </nav>
      ) : null}

      {/* Decorative footer bone */}
      <div className="bestiary-codex__footer-ornament" aria-hidden="true">
        <span>⟐</span>
        <span className="bestiary-codex__footer-rune">ᚦ</span>
        <span>⟐</span>
      </div>
    </div>
  );
}
