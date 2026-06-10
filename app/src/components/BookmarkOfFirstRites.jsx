import { useCallback } from 'react';
import { FIRST_RITES, BOOKMARK_ACTIONS } from '../data/bookmark.js';

export default function BookmarkOfFirstRites({ onSearchChange, onWizardOpen }) {
  const handleChipClick = useCallback((query) => {
    onSearchChange?.(query);
  }, [onSearchChange]);

  const handleActionClick = useCallback((action) => {
    if (action === 'wizard') {
      onWizardOpen?.();
    }
  }, [onWizardOpen]);

  return (
    <div className="bookmark-wrapper" aria-label="Bookmark of First Rites">
      <div className="bookmark-ribbon" aria-hidden="true" />
      <div className="bookmark-panel">
        <div className="bookmark-title">
          <span className="bookmark-seal" aria-hidden="true">⛧</span>
          <span>Bookmark of First Rites</span>
        </div>
        <div className="bookmark-chips">
          {FIRST_RITES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="bookmark-chip"
              onClick={() => handleChipClick(item.query)}
              title={item.description}
            >
              <span className="bookmark-emoji" aria-hidden="true">{item.emoji}</span>
              <span className="bookmark-label">{item.label}</span>
            </button>
          ))}
          {BOOKMARK_ACTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="bookmark-chip bookmark-chip-action"
              onClick={() => handleActionClick(item.action)}
            >
              <span aria-hidden="true">{item.prefix}</span>
              <span className="bookmark-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
