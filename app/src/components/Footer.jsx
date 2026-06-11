export default function Footer({ onShowShortcuts, onExportJson, onExportMarkdown }) {
  return (
    <footer>
      <span className="footer-ornament">⚜ ❦ ⚜</span>
      <p>GrimoireStack &copy; 2026 &middot; Forge your own incantations</p>
      <p>
        <a href="https://github.com/StepowskiEric/GrimoireStack" target="_blank" rel="noopener noreferrer">⟐ Browse the source on GitHub ⟐</a>
      </p>
      <p className="footer-install-hint">
        To summon: <code>npx jerry-skills install</code> &middot; visit the <em>Ritual</em> tab above
        {onShowShortcuts ? (
          <>
            {' '}&middot;{' '}
            <button type="button" className="footer-shortcut" onClick={onShowShortcuts} aria-label="Show keyboard shortcuts">
              <span aria-hidden="true">⌨</span> keyboard shortcuts <kbd style={{ fontSize: '.7em', opacity: .8 }}> ? </kbd>
            </button>
          </>
        ) : null}
      </p>
      <div className="footer-export">
        <span className="footer-export-label">Export your config:</span>
        {onExportJson ? (
          <button type="button" className="footer-export-btn" onClick={onExportJson}>
            JSON
          </button>
        ) : null}
        {onExportMarkdown ? (
          <button type="button" className="footer-export-btn" onClick={onExportMarkdown}>
            Markdown
          </button>
        ) : null}
      </div>
    </footer>
  );
}
