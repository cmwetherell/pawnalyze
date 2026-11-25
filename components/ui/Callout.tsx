import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';

export type CalloutTone = 'neutral' | 'brand' | 'positive' | 'warning' | 'negative' | 'live';

interface CalloutProps {
  tone?: CalloutTone;
  icon?: IconName;
  action?: ReactNode;
  onDismiss?: () => void;
  role?: 'status' | 'alert' | 'note';
  className?: string;
  children: ReactNode;
}

const TONE: Record<CalloutTone, string> = {
  neutral: 'border-l-control bg-sunken',
  brand: 'border-l-brand-mark bg-brand-wash',
  positive: 'border-l-positive bg-positive-wash',
  warning: 'border-l-warning bg-warning-wash',
  negative: 'border-l-negative bg-negative-wash',
  live: 'border-l-live bg-live-wash',
};
const ICON: Record<CalloutTone, string> = { neutral: 'text-ink-2', brand: 'text-brand', positive: 'text-positive', warning: 'text-warning', negative: 'text-negative', live: 'text-live' };

/** Wash ground and a 3px left edge in the tone. */
export function Callout({ tone = 'neutral', icon, action, onDismiss, role, className, children }: CalloutProps) {
  return (
    <div role={role ?? (tone === 'negative' ? 'alert' : undefined)} className={cn('flex min-w-0 items-start gap-3 rounded-r-sm border-l-[3px] px-4 py-3 type-body text-ink', TONE[tone], className)}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-64 gap-3">
          {icon && <Icon name={icon} className={cn('mt-0.5', ICON[tone])} />}
          <div className="min-w-0 flex-1 [&>*+*]:mt-1">{children}</div>
        </div>
        {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
      </div>
      {onDismiss && <IconButton icon="close" label="Dismiss" onClick={onDismiss} className="-my-2 -mr-2" />}
    </div>
  );
}
