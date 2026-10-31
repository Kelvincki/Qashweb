import React from 'react';
import { Network } from './social';

/** Icônes de réseaux dessinées en traits (même style que lucide-react), sans dépendance. */
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5H14l.5-3.5h-3V7.8c0-.7.4-1.3 1.3-1.3H15V3z" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 3c.3 2.6 2 4.4 5 4.7" />
  </svg>
);

export const NetworkIcon: React.FC<{ network: Network; className?: string }> = ({ network, className }) => {
  if (network === 'instagram') return <InstagramIcon className={className} />;
  if (network === 'facebook') return <FacebookIcon className={className} />;
  return <TikTokIcon className={className} />;
};
