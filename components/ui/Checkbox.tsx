import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Icon } from './Icon';

interface CheckboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> { label: ReactNode }

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn('group/check inline-flex min-h-tap cursor-pointer items-center gap-3 type-ui text-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50', className)}>
      <span className="relative grid h-5 w-5 shrink-0 place-items-center">
        <input
          type="checkbox"
          className="peer absolute inset-0 m-0 h-full w-full cursor-[inherit] appearance-none rounded-sm border border-control bg-raised transition-colors duration-in checked:border-action checked:bg-action group-hover/check:border-ink"
          {...rest}
        />
        <Icon name="check" size={14} className="pointer-events-none relative text-on-action opacity-0 peer-checked:opacity-100" />
      </span>
      {label}
    </label>
  );
}
