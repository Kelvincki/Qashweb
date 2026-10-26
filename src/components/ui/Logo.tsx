import React, { useState } from 'react';

interface WordmarkProps {
  /** Hauteur affichée en pixels. */
  height?: number;
  className?: string;
  /** Laisser vide si un texte voisin nomme déjà QASH (logo décoratif). */
  alt?: string;
}

const WORDMARK_RATIO = 1021 / 410;

/**
 * Wordmark « Qash » fourni (public/brand). À utiliser sur fond clair uniquement :
 * le fichier a un fond blanc, fondu dans le fond par mix-blend-mode.
 * Si le fichier manque, repli texte : Q rouge, « ash » noir en italique.
 */
export const Wordmark: React.FC<WordmarkProps> = ({ height = 32, className = '', alt = 'QASH' }) => {
  const [failed, setFailed] = useState(false);
  const width = Math.round(height * WORDMARK_RATIO);

  if (failed) {
    return <TextWordmark height={height} className={className} label={alt} />;
  }

  return (
    <picture className={`inline-block shrink-0 ${className}`}>
      <source
        type="image/webp"
        srcSet="/brand/qash-wordmark-160.webp 160w, /brand/qash-wordmark-320.webp 320w, /brand/qash-wordmark-640.webp 640w"
        sizes={`${width}px`}
      />
      <img
        src="/brand/qash-wordmark-320.png"
        width={width}
        height={height}
        alt={alt}
        className="logo-blend block h-auto max-w-full"
        style={{ width, height: 'auto' }}
        decoding="async"
        onError={() => setFailed(true)}
      />
    </picture>
  );
};

/** Repli texte du logo (TODO : à remplacer par une version SVG officielle). */
export const TextWordmark: React.FC<{ height?: number; className?: string; label?: string }> = ({
  height = 32,
  className = '',
  label = 'QASH',
}) => (
  <span
    className={`inline-flex items-baseline font-black leading-none tracking-tight ${className}`}
    style={{ fontSize: height }}
    aria-label={label}
    role="img"
  >
    <span className="text-brand-red">Q</span>
    <span className="italic text-ink">ash</span>
  </span>
);

/** Icône carrée « Q » (favicon, icône d'app). */
export const QIcon: React.FC<{ size?: number; className?: string; alt?: string }> = ({
  size = 48,
  className = '',
  alt = '',
}) => (
  <img
    src={size > 96 ? '/brand/icon-512.png' : '/brand/icon-192.png'}
    width={size}
    height={size}
    alt={alt}
    className={`shrink-0 ${className}`}
    decoding="async"
  />
);
