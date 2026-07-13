import { useCallback, useEffect, useRef, useState } from 'react';
import {
  setAudioEnabled as setSiteAudioEnabled,
  startAmbience,
  startWhispers,
} from '../audio/sounds.ts';

const STORAGE_KEY = 'grimoire-audio';

export function useAudioState() {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(STORAGE_KEY) !== 'off';
  });

  const ambienceStartedRef = useRef(false);
  const whispersStartedRef = useRef(false);
  const prevAudioEnabledRef = useRef<boolean | null>(null);

  if (prevAudioEnabledRef.current !== audioEnabled) {
    const wasEnabled = prevAudioEnabledRef.current;
    prevAudioEnabledRef.current = audioEnabled;
    setSiteAudioEnabled(audioEnabled);
    if (wasEnabled === true && audioEnabled === false) {
      whispersStartedRef.current = false;
    } else if (wasEnabled === false && audioEnabled === true) {
      if (ambienceStartedRef.current) {
        whispersStartedRef.current = true;
        startWhispers();
      }
    }
  }

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!ambienceStartedRef.current) {
        ambienceStartedRef.current = true;
        startAmbience();
      }
      if (audioEnabled && !whispersStartedRef.current) {
        whispersStartedRef.current = true;
        startWhispers();
      }
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      document.removeEventListener('touchstart', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [audioEnabled]);

  return { audioEnabled, toggleAudio };
}
