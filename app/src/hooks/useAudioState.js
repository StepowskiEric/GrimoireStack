import { useCallback, useEffect, useRef, useState } from 'react';
import {
  setAudioEnabled as setSiteAudioEnabled,
  startAmbience,
  startWhispers,
} from '../audio/sounds.js';

const STORAGE_KEY = 'grimoire-audio';

/**
 * useAudioState — owns the audio toggle lifecycle.
 *
 * Interface:
 *   audioEnabled — current boolean state (mirrored to sounds.js module)
 *   toggleAudio  — () => void, flips the state and persists to localStorage
 *
 * Internals (not exposed):
 *   - Render-side sync with the sounds.js master gate via setSiteAudioEnabled
 *   - first-gesture listener: starts ambience + whispers on first click/keydown/touch
 *   - restart whispers on toggle-on if ambience was already running
 */

export function useAudioState() {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(STORAGE_KEY) !== 'off';
  });

  // Refs tracking the sounds.js module's internal scheduler state.
  const ambienceStartedRef = useRef(false);
  const whispersStartedRef = useRef(false);

  // Render-side sync: mirror React state to the sounds.js master gate
  // immediately on every change — no useEffect, no deferred cycle.
  // The sentinel null forces a sync on first render so the module
  // flag reflects localStorage before any audio fires.
  const prevAudioEnabledRef = useRef(null);
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

  // First gesture: start ambience + whispers on first user interaction.
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
