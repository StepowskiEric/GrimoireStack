import { useMemo } from 'react';
import { AFFLICTIONS } from '../data/afflictions.js';
import schools from '../data/schools.js';

function findSchool(id) {
  return schools.find((s) => s.id === id) || null;
}

function schoolName(id) {
  const s = findSchool(id);
  return s ? `${s.symbol} ${s.name}` : id;
}

export default function BestialityOfAfflictions({ onOpenSkill }) {
  const rows = useMemo(() => AFFLICTIONS.map((a) => ({
    ...a,
    schoolLabel: schoolName(a.school),
  })), []);

  return (
    <div className="bestiary-section" aria-labelledby="bestiary-title">
      <div className="bestiary-header">
        <div className="bestiary-ornament" aria-hidden="true">ᚦ ᛖ ᛒ</div>
        <h2 id="bestiary-title" className="bestiary-title">Bestiary of Common Afflictions</h2>
        <p className="bestiary-subtitle">Consult this tome when the work is cursed</p>
        <div className="bestiary-ornament" aria-hidden="true">ᛟ ᚲ ᛉ</div>
      </div>

      <div className="bestiary-table-wrap">
        <table className="bestiary-table">
          <thead>
            <tr>
              <th scope="col">Symptom</th>
              <th scope="col">Incantation</th>
              <th scope="col">School</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.symptom}-${row.skill}`} className="bestiary-row">
                <td>
                  <button type="button" className="bestiary-symptom" onClick={() => onOpenSkill?.(row.skill, row.school)}>
                    <span className="bestiary-quote" aria-hidden="true">“</span>
                    {row.symptom}
                    <span className="bestiary-note">{row.description}</span>
                  </button>
                </td>
                <td>
                  <button type="button" className="bestiary-incantation" onClick={() => onOpenSkill?.(row.skill, row.school)}>
                    {row.skill}
                  </button>
                </td>
                <td>
                  <span className="bestiary-school">{row.schoolLabel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
