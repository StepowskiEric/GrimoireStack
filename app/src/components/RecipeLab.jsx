import { useState } from 'react';
import { witchLaugh } from '../audio/sounds.js';

const PREFIXES = ['Elixir', 'Potion', 'Tincture', 'Salve', 'Draught', 'Brew', 'Compound', 'Essence', 'Infusion', 'Extract'];
const ADJECTIVES = ['Ancient', 'Crimson', 'Shadow', 'Arcane', 'Ethereal', 'Verdant', 'Ashen', 'Silver', 'Amber', 'Violet', 'Deep', 'Restorative', 'Binding', 'Surging', 'Quiet'];

const NOUN_MAP = {
  debugging: 'Remediation', reasoning: 'Cognition', process: 'Refinement',
  'code-review': 'Scrutiny', architecture: 'Architecture', discovery: 'Discovery',
  documentation: 'Expression', planning: 'Foresight', learning: 'Knowledge',
  'anti-hallucination': 'Veracity', 'software-dev': 'Crafting', 'multi-agent': 'Confluence',
  risk: 'Warding', 'cognitive-load': 'Clarity', testing: 'Measurement'
};

const USE_CASES = [
  'Investigating and resolving complex system failures',
  'Validating code quality before production deployment',
  'Navigating unfamiliar codebases with precision',
  'Preventing reasoning errors in multi-step analysis',
  'Coordinating multiple agents toward a shared goal',
  'Designing robust architecture under uncertainty',
  'Accelerating delivery while maintaining quality gates',
  'Eliminating hallucinated claims from agent output',
  'Refactoring legacy systems with zero regression risk',
  'Planning complex features with stakeholder confidence',
];

const KEYWORDS = ['trace', 'debug', 'test', 'code', 'reason', 'verify', 'review', 'design', 'plan',
  'build', 'learn', 'coordinate', 'ward', 'refactor', 'analyze', 'diagnose', 'fix', 'search',
  'navigate', 'structure', 'model'];

export default function RecipeLab({ schools }) {
  const [selected, setSelected] = useState([]);
  const [brewed, setBrewed] = useState(null);

  const toggleSpell = (spell, school) => {
    setSelected(prev => {
      const idx = prev.findIndex(s => s.spell.name === spell.name);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      if (prev.length >= 5) return prev;
      return [...prev, { spell, school }];
    });
    setBrewed(null);
  };

  const brew = () => {
    if (selected.length < 2) return;
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const involvedSchools = [...new Set(selected.map(s => s.school.name))];
    let suffix;
    if (involvedSchools.length === 1) suffix = NOUN_MAP[selected[0].school.id] || 'Power';
    else if (involvedSchools.length === 2) suffix = adj + ' Union';
    else suffix = adj + ' Convergence';

    const allEffects = selected.map(s => s.spell.effect.toLowerCase());
    const found = [...new Set(KEYWORDS.filter(k => allEffects.some(e => e.includes(k))))];
    const names = selected.map(s => s.spell.name);
    let effect = 'A custom ritual combining ';
    effect += names.length === 2 ? `${names[0]} and ${names[1]}.` : names.slice(0, -1).join(', ') + ', and ' + names.slice(-1) + '.';
    effect += ' When cast together, these incantations provide ';
    effect += found.length > 0 ? found.slice(0, 3).join(', ') + ' capabilities.' : 'a broad spectrum of agentic power.';

    const statuses = selected.map(s => s.spell.status);
    const hasProven = statuses.some(s => s === 'Proven');
    const hasMCP = statuses.some(s => s && s.includes('MCP'));
    let potency, cls;
    if (hasProven && hasMCP) { potency = 'Archmage'; cls = 'archmage'; }
    else if (hasProven && selected.length >= 3) { potency = 'Master'; cls = 'master'; }
    else if (hasProven) { potency = 'Adept'; cls = 'adept'; }
    else { potency = 'Apprentice'; cls = 'apprentice'; }

    setBrewed({ name: `${prefix} of ${suffix}`, effect, potency, cls, names, bestUseCase: USE_CASES[0] });
    witchLaugh();
  };

  return (
    <div className="lab-section active" id="school-recipe-lab">
      <div className="lab-header">
        <h2>⚗ Recipe Lab</h2>
        <p className="lab-sub">Select 2–5 incantations below and brew a custom ritual</p>
      </div>
      <div className={`lab-cauldron${selected.length > 0 ? ' has-spells' : ''}`}>
        <div className="cauldron-label">✦ Cauldron</div>
        {selected.length === 0 ? <div className="cauldron-empty">Select incantations from the grid below…</div> : null}
        <div className="cauldron-chips">
          {selected.map((item, i) => (
            <span key={i} className="cauldron-chip" onClick={() => toggleSpell(item.spell, item.school)} title="Click to remove">
              {item.school.symbol} {item.spell.name}
            </span>
          ))}
        </div>
        {selected.length > 0 ? <div className="cauldron-count">{selected.length} of 5 incantations selected</div> : null}
      </div>
      <div className="lab-brew-wrap">
        <button className={`lab-brew${selected.length < 2 ? ' disabled' : ''}`} disabled={selected.length < 2} onClick={brew}>
          ⚗ Brew Ritual
        </button>
      </div>

      {brewed ? (
        <div className="lab-output show">
          <div className="recipe-card">
            <div className="rc-label">✦ Brewed Ritual</div>
            <div className="rc-name">{brewed.name}</div>
            <div className="rc-effect">{brewed.effect}</div>
            <div className="rc-row">
              <span className="rc-l">Potency</span>
              <span className="rc-v"><span className={`rc-potency ${brewed.cls}`}>✦ {brewed.potency}</span></span>
            </div>
            <div className="rc-row">
              <span className="rc-l">Best Scribed For</span>
              <span className="rc-v">{brewed.bestUseCase}</span>
            </div>
            <div className="rc-row">
              <span className="rc-l">Incantations</span>
              <span className="rc-v">{brewed.names.map((n, i) => <em key={i}>{n}{i < brewed.names.length - 1 ? ', ' : ''}</em>)}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="spell-grid">
        {schools.map(school =>
          school.spells.map(sp => {
            const sel = selected.some(s => s.spell.name === sp.name);
            return (
              <div key={sp.name + sp.skill}
                className={`spell-card${sel ? ' glow' : ''}`}
                onClick={() => toggleSpell(sp, school)}
                style={{ cursor: 'pointer', borderColor: sel ? 'rgba(212,175,55,.3)' : '' }}>
                <div className="spell-name">{sp.name}</div>
                <div className="spell-incantation">〈 {sp.skill} 〉</div>
                <div className="spell-effect">{sp.effect}</div>
                <div className="spell-footer">
                  <span className="lab-school-tag">{school.symbol} {school.name}</span>
                  <span className="lab-action-hint">{sel ? 'selected' : 'click to add'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
