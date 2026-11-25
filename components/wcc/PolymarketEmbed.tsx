'use client';

import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/components/layout/ThemeProvider';
import { Skeleton } from '@/components/ui/Skeleton';
import { polymarketEmbedUrl } from '@/lib/wcc/config';

/** Official Polymarket embeds; no third-party request until the block scrolls into view. */
export default function PolymarketEmbed({ markets }: { markets: { slug: string; title: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
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
    // A widget is at most 400px wide and centers itself in more, so a wider frame would leave the column's edges.
    <div ref={ref} className="grid justify-between gap-6 grid-cols-[minmax(0,400px)] md:grid-cols-[repeat(2,minmax(0,400px))]">
      {markets.map(m => {
        const id = `${theme}:${m.slug}`;
        return (
          <div key={m.slug} className="relative h-[336px] min-w-0 overflow-hidden">
            {!loaded[id] && (
              <div className="absolute inset-0 flex flex-col justify-between pb-3 pt-1">
                <Skeleton kind="lines" rows={3} />
                <Skeleton kind="chart" height={180} label={`Loading ${m.title}`} />
                <p className="type-small text-ink-3">Polymarket widget, loading</p>
              </div>
            )}
            {visible && (
              <iframe
                key={theme}
                title={m.title}
                src={polymarketEmbedUrl(m.slug, theme)}
                width="100%"
                height="336"
                loading="lazy"
                onLoad={() => setLoaded(l => ({ ...l, [id]: true }))}
                // The widget has no dark canvas of its own; in a dark page the browser would paint it white.
                className="relative block [color-scheme:light]"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
