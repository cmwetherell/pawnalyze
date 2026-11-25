import { cn } from '@/lib/utils';
import { Avatar, type AvatarSize } from './Avatar';

interface AvatarStackProps {
  people: { name: string; src?: string | null }[];
  size: AvatarSize;
  /** Names the list for assistive tech. */
  label?: string;
  className?: string;
}

/** Faces in a row, each 8px over the one before, parted by a ring of the ground. `isolate` lets that ring paint over the face before it. */
export function AvatarStack({ people, size, label, className }: AvatarStackProps) {
  return (
    <ul aria-label={label} className={cn('flex flex-wrap items-center gap-y-2 pl-2', className)}>
      {people.map(p => (
        <li key={p.name} className="isolate -ml-2 flex rounded-full ring-2 ring-canvas group-data-[ground=surface]/ground:ring-surface">
          <Avatar name={p.name} src={p.src} size={size} mono />
        </li>
      ))}
    </ul>
  );
}
