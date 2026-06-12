import { getSchoolSigil } from '../data/schoolSigils.jsx';

interface Props {
  schoolId: string;
  size?: number | string;
  className?: string;
  animated?: boolean;
}

// Renders the school's hand-drawn sigil (the same one used in LidlessEyeCast)
// at any size. When `animated` is true, the sigil draws on with the same
// stroke-dashoffset animation used during the cast.
export default function SchoolSigil({ schoolId, size = 24, className, animated = false }: Props) {
  const Sigil = getSchoolSigil(schoolId);
  return (
    <svg
      className={`school-sigil ${animated ? 'lidless-eye__sigil--drawing' : ''} ${className || ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-testid="school-sigil"
      data-school-id={schoolId}
    >
      <Sigil />
    </svg>
  );
}
