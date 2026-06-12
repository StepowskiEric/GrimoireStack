import Icon from './Icon.jsx';

// Mobile-friendly tab labels (no import from BookLayout to avoid circular dependency)
const MOBILE_TABS = {
  library: { name: 'Library', icon: 'archive' },
  spellbook: { name: 'Favorites', icon: 'warded-seal' },
  'recipe-lab': { name: 'Craft', icon: 'alembic' },
  settings: { name: 'Profile', icon: 'profile' },
};

export default function BottomNav({
  activeTab,
  onTabSelect,
}) {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {Object.entries(MOBILE_TABS).map(([key, { name, icon }]) => (
        <button
          key={key}
          className={`bottom-nav__item ${activeTab === key ? 'bottom-nav__item--active' : ''}`}
          onClick={() => onTabSelect(key)}
          type="button"
          aria-current={activeTab === key ? 'page' : undefined}
        >
          <span className="bottom-nav__icon"><Icon name={icon} size={20} /></span>
          <span className="bottom-nav__label">{name}</span>
        </button>
      ))}
    </nav>
  );
}
