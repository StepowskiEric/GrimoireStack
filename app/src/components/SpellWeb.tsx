import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.ts';
import type { SpellWebSpellNode, SpellWebSchoolNode } from '../data/spellWeb.ts';
import { cn } from '../utils/cn.ts';
import SchoolSigil from './SchoolSigil.tsx';

interface PositionedSpell extends SpellWebSpellNode {
  schoolX: number;
  schoolY: number;
}

const WIDTH = 1400;
const HEIGHT = 900;
const SCHOOL_RADIUS = 320;
const SPELL_RADIUS = 110;
const SPELL_FAN_SPREAD = Math.PI * 0.7;
const SPELL_FAN_GAP = 0.18;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function layoutTree(schools: SpellWebSchoolNode[]) {
  const schoolCount = schools.length;
  const positionedSchools = schools.map((school, i) => {
    const angle = (i / schoolCount) * Math.PI * 2 - Math.PI / 2;
    const x = WIDTH / 2 + Math.cos(angle) * SCHOOL_RADIUS;
    const y = HEIGHT / 2 + Math.sin(angle) * SCHOOL_RADIUS;
    return { ...school, x, y, angle };
  });

  const positionedSpells: PositionedSpell[] = [];
  for (const school of positionedSchools) {
    const spellCount = school.children.length;
    const baseAngle = school.angle;
    const spread = Math.min(SPELL_FAN_SPREAD, spellCount * SPELL_FAN_GAP);

    school.children.forEach((spell, i) => {
      const spellAngle =
        spellCount === 1
          ? baseAngle
          : baseAngle + (i - (spellCount - 1) / 2) * (spread / Math.max(1, spellCount - 1));
      const distance = SCHOOL_RADIUS + SPELL_RADIUS + (i % 2) * 24;
      const x = clamp(WIDTH / 2 + Math.cos(spellAngle) * distance, 70, WIDTH - 70);
      const y = clamp(HEIGHT / 2 + Math.sin(spellAngle) * distance, 70, HEIGHT - 70);

      positionedSpells.push({
        ...spell,
        x,
        y,
        schoolX: school.x,
        schoolY: school.y,
      });
    });
  }

  return { positionedSchools, positionedSpells };
}

function statusToOpacity(status: string) {
  if (status === 'Proven') return 1;
  if (status === 'New') return 0.95;
  return 0.92;
}

function tierToSize(tier: string) {
  switch (tier) {
    case 'archmage':
      return 30;
    case 'master':
      return 28;
    case 'adept':
      return 26;
    case 'apprentice':
      return 24;
    default:
      return 22;
  }
}

export default function SpellWeb({ onSpellClick, fullscreen }: { onSpellClick?: any; fullscreen?: any }) {
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  const [showSchools, setShowSchools] = useState(false);
  const [viewBox, setViewBox] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: WIDTH, height: HEIGHT });
  const svgRef = useRef<SVGSVGElement>(null);

  const graph = useMemo(() => grimoireIndex.buildSpellWeb(), []);
  const { positionedSchools, positionedSpells } = useMemo(() => layoutTree(graph.schools), [graph]);

  const spellBySkill = useMemo(() => {
    const m = new Map<string, SpellWebSpellNode>();
    for (const s of positionedSpells) m.set(s.id, s);
    return m;
  }, [positionedSpells]);

  const visibleSpells = useMemo(() => {
    if (!expandedSchool) return [];
    return positionedSpells.filter((s) => s.schoolId === expandedSchool);
  }, [positionedSpells, expandedSchool]);

  const visibleSpellIds = useMemo(() => new Set(visibleSpells.map((s) => s.id)), [visibleSpells]);

  const visibleEdges = useMemo(() => {
    if (!(hover || selected)) {
      return graph.comboEdges.filter(
        (e) => visibleSpellIds.has(e.source) && visibleSpellIds.has(e.target),
      );
    }
    const focus = hover || selected;
    return graph.comboEdges.filter((e) => e.source === focus || e.target === focus);
  }, [graph.comboEdges, hover, selected, visibleSpellIds]);

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

  const handleSchoolClick = useCallback((schoolId: string) => {
    setExpandedSchool((prev) => (prev === schoolId ? null : schoolId));
  }, []);

  const handleSpellClick = useCallback(
    (spell) => {
      const entry = grimoireIndex.resolveBySkill(spell.id);
      if (entry) {
        onSpellClick?.(entry.spell, entry.school);
      }
    },
    [onSpellClick],
  );

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox((prev) => {
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
                {[0, 45, 90, 135].map((angle) => (
                  <line
                    key={angle}
                    x1={40 + Math.cos((angle * Math.PI) / 180) * 10}
                    y1={40 + Math.sin((angle * Math.PI) / 180) * 10}
                    x2={40 + Math.cos((angle * Math.PI) / 180) * 35}
                    y2={40 + Math.sin((angle * Math.PI) / 180) * 35}
                    stroke="rgba(138,154,106,0.2)"
                    strokeWidth="0.5"
                  />
                ))}
                {[18, 26, 34].map((r) => (
                  <circle
                    key={r}
                    cx={40}
                    cy={40}
                    r={r}
                    fill="none"
                    stroke="rgba(138,154,106,0.1)"
                    strokeWidth="0.4"
                  />
                ))}
              </svg>
            </div>
            <div>
              <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide">
                The Spell Web
              </h2>
              <p className="text-text-secondary text-[0.82rem] mt-1">
                The grimoire as a living web: schools as branches, spells as leaves, synergies as
                tentacle connections.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-['Cinzel'] text-[0.9rem] font-bold text-text-primary">
                {graph.schools.length}
              </div>
              <div className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted">
                Schools
              </div>
            </div>
            <div className="text-center">
              <div className="font-['Cinzel'] text-[0.9rem] font-bold text-text-primary">
                {graph.spellNodes.length}
              </div>
              <div className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted">
                Spells
              </div>
            </div>
            <div className="text-center">
              <div className="font-['Cinzel'] text-[0.9rem] font-bold text-text-primary">
                {graph.comboEdges.length}
              </div>
              <div className="font-['Cinzel'] text-[0.6rem] uppercase tracking-widest text-text-muted">
                Connections
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="panel overflow-hidden"
        style={{ height: fullscreen ? '100%' : 'min(70vh, 700px)' }}
      >
        <div className="relative w-full h-full">
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Spell relationship web"
          >
            <defs>
              <radialGradient id="webBgGradient" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#1a1410" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#0a0805" stopOpacity="0.6" />
              </radialGradient>
              <filter id="tentacleGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect
              x={viewBox.x}
              y={viewBox.y}
              width={viewBox.width}
              height={viewBox.height}
              fill="url(#webBgGradient)"
            />

            {visibleEdges.map((e) => {
              const a = spellBySkill.get(e.source);
              const b = spellBySkill.get(e.target);
              if (!(a && b)) return null;

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
                    stroke={dim ? 'rgba(255,220,140,0.75)' : 'rgba(255,220,120,1)'}
                    strokeWidth={dim ? 2.4 : 4 + e.weight}
                    opacity={dim ? 0.95 : 1}
                    filter={!dim ? 'url(#tentacleGlow)' : undefined}
                  />
                  {!dim && e.weight > 1 && (
                    <>
                      <circle
                        cx={a.x + (b.x - a.x) * 0.3}
                        cy={a.y + (b.y - a.y) * 0.3}
                        r={3.2 + e.weight * 0.5}
                        fill="rgba(255,245,210,0.98)"
                        stroke="rgba(8,8,6,0.95)"
                        strokeWidth="0.8"
                      />
                      <circle
                        cx={a.x + (b.x - a.x) * 0.7}
                        cy={a.y + (b.y - a.y) * 0.7}
                        r={2.8 + e.weight * 0.4}
                        fill="rgba(255,245,210,0.98)"
                        stroke="rgba(8,8,6,0.95)"
                        strokeWidth="0.8"
                      />
                    </>
                  )}
                </g>
              );
            })}
            {positionedSchools.map((school) => {
              const angle = Math.atan2(school.y - HEIGHT / 2, school.x - WIDTH / 2);
              const labelOffset = 72;
              const labelX = school.x + Math.cos(angle) * labelOffset;
              const labelY = school.y + Math.sin(angle) * labelOffset;
              const textAnchor =
                Math.abs(Math.cos(angle)) < 0.3 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
              const dx = textAnchor === 'start' ? 10 : textAnchor === 'end' ? -10 : 0;
              const dy = Math.sin(angle) > -0.3 ? 6 : -6;

              return (
                <g key={school.id}>
                  <path
                    d={`M ${WIDTH / 2} ${HEIGHT / 2} Q ${(WIDTH / 2 + school.x) / 2 + (school.y - HEIGHT / 2) * 0.1} ${(HEIGHT / 2 + school.y) / 2 - (school.x - WIDTH / 2) * 0.1} ${school.x} ${school.y}`}
                    fill="none"
                    stroke="rgba(220,235,180,0.95)"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                  <g
                    transform={`translate(${school.x}, ${school.y})`}
                    className="cursor-pointer"
                    style={
                      expandedSchool === school.id
                        ? { filter: 'drop-shadow(0 0 18px rgba(138,154,106,0.75))' }
                        : undefined
                    }
                    onClick={() => handleSchoolClick(school.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${school.label} school`}
                  >
                    <circle
                      r={30}
                      fill="rgba(12,10,8,0.95)"
                      stroke="rgba(255,245,225,0.95)"
                      strokeWidth="3"
                    />
                    <foreignObject x={-16} y={-16} width={32} height={32}>
                      <SchoolSigil schoolId={school.id} size={32} />
                    </foreignObject>
                  </g>
                  <rect
                    x={
                      textAnchor === 'start'
                        ? labelX + dx - 6
                        : textAnchor === 'end'
                          ? labelX + dx - school.label.length * 9.5 - 6
                          : labelX + dx - school.label.length * 4.75 - 6
                    }
                    y={labelY + dy - 18}
                    width={school.label.length * 9.5 + 12}
                    height={24}
                    rx="4"
                    fill="rgba(8,6,4,0.88)"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={labelX + dx}
                    y={labelY + dy + 1}
                    textAnchor={textAnchor}
                    fontSize={18}
                    fill="#fff8e8"
                    fontFamily="Cinzel, serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {school.label}
                  </text>
                  <rect
                    x={
                      textAnchor === 'start'
                        ? labelX + dx - 4
                        : textAnchor === 'end'
                          ? labelX + dx - (school.label.length + 8) * 5.8 - 4
                          : labelX + dx - (school.label.length + 8) * 2.9 - 4
                    }
                    y={labelY + dy + 4}
                    width={(school.label.length + 8) * 5.8 + 8}
                    height={16}
                    rx="3"
                    fill="rgba(8,6,4,0.78)"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={labelX + dx}
                    y={labelY + dy + 20}
                    textAnchor={textAnchor}
                    fontSize={12}
                    fill="#f0e6c8"
                    fontFamily="Cormorant Garamond, serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {school.spellCount} spells
                  </text>
                </g>
              );
            })}

            {visibleSpells.map((spell) => {
              const dim = connectedSkills && !connectedSkills.has(spell.id);
              const isFocus = spell.id === hover || spell.id === selected;
              const size = tierToSize(spell.tier);

              return (
                <g
                  key={spell.id}
                  transform={`translate(${spell.x}, ${spell.y})`}
                  className="cursor-pointer"
                  style={{
                    opacity: dim ? 0.95 : 1,
                    filter: isFocus
                      ? 'drop-shadow(0 0 14px rgba(240,216,120,0.9))'
                      : 'drop-shadow(0 0 5px rgba(0,0,0,0.85))',
                  }}
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
                    stroke={dim ? 'rgba(220,235,180,0.55)' : 'rgba(220,235,180,0.95)'}
                    strokeWidth={dim ? 1.2 : 2}
                    strokeDasharray="3,3"
                  />

                  <circle
                    r={isFocus ? size + 7 : size + 4}
                    fill={dim ? 'rgba(16,14,10,0.94)' : 'rgba(16,14,10,0.97)'}
                    stroke={isFocus ? '#fff8e8' : 'rgba(255,245,225,0.95)'}
                    strokeWidth={isFocus ? 3.2 : 2.2}
                    opacity={statusToOpacity(spell.tier)}
                    filter="url(#nodeGlow)"
                  />

                  <rect
                    x={size + 6}
                    y={-16}
                    width={Math.max(60, spell.label.length * 9)}
                    height={22}
                    rx="4"
                    fill="rgba(10,8,6,0.88)"
                    stroke="rgba(255,245,225,0.12)"
                    strokeWidth="1"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={size + 14}
                    y={5}
                    fontSize={isFocus ? 17 : 15}
                    fill={isFocus ? '#fff8e8' : '#fff8e8'}
                    fontFamily="Cinzel, serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {spell.label}
                  </text>
                </g>
              );
            })}
            <g transform={`translate(${WIDTH / 2}, ${HEIGHT / 2})`}>
              <circle
                r={36}
                fill="rgba(10,8,6,0.95)"
                stroke="rgba(255,245,225,0.85)"
                strokeWidth="3"
              />
              <ellipse rx={28} ry={16} fill="rgba(220,235,180,0.5)" />
              <circle r={12} fill="#020203" />
              <circle r={5} fill="rgba(240,230,200,0.95)" />
            </g>
          </svg>

          {(hover || selected) && (
            <div
              data-testid="spell-web-tooltip"
              className="absolute top-4 right-4 bg-[rgba(10,8,6,0.95)] border border-[rgba(138,154,106,0.3)] rounded-md p-3 min-w-[200px] pointer-events-none"
            >
              {(() => {
                const n = positionedSpells.find((p) => p.id === (hover || selected));
                if (!n) return null;
                const conn = graph.comboEdges.filter((e) => e.source === n.id || e.target === n.id);
                return (
                  <>
                    <div className="font-['Cinzel'] text-[0.68rem] font-semibold tracking-wide text-text-primary">
                      {n.label}
                    </div>
                    <div className="text-text-muted text-[0.78rem]">
                      {n.schoolName} · {n.tier}
                    </div>
                    <div className="text-text-muted text-[0.78rem]">
                      {conn.length} connection{conn.length !== 1 ? 's' : ''}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="panel p-3.5 mt-4">
        <button
          className="flex items-center justify-between w-full gap-2"
          onClick={() => setShowSchools((prev) => !prev)}
          type="button"
        >
          <h3 className="section-title mb-0">Schools</h3>
          <span
            className="text-text-muted text-[0.78rem] transition-transform duration-200"
            style={{ transform: showSchools ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </span>
        </button>
        {showSchools && (
          <div className="flex flex-wrap gap-2 mt-3">
            {positionedSchools.map((school) => (
              <button
                key={school.id}
                className={cn(
                  'flex items-center gap-2 border rounded-sm px-2.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider transition-all duration-200',
                  expandedSchool === school.id
                    ? 'border-border-hover bg-surface-raised text-text-primary'
                    : 'border-border bg-surface text-text-muted hover:border-border-hover',
                )}
                onClick={() => handleSchoolClick(school.id)}
                type="button"
              >
                <span className="text-sickly">
                  <SchoolSigil schoolId={school.id} size={16} />
                </span>
                <span>{school.label}</span>
                <span className="text-text-muted">{school.spellCount}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-text-muted text-[0.78rem]">
        Scroll to zoom · Click school branches to expand · Hover spells for connections
      </div>
    </div>
  );
}
