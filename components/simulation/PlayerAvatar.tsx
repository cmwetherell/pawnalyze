'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getPlayerColor, getPlayerInitials, getPlayerPhoto } from '@/lib/playerData';

interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeConfig = {
  sm: { classes: 'w-7 h-7 text-[10px]', px: 28 },
  md: { classes: 'w-9 h-9 text-xs', px: 36 },
};

export default function PlayerAvatar({ name, size = 'sm', className = '' }: PlayerAvatarProps) {
  const color = getPlayerColor(name, 0);
  const initials = getPlayerInitials(name);
  const photoSrc = getPlayerPhoto(name);
  const [imgError, setImgError] = useState(false);

  const { classes, px } = sizeConfig[size];
  const showPhoto = photoSrc && !imgError;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 overflow-hidden ${classes} ${className}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {showPhoto ? (
        <Image
          src={photoSrc}
          alt={name}
          width={px}
          height={px}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
