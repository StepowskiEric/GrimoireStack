import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combine class names with Tailwind-aware merge. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Consistent accessible focus ring — apply to interactive elements. */
export const focusRing =
  'outline-none ring-2 ring-ring ring-offset-2 ring-offset-ring-offset';

/** Disabled state preset — pointer + opacity. */
export const disabled = 'disabled:pointer-events-none disabled:opacity-50';