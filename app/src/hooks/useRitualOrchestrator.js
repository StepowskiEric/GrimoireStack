import { useState, useCallback } from 'react';
import { useRitual } from './useRitual.js';
import { useRitualWalk } from './useRitualWalk.js';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';

/**
 * useRitualOrchestrator — encapsulates all ritual-related state and callbacks.
 *
 * Manages:
 * - activePanel: which oracle panel is open (null | 'oracle' | 'ritual')
 * - useRitual state machine (interview loop)
 * - useRitualWalk phase machine (scroll-to-card effect)
 * - Auto-trigger walk when a single result converges
 * - Cleanup on complete
 */
export function useRitualOrchestrator({ onSpellClick, navigateToLibrary }) {
  const [activePanel, setActivePanel] = useState(null);

  const ritualWalkHook = useRitualWalk({
    onComplete: (target) => {
      console.log('[orchestrator] walk complete', { target });
      const resolved = grimoireIndex.resolveBySkill(target.skill);
      if (resolved) {
        console.log('[orchestrator] resolved spell', { name: resolved.spell.name, skill: resolved.spell.skill });
        onSpellClick?.(resolved.spell, resolved.school);
      } else {
        console.error('[orchestrator] could not resolve skill', { skill: target.skill });
      }
      setActivePanel(null);
    },
    navigateToLibrary,
  });

  const ritual = useRitual({
    onConverge: (results) => {
      console.log('[orchestrator] onConverge', { count: results.length, results });
      if (results.length === 1) {
        const skill = results[0].skill;
        const school = results[0].school;
        console.log('[orchestrator] auto-starting ritual walk', { skill, school });
        ritualWalkHook.start({ skill, school });
      }
    },
  });

  const handleRitualConverge = useCallback((r) => {
    console.log('[orchestrator] handleRitualConverge', { r });
    const resolved = grimoireIndex.resolveBySkill(r.skill);
    if (resolved) {
      console.log('[orchestrator] resolved spell for converge', { name: resolved.spell.name, skill: resolved.spell.skill });
      onSpellClick?.(resolved.spell, resolved.school);
    } else {
      console.error('[orchestrator] could not resolve skill for converge', { skill: r.skill });
    }
    setActivePanel(null);
  }, [onSpellClick]);

  const openOracle = useCallback(() => {
    setActivePanel('oracle');
  }, []);

  const closeOracle = useCallback(() => {
    setActivePanel(null);
  }, []);

  const openRitual = useCallback(() => {
    console.log('[orchestrator] openRitual');
    setActivePanel('ritual');
    ritual.reset();
  }, [ritual]);

  return {
    activePanel,
    openOracle,
    closeOracle,
    openRitual,
    ritual,
    ritualWalkHook,
    handleRitualConverge,
  };
}
