import { useState, useCallback } from 'react';
import { DEFAULT_LLM_MODEL, DEFAULT_LLM_PROXY_PATH } from '../lib/llm-defaults.js';

const STORAGE_KEY = 'grimoire-agent-mode';

const DEFAULT_BASE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}${DEFAULT_LLM_PROXY_PATH}`
    : DEFAULT_LLM_PROXY_PATH;

export function useAgentMode() {
  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true' || saved === 'false') return saved === 'true';
    } catch {
      // ignore
    }
    return true;
  });

  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}-config`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.baseURL === 'string' && typeof parsed.model === 'string') {
          return {
            baseURL: parsed.baseURL,
            model: parsed.model,
            apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
          };
        }
      }
    } catch {
      // ignore corrupt storage
    }
    return { baseURL: DEFAULT_BASE_URL, model: DEFAULT_LLM_MODEL, apiKey: '' };
  });

  const [status, setStatus] = useState('idle');

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const updateConfig = useCallback((patch) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(`${STORAGE_KEY}-config`, JSON.stringify(next));
      } catch {
        // storage may be unavailable
      }
      return next;
    });
  }, []);

  const runAgent = useCallback(
    async ({ bestSkill, onError }) => {
      if (!enabled || !bestSkill) return false;

      const baseURL = config.baseURL.trim();
      const model = config.model.trim();
      if (!baseURL || !model) {
        // Silent fallback: agent unavailable, caller opens the skill directly.
        return false;
      }

      setStatus('running');

      try {
        const { PageAgent } = await import('page-agent');

        const agent = new PageAgent({
          baseURL: baseURL.replace(/\/$/, ''),
          model,
          apiKey: config.apiKey || undefined,
          language: 'en-US',
        });

        const prompt = `The user is looking for the skill "${bestSkill.name}" (${bestSkill.skill}). Scroll to that skill card in the library, then click it to open the spell. After it opens, briefly explain in one sentence what the skill does so the user understands why it matched.`;

        await agent.execute(prompt);
        setStatus('done');
        return true;
      } catch (err) {
        // Surface the failure so the user knows the agent didn't navigate
        // — the caller still opens the skill directly (observing `false`).
        setStatus('error');
        onError?.(err?.message || 'Agent failed to navigate');
        return false;
      }
    },
    [enabled, config],
  );

  const resetStatus = useCallback(() => {
    setStatus('idle');
  }, []);

  return {
    enabled,
    toggle,
    config,
    updateConfig,
    status,
    runAgent,
    resetStatus,
  };
}
