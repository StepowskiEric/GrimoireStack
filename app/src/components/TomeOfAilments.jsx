import { useState } from 'react';
import { WIZARD_DATA } from '../data/schools.js';
import { spellCatalog } from '../data/spellCatalogInstance.js';

const CLUSTERS = [
  { id: 'fix', label: 'Fix it', emoji: '🐛' },
  { id: 'build', label: 'Build it', emoji: '🛠' },
  { id: 'check', label: 'Check it', emoji: '✅' },
  { id: 'figure', label: 'Figure it out', emoji: '🎯' },
];

const CLUSTER_MAP = {
  bug: 'fix', 'api-data': 'fix',
  architecture: 'build', refactoring: 'build',
  'code-review': 'check', 'testing-skill': 'check', 'output-quality': 'check',
  reasoning: 'figure', collaboration: 'figure', cognition: 'figure', other: 'figure',
};

export default function TomeOfAilments({ schools, onSelectSkill, onClose }) {
  const [activeCluster, setActiveCluster] = useState(null);

  const situations = activeCluster
    ? WIZARD_DATA.flatMap((cat) =>
        (CLUSTER_MAP[cat.id] === activeCluster ? cat.situations : []).map((sit) => ({
          ...sit,
          categoryLabel: cat.label,
        }))
      )
    : [];

  const getSpellName = (skillId) => {
    const name = spellCatalog.getSpellNameBySkill(skillId);
    return name || skillId;
  };

  const getSchoolSymbol = (skillId) => {
    const entry = spellCatalog.resolveBySkill(skillId);
    return entry ? entry.school.symbol : '✦';
  };

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal tome-modal" role="dialog" aria-modal="true" aria-label="Tome of Common Ailments">
        <button className="modal-close" onClick={onClose} aria-label="Close tome">✕</button>

        <div className="tome-title">⟐ Tome of Common Ailments</div>
        <div className="tome-subtitle">Describe your affliction to find the right incantation</div>

        <div className="tome-clusters">
          {CLUSTERS.map((cluster) => {
            const isActive = activeCluster === cluster.id;
            return (
              <button
                key={cluster.id}
                type="button"
                className={`tome-cluster${isActive ? ' active' : ''}`}
                onClick={() => setActiveCluster(isActive ? null : cluster.id)}
                aria-pressed={isActive}
              >
                <span className="tome-cluster-emoji" aria-hidden="true">{cluster.emoji}</span>
                <span className="tome-cluster-label">{cluster.label}</span>
              </button>
            );
          })}
        </div>

        {activeCluster ? (
          <div className="tome-situations">
            {situations.length === 0 ? (
              <div className="tome-empty">No entries in this section of the tome…</div>
            ) : (
              situations.map((sit) => (
                <button
                  key={sit.id}
                  type="button"
                  className="tome-situation"
                  onClick={() => {
                    const entry = spellCatalog.resolveBySkill(sit.skill);
                    if (entry) {
                      onSelectSkill(entry.spell, entry.school);
                    } else {
                      onClose();
                    }
                  }}
                >
                  <span className="tome-sit-label">{sit.label}</span>
                  <span className="tome-sit-desc">{sit.desc}</span>
                  <span className="tome-sit-skill">
                    <span aria-hidden="true">{getSchoolSymbol(sit.skill)}</span>
                    <span>{getSpellName(sit.skill)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="tome-hint">
            Select a category above to browse common problems and their matching spells.
          </div>
        )}
      </div>
    </div>
  );
}
