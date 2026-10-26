import React from 'react';
import { PageRoute } from '../types';
import { LegalLayout, LegalList, LegalSection, legalLink } from '../components/ui/LegalLayout';
import { AppLink } from '../lib/navigation';
import { CONTACT_EMAIL } from '../config/site';

interface TermsPageProps {
  onNavigate?: (route: PageRoute) => void;
}

export const TermsPage: React.FC<TermsPageProps> = () => (
  <LegalLayout
    current="/conditions"
    title="Conditions générales d'utilisation"
    updated="Dernière mise à jour : 2026 · Applicables à l'application mobile QASH et au site web"
    notice={
      <>
        <strong>Avertissement :</strong> Ce document constitue un modèle indicatif de Conditions Générales d&apos;Utilisation
        mis à disposition à titre informatif. Il doit être relu et adapté par un professionnel du droit selon votre
        juridiction d&apos;exercice. QASH ne garantit pas une conformité juridique absolue sans révision personnalisée.
      </>
    }
  >
    <LegalSection title="1. Objet et champ d'application">
      <p>
        Les présentes Conditions Générales d&apos;Utilisation (ci-après les « CGU ») régissent l&apos;accès et
        l&apos;utilisation de la solution logicielle <strong>QASH</strong>, comprenant l&apos;application mobile pour
        terminaux Android distribuée via le Google Play Store et l&apos;espace web de gestion accessible sur le site
        officiel.
      </p>
      <p>
        En installant l&apos;application QASH ou en utilisant les services en ligne, tout utilisateur (gérant de commerce
        ou employé) accepte sans réserve les présentes conditions.
      </p>
    </LegalSection>

    <LegalSection title="2. Description du service QASH">
      <p>QASH est une solution dédiée aux commerçants et gérants de boutiques facilitant :</p>
      <LegalList>
        <li>L&apos;enregistrement des encaissements et la gestion de la caisse quotidienne.</li>
        <li>Le suivi des stocks de produits et des alertes de réapprovisionnement, avec une synchronisation automatique dès que vous êtes connecté à internet.</li>
        <li>L&apos;attribution de rôles différenciés entre le gérant de la boutique et ses employés.</li>
        <li>Le fonctionnement <strong>Offline-First</strong> garantissant la continuité des ventes même sans connexion Internet, suivi d&apos;une synchronisation cloud sécurisée lors du retour du réseau.</li>
        <li>Des modules d&apos;assistance automatisée par intelligence artificielle (scan de factures d&apos;approvisionnement et scan optique du panier).</li>
      </LegalList>
    </LegalSection>

    <LegalSection title="3. Gestion des comptes et rôles">
      <p>L&apos;application QASH distingue deux types d&apos;utilisateurs :</p>
      <LegalList>
        <li>
          <strong>Le Gérant (propriétaire du compte boutique) :</strong> responsable de la création du compte, de la
          souscription aux abonnements, de l&apos;invitation ou de la révocation des employés, ainsi que de l&apos;exactitude
          des données de son commerce.
        </li>
        <li>
          <strong>L&apos;Employé :</strong> dispose d&apos;accès restreints dédiés à l&apos;encaissement et à la saisie de
          ventes. L&apos;employé ne peut pas souscrire ou modifier l&apos;abonnement payant de la boutique.
        </li>
      </LegalList>
      <p>Chaque utilisateur est responsable de la confidentialité de ses identifiants et de toutes les activités effectuées sous son profil.</p>
    </LegalSection>

    <LegalSection title="4. Modalités d'abonnement et paiements">
      <p>
        L&apos;application propose une période d&apos;essai gratuite à l&apos;issue de laquelle le gérant peut choisir une
        formule d&apos;abonnement (mensuelle ou annuelle).
      </p>
      <LegalList>
        <li><strong>Calcul des tarifs :</strong> les prix sont systématiquement calculés de manière sécurisée côté serveur en fonction du nombre d&apos;utilisateurs et de la formule retenue.</li>
        <li><strong>Paiement mobile money :</strong> les règlements sont opérés via des passerelles agréées (telles que SenePay, Wave, Orange Money). QASH ne stocke aucune coordonnée bancaire confidentielle.</li>
        <li><strong>Activation :</strong> l&apos;activation de l&apos;abonnement intervient dès confirmation par le serveur du succès de la transaction.</li>
        <li><strong>Non-renouvellement :</strong> en l&apos;absence de paiement à l&apos;échéance, l&apos;accès aux fonctions avancées est suspendu, mais les données locales du commerçant demeurent protégées.</li>
      </LegalList>
    </LegalSection>

    <LegalSection title="5. Fonctionnalités d'intelligence artificielle">
      <p>
        Les fonctions de reconnaissance optique et de traitement automatisé par intelligence artificielle sont fournies
        comme des outils d&apos;aide à la saisie. L&apos;utilisateur demeure seul responsable de la vérification des
        montants, libellés et quantités avant validation finale dans son stock ou dans sa caisse.
      </p>
    </LegalSection>

    <LegalSection title="6. Disponibilité du service et mode hors-ligne">
      <p>
        QASH intègre une architecture résiliente permettant d&apos;enregistrer des transactions localement sans réseau. Le
        commerçant s&apos;engage à connecter régulièrement son terminal à Internet afin d&apos;assurer la synchronisation et
        la sauvegarde sur les serveurs sécurisés. QASH met en œuvre des moyens raisonnables pour assurer la disponibilité du
        service sans obligation de résultat absolu.
      </p>
    </LegalSection>

    <LegalSection title="7. Résiliation et suppression de compte">
      <p>
        Le gérant peut résilier son abonnement à tout moment. Conformément aux exigences du Google Play Store et aux
        réglementations relatives aux données personnelles, l&apos;utilisateur peut solliciter la suppression intégrale de
        son compte et de ses données associées directement depuis l&apos;application mobile ou via la page dédiée :{' '}
        <AppLink to="/suppression-compte" className={legalLink}>
          Suppression du compte QASH
        </AppLink>
        .
      </p>
    </LegalSection>

    <LegalSection title="8. Contact et assistance">
      <p>
        Pour toute question ou assistance relative à l&apos;utilisation de QASH, notre équipe de support est joignable par
        courrier électronique à : <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </LegalSection>
  </LegalLayout>
);
