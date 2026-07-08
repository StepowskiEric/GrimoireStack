import { useState, useCallback, useRef } from 'react';
import { GROQ_BASE_URL, GROQ_MODEL } from '../lib/llm-defaults.js';

const STORAGE_KEY = 'grimoire-agent-mode-config';

export function useAgentMode() {
  const agentRef = useRef(null);

  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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
    return { baseURL: GROQ_BASE_URL, model: GROQ_MODEL, apiKey: '' };
  });

  const [status, setStatus] = useState('idle');

  const updateConfig = useCallback((patch) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage may be unavailable
      }
      return next;
    });
  }, []);

  const runAgent = useCallback(
    async ({ bestSkill, onError }) => {
      if (!bestSkill) return false;

      const baseURL = config.baseURL.trim();
      const model = config.model.trim();
      if (!baseURL || !model) {
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
        agentRef.current = agent;

        // Show the page-agent floating panel for visual feedback
        agent.panel.show();

        const prompt = `The user is looking for the skill "${bestSkill.name}" (${bestSkill.skill}). Scroll to that skill card in the library, then click it to open the spell. After it opens, briefly explain in one sentence what the skill does so the user understands why it matched.`;

        await agent.execute(prompt);
        setStatus('done');
        return true;
      } catch (err) {
        setStatus('error');
        onError?.(err?.message || 'Agent failed to navigate');
        return false;
      } finally {
        // Cleanup: hide panel and dispose agent after a brief delay so
        // the user sees the "Task completed" state.
        const agent = agentRef.current;
        if (agent) {
          setTimeout(() => {
            agent.panel?.hide();
            agent.dispose();
            agentRef.current = null;
          }, 2000);
        }
      }
    },
    [config],
  );

  const resetStatus = useCallback(() => {
    setStatus('idle');
  }, []);

  return {
    config,
    updateConfig,
    status,
    runAgent,
    resetStatus,
  };
}
