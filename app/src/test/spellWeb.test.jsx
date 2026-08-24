import { fireEvent, render, screen } from '@testing-library/react';
import SpellWeb from '../components/SpellWeb.tsx';

// Mock the grimoireIndex module
const mockSchools = [
  {
    id: 'debugging',
    real: 'Debugging',
    name: 'School of Remediation',
    desc: 'Incantations to banish bugs.',
    spells: [
      {
        name: 'Trace Sight',
        skill: 'debug-issue',
        effect: 'Maps stack traces.',
        status: 'Proven',
      },
      {
        name: 'Bisect Divination',
        skill: 'debug-to-fix-pipeline',
        effect: 'Binary searches.',
        status: 'Proven',
      },
    ],
  },
  {
    id: 'reasoning',
    real: 'Reasoning',
    name: 'School of Cognition',
    desc: 'Mental models.',
    spells: [
      {
        name: 'Razor of Parsimony',
        skill: 'occams-razor',
        effect: 'Favors simplest.',
        status: 'New',
      },
    ],
  },
];

const mockWeb = {
  schools: [
    {
      id: 'debugging',
      type: 'school',
      label: 'Debugging',
      name: 'School of Remediation',
      spellCount: 2,
      children: [
        {
          id: 'debug-issue',
          type: 'spell',
          label: 'Trace Sight',
          schoolId: 'debugging',
          schoolName: 'Debugging',
          tier: 'Proven',
          comboCount: 0,
          effect: 'Maps stack traces.',
        },
        {
          id: 'debug-to-fix-pipeline',
          type: 'spell',
          label: 'Bisect Divination',
          schoolId: 'debugging',
          schoolName: 'Debugging',
          tier: 'Proven',
          comboCount: 0,
          effect: 'Binary searches.',
        },
      ],
    },
    {
      id: 'reasoning',
      type: 'school',
      label: 'Reasoning',
      name: 'School of Cognition',
      spellCount: 1,
      children: [
        {
          id: 'occams-razor',
          type: 'spell',
          label: 'Razor of Parsimony',
          schoolId: 'reasoning',
          schoolName: 'Reasoning',
          tier: 'New',
          comboCount: 0,
          effect: 'Favors simplest.',
        },
      ],
    },
  ],
  spellNodes: [
    {
      id: 'debug-issue',
      type: 'spell',
      label: 'Trace Sight',
      schoolId: 'debugging',
      schoolName: 'Debugging',
      tier: 'Proven',
      comboCount: 0,
      effect: 'Maps stack traces.',
    },
    {
      id: 'debug-to-fix-pipeline',
      type: 'spell',
      label: 'Bisect Divination',
      schoolId: 'debugging',
      schoolName: 'Debugging',
      tier: 'Proven',
      comboCount: 0,
      effect: 'Binary searches.',
    },
    {
      id: 'occams-razor',
      type: 'spell',
      label: 'Razor of Parsimony',
      schoolId: 'reasoning',
      schoolName: 'Reasoning',
      tier: 'New',
      comboCount: 0,
      effect: 'Favors simplest.',
    },
  ],
  comboEdges: [],
  schoolMap: new Map(),
  findSpellNode: (skillId) => null,
  findSchoolNode: (schoolId) => null,
};

vi.mock('../data/grimoireIndexInstance.ts', () => ({
  grimoireIndex: {
    buildSpellWeb: () => mockWeb,
    resolveBySkill: (skillId) => {
      const spell = mockWeb.spellNodes.find((s) => s.id === skillId);
      if (!spell) return null;
      const school = mockSchools.find((s) => s.id === spell.schoolId);
      return {
        spell: { name: spell.label, skill: spell.id, effect: spell.effect, status: spell.tier },
        school,
      };
    },
  },
}));

describe('SpellWeb', () => {
  it('renders without crashing', () => {
    render(<SpellWeb onSpellClick={() => {}} />);
    expect(screen.getByText('The Spell Web')).toBeInTheDocument();
  });

  it('displays school count', () => {
    render(<SpellWeb onSpellClick={() => {}} />);
    const elements = screen.getAllByText('2');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('displays spell count', () => {
    render(<SpellWeb onSpellClick={() => {}} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays connection count', () => {
    render(<SpellWeb onSpellClick={() => {}} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders school names', () => {
    render(<SpellWeb onSpellClick={() => {}} />);
    const debuggingElements = screen.getAllByText('Debugging');
    expect(debuggingElements.length).toBeGreaterThanOrEqual(1);
    const reasoningElements = screen.getAllByText('Reasoning');
    expect(reasoningElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders spell names', () => {
    render(<SpellWeb onSpellClick={() => {}} />);
    const debuggingBtn = screen.getByRole('button', { name: 'Debugging school' });
    fireEvent.click(debuggingBtn);
    expect(screen.getByText('Trace Sight')).toBeInTheDocument();
    expect(screen.getByText('Bisect Divination')).toBeInTheDocument();

    const reasoningBtn = screen.getByRole('button', { name: 'Reasoning school' });
    fireEvent.click(reasoningBtn);
    expect(screen.getByText('Razor of Parsimony')).toBeInTheDocument();
  });

  it('shows tooltip details on spell hover', () => {
    render(<SpellWeb onSpellClick={() => {}} />);
    const debuggingBtn = screen.getByRole('button', { name: 'Debugging school' });
    fireEvent.click(debuggingBtn);
    const traceSight = screen.getByText('Trace Sight');
    fireEvent.mouseEnter(traceSight.closest('g'));

    const tooltip = screen.getByTestId('spell-web-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Trace Sight');
    expect(tooltip).toHaveTextContent('Debugging');
    expect(tooltip).toHaveTextContent('0 connections');
  });
});
