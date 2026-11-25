'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { SearchInput } from './Input';
import { ScrollArea } from './ScrollArea';

export interface ComboboxProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  match: (item: T, query: string) => boolean;
  renderOption: (item: T) => ReactNode;
  onSelect: (item: T) => void;
  placeholder?: string;
  ariaLabel?: string;
  /** Text to leave in the input after selecting (default clears it). */
  keepQuery?: (item: T) => string;
  autoFocus?: boolean;
  className?: string;
  /** @deprecated kept for pages not yet migrated */
  inputClassName?: string;
  limit?: number;
  /** Shown when nothing matches. */
  empty?: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/** Accessible search-and-pick input: ARIA combobox, arrow keys, Home, End, Enter, Escape, click-outside. */
export function Combobox<T>({ items, getKey, match, renderOption, onSelect, placeholder = 'Search', ariaLabel, keepQuery, autoFocus, className, limit = 8, empty = 'No matches', id, ...aria }: ComboboxProps<T>) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim();
    return (q ? items.filter(t => match(t, q)) : items).slice(0, limit);
  }, [items, query, match, limit]);

  useEffect(() => {
    const onDoc = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  const choose = (item: T) => {
    onSelect(item);
    setOpen(false);
    setQuery(keepQuery ? keepQuery(item) : '');
    setActive(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = results.length - 1;
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => (open ? Math.min(a + 1, last) : a)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Home' && open && e.ctrlKey) { e.preventDefault(); setActive(0); }
    else if (e.key === 'End' && open && e.ctrlKey) { e.preventDefault(); setActive(Math.max(0, last)); }
    else if (e.key === 'Enter' && open && results[active]) { e.preventDefault(); choose(results[active]); }
    else if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); setOpen(false); }
    else if (e.key === 'Tab') setOpen(false);
  };

  const shown = open && results.length > 0;
  const none = open && results.length === 0 && query.trim() !== '';
  return (
    <div ref={ref} className={cn('relative', className)}>
      <SearchInput
        id={id}
        value={query}
        autoFocus={autoFocus}
        onChange={e => { setQuery(e.target.value); setOpen(true); setActive(0); }}
        onClear={() => { setQuery(''); setActive(0); ref.current?.querySelector('input')?.focus(); }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel ?? (id ? undefined : placeholder)}
        role="combobox"
        aria-expanded={shown}
        aria-controls={shown ? listId : undefined}
        aria-activedescendant={shown && results[active] ? `${listId}-${active}` : undefined}
        aria-autocomplete="list"
        {...aria}
      />
      {shown && (
        <div data-panel="" className="group/panel absolute z-tooltip mt-1 w-full animate-fade overflow-hidden rounded-md border border-line bg-raised shadow-pop">
          <ScrollArea passive label={ariaLabel ?? placeholder} maxHeight={320} follow="[aria-selected='true']" followKey={active}>
            <ul id={listId} role="listbox" aria-label={ariaLabel ?? placeholder} className="py-1">
              {results.map((t, i) => (
                <li
                  key={getKey(t)}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={e => { e.preventDefault(); choose(t); }}
                  onMouseEnter={() => setActive(i)}
                  className={cn('flex min-h-tap cursor-pointer items-center gap-2 px-3 type-data', i === active ? 'bg-sunken text-ink' : 'text-ink-2')}
                >
                  {renderOption(t)}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
      <div role="status">
        {none && <p className="absolute z-tooltip mt-1 w-full rounded-md border border-line bg-raised px-3 py-3 type-data text-ink-2 shadow-pop">{empty}</p>}
      </div>
    </div>
  );
}

export default Combobox;
