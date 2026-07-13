import Icon from './Icon.jsx';

const sections = [
  {
    id: 'spine',
    icon: 'archive',
    title: 'The Spine',
    subtitle: 'School Catalog',
    desc: 'The schools hold the spells. Debugging, reasoning, architecture, testing, and so on. Click a school to see what is inside, or use the Great Eye above to search across the whole grimoire.',
  },
  {
    id: 'vault',
    icon: 'vault',
    title: 'The Vault',
    subtitle: 'Favorites & History',
    desc: 'Spells you have marked with a star. The ones you have opened recently. The notes you have scribbled in the margins. They all live here.',
  },
  {
    id: 'rituals',
    icon: 'alembic',
    title: 'The Crucible',
    subtitle: 'Recipe Lab',
    desc: 'Pick spells from different schools and combine them into hybrid recipes. Useful when one skill is not enough for the job.',
  },
  {
    id: 'bestiary',
    icon: 'tools',
    title: 'The Bestiary',
    subtitle: 'Codex of Entities',
    desc: 'Every spell sorted by status: proven, new, framework, hybrid, or includes. Filter by tier or annotation to find the right tool for the moment.',
  },
  {
    id: 'spellweb',
    icon: 'graph',
    title: 'Spell Web',
    subtitle: 'Dependency Map',
    desc: 'A graph of how spells connect through synergies and prerequisites. Good for seeing which skills pair naturally.',
  },
  {
    id: 'changelog',
    icon: 'changelog',
    title: 'Changelog',
    subtitle: 'Recent Inscriptions',
    desc: 'What was added, what changed, what got retired. Read this if you want to know what is new since your last visit.',
  },
  {
    id: 'seance',
    icon: 'oracle',
    title: 'The Séance',
    subtitle: 'Guided Divination',
    desc: 'Not sure what you need? The Séance asks a few questions about your goal, then points to a spell worth trying.',
  },
  {
    id: 'settings',
    icon: 'sigil',
    title: 'Settings',
    subtitle: 'Ritual Chamber',
    desc: 'Toggle the audio, turn on spell cast animations, switch language, export your data, or see the keyboard shortcuts.',
  },
];

const schoolsSummary = [
  {
    id: 'debugging',
    name: 'Debugging',
    desc: 'Diagnose, trace, and resolve issues in code and systems',
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    desc: 'Structured thinking, planning, and problem-solving protocols',
  },
  {
    id: 'execution',
    name: 'Process',
    desc: 'Workflow engineering, automation, and repeatable execution',
  },
  {
    id: 'systems-and-architecture',
    name: 'Architecture',
    desc: 'System design, structure, and architectural decisions',
  },
  { id: 'testing', name: 'Testing', desc: 'Test strategies, coverage, and quality assurance' },
  {
    id: 'output-quality',
    name: 'Creativity',
    desc: 'Design, writing, brainstorming, and generative work',
  },
];

export default function AboutView({ onSchoolSelect }) {
  return (
    <div className="text-moonlight max-w-[680px] animate-[spineFadeIn_0.35s_ease-out]">
      {/* Hero */}
      <div className="text-center px-3 py-5 mb-5">
        <div
          className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-full border border-[rgba(138,154,106,0.18)] text-sickly mb-2.5"
          style={{
            background:
              'radial-gradient(circle at 40% 35%, rgba(138,154,106,0.12), transparent 65%)',
            boxShadow: '0 0 20px rgba(138,154,106,0.06), inset 0 0 20px rgba(138,154,106,0.04)',
          }}
        >
          <Icon name="index" size={48} />
        </div>
        <h2
          className="font-['Cinzel_Decorative'] font-black text-[1.7rem] text-gold-bright tracking-wide leading-tight"
          style={{ textShadow: '0 0 30px rgba(212,175,55,0.2), 0 2px 0 rgba(0,0,0,0.3)' }}
        >
          GrimoireStack
        </h2>
        <p className="font-['Cinzel'] text-[0.7rem] uppercase tracking-[0.3em] text-silver-dim mt-1 mb-3">
          A Themed Catalog of Agent Skills
        </p>
        <div className="w-[60px] h-px mx-auto mb-3.5 bg-gradient-to-r from-transparent via-[rgba(138,154,106,0.3)] to-transparent" />
        <p className="text-[0.92rem] leading-relaxed text-parchment-dark mx-auto mb-2.5 max-w-[560px]">
          GrimoireStack is a catalog of AI agent skills dressed up as a grimoire. Schools hold the
          domains. Spells hold the skills. Each{' '}
          <strong className="text-gold-bright font-semibold">school</strong> covers one area of
          practice (debugging, reasoning, architecture, testing, and so on). Each{' '}
          <strong className="text-gold-bright font-semibold">spell</strong> is one skill you can
          read about, try, or combine with others.
        </p>
      </div>

      {/* What are schools */}
      <div className="mb-5.5 px-0.5">
        <h3 className="font-['Cinzel'] font-bold text-[0.7rem] uppercase tracking-[0.12em] text-gold-bright mb-2 flex items-center gap-2">
          What Are the Schools?
          <span className="flex-1 h-px bg-gradient-to-r from-[rgba(138,154,106,0.2)] to-transparent" />
        </h3>
        <p className="text-[0.9rem] leading-relaxed text-parchment-dark mb-3.5">
          Schools group spells by domain. Six of them in total. Pick the one that fits the problem
          and look around.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-1">
          {schoolsSummary.map((school) => (
            <button
              key={school.id}
              type="button"
              onClick={() => onSchoolSelect?.(school.id)}
              className="w-full text-left p-3 border border-[rgba(138,154,106,0.08)] border-l-2 border-l-[rgba(138,154,106,0.15)] rounded-sm bg-[rgba(8,10,16,0.4)] transition-all duration-200 hover:bg-[rgba(10,14,22,0.55)] hover:border-l-[rgba(138,154,106,0.3)] hover:shadow-[0_0_10px_rgba(138,154,106,0.04)]"
            >
              <div className="font-['Cinzel'] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-moonlight mb-1">
                {school.name}
              </div>
              <div className="text-[0.78rem] leading-snug text-silver-mute">{school.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* How to use */}
      <div className="mb-5.5 px-0.5">
        <h3 className="font-['Cinzel'] font-bold text-[0.7rem] uppercase tracking-[0.12em] text-gold-bright mb-2 flex items-center gap-2">
          How to Use the Grimoire
          <span className="flex-1 h-px bg-gradient-to-r from-[rgba(138,154,106,0.2)] to-transparent" />
        </h3>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-3 p-2.5 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-colors duration-200 hover:border-[rgba(138,154,106,0.15)]">
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">
              1
            </span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">
                Search or Browse
              </strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">
                Type into the Great Eye above to search across every school at once, or click a
                school in The Spine to browse its spells.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-colors duration-200 hover:border-[rgba(138,154,106,0.15)]">
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">
              2
            </span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">
                Inspect a Spell
              </strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">
                Click any spell card to see the full entry: what it does, its tier, status,
                synergies, and your notes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-colors duration-200 hover:border-[rgba(138,154,106,0.15)]">
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">
              3
            </span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">
                Annotate &amp; Collect
              </strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">
                Favorite spells for quick access, add marginalia (notes) to any incantation, and
                review everything in The Vault.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-colors duration-200 hover:border-[rgba(138,154,106,0.15)]">
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">
              4
            </span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">
                Combine &amp; Create
              </strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">
                Throw a few spells into The Crucible. See what combinations work.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-colors duration-200 hover:border-[rgba(138,154,106,0.15)]">
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">
              5
            </span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">
                Get Guided
              </strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">
                Stuck? Open The Séance. It asks a few questions and points you at a spell.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab guide */}
      <div className="mb-5.5 px-0.5">
        <h3 className="font-['Cinzel'] font-bold text-[0.7rem] uppercase tracking-[0.12em] text-gold-bright mb-2 flex items-center gap-2">
          Guide to the Sections
          <span className="flex-1 h-px bg-gradient-to-r from-[rgba(138,154,106,0.2)] to-transparent" />
        </h3>
        <p className="text-[0.9rem] leading-relaxed text-parchment-dark mb-3.5">
          The sidebar on the left (or the bottom bar on mobile) lists every section. Here is what
          each one holds.
        </p>
        <div className="flex flex-col gap-2.5">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="p-3 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-all duration-200 hover:bg-[rgba(10,14,22,0.45)] hover:border-[rgba(138,154,106,0.14)]"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[rgba(138,154,106,0.12)] bg-[rgba(138,154,106,0.08)] text-sickly">
                  <Icon name={sec.icon} size={18} />
                </span>
                <div>
                  <div className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright leading-tight">
                    {sec.title}
                  </div>
                  <div className="font-['Cormorant_Garamond'] text-[0.7rem] text-silver-mute italic">
                    {sec.subtitle}
                  </div>
                </div>
              </div>
              <p className="text-[0.82rem] leading-relaxed text-silver-mute m-0 sm:ml-[42px] sm:mt-1">
                {sec.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-6.5 pt-3.5 px-4 text-center border-t border-[rgba(138,154,106,0.1)]">
        <p className="text-[0.8rem] italic leading-relaxed text-silver-mute m-0">
          GrimoireStack is an open-source project. View the source, report issues, or contribute via
          the GitHub repository linked at the bottom of every page.
        </p>
        <div className="mt-2 text-[0.8rem] text-sickly-dim tracking-[0.2em]">&#x2606;</div>
      </div>
    </div>
  );
}
