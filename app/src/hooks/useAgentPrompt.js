import { useState, useCallback, useRef } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { useAgentMode } from './useAgentMode.js';

export function useAgentPrompt({ onSpellClick, onBrowseResults, onShowAgentToast } = {}) {
  const [prompt, setPrompt] = useState('');
  const [bestSkill, setBestSkill] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const agent = useAgentMode();
  const inputRef = useRef(null);

  const reset = useCallback(() => {
    setBestSkill(null);
    setStatus('idle');
    setError(null);
  }, []);

  const handlePrompt = useCallback(async (value) => {
    const q = (value || prompt).trim();
    if (!q) return;

    setPrompt(q);
    setStatus('matching');
    setError(null);
    setBestSkill(null);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = err.error || `Recommendation failed (${res.status})`;
        setStatus('error');
        setError(message);
        onShowAgentToast?.(`Oracle unavailable: ${message}`);
        onBrowseResults?.(q);
        return;
      }

      const data = await res.json();
      const top = Array.isArray(data.results) ? data.results[0] : null;

      if (!top) {
        setStatus('no-match');
        onBrowseResults?.(q);
        return;
      }

      const found = grimoireIndex.resolveBySkill(top.skill);
      const skill = found ? { ...top, spell: found.spell, school: found.school } : top;
      setBestSkill(skill);
      setStatus('matched');

      const navigated = await agent.runAgent({
        query: q,
        bestSkill: skill,
        onNavigate: () => onSpellClick?.(skill.spell, skill.school),
        onError: (msg) => onShowAgentToast?.(`Agent failed: ${msg}`),
      });

      if (!navigated) {
        onSpellClick?.(skill.spell, skill.school);
      }
    } catch (err) {
      const message = err.message || 'Unknown error';
      setStatus('error');
      setError(message);
      onShowAgentToast?.(`Oracle failed: ${message}`);
      onBrowseResults?.(q);
    }
  }, [prompt, agent, onSpellClick, onBrowseResults, onShowAgentToast]);

  const handleBrowse = useCallback(() => {
    const q = prompt.trim() || bestSkill?.name || '';
    reset();
    onBrowseResults?.(q);
  }, [prompt, bestSkill, reset, onBrowseResults]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return {
    prompt,
    setPrompt,
    bestSkill,
    status,
    error,
    inputRef,
    handlePrompt,
    handleBrowse,
    reset,
    focusInput,
    agentEnabled: agent.enabled,
    agentStatus: agent.status,
  };
}
