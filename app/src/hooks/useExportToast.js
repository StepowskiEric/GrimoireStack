import { useCallback, useRef, useState } from 'react';
import { copyToClipboard, exportAsJson, exportAsMarkdown } from '../utils/exporter.js';

/**
 * useExportToast — clipboard export with a timed success/failure toast.
 *
 * @param {Object} opts
 * @param {Array} opts.favorites
 * @param {Object} opts.marginalia
 * @param {Array} opts.recent
 * @returns {{ exportToast: string, handleExportJson: () => Promise<void>, handleExportMarkdown: () => Promise<void> }}
 */
export function useExportToast({ favorites, marginalia, recent }) {
  const [exportToast, setExportToast] = useState('');
  const timerRef = useRef(null);

  const copy = useCallback(
    async (source, label) => {
      const ok = await copyToClipboard(source);
      setExportToast(ok ? `${label} copied!` : 'Copy failed');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setExportToast(''), 2200);
    },
    [],
  );

  const handleExportJson = useCallback(async () => {
    const json = exportAsJson({ favorites, marginalia, recent });
    await copy(json, 'JSON');
  }, [favorites, marginalia, recent, copy]);

  const handleExportMarkdown = useCallback(async () => {
    const md = exportAsMarkdown({ favorites, marginalia, recent });
    await copy(md, 'Markdown');
  }, [favorites, marginalia, recent, copy]);

  return { exportToast, handleExportJson, handleExportMarkdown };
}
