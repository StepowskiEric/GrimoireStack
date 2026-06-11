import { useState, useEffect, useCallback, useRef } from 'react';
import schools from '../data/schools.js';
import { parseSpellFromLocation, buildPathForSpell } from '../utils/urlSpellSync.js';

function findSpellBySkill(skill) {
  for (const s of schools) {
    for (const sp of s.spells) {
      if (sp.skill === skill) return { spell: sp, school: s };
    }
  }
  return null;
}

export function useSpellInteraction(castEnabled) {
  const [modal, setModal] = useState(null);
  const [casting, setCasting] = useState(null);
  const [witchDoctorOpen, setWitchDoctorOpen] = useState(false);
  const [notFoundSkill, setNotFoundSkill] = useState(null);
  const prevCastingRef = useRef(null);
  const castCompleteRef = useRef(false);
  const userOpenedRef = useRef(false);

  const lockBody = useCallback(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  const unlockBody = useCallback(() => {
    document.body.style.overflow = '';
  }, []);

  const syncUrlToModal = useCallback((m) => {
    if (typeof window === 'undefined') return;
    if (m) {
      const target = buildPathForSpell(m.spell.skill);
      if (window.location.pathname + window.location.search !== target) {
        window.history.replaceState(null, '', target);
      }
    } else if (userOpenedRef.current) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const openModal = useCallback((spell, school) => {
    setModal({ spell, school });
    setNotFoundSkill(null);
    userOpenedRef.current = true;
    lockBody();
  }, [lockBody]);

  const closeModal = useCallback((nextSpell, nextSchool) => {
    if (nextSpell && nextSchool) {
      setModal({ spell: nextSpell, school: nextSchool });
      userOpenedRef.current = true;
    } else {
      setModal(null);
      unlockBody();
    }
  }, [unlockBody]);

  const handleSpellClick = useCallback((spell, school) => {
    if (castEnabled) {
      setCasting({ spell, school });
    } else {
      openModal(spell, school);
    }
  }, [castEnabled, openModal]);

  const handleCastComplete = useCallback(() => {
    castCompleteRef.current = true;
    setCasting(null);
  }, []);

  useEffect(() => {
    if (casting) {
      prevCastingRef.current = casting;
    }
  }, [casting]);

  useEffect(() => {
    if (!casting && castCompleteRef.current && prevCastingRef.current && !modal) {
      const prev = prevCastingRef.current;
      prevCastingRef.current = null;
      castCompleteRef.current = false;
      setTimeout(() => {
        openModal(prev.spell, prev.school);
      }, 50);
    }
  }, [casting, modal, openModal]);

  const handleWitchDoctorSelect = useCallback((spell, school) => {
    setWitchDoctorOpen(false);
    handleSpellClick(spell, school);
  }, [handleSpellClick]);

  const handleWitchDoctorClose = useCallback(() => {
    setWitchDoctorOpen(false);
  }, []);

  // Keep URL in sync with the open modal
  useEffect(() => {
    syncUrlToModal(modal);
  }, [modal, syncUrlToModal]);

  // Open spell from URL on mount
  useEffect(() => {
    const skillId = parseSpellFromLocation(window.location);
    if (!skillId) return;
    const found = findSpellBySkill(skillId);
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
      const found = findSpellBySkill(skillId);
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
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  return {
    modal,
    casting,
    witchDoctorOpen,
    setWitchDoctorOpen,
    handleSpellClick,
    handleCastComplete,
    handleModalClose: closeModal,
    handleWitchDoctorSelect,
    handleWitchDoctorClose,
    notFoundSkill,
    dismissNotFound,
  };
}
