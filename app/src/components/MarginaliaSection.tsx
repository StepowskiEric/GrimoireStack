import { useCallback, useEffect, useRef, useState } from 'react';
import './Marginalia.css';

/**
 * MarginaliaSection — personal notes textarea with auto-save.
 */
export default function MarginaliaSection({ skill, marginalia }: { skill: string; marginalia?: any }) {
  const initial = marginalia?.getNote(skill) || '';
  const [note, setNote] = useState(initial);
  const [noteStatus, setNoteStatus] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    setNote(marginalia?.getNote(skill) || '');
    setNoteStatus('');
  }, [skill, marginalia]);

  const handleNoteChange = useCallback(
    (e) => {
      const value = e.target.value;
      setNote(value);
      setNoteStatus('saving…');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        marginalia?.setNote(skill, value);
        setNoteStatus('saved');
        timerRef.current = setTimeout(() => setNoteStatus(''), 1400);
      }, 350);
    },
    [skill, marginalia],
  );

  const handleClearNote = useCallback(() => {
    setNote('');
    marginalia?.clear(skill);
    setNoteStatus('cleared');
    setTimeout(() => setNoteStatus(''), 1400);
  }, [skill, marginalia]);

  return (
    <div className="marginalia-section">
      <div className="marginalia-header">
        <span className="marginalia-title">Apprentice Marginalia</span>
        {note ? (
          <button type="button" className="marginalia-clear" onClick={handleClearNote}>
            Erase
          </button>
        ) : null}
      </div>
      <textarea
        className="marginalia-textarea"
        value={note}
        onChange={handleNoteChange}
        placeholder="Scribe your own notes here. They stay on this device."
        aria-label="Personal notes for this spell"
        spellCheck="false"
      />
      <div className="marginalia-status" aria-live="polite">
        {noteStatus}
      </div>
    </div>
  );
}
