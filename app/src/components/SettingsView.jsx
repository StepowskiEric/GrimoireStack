import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useFavorites } from '../hooks/useFavorites.js';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';
import { useMarginalia } from '../hooks/useMarginalia.js';
import { importConfig } from '../utils/exporter.js';
import Icon from './Icon.jsx';

const GITHUB_REPO_URL = 'https://github.com/StepowskiEric/GrimoireStack';

export default function SettingsView({
  castEnabled,
  onToggleCast,
  audioEnabled,
  onToggleAudio,
  onShowShortcuts,
  onExportJson,
  onExportMarkdown,
}) {
  const [activeSection, setActiveSection] = useState('language');
  const [importText, setImportText] = useState('');
  const { lang, setLang } = useLanguage();
  const { setFavorites } = useFavorites();
  const { setRecent } = useRecentlyViewed();
  const { setNotes } = useMarginalia();

  const sections = [
    { id: 'language', name: 'Language', icon: 'warded-seal' },
    { id: 'data', name: 'Data', icon: 'archive' },
    { id: 'display', name: 'Display', icon: 'eye-fragment' },
    { id: 'about', name: 'About', icon: 'sigil' },
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
            <span className="settings-view__section-icon"><Icon name={section.icon} size={18} /></span>
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

            <div className="settings-view__export-group">
              <div className="settings-view__export-row">
                <button
                  className="settings-view__action-btn"
                  onClick={onExportJson}
                  type="button"
                  title="Machine-readable backup for restoring later"
                >
                  <Icon name="clipboard" size={16} /> Export as JSON
                </button>
                <p className="settings-view__option-hint">
                  Machine-readable backup. Use this to restore favorites, notes, and history later.
                </p>
              </div>
              <div className="settings-view__export-row">
                <button
                  className="settings-view__action-btn"
                  onClick={onExportMarkdown}
                  type="button"
                  title="Human-readable summary for sharing or reference"
                >
                  <Icon name="clipboard" size={16} /> Export as Markdown
                </button>
                <p className="settings-view__option-hint">
                  Human-readable summary. Good for sharing or reference.
                </p>
              </div>
            </div>

            <div className="settings-view__import-group">
              <h4>Restore from config</h4>
              <p className="settings-view__option-hint">
                Paste a previously exported JSON config to restore your data.
              </p>
              <textarea
                className="settings-view__import-textarea"
                placeholder="Paste a previously exported JSON config here…"
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <button
                className="settings-view__action-btn settings-view__action-btn--restore"
                type="button"
                onClick={() => {
                  if (!importText.trim()) return;
                  const result = importConfig(importText);
                  if (result) {
                    setFavorites(result.favorites);
                    setRecent(result.recent);
                    setNotes(result.marginalia);
                    setImportText('');
                  }
                }}
              >
                <Icon name="file-import" size={16} /> Restore Config
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
                  checked={audioEnabled}
                  onChange={onToggleAudio}
                />
                <span>Enable sounds</span>
              </label>
              <p className="settings-view__option-hint">
                Silences the ambient drone, page creaks, cackles, and the
                distant background whispers. Mute the incantation if the
                workshop demands silence.
              </p>
            </div>
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
                Runes of Power
              </button>
              <a
                className="settings-view__link"
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source Repository
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
