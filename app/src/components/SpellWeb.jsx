import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import SchoolSigil from './SchoolSigil.tsx';

const WIDTH = 1200;
const HEIGHT = 800;
const SCHOOL_RADIUS = 280;
const SPELL_RADIUS = 120;

function layoutTree(schools) {
  const schoolCount = schools.length;
  const positionedSchools = schools.map((school, i) => {
    const angle = (i / schoolCount) * Math.PI * 2 - Math.PI / 2;
    const x = WIDTH / 2 + Math.cos(angle) * SCHOOL_RADIUS;
    const y = HEIGHT / 2 + Math.sin(angle) * SCHOOL_RADIUS;
    return { ...school, x, y, angle };
  });

  const positionedSpells = [];
  for (const school of positionedSchools) {
    const spellCount = school.children.length;
    const baseAngle = school.angle;
    const spread = Math.min(Math.PI * 0.8, spellCount * 0.15);
    
    school.children.forEach((spell, i) => {
      const spellAngle = baseAngle + (i - (spellCount - 1) / 2) * (spread / Math.max(1, spellCount - 1));
      const distance = SCHOOL_RADIUS + SPELL_RADIUS + (i % 2) * 20;
      const x = WIDTH / 2 + Math.cos(spellAngle) * distance;
      const y = HEIGHT / 2 + Math.sin(spellAngle) * distance;
      
      positionedSpells.push({
        ...spell,
        x: Math.max(60, Math.min(WIDTH - 60, x)),
        y: Math.max(60, Math.min(HEIGHT - 60, y)),
        schoolX: school.x,
        schoolY: school.y,
      });
    });
  }

  return { positionedSchools, positionedSpells };
}

function statusToOpacity(status) {
  if (status === 'Proven') return 1;
  if (status === 'New') return 0.85;
  return 0.7;
}

function tierToSize(tier) {
  switch (tier) {
    case 'archmage': return 12;
    case 'master': return 10;
    case 'adept': return 8;
    case 'apprentice': return 6;
    default: return 5;
  }
}

export default function SpellWeb({ onSpellClick }) {
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: WIDTH, height: HEIGHT });

  const graph = useMemo(() => grimoireIndex.buildSpellWeb(), []);
  const { positionedSchools, positionedSpells } = useMemo(
    () => layoutTree(graph.schools),
    [graph]
  );

  const spellBySkill = useMemo(() => {
    const m = new Map();
    for (const s of positionedSpells) m.set(s.id, s);
    return m;
  }, [positionedSpells]);

  const visibleEdges = useMemo(() => {
    if (!hover && !selected) return graph.comboEdges;
    const focus = hover || selected;
    return graph.comboEdges.filter((e) => e.source === focus || e.target === focus);
  }, [graph.comboEdges, hover, selected]);

  const connectedSkills = useMemo(() => {
    const focus = hover || selected;
    if (!focus) return null;
    const set = new Set([focus]);
    for (const e of graph.comboEdges) {
      if (e.source === focus) set.add(e.target);
      if (e.target === focus) set.add(e.source);
    }
    return set;
  }, [graph.comboEdges, hover, selected]);

  const handleSchoolClick = useCallback((schoolId) => {
    setExpandedSchool(prev => prev === schoolId ? null : schoolId);
  }, []);

  const handleSpellClick = useCallback((spell) => {
    const entry = grimoireIndex.resolveBySkill(spell.id);
    if (entry) {
      onSpellClick?.(entry.spell, entry.school);
    }
  }, [onSpellClick]);

  // Zoom/pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox(prev => {
      const newWidth = Math.max(400, Math.min(WIDTH * 2, prev.width * scale));
      const newHeight = Math.max(300, Math.min(HEIGHT * 2, prev.height * scale));
      return {
        x: prev.x - (newWidth - prev.width) / 2,
        y: prev.y - (newHeight - prev.height) / 2,
        width: newWidth,
        height: newHeight,
      };
    });
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div className="spell-web">
      <div className="spell-web__header">
        <div className="spell-web__crest" aria-hidden="true">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(138,154,106,0.18)" strokeWidth="0.8" />
            <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(138,154,106,0.12)" strokeWidth="0.6" strokeDasharray="3 4" />
            {/* Web pattern */}
            {[0, 45, 90, 135].map(angle => (
              <line
                key={angle}
                x1={40 + Math.cos(angle * Math.PI / 180) * 10}
                y1={40 + Math.sin(angle * Math.PI / 180) * 10}
                x2={40 + Math.cos(angle * Math.PI / 180) * 35}
                y2={40 + Math.sin(angle * Math.PI / 180) * 35}
                stroke="rgba(138,154,106,0.2)"
                strokeWidth="0.5"
              />
            ))}
            {[18, 26, 34].map(r => (
              <circle key={r} cx="40" cy="40" r={r} fill="none" stroke="rgba(138,154,106,0.1)" strokeWidth="0.4" />
            ))}
          </svg>
        </div>
        <div className="spell-web__heading">
          <h2 className="spell-web__title">The Spell Web</h2>
          <p className="spell-web__sub">
            The grimoire as a living web — schools as branches, spells as leaves, synergies as tentacle connections.
          </p>
        </div>
        <div className="spell-web__stats">
          <div className="spell-web__stat">
            <span className="spell-web__stat-num">{graph.schools.length}</span>
            <span className="spell-web__stat-label">Schools</span>
          </div>
          <div className="spell-web__stat">
            <span className="spell-web__stat-num">{graph.spellNodes.length}</span>
            <span className="spell-web__stat-label">Spells</span>
          </div>
          <div className="spell-web__stat">
            <span className="spell-web__stat-num">{graph.comboEdges.length}</span>
            <span className="spell-web__stat-label">Connections</span>
          </div>
        </div>
      </div>

      <div className="spell-web__canvas-wrap">
        <svg
          ref={svgRef}
          className="spell-web__svg"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          role="img"
          aria-label="Spell relationship web"
        >
          <defs>
            <radialGradient id="webBgGradient" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#1a1410" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#0a0805" stopOpacity="0.6" />
            </radialGradient>
            <filter id="tentacleGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#webBgGradient)" />

          {/* Combo edges (tentacle connections) */}
          {visibleEdges.map((e, i) => {
            const a = spellBySkill.get(e.source);
            const b = spellBySkill.get(e.target);
            if (!a || !b) return null;
            
            const focus = hover || selected;
            const dim = focus && e.source !== focus && e.target !== focus;
            
            // Calculate curved path with tentacle effect
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            
            // Perpendicular offset for curve
            const nx = -dy / dist;
            const ny = dx / dist;
            const curve = Math.min(40, e.weight * 6 + 8);
            const cx = midX + nx * curve * 0.25;
            const cy = midY + ny * curve * 0.25;
            
            return (
              <g key={`${e.source}-${e.target}-${i}`}>
                {/* Main tentacle */}
                <path
                  d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
                  fill="none"
                  stroke={dim ? 'rgba(168,152,120,0.08)' : 'rgba(212,175,55,0.35)'}
                  strokeWidth={dim ? 0.5 : 1 + e.weight * 0.6}
                  opacity={dim ? 0.4 : 1}
                  filter={!dim ? 'url(#tentacleGlow)' : undefined}
                />
                {/* Sucker nodes along the tentacle */}
                {!dim && e.weight > 1 && (
                  <>
                    <circle
                      cx={a.x + (b.x - a.x) * 0.3}
                      cy={a.y + (b.y - a.y) * 0.3}
                      r={2 + e.weight * 0.3}
                      fill="rgba(180,200,130,0.4)"
                      stroke="rgba(8,8,6,0.9)"
                      strokeWidth="0.6"
                    />
                    <circle
                      cx={a.x + (b.x - a.x) * 0.7}
                      cy={a.y + (b.y - a.y) * 0.7}
                      r={1.5 + e.weight * 0.2}
                      fill="rgba(180,200,130,0.4)"
                      stroke="rgba(8,8,6,0.9)"
                      strokeWidth="0.6"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* School branches (tentacle arms from center) */}
          {positionedSchools.map((school) => (
            <g key={school.id}>
              {/* Branch from center to school */}
              <path
                d={`M ${WIDTH / 2} ${HEIGHT / 2} Q ${(WIDTH / 2 + school.x) / 2 + (school.y - HEIGHT / 2) * 0.1} ${(HEIGHT / 2 + school.y) / 2 - (school.x - WIDTH / 2) * 0.1} ${school.x} ${school.y}`}
                fill="none"
                stroke="rgba(138,154,106,0.2)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* School node */}
              <g
                transform={`translate(${school.x}, ${school.y})`}
                className={`spell-web__school${expandedSchool === school.id ? ' spell-web__school--expanded' : ''}`}
                onClick={() => handleSchoolClick(school.id)}
                role="button"
                tabIndex={0}
                aria-label={`${school.label} school`}
              >
                <circle
                  r={18}
                  fill="rgba(20,15,10,0.9)"
                  stroke="rgba(138,154,106,0.4)"
                  strokeWidth="1.5"
                />
                <foreignObject x={-12} y={-12} width={24} height={24}>
                  <SchoolSigil schoolId={school.id} size={24} />
                </foreignObject>
                <text
                  y={28}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#d8ccb5"
                  fontFamily="Cinzel, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {school.label}
                </text>
                <text
                  y={40}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#8a8074"
                  fontFamily="Cormorant Garamond, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {school.spellCount} spells
                </text>
              </g>
            </g>
          ))}

          {/* Spell leaves */}
          {positionedSpells.map((spell) => {
            const dim = connectedSkills && !connectedSkills.has(spell.id);
            const isFocus = spell.id === hover || spell.id === selected;
            const size = tierToSize(spell.tier);
            
            return (
              <g
                key={spell.id}
                transform={`translate(${spell.x}, ${spell.y})`}
                className={`spell-web__spell${dim ? ' spell-web__spell--dim' : ''}${isFocus ? ' spell-web__spell--focus' : ''}`}
                onMouseEnter={() => setHover(spell.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  setSelected(spell.id === selected ? null : spell.id);
                  handleSpellClick(spell);
                }}
                role="button"
                tabIndex={0}
                aria-label={spell.label}
              >
                {/* Connection line to school */}
                <line
                  x1={0}
                  y1={0}
                  x2={spell.schoolX - spell.x}
                  y2={spell.schoolY - spell.y}
                  stroke={dim ? 'rgba(168,152,120,0.05)' : 'rgba(138,154,106,0.15)'}
                  strokeWidth={dim ? 0.3 : 0.8}
                  strokeDasharray="3,3"
                />
                
                {/* Spell node */}
                <circle
                  r={isFocus ? size + 4 : size}
                  fill={dim ? 'rgba(20,15,10,0.6)' : 'rgba(20,15,10,0.9)'}
                  stroke={isFocus ? '#f0e4cc' : 'rgba(138,154,106,0.3)'}
                  strokeWidth={isFocus ? 2 : 1}
                  opacity={statusToOpacity(spell.tier)}
                />
                
                {/* Spell label */}
                <text
                  x={size + 6}
                  y={4}
                  fontSize={isFocus ? 12 : 10}
                  fill={isFocus ? '#f0e4cc' : '#d8ccb5'}
                  fontFamily="Cinzel, serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {spell.label}
                </text>
              </g>
            );
          })}

          {/* Center eye (source of all branches) */}
          <g transform={`translate(${WIDTH / 2}, ${HEIGHT / 2})`}>
            <circle r={24} fill="rgba(10,8,6,0.95)" stroke="rgba(138,154,106,0.3)" strokeWidth="1.5" />
            <ellipse rx={16} ry={10} fill="rgba(138,154,106,0.15)" />
            <circle r={6} fill="#020203" />
            <circle r={2} fill="rgba(196,184,152,0.4)" />
          </g>
        </svg>

        {/* Tooltip */}
        {(hover || selected) && (
          <div className="spell-web__tooltip">
            {(() => {
              const n = positionedSpells.find(p => p.id === (hover || selected));
              if (!n) return null;
              const conn = graph.comboEdges.filter(e => e.source === n.id || e.target === n.id);
              return (
                <>
                  <div className="spell-web__tooltip-name">{n.label}</div>
                  <div className="spell-web__tooltip-school">{n.schoolName} · {n.tier}</div>
                  <div className="spell-web__tooltip-count">{conn.length} connection{conn.length !== 1 ? 's' : ''}</div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      <div className="spell-web__legend">
        <h3>Schools</h3>
        <div className="spell-web__legend-items">
          {positionedSchools.map(school => (
            <button
              key={school.id}
              className={`spell-web__legend-item${expandedSchool === school.id ? ' spell-web__legend-item--active' : ''}`}
              onClick={() => handleSchoolClick(school.id)}
              type="button"
            >
              <span className="spell-web__legend-sigil"><SchoolSigil schoolId={school.id} size={16} /></span>
              <span className="spell-web__legend-label">{school.label}</span>
              <span className="spell-web__legend-count">{school.spellCount}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="spell-web__footer">
        <p>Scroll to zoom · Click school branches to expand · Hover spells for connections</p>
      </div>
    </div>
  );
}
