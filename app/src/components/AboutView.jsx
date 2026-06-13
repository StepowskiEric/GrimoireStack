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
    <div className="about-view">
      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero__symbol">
          <Icon name="index" size={48} />
        </div>
        <h2 className="about-hero__title">GrimoireStack</h2>
        <p className="about-hero__subtitle">A Themed Catalog of Agent Skills</p>
        <div className="about-hero__sep" />
        <p className="about-hero__desc">
          GrimoireStack is a living collection of AI agent skills, organized as schools and spells
          within a grimoire — a reference tome for building, combining, and discovering agent capabilities.
          Each <strong>school</strong> represents a domain of expertise (debugging, reasoning, architecture, testing, and more).
          Each <strong>spell</strong> is a specific skill, tool, or protocol you can invoke, study, or combine.
        </p>
        <p className="about-hero__desc">
          The grimoire does not track progress or enforce a curriculum. It is a reference: browse freely,
          search by symptom or topic, and take what you need.
        </p>
      </div>

      {/* What are schools */}
      <div className="about-block">
        <h3 className="about-block__title">What Are the Schools?</h3>
        <p className="about-block__desc">
          Schools are the top-level categories that group skills by domain. Each school contains
          spells relevant to that area of practice. The six core schools of the grimoire:
        </p>
        <div className="about-schools-grid">
          {schoolsSummary.map((school) => (
            <div key={school.name} className="about-school-card">
              <div className="about-school-card__name">{school.name}</div>
              <div className="about-school-card__desc">{school.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How to use */}
      <div className="about-block">
        <h3 className="about-block__title">How to Use the Grimoire</h3>
        <div className="about-steps">
          <div className="about-step">
            <span className="about-step__num">1</span>
            <div>
              <strong>Search or Browse</strong>
              <p>Type into the Great Eye above to search across every school at once, or click a school in The Spine to browse its spells.</p>
            </div>
          </div>
          <div className="about-step">
            <span className="about-step__num">2</span>
            <div>
              <strong>Inspect a Spell</strong>
              <p>Click any spell card to open its full entry — description, tier, status, synergies, and marginalia.</p>
            </div>
          </div>
          <div className="about-step">
            <span className="about-step__num">3</span>
            <div>
              <strong>Annotate &amp; Collect</strong>
              <p>Favorite spells for quick access, add marginalia (notes) to any incantation, and review everything in The Vault.</p>
            </div>
          </div>
          <div className="about-step">
            <span className="about-step__num">4</span>
            <div>
              <strong>Combine &amp; Create</strong>
              <p>Drop multiple spells into The Crucible to brew composite recipes that bridge domains.</p>
            </div>
          </div>
          <div className="about-step">
            <span className="about-step__num">5</span>
            <div>
              <strong>Get Guided</strong>
              <p>If you are unsure where to start, open The Séance for a guided recommendation based on what you are trying to accomplish.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab guide */}
      <div className="about-block">
        <h3 className="about-block__title">Guide to the Sections</h3>
        <p className="about-block__desc">
          The sidebar on the left (or the bottom bar on mobile) lists every section of the grimoire.
          Here is what each one contains:
        </p>
        <div className="about-sections-list">
          {sections.map((sec) => (
            <div key={sec.id} className="about-section-entry">
              <div className="about-section-entry__head">
                <span className="about-section-entry__icon"><Icon name={sec.icon} size={18} /></span>
                <div>
                  <div className="about-section-entry__title">{sec.title}</div>
                  <div className="about-section-entry__sub">{sec.subtitle}</div>
                </div>
              </div>
              <p className="about-section-entry__desc">{sec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="about-footer-note">
        <p>
          GrimoireStack is an open-source project. View the source, report issues, or contribute via
          the GitHub repository linked at the bottom of every page.
        </p>
        <div className="about-footer-rune">&#x2606;</div>
      </div>
    </div>
  );
}
