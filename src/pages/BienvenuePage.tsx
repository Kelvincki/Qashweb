import React from 'react';
import { PageRoute } from '../types';
import { Container, Section } from '../components/ui/Layout';
import { ButtonLink } from '../components/ui/Button';
import { PhoneMockup } from '../components/ui/PhoneMockup';
import { AppLink } from '../lib/navigation';
import { PRICING } from '../config/site';

interface BienvenuePageProps {
  onNavigate?: (route: PageRoute) => void;
}

const STEPS: Array<{ title: string; text: React.ReactNode }> = [
  {
    title: "Ouvrez l'application QASH et connectez-vous",
    text: 'Avec le compte que vous venez de créer : même adresse e-mail, même mot de passe.',
  },
  {
    title: 'Choisissez votre profil',
    text: (
      <>
        <strong className="font-black">Gérant</strong> pour créer votre boutique, ou{' '}
        <strong className="font-black">Employé</strong> pour rejoindre une boutique avec un code d&apos;invitation.
      </>
    ),
  },
  {
    title: `Profitez de ${PRICING.trialDays} jours d'essai gratuit`,
    text: 'Pour découvrir QASH avant tout paiement.',
  },
];

export const BienvenuePage: React.FC<BienvenuePageProps> = () => (
  <>
    <Section tone="paper" spacing="none" className="overflow-hidden pt-14 sm:pt-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="pb-16 lg:col-span-7 lg:pb-24">
            <h1 className="text-display font-black">Bienvenue sur QASH.</h1>
            <p className="mt-8 max-w-[34rem] text-xl leading-relaxed sm:text-2xl">
              Votre compte est prêt. Voici comment démarrer, en trois étapes.
            </p>
            <ol className="mt-10 space-y-6">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-xl font-black text-white"
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-title font-black">{step.title}</span>
                    <span className="mt-1 block text-lg leading-relaxed">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="hidden justify-center lg:col-span-5 lg:flex">
            <div className="flex h-[480px] w-full items-end justify-center overflow-hidden rounded-t-[2.5rem] bg-brand-yellow">
              <div className="translate-y-24">
                <PhoneMockup id="caisse" width={260} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>

    <Section tone="field" spacing="compact">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <p className="text-xl leading-relaxed lg:col-span-7">
            L&apos;essai commence à la création de la boutique. Le paiement se fait uniquement depuis la page{' '}
            <AppLink to="/tarifs" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
              Tarifs
            </AppLink>{' '}
            du site.
          </p>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <ButtonLink to="/dashboard" size="lg">
              Mon espace
            </ButtonLink>
            <ButtonLink to="/" variant="light" size="lg">
              Retour à l&apos;accueil
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  </>
);
