import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useFavorites } from '../hooks/useFavorites.js';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';
import { useMarginalia } from '../hooks/useMarginalia.js';
import { importConfig } from '../utils/exporter.js';
import Icon from './Icon.jsx';

const GITHUB_REPO_URL = 'https://github.com/StepowskiEric/GrimoireStack';

const SECTIONS = [
  { id: 'language', nameKey: 'settingsLanguage', icon: 'warded-seal' },
  { id: 'data', nameKey: 'settingsData', icon: 'archive' },
  { id: 'display', nameKey: 'settingsDisplay', icon: 'eye-fragment' },
  { id: 'about', nameKey: 'settingsAbout', icon: 'sigil' },
];

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
  const { t, lang, setLang } = useLanguage();
  const { setFavorites } = useFavorites();
  const { setRecent } = useRecentlyViewed();
  const { setNotes } = useMarginalia();

  return (
    <div className="settings-view">
      <h2 className="settings-view__title">{t('settingsTitle')}</h2>
      <p className="settings-view__sub">
        {t('settingsSub')}
      </p>

      <div className="settings-view__selector">
        {SECTIONS.map(section => (
          <button
            key={section.id}
            className={`settings-view__section-btn ${activeSection === section.id ? 'settings-view__section-btn--active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            type="button"
          >
            <span className="settings-view__section-icon"><Icon name={section.icon} size={18} /></span>
            <span className="settings-view__section-name">{t(section.nameKey)}</span>
          </button>
        ))}
      </div>

      <div className="settings-view__content">
        {activeSection === 'language' && (
          <div className="settings-view__section-content">
            <h3>{t('settingsVoiceTitle')}</h3>
            <p>
              {t('settingsVoiceSub')}
            </p>
            <div className="settings-view__option">
              <label htmlFor="lang-select">{t('settingsLanguageLabel')}</label>
              {/* eslint-disable-next-line jsx-a11y/no-onchange */}
              <select
                id="lang-select"
                className="settings-view__select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="grimoire">{t('languageGrimoire')} ({t('settingsThemed')})</option>
                <option value="plain">{t('languagePlain')}</option>
              </select>
            </div>
          </div>
        )}

        {activeSection === 'data' && (
          <div className="settings-view__section-content">
            <h3>{t('settingsVaultTitle')}</h3>
            <p>
              {t('settingsVaultSub')}
            </p>

            <div className="settings-view__export-group">
              <div className="settings-view__export-row">
                <button
                  className="settings-view__action-btn"
                  onClick={onExportJson}
                  type="button"
                  title={t('exportJsonDesc')}
                >
                  <Icon name="clipboard" size={16} /> {t('exportJson')}
                </button>
                <p className="settings-view__option-hint">
                  {t('exportJsonDesc')}
                </p>
              </div>
              <div className="settings-view__export-row">
                <button
                  className="settings-view__action-btn"
                  onClick={onExportMarkdown}
                  type="button"
                  title={t('exportMdDesc')}
                >
                  <Icon name="clipboard" size={16} /> {t('exportMarkdown')}
                </button>
                <p className="settings-view__option-hint">
                  {t('exportMdDesc')}
                </p>
              </div>
            </div>

            <div className="settings-view__import-group">
              <h4>{t('importHeading')}</h4>
              <p className="settings-view__option-hint">
                {t('settingsImportHint')}
              </p>
              <textarea
                className="settings-view__import-textarea"
                placeholder={t('importPlaceholder')}
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
                <Icon name="file-import" size={16} /> {t('importBtn')}
              </button>
            </div>
          </div>
        )}

        {activeSection === 'display' && (
          <div className="settings-view__section-content">
            <h3>{t('settingsSightTitle')}</h3>
            <p>
              {t('settingsSightSub')}
            </p>
            <div className="settings-view__option">
              <label className="settings-view__toggle">
                <input
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={onToggleAudio}
                />
                <span>{t('settingsEnableSounds')}</span>
              </label>
              <p className="settings-view__option-hint">
                {t('settingsSoundsHint')}
              </p>
            </div>
            <div className="settings-view__option">
              <label className="settings-view__toggle">
                <input
                  type="checkbox"
                  checked={castEnabled}
                  onChange={onToggleCast}
                />
                <span>{t('castToggleLabel')}</span>
              </label>
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="settings-view__section-content">
            <h3>{t('settingsAboutTitle')}</h3>
            <p>
              {t('settingsAboutBody')}
            </p>
            <div className="settings-view__links">
              <button className="settings-view__link" onClick={onShowShortcuts} type="button">
                {t('shortcutsTitle')}
              </button>
              <a
                className="settings-view__link"
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('settingsSourceRepo')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
