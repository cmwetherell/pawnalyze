import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';
import { LiveDot } from './LiveDot';

export type TagTone = 'neutral' | 'live' | 'positive' | 'negative' | 'warning' | 'brand';

const TONE: Record<TagTone, string> = {
  neutral: 'bg-sunken text-ink-2',
  live: 'bg-live-wash text-live',
  positive: 'bg-positive-wash text-positive',
  negative: 'bg-negative-wash text-negative',
  warning: 'bg-warning-wash text-warning',
  brand: 'bg-brand-wash text-brand',
};

/** A state in one or two words. Not a control: use Chip for that. */
export function Tag({ tone = 'neutral', icon, className, children }: { tone?: TagTone; icon?: IconName; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex max-w-full items-center gap-2 rounded-sm px-2 py-1 type-label font-medium', TONE[tone], className)}>
      {tone === 'live' && !icon && <LiveDot />}
      {icon && <Icon name={icon} size={14} />}
      <span className="min-w-0">{children}</span>
    </span>
  );
}
