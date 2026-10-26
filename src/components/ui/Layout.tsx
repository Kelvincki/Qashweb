import React, { useEffect, useRef, useState } from 'react';

/** Conteneur : une seule paire de marges égales sur tout le site. */
export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mx-auto w-full max-w-[1240px] px-5 sm:px-8 ${className}`}>{children}</div>
);

type Tone = 'paper' | 'field' | 'ink' | 'red' | 'yellow';

const TONES: Record<Tone, string> = {
  paper: 'bg-white text-ink',
  field: 'bg-field text-ink',
  ink: 'bg-ink text-white',
  red: 'bg-brand-red text-white',
  yellow: 'bg-brand-yellow text-ink',
};

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: Tone;
  /** Espacement vertical : standard (sections) ou compact. */
  spacing?: 'default' | 'compact' | 'none';
}

/** Section pleine largeur, un champ de couleur plat. */
export const Section: React.FC<SectionProps> = ({ tone = 'paper', spacing = 'default', className = '', children, ...rest }) => {
  const pad = spacing === 'default' ? 'py-20 sm:py-28 lg:py-36' : spacing === 'compact' ? 'py-14 sm:py-20' : '';
  return (
    <section className={`${TONES[tone]} ${pad} ${className}`} {...rest}>
      {children}
    </section>
  );
};

/**
 * Apparition discrète au défilement (opacité + 18 px). Sans IntersectionObserver
 * ou avec « réduire les animations », le contenu est simplement visible.
 */
export const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number; as?: 'div' | 'li' }> = ({
  children,
  className = '',
  delay = 0,
  as = 'div',
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<'idle' | 'pending' | 'done'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return; // déjà visible : rien à animer
    setState('pending');
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('done');
          obs.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cls = state === 'pending' ? 'reveal-pending' : state === 'done' ? 'reveal-done' : '';
  const Tag = as as any;
  return (
    <Tag ref={ref} className={`${cls} ${className}`} style={delay && state === 'done' ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
};

interface PageHeroProps {
  title: string;
  intro: React.ReactNode;
  tone?: Tone;
  children?: React.ReactNode;
  /** Élément affiché à droite sur grand écran (maquette, liste…). */
  aside?: React.ReactNode;
}

/** En-tête des pages intérieures : titre très grand, une phrase, un champ de couleur. */
export const PageHero: React.FC<PageHeroProps> = ({ title, intro, tone = 'paper', children, aside }) => (
  <Section tone={tone} spacing="none" className="pb-16 pt-14 sm:pb-24 sm:pt-20">
    <Container>
      <div className={aside ? 'grid items-end gap-12 lg:grid-cols-12' : ''}>
        <div className={aside ? 'lg:col-span-7' : ''}>
          <h1 className="text-display font-black animate-rise">{title}</h1>
          <p className="mt-8 max-w-[38rem] text-xl leading-relaxed sm:text-2xl">{intro}</p>
          {children && <div className="mt-10 flex flex-wrap gap-3">{children}</div>}
        </div>
        {aside && <div className="lg:col-span-5">{aside}</div>}
      </div>
    </Container>
  </Section>
);
