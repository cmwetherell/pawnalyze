import { fedToIso } from '@/lib/olympiad/fedToIso';

export type FlagSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<FlagSize, number> = { xs: 14, sm: 18, md: 24, lg: 32, xl: 44 };

interface FlagProps {
  code: string;
  size?: FlagSize;
  title?: string;
  className?: string;
  /** Hide from assistive tech when a visible team name sits next to the flag */
  'aria-hidden'?: boolean;
}

/**
 * National flag from `flag-icons` (4:3), sized via font-size. Codes without an ISO flag
 * (FIDE refugee team, IBCA…) render a small badge with the 3-letter code.
 */
export default function Flag({ code, size = 'sm', title, className = '', 'aria-hidden': hidden }: FlagProps) {
  const iso = fedToIso(code);
  const height = SIZE_PX[size];
  const label = title ?? code;

  if (!iso) {
    return (
      <span
        role={hidden ? undefined : 'img'}
        aria-hidden={hidden || undefined}
        aria-label={hidden ? undefined : label}
        title={label}
        className={`inline-flex items-center justify-center shrink-0 rounded-[3px] bg-[var(--bg-surface-3)] text-[var(--text-secondary)] font-bold ring-1 ring-black/10 dark:ring-white/10 ${className}`}
        style={{ width: Math.round(height * 4 / 3), height, fontSize: Math.max(7, Math.round(height * 0.38)), letterSpacing: '-0.02em' }}
      >
        {code.slice(0, 3)}
      </span>
    );
  }

  return (
    <span
      role={hidden ? undefined : 'img'}
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : label}
      title={label}
      className={`fi fi-${iso} shrink-0 rounded-[3px] ring-1 ring-black/10 dark:ring-white/10 ${className}`}
      style={{ fontSize: height, lineHeight: 1 }}
    />
  );
}
