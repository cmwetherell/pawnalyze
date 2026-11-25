import { Fragment } from 'react';

import type { PhotoCredit as Credit } from '@/lib/wcc/photos';
import { cn } from '@/lib/utils';

const linkCls = 'text-ink-2 underline decoration-control decoration-1 underline-offset-2 transition-colors duration-in hover:text-ink';

/** Author and license, each a link. */
function Source({ photo }: { photo: Credit }) {
  return (
    <>
      <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className={linkCls} aria-label={`Photo by ${photo.author} on Wikimedia Commons`}>
        {photo.author.replace(/\s*\(.*\)$/, '')}
      </a>
      <span aria-hidden>, </span>
      <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer license" className={linkCls}>{photo.license.replace(/\s*\(.*\)$/, '')}</a>
    </>
  );
}

/** "Photo: Frans Peeters, CC BY-SA 2.0", linking to the Commons page and the license. */
export function PhotoCaption({ photo, className }: { photo: Credit; className?: string }) {
  return (
    <span className={cn('type-micro text-ink-3', className)}>
      <span aria-hidden>Photo: </span>
      <Source photo={photo} />
    </span>
  );
}

/** Several photos in one line: "Photos: A, license; B, license. Backgrounds removed, black and white." `changes` says what was altered. */
export function PhotoCreditLine({ photos, changes, className }: { photos: Credit[]; changes?: string; className?: string }) {
  return (
    <span className={cn('type-micro text-ink-3', className)}>
      {photos.length > 1 ? 'Photos: ' : 'Photo: '}
      {photos.map((p, i) => <Fragment key={p.src}>{i > 0 && '; '}<Source photo={p} /></Fragment>)}
      .{changes && ` ${changes}.`}
    </span>
  );
}

/** Full TASL attribution list (title, author, source, license, changes). */
export function PhotoCreditList({ credits, className }: { credits: Credit[]; className?: string }) {
  return (
    <ul className={cn('space-y-3', className)}>
      {credits.map(c => (
        <li key={`${c.sourceUrl}-${c.src}`} className="max-w-reading type-small text-ink-2">
          <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className={cn(linkCls, 'text-ink')}>{c.title}</a>
          {' '}by{' '}
          {c.authorUrl ? <a href={c.authorUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>{c.author}</a> : c.author}
          {', '}
          <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer license" className={linkCls}>{c.license}</a>
          , via Wikimedia Commons. {c.modified}.
        </li>
      ))}
    </ul>
  );
}
