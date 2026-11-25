import { cloneElement, useId, type ReactElement } from 'react';

import { cn } from '@/lib/utils';

interface ControlProps { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

interface FieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  hideLabel?: boolean;
  className?: string;
  /** Exactly one control. */
  children: ReactElement<ControlProps>;
}

/** Wires label, hint and error to one control. An error never replaces the hint: both stay readable. */
export function Field({ label, hint, error, hideLabel = false, className, children }: FieldProps) {
  const auto = useId();
  const id = children.props.id ?? `${auto}-control`;
  const hintId = `${auto}-hint`;
  const errorId = `${auto}-error`;
  const described = [children.props['aria-describedby'], error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('relative flex min-w-0 flex-col gap-2', className)}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'w-fit type-ui text-ink'}>{label}</label>
      {cloneElement(children, { id, 'aria-describedby': described, 'aria-invalid': error ? true : undefined })}
      {error && <p id={errorId} role="alert" className="type-small text-negative">{error}</p>}
      {hint && <p id={hintId} className="type-small text-ink-3">{hint}</p>}
    </div>
  );
}
