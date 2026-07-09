import { cn } from '../../utils/cn.js';

/**
 * Input primitive — Pattern 3 from tailwind-design-system skill.
 *
 * <Input id="email" type="email" error={errors.email?.message} />
 */
export function Input({ className, type = 'text', error, id, ...props }) {
  const errorId = id ? `${id}-error` : undefined;
  return (
    <div className="w-full">
      <input
        id={id}
        type={type}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'flex h-10 w-full rounded-md border bg-surface-raised px-3 py-2',
          'font-body text-sm text-text-primary placeholder:text-text-muted',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          error
            ? 'border-danger focus-visible:ring-danger'
            : 'border-border hover:border-border-hover',
          className
        )}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 font-body text-xs text-danger italic"
        >
          {error}
        </p>
      )}
    </div>
  );
}