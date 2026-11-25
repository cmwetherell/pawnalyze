'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

interface ChipProps {
  onClick?: () => void;
  href?: string;
  icon?: IconName | ReactNode;
  pressed?: boolean;
  /** Adds a clear button after the label. */
  onClear?: () => void;
  /** Name of the clear button; "Clear" and the label when the label is text. */
  clearLabel?: string;
  tone?: 'neutral' | 'positive' | 'negative';
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
  className?: string;
  children: ReactNode;
}

const TONE = { neutral: 'text-ink', positive: 'text-positive', negative: 'text-negative' } as const;

export function Chip({ onClick, href, icon, pressed, onClear, clearLabel, tone = 'neutral', disabled, title, className, children, ...aria }: ChipProps) {
  const interactive = onClick !== undefined || href !== undefined;
  const cls = cn(
    'inline-flex min-h-tap max-w-full shrink-0 items-center gap-2 whitespace-nowrap rounded-sm border border-control px-3 type-ui transition-colors duration-in',
    pressed ? 'border-action bg-action text-on-action' : cn('bg-raised', TONE[tone]),
    interactive && !onClear && cn('active:translate-y-px disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50', pressed ? 'hover:bg-action-hover' : 'hover:bg-sunken disabled:hover:bg-raised'),
    className,
  );
  const glyph = typeof icon === 'string' ? <Icon name={icon as IconName} size={14} /> : icon;
  const words = <span className="min-w-0 truncate">{children}</span>;
  if (onClear) {
    return (
      <span title={title} className={cn(cls, 'gap-0 py-0 pr-0')}>
        {onClick
          ? <button type="button" onClick={onClick} className="inline-flex min-h-tap min-w-0 items-center gap-2 hover:underline hover:underline-offset-4" {...aria}>{glyph}{words}</button>
          : <span className="inline-flex min-w-0 items-center gap-2">{glyph}{words}</span>}
        <button type="button" onClick={onClear} aria-label={clearLabel ?? (typeof children === 'string' ? `Clear ${children}` : 'Clear')} className="-my-px grid h-tap w-tap shrink-0 place-items-center transition-colors duration-in hover:bg-sunken hover:text-ink">
          <Icon name="close" size={14} />
        </button>
      </span>
    );
  }
  if (href !== undefined) return <Link href={href} title={title} className={cls} {...aria}>{glyph}{words}</Link>;
  if (onClick === undefined) return <span title={title} className={cls} {...aria}>{glyph}{words}</span>;
  return <button type="button" onClick={onClick} disabled={disabled} aria-pressed={pressed} title={title} className={cls} {...aria}>{glyph}{words}</button>;
}
