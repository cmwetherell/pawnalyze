import type { PhotoCredit as Credit } from '@/lib/wcc/photos';

const linkCls = 'underline decoration-current/30 underline-offset-2 hover:decoration-current';

/** "Photo: Frans Peeters · CC BY-SA 2.0", linking to the Commons page and the licence. */
export function PhotoCaption({ photo, className = '' }: { photo: Credit; className?: string }) {
  const licence = photo.license.replace(/\s*\(.*\)$/, '');
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-1 ${className}`}>
      <span aria-hidden>Photo:</span>
      <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className={linkCls} aria-label={`Photo by ${photo.author} on Wikimedia Commons`}>
        {photo.author.replace(/\s*\(.*\)$/, '')}
      </a>
      <span aria-hidden>·</span>
      <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer license" className={linkCls}>{licence}</a>
    </span>
  );
}

/** Full TASL attribution list (title, author, source, licence, changes). */
export function PhotoCreditList({ credits, className = '' }: { credits: Credit[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {credits.map(c => (
        <li key={c.sourceUrl} className="text-xs leading-relaxed text-[var(--text-muted)]">
          <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className={`text-[var(--text-secondary)] font-medium ${linkCls}`}>
            {c.title}
          </a>
          {' '}by{' '}
          {c.authorUrl ? (
            <a href={c.authorUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>{c.author}</a>
          ) : c.author}
          {', '}
          <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer license" className={linkCls}>{c.license}</a>
          , via Wikimedia Commons. {c.modified}.
        </li>
      ))}
    </ul>
  );
}
