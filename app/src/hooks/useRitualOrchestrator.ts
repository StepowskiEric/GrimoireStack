import { useCallback, useState } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.ts';
import { useRitual } from './useRitual.ts';
import { useRitualWalk } from './useRitualWalk.ts';

export function useRitualOrchestrator({
  onSpellClick,
  navigateToLibrary,
}: {
  onSpellClick: (spell: { name: string; skill: string; effect: string }, school: { id: string; name: string }) => void;
  navigateToLibrary: () => void;
}) {
  const [activePanel, setActivePanel] = useState<string | null>(null);

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
        const r = results[0] as { skill: string; school: string };
        ritualWalkHook.start({ skill: r.skill, school: r.school });
      }
    },
  });

  const handleRitualConverge = useCallback(
    (r: { skill: string }) => {
      const resolved = grimoireIndex.resolveBySkill(r.skill);
      if (resolved) {
        onSpellClick?.(resolved.spell, resolved.school);
      }
      setActivePanel(null);
    },
    [onSpellClick],
  );

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
