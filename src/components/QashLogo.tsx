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
      <div
        className={`${iconDimensions} rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm relative shrink-0 transition-transform duration-200 hover:scale-105`}
        style={{ backgroundColor: '#E11D48' }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
        >
          {/* Stylized Modern Q mark */}
          <circle
            cx="19"
            cy="19"
            r="11"
            stroke="white"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M26 26L32 32"
            stroke="white"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          {/* Gold Spark / Accent Dot */}
          <circle cx="27" cy="12" r="2.8" fill="#F59E0B" />
        </svg>
      </div>

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
