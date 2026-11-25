import Image from 'next/image';

import { cn } from '@/lib/utils';

/** `width` and `height` as drawn, in the ratio of the file. `color`: the logo has its own colors and is never turned white. */
export interface LogoItem { src: string; alt: string; width: number; height: number; href?: string; color?: boolean }

/** One publication logo; `press` turns it white in dark. SVGs skip the optimizer. */
export function Logo({ logo, className }: { logo: LogoItem; className?: string }) {
  return <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} unoptimized className={cn(!logo.color && 'press', 'object-contain object-left', className)} style={{ width: logo.width, height: logo.height }} />;
}

export function LogoRow({ label, logos, className }: { label: string; logos: LogoItem[]; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-8 gap-y-4', className)}>
      <span className="type-small text-ink-2">{label}</span>
      {logos.map(l => (l.href
        ? <a key={l.alt} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-tap items-center"><Logo logo={l} /></a>
        : <Logo key={l.alt} logo={l} />))}
    </div>
  );
}
