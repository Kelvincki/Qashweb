import React from 'react';

interface QashLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

export const QashLogo: React.FC<QashLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  variant = 'dark',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  const textSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  const textColor = variant === 'light' ? 'text-white' : 'text-neutral-900';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* QASH Emblem */}
      <img
        src="/logo_qash.png"
        alt="QASH Logo"
        className={`${iconDimensions} rounded-xl object-contain shrink-0 transition-transform duration-200 hover:scale-110`}
        referrerPolicy="no-referrer"
      />

      {showText && (
        <span
          className={`font-extrabold tracking-tight ${textSize} ${textColor} leading-none`}
        >
          QASH
        </span>
      )}
    </div>
  );
};
