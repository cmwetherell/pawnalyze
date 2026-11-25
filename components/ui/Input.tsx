import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { controlClass } from './styles';

export { controlClass };

export function Input({ className, ...rest }: ComponentPropsWithoutRef<'input'>) {
  return <input className={cn(controlClass, 'h-12', className)} {...rest} />;
}

export function Textarea({ className, mono, ...rest }: ComponentPropsWithoutRef<'textarea'> & { mono?: boolean }) {
  return <textarea spellCheck={mono ? false : undefined} {...(mono ? { autoCapitalize: 'off', autoCorrect: 'off' } : {})} className={cn(controlClass, 'block min-h-32 py-3', mono && 'font-mono', className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentPropsWithoutRef<'select'>) {
  return (
    <span className={cn('relative block', className)}>
      <select className={cn(controlClass, 'h-12 cursor-pointer truncate pr-10')} {...rest}>{children}</select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 top-4 text-ink-3" />
    </span>
  );
}

interface SearchInputProps extends ComponentPropsWithoutRef<'input'> {
  /** Adds a clear button while there is text. */
  onClear?: () => void;
}

export function SearchInput({ className, onClear, ...rest }: SearchInputProps) {
  const clearable = onClear !== undefined && Boolean(rest.value);
  return (
    <span className={cn('relative block', className)}>
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-4 text-ink-3" />
      <input type="search" autoComplete="off" enterKeyHint="search" className={cn(controlClass, 'h-12 pl-10', onClear && 'pr-12 [&::-webkit-search-cancel-button]:appearance-none')} {...rest} />
      {clearable && (
        <button type="button" onClick={onClear} aria-label="Clear" className="absolute right-0.5 top-0.5 grid h-11 w-11 place-items-center rounded-sm text-ink-2 transition-colors duration-in hover:text-ink focus-visible:-outline-offset-2">
          <Icon name="close" size={16} />
        </button>
      )}
    </span>
  );
}
