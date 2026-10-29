import React from 'react';
import { Container, PageHero, Reveal, Section } from '../components/ui/Layout';
import { FaqList, FaqEntry } from '../components/ui/Faq';
import { ButtonLink } from '../components/ui/Button';
import { AppLink } from '../lib/navigation';
import { PAYMENTS_ENABLED, PRICING, formatFcfa } from '../config/site';

const link = 'font-bold underline decoration-2 underline-offset-4 hover:text-brand-red';

const GROUPS: Array<{ id: string; title: string; items: FaqEntry[] }> = [
  {
    id: 'hors-ligne',
    title: 'Hors ligne et synchronisation',
    items: [
      {
        question: 'Que se passe-t-il sans internet ?',
        answer: (
          <p>
            Rien ne s&apos;arrête. La caisse, le stock et le cahier de dettes marchent sans connexion : tout est
            enregistré sur le téléphone. Il faut seulement internet pour créer votre compte et pour synchroniser.
          </p>
        ),
      },
      {
        question: 'Mes employés voient-ils leurs ventes chez moi ?',
        answer: (
          <p>
            Oui. Quand le téléphone de l&apos;employé se synchronise, ses ventes apparaissent chez le gérant, qui
            retrouve ainsi les ventes de toute l&apos;équipe. L&apos;employé, lui, voit ses propres ventes.
          </p>
        ),
      },
      {
        question: 'Puis-je perdre des ventes ?',
        answer: (
          <p>
            Pas à cause d&apos;une coupure de réseau : chaque vente est enregistrée sur le téléphone, puis envoyée
            automatiquement au retour d&apos;internet. Gardez simplement votre téléphone en bon état et connectez-le
            régulièrement.
          </p>
        ),
      },
      {
        question: 'Quand mes ventes sont-elles synchronisées ?',
        answer: (
          <p>
            Automatiquement, dès que le téléphone est connecté à internet. Vous n&apos;avez rien à faire. Le gérant
            retrouve alors les ventes de toute l&apos;équipe.
          </p>
        ),
      },
      {
        question: 'Et si je perds mon téléphone avant la synchronisation ?',
        answer: (
          <p>
            Les ventes faites hors ligne restent sur le téléphone tant qu&apos;elles ne sont pas synchronisées.
            Connectez-vous régulièrement à internet : une fois synchronisées, elles sont sauvegardées sur nos serveurs
            et vous les retrouvez en vous reconnectant.
          </p>
        ),
      },
    ],
  },
  {
    id: 'donnees',
    title: 'Sécurité des données',
    items: [
      {
        question: 'Mes données sont-elles en sécurité ?',
        answer: (
          <p>
            Les échanges entre votre téléphone et nos serveurs sont chiffrés. Chaque boutique ne voit que ses propres
            données, et chacun n&apos;accède qu&apos;à ce que son rôle permet (gérant ou employé). Le détail est dans
            notre{' '}
            <AppLink to="/confidentialite" className={link}>
              politique de confidentialité
            </AppLink>
            .
          </p>
        ),
      },
      {
        question: 'Qui peut voir mes chiffres ?',
        answer: (
          <p>
            Le gérant voit tout. Un employé encaisse et voit ses propres ventes. Le bénéfice et les chiffres de la
            boutique ne sont pas affichés sur ce site : ils se consultent dans l&apos;application.
          </p>
        ),
      },
      {
        question: 'Comment supprimer mon compte et mes données ?',
        answer: (
          <p>
            Depuis l&apos;application, ou en suivant la procédure de la page{' '}
            <AppLink to="/suppression-compte" className={link}>
              Supprimer mon compte
            </AppLink>
            .
          </p>
        ),
      },
    ],
  },
  {
    id: 'equipe',
    title: 'Équipe',
    items: [
      {
        question: 'Comment ajouter un employé ?',
        answer: (
          <p>
            Donnez-lui le code d&apos;invitation de votre boutique (dans l&apos;application ou dans Mon espace). Il
            installe QASH, choisit Employé et saisit le code.
          </p>
        ),
      },
      {
        question: 'Que voit un employé ?',
        answer: <p>Il encaisse et voit ses propres ventes. Le gérant, lui, voit tout : ventes, stock, bénéfice et équipe.</p>,
      },
      {
        question: "Combien d'employés puis-je avoir ?",
        answer: (
          <p>
            Pendant l&apos;essai, vos employés peuvent rejoindre votre boutique sans limite de places. Après le premier
            paiement, chaque employé occupe une place payée ({formatFcfa(PRICING.employeeMonthly)} par mois), et le
            gérant peut ajouter des places depuis Mon espace.
          </p>
        ),
      },
    ],
  },
  {
    id: 'abonnement',
    title: 'Abonnement et essai',
    items: [
      {
        question: "Comment fonctionne l'essai gratuit ?",
        answer: (
          <p>
            À la création de votre boutique, vous bénéficiez d&apos;un essai gratuit de {PRICING.trialDays} jours pour
            découvrir QASH. Aucun paiement n&apos;est demandé pour commencer.
          </p>
        ),
      },
      {
        question: 'Combien coûte QASH ?',
        answer: (
          <p>
            {formatFcfa(PRICING.managerMonthly)} par mois pour le gérant, plus {formatFcfa(PRICING.employeeMonthly)} par
            mois et par employé. Par exemple, un gérant et deux employés :{' '}
            {formatFcfa(PRICING.managerMonthly + 2 * PRICING.employeeMonthly)} par mois.{' '}
            <AppLink to="/tarifs" className={link}>
              Voir les tarifs
            </AppLink>
          </p>
        ),
      },
      {
        question: 'Comment payer mon abonnement ?',
        answer: PAYMENTS_ENABLED ? (
          <p>
            Sur ce site, depuis la page{' '}
            <AppLink to="/pricing" className={link}>
              Payer mon abonnement
            </AppLink>
            , en vous connectant avec le compte du gérant. Seul le gérant peut payer.
          </p>
        ) : (
          <p>
            Le paiement en ligne de l&apos;abonnement arrive bientôt sur ce site. Pour toute question,{' '}
            <AppLink to="/contact" className={link}>
              contactez-nous
            </AppLink>
            .
          </p>
        ),
      },
      {
        question: "Les jours s'écoulent-ils si je n'utilise pas l'application ?",
        answer: (
          <p>
            Oui. L&apos;abonnement est une période fixée par le serveur : les jours passent même si l&apos;application
            n&apos;est pas utilisée.
          </p>
        ),
      },
      {
        question: 'Que se passe-t-il si je ne paie pas ?',
        answer: (
          <p>
            Après l&apos;échéance, vous gardez {PRICING.graceDays} jours de grâce. Ensuite, QASH passe en lecture seule.
            Vos données restent conservées et tout revient dès que vous renouvelez.
          </p>
        ),
      },
    ],
  },
  {
    id: 'application',
    title: "L'application",
    items: [
      {
        question: 'Sur quels téléphones marche QASH ?',
        answer: <p>Sur les téléphones et tablettes Android.</p>,
      },
      {
        question: "Où télécharger l'application ?",
        answer: (
          <p>
            Sur Google Play. Toutes les étapes sont sur la page{' '}
            <AppLink to="/telecharger" className={link}>
              Télécharger
            </AppLink>
            .
          </p>
        ),
      },
      {
        question: "J'ai oublié mon mot de passe.",
        answer: (
          <p>
            Demandez un lien pour en choisir un nouveau depuis la page{' '}
            <AppLink to="/mot-de-passe-oublie" className={link}>
              Mot de passe oublié
            </AppLink>
            .
          </p>
        ),
      },
    ],
  },
];

export const FaqPage: React.FC = () => (
  <>
    <PageHero title="Questions fréquentes." intro="Les réponses courtes aux questions qu'on nous pose le plus souvent." />

    <nav aria-label="Thèmes" className="bg-white pb-16">
      <Container>
        <ul className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <li key={g.id}>
              <a href={`#${g.id}`} className="flex min-h-11 items-center rounded-full bg-field px-4 text-base font-semibold hover:bg-field-strong">
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>

    {GROUPS.map((group, i) => (
      <Section key={group.id} id={group.id} tone={i % 2 ? 'field' : 'paper'} spacing="compact" className="scroll-mt-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <h2 className="text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-black leading-none tracking-tight">{group.title}</h2>
            </Reveal>
            <div className="lg:col-span-8">
              <FaqList items={group.items} tone={i % 2 ? 'field' : 'paper'} />
            </div>
          </div>
        </Container>
      </Section>
    ))}

    <Section tone="yellow" spacing="compact">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <h2 className="text-headline font-black lg:col-span-8">Pas trouvé votre réponse&nbsp;?</h2>
          <div className="lg:col-span-4 lg:text-right">
            <ButtonLink to="/contact" variant="dark" size="lg">
              Nous contacter
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  </>
);
