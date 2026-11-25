import { cn } from '@/lib/utils';
import { LOGO_MARK, LOGO_MARK_SMALL, LOGO_VIEWBOX, LOGO_WORD, LOGO_WORD_AT } from '@/lib/theme/logo';

/** `full`: mark and wordmark. `pawn`: the mark alone. Inherits its color; size it by height. */
export function Logo({ kind = 'full', className }: { kind?: 'full' | 'pawn'; className?: string }) {
  if (kind === 'pawn') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" fill="currentColor" className={cn('size-7 shrink-0 text-ink', className)}>
        <path d={LOGO_MARK_SMALL} />
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`} role="img" aria-label="Pawnalyze" fill="currentColor" className={cn('w-auto shrink-0 text-ink', className)}>
      <path d={LOGO_MARK} />
      <path transform={`translate(${LOGO_WORD_AT.x} ${LOGO_WORD_AT.y})`} d={LOGO_WORD} />
    </svg>
  );
}
