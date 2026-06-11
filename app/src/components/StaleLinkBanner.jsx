import { findSimilarSkills } from '../utils/findSimilarSkills.js';
import { useMemo } from 'react';

export default function StaleLinkBanner({ skill, onSelect, onDismiss }) {
  const suggestions = useMemo(() => findSimilarSkills(skill, 4), [skill]);
  if (!skill) return null;
  return (
    <div className="notfound-banner" role="alert" aria-live="polite">
      <div className="notfound-glyph" aria-hidden="true">⚠</div>
      <div className="notfound-body">
        <div className="notfound-title">The incantation has been unbound</div>
        <div className="notfound-msg">
          No spell named <code>{skill}</code> is inscribed in the current grimoire.
        </div>
        {suggestions.length > 0 ? (
          <>
            <div className="notfound-msg" style={{ fontStyle: 'italic', fontSize: '.85rem' }}>
              Did you mean…
            </div>
            <div className="notfound-suggestions">
              {suggestions.map((s) => (
                <button
                  key={s.skill}
                  type="button"
                  className="notfound-suggestion"
                  onClick={() => onSelect?.(s.skill)}
                  title={s.name}
                >
                  ✦ {s.name}
                </button>
              ))}
            </div>
          </>
        ) : null}
        <button type="button" className="notfound-dismiss" onClick={onDismiss}>
          ✕ Dismiss
        </button>
      </div>
    </div>
  );
}
