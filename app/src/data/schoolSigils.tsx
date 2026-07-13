import type { JSX } from 'react';

const baseProps = {
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  pathLength: 1,
  className: 'lidless-eye__sigil-stroke',
};

function P({ d, delay = 0 }: { d: string; delay?: number }) {
  return <path d={d} {...baseProps} style={{ transitionDelay: `${delay}s` }} />;
}
function L({ x1, y1, x2, y2, delay = 0 }: { x1: number; y1: number; x2: number; y2: number; delay?: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} {...baseProps} style={{ transitionDelay: `${delay}s` }} />
  );
}
function C({ cx, cy, r, delay = 0, filled = false }: { cx: number; cy: number; r: number; delay?: number; filled?: boolean }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.4}
      pathLength={1}
      className="lidless-eye__sigil-stroke"
      style={{ transitionDelay: `${delay}s` }}
    />
  );
}

function DebuggingSigil() {
  return (
    <>
      <P d="M 4 4 L 20 4 L 12 20 Z" delay={0} />
      <C cx={12} cy={10} r={3.2} delay={0.14} />
    </>
  );
}

function ReasoningSigil() {
  return (
    <>
      <P d="M 4 20 L 20 20 L 12 4 Z" delay={0} />
      <C cx={12} cy={14} r={3.5} delay={0.12} />
      <C cx={12} cy={14} r={1} filled delay={0.24} />
    </>
  );
}

function ProcessSigil() {
  return (
    <>
      <P d="M 17 6.5 A 8 8 0 1 0 19 10" delay={0} />
      <P d="M 16 5.5 L 19 4 L 19 8 Z" delay={0.14} />
      <C cx={17.5} cy={6.5} r={0.6} filled delay={0.28} />
    </>
  );
}

function CodeReviewSigil() {
  return (
    <>
      <P d="M 12 3 L 21 12 L 12 21 L 3 12 Z" delay={0} />
      <L x1={5} y1={12} x2={19} y2={12} delay={0.14} />
    </>
  );
}

function ArchitectureSigil() {
  return (
    <>
      <P d="M 3 3 L 21 3 L 21 21 L 3 21 Z" delay={0} />
      <P d="M 7 7 L 17 7 L 17 17 L 7 17 Z" delay={0.12} />
      <C cx={12} cy={12} r={1.3} filled delay={0.24} />
    </>
  );
}

function DiscoverySigil() {
  const pts = [
    [12, 2],
    [14.3, 7.7],
    [19.8, 7.5],
    [15.8, 11.5],
    [17.7, 17.5],
    [12, 14.5],
    [6.3, 17.5],
    [8.2, 11.5],
    [4.2, 7.5],
    [9.7, 7.7],
    [12, 2],
    [14.3, 7.7],
    [19.8, 7.5],
    [15.8, 11.5],
    [17.7, 17.5],
    [12, 14.5],
    [6.3, 17.5],
    [8.2, 11.5],
    [4.2, 7.5],
    [9.7, 7.7],
  ];
  const seq = [0, 2, 4, 6, 1, 3, 5];
  const points = seq.map((i) => pts[i].join(',')).join(' ');
  return <P d={`M ${points.split(' ').slice(0, 7).join(' L ')} Z`} delay={0} />;
}

function DocumentationSigil() {
  return (
    <>
      <P d="M 4 6 Q 8 4 12 6 Q 16 4 20 6 L 20 18 Q 16 16 12 18 Q 8 16 4 18 Z" delay={0} />
      <L x1={12} y1={6} x2={12} y2={18} delay={0.12} />
      <L x1={6} y1={10} x2={10} y2={10.5} delay={0.22} />
      <L x1={6} y1={13} x2={10} y2={13.5} delay={0.3} />
      <L x1={14} y1={10.5} x2={18} y2={10} delay={0.38} />
      <L x1={14} y1={13.5} x2={18} y2={13} delay={0.46} />
    </>
  );
}

function PlanningSigil() {
  return (
    <>
      <P d="M 4 20 L 20 20 L 12 4 Z" delay={0} />
      <L x1={5} y1={14} x2={19} y2={14} delay={0.14} />
    </>
  );
}

function LearningSigil() {
  return (
    <>
      <P d="M 4 20 L 20 20 L 12 4 Z" delay={0} />
      <L x1={6} y1={18} x2={18} y2={6} delay={0.14} />
    </>
  );
}

function AntiHallucinationSigil() {
  const pts = [
    [20.3, 8.6],
    [15.4, 3.7],
    [8.6, 3.7],
    [3.7, 8.6],
    [3.7, 15.4],
    [8.6, 20.3],
    [15.4, 20.3],
    [20.3, 15.4],
  ];
  return (
    <>
      <P d={`M ${pts.map((p) => p.join(',')).join(' L ')} Z`} delay={0} />
      <C cx={12} cy={12} r={1.6} filled delay={0.14} />
    </>
  );
}

function SoftwareDevSigil() {
  return (
    <>
      <L x1={5} y1={19} x2={19} y2={5} delay={0} />
      <L x1={17} y1={7} x2={21} y2={3} delay={0.1} />
      <L x1={19} y1={5} x2={21} y2={7} delay={0.1} />
      <L x1={19} y1={19} x2={5} y2={5} delay={0.2} />
      <L x1={3} y1={7} x2={7} y2={3} delay={0.3} />
    </>
  );
}

function MultiAgentSigil() {
  return (
    <>
      <C cx={9} cy={9} r={5} delay={0} />
      <C cx={15} cy={9} r={5} delay={0.12} />
      <C cx={12} cy={15} r={5} delay={0.24} />
    </>
  );
}

function RiskSigil() {
  const pts = [
    [12, 2],
    [14.1, 8.1],
    [21.5, 9.5],
    [15.8, 13.7],
    [17.9, 21.5],
    [12, 17],
    [6.1, 21.5],
    [8.2, 13.7],
    [2.5, 9.5],
    [9.9, 8.1],
  ];
  return <P d={`M ${pts.map((p) => p.join(',')).join(' L ')} Z`} delay={0} />;
}

function CognitiveLoadSigil() {
  return (
    <>
      <P d="M 4 18 L 20 18 L 12 6 Z" delay={0} />
      <P d="M 4 6 L 20 6 L 12 18 Z" delay={0.14} />
    </>
  );
}

function TestingSigil() {
  return (
    <>
      <L x1={12} y1={3} x2={12} y2={18} delay={0} />
      <L x1={4} y1={8} x2={20} y2={8} delay={0.1} />
      <L x1={9} y1={18} x2={15} y2={18} delay={0.18} />
      <P d="M 4 12 Q 6 15 8 12" delay={0.26} />
      <L x1={5} y1={8} x2={4.5} y2={12} delay={0.26} />
      <L x1={7} y1={8} x2={7.5} y2={12} delay={0.26} />
      <P d="M 16 12 Q 18 15 20 12" delay={0.36} />
      <L x1={17} y1={8} x2={16.5} y2={12} delay={0.36} />
      <L x1={19} y1={8} x2={19.5} y2={12} delay={0.36} />
    </>
  );
}

const schoolSigils: Record<string, () => JSX.Element> = {
  debugging: DebuggingSigil,
  reasoning: ReasoningSigil,
  process: ProcessSigil,
  'code-review': CodeReviewSigil,
  architecture: ArchitectureSigil,
  discovery: DiscoverySigil,
  documentation: DocumentationSigil,
  planning: PlanningSigil,
  learning: LearningSigil,
  'anti-hallucination': AntiHallucinationSigil,
  'software-dev': SoftwareDevSigil,
  'multi-agent': MultiAgentSigil,
  risk: RiskSigil,
  'cognitive-load': CognitiveLoadSigil,
  testing: TestingSigil,
};

export function getSchoolSigil(schoolId: string): () => JSX.Element {
  return schoolSigils[schoolId] || DebuggingSigil;
}
