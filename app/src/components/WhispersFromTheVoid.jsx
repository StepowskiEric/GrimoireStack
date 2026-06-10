export default function WhispersFromTheVoid({ searchQuery, totalMatches, onWizardOpen }) {
  if (!searchQuery || totalMatches > 0) return null;

  return (
    <div className="whispers-wrapper" role="status" aria-live="polite">
      <div className="whispers-orb" aria-hidden="true">
        <div className="whispers-orb-inner" />
      </div>
      <div className="whispers-text">
        <div className="whispers-title">The orb grows dark…</div>
        <div className="whispers-body">
          No incantations match your search for <em>"{searchQuery}"</em>.
        </div>
        <div className="whispers-actions">
          <button type="button" className="whispers-action" onClick={onWizardOpen}>
            ✦ Consult the Witch Doctor
          </button>
        </div>
        <div className="whispers-hint">
          Try broader terms like <em>bug</em>, <em>test</em>, <em>review</em>, or <em>architecture</em>.
        </div>
      </div>
    </div>
  );
}
