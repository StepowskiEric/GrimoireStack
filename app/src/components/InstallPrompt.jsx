import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (localStorage.getItem('grimoire-install-dismissed') === '1') return undefined;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch {}
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    try { localStorage.setItem('grimoire-install-dismissed', '1'); } catch {}
  };

  if (!visible) return null;

  return (
    <div className="install-toast" role="status" aria-live="polite">
      <span>✦ Summon GrimoireStack to your device</span>
      <button type="button" onClick={handleInstall}>Install</button>
      <button type="button" className="install-dismiss" onClick={handleDismiss} aria-label="Dismiss install">✕</button>
    </div>
  );
}
