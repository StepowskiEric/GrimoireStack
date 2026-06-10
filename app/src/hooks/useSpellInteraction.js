import { useState, useEffect, useCallback, useRef } from 'react';
import schools from '../data/schools.js';

export function useSpellInteraction(castEnabled) {
  const [modal, setModal] = useState(null);
  const [casting, setCasting] = useState(null);
  const [witchDoctorOpen, setWitchDoctorOpen] = useState(false);
  const prevCastingRef = useRef(null);
  const castCompleteRef = useRef(false);

  const lockBody = useCallback(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  const unlockBody = useCallback(() => {
    document.body.style.overflow = '';
  }, []);

  const openModal = useCallback((spell, school) => {
    setModal({ spell, school });
    lockBody();
  }, [lockBody]);

  const closeModal = useCallback((nextSpell, nextSchool) => {
    if (nextSpell && nextSchool) {
      setModal({ spell: nextSpell, school: nextSchool });
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skillId = params.get('s');
    if (skillId) {
      for (const s of schools) {
        for (const sp of s.spells) {
          if (sp.skill === skillId) {
            setTimeout(() => {
              openModal(sp, s);
            }, 300);
            return;
          }
        }
      }
    }
  }, [openModal]);

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
  };
}
