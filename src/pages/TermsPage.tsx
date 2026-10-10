import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { PageRoute } from '../types';

interface TermsPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 sm:py-20 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l&apos;accueil</span>
        </button>

        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-3 border border-rose-100">
            <FileText className="w-3.5 h-3.5" />
            <span>Document contractuel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Conditions Générales d&apos;Utilisation (CGU)
          </h1>
          <p className="text-sm text-neutral-500">
            Dernière mise à jour : 2026 · Applicables à l&apos;application mobile QASH et au site web
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-sm sm:text-base text-neutral-700 leading-relaxed">
          {/* Avertissement modèle juridique */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-normal">
            <strong>Avertissement :</strong> Ce document constitue un modèle indicatif de Conditions Générales d&apos;Utilisation mis à disposition à titre informatif. Il doit être relu et adapté par un professionnel du droit selon votre juridiction d&apos;exercice. QASH ne garantit pas une conformité juridique absolue sans révision personnalisée.
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              1. Objet et champ d&apos;application
            </h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (ci-après les « CGU ») régissent l&apos;accès et l&apos;utilisation de la solution logicielle <strong>QASH</strong>, comprenant l&apos;application mobile pour terminaux Android distribuée via le Google Play Store et l&apos;espace web de gestion accessible sur le site officiel.
            </p>
            <p>
              En installant l&apos;application QASH ou en utilisant les services en ligne, tout utilisateur (gérant de commerce ou employé) accepte sans réserve les présentes conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              2. Description du service QASH
            </h2>
            <p>
              QASH est une solution dédiée aux commerçants et gérants de boutiques facilitant :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>L&apos;enregistrement des encaissements et la gestion de la caisse quotidienne.</li>
              <li>Le suivi en temps réel des stocks de produits et des alertes de réapprovisionnement.</li>
              <li>L&apos;attribution de rôles différenciés entre le gérant de la boutique et ses employés.</li>
              <li>Le fonctionnement <strong>Offline-First</strong> garantissant la continuité des ventes même sans connexion Internet, suivi d&apos;une synchronisation cloud sécurisée lors du retour du réseau.</li>
              <li>Des modules d&apos;assistance automatisée par intelligence artificielle (scan de factures d&apos;approvisionnement et scan optique du panier).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              3. Gestion des comptes et rôles
            </h2>
            <p>
              L&apos;application QASH distingue deux types d&apos;utilisateurs :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Le Gérant (propriétaire du compte boutique) :</strong> responsable de la création du compte, de la souscription aux abonnements, de l&apos;invitation ou de la révocation des employés, ainsi que de l&apos;exactitude des données de son commerce.
              </li>
              <li>
                <strong>L&apos;Employé :</strong> dispose d&apos;accès restreints dédiés à l&apos;encaissement et à la saisie de ventes. L&apos;employé ne peut pas souscrire ou modifier l&apos;abonnement payant de la boutique.
              </li>
            </ul>
            <p>
              Chaque utilisateur est responsable de la confidentialité de ses identifiants et de toutes les activités effectuées sous son profil.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              4. Modalités d&apos;abonnement et paiements
            </h2>
            <p>
              L&apos;application propose une période d&apos;essai gratuite à l&apos;issue de laquelle le gérant peut choisir une formule d&apos;abonnement (mensuelle ou annuelle).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Calcul des tarifs :</strong> les prix sont systématiquement calculés de manière sécurisée côté serveur en fonction du nombre d&apos;utilisateurs et de la formule retenue.</li>
              <li><strong>Paiement mobile money :</strong> les règlements sont opérés via des passerelles agréées (telles que SenePay, Wave, Orange Money). QASH ne stocke aucune coordonnée bancaire confidentielle.</li>
              <li><strong>Activation :</strong> l&apos;activation de l&apos;abonnement intervient dès confirmation par le serveur du succès de la transaction.</li>
              <li><strong>Non-renouvellement :</strong> en l&apos;absence de paiement à l&apos;échéance, l&apos;accès aux fonctions avancées est suspendu, mais les données locales du commerçant demeurent protégées.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              5. Fonctionnalités d&apos;intelligence artificielle
            </h2>
            <p>
              Les fonctions de reconnaissance optique et de traitement automatisé par intelligence artificielle sont fournies comme des outils d&apos;aide à la saisie. L&apos;utilisateur demeure seul responsable de la vérification des montants, libellés et quantités avant validation finale dans son stock ou dans sa caisse.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              6. Disponibilité du service et mode hors-ligne
            </h2>
            <p>
              QASH intègre une architecture résiliente permettant d&apos;enregistrer des transactions localement sans réseau. Le commerçant s&apos;engage à connecter régulièrement son terminal à Internet afin d&apos;assurer la synchronisation et la sauvegarde sur les serveurs sécurisés. QASH met en œuvre des moyens raisonnables pour assurer la disponibilité du service sans obligation de résultat absolu.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              7. Résiliation et suppression de compte
            </h2>
            <p>
              Le gérant peut résilier son abonnement à tout moment. Conformément aux exigences du Google Play Store et aux réglementations relatives aux données personnelles, l&apos;utilisateur peut solliciter la suppression intégrale de son compte et de ses données associées directement depuis l&apos;application mobile ou via la page dédiée :{' '}
              <button
                onClick={() => onNavigate('/suppression-compte')}
                className="text-rose-600 font-semibold hover:underline cursor-pointer"
              >
                Suppression du compte QASH
              </button>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              8. Contact et assistance
            </h2>
            <p>
              Pour toute question ou assistance relative à l&apos;utilisation de QASH, notre équipe de support est joignable par courrier électronique à : <strong>contact@qashapp.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
