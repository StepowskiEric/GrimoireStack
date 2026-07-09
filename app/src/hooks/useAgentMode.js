import { useCallback, useRef } from 'react';

const PROXY_BASE_URL = '/api/groq-proxy/v1';
const PROXY_MODEL = 'qwen/qwen3.6-27b';

// Slice 10 — page-agent void incantations. The eye can take free-form
// "incantations" at peak gaze. The page-agent is the eye's single resident
// intelligence; it must never be a second competing agent, and it must stay
// inside the grimoire. This prompt is the strict in-page allowlist: scroll,
// click, type, open/close existing panels — nothing that leaves the page or
// reads outside the document. Pure + exported so it is unit-testable.
export function buildIncantationPrompt(incantation) {
  return [
    'You are the void that dwells within this grimoire. You may act on THIS page only, using safe in-page actions the grimoire already supports: scroll, click existing elements, type into inputs, and open or close panels that already exist in the grimoire UI. You MUST NOT run arbitrary JavaScript, navigate away from this page, open other websites, submit forms that leave the site, read data outside this document, or do anything that would take the user out of the grimoire. If an incantation asks for anything beyond these bounds, refuse and say so in one plain sentence. Stay within the grimoire.',
    '',
    `Incantation: "${incantation}"`,
  ].join('\n');
}
export function useAgentMode() {
  const agentRef = useRef(null);

  const runAgent = useCallback(async ({ bestSkill, incantation, onError } = {}) => {
    // Resolve the prompt from whichever entry point invoked the eye: a
    // recommended skill (bestSkill) or a free-form incantation at peak gaze.
    let prompt;
    if (bestSkill) {
      prompt = `The user is looking for the skill "${bestSkill.name}" (${bestSkill.skill}). Scroll to that skill card in the library, then click it to open the spell. After it opens, briefly explain in one sentence what the skill does so the user understands why it matched.`;
    } else if (incantation && incantation.trim()) {
      prompt = buildIncantationPrompt(incantation.trim());
    } else {
      console.log('[useAgentMode] runAgent skipped: no bestSkill or incantation');
      return false;
    }

    console.log('[useAgentMode] Starting agent run', { mode: bestSkill ? 'skill' : 'incantation', proxyUrl: PROXY_BASE_URL, model: PROXY_MODEL });

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


      console.log('[useAgentMode] Calling agent.execute()...');
      const result = await agent.execute(prompt);
      const success = result?.success === true;
      return success;
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
