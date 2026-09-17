'use client';

import { useEffect, useState } from 'react';

interface CopyLinkProps {
  /** Absolute or relative URL; defaults to the current location. */
  href?: string;
  label?: string;
  className?: string;
}

export default function CopyLink({ href, label = 'Copy link', className = '' }: CopyLinkProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const id = setTimeout(() => setState('idle'), 1800);
    return () => clearTimeout(id);
  }, [state]);

  const copy = async () => {
    const url = href ? new URL(href, window.location.href).toString() : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 h-10 text-xs font-medium transition-colors ${
        state === 'copied'
          ? 'bg-emerald-500/15 text-emerald-500'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)]'
      } ${className}`}
    >
      {state === 'copied' ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" /></svg>
      )}
      {state === 'copied' ? 'Link copied' : state === 'failed' ? 'Copy failed' : label}
    </button>
  );
}
