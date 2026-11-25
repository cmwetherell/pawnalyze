'use client';

import Image from 'next/image';
import { useState } from 'react';

import { fillClass, onClass, type Tone } from '@/lib/theme/tones';
import { cn } from '@/lib/utils';

export type AvatarSize = 24 | 32 | 40 | 56;

interface AvatarProps {
  name: string;
  src?: string | null;
  size: AvatarSize;
  tone?: Tone;
  /** Grayscale. */
  mono?: boolean;
  /** Initials when there is no picture; made from the name if left out. */
  initials?: string;
  /** Hide from assistive tech: the name is written next to it. */
  decorative?: boolean;
  className?: string;
}

const BOX: Record<AvatarSize, string> = { 24: 'h-6 w-6', 32: 'h-8 w-8', 40: 'h-10 w-10', 56: 'h-14 w-14' };

const makeInitials = (name: string) =>
  (name.includes(',') ? name.split(',').map(s => s.trim()).reverse() : name.split(' ')).filter(Boolean).map(p => p[0]).slice(0, 2).join('');

export function Avatar({ name, src, size, tone, mono = false, initials, decorative = false, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const photo = Boolean(src) && !failed;
  return (
    <span
      title={decorative ? undefined : name}
      {...(photo || decorative ? {} : { role: 'img', 'aria-label': name })}
      className={cn('inline-grid shrink-0 place-items-center overflow-hidden rounded-full', BOX[size], tone ? cn(fillClass[tone], onClass[tone]) : 'bg-sunken text-ink-2', className)}
    >
      {src && !failed ? (
        <Image src={src} alt={decorative ? '' : name} width={size} height={size} onError={() => setFailed(true)} className={cn('h-full w-full object-cover', mono && 'grayscale')} />
      ) : (
        <span aria-hidden className={cn('font-medium leading-none', size <= 24 ? 'type-micro' : size >= 56 ? 'type-body' : 'type-label')}>{initials ?? makeInitials(name)}</span>
      )}
    </span>
  );
}
