import Link from 'next/link';
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';
import { LiveDot } from './LiveDot';
import { Spinner } from './Spinner';
import { isExternal } from './styles';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';
export type ButtonSize = 'md' | 'sm';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'border-action bg-action text-on-action hover:border-action-hover hover:bg-action-hover disabled:hover:border-action disabled:hover:bg-action',
  secondary: 'border-action text-ink hover:bg-sunken disabled:hover:bg-transparent',
  quiet: 'border-transparent text-ink hover:bg-sunken disabled:hover:bg-transparent',
};

/** Shared with SkipLink; everything else uses <Button>. */
export function buttonClass({ variant = 'secondary', size = 'md', full = false }: { variant?: ButtonVariant; size?: ButtonSize; full?: boolean }) {
  return cn(
    'lift inline-flex max-w-full shrink-0 items-center justify-center gap-2 rounded-sm border text-center no-underline sm:whitespace-nowrap',
    'disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress',
    size === 'md' ? 'min-h-12 px-6 type-button' : 'min-h-tap px-4 type-ui',
    VARIANT[variant],
    full && 'w-full min-w-0 shrink',
  );
}

interface ButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  variant?: ButtonVariant;
  /** md 48px, sm 44px. */
  size?: ButtonSize;
  /** Renders a Link, or an <a> for another site. */
  href?: string;
  icon?: IconName;
  iconEnd?: IconName;
  /** Keeps focus and its place, shows a spinner, ignores presses. */
  loading?: boolean;
  full?: boolean;
  /** Live dot before the label. */
  live?: boolean;
  children: ReactNode;
}

const ignorePress = (e: MouseEvent) => e.preventDefault();

export function Button({ variant = 'secondary', size = 'md', href, icon, iconEnd, loading = false, full = false, live = false, className, children, disabled, type = 'button', ...rest }: ButtonProps) {
  const cls = cn(buttonClass({ variant, size, full }), className);
  const inner = (
    <>
      {loading ? <Spinner /> : live ? <LiveDot inherit={variant === 'primary'} /> : icon ? <Icon name={icon} size={16} /> : null}
      <span className="min-w-0">{children}</span>
      {iconEnd && <Icon name={iconEnd} size={16} className="nudge" />}
    </>
  );
  if (href !== undefined) {
    const link = rest as Omit<ComponentPropsWithoutRef<'a'>, 'href'>;
    return isExternal(href)
      ? <a {...link} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
      : <Link {...link} href={href} className={cls}>{inner}</Link>;
  }
  return (
    <button {...rest} type={type} disabled={disabled} className={cls} {...(loading ? { 'aria-busy': true, 'aria-disabled': true, onClick: ignorePress } : {})}>{inner}</button>
  );
}
