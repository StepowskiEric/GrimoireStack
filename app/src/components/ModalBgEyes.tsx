/**
 * ModalBgEyes — decorative background peering eyes for the spell modal.
 */
export default function ModalBgEyes() {
  return (
    <div className="modal-bg-eyes" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, i) => (
        <span key={i} className={`modal-bg-eye modal-bg-eye--${i + 1}`}>
          <svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">
            <ellipse
              cx="20"
              cy="12"
              rx="18"
              ry="10"
              fill="#0a0a0a"
              stroke="rgba(196,184,152,0.18)"
              strokeWidth="0.6"
            />
            <ellipse cx="20" cy="12" rx="11" ry="8" fill="rgba(138,154,106,0.35)" />
            <ellipse cx="20" cy="12" rx="4.5" ry="3.2" fill="#020203" />
            <ellipse cx="20" cy="12" rx="1.2" ry="1.2" fill="rgba(196,184,152,0.45)" />
          </svg>
        </span>
      ))}
    </div>
  );
}
