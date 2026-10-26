import React, { useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Container, PageHero, Reveal, Section } from '../components/ui/Layout';
import { ButtonLink } from '../components/ui/Button';
import { DownloadButton } from '../components/ui/DownloadButton';
import { FaqList, FaqEntry } from '../components/ui/Faq';
import { CtaBand } from '../components/ui/CtaBand';
import { AppLink } from '../lib/navigation';
import { PAYMENTS_ENABLED, PRICING, formatFcfa } from '../config/site';
import { nb } from '../lib/typo';

const monthlyFor = (employees: number) => PRICING.managerMonthly + employees * PRICING.employeeMonthly;

/** Estimateur : nombre d'employés → montant mensuel. Le serveur reste seul juge du montant facturé. */
const Estimator: React.FC = () => {
  const [employees, setEmployees] = useState(2);
  const inputId = useId();
  const resultId = useId();
  const clamp = (n: number) => Math.max(0, Math.min(PRICING.maxEmployees, Math.round(n || 0)));
  const total = monthlyFor(employees);

  return (
    <div className="rounded-[2rem] bg-white p-7 text-ink sm:p-10">
      <label htmlFor={inputId} className="block text-xl font-bold">
        Combien d&apos;employés dans votre boutique&nbsp;?
      </label>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEmployees((n) => clamp(n - 1))}
          disabled={employees <= 0}
          aria-label="Un employé de moins"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-field transition-transform active:scale-95 disabled:opacity-40"
        >
          <Minus className="h-6 w-6" aria-hidden="true" />
        </button>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={0}
          max={PRICING.maxEmployees}
          value={employees}
          onChange={(e) => setEmployees(clamp(Number(e.target.value)))}
          aria-describedby={resultId}
          className="h-14 w-24 rounded-2xl bg-field text-center text-2xl font-black [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => setEmployees((n) => clamp(n + 1))}
          disabled={employees >= PRICING.maxEmployees}
          aria-label="Un employé de plus"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-field transition-transform active:scale-95 disabled:opacity-40"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div id={resultId} aria-live="polite" className="mt-8">
        <p className="text-lg">
          Gérant {formatFcfa(PRICING.managerMonthly)}
          {employees > 0 && (
            <>
              {' '}+ {employees} × {formatFcfa(PRICING.employeeMonthly)}
            </>
          )}
        </p>
        <p className="mt-2 text-[clamp(2.5rem,1.8rem+2.8vw,4rem)] font-black leading-none tracking-tight">{formatFcfa(total)}</p>
        <p className="mt-1 text-lg">par mois</p>
      </div>
      <p className="mt-6 text-base text-muted">
        Estimation. Le montant exact est calculé par le serveur au moment du paiement.
      </p>
    </div>
  );
};

const STEPS: Array<{ title: string; text: string }> = [
  {
    title: `${PRICING.trialDays} jours d'essai gratuit`,
    text: "L'essai commence à la création de votre boutique dans l'application. Aucun paiement pour commencer.",
  },
  {
    title: 'Un abonnement de 1 mois ou de 12 mois',
    text: "Vous payez la durée choisie à l'avance. Pas de prélèvement automatique : vous renouvelez quand vous voulez.",
  },
  {
    title: `${PRICING.graceDays} jours de grâce après l'échéance`,
    text: "Si vous n'avez pas encore renouvelé, QASH continue de marcher pendant 3 jours.",
  },
  {
    title: 'Puis lecture seule',
    text: 'Vous consultez vos données mais ne pouvez plus en ajouter. Rien n’est effacé : tout revient dès que vous renouvelez.',
  },
];

const PRICING_FAQ: FaqEntry[] = [
  {
    question: 'Que comprend l’abonnement ?',
    answer: <p>Toutes les fonctionnalités de QASH, pour le gérant et pour chaque employé inscrit. Il n’y a pas de formule réduite ni d’option payante en plus.</p>,
  },
  {
    question: 'Comment compter les employés ?',
    answer: (
      <p>
        Chaque employé qui rejoint votre boutique occupe une place, facturée {formatFcfa(PRICING.employeeMonthly)} par mois.
        Le gérant est compté à part, à {formatFcfa(PRICING.managerMonthly)} par mois.
      </p>
    ),
  },
  {
    question: 'Puis-je ajouter un employé en cours d’abonnement ?',
    answer: (
      <p>
        Oui, après votre premier paiement, le gérant peut ajouter des places depuis « Mon espace ». Le montant dépend des
        mois restants et il est calculé par le serveur.
      </p>
    ),
  },
  {
    question: 'Que se passe-t-il si je ne paie pas ?',
    answer: (
      <p>
        Après l’échéance, vous avez {PRICING.graceDays} jours de grâce. Ensuite, QASH passe en lecture seule. Vos données
        restent conservées et tout revient dès que vous renouvelez.
      </p>
    ),
  },
];

export const TarifsPage: React.FC = () => (
  <>
    <PageHero
      title="Des tarifs simples."
      intro={nb(
        `Essai gratuit de ${PRICING.trialDays} jours, puis un prix par personne : ${formatFcfa(PRICING.managerMonthly)} par mois pour le gérant, ${formatFcfa(PRICING.employeeMonthly)} par mois et par employé.`
      )}
    >
      <DownloadButton label="Commencer l'essai gratuit" />
    </PageHero>

    {/* La grille de prix, en deux panneaux */}
    <Section tone="paper" spacing="none" className="pb-20 sm:pb-28">
      <Container>
        <div className="grid gap-4 lg:grid-cols-12">
          <Reveal className="rounded-[2rem] bg-brand-yellow p-8 sm:p-12 lg:col-span-6">
            <h2 className="text-title font-black">Le gérant</h2>
            <p className="mt-8 text-[clamp(3rem,2rem+4vw,5.5rem)] font-black leading-none tracking-tight">
              {PRICING.managerMonthly.toLocaleString('fr-FR')}
            </p>
            <p className="mt-2 text-xl font-bold">FCFA par mois</p>
            <p className="mt-6 max-w-[26rem] text-lg leading-relaxed">
              Le propriétaire de la boutique : il voit tout, gère l’équipe et paie l’abonnement.
            </p>
          </Reveal>
          <Reveal className="rounded-[2rem] bg-ink p-8 text-white sm:p-12 lg:col-span-6" delay={90}>
            <h2 className="text-title font-black">Chaque employé</h2>
            <p className="mt-8 text-[clamp(3rem,2rem+4vw,5.5rem)] font-black leading-none tracking-tight text-brand-yellow">
              {PRICING.employeeMonthly.toLocaleString('fr-FR')}
            </p>
            <p className="mt-2 text-xl font-bold">FCFA par mois</p>
            <p className="mt-6 max-w-[26rem] text-lg leading-relaxed">
              Il encaisse avec son propre accès et voit ses propres ventes.
            </p>
          </Reveal>
        </div>
      </Container>
    </Section>

    {/* L'estimateur */}
    <Section tone="field">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="text-headline font-black">Calculez votre mois.</h2>
            </Reveal>
            <p className="mt-6 text-xl leading-relaxed">
              Exemple&nbsp;: un gérant et deux employés, c&apos;est{' '}
              <strong className="font-black">{formatFcfa(monthlyFor(2))} par mois</strong>.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Estimator />
          </div>
        </div>
      </Container>
    </Section>

    {/* Le déroulé : essai, abonnement, grâce, lecture seule */}
    <Section tone="paper">
      <Container>
        <Reveal>
          <h2 className="max-w-[18ch] text-headline font-black">Du premier jour à l&apos;échéance.</h2>
        </Reveal>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 80}>
              <span aria-hidden="true" className="block h-2 w-16 rounded-full bg-brand-red" />
              <h3 className="mt-6 text-title font-black">{step.title}</h3>
              <p className="mt-3 text-lg leading-relaxed">{nb(step.text)}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>

    {/* Paiement */}
    <Section tone="ink" spacing="compact">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 className="text-headline font-black">
              {PAYMENTS_ENABLED ? 'Payer mon abonnement.' : 'Paiement bientôt disponible.'}
            </h2>
            <p className="mt-6 max-w-[38rem] text-xl leading-relaxed">
              {PAYMENTS_ENABLED
                ? 'Le gérant paie en ligne depuis ce site, après s’être connecté. Le montant de votre boutique est calculé par le serveur.'
                : 'Le paiement en ligne de l’abonnement arrive bientôt sur ce site. En attendant, l’essai gratuit est ouvert à tous.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            {PAYMENTS_ENABLED ? (
              <ButtonLink to="/pricing" variant="yellow" size="lg">
                Payer mon abonnement
              </ButtonLink>
            ) : (
              <ButtonLink to="/contact" variant="light" size="lg">
                Une question&nbsp;? Contactez-nous
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>
    </Section>

    <Section tone="paper">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-headline font-black">Questions sur le prix.</h2>
            <AppLink
              to="/faq"
              className="mt-8 inline-flex min-h-12 items-center text-xl font-bold underline decoration-[3px] underline-offset-[6px] hover:text-brand-red"
            >
              Toutes les questions
            </AppLink>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={PRICING_FAQ} />
          </div>
        </div>
      </Container>
    </Section>

    <CtaBand />
  </>
);
