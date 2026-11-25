import { fedToIso } from '@/lib/olympiad/fedToIso';
import { cn } from '@/lib/utils';

export type FlagSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

const SIZE_PX: Record<FlagSize, number> = { xs: 14, sm: 18, md: 24, lg: 32, xl: 44, hero: 72 };
/** A code in place of a flag is never set under 12px; the small sizes widen instead. */
const CODE: Record<FlagSize, string> = { xs: 'type-micro px-0.5', sm: 'type-micro px-0.5', md: 'type-micro', lg: 'type-label', xl: 'type-ui', hero: 'type-h3' };

interface FlagProps {
  /** FIDE federation code (3 letters). */
  code: string;
  size?: FlagSize;
  title?: string;
  /** Hide from assistive tech when the name is written next to it. */
  decorative?: boolean;
  className?: string;
  /** @deprecated use `decorative`; kept for pages not yet migrated */
  'aria-hidden'?: boolean;
}

/** National flag (flag-icons, 4:3). Codes with no ISO flag (FIDE, IBCA) show the 3-letter code. */
export function Flag({ code, size = 'sm', title, decorative, className, 'aria-hidden': ariaHidden }: FlagProps) {
  const iso = fedToIso(code);
  const hidden = decorative ?? ariaHidden ?? false;
  const height = SIZE_PX[size];
  const a11y = { role: hidden ? undefined : 'img', 'aria-hidden': hidden || undefined, 'aria-label': hidden ? undefined : title ?? code, title: title ?? code } as const;
  // Flags are 4:3 at every size, so no font size or line height of the text around them can stretch one.
  const edge = 'relative inline-block shrink-0 overflow-hidden rounded-sm align-middle after:absolute after:inset-0 after:rounded-sm after:border after:border-ink after:opacity-[.12] after:content-[""]';
  if (!iso) {
    return (
      <span {...a11y} className={cn(edge, 'inline-flex items-center justify-center bg-sunken', CODE[size], 'font-medium leading-none text-ink-2', className)} style={{ minWidth: Math.round((height * 4) / 3), height }}>
        {code.slice(0, 3)}
      </span>
    );
  }
  return <span {...a11y} className={cn(`fi fi-${iso}`, edge, className)} style={{ fontSize: height, lineHeight: 1, width: Math.round((height * 4) / 3), height }} />;
}

export default Flag;
