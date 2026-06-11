import { useMemo, useState, useEffect, useRef } from 'react';
import { buildSpellGraph } from '../data/spellGraph.js';
import { useLanguage } from '../i18n/LanguageContext';

const WIDTH = 920;
const HEIGHT = 620;

function layoutNodes(nodes, edges) {
  if (!nodes.length) return [];
  const schoolGroups = new Map();
  for (const n of nodes) {
    if (!schoolGroups.has(n.schoolId)) schoolGroups.set(n.schoolId, []);
    schoolGroups.get(n.schoolId).push(n);
  }
  const groupIds = Array.from(schoolGroups.keys());
  const groupCount = groupIds.length || 1;
  const groupRadius = Math.min(WIDTH, HEIGHT) * 0.32;
  const positioned = new Map();
  groupIds.forEach((gid, gi) => {
    const angle = (gi / groupCount) * Math.PI * 2 - Math.PI / 2;
    const cx = WIDTH / 2 + Math.cos(angle) * groupRadius * 0.55;
    const cy = HEIGHT / 2 + Math.sin(angle) * groupRadius * 0.55;
    const group = schoolGroups.get(gid) || [];
    const cols = Math.max(1, Math.ceil(Math.sqrt(group.length)));
    group.forEach((n, ni) => {
      const row = Math.floor(ni / cols);
      const col = ni % cols;
      const localR = 24 + Math.min(80, group.length * 1.5);
      const lx = (col - (cols - 1) / 2) * (WIDTH / Math.max(cols, 6));
      const ly = row * 26 - (Math.floor(group.length / cols) * 13);
      const jitterX = (hashStr(n.id) % 13) - 6;
      const jitterY = (hashStr(n.id + 'y') % 11) - 5;
      const x = Math.max(36, Math.min(WIDTH - 36, cx + lx + jitterX));
      const y = Math.max(36, Math.min(HEIGHT - 36, cy + ly + jitterY));
      positioned.set(n.id, { x, y });
    });
  });

  for (let pass = 0; pass < 60; pass++) {
    for (const n of nodes) {
      const p = positioned.get(n.id);
      let fx = 0, fy = 0;
      // Attract along edges
      for (const e of edges) {
        const other = e.source === n.id ? e.target : e.target === n.id ? e.source : null;
        if (!other) continue;
        const op = positioned.get(other);
        if (!op) continue;
        const dx = op.x - p.x;
        const dy = op.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const target = 90 - Math.min(60, e.weight * 18);
        const force = (dist - target) * 0.012;
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }
      // Repel from other nodes
      for (const m of nodes) {
        if (m.id === n.id) continue;
        const mp = positioned.get(m.id);
        const dx = p.x - mp.x;
        const dy = p.y - mp.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 1) continue;
        const dist = Math.sqrt(dist2);
        const repel = 1800 / dist2;
        fx += (dx / dist) * repel;
        fy += (dy / dist) * repel;
      }
      // Pull toward school centroid
      const gid = n.schoolId;
      const group = schoolGroups.get(gid) || [];
      let cx = 0, cy = 0;
      for (const gn of group) {
        const gp = positioned.get(gn.id);
        cx += gp.x; cy += gp.y;
      }
      if (group.length) { cx /= group.length; cy /= group.length; }
      fx += (cx - p.x) * 0.008;
      fy += (cy - p.y) * 0.008;
      p.x = Math.max(36, Math.min(WIDTH - 36, p.x + fx));
      p.y = Math.max(36, Math.min(HEIGHT - 36, p.y + fy));
    }
  }

  return nodes.map((n) => ({ ...n, ...positioned.get(n.id) }));
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function statusToOpacity(status) {
  if (status === 'Proven') return 1;
  if (status === 'New') return 0.85;
  return 0.7;
}

export default function SpellGraph({ schools, onSpellClick }) {
  const { t } = useLanguage();
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const svgRef = useRef(null);

  const graph = useMemo(() => buildSpellGraph(), []);
  const positioned = useMemo(() => layoutNodes(graph.nodes, graph.edges), [graph]);

  const posBySkill = useMemo(() => {
    const m = new Map();
    for (const p of positioned) m.set(p.id, p);
    return m;
  }, [positioned]);

  const visibleEdges = useMemo(() => {
    if (!hover && !selected) return graph.edges;
    const focus = hover || selected;
    return graph.edges.filter((e) => e.source === focus || e.target === focus);
  }, [graph.edges, hover, selected]);

  const connectedSkills = useMemo(() => {
    const focus = hover || selected;
    if (!focus) return null;
    const set = new Set([focus]);
    for (const e of graph.edges) {
      if (e.source === focus) set.add(e.target);
      if (e.target === focus) set.add(e.source);
    }
    return set;
  }, [graph.edges, hover, selected]);

  const schoolColor = (schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    if (!school) return '#a89878';
    return schoolColors[schoolId] || '#a89878';
  };

  const schoolColors = {
    debugging: '#c97a4a',
    reasoning: '#9a7ac9',
    process: '#c9a84c',
    'code-review': '#4a9ac9',
    architecture: '#6ac97a',
    discovery: '#c94a8a',
    documentation: '#8a8a4a',
    planning: '#4a8a8a',
    learning: '#c98a4a',
    'anti-hallucination': '#c94a4a',
    'software-dev': '#4a4a8a',
    'multi-agent': '#8a4a8a',
    risk: '#7a4a4a',
    'cognitive-load': '#4a7a4a',
    testing: '#4a4a4a',
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--graph-focus', hover || selected || '');
  }, [hover, selected]);

  return (
    <div className="graph-section active" id="school-graph">
      <div className="graph-header">
        <span className="graph-sigil" aria-hidden="true">🕸</span>
        <h2>Spell Web</h2>
        <p className="graph-sub">
          The grimoire as a graph — spells are nodes, synergies are edges. Hover a node to
          highlight its connections; click to open.
        </p>
      </div>

      <div className="graph-legend">
        {schools.map((s) => (
          <span key={s.id} className="graph-legend-item">
            <span className="graph-legend-dot" style={{ background: schoolColor(s.id) }} aria-hidden="true" />
            <span className="graph-legend-symbol" aria-hidden="true">{s.symbol}</span>
            <span className="graph-legend-label">{s.real}</span>
          </span>
        ))}
      </div>

      <div className="graph-canvas-wrap">
        <svg
          ref={svgRef}
          className="graph-svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Spell relationship graph"
        >
          <defs>
            <radialGradient id="bgGradient" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#1a1410" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#0a0805" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#bgGradient)" />

          {visibleEdges.map((e, i) => {
            const a = posBySkill.get(e.source);
            const b = posBySkill.get(e.target);
            if (!a || !b) return null;
            const focus = hover || selected;
            const dim = focus && e.source !== focus && e.target !== focus;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
            const curve = Math.min(60, e.weight * 8 + 8);
            const nx = -dy / dist;
            const ny = dx / dist;
            const cx = mx + nx * curve * 0.25;
            const cy = my + ny * curve * 0.25;
            return (
              <path
                key={`${e.source}-${e.target}-${i}`}
                d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
                fill="none"
                stroke={dim ? 'rgba(168,152,120,0.08)' : 'rgba(212,175,55,0.35)'}
                strokeWidth={dim ? 0.5 : 1 + e.weight * 0.6}
                opacity={dim ? 0.4 : 1}
              />
            );
          })}

          {positioned.map((n) => {
            const dim = connectedSkills && !connectedSkills.has(n.id);
            const isFocus = n.id === hover || n.id === selected;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                className={`graph-node${dim ? ' dim' : ''}${isFocus ? ' focus' : ''}`}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  setSelected(n.id === selected ? null : n.id);
                  if (n.id !== selected) onSpellClick?.(n.spell || n, n._school);
                }}
                role="button"
                tabIndex={0}
                aria-label={n.label}
              >
                <circle
                  r={isFocus ? 9 : 6 + Math.min(6, n.comboCount * 0.8)}
                  fill={schoolColor(n.schoolId)}
                  stroke={isFocus ? '#f0e4cc' : 'rgba(20,14,8,0.8)'}
                  strokeWidth={isFocus ? 2 : 1}
                  opacity={statusToOpacity(n.tier)}
                />
                <text
                  x={11}
                  y={4}
                  fontSize={isFocus ? 13 : 11}
                  fill={isFocus ? '#f0e4cc' : '#d8ccb5'}
                  fontFamily="Cinzel, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>

        {(hover || selected) ? (
          <div className="graph-tooltip">
            {(() => {
              const n = positioned.find((p) => p.id === (hover || selected));
              if (!n) return null;
              const conn = graph.edges.filter((e) => e.source === n.id || e.target === n.id);
              return (
                <>
                  <div className="graph-tooltip-name">{n.label}</div>
                  <div className="graph-tooltip-school">{n.schoolName} · {n.tier}</div>
                  <div className="graph-tooltip-count">{conn.length} connection{conn.length !== 1 ? 's' : ''}</div>
                </>
              );
            })()}
          </div>
        ) : null}
      </div>

      <div className="graph-footnote">
        {graph.nodes.length} nodes · {graph.edges.length} synergy edges ·
        {' '}{positioned.length === graph.nodes.length ? 'layout converged' : 'partial layout'}
      </div>
    </div>
  );
}
