import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function SkipLink() {
  return (
    <a
      href="#main"
      className={cn(buttonClass({ variant: 'primary', size: 'sm' }), 'fixed left-gutter top-2 z-skip -translate-y-24 opacity-0 focus:translate-y-0 focus:opacity-100')}
    >
      Skip to content
    </a>
  );
}
