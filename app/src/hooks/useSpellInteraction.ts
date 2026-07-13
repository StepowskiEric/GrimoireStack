import { useCallback, useEffect, useRef, useState } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.ts';
import { buildPathForSpell, parseSpellFromLocation } from '../utils/urlSpellSync.ts';
import type { Spell, School } from '../data/schema.ts';

function pushSpellUrl(skill: string) {
  if (typeof window === 'undefined') return;
  const target = buildPathForSpell(skill);
  if (window.location.pathname + window.location.search !== target) {
    window.history.pushState(null, '', target);
  }
}

function pushRootUrl() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/') {
    window.history.pushState(null, '', '/');
  }
}

export function useSpellInteraction(castEnabled: boolean) {
  const [modal, setModal] = useState<{ spell: Spell; school: School } | null>(null);
  const [casting, setCasting] = useState<{ spell: Spell; school: School } | null>(null);
  const [notFoundSkill, setNotFoundSkill] = useState<string | null>(null);
  const userOpenedRef = useRef(false);
  const castingKeyRef = useRef<string | null>(null);

  const lockBody = useCallback(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  const unlockBody = useCallback(() => {
    document.body.style.overflow = '';
  }, []);

  const openModal = useCallback(
    (spell: Spell, school: School) => {
      if (!spell?.skill) return;
      setModal({ spell, school });
      setNotFoundSkill(null);
      userOpenedRef.current = true;
      lockBody();
      pushSpellUrl(spell.skill);
    },
    [lockBody],
  );

  const closeModal = useCallback(
    (nextSpell?: Spell, nextSchool?: School) => {
      if (nextSpell && nextSchool) {
        setModal({ spell: nextSpell, school: nextSchool });
        userOpenedRef.current = true;
        pushSpellUrl(nextSpell.skill);
      } else {
        setModal(null);
        unlockBody();
        userOpenedRef.current = false;
        pushRootUrl();
      }
    },
    [unlockBody],
  );

  const handleSpellClick = useCallback(
    (spell: Spell, school: School) => {
      if (!spell?.skill) return;
      const key = `${spell.skill}::${school.id}`;
      if (castEnabled) {
        if (castingKeyRef.current !== key) {
          castingKeyRef.current = key;
          setCasting({ spell, school });
        }
      } else {
        openModal(spell, school);
      }
    },
    [castEnabled, openModal],
  );

  const handleCastComplete = useCallback(() => {
    setCasting((c) => {
      if (c) openModal(c.spell, c.school);
      return null;
    });
    castingKeyRef.current = null;
  }, [openModal]);

  useEffect(() => {
    const skillId = parseSpellFromLocation(window.location);
    if (!skillId) return;
    const found = grimoireIndex.resolveBySkill(skillId);
    if (found) {
      setTimeout(() => {
        openModal(found.spell, found.school);
      }, 300);
    } else {
      setNotFoundSkill(skillId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const skillId = parseSpellFromLocation(window.location);
      if (!skillId) {
        setModal(null);
        unlockBody();
        setNotFoundSkill(null);
        return;
      }
      const found = grimoireIndex.resolveBySkill(skillId);
      if (found) {
        setModal({ spell: found.spell, school: found.school });
        setNotFoundSkill(null);
        lockBody();
      } else {
        setNotFoundSkill(skillId);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [lockBody, unlockBody]);

  const dismissNotFound = useCallback(() => {
    setNotFoundSkill(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  return {
    modal,
    casting,
    handleSpellClick,
    handleCastComplete,
    handleModalClose: closeModal,
    notFoundSkill,
    dismissNotFound,
  };
}
