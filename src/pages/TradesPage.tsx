import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container, PageHero, Reveal, Section } from '../components/ui/Layout';
import { CtaBand } from '../components/ui/CtaBand';
import { TRADES } from '../content/trades';
import { AppLink } from '../lib/navigation';
import { nb } from '../lib/typo';

// Un champ de couleur par métier, en alternant pour que deux voisins ne se ressemblent pas
const TONES = ['paper', 'yellow', 'field', 'ink', 'paper', 'field'] as const;

export const TradesPage: React.FC = () => (
  <>
    <PageHero
      title={nb('Pour quel commerce ?')}
      intro="QASH est fait pour les commerces de quartier : ceux qui vendent beaucoup, vite, souvent à crédit, et pas toujours avec du réseau."
    />

    <nav aria-label="Métiers" className="bg-white pb-16">
      <Container>
        <ul className="flex flex-wrap gap-2">
          {TRADES.map((t) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                className="flex min-h-11 items-center rounded-full bg-field px-4 text-base font-semibold hover:bg-field-strong"
              >
                {t.name}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>

    {TRADES.map((trade, i) => {
      const tone = TONES[i % TONES.length];
      const onDark = tone === 'ink';
      return (
        <Section key={trade.id} id={trade.id} tone={tone} className="scroll-mt-20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <Reveal>
                  <h2 className="text-headline font-black">{trade.name}</h2>
                </Reveal>
                <Reveal delay={80}>
                  <p className="mt-6 max-w-[34rem] text-xl leading-relaxed sm:text-2xl">{nb(trade.intro)}</p>
                </Reveal>
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                <h3 className="text-title font-black">Au quotidien</h3>
                <ul className="mt-6 space-y-5">
                  {trade.points.map((point, k) => (
                    <Reveal as="li" key={point} delay={120 + k * 60} className="text-lg leading-relaxed">
                      <span
                        aria-hidden="true"
                        className={`mr-3 inline-block h-3 w-3 rounded-full align-middle ${onDark ? 'bg-brand-yellow' : 'bg-brand-red'}`}
                      />
                      {nb(point)}
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </Section>
      );
    })}

    <Section tone="paper" spacing="compact">
      <Container>
        <AppLink
          to="/fonctionnalites"
          className="inline-flex min-h-12 items-center gap-2 text-xl font-bold underline decoration-[3px] underline-offset-[6px] hover:text-brand-red"
        >
          Voir toutes les fonctionnalités
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </AppLink>
      </Container>
    </Section>

    <CtaBand />
  </>
);
