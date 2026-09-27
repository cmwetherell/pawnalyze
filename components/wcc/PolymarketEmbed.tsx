'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { polymarketEmbedUrl } from '@/lib/wcc/config';

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => mo.disconnect();
}
function useSiteTheme(): 'dark' | 'light' {
  return useSyncExternalStore(
    subscribeTheme,
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    () => 'dark',
  );
}

/** Official Polymarket embeds; no third-party request until the block scrolls into view. */
export default function PolymarketEmbed({ markets }: { markets: { slug: string; title: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const theme = useSiteTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setVisible(true); io.disconnect(); }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid md:grid-cols-2 gap-3">
      {markets.map(m => (
        <div key={m.slug} className="h-[336px] rounded-xl overflow-hidden flex justify-center">
          {visible ? (
            <iframe
              key={theme}
              title={m.title}
              src={polymarketEmbedUrl(m.slug, theme)}
              width="400"
              height="336"
              loading="lazy"
              className="block w-[400px] max-w-full h-[336px] border-0 rounded-xl"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="w-[400px] max-w-full h-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface-2)] grid place-items-center text-xs text-[var(--text-muted)]">Polymarket widget loads when visible</div>
          )}
        </div>
      ))}
    </div>
  );
}
