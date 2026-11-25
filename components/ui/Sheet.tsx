'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils';
import { IconButton } from './IconButton';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'bottom' | 'full';
  /** Buttons. The first one fills the line on phones. */
  footer?: ReactNode;
  /** Controls in the title row, before Close. */
  tools?: ReactNode;
  className?: string;
  children: ReactNode;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * Dialog over the page: focus trap, Escape, backdrop, scroll lock (globals.css), safe area. Portalled to body so no stacking
 * context traps it. It sets the side edges of everything in it; what it holds sets its own space above and below.
 */
export function Sheet({ open, onClose, title, side = 'bottom', footer, tools, className, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // Read through a ref, so a parent that passes a new function on every render does not steal focus back.
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });

  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); close.current(); return; }
      if (e.key !== 'Tab' || !panel) return;
      // Every step is ours: Safari's own Tab skips buttons, and would leave the dialog from the first one.
      e.preventDefault();
      const at = document.activeElement ?? panel;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(n => n.tabIndex >= 0 && n.checkVisibility({ checkVisibilityCSS: true }));
      const next = nodes.filter(n => at.compareDocumentPosition(n) & (e.shiftKey ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING));
      (e.shiftKey ? next.at(-1) ?? nodes.at(-1) : next[0] ?? nodes[0])?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      restore?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  const full = side === 'full';
  /** One pair of side edges for title, body and footer: the page's own when full. */
  const edge = (children: ReactNode, cls?: string) => (full ? <Container className={cls}>{children}</Container> : <div className={cn('px-4 md:px-6', cls)}>{children}</div>);
  return createPortal(
    <div data-sheet-open="" className="fixed inset-0 z-sheet" role="presentation">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 h-full w-full cursor-default animate-fade bg-overlay/60" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-panel=""
        className={cn(
          'group/panel absolute inset-x-0 bottom-0 flex flex-col bg-raised text-ink shadow-pop outline-none',
          full ? 'top-0 animate-fade' : 'mx-auto max-h-[92dvh] max-w-page animate-sheet rounded-t-lg border-t border-line',
          className,
        )}
      >
        <div className="shrink-0 border-b border-line">
          {edge(
            <div className="flex h-header items-center justify-between gap-4">
              <h2 id={titleId} className="min-w-0 truncate type-ui text-ink">{title}</h2>
              <span className="-mr-3 flex shrink-0 items-center gap-1">
                {tools}
                <IconButton icon="close" label="Close" onClick={onClose} />
              </span>
            </div>,
          )}
        </div>
        <div className={cn('relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain', !footer && 'pb-safe')}>{edge(children)}</div>
        {footer && (
          <div className="shrink-0 border-t border-line pb-safe">
            {edge(<div className="flex flex-wrap items-center gap-3 py-3 [&>:first-child]:flex-1 md:[&>:first-child]:flex-none">{footer}</div>)}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
