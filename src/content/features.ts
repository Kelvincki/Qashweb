import { MockupId } from '../config/mockups';

/**
 * Fonctionnalités de l'application, telles que présentées sur /fonctionnalites.
 * À relire avec l'équipe produit : chaque point doit correspondre à l'application réelle.
 */
export interface Feature {
  id: string;
  title: string;
  lead: string;
  points: string[];
  mockup?: MockupId;
  /** Étapes numérotées affichées sous le texte (section Hors ligne). */
  steps?: Array<{ title: string; text: string }>;
}

export const FEATURES: Feature[] = [
  {
    id: 'hors-ligne',
    title: 'Hors ligne et synchronisation',
    lead: 'Pas de réseau, pas de problème : la caisse continue de marcher.',
    points: [
      "Ventes, stock et dettes s'enregistrent sur le téléphone, sans internet.",
      "Aucune vente n'est perdue en cas de coupure.",
      "Le gérant retrouve les ventes de toute l'équipe une fois synchronisées.",
    ],
    steps: [
      { title: 'Vous vendez', text: 'Sans internet, la caisse et le stock marchent comme d’habitude.' },
      { title: 'La vente patiente', text: 'Chaque vente reste enregistrée sur le téléphone en attendant le réseau.' },
      { title: 'Tout se synchronise', text: 'Au retour du réseau, la synchronisation est automatique. Vous n’avez rien à faire.' },
    ],
  },
  {
    id: 'caisse',
    title: 'Caisse et ventes',
    lead: 'Encaissez en quelques gestes, même quand la boutique est pleine.',
    points: [
      'Ajoutez les produits au panier en touchant leur nom ou en scannant leur code-barres.',
      'Le total se calcule tout seul.',
      "Chaque vente est enregistrée avec la date, l'heure et le vendeur.",
      'Vente au poids pour les produits vendus au kilo.',
    ],
    mockup: 'caisse',
  },
  {
    id: 'stock',
    title: 'Stock et alertes',
    lead: 'Le stock se met à jour à chaque vente : vous savez ce qui reste sans compter les cartons.',
    points: [
      'Une quantité par produit, qui baisse à chaque vente.',
      "Un seuil d'alerte par produit : QASH vous prévient avant la rupture.",
      "Les produits en rupture ou presque, en un coup d'œil.",
    ],
    mockup: 'stock',
  },
  {
    id: 'scan',
    title: 'Scan des produits et des factures',
    lead: 'Moins de saisie, moins d’erreurs.',
    points: [
      "Scannez le code-barres d'un produit avec l'appareil photo du téléphone pour le retrouver ou l'ajouter.",
      "Photographiez la facture d'un fournisseur : QASH lit les lignes pour vous aider à remplir votre stock.",
      'Vous vérifiez toujours avant de valider.',
    ],
  },
  {
    id: 'benefice',
    title: 'Bénéfice et bilan',
    lead: "Vendre, c'est bien. Savoir ce qu'on gagne, c'est mieux.",
    points: [
      "Avec le prix d'achat et le prix de vente de chaque produit, QASH calcule votre bénéfice.",
      'Le bilan du jour, de la semaine ou du mois.',
      "Ces chiffres se consultent dans l'application, pas sur le site.",
    ],
    mockup: 'bilan',
  },
  {
    id: 'equipe',
    title: 'Équipe et rôles',
    lead: 'Chacun son accès, chacun son rôle.',
    points: [
      'Le gérant voit tout : ventes, stock, bénéfice et équipe.',
      "L'employé encaisse et voit ses propres ventes.",
      "Pour rejoindre la boutique, l'employé saisit le code d'invitation du gérant dans l'application.",
      "Chaque employé occupe une place de l'abonnement.",
    ],
  },
  {
    id: 'dettes',
    title: 'Cahier de dettes',
    lead: "Fini le carnet qu'on perd ou qu'on ne relit plus.",
    points: [
      'Notez ce que vos clients vous doivent et ce que vous devez à vos fournisseurs.',
      'Enregistrez les remboursements, même partiels : le reste à payer se met à jour.',
      "Retrouvez d'un coup d'œil qui vous doit quoi.",
    ],
  },
  {
    id: 'rapports',
    title: 'Rapports PDF',
    lead: 'Vos chiffres sur une page, prêts à garder ou à partager.',
    points: [
      'Générez un rapport PDF de votre activité.',
      'Gardez-le sur le téléphone, imprimez-le ou envoyez-le.',
    ],
  },
  {
    id: 'restaurant',
    title: 'Restaurant : ingrédients et recettes',
    lead: 'Pour les restaurants et les traiteurs.',
    points: [
      'Déclarez vos ingrédients et la recette de chaque plat.',
      "Encaissez les plats comme n'importe quel produit.",
      'Suivez ce que vous consommez en cuisine.',
    ],
  },
];
