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
  { id: 'agent', nameKey: 'settingsAgent', icon: 'oracle' },
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
  sync,
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

            <div className="settings-view__sync-group">
              <h4>Cross-device binding</h4>
              <p className="settings-view__option-hint">
                {sync?.code
                  ? 'Your circle is bound. Enter the same code on another device to merge your incantations.'
                  : 'Bind your circle to a short code so it follows you between devices. No account required.'}
              </p>

              {sync?.code ? (
                <SyncStatus
                  code={sync.code}
                  status={sync.status}
                  lastSyncedAt={sync.lastSyncedAt}
                  error={sync.error}
                  onSyncNow={sync.syncNow}
                  onDisconnect={async () => {
                    if (confirm('Disconnect cross-device sync? Your local circle stays; the cloud copy will remain until overwritten by another code.')) {
                      sync.disableSync();
                    }
                  }}
                />
              ) : (
                <button
                  className="settings-view__action-btn"
                  type="button"
                  onClick={() => {
                    const newCode = sync.enableSync();
                    navigator.clipboard?.writeText(newCode).catch(() => {});
                  }}
                  title="Generate a 16-character sync code"
                >
                  <Icon name="warded-seal" size={16} /> Generate sync code
                </button>
              )}
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

        {activeSection === 'agent' && (
          <div className="settings-view__section-content">
            <h3>Agent Mode</h3>
            <p>
              Uses <strong>page-agent</strong> with <strong>Groq</strong>
              ({' '}<code>qwen/qwen3.6-27b</code>) to visually navigate to the
              best skill card. The Groq API key is configured on the server
              and does not need to be set here.
            </p>
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

function SyncStatus({ code, status, lastSyncedAt, error, onSyncNow, onDisconnect }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const masked = `${code.slice(0, 4)}-****-****-${code.slice(-4)}`;
  const display = revealed ? code : masked;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard blocked; user can still read the code.
    }
  };

  const statusLabel = (() => {
    if (status === 'syncing') return 'Syncing…';
    if (status === 'error') return `Error: ${error || 'unknown'}`;
    if (status === 'synced' && lastSyncedAt) {
      const ago = Math.max(1, Math.round((Date.now() - lastSyncedAt) / 1000));
      return `Synced ${ago < 60 ? `${ago}s ago` : `${Math.round(ago / 60)}m ago`}`;
    }
    return 'Idle';
  })();
  return (
    <div className="settings-view__sync-status">
      <div className="settings-view__sync-code-row">
        <code className="settings-view__sync-code" data-testid="sync-code">{display}</code>
        <button
          className="settings-view__action-btn settings-view__action-btn--small"
          type="button"
          onClick={() => setRevealed((v) => !v)}
          title={revealed ? 'Hide code' : 'Show code'}
        >
          {revealed ? 'Hide' : 'Show'}
        </button>
        <button
          className="settings-view__action-btn settings-view__action-btn--small"
          type="button"
          onClick={handleCopy}
          title="Copy code"
        >
          <Icon name="clipboard" size={14} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p
        className={`settings-view__sync-status-text settings-view__sync-status-text--${status}`}
        role="status"
        aria-live="polite"
      >
        {statusLabel}
      </p>
      <div className="settings-view__sync-actions">
        <button
          className="settings-view__action-btn"
          type="button"
          onClick={onSyncNow}
          disabled={status === 'syncing'}
        >
          <Icon name="sigil" size={14} /> Sync now
        </button>
        <button
          className="settings-view__action-btn settings-view__action-btn--restore"
          type="button"
          onClick={onDisconnect}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
