import React from 'react';
import { Wordmark } from './ui/Logo';

interface QashLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | number;
  variant?: 'dark' | 'light';
}

const HEIGHTS = { sm: 26, md: 30, lg: 38 } as const;

/** Ancien composant de logo : affiche désormais le wordmark officiel (public/brand). */
export const QashLogo: React.FC<QashLogoProps> = ({ className = '', size = 'md' }) => {
  const height = typeof size === 'number' ? Math.round(size * 0.7) : HEIGHTS[size];
  return <Wordmark height={height} className={className} />;
};
