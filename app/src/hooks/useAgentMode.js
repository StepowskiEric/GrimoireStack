import { useCallback, useRef } from 'react';

const PROXY_BASE_URL = '/api/groq-proxy/v1';
const PROXY_MODEL = 'qwen/qwen3.6-27b';

export function useAgentMode() {
  const agentRef = useRef(null);

  const runAgent = useCallback(async ({ bestSkill, onError }) => {
    if (!bestSkill) return false;

    try {
      const { PageAgent } = await import('page-agent');

      const agent = new PageAgent({
        baseURL: PROXY_BASE_URL,
        model: PROXY_MODEL,
        apiKey: 'skip-auth',
        language: 'en-US',
      });
      agentRef.current = agent;

      // Show the page-agent floating panel for visual feedback
      agent.panel.show();

      const prompt = `The user is looking for the skill "${bestSkill.name}" (${bestSkill.skill}). Scroll to that skill card in the library, then click it to open the spell. After it opens, briefly explain in one sentence what the skill does so the user understands why it matched.`;

      await agent.execute(prompt);
      return true;
    } catch (err) {
      onError?.(err?.message || 'Agent failed to navigate');
      return false;
    } finally {
      const agent = agentRef.current;
      if (agent) {
        setTimeout(() => {
          agent.panel?.hide();
          agent.dispose();
          agentRef.current = null;
        }, 2000);
      }
    }
  }, []);

  return { runAgent };
}
