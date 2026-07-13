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
      className="panel-raised w-full text-left p-3 cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      onClick={() => onTap(option.id)}
      disabled={disabled}
      data-option-id={option.id}
    >
      <span className="text-sickly text-lg" aria-hidden="true">
        {option.sigilGlyph || '\u2756'}
      </span>
      <span className="text-text-primary text-[0.95rem]">{option.label}</span>
    </button>
  );
}
