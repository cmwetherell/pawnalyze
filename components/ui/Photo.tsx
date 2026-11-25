import Image from 'next/image';

import { cn } from '@/lib/utils';
import type { PhotoCredit } from '@/lib/wcc/photos';
import { PhotoCaption } from './PhotoCredit';

/** A credited photo, or the site's own picture (no author, no caption). */
export type PhotoSource = PhotoCredit | { src: string; alt: string; focal?: string };

interface PhotoProps {
  photo: PhotoSource;
  ratio: '1/1' | '4/3' | '3/2' | '16/9' | '3/4';
  sizes: string;
  priority?: boolean;
  mono?: boolean;
  credit?: 'below' | 'none';
  /** Scales 1.025 inside its frame when an ancestor link is hovered. */
  zoom?: boolean;
  className?: string;
}

const RATIO = { '1/1': 'aspect-square', '4/3': 'aspect-[4/3]', '3/2': 'aspect-[3/2]', '16/9': 'aspect-video', '3/4': 'aspect-[3/4]' } as const;

export function Photo({ photo, ratio, sizes, priority = false, mono = false, credit = 'below', zoom = false, className }: PhotoProps) {
  return (
    <figure className={className}>
      <div className={cn('relative overflow-hidden rounded-sm bg-sunken', RATIO[ratio], zoom && 'zoom-frame')}>
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className={cn('object-cover', mono && 'grayscale')} style={{ objectPosition: photo.focal }} />
      </div>
      {credit === 'below' && 'license' in photo && <figcaption className="mt-2"><PhotoCaption photo={photo} /></figcaption>}
    </figure>
  );
}
