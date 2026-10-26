import React from 'react';
import { PageRoute } from '../types';
import { LegalLayout, LegalList, LegalSection, legalLink } from '../components/ui/LegalLayout';
import { AppLink } from '../lib/navigation';
import { CONTACT_EMAIL } from '../config/site';

interface PrivacyPageProps {
  onNavigate?: (route: PageRoute) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = () => (
  <LegalLayout
    current="/confidentialite"
    title="Politique de confidentialité"
    updated="Dernière mise à jour : 2026 · Conforme aux standards de protection des données"
    notice={
      <>
        <strong>Avertissement :</strong> Ce document constitue un modèle indicatif de politique de confidentialité à faire
        relire et adapter par un professionnel juridique habilité. QASH ne prétend pas à une conformité juridique garantie
        sans revue de vos spécificités.
      </>
    }
  >
    <LegalSection title="1. Responsable du traitement">
      <p>
        Le traitement des données personnelles recueillies dans le cadre de l&apos;utilisation du site vitrine et des
        services QASH est opéré par :
      </p>
      <LegalList>
        <li><strong>Raison sociale :</strong> [NOM DE L&apos;ENTREPRISE]</li>
        <li><strong>Adresse postale :</strong> [ADRESSE]</li>
        <li><strong>Courrier électronique officiel :</strong> {CONTACT_EMAIL}</li>
      </LegalList>
    </LegalSection>

    <LegalSection title="2. Données collectées">
      <p>
        Dans le cadre de la fourniture du service QASH aux commerçants et gérants de boutiques, nous pouvons collecter et
        traiter les catégories d&apos;informations suivantes :
      </p>
      <LegalList>
        <li><strong>Informations d&apos;identification du compte :</strong> nom du gérant, adresse email, identifiants des employés créés sous la responsabilité du gérant.</li>
        <li><strong>Données de configuration de la boutique :</strong> nom du commerce, paramètres de devise (FCFA), catalogue produits, niveaux de stock et prix de vente.</li>
        <li><strong>Données d&apos;activité commerciale :</strong> historique des transactions, totaux de caisse enregistrés, sessions de vente et logs de synchronisation.</li>
        <li><strong>Données techniques de connexion :</strong> adresse IP, type de terminal, état de connectivité et horodatages de synchronisation des données locales.</li>
        <li><strong>Données de règlement des abonnements :</strong> les règlements d&apos;abonnements sont traités de manière sécurisée par des prestataires de paiement mobile agréés (SenePay, Wave, Orange Money). QASH ne conserve aucune coordonnée bancaire confidentielle.</li>
      </LegalList>
    </LegalSection>

    <LegalSection title="3. Finalités du traitement">
      <p>Les données collectées par QASH répondent aux finalités suivantes :</p>
      <LegalList>
        <li>Assurer l&apos;accès et le fonctionnement de l&apos;application de caisse et de gestion de stock.</li>
        <li>Permettre le fonctionnement en mode Offline-first et garantir la synchronisation bidirectionnelle dès le rétablissement de la connexion.</li>
        <li>Traiter les analyses automatisées par intelligence artificielle (scan optique de factures et reconnaissance des articles du panier).</li>
        <li>Garantir la sécurité des accès, la prévention des fraudes et le cloisonnement des données entre boutiques.</li>
        <li>Gérer la relation commerciale, les souscriptions d&apos;abonnements et le support aux commerçants.</li>
      </LegalList>
    </LegalSection>

    <LegalSection title="4. Traitement des fonctionnalités d'intelligence artificielle">
      <p>
        Les fonctionnalités d&apos;analyse par intelligence artificielle (scan de factures et scan du panier) traitent les
        images ou photographies soumises par l&apos;utilisateur exclusivement pour l&apos;extraction des libellés et
        quantités nécessaires à votre catalogue. Ces données ne sont en aucun cas revendues à des tiers à des fins
        publicitaires.
      </p>
    </LegalSection>

    <LegalSection title="5. Conservation et sécurité des données">
      <p>
        QASH met en œuvre des mesures techniques appropriées pour prévenir tout accès non autorisé, altération ou
        divulgation de vos données :
      </p>
      <LegalList>
        <li>Chiffrement des flux de données en transit entre le terminal et les serveurs applicatifs.</li>
        <li>Cloisonnement logique strict assurant qu&apos;aucune boutique ne peut accéder aux données d&apos;une autre.</li>
        <li>Contrôle d&apos;accès rigoureux basé sur les rôles attribués (Gérant / Employé).</li>
        <li>Conservation des données actives pendant toute la durée de la souscription du compte.</li>
      </LegalList>
    </LegalSection>

    <LegalSection title="6. Vos droits">
      <p>
        Conformément aux réglementations applicables en matière de protection des données personnelles et aux exigences de
        Google Play, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos
        données personnelles, ainsi que d&apos;un droit d&apos;opposition pour motif légitime.
      </p>
      <p>
        Pour solliciter l&apos;effacement définitif de votre compte et de vos données, vous pouvez utiliser la page dédiée :{' '}
        <AppLink to="/suppression-compte" className={legalLink}>
          Demande de suppression de compte QASH
        </AppLink>{' '}
        ou écrire directement à l&apos;équipe QASH à l&apos;adresse suivante : <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </LegalSection>

    <LegalSection title="7. Cookies et technologies de stockage">
      <p>
        Le site QASH utilise exclusivement des cookies et éléments de stockage local strictement nécessaires à votre
        authentification et au fonctionnement technique du service. Aucun traceur publicitaire ou d&apos;analyse
        commerciale n&apos;est utilisé. Pour en savoir plus, consultez notre page dédiée aux{' '}
        <AppLink to="/cookies" className={legalLink}>
          Cookies et traceurs
        </AppLink>
        .
      </p>
    </LegalSection>

    <LegalSection title="8. Contact">
      <p>
        Pour toute question relative à la présente politique de confidentialité ou aux traitements opérés par QASH, veuillez
        adresser votre demande à {CONTACT_EMAIL} ou par courrier à l&apos;attention de [NOM DE L&apos;ENTREPRISE], [ADRESSE].
      </p>
    </LegalSection>
  </LegalLayout>
);
