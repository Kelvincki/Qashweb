import React, { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])';

interface SheetProps {
  /** Identifiant du titre (aria-labelledby). */
  labelledBy: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Largeur maximale sur grand écran. */
  className?: string;
  /** Variables CSS de la boutique (couleur d'accent), à propager à la fenêtre. */
  style?: React.CSSProperties;
}

/**
 * Fenêtre qui monte du bas de l'écran : focus à l'intérieur, Échap pour fermer, Tab qui reste dedans,
 * page figée derrière, retour du focus à l'élément d'origine. Le mouvement est coupé si
 * « réduire les animations » est demandé (voir index.css).
 */
export const Sheet: React.FC<SheetProps> = ({ labelledBy, onClose, children, className = 'sm:max-w-lg', style }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    (panel?.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)) as HTMLElement[];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, []);

  return (
    <div style={style} className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`animate-sheet flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-white text-ink sm:rounded-[2rem] ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
