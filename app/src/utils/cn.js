import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combine class names with Tailwind-aware merge. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
