import React from 'react';
import { Container, PageHero, Reveal, Section } from '../components/ui/Layout';
import { PhoneMockup } from '../components/ui/PhoneMockup';
import { QIcon } from '../components/ui/Logo';
import { DownloadButton } from '../components/ui/DownloadButton';
import { ButtonLink } from '../components/ui/Button';
import { CtaBand } from '../components/ui/CtaBand';
import { MockupId } from '../config/mockups';
import { PRICING } from '../config/site';
import { nb } from '../lib/typo';

const STEPS: Array<{ title: string; text: string; mockup?: MockupId; tone: 'paper' | 'field' | 'yellow' | 'ink' }> = [
  {
    title: 'Installez QASH',
    text: "Téléchargez l'application sur Google Play depuis votre téléphone Android, puis ouvrez-la.",
    tone: 'paper',
  },
  {
    title: 'Créez votre boutique',
    text: `Créez votre compte, choisissez Gérant et donnez un nom à votre boutique. Vos ${PRICING.trialDays} jours d'essai gratuit commencent à ce moment-là.`,
    tone: 'field',
  },
  {
    title: 'Ajoutez vos produits',
    text: "Pour chaque produit : un nom, un prix de vente, la quantité en stock, et le prix d'achat si vous voulez suivre votre bénéfice. Scannez le code-barres pour aller plus vite.",
    mockup: 'stock',
    tone: 'yellow',
  },
  {
    title: 'Vendez',
    text: "Touchez les produits, encaissez. Le stock baisse tout seul et chaque vente est enregistrée, même sans internet.",
    mockup: 'caisse',
    tone: 'ink',
  },
];

export const HowItWorksPage: React.FC = () => (
  <>
    <PageHero
      title="Quatre étapes, et vous vendez."
      intro="Pas d'installation compliquée, pas de matériel à acheter : votre téléphone Android suffit."
    >
      <DownloadButton />
    </PageHero>

    <ol>
      {STEPS.map((step, i) => (
        <li key={step.title}>
          <Section tone={step.tone} className="overflow-hidden">
            <Container>
              <div className="grid items-center gap-12 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <Reveal>
                    <p aria-hidden="true" className="text-[clamp(4rem,3rem+5vw,8rem)] font-black leading-none tracking-tight">
                      {i + 1}
                    </p>
                    <h2 className="mt-4 text-headline font-black">{step.title}</h2>
                  </Reveal>
                  <Reveal delay={80}>
                    <p className="mt-6 max-w-[34rem] text-xl leading-relaxed sm:text-2xl">{nb(step.text)}</p>
                  </Reveal>
                  {i === 0 && (
                    <div className="mt-8">
                      <DownloadButton variant="dark" />
                    </div>
                  )}
                </div>
                {step.mockup ? (
                  <Reveal className="flex justify-center lg:col-span-5 lg:col-start-8" delay={120}>
                    <div className="h-[460px] overflow-hidden">
                      <PhoneMockup id={step.mockup} width={270} />
                    </div>
                  </Reveal>
                ) : i === 0 ? (
                  <Reveal className="flex justify-center lg:col-span-5 lg:col-start-8" delay={120}>
                    <figure className="flex flex-col items-center gap-4 rounded-[2.5rem] bg-field px-16 py-12">
                      <QIcon size={150} alt="Icône de l'application QASH" />
                      <figcaption className="text-xl font-bold">QASH</figcaption>
                    </figure>
                  </Reveal>
                ) : (
                  <Reveal className="lg:col-span-5 lg:col-start-8" delay={120}>
                    <div className="space-y-3 rounded-[2.5rem] bg-white p-6 sm:p-8" aria-label="Choix du profil à la création du compte" role="img">
                      <p className="text-title font-black">Vous êtes…</p>
                      <div className="rounded-3xl bg-ink p-5 text-white">
                        <p className="text-xl font-black">Gérant</p>
                        <p className="mt-1 text-lg">Créer ma boutique</p>
                      </div>
                      <div className="rounded-3xl bg-field p-5">
                        <p className="text-xl font-black">Employé</p>
                        <p className="mt-1 text-lg">Rejoindre une boutique avec un code</p>
                      </div>
                    </div>
                  </Reveal>
                )}
              </div>
            </Container>
          </Section>
        </li>
      ))}
    </ol>

    <Section tone="paper">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <h2 className="text-headline font-black">{nb('Et votre équipe ?')}</h2>
          </Reveal>
          <div className="lg:col-span-6">
            <p className="text-xl leading-relaxed sm:text-2xl">
              Donnez votre code d&apos;invitation à vos employés. Ils installent QASH, choisissent Employé et saisissent le
              code&nbsp;: ils rejoignent votre boutique et peuvent encaisser.
            </p>
            <ButtonLink to="/fonctionnalites" hash="#equipe" variant="quiet" size="lg" className="mt-8">
              Les rôles dans l&apos;équipe
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>

    <CtaBand />
  </>
);
