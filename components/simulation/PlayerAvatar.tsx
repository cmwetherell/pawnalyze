'use client';

import { getPlayerColor, getPlayerInitials } from '@/lib/playerData';

interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

const sizes = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
};

export default function PlayerAvatar({ name, size = 'sm', className = '' }: PlayerAvatarProps) {
  const color = getPlayerColor(name, 0);
  const initials = getPlayerInitials(name);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${sizes[size]} ${className}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </span>
  );
}
