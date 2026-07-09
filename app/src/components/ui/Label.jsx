import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

/**
 * Label primitive — Pattern 3 from tailwind-design-system skill.
 * Pairs with <Input>. Consumers must pass `htmlFor` to associate with a control.
 */
const labelVariants = cva(
  'font-display text-xs font-semibold uppercase tracking-widest text-text-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

export function Label({ className, ...props }) {
  // The consumer is responsible for providing htmlFor or wrapping a control.
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  return <label className={cn(labelVariants(), className)} {...props} />;
}