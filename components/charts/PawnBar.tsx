'use client';

import { useId, useState } from 'react';

import { useTween } from '@/hooks/useTween';
import { formatPct } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PawnBarProps {
  /** 0..1 */
  p1: number;
  names: [string, string];
  /** Deal the colors in once, left to right, over gray pawns. */
  deal?: boolean;
  className?: string;
}

const PAWN = 'M10 1.500a5.700 5.700 0 0 1 3.900 9.860h1.700v2.500h-2.300c.1 6.400 1.500 11 4.100 15.640H2.600c2.600-4.640 4-9.240 4.100-15.640H4.400v-2.500h1.700A5.700 5.700 0 0 1 10 1.500ZM1.700 31.200h16.600l.9 5.300H.8Z';
const CELL = { w: 20, h: 40 };

/** 100 pawns, each 1 in 100: one row from 768, four rows of 25 on phones. */
export function PawnBar({ p1, names, deal = false, className }: PawnBarProps) {
  // Once dealt, the animation class goes, so crossing a breakpoint (rotating a phone) does not deal again.
  const [dealt, setDealt] = useState(false);
  const shown = useTween(p1);
  const dealing = deal && !dealt;
  return (
    <div
      role="img"
      aria-label={`${names[0]} ${formatPct(p1)}, ${names[1]} ${formatPct(1 - p1)}. One pawn for each 1 in 100 matches.`}
      onAnimationEnd={() => setDealt(true)}
      className={className}
    >
      <Rows p1={shown} rows={1} deal={dealing} className="hidden md:block" />
      <Rows p1={shown} rows={4} deal={dealing} className="md:hidden" />
    </div>
  );
}

/** One pawn drawn once and reused: the server sends 25 references a row, not 100 outlines a layer. */
function Pawns({ id, rows }: { id: string; rows: 1 | 4 }) {
  const per = 100 / rows;
  return (
    <>
      <path id={`${id}-p`} d={PAWN} />
      <g id={`${id}-r`}>{Array.from({ length: 25 }, (_, i) => <use key={i} href={`#${id}-p`} x={i * CELL.w} />)}</g>
      <g id={`${id}-all`}>{Array.from({ length: 4 }, (_, i) => <use key={i} href={`#${id}-r`} x={per === 100 ? i * 25 * CELL.w : 0} y={per === 100 ? 0 : i * CELL.h} />)}</g>
    </>
  );
}

function Rows({ p1, rows, deal, className }: { p1: number; rows: 1 | 4; deal: boolean; className?: string }) {
  const id = `pawn${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const per = 100 / rows;
  const W = per * CELL.w;
  const H = rows * CELL.h - 3;
  const share = Math.max(0, Math.min(100, p1 * 100));
  const full = Math.min(rows, Math.floor(share / per));
  const part = (share - full * per) * CELL.w;
  const y = full * CELL.h;
  return (
    <div className={cn('relative', className)}>
      {deal && (
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-0 h-auto w-full fill-draw">
          <defs><Pawns id={`${id}g`} rows={rows} /></defs>
          <use href={`#${id}g-all`} />
        </svg>
      )}
      <div className={cn('relative', deal && 'animate-wipe')} style={deal ? { animationDelay: '400ms' } : undefined}>
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="block h-auto w-full">
          <defs>
            <Pawns id={id} rows={rows} />
            <clipPath id={`${id}-a`}><rect width={W} height={y} /><rect y={y} width={part} height={CELL.h} /></clipPath>
            <clipPath id={`${id}-b`}><rect x={part} y={y} width={W} height={CELL.h} /><rect y={y + CELL.h} width={W} height={rows * CELL.h} /></clipPath>
          </defs>
          <use href={`#${id}-all`} clipPath={`url(#${id}-b)`} className="fill-p2" />
          <use href={`#${id}-all`} clipPath={`url(#${id}-a)`} className="fill-p1" />
        </svg>
      </div>
    </div>
  );
}
