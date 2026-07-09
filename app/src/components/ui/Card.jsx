import { cn } from '../../utils/cn.js';

/**
 * Card compound component — Pattern 2 from tailwind-design-system skill.
 *
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Optional subtitle</CardDescription>
 *   </CardHeader>
 *   <CardContent>Body</CardContent>
 *   <CardFooter>Actions</CardFooter>
 * </Card>
 */

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface text-text-primary shadow-sm',
        'backdrop-blur-md',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 p-5 border-b border-border', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        'font-display text-lg font-semibold leading-tight tracking-wide text-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('font-body text-sm text-text-muted italic', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 p-5 border-t border-border',
        className
      )}
      {...props}
    />
  );
}