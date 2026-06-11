export default function Footer({ onShowShortcuts }) {
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
    </footer>
  );
}
