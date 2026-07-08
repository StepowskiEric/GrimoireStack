import { useCallback, useRef } from 'react';

const PROXY_BASE_URL = '/api/groq-proxy/v1';
const PROXY_MODEL = 'qwen/qwen3.6-27b';

export function useAgentMode() {
  const agentRef = useRef(null);

  const runAgent = useCallback(async ({ bestSkill, onError }) => {
    if (!bestSkill) {
      console.log('[useAgentMode] runAgent skipped: no bestSkill');
      return false;
    }

    console.log('[useAgentMode] Starting agent run', { skill: bestSkill.skill, name: bestSkill.name, proxyUrl: PROXY_BASE_URL, model: PROXY_MODEL });

    try {
      const { PageAgent } = await import('page-agent');
      console.log('[useAgentMode] PageAgent imported successfully');

      const agent = new PageAgent({
        baseURL: PROXY_BASE_URL,
        model: PROXY_MODEL,
        apiKey: 'skip-auth',
        language: 'en-US',
      });
      console.log('[useAgentMode] PageAgent instance created', { baseURL: PROXY_BASE_URL, model: PROXY_MODEL });
      agentRef.current = agent;

      // Show the page-agent floating panel for visual feedback
      console.log('[useAgentMode] Showing panel...');
      agent.panel.show();

      const prompt = `The user is looking for the skill "${bestSkill.name}" (${bestSkill.skill}). Scroll to that skill card in the library, then click it to open the spell. After it opens, briefly explain in one sentence what the skill does so the user understands why it matched.`;

      console.log('[useAgentMode] Calling agent.execute()...');
      const result = await agent.execute(prompt);
      console.log('[useAgentMode] agent.execute() completed', { result });
      return true;
    } catch (err) {
      console.log('[useAgentMode] agent.execute() failed', { message: err.message, stack: err.stack?.slice(0, 300) });
      onError?.(err?.message || 'Agent failed to navigate');
      return false;
    } finally {
      const agent = agentRef.current;
      if (agent) {
        console.log('[useAgentMode] Scheduling cleanup in 2s...');
        setTimeout(() => {
          console.log('[useAgentMode] Cleaning up: hiding panel, disposing agent');
          agent.panel?.hide();
          agent.dispose();
          agentRef.current = null;
        }, 2000);
      }
    }
  }, []);

  return { runAgent };
}
