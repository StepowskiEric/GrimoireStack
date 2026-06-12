import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const GITHUB_REPO_URL = 'https://github.com/StepowskiEric/GrimoireStack';

export default function SettingsView({
  castEnabled,
  onToggleCast,
  onShowShortcuts,
  onExportJson,
  onExportMarkdown,
}) {
  const [activeSection, setActiveSection] = useState('language');
  const { lang, setLang } = useLanguage();

  const sections = [
    { id: 'language', name: 'Language', icon: '✦' },
    { id: 'data', name: 'Data', icon: '⛁' },
    { id: 'display', name: 'Display', icon: '◉' },
    { id: 'about', name: 'About', icon: '⛧' },
  ];

  return (
    <div className="settings-view">
      <h2 className="settings-view__title">Ritual Chamber</h2>
      <p className="settings-view__sub">
        Configure how the incantations speak to you.
      </p>

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

      <div className="settings-view__content">
        {activeSection === 'language' && (
          <div className="settings-view__section-content">
            <h3>Voice of the Tome</h3>
            <p>
              Switch between the grimoire's high tongue and mortal speech.
              The grimoire language calls the catalog by its true names;
              plain language speaks in workshop terms.
            </p>
            <div className="settings-view__option">
              <label htmlFor="lang-select">Language</label>
              {/* eslint-disable-next-line jsx-a11y/no-onchange */}
              <select
                id="lang-select"
                className="settings-view__select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="grimoire">Grimoire (Themed)</option>
                <option value="plain">Plain English</option>
              </select>
            </div>
          </div>
        )}

        {activeSection === 'data' && (
          <div className="settings-view__section-content">
            <h3>Vault Inscription</h3>
            <p>
              Copy your binding circle — favorites, marginalia, and the trail
              of recently bound spells — to clipboard. The orb preserves
              nothing in the cloud; this is the only path between devices.
            </p>
            <div className="settings-view__actions">
              <button className="settings-view__action-btn" onClick={onExportJson} type="button">
                ⛧ Export as JSON
              </button>
              <button className="settings-view__action-btn" onClick={onExportMarkdown} type="button">
                ✦ Export as Markdown
              </button>
            </div>
          </div>
        )}

        {activeSection === 'display' && (
          <div className="settings-view__section-content">
            <h3>Sight of the Eye</h3>
            <p>
              The Lidless Eye opens whenever a spell is summoned. The lid
              falls; the pupil dilates; the incantation reveals itself.
              Turn this off for those who prefer the quick reveal.
            </p>
            <div className="settings-view__option">
              <label className="settings-view__toggle">
                <input
                  type="checkbox"
                  checked={castEnabled}
                  onChange={onToggleCast}
                />
                <span>Cast animation & cackle</span>
              </label>
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="settings-view__section-content">
            <h3>Of This Tome</h3>
            <p>
              GrimoireStack is a living codex of agentic incantations — skills
              for debugging, reasoning, code review, architecture, and the
              darker arts of collaboration. These incantations were not meant
              for mortal eyes, but the wardens are weakening.
            </p>
            <div className="settings-view__links">
              <button className="settings-view__link" onClick={onShowShortcuts} type="button">
                ⌨ Runes of Power
              </button>
              <a
                className="settings-view__link"
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                ⛧ Source Repository
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
