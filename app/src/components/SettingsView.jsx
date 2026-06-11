import { useState } from 'react';

export default function SettingsView({
  castEnabled,
  onToggleCast,
  onShowShortcuts,
  onExportJson,
  onExportMarkdown,
}) {
  const [activeSection, setActiveSection] = useState('language');

  const sections = [
    { id: 'language', name: 'Language', icon: '🌐' },
    { id: 'data', name: 'Data', icon: '💾' },
    { id: 'display', name: 'Display', icon: '🎨' },
    { id: 'about', name: 'About', icon: 'ℹ️' },
  ];

  return (
    <div className="settings-view">
      <h2 className="settings-view__title">Settings</h2>
      
      {/* Section selector */}
      <div className="settings-view__selector">
        {sections.map(section => (
          <button
            key={section.id}
            className={`settings-view__section-btn ${activeSection === section.id ? 'settings-view__section-btn--active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            type="button"
          >
            <span className="settings-view__section-icon">{section.icon}</span>
            <span className="settings-view__section-name">{section.name}</span>
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="settings-view__content">
        {activeSection === 'language' && (
          <div className="settings-view__section-content">
            <h3>Language Settings</h3>
            <p>Change the display language of the application.</p>
            <div className="settings-view__option">
              <label>Language</label>
              <select className="settings-view__select">
                <option value="en">English</option>
                <option value="grimoire">Grimoire (Fantasy)</option>
              </select>
            </div>
          </div>
        )}
        
        {activeSection === 'data' && (
          <div className="settings-view__section-content">
            <h3>Data Management</h3>
            <p>Export your data or manage your settings.</p>
            <div className="settings-view__actions">
              <button className="settings-view__action-btn" onClick={onExportJson} type="button">
                📋 Export as JSON
              </button>
              <button className="settings-view__action-btn" onClick={onExportMarkdown} type="button">
                📄 Export as Markdown
              </button>
            </div>
          </div>
        )}
        
        {activeSection === 'display' && (
          <div className="settings-view__section-content">
            <h3>Display Settings</h3>
            <p>Customize the visual appearance.</p>
            <div className="settings-view__option">
              <label className="settings-view__toggle">
                <input
                  type="checkbox"
                  checked={castEnabled}
                  onChange={onToggleCast}
                />
                <span>Cast animation & sound</span>
              </label>
            </div>
          </div>
        )}
        
        {activeSection === 'about' && (
          <div className="settings-view__section-content">
            <h3>About GrimoireStack</h3>
            <p>A living collection of agentic incantations — skills for debugging, reasoning, code review, architecture, and more.</p>
            <div className="settings-view__links">
              <button className="settings-view__link" onClick={onShowShortcuts} type="button">
                ⌨ Keyboard Shortcuts
              </button>
              <a
                className="settings-view__link"
                href="https://github.com/factory/grimoirestack"
                target="_blank"
                rel="noopener noreferrer"
              >
                🐙 GitHub Repository
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
