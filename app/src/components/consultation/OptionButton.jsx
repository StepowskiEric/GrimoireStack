/**
 * OptionButton — a single cryptic option card.
 *
 * Renders the sigil glyph, the cryptic label, and a subtle
 * press-state. The visual decay (desat, displacement) is applied at
 * the parent level via the `seance-sanity--n` class on the meter.
 */
export default function OptionButton({ option, onTap, disabled }) {
  return (
    <button
      type="button"
      className="seance-option"
      onClick={() => onTap(option.id)}
      disabled={disabled}
      data-option-id={option.id}
    >
      <span className="seance-option__glyph" aria-hidden="true">
        {option.sigilGlyph || '\u2756'}
      </span>
      <span className="seance-option__label">{option.label}</span>
    </button>
  );
}
