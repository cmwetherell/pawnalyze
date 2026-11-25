'use client';

import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/components/layout/ThemeProvider';
import { polymarketEmbedUrl } from '@/lib/wcc/config';

/** Official Polymarket embeds; no third-party request until the block scrolls into view. */
export default function PolymarketEmbed({ markets }: { markets: { slug: string; title: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();

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
    <div ref={ref} className="grid gap-6 md:grid-cols-2">
      {markets.map(m => (
        <div key={m.slug} className="grid h-[336px] min-w-0 place-items-center overflow-hidden">
          {visible ? (
            <iframe
              key={theme}
              title={m.title}
              src={polymarketEmbedUrl(m.slug, theme)}
              width="100%"
              height="336"
              loading="lazy"
              // The widget has no dark canvas of its own; in a dark page the browser would paint it white.
              className="block [color-scheme:light]"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <p className="type-small text-ink-3">Polymarket widget loads when visible</p>
          )}
        </div>
      ))}
    </div>
  );
}
