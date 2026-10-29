import React from 'react';
import { Check } from 'lucide-react';
import { Container, PageHero, Reveal, Section } from '../components/ui/Layout';
import { PhoneMockup } from '../components/ui/PhoneMockup';
import { CtaBand } from '../components/ui/CtaBand';
import { MotionSlot } from '../components/ui/MotionSlot';
import { DownloadButton } from '../components/ui/DownloadButton';
import { ButtonLink } from '../components/ui/Button';
import { FEATURES, Feature } from '../content/features';
import { nb } from '../lib/typo';

const TONES: Array<'paper' | 'field'> = ['paper', 'field'];

const PointList: React.FC<{ points: string[]; onDark?: boolean }> = ({ points, onDark }) => (
  <ul className="mt-8 space-y-4">
    {points.map((p) => (
      <li key={p} className="flex gap-3 text-lg leading-relaxed">
        <Check aria-hidden="true" className={`mt-1 h-5 w-5 shrink-0 ${onDark ? 'text-brand-yellow' : 'text-brand-red'}`} strokeWidth={3} />
        <span>{nb(p)}</span>
      </li>
    ))}
  </ul>
);

const FeatureSection: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  const offline = feature.id === 'hors-ligne';
  // Hors ligne : champ noir (le bandeau final, juste après, est rouge)
  const tone = offline ? 'ink' : TONES[index % 2];
  const headingCls = 'text-[clamp(2rem,1.3rem+2.6vw,3.5rem)] font-black leading-none tracking-tight';

  if (feature.mockup) {
    const flip = index % 4 === 3;
    return (
      <Section tone={tone} id={feature.id} className="scroll-mt-20 overflow-hidden">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className={`lg:col-span-6 ${flip ? 'lg:order-2 lg:col-start-7' : ''}`}>
              <Reveal>
                <h2 className={headingCls}>{feature.title}</h2>
                <p className="mt-6 max-w-[34rem] text-xl leading-relaxed sm:text-2xl">{nb(feature.lead)}</p>
              </Reveal>
              <PointList points={feature.points} />
            </div>
            <Reveal className={`flex justify-center lg:col-span-5 ${flip ? 'lg:order-1' : 'lg:col-start-8'}`} delay={100}>
              <div className={`flex w-full max-w-[420px] justify-center rounded-[2.5rem] pt-12 ${index % 2 ? 'bg-white' : 'bg-brand-yellow'}`}>
                <div className="h-[420px] overflow-hidden">
                  <PhoneMockup id={feature.mockup} width={260} />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section tone={tone} id={feature.id} className="scroll-mt-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h2 className={headingCls}>{feature.title}</h2>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={80}>
              <p className="text-xl leading-relaxed sm:text-2xl">{nb(feature.lead)}</p>
            </Reveal>
            <PointList points={feature.points} onDark={offline} />
          </div>
        </div>
        {feature.steps && (
          <ol className="mt-14 grid gap-8 sm:grid-cols-3">
            {feature.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 80}>
                <p
                  aria-hidden="true"
                  className={`text-[clamp(3rem,2.4rem+3vw,5rem)] font-black leading-none ${offline ? 'text-brand-yellow' : 'text-brand-red'}`}
                >
                  {i + 1}
                </p>
                <h3 className="mt-3 text-title font-black">{step.title}</h3>
                <p className="mt-2 text-lg leading-snug">{nb(step.text)}</p>
              </Reveal>
            ))}
          </ol>
        )}
        {offline && <MotionSlot id="trois-etapes" className="mt-12 max-w-[56rem]" />}
      </Container>
    </Section>
  );
};

export const FeaturesPage: React.FC = () => (
  <>
    <PageHero
      title="Tout ce que fait QASH."
      intro="Une caisse, un stock, un cahier de dettes et vos comptes, dans un seul téléphone Android. Et tout marche sans internet, puis se synchronise."
    >
      <DownloadButton />
      <ButtonLink to="/tarifs" variant="quiet" size="lg">
        Voir les tarifs
      </ButtonLink>
    </PageHero>

    <nav aria-label="Fonctionnalités de la page" className="bg-white pb-16">
      <Container>
        <ul className="flex flex-wrap gap-2">
          {FEATURES.map((f) => (
            <li key={f.id}>
              <a
                href={`#${f.id}`}
                className="flex min-h-11 items-center rounded-full bg-field px-4 text-base font-semibold hover:bg-field-strong"
              >
                {f.title}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>

    {FEATURES.map((feature, i) => (
      <FeatureSection key={feature.id} feature={feature} index={i} />
    ))}

    <CtaBand title="Essayez-le dans votre boutique." />
  </>
);
