import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useFavorites } from '../hooks/useFavorites.js';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';
import { useMarginalia } from '../hooks/useMarginalia.js';
import { importConfig } from '../utils/exporter.js';
import { cn } from '../utils/cn.js';
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
  sync,
}) {
  const [activeSection, setActiveSection] = useState('language');
  const [importText, setImportText] = useState('');
  const { t, lang, setLang } = useLanguage();
  const { setFavorites } = useFavorites();
  const { setRecent } = useRecentlyViewed();
  const { setNotes } = useMarginalia();

  return (
    <div className="py-1">
      <div className="text-center mb-4">
        <h2 className="font-['Cinzel_Decorative'] text-[1.25rem] font-bold text-text-primary tracking-wide">{t('settingsTitle')}</h2>
        <p className="text-text-secondary text-[0.82rem] mt-1">{t('settingsSub')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {SECTIONS.map(section => (
          <button
            key={section.id}
            className={cn('flex items-center gap-2 px-3 py-2 border rounded-sm text-[0.68rem] font-semibold uppercase tracking-wider transition-all duration-200', activeSection === section.id ? 'border-border-hover bg-surface-raised text-text-primary' : 'border-border bg-surface text-text-muted hover:border-border-hover')}
            onClick={() => setActiveSection(section.id)}
            type="button"
          >
            <span className="text-sickly"><Icon name={section.icon} size={18} /></span>
            <span>{t(section.nameKey)}</span>
          </button>
        ))}
      </div>

      <div className="panel p-4">
        {activeSection === 'language' && (
          <div>
            <div className="relative flex items-center gap-2 mb-2">
              <h3 className="section-title">{t('settingsVoiceTitle')}</h3>
            </div>
            <p className="text-text-secondary text-[0.82rem] mb-3">{t('settingsVoiceSub')}</p>
            <label className="block text-text-primary text-[0.82rem] mb-1" htmlFor="lang-select">{t('settingsLanguageLabel')}</label>
            {/* eslint-disable-next-line jsx-a11y/no-onchange */}
            <select
              id="lang-select"
              className="w-full bg-surface-overlay border border-border text-text-primary text-[0.95rem] p-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="grimoire">{t('languageGrimoire')} ({t('settingsThemed')})</option>
              <option value="plain">{t('languagePlain')}</option>
            </select>
          </div>
        )}

        {activeSection === 'data' && (
          <div>
            <div className="relative flex items-center gap-2 mb-2">
              <h3 className="section-title">{t('settingsVaultTitle')}</h3>
            </div>
            <p className="text-text-secondary text-[0.82rem] mb-3">{t('settingsVaultSub')}</p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="panel-raised p-3">
                <button
                  className="section-title w-full text-left"
                  onClick={onExportJson}
                  type="button"
                  title={t('exportJsonDesc')}
                >
                  <Icon name="clipboard" size={16} /> {t('exportJson')}
                </button>
                <p className="text-text-muted text-[0.78rem] mt-1">{t('exportJsonDesc')}</p>
              </div>
              <div className="panel-raised p-3">
                <button
                  className="section-title w-full text-left"
                  onClick={onExportMarkdown}
                  type="button"
                  title={t('exportMdDesc')}
                >
                  <Icon name="clipboard" size={16} /> {t('exportMarkdown')}
                </button>
                <p className="text-text-muted text-[0.78rem] mt-1">{t('exportMdDesc')}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="relative flex items-center gap-2 mb-2">
                <h3 className="section-title">{t('importHeading')}</h3>
              </div>
              <p className="text-text-muted text-[0.78rem] mb-2">{t('settingsImportHint')}</p>
              <textarea
                className="mt-2 w-full bg-surface-overlay border border-border text-text-primary placeholder:text-text-muted text-[0.95rem] p-2 rounded-sm focus:outline-3 focus:outline-offset-2 focus:border-border-hover"
                placeholder={t('importPlaceholder')}
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <button
                className="mt-2 section-title px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised"
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

            <div className="mt-4">
              <div className="relative flex items-center gap-2 mb-2">
                <h3 className="section-title">Cross-device binding</h3>
              </div>
              <p className="text-text-muted text-[0.78rem] mb-2">
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
                  className="section-title px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised"
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
          <div>
            <div className="relative flex items-center gap-2 mb-2">
              <h3 className="section-title">{t('settingsSightTitle')}</h3>
            </div>
            <p className="text-text-secondary text-[0.82rem] mb-3">{t('settingsSightSub')}</p>
            <div className="panel-raised p-3 mb-2">
              <label className="flex items-center gap-2 text-text-primary text-[0.82rem]">
                <input
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={onToggleAudio}
                />
                <span>{t('settingsEnableSounds')}</span>
              </label>
              <p className="text-text-muted text-[0.78rem] mt-1">{t('settingsSoundsHint')}</p>
            </div>
            <div className="panel-raised p-3">
              <label className="flex items-center gap-2 text-text-primary text-[0.82rem]">
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
          <div>
            <div className="relative flex items-center gap-2 mb-2">
              <h3 className="section-title">{t('settingsAboutTitle')}</h3>
            </div>
            <p className="text-text-secondary text-[0.82rem] mb-3">{t('settingsAboutBody')}</p>
            <div className="flex flex-wrap gap-2">
              <button className="section-title px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised" onClick={onShowShortcuts} type="button">
                {t('shortcutsTitle')}
              </button>
              <a
                className="section-title px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised"
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
    <div className="panel p-3">
      <div className="flex flex-wrap items-center gap-2">
        <code className="flex-1 bg-surface-overlay border border-border text-text-primary text-[0.82rem] p-2 rounded-sm" data-testid="sync-code">{display}</code>
        <button
          className="section-title px-2.5 py-2 border border-border text-text-muted hover:border-border-hover"
          type="button"
          onClick={() => setRevealed((v) => !v)}
          title={revealed ? 'Hide code' : 'Show code'}
        >
          {revealed ? 'Hide' : 'Show'}
        </button>
        <button
          className="section-title px-2.5 py-2 border border-border text-text-muted hover:border-border-hover"
          type="button"
          onClick={handleCopy}
          title="Copy code"
        >
          <Icon name="clipboard" size={14} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p
        className={cn('mt-2 text-[0.78rem]', status === 'error' ? 'text-danger' : 'text-text-muted')}
        role="status"
        aria-live="polite"
      >
        {statusLabel}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="section-title px-3 py-2 border border-border-hover text-text-primary hover:bg-surface-raised"
          type="button"
          onClick={onSyncNow}
          disabled={status === 'syncing'}
        >
          <Icon name="sigil" size={14} /> Sync now
        </button>
        <button
          className="section-title px-3 py-2 border border-danger/40 text-danger hover:bg-danger-subtle"
          type="button"
          onClick={onDisconnect}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
