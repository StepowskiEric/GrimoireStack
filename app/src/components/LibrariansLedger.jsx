import { useMemo } from 'react';

export default function LibrariansLedger({ schools }) {
  const stats = useMemo(() => {
    let totalSpells = 0;
    let provenCount = 0;
    let newCount = 0;
    let frameworkCount = 0;
    let hybridCount = 0;
    let mcpCount = 0;
    let comboCount = 0;

    for (const school of schools) {
      totalSpells += school.spells.length;
      for (const sp of school.spells) {
        const status = (sp.status || '').trim();
        if (status === 'Proven') provenCount++;
        if (status === 'New') newCount++;
        if (status === 'Framework') frameworkCount++;
        if (status.includes('Hybrid')) hybridCount++;
        if (status.includes('MCP')) mcpCount++;
        if (Array.isArray(sp.combos) && sp.combos.length > 0) comboCount++;
      }
    }

    return {
      schools: schools.length,
      totalSpells,
      provenCount,
      newCount,
      frameworkCount,
      hybridCount,
      mcpCount,
      comboCount,
    };
  }, [schools]);

  const entries = [
    { label: 'Schools of Magic', value: stats.schools, rune: '✦' },
    { label: 'Total Incantations', value: stats.totalSpells, rune: '⟐' },
    { label: 'Proven Spells', value: stats.provenCount, rune: '✧' },
    { label: 'With Synergies', value: stats.comboCount, rune: '⚔' },
  ];

  return (
    <div className="ledger-wrapper" aria-label="Librarian's Ledger">
      <div className="ledger-seal" aria-hidden="true">⟐</div>
      <div className="ledger-panel">
        {entries.map((entry) => (
          <div key={entry.label} className="ledger-entry">
            <span className="ledger-rune" aria-hidden="true">{entry.rune}</span>
            <span className="ledger-value">{entry.value}</span>
            <span className="ledger-label">{entry.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
