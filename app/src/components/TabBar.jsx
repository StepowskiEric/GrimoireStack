export default function TabBar({ schools, currentSchool, onSelect, isLab }) {
  return (
    <div className="tabs-wrapper">
      <nav className="tabs" id="tabContainer">
        {schools.map(s => (
          <button key={s.id}
            className={`tab-btn${currentSchool === s.id ? ' active' : ''}`}
            data-school={s.id} onClick={() => onSelect(s.id)}>
            {s.symbol} {s.name} <span className="real-name">{s.real}</span>
          </button>
        ))}
        <button className={`tab-btn${isLab ? ' active' : ''}`}
          data-school="recipe-lab" onClick={() => onSelect('recipe-lab')}>
          ⚗ Recipe Lab <span className="real-name">brew your own</span>
        </button>
      </nav>
    </div>
  );
}
