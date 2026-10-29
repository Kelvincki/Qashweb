import React from 'react';
import { MOTION, MotionAsset, MotionId } from '../../config/motion';

/** Chemin du site (/motion/…) ou lien https complet ; tout le reste est ignoré. */
function safeUrl(value: string): string {
  const v = value.trim();
  if (v.startsWith('https://') || (v.startsWith('/') && !v.startsWith('//'))) return v;
  return '';
}

function ratioStyle(ratio: string): string {
  return /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(ratio.trim()) ? ratio.trim() : '16/9';
}

/** true si l'emplacement a une vidéo configurée. */
export function hasMotion(id: MotionId): boolean {
  const m = MOTION[id];
  return Boolean(safeUrl(m.src) || safeUrl(m.srcWebm));
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

interface MotionSlotProps {
  id: MotionId;
  /** Illustration actuelle affichée tant que l'animation n'est pas configurée (ou si elle échoue). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Emplacement d'animation : l'image d'affiche (poster) d'abord, puis une vidéo muette en boucle
 * qui ne se charge et ne joue que lorsqu'elle est visible. Avec « réduire les animations », seul
 * le poster fixe est affiché. Les proportions sont réservées d'avance.
 */
export const MotionSlot: React.FC<MotionSlotProps> = ({ id, children, className = '' }) => {
  const asset: MotionAsset = MOTION[id];
  const src = safeUrl(asset.src);
  const srcWebm = safeUrl(asset.srcWebm);
  const poster = safeUrl(asset.poster);
  const reduced = usePrefersReducedMotion();

  const boxRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [near, setNear] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const configured = Boolean(src || srcWebm);
  const playable = configured && !reduced && !failed;

  // Monte la vidéo seulement quand l'emplacement approche de l'écran
  React.useEffect(() => {
    const box = boxRef.current;
    if (!playable || !box || near) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(box);
    return () => io.disconnect();
  }, [playable, near]);

  // Lecture seulement quand la vidéo est réellement visible
  React.useEffect(() => {
    const box = boxRef.current;
    const video = videoRef.current;
    if (!playable || !near || !box || !video) return;
    if (typeof IntersectionObserver === 'undefined') {
      void video.play().catch(() => undefined);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(box);
    return () => io.disconnect();
  }, [playable, near]);

  // Rien de configuré : on garde l'illustration actuelle de la page
  if (!configured || (!poster && !playable)) return <>{children}</>;

  return (
    <div
      ref={boxRef}
      className={`relative w-full overflow-hidden rounded-[2rem] bg-field ${className}`}
      style={{ aspectRatio: ratioStyle(asset.ratio) }}
    >
      {playable && near ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={poster || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={asset.alt}
          onError={() => setFailed(true)}
        >
          {srcWebm && <source src={srcWebm} type="video/webm" />}
          {src && <source src={src} type="video/mp4" />}
        </video>
      ) : (
        poster && (
          <img
            src={poster}
            alt={asset.alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )
      )}
    </div>
  );
};
