import React from 'react';
import { PageRoute } from '../types';
import { LegalLayout, LegalList, LegalSection, legalLink } from '../components/ui/LegalLayout';
import { AppLink } from '../lib/navigation';
import { SITE_URL } from '../config/site';
import { COOKIE_NOTICE_KEY } from '../components/CookieNotice';

interface CookiesPageProps {
  onNavigate?: (route: PageRoute) => void;
}

const STORAGES: Array<{ name: string; purpose: React.ReactNode; where: React.ReactNode }> = [
  {
    name: "Session d'authentification Supabase (sb-*-auth-token)",
    purpose: (
      <>
        Mémoriser votre session sécurisée lorsque vous vous connectez à « Mon espace » ou accédez à la gestion de votre
        abonnement, afin d&apos;éviter de devoir ressaisir vos identifiants à chaque page.
      </>
    ),
    where: (
      <>
        Stockage local du navigateur (<code>localStorage</code>) sous le préfixe Supabase. Durée de conservation : limitée
        à la validité de votre session de connexion.
      </>
    ),
  },
  {
    name: 'Mémorisation temporaire de la destination (qash_redirect_after_login)',
    purpose: (
      <>
        Si vous cliquez sur « Payer » depuis la page Tarifs sans être encore connecté, cette clé permet de vous ramener
        automatiquement sur la page Tarifs dès votre connexion réussie, au lieu du tableau de bord générique.
      </>
    ),
    where: (
      <>
        Stockage de session temporaire (<code>sessionStorage</code>). Durée de conservation : détruit dès la connexion
        effectuée ou à la fermeture de votre onglet.
      </>
    ),
  },
  {
    name: "Vérification d'un ajout de places (qash_extend_before)",
    purpose: (
      <>
        Lorsque le gérant ajoute des places employés, cette clé garde le nombre de places avant le paiement, pour confirmer
        sur la page de retour que l&apos;ajout a bien été pris en compte par le serveur.
      </>
    ),
    where: (
      <>
        Stockage de session temporaire (<code>sessionStorage</code>). Durée de conservation : effacé après confirmation ou
        à la fermeture de votre onglet.
      </>
    ),
  },
  {
    name: `Bandeau d'information lu (${COOKIE_NOTICE_KEY})`,
    purpose: <>Ne plus afficher le bandeau d&apos;information sur les cookies une fois que vous l&apos;avez fermé.</>,
    where: (
      <>
        Stockage local du navigateur (<code>localStorage</code>). Durée de conservation : jusqu&apos;à ce que vous
        effaciez les données du site dans votre navigateur.
      </>
    ),
  },
];

export const CookiesPage: React.FC<CookiesPageProps> = () => (
  <LegalLayout current="/cookies" title="Cookies et stockage local" updated="Dernière mise à jour : 26 octobre 2026">
    <LegalSection title="1. Notre engagement de sobriété">
      <p>
        Le site <strong>QASH</strong> (accessible sur <em>{SITE_URL.replace(/^https?:\/\//, '')}</em>) applique un principe
        strict de minimalisme technique concernant les traceurs et données déposées sur votre terminal.
      </p>
      <p>
        À ce jour, notre site{' '}
        <strong>
          n&apos;utilise aucun cookie publicitaire, aucun cookie de ciblage commercial, ni aucun outil d&apos;analyse
          d&apos;audience tiers ou traceur invasif
        </strong>
        . Les polices de caractères sont servies par le site lui-même, sans appel à un service tiers.
      </p>
    </LegalSection>

    <LegalSection title="2. Traceurs et stockages réellement utilisés sur ce site">
      <p>
        Les seuls mécanismes de stockage utilisés sont <strong>strictement nécessaires</strong> au bon fonctionnement
        technique de l&apos;application web et à la sécurisation de votre espace :
      </p>
      <div className="space-y-3">
        {STORAGES.map((s) => (
          <div key={s.name} className="rounded-3xl bg-field p-6">
            <h3 className="text-lg font-bold">{s.name}</h3>
            <p className="mt-1 text-base font-semibold text-success">Strictement nécessaire</p>
            <p className="mt-3 text-base">
              <strong>Finalité :</strong> {s.purpose}
            </p>
            <p className="mt-2 text-base">
              <strong>Emplacement :</strong> {s.where}
            </p>
          </div>
        ))}
      </div>
    </LegalSection>

    <LegalSection title="Pourquoi le bandeau ne vous demande pas votre consentement ?">
      <p>
        Conformément aux directives de la CNIL et au Règlement Général sur la Protection des Données (RGPD), les traceurs
        ayant pour finalité exclusive de permettre ou faciliter la communication par voie électronique, ou étant strictement
        nécessaires à la fourniture d&apos;un service expressément demandé par l&apos;utilisateur (authentification et
        maintien de session), sont <strong>dispensés du recueil préalable de consentement</strong>. Le bandeau affiché sur
        le site vous en informe simplement.
      </p>
      <p className="font-semibold">
        Si des outils de mesure d&apos;audience non anonymisés ou d&apos;autres traceurs non essentiels venaient à être
        ajoutés à l&apos;avenir, un bandeau de consentement préalable clair et conforme sera immédiatement mis en place pour
        recueillir votre accord explicite avant tout dépôt.
      </p>
    </LegalSection>

    <LegalSection title="3. Comment contrôler ou supprimer ces données ?">
      <p>
        Vous pouvez à tout moment consulter, bloquer ou purger les éléments de stockage local et de session en configurant
        les préférences de votre navigateur web :
      </p>
      <LegalList>
        <li><strong>Google Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Données de sites tiers.</li>
        <li><strong>Mozilla Firefox :</strong> Paramètres &gt; Vie privée et sécurité &gt; Cookies et données de sites.</li>
        <li><strong>Apple Safari :</strong> Préférences &gt; Confidentialité &gt; Gérer les données de sites web.</li>
      </LegalList>
      <p>Note : La désactivation complète du stockage local empêchera le maintien de votre connexion dans « Mon espace ».</p>
    </LegalSection>

    <p>
      Consultez également notre{' '}
      <AppLink to="/confidentialite" className={legalLink}>
        Politique de confidentialité
      </AppLink>{' '}
      et nos{' '}
      <AppLink to="/conditions" className={legalLink}>
        Conditions Générales d&apos;Utilisation (CGU)
      </AppLink>
      .
    </p>
  </LegalLayout>
);
