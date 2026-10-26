import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container, Reveal, Section } from '../components/ui/Layout';
import { DownloadButton } from '../components/ui/DownloadButton';
import { ButtonLink } from '../components/ui/Button';
import { PhoneMockup } from '../components/ui/PhoneMockup';
import { FaqList, FaqEntry } from '../components/ui/Faq';
import { CtaBand } from '../components/ui/CtaBand';
import { AppLink } from '../lib/navigation';
import { PRICING, formatFcfa } from '../config/site';
import { TRADES } from '../content/trades';
import { nb } from '../lib/typo';

const BENEFITS: Array<{ title: string; text: string; tone: string; span: string }> = [
  {
    title: 'Vendre, même sans connexion',
    text: "Ajoutez les produits au panier, le total se calcule seul. Chaque vente est enregistrée avec l'heure et le vendeur.",
    tone: 'bg-ink text-white',
    span: 'lg:col-span-7',
  },
  {
    title: 'Stock et bénéfice',
    text: "Le stock baisse à chaque vente et une alerte vous prévient avant la rupture. Avec vos prix d'achat, QASH calcule votre bénéfice.",
    tone: 'bg-brand-yellow text-ink',
    span: 'lg:col-span-5',
  },
  {
    title: 'Une équipe, des droits',
    text: "Le gérant voit tout. L'employé encaisse et ne voit que ses propres ventes.",
    tone: 'bg-field text-ink',
    span: 'lg:col-span-5',
  },
  {
    title: 'Des rapports clairs',
    text: 'Le bilan du jour, de la semaine ou du mois, et des rapports PDF à garder ou à envoyer.',
    tone: 'bg-field text-ink',
    span: 'lg:col-span-7',
  },
];

const SCREENS = [
  { id: 'caisse' as const, title: 'La caisse', text: 'Le panier, le total, un bouton pour encaisser.' },
  { id: 'stock' as const, title: 'Le stock', text: 'Ce qui reste, ce qui manque, ce qui va manquer.' },
  { id: 'bilan' as const, title: 'Le bilan', text: 'Vos ventes et votre bénéfice, par jour, semaine ou mois.' },
];

const exampleTotal = PRICING.managerMonthly + 2 * PRICING.employeeMonthly;

const SHORT_FAQ: FaqEntry[] = [
  {
    question: 'QASH marche-t-il sans internet ?',
    answer: (
      <p>
        Oui. Vous encaissez et gérez votre stock sans connexion : tout est enregistré sur le téléphone. Dès que vous
        retrouvez internet, QASH synchronise automatiquement vos données.
      </p>
    ),
  },
  {
    question: 'Combien coûte QASH ?',
    answer: (
      <p>
        Les {PRICING.trialDays} premiers jours sont gratuits. Ensuite, {formatFcfa(PRICING.managerMonthly)} par mois pour
        le gérant et {formatFcfa(PRICING.employeeMonthly)} par mois pour chaque employé.{' '}
        <AppLink to="/tarifs" className="font-bold underline decoration-2 underline-offset-4">
          Voir les tarifs
        </AppLink>
      </p>
    ),
  },
  {
    question: 'Mes employés voient-ils tout ?',
    answer: <p>Non. L&apos;employé encaisse et voit ses propres ventes. Le gérant, lui, voit tout.</p>,
  },
  {
    question: 'Que se passe-t-il si je ne paie pas ?',
    answer: (
      <p>
        Après l&apos;échéance, vous gardez {PRICING.graceDays} jours de grâce. Ensuite, QASH passe en lecture seule :
        vous ne perdez rien, vos données restent conservées et tout revient dès que vous renouvelez.
      </p>
    ),
  },
];

export const HomePage: React.FC = () => {
  return (
    <>
      {/* Premier écran : la promesse, les deux actions, l'app */}
      <Section tone="paper" spacing="none" className="overflow-hidden pt-10 sm:pt-16">
        <Container>
          <h1 className="max-w-[15ch] text-display font-black animate-rise">La caisse de votre boutique.</h1>
          <div className="mt-10 grid gap-12 pb-0 lg:mt-14 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-6 lg:pb-24">
              <p className="max-w-[30rem] text-xl leading-relaxed sm:text-2xl">
                Encaissez, suivez votre stock et votre bénéfice sur votre téléphone Android. QASH marche sans internet
                et se synchronise ensuite.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <DownloadButton />
                <ButtonLink to="/comment-ca-marche" variant="quiet" size="lg">
                  Voir comment ça marche
                </ButtonLink>
              </div>
              <p className="mt-6 text-base font-semibold">
                {PRICING.trialDays} jours d&apos;essai gratuit, aucun paiement pour commencer.
              </p>
            </div>
            <div className="relative lg:col-span-6">
              <div className="flex h-[440px] items-end justify-center overflow-hidden rounded-t-[2.5rem] bg-brand-yellow sm:h-[520px] lg:h-[600px]">
                <div className="translate-y-24 rotate-[-4deg] sm:translate-y-20">
                  <PhoneMockup id="caisse" width={290} priority />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Hors ligne */}
      <Section tone="red">
        <Container>
          <Reveal>
            <h2 className="max-w-[16ch] text-headline font-black">{nb('Pas de réseau ? Vous vendez quand même.')}</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-6" delay={80}>
              <p className="text-xl leading-relaxed">
                Les coupures arrivent. Avec QASH, chaque vente est enregistrée sur le téléphone, même hors ligne. Dès
                que vous retrouvez internet, tout se synchronise automatiquement.
              </p>
            </Reveal>
            <ul className="grid gap-8 sm:grid-cols-3 lg:col-span-6">
              {[
                ['Hors ligne', 'La caisse et le stock marchent.'],
                ['De retour en ligne', 'Les ventes partent sur le serveur.'],
                ['Pour toute l’équipe', 'Le gérant retrouve les ventes de chacun.'],
              ].map(([title, text], i) => (
                <Reveal as="li" key={title} delay={120 + i * 80}>
                  <p className="text-title font-black">{title}</p>
                  <p className="mt-2 text-lg leading-snug">{text}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Bénéfices */}
      <Section tone="paper">
        <Container>
          <Reveal>
            <h2 className="max-w-[18ch] text-headline font-black">Tout ce qu&apos;il faut pour tenir la boutique.</h2>
          </Reveal>
          <div className="mt-14 grid gap-4 lg:grid-cols-12">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} className={`${b.span} rounded-[2rem] p-8 sm:p-10 ${b.tone}`} delay={i * 70}>
                <h3 className="text-title font-black">{b.title}</h3>
                <p className="mt-4 max-w-[34rem] text-lg leading-relaxed">{b.text}</p>
              </Reveal>
            ))}
          </div>
          <AppLink
            to="/fonctionnalites"
            className="mt-10 inline-flex min-h-12 items-center gap-2 text-xl font-bold underline decoration-[3px] underline-offset-[6px] hover:text-brand-red"
          >
            Toutes les fonctionnalités
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </AppLink>
        </Container>
      </Section>

      {/* Aperçu de l'app */}
      <Section tone="field">
        <Container>
          <Reveal>
            <h2 className="max-w-[16ch] text-headline font-black">Trois écrans, toute votre boutique.</h2>
          </Reveal>
          <p className="mt-6 max-w-[36rem] text-xl leading-relaxed">
            Des écrans simples, pensés pour le comptoir : de gros boutons, peu de texte, l&apos;essentiel d&apos;un coup
            d&apos;œil.
          </p>
        </Container>
        <div className="mt-14 overflow-x-auto pb-4 [scrollbar-width:none]" tabIndex={0} aria-label="Écrans de l'application">
          <ul className="mx-auto flex w-max snap-x snap-mandatory gap-6 px-5 sm:px-8 lg:w-full lg:max-w-[1240px] lg:justify-between">
            {SCREENS.map((s, i) => (
              <Reveal as="li" key={s.id} className="w-[250px] shrink-0 snap-center sm:w-[290px]" delay={i * 90}>
                <PhoneMockup id={s.id} width={250} className="sm:hidden" />
                <PhoneMockup id={s.id} width={290} className="hidden sm:block" />
                <h3 className="mt-6 text-title font-black">{s.title}</h3>
                <p className="mt-1 text-lg">{s.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* Pour quel commerce */}
      <Section tone="paper">
        <Container>
          <Reveal>
            <h2 className="text-headline font-black">{nb('Pour quel commerce ?')}</h2>
          </Reveal>
          <ul className="mt-12">
            {TRADES.map((trade, i) => (
              <Reveal as="li" key={trade.id} delay={i * 50}>
                <AppLink
                  to="/metiers"
                  hash={`#${trade.id}`}
                  className="group grid gap-1 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-6"
                >
                  <span className="text-[clamp(2rem,1.2rem+3.2vw,3.75rem)] font-black leading-none tracking-tight transition-colors group-hover:text-brand-red sm:col-span-7">
                    {trade.name}
                  </span>
                  <span className="text-lg leading-snug sm:col-span-4">{nb(trade.short)}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="hidden h-7 w-7 justify-self-end transition-transform group-hover:translate-x-1 sm:col-span-1 sm:block"
                  />
                </AppLink>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Offre */}
      <Section tone="ink">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Reveal>
                <h2 className="text-headline font-black text-brand-yellow">
                  {PRICING.trialDays} jours pour essayer, gratuitement.
                </h2>
              </Reveal>
              <p className="mt-8 max-w-[34rem] text-xl leading-relaxed">
                Ensuite, {formatFcfa(PRICING.managerMonthly)} par mois pour le gérant et{' '}
                {formatFcfa(PRICING.employeeMonthly)} par mois pour chaque employé. Abonnement d&apos;un mois ou de douze
                mois.
              </p>
            </div>
            <Reveal className="lg:col-span-5" delay={100}>
              <div className="rounded-[2rem] bg-white p-8 text-ink sm:p-10">
                <p className="text-lg font-semibold">Exemple : un gérant et deux employés</p>
                <p className="mt-3 text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] font-black leading-none tracking-tight">
                  {formatFcfa(exampleTotal)}
                </p>
                <p className="mt-2 text-lg">par mois</p>
                <ButtonLink to="/tarifs" variant="primary" size="lg" className="mt-8 w-full">
                  Voir les tarifs
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* FAQ courte */}
      <Section tone="paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <h2 className="text-headline font-black">Vos questions.</h2>
              </Reveal>
              <AppLink
                to="/faq"
                className="mt-8 inline-flex min-h-12 items-center gap-2 text-xl font-bold underline decoration-[3px] underline-offset-[6px] hover:text-brand-red"
              >
                Toutes les questions
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </AppLink>
            </div>
            <div className="lg:col-span-8">
              <FaqList items={SHORT_FAQ} />
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
};
