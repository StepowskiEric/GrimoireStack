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
      const resolved = grimoireIndex.resolveBySkill(target.skill);
      if (resolved) {
        onSpellClick?.(resolved.spell, resolved.school);
      }
      setActivePanel(null);
    },
    navigateToLibrary,
  });

  const ritual = useRitual({
    onConverge: (results) => {
      if (results.length === 1) {
        ritualWalkHook.start({ skill: results[0].skill, school: results[0].school });
      }
    },
  });

  const handleRitualConverge = useCallback((r) => {
    const resolved = grimoireIndex.resolveBySkill(r.skill);
    if (resolved) {
      onSpellClick?.(resolved.spell, resolved.school);
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
