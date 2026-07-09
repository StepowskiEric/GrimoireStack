import Icon from './Icon.jsx';

const sections = [
  {
    id: 'spine',
    icon: 'archive',
    title: 'The Spine',
    subtitle: 'School Catalog',
    desc: 'Browse all Schools of Arcane Knowledge — the thematic groupings that define this grimoire. Each school (debugging, reasoning, architecture, testing, etc.) contains its own collection of spells (agent skills). Click a school to explore its spells, or use the Great Eye above to search across everything at once.',
  },
  {
    id: 'vault',
    icon: 'vault',
    title: 'The Vault',
    subtitle: 'Favorites & History',
    desc: 'Your personal collection. Spells you have favorited appear here alongside your recently viewed incantations. The marginalia you annotate on any spell is also indexed here — a curated record of what you have studied.',
  },
  {
    id: 'rituals',
    icon: 'alembic',
    title: 'The Crucible',
    subtitle: 'Recipe Lab',
    desc: 'Combine multiple spells into hybrid recipes. Select incantations from different schools, brew them together, and discover composite skills that bridge domains. Use this to design multi-step workflows from existing building blocks.',
  },
  {
    id: 'bestiary',
    icon: 'tools',
    title: 'The Bestiary',
    subtitle: 'Codex of Entities',
    desc: 'A reference view of all spells sorted by status — proven, new, framework, hybrid, or includes. Filter by annotation or tier to find the right tool for a specific kind of incantation. Think of it as a field guide to every entity in the grimoire.',
  },
  {
    id: 'spellweb',
    icon: 'graph',
    title: 'Spell Web',
    subtitle: 'Dependency Map',
    desc: 'A visual graph showing how spells relate to one another through their synergies and dependencies. Useful when you need to understand which skills naturally combine or which prerequisites a given incantation requires.',
  },
  {
    id: 'changelog',
    icon: 'changelog',
    title: 'Changelog',
    subtitle: 'Recent Inscriptions',
    desc: 'A record of what has been added, revised, or removed from the grimoire. Check here to see new skills, updated incantations, and retired spells as the catalog evolves.',
  },
  {
    id: 'seance',
    icon: 'oracle',
    title: 'The Séance',
    subtitle: 'Guided Divination',
    desc: 'Not sure what you need? The Séance walks you through a series of questions about your goal, then divines a recommended skill. Answer a few prompts and let the oracle narrow the grimoire down to the most relevant incantation.',
  },
  {
    id: 'settings',
    icon: 'sigil',
    title: 'Settings',
    subtitle: 'Ritual Chamber',
    desc: 'Configure the grimoire to your preference: toggle audio ambience, enable spell casting animations, switch between arcane and plain language, export your data, or review keyboard shortcuts.',
  },
];

const schoolsSummary = [
  { name: 'Debugging', desc: 'Diagnose, trace, and resolve issues in code and systems' },
  { name: 'Reasoning', desc: 'Structured thinking, planning, and problem-solving protocols' },
  { name: 'Process', desc: 'Workflow engineering, automation, and repeatable execution' },
  { name: 'Architecture', desc: 'System design, structure, and architectural decisions' },
  { name: 'Testing', desc: 'Test strategies, coverage, and quality assurance' },
  { name: 'Creativity', desc: 'Design, writing, brainstorming, and generative work' },
];

export default function AboutView() {
  return (
    <div className="text-moonlight max-w-[680px] animate-[spineFadeIn_0.35s_ease-out]">
      {/* Hero */}
      <div className="text-center px-3 py-5 mb-5">
        <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-full border border-[rgba(138,154,106,0.18)] text-sickly mb-2.5"
          style={{
            background: 'radial-gradient(circle at 40% 35%, rgba(138,154,106,0.12), transparent 65%)',
            boxShadow: '0 0 20px rgba(138,154,106,0.06), inset 0 0 20px rgba(138,154,106,0.04)',
          }}
        >
          <Icon name="index" size={48} />
        </div>
        <h2 className="font-['Cinzel_Decorative'] font-black text-[1.7rem] text-gold-bright tracking-wide leading-tight"
          style={{ textShadow: '0 0 30px rgba(212,175,55,0.2), 0 2px 0 rgba(0,0,0,0.3)' }}
        >
          GrimoireStack
        </h2>
        <p className="font-['Cinzel'] text-[0.7rem] uppercase tracking-[0.3em] text-silver-dim mt-1 mb-3">A Themed Catalog of Agent Skills</p>
        <div className="w-[60px] h-px mx-auto mb-3.5 bg-gradient-to-r from-transparent via-[rgba(138,154,106,0.3)] to-transparent" />
        <p className="text-[0.92rem] leading-relaxed text-parchment-dark mx-auto mb-2.5 max-w-[560px]">
          GrimoireStack is a living collection of AI agent skills, organized as schools and spells
          within a grimoire — a reference tome for building, combining, and discovering agent capabilities.
          Each <strong className="text-gold-bright font-semibold">school</strong> represents a domain of expertise (debugging, reasoning, architecture, testing, and more).
          Each <strong className="text-gold-bright font-semibold">spell</strong> is a specific skill, tool, or protocol you can invoke, study, or combine.
        </p>
        <p className="text-[0.92rem] leading-relaxed text-parchment-dark mx-auto max-w-[560px]">
          The grimoire does not track progress or enforce a curriculum. It is a reference: browse freely,
          search by symptom or topic, and take what you need.
        </p>
      </div>

      {/* What are schools */}
      <div className="mb-5.5 px-0.5">
        <h3 className="font-['Cinzel'] font-bold text-[0.7rem] uppercase tracking-[0.12em] text-gold-bright mb-2 flex items-center gap-2">
          What Are the Schools?
          <span className="flex-1 h-px bg-gradient-to-r from-[rgba(138,154,106,0.2)] to-transparent" />
        </h3>
        <p className="text-[0.9rem] leading-relaxed text-parchment-dark mb-3.5">
          Schools are the top-level categories that group skills by domain. Each school contains
          spells relevant to that area of practice. The six core schools of the grimoire:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-1">
          {schoolsSummary.map((school) => (
            <div key={school.name} className="p-3 border border-[rgba(138,154,106,0.08)] border-l-2 border-l-[rgba(138,154,106,0.15)] rounded-sm bg-[rgba(8,10,16,0.4)] transition-all duration-200 hover:bg-[rgba(10,14,22,0.55)] hover:border-l-[rgba(138,154,106,0.3)] hover:shadow-[0_0_10px_rgba(138,154,106,0.04)]">
              <div className="font-['Cinzel'] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-moonlight mb-1">{school.name}</div>
              <div className="text-[0.78rem] leading-snug text-silver-mute">{school.desc}</div>
            </div>
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
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">1</span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">Search or Browse</strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">Type into the Great Eye above to search across every school at once, or click a school in The Spine to browse its spells.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-colors duration-200 hover:border-[rgba(138,154,106,0.15)]">
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">2</span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">Inspect a Spell</strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">Click any spell card to open its full entry — description, tier, status, synergies, and marginalia.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-colors duration-200 hover:border-[rgba(138,154,106,0.15)]">
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">3</span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">Annotate &amp; Collect</strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">Favorite spells for quick access, add marginalia (notes) to any incantation, and review everything in The Vault.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-colors duration-200 hover:border-[rgba(138,154,106,0.15)]">
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">4</span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">Combine &amp; Create</strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">Drop multiple spells into The Crucible to brew composite recipes that bridge domains.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-colors duration-200 hover:border-[rgba(138,154,106,0.15)]">
            <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[rgba(138,154,106,0.2)] bg-[rgba(138,154,106,0.1)] text-sickly font-['Cinzel'] text-[0.65rem] font-bold mt-0.5">5</span>
            <div>
              <strong className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright block mb-1">Get Guided</strong>
              <p className="text-[0.82rem] leading-snug text-silver-mute m-0">If you are unsure where to start, open The Séance for a guided recommendation based on what you are trying to accomplish.</p>
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
          The sidebar on the left (or the bottom bar on mobile) lists every section of the grimoire.
          Here is what each one contains:
        </p>
        <div className="flex flex-col gap-2.5">
          {sections.map((sec) => (
            <div key={sec.id} className="p-3 border border-[rgba(138,154,106,0.06)] rounded-sm bg-[rgba(8,10,16,0.35)] transition-all duration-200 hover:bg-[rgba(10,14,22,0.45)] hover:border-[rgba(138,154,106,0.14)]">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[rgba(138,154,106,0.12)] bg-[rgba(138,154,106,0.08)] text-sickly">
                  <Icon name={sec.icon} size={18} />
                </span>
                <div>
                  <div className="font-['Cinzel'] font-semibold text-[0.72rem] uppercase tracking-[0.08em] text-gold-bright leading-tight">{sec.title}</div>
                  <div className="font-['Cormorant_Garamond'] text-[0.7rem] text-silver-mute italic">{sec.subtitle}</div>
                </div>
              </div>
              <p className="text-[0.82rem] leading-relaxed text-silver-mute m-0 sm:ml-[42px] sm:mt-1">{sec.desc}</p>
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
