import { useState, useEffect, useCallback, useRef } from 'react';
import { grimoireIndex } from '../data/grimoireIndexInstance.js';
import { parseSpellFromLocation, buildPathForSpell } from '../utils/urlSpellSync.js';

function pushSpellUrl(skill) {
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

export function useSpellInteraction(castEnabled) {
  const [modal, setModal] = useState(null);
  const [casting, setCasting] = useState(null);
  const [notFoundSkill, setNotFoundSkill] = useState(null);
  const userOpenedRef = useRef(false);

  const lockBody = useCallback(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  const unlockBody = useCallback(() => {
    document.body.style.overflow = '';
  }, []);

  const openModal = useCallback((spell, school) => {
    setModal({ spell, school });
    setNotFoundSkill(null);
    userOpenedRef.current = true;
    lockBody();
    pushSpellUrl(spell.skill);
  }, [lockBody]);

  const closeModal = useCallback((nextSpell, nextSchool) => {
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
  }, [unlockBody]);

  const handleSpellClick = useCallback((spell, school) => {
    if (castEnabled) {
      setCasting({ spell, school });
    } else {
      openModal(spell, school);
    }
  }, [castEnabled, openModal]);

  // Cast completion is an event, not a state transition. The LidlessEyeCast
  // component calls onComplete when the close phase finishes — we open the
  // modal directly from the event handler, no useEffect cascade needed.
  // We open in a microtask so the cast component can unmount first (avoids
  // the modal mounting on top of the still-rendering eye).
  const handleCastComplete = useCallback(() => {
    setCasting((c) => {
      if (c) openModal(c.spell, c.school);
      return null;
    });
  }, [openModal]);

  // Open spell from URL on mount (do not push — URL is already correct)
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

  // Browser back/forward
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
