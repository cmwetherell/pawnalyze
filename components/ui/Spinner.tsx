import { cn } from '@/lib/utils';

interface SpinnerProps {
  /** Without a label it is decorative: the busy control says what is happening. */
  label?: string;
  size?: 16 | 20;
  className?: string;
}

export function Spinner({ label, size = 16, className }: SpinnerProps) {
  return (
    <span role={label ? 'status' : undefined} className={cn('inline-flex shrink-0 items-center gap-2', className)}>
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="shrink-0 animate-spin" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <circle cx={12} cy={12} r={9} opacity={0.25} />
        <path d="M21 12a9 9 0 0 0-9-9" />
      </svg>
      {label && <span className="type-small">{label}</span>}
    </span>
  );
}
