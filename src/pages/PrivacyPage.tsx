import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { PageRoute } from '../types';

interface PrivacyPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
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
            <Shield className="w-3.5 h-3.5" />
            <span>Document légal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-neutral-500">
            Dernière mise à jour : 2026 · Conforme aux standards de protection des données
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-sm sm:text-base text-neutral-700 leading-relaxed">
          {/* Note sur les informations contractuelles */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-normal">
            <strong>Note d&apos;information :</strong> Ce document définit les engagements de confidentialité pris par QASH à l&apos;égard des utilisateurs et commerçants. Les mentions entre crochets correspondent aux coordonnées légales de l&apos;entité éditrice.
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              1. Responsable du traitement
            </h2>
            <p>
              Le traitement des données personnelles recueillies dans le cadre de l&apos;utilisation du site vitrine et des services QASH est opéré par :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Raison sociale :</strong> [NOM DE L&apos;ENTREPRISE]</li>
              <li><strong>Adresse postale :</strong> [ADRESSE]</li>
              <li><strong>Courrier électronique officiel :</strong> [EMAIL QASH]</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              2. Données collectées
            </h2>
            <p>
              Dans le cadre de la fourniture du service QASH aux commerçants et gérants de boutiques, nous pouvons collecter et traiter les catégories d&apos;informations suivantes :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Informations d&apos;identification du compte :</strong> nom du gérant, adresse email, identifiants des employés créés sous la responsabilité du gérant.</li>
              <li><strong>Données de configuration de la boutique :</strong> nom du commerce, paramètres de devise (FCFA), catalogue produits, niveaux de stock et prix de vente.</li>
              <li><strong>Données d&apos;activité commerciale :</strong> historique des transactions, totaux de caisse enregistrés, sessions de vente et logs de synchronisation.</li>
              <li><strong>Données techniques de connexion :</strong> adresse IP, type de terminal, état de connectivité et horodatages de synchronisation des données locales.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              3. Finalités du traitement
            </h2>
            <p>
              Les données collectées par QASH répondent aux finalités suivantes :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Assurer l&apos;accès et le fonctionnement de l&apos;application de caisse et de gestion de stock.</li>
              <li>Permettre le fonctionnement en mode Offline-first et garantir la synchronisation bidirectionnelle dès le rétablissement de la connexion.</li>
              <li>Traiter les analyses automatisées par intelligence artificielle (scan optique de factures et reconnaissance des articles du panier).</li>
              <li>Garantir la sécurité des accès, la prévention des fraudes et le cloisonnement des données entre boutiques.</li>
              <li>Gérer la relation commerciale, les souscriptions d&apos;abonnements et le support aux commerçants.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              4. Traitement des fonctionnalités d&apos;intelligence artificielle
            </h2>
            <p>
              Les fonctionnalités d&apos;analyse par intelligence artificielle (scan de factures et scan du panier) traitent les images ou photographies soumises par l&apos;utilisateur exclusivement pour l&apos;extraction des libellés et quantités nécessaires à votre catalogue. Ces données ne sont en aucun cas revendues à des tiers à des fins publicitaires.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              5. Conservation et sécurité des données
            </h2>
            <p>
              QASH met en œuvre des mesures techniques appropriées pour prévenir tout accès non autorisé, altération ou divulgation de vos données :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Chiffrement des flux de données en transit entre le terminal et les serveurs applicatifs.</li>
              <li>Cloisonnement logique strict assurant qu&apos;aucune boutique ne peut accéder aux données d&apos;une autre.</li>
              <li>Contrôle d&apos;accès rigoureux basé sur les rôles attribués (Gérant / Employé).</li>
              <li>Conservation des données actives pendant toute la durée de la souscription du compte.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              6. Vos droits
            </h2>
            <p>
              Conformément aux réglementations applicables en matière de protection des données personnelles, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données personnelles, ainsi que d&apos;un droit d&apos;opposition pour motif légitime.
            </p>
            <p>
              Pour exercer ces droits, vous pouvez contacter l&apos;équipe QASH à l&apos;adresse suivante : <strong>[EMAIL QASH]</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              7. Contact
            </h2>
            <p>
              Pour toute question relative à la présente politique de confidentialité ou aux traitements opérés par QASH, veuillez adresser votre demande à [EMAIL QASH] ou par courrier à l&apos;attention de [NOM DE L&apos;ENTREPRISE], [ADRESSE].
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
