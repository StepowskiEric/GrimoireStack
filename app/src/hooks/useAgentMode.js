import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'grimoire-agent-mode';

// Defaults that point at the Cloudflare Pages Function proxy. The proxy
// is OpenAI-compatible and forwards to Workers AI internally — so the
// user never needs to provide their own API key or endpoint.
const DEFAULT_BASE_URL =
  typeof window !== 'undefined' ? `${window.location.origin}/api/llm-proxy/v1` : '/api/llm-proxy/v1';
const DEFAULT_MODEL = '@cf/zai-org/glm-4.7-flash';

export function useAgentMode() {
  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Default: enabled. The user can toggle off in Settings.
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
    return {
      baseURL: DEFAULT_BASE_URL,
      model: DEFAULT_MODEL,
      apiKey: '',
    };
  });

  const [status, setStatus] = useState('idle');
  const statusRef = useRef(status);
  const agentRef = useRef(null);
  const onNavigateRef = useRef(null);

  const persistConfig = useCallback((next) => {
    setConfig(next);
    try {
      localStorage.setItem(`${STORAGE_KEY}-config`, JSON.stringify(next));
    } catch {
      // storage may be unavailable
    }
  }, []);

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
      persistConfig(next);
      return next;
    });
  }, [persistConfig]);

  const runAgent = useCallback(async ({ query: _query, bestSkill, onNavigate }) => {
    onNavigateRef.current = onNavigate;
    if (!enabled || !bestSkill) return false;

    const trimmedBaseURL = config.baseURL.trim();
    const trimmedModel = config.model.trim();
    if (!trimmedBaseURL || !trimmedModel) {
      // Silent fallback: agent unavailable, caller opens the skill directly.
      return false;
    }

    statusRef.current = 'running';
    setStatus('running');

    try {
      const { PageAgent } = await import('page-agent');

      const agent = new PageAgent({
        baseURL: trimmedBaseURL.replace(/\/$/, ''),
        model: trimmedModel,
        apiKey: config.apiKey || undefined,
        language: 'en-US',
      });

      agentRef.current = agent;

      const prompt = `The user is looking for the skill "${bestSkill.name}" (${bestSkill.skill}). Scroll to that skill card in the library, then click it to open the spell. After it opens, briefly explain in one sentence what the skill does so the user understands why it matched.`;

      await agent.execute(prompt);
      statusRef.current = 'done';
      setStatus('done');
      return true;
    } catch {
      // Silent fallback: don't call onNavigate here — the caller observes
      // the `false` return and triggers its own navigation, avoiding
      // double-firing.
      statusRef.current = 'error';
      setStatus('error');
      return false;
    } finally {
      agentRef.current = null;
    }
  }, [enabled, config]);

  const resetStatus = useCallback(() => {
    statusRef.current = 'idle';
    setStatus('idle');
  }, [setStatus]);

  return {
    enabled,
    toggle,
    config,
    updateConfig,
    status,
    statusRef,
    runAgent,
    resetStatus,
  };
}
