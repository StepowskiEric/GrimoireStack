import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

/**
 * Badge primitive — small status pill.
 *
 * <Badge variant="accent">NEW</Badge>
 */
const badgeVariants = cva(
  cn(
    'inline-flex items-center justify-center',
    'font-display font-semibold uppercase tracking-widest',
    'rounded-sm border'
  ),
  {
    variants: {
      variant: {
        default:
          'bg-surface text-text-primary border-border',
        accent:
          'bg-accent-subtle text-accent border-border-strong',
        success:
          'bg-[rgba(106,170,106,.15)] text-[#8aaa6a] border-[rgba(106,170,106,.4)]',
        danger:
          'bg-danger-subtle text-danger border-danger',
        info:
          'bg-[rgba(122,184,201,.15)] text-[#8ab8c9] border-[rgba(122,184,201,.4)]',
        warn:
          'bg-[rgba(196,164,72,.15)] text-[#c9c46a] border-[rgba(201,196,106,.4)]',
      },
      size: {
        sm: 'h-5 px-1.5 text-[0.5rem]',
        md: 'h-6 px-2 text-[0.6rem]',
        lg: 'h-7 px-2.5 text-[0.7rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export function Badge({ className, variant, size, ...props }) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}