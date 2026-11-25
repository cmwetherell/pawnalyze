import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';

import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';
import { isExternal } from './styles';

interface IconButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
  icon: IconName | ReactElement;
  label: string;
  href?: string;
  size?: 44;
  pressed?: boolean;
}

export function IconButton({ icon, label, href, size = 44, pressed, className, title, type = 'button', ...rest }: IconButtonProps) {
  const cls = cn(
    'inline-grid shrink-0 place-items-center rounded-sm text-ink-2 transition-colors duration-in hover:bg-sunken hover:text-ink active:translate-y-px',
    'disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink-2',
    size === 44 && 'h-tap w-tap',
    pressed && 'bg-sunken text-ink',
    className,
  );
  const glyph = typeof icon === 'string' ? <Icon name={icon} /> : icon;
  if (href !== undefined) {
    const link = { ...(rest as Omit<ComponentPropsWithoutRef<'a'>, 'href'>), 'aria-label': label, title: title ?? label, className: cls };
    return isExternal(href)
      ? <a {...link} href={href} target="_blank" rel="noopener noreferrer">{glyph}</a>
      : <Link {...link} href={href}>{glyph}</Link>;
  }
  return (
    <button type={type} aria-label={label} title={title ?? label} aria-pressed={pressed} className={cls} {...rest}>{glyph}</button>
  );
}
