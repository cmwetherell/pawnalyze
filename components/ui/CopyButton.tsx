'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from './Button';
import { IconButton } from './IconButton';

interface CopyButtonProps {
  kind: 'link' | 'text';
  /** What to copy when kind is text. */
  text?: string;
  /** Relative or absolute; defaults to the current location. */
  href?: string;
  label: string;
  variant?: 'secondary' | 'quiet' | 'icon';
  className?: string;
}

export function CopyButton({ kind, text, href, label, variant = 'quiet', className }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const id = setTimeout(() => setState('idle'), 1800);
    return () => clearTimeout(id);
  }, [state]);

  const copy = async () => {
    const value = kind === 'text' ? text ?? '' : href ? new URL(href, window.location.href).toString() : window.location.href;
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  const icon = state === 'copied' ? 'check' : state === 'failed' ? 'error' : kind === 'link' ? 'link' : 'copy';
  const done = 'Copied';
  const said = state === 'copied' ? done : state === 'failed' ? 'Copy failed' : '';
  return (
    <span className={cn('relative inline-flex max-w-full', className)}>
      {variant === 'icon' ? (
        <IconButton icon={icon} label={label} onClick={copy} />
      ) : (
        <Button variant={variant} size="sm" icon={icon} onClick={copy} className="flex-1">
          {/* Both words share one cell, so the button keeps its width when it answers. */}
          <span className="grid justify-items-center">
            <span className={cn('col-start-1 row-start-1', said && 'invisible')}>{label}</span>
            <span className={cn('col-start-1 row-start-1', !said && 'invisible')}>{said || done}</span>
          </span>
        </Button>
      )}
      <span role="status" className="sr-only">{said}</span>
    </span>
  );
}
