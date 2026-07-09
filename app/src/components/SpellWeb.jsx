import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import SchoolSigil from './SchoolSigil.tsx';
import { cn } from '../utils/cn.js';

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
    <div className="py-1">
      <div className="panel p-4 mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sickly" aria-hidden="true">
              <svg viewBox="0 0 80 80" className="h-12 w-12">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(138,154,106,0.18)" strokeWidth="0.8" />
                <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(138,154,106,0.12)" strokeWidth="0.6" strokeDasharray="3 4" />
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
            <div>
              <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide">The Spell Web</h2>
              <p className="text-text-secondary text-[0.82rem] mt-1">
                The grimoire as a living web — schools as branches, spells as leaves, synergies as tentacle connections.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-['Cinzel'] text-[0.9rem] font-bold text-text-primary">{graph.schools.length}</div>
              <div className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted">Schools</div>
            </div>
            <div className="text-center">
              <div className="font-['Cinzel'] text-[0.9rem] font-bold text-text-primary">{graph.spellNodes.length}</div>
              <div className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted">Spells</div>
            </div>
            <div className="text-center">
              <div className="font-['Cinzel'] text-[0.9rem] font-bold text-text-primary">{graph.comboEdges.length}</div>
              <div className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted">Connections</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="relative">
          <svg
            ref={svgRef}
            className="w-full h-auto"
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

            {visibleEdges.map((e) => {
              const a = spellBySkill.get(e.source);
              const b = spellBySkill.get(e.target);
              if (!a || !b) return null;

              const focus = hover || selected;
              const dim = focus && e.source !== focus && e.target !== focus;

              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const nx = -dy / dist;
              const ny = dx / dist;
              const curve = Math.min(40, e.weight * 6 + 8);
              const cx = midX + nx * curve * 0.25;
              const cy = midY + ny * curve * 0.25;

              return (
                <g key={`${e.source}-${e.target}`}>
                  <path
                    d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
                    fill="none"
                    stroke={dim ? 'rgba(168,152,120,0.08)' : 'rgba(212,175,55,0.35)'}
                    strokeWidth={dim ? 0.5 : 1 + e.weight * 0.6}
                    opacity={dim ? 0.4 : 1}
                    filter={!dim ? 'url(#tentacleGlow)' : undefined}
                  />
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

            {positionedSchools.map((school) => (
              <g key={school.id}>
                <path
                  d={`M ${WIDTH / 2} ${HEIGHT / 2} Q ${(WIDTH / 2 + school.x) / 2 + (school.y - HEIGHT / 2) * 0.1} ${(HEIGHT / 2 + school.y) / 2 - (school.x - WIDTH / 2) * 0.1} ${school.x} ${school.y}`}
                  fill="none"
                  stroke="rgba(138,154,106,0.2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <g
                  transform={`translate(${school.x}, ${school.y})`}
                  className="cursor-pointer"
                  style={expandedSchool === school.id ? { filter: 'drop-shadow(0 0 8px rgba(138,154,106,0.3))' } : undefined}
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

            {positionedSpells.map((spell) => {
              const dim = connectedSkills && !connectedSkills.has(spell.id);
              const isFocus = spell.id === hover || spell.id === selected;
              const size = tierToSize(spell.tier);

              return (
                <g
                  key={spell.id}
                  transform={`translate(${spell.x}, ${spell.y})`}
                  className="cursor-pointer"
                  style={{ opacity: dim ? 0.4 : 1, filter: isFocus ? 'drop-shadow(0 0 6px rgba(240,216,120,0.4))' : undefined }}
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
                  <line
                    x1={0}
                    y1={0}
                    x2={spell.schoolX - spell.x}
                    y2={spell.schoolY - spell.y}
                    stroke={dim ? 'rgba(168,152,120,0.05)' : 'rgba(138,154,106,0.15)'}
                    strokeWidth={dim ? 0.3 : 0.8}
                    strokeDasharray="3,3"
                  />

                  <circle
                    r={isFocus ? size + 4 : size}
                    fill={dim ? 'rgba(20,15,10,0.6)' : 'rgba(20,15,10,0.9)'}
                    stroke={isFocus ? '#f0e4cc' : 'rgba(138,154,106,0.3)'}
                    strokeWidth={isFocus ? 2 : 1}
                    opacity={statusToOpacity(spell.tier)}
                  />

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

            <g transform={`translate(${WIDTH / 2}, ${HEIGHT / 2})`}>
              <circle r={24} fill="rgba(10,8,6,0.95)" stroke="rgba(138,154,106,0.3)" strokeWidth="1.5" />
              <ellipse rx={16} ry={10} fill="rgba(138,154,106,0.15)" />
              <circle r={6} fill="#020203" />
              <circle r={2} fill="rgba(196,184,152,0.4)" />
            </g>
          </svg>

          {(hover || selected) && (
            <div data-testid="spell-web-tooltip" className="absolute top-4 right-4 bg-[rgba(10,8,6,0.95)] border border-[rgba(138,154,106,0.3)] rounded-md p-3 min-w-[200px] pointer-events-none">
              {(() => {
                const n = positionedSpells.find(p => p.id === (hover || selected));
                if (!n) return null;
                const conn = graph.comboEdges.filter(e => e.source === n.id || e.target === n.id);
                return (
                  <>
                    <div className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wide text-text-primary">{n.label}</div>
                    <div className="text-text-muted text-[0.78rem]">{n.schoolName} · {n.tier}</div>
                    <div className="text-text-muted text-[0.78rem]">{conn.length} connection{conn.length !== 1 ? 's' : ''}</div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="panel p-3.5 mt-4">
        <div className="relative flex items-center gap-2 mb-2">
          <h3 className="section-title">Schools</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {positionedSchools.map(school => (
            <button
              key={school.id}
              className={cn('flex items-center gap-2 border rounded-sm px-2.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider transition-all duration-200', expandedSchool === school.id ? 'border-border-hover bg-surface-raised text-text-primary' : 'border-border bg-surface text-text-muted hover:border-border-hover')}
              onClick={() => handleSchoolClick(school.id)}
              type="button"
            >
              <span className="text-sickly"><SchoolSigil schoolId={school.id} size={16} /></span>
              <span>{school.label}</span>
              <span className="text-text-muted">{school.spellCount}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center text-text-muted text-[0.78rem]">
        Scroll to zoom · Click school branches to expand · Hover spells for connections
      </div>
    </div>
  );
}
