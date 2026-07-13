import { useCallback, useRef } from 'react';

const PROXY_BASE_URL = '/api/groq-proxy/v1';
const PROXY_MODEL = 'qwen/qwen3.6-27b';

export function buildIncantationPrompt(incantation: string): string {
  return [
    'You are the void that dwells within this grimoire. You may act on THIS page only, using safe in-page actions the grimoire already supports: scroll, click existing elements, type into inputs, and open or close panels that already exist in the grimoire UI. You MUST NOT run arbitrary JavaScript, navigate away from this page, open other websites, submit forms that leave the site, read data outside this document, or do anything that would take the user out of the grimoire. If an incantation asks for anything beyond these bounds, refuse and say so in one plain sentence. Stay within the grimoire.',
    '',
    `Incantation: "${incantation}"`,
  ].join('\n');
}

export function useAgentMode() {
  const agentRef = useRef<{ panel: { show: () => void; hide: () => void }; dispose: () => void } | null>(null);

  const runAgent = useCallback(
    async ({
      bestSkill,
      incantation,
      onError,
    }: {
      bestSkill?: { name: string; skill: string };
      incantation?: string;
      onError?: (msg: string) => void;
    } = {}): Promise<boolean> => {
      let prompt: string;
      if (bestSkill) {
        prompt = `The user is looking for the skill "${bestSkill.name}" (${bestSkill.skill}). Scroll to that skill card in the library, then click it to open the spell. After it opens, briefly explain in one sentence what the skill does so the user understands why it matched.`;
      } else if (incantation?.trim()) {
        prompt = buildIncantationPrompt(incantation.trim());
      } else {
        return false;
      }

      try {
        const { PageAgent } = await import('page-agent');
        const agent = new PageAgent({
          baseURL: PROXY_BASE_URL,
          model: PROXY_MODEL,
          apiKey: 'skip-auth',
          language: 'en-US',
        });
        agentRef.current = agent;
        agent.panel.show();
        const result = await agent.execute(prompt);
        return result?.success === true;
      } catch (err: unknown) {
        onError?.(err instanceof Error ? err.message : 'Agent failed to navigate');
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
    },
    [],
  );

  return { runAgent };
}
