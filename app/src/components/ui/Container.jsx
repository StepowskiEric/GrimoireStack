import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

/**
 * Container primitive — Pattern 4 from tailwind-design-system skill.
 *
 * <Container size="lg">...</Container>
 *
 * Sizes map to Tailwind's max-w-* breakpoints plus responsive horizontal padding.
 */
const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
});

export function Container({ className, size, ...props }) {
  return <div className={cn(containerVariants({ size }), className)} {...props} />;
}