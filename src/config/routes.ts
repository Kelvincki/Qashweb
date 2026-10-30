import { PageRoute } from '../types';

/** Toutes les routes connues du site (les anciennes URL restent valides). */
export const VALID_ROUTES: PageRoute[] = [
  '/',
  '/fonctionnalites',
  '/metiers',
  '/tarifs',
  '/comment-ca-marche',
  '/telecharger',
  '/faq',
  '/contact',
  '/mentions-legales',
  '/confidentialite',
  '/conditions',
  '/cookies',
  '/pricing',
  '/privacy',
  '/legal',
  '/cgu',
  '/terms',
  '/suppression-compte',
  '/suppression-donnees',
  '/delete-account',
  '/login',
  '/register',
  '/mot-de-passe-oublie',
  '/dashboard',
  '/ma-boutique-en-ligne',
  '/auth/callback',
  '/paiement/succes',
  '/paiement/annule',
  '/join',
  '/bienvenue',
  '/reset-password',
];

export interface RouteMeta {
  title: string;
  description: string;
  /** Pages privées ou techniques : pas d'indexation. */
  noindex?: boolean;
  /** URL canonique quand la page a plusieurs adresses. */
  canonical?: PageRoute;
}

const DEFAULT_DESCRIPTION =
  'QASH, la caisse de votre boutique sur téléphone Android : ventes, stock, bénéfice et équipe. Marche sans internet et se synchronise ensuite.';

const LEGAL_NOTICE: RouteMeta = {
  title: 'Mentions légales — QASH',
  description: "Éditeur, hébergement et propriété intellectuelle du site QASH.",
  canonical: '/mentions-legales',
};
const PRIVACY: RouteMeta = {
  title: 'Confidentialité — QASH',
  description: 'Quelles données QASH traite, pourquoi, et comment exercer vos droits.',
  canonical: '/confidentialite',
};
const TERMS: RouteMeta = {
  title: "Conditions d'utilisation — QASH",
  description: "Les conditions générales d'utilisation de l'application et du site QASH.",
  canonical: '/conditions',
};
const DELETE_ACCOUNT: RouteMeta = {
  title: 'Supprimer mon compte — QASH',
  description: 'Comment demander la suppression de votre compte QASH et de vos données.',
  canonical: '/suppression-compte',
};

export const ROUTE_META: Record<PageRoute, RouteMeta> = {
  '/': {
    title: 'QASH — La caisse de votre boutique, même sans internet',
    description: DEFAULT_DESCRIPTION,
  },
  '/fonctionnalites': {
    title: 'Fonctionnalités — QASH',
    description:
      'Caisse qui marche sans internet, synchronisation automatique, stock et alertes, scan, bénéfice, équipe, cahier de dettes, rapports PDF et restaurant : tout ce que fait QASH.',
  },
  '/metiers': {
    title: 'Pour quel commerce ? — QASH',
    description:
      'Boutique, restaurant, pharmacie, quincaillerie, mode, services : comment QASH aide chaque commerce au quotidien, même sans internet.',
  },
  '/tarifs': {
    title: 'Tarifs — QASH',
    description:
      'Essai gratuit de 3 jours, puis 5 000 FCFA par mois pour le gérant et 3 500 FCFA par mois et par employé.',
  },
  '/comment-ca-marche': {
    title: 'Comment ça marche — QASH',
    description: 'Installer, créer sa boutique, ajouter ses produits, vendre, même sans internet : QASH en quatre étapes.',
  },
  '/telecharger': {
    title: "Télécharger l'application — QASH",
    description: "Installer QASH sur votre téléphone Android : lien Google Play et étapes d'installation.",
  },
  '/faq': {
    title: 'Questions fréquentes — QASH',
    description:
      'Que se passe-t-il sans internet ? Synchronisation, sécurité des données, équipe, abonnement, essai gratuit : les réponses sur QASH.',
  },
  '/contact': {
    title: 'Contact — QASH',
    description: "Écrire à l'équipe QASH par WhatsApp ou par e-mail.",
  },
  '/mentions-legales': LEGAL_NOTICE,
  '/legal': LEGAL_NOTICE,
  '/confidentialite': PRIVACY,
  '/privacy': PRIVACY,
  '/conditions': TERMS,
  '/cgu': TERMS,
  '/terms': TERMS,
  '/cookies': {
    title: 'Cookies et stockage local — QASH',
    description: 'Les seuls éléments stockés par le site QASH sur votre appareil, et pourquoi.',
  },
  '/suppression-compte': DELETE_ACCOUNT,
  '/suppression-donnees': DELETE_ACCOUNT,
  '/delete-account': DELETE_ACCOUNT,
  '/pricing': {
    title: 'Payer mon abonnement — QASH',
    description: "Activer ou renouveler l'abonnement QASH de votre boutique.",
    noindex: true,
  },
  '/login': {
    title: 'Se connecter — QASH',
    description: 'Connectez-vous à votre espace QASH.',
    noindex: true,
  },
  '/register': {
    title: 'Créer un compte — QASH',
    description: 'Créez votre compte QASH.',
    noindex: true,
  },
  '/mot-de-passe-oublie': {
    title: 'Mot de passe oublié — QASH',
    description: 'Recevoir un lien pour choisir un nouveau mot de passe.',
    noindex: true,
  },
  '/dashboard': {
    title: 'Mon espace — QASH',
    description: 'Abonnement, équipe et compte de votre boutique QASH.',
    noindex: true,
  },
  '/ma-boutique-en-ligne': {
    title: 'Ma boutique en ligne — QASH',
    description: 'Créez, modifiez et publiez le catalogue en ligne de votre boutique.',
    noindex: true,
  },
  '/auth/callback': {
    title: 'Connexion — QASH',
    description: 'Connexion en cours.',
    noindex: true,
  },
  '/paiement/succes': {
    title: 'Paiement — QASH',
    description: 'Vérification du paiement.',
    noindex: true,
  },
  '/paiement/annule': {
    title: 'Paiement annulé — QASH',
    description: "Le paiement n'a pas été effectué.",
    noindex: true,
  },
  '/join': {
    title: 'Rejoindre une boutique — QASH',
    description: "Code d'invitation pour rejoindre une boutique sur QASH.",
    noindex: true,
  },
  '/bienvenue': {
    title: 'Bienvenue sur QASH',
    description: 'Les premières étapes pour démarrer avec QASH.',
    noindex: true,
  },
  '/reset-password': {
    title: 'Nouveau mot de passe — QASH',
    description: 'Choisir un nouveau mot de passe.',
    noindex: true,
  },
};

export const NOT_FOUND_META: RouteMeta = {
  title: 'Page introuvable — QASH',
  description: "Cette page n'existe pas ou a été déplacée.",
  noindex: true,
};
