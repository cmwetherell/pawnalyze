'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, type ReactNode } from 'react';

import { PawnBar } from '@/components/charts/PawnBar';
import { Delta } from '@/components/ui/Delta';
import { Flag } from '@/components/ui/Flag';
import { Icon } from '@/components/ui/Icon';
import { goldLine } from '@/components/ui/styles';
import { useTween } from '@/hooks/useTween';
import { formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface FaceOffSide {
  id: 1 | 2;
  name: string;
  role: string;
  isChampion: boolean;
  rating: number | null;
  /** Federation code. */
  flag: string;
  /** Names the flag. */
  country?: string;
  portrait: { src: string; alt: string; cutout: boolean };
}

export interface FaceOffProps {
  /** hero: full size; feature: home and index, same parts, portraits 220px */
  variant: 'hero' | 'feature';
  sides: [FaceOffSide, FaceOffSide];
  /** null before odds exist */
  p1: number | null;
  /** Shows Delta over each figure when a scenario moves it. Pass it (or null) whenever picks are possible: it keeps the room. */
  base?: number | null;
  /** 0..1 for side one: what a pointed-at pick would make it. */
  preview?: number | null;
  score: ReactNode;
  scoreLabel: string;
  verdict?: ReactNode;
  /** Line under the pawn bar. */
  notes?: [ReactNode, ReactNode];
  actions?: ReactNode;
  next?: ReactNode;
  /** A ruled row over the portraits, with `next` at its right end: where the page has no title of its own for the match. */
  heading?: ReactNode;
  /** Where the whole figure leads: the heading becomes a link with an arrow, and the rest of the figure is its target too. */
  href?: string;
  /** Names the link where there is no heading. */
  hrefLabel?: string;
  credit?: ReactNode;
  /** Finished state. */
  champion?: { name: string; line: string } | null;
  className?: string;
}

/** Two portraits on one rule, the two odds, a hundred pawns. With `href` all of it is one link, under its own buttons and credit links. */
export function FaceOff({ variant, sides, p1, base, preview, score, scoreLabel, verdict, notes, actions, next, heading, href, hrefLabel, credit, champion, className }: FaceOffProps) {
  const titleId = useId();
  const [a, b] = sides;
  const hero = variant === 'hero';
  /** The room a change stands in is kept from the start, so a pick never shifts the page. */
  const moves = base !== undefined || preview !== undefined;
  const flip = (v: number | null | undefined) => (v === null || v === undefined ? v : 1 - v);
  const scoreSlot = (cls: string) => (
    <div className={cn('text-center', cls)}>
      <div className="whitespace-nowrap type-h3 text-ink md:type-h2">{score}</div>
      <div className="type-label text-ink-2 md:type-small">{scoreLabel}</div>
    </div>
  );
  const foot = ((next && !heading) || actions) && (
    <>
      {next && !heading && <div className="min-w-0 type-small text-ink-2">{next}</div>}
      {/* On phones two short buttons share the line and fill it; longer ones take a line each. */}
      {actions && <div className="relative z-10 flex flex-wrap gap-3 [&>*]:grow sm:[&>*]:grow-0">{actions}</div>}
    </>
  );

  return (
    <div role="group" aria-labelledby={titleId} className={cn(href && 'group/face relative isolate', className)}>
      {href && !heading && <Link href={href} aria-label={hrefLabel} className="absolute inset-0 z-[1]" />}
      <p id={titleId} className="sr-only">
        {p1 === null ? `${a.name} against ${b.name}` : `${a.name} ${formatPct(p1)}, ${b.name} ${formatPct(1 - p1)} to win the match`}
      </p>

      {heading && (
        <div className="mb-4 mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line pt-4 md:mb-6 md:mt-0">
          {heading && href ? (
            <Link href={href} className={cn('group/link inline-flex min-h-tap items-center gap-3 after:absolute after:inset-0 after:z-[1] group-hover/face:underline', goldLine)}>
              {heading}
              <Icon name="arrow-right" size={20} className="shrink-0 text-ink transition-transform duration-in group-hover/face:translate-x-1" />
            </Link>
          ) : heading}
          {next && <div className="type-small text-ink-2">{next}</div>}
        </div>
      )}

      <div
        className={cn(
          'grid grid-cols-[minmax(0,34fr)_minmax(0,32fr)_minmax(0,34fr)] items-end gap-x-2 md:gap-x-6 md:border-b-2 md:border-rule xl:gap-x-8',
          hero ? 'md:grid-cols-[minmax(0,21fr)_minmax(0,58fr)_minmax(0,21fr)] xl:grid-cols-[268px_minmax(0,1fr)_268px]' : 'md:grid-cols-[minmax(0,17fr)_minmax(0,66fr)_minmax(0,17fr)] xl:grid-cols-[220px_minmax(0,1fr)_220px]',
        )}
      >
        <Portrait side={a} className="col-start-1 row-start-1" />
        {scoreSlot('col-start-2 row-start-1 pb-3 md:hidden')}
        <Portrait side={b} className="col-start-3 row-start-1" />

        <div className="col-span-3 row-start-2 min-w-0 border-t-2 border-rule pt-2 [container-type:inline-size] md:col-span-1 md:col-start-2 md:row-start-1 md:border-t-0 md:pt-0">
          <div className="grid grid-cols-2 items-end gap-x-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <Name side={a} finished={Boolean(champion)} />
            {scoreSlot('hidden md:block')}
            <Name side={b} finished={Boolean(champion)} right />
          </div>
          {champion ? (
            <div className="mt-4 pb-4 md:mt-7">
              <p className="flex items-center gap-3 type-h1 text-ink"><Icon name="crown" size={24} className="text-brand-mark" />{champion.name}</p>
              <p className="mt-2 type-standfirst text-ink-2">{champion.line}</p>
            </div>
          ) : p1 === null ? <div aria-hidden className="h-2 md:h-4" /> : (
            <div className={cn('flex items-end justify-between gap-x-4 pb-1 md:gap-x-6 xl:gap-x-12 xl:pb-1.5', moves ? 'mt-10 md:mt-12' : 'mt-6 md:mt-8')}>
              <Figure value={p1} base={base} preview={preview} />
              <Figure value={1 - p1} base={flip(base)} preview={flip(preview)} right />
            </div>
          )}
        </div>
      </div>

      {p1 !== null && <PawnBar className="pt-3" p1={p1} names={[a.name, b.name]} deal />}
      {notes && <div className="mt-2 flex flex-col justify-between gap-x-6 type-small text-ink-2 md:flex-row"><span>{notes[0]}</span><span className="md:text-right">{notes[1]}</span></div>}

      {verdict ? (
        <div className="mt-8 grid grid-cols-1 items-center gap-x-6 gap-y-6 lg:grid-cols-12">
          <div aria-live="polite" className="type-standfirst text-ink lg:col-span-7">{verdict}</div>
          {foot && <div className="flex flex-col gap-3 lg:col-span-5 lg:border-l lg:border-line lg:pl-6">{foot}</div>}
        </div>
      ) : foot && (
        <div className="mt-6 flex flex-col gap-3">{foot}</div>
      )}
      {credit && <div className="relative z-10 mt-6 w-fit type-micro text-ink-3">{credit}</div>}
    </div>
  );
}

/** The player's field, filled from 13% down; the black-and-white cut-out breaks out of its top edge. */
function Portrait({ side, className }: { side: FaceOffSide; className?: string }) {
  const field = side.id === 1 ? 'bg-p1-field' : 'bg-p2-field';
  const { src, alt, cutout } = side.portrait;
  return (
    <div className={cn('relative aspect-square overflow-hidden md:aspect-[1/1.1]', className)}>
      <span aria-hidden className={cn('absolute inset-x-0 bottom-0 top-[13%] origin-bottom group-data-[enter]/enter:animate-grow', field)} />
      {cutout ? (
        <Image src={src} alt={alt} width={704} height={948} priority sizes="(min-width: 768px) 268px, 34vw" className="absolute inset-x-0 top-0 h-auto w-full origin-bottom grayscale group-data-[enter]/enter:animate-settle" />
      ) : (
        <span className="absolute inset-x-0 bottom-0 top-[13%] p-[3px]">
          <span className="relative block h-full w-full overflow-hidden"><Image src={src} alt={alt} fill priority sizes="(min-width: 768px) 268px, 34vw" className="object-cover object-top grayscale" /></span>
        </span>
      )}
    </div>
  );
}

function Name({ side, finished, right = false }: { side: FaceOffSide; /** The match is over: one crown, beside the winner. */ finished: boolean; right?: boolean }) {
  const role = finished && side.isChampion ? 'Defending champion' : side.role;
  const [first, rest] = role.startsWith('World ') ? ['World ', role.slice(6)] : ['', role];
  return (
    <div className={cn('min-w-0', right && 'text-right')}>
      <p className="truncate pb-0.5 type-h2 text-ink">{side.name}</p>
      <p className={cn('flex items-center gap-x-2 whitespace-nowrap type-label text-ink-2 sm:type-small', right && 'justify-end')}>
        {side.isChampion && !finished && <Icon name="crown" size={14} className="text-brand-mark" />}
        <Flag code={side.flag} size="xs" title={side.country} decorative={!side.country} className="hidden shrink-0 [@container_(min-width:40rem)]:inline-block" />
        <span className="min-w-0 truncate">
          {/* Long words wait for room between the portraits; a finished match has the longest, and in a narrow one keeps only the rating. */}
          <span className={finished && side.rating ? 'hidden [@container_(min-width:40rem)]:inline' : undefined}>{first && <span className="hidden [@container_(min-width:40rem)]:inline">{first}</span>}{rest}{side.rating ? ', ' : ''}</span>
          {side.rating}
        </span>
      </p>
    </div>
  );
}

interface FigureProps { value: number; base?: number | null; preview?: number | null; right?: boolean }

/** The headline odds. What moved it stands in the gap above, so a pick never shifts the page. */
function Figure({ value, base, preview, right = false }: FigureProps) {
  const text = formatPct(useTween(value));
  const would = preview !== null && preview !== undefined;
  return (
    <div className={cn('relative min-w-0', right && 'text-right')}>
      {(would || (base !== null && base !== undefined)) && (
        <span className={cn('absolute bottom-full flex items-center gap-2 whitespace-nowrap pb-1.5 type-label text-ink-2 md:pb-3', right ? 'right-0' : 'left-0')}>
          {would ? <>would be <span className="font-medium text-ink tnum">{formatPct(preview)}</span><Delta value={preview} base={value} /></> : <Delta value={value} base={base ?? value} />}
        </span>
      )}
      <p aria-hidden className={cn('text-ink', text.length > 6 ? 'type-h1 whitespace-nowrap' : 'type-figure')}>
        {text.slice(0, -1)}
        <span className="text-ink-3" style={{ fontSize: '.44em', verticalAlign: '.82em', lineHeight: 0 }}>%</span>
      </p>
    </div>
  );
}
