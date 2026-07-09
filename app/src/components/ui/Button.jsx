import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

/**
 * Button primitive — Pattern 1 from tailwind-design-system skill.
 *
 * Variants:
 *   default  — gold-accented primary action
 *   secondary — muted background, neutral action
 *   outline  — bordered, transparent fill
 *   ghost    — no chrome, hover surface only
 *   danger   — destructive action (oxblood)
 *
 * Sizes:
 *   sm / md / lg / icon
 */
const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-display font-semibold uppercase tracking-wider',
    'rounded-md transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50'
  ),
  {
    variants: {
      variant: {
        default:
          'bg-accent text-ink hover:bg-accent-hover border border-border-strong',
        secondary:
          'bg-surface text-text-primary border border-border hover:border-border-hover hover:bg-surface-raised',
        outline:
          'bg-transparent text-text-primary border border-border hover:bg-surface hover:border-border-hover',
        ghost:
          'bg-transparent text-text-primary hover:bg-surface hover:text-accent',
        danger:
          'bg-danger-subtle text-danger border border-danger hover:bg-danger-hover',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type === 'submit' ? 'submit' : type === 'reset' ? 'reset' : 'button'}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
export { buttonVariants };