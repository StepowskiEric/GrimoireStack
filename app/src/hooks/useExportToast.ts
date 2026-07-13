import { useCallback, useRef, useState } from 'react';
import { copyToClipboard, exportAsJson, exportAsMarkdown } from '../utils/exporter.ts';

export function useExportToast({
  favorites,
  marginalia,
  recent,
}: {
  favorites: unknown[];
  marginalia: Record<string, string>;
  recent: unknown[];
}) {
  const [exportToast, setExportToast] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (source: string, label: string) => {
    const ok = await copyToClipboard(source);
    setExportToast(ok ? `${label} copied!` : 'Copy failed');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setExportToast(''), 2200);
  }, []);

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
