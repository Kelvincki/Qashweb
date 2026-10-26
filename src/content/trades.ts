/**
 * Types de commerce présentés sur le site (accueil et page /metiers).
 * Exemples concrets, sans chiffres ni témoignages. À relire avec l'équipe produit :
 * chaque point doit correspondre à ce que fait réellement l'application.
 */
export interface Trade {
  id: string;
  name: string;
  short: string;
  intro: string;
  points: string[];
}

export const TRADES: Trade[] = [
  {
    id: 'boutique',
    name: 'Boutique et alimentation',
    short: 'Riz, huile, sucre : sachez ce qui part vite et ce qui manque.',
    intro:
      "La boutique du quartier vend des dizaines de produits par jour, souvent à crédit. QASH tient la caisse, le stock et le cahier à votre place.",
    points: [
      "Chaque produit avec son prix d'achat et son prix de vente.",
      "Une alerte quand l'huile ou le sucre passe sous le seuil que vous avez choisi.",
      'La vente au poids pour le riz, l’oignon ou la pomme de terre vendus au kilo.',
      'Le cahier de dettes pour les clients qui paient à la fin du mois.',
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant et traiteur',
    short: 'Plats, ingrédients et recettes, même pendant le coup de feu.',
    intro:
      "Au restaurant, tout va vite. QASH encaisse les plats en quelques gestes et garde la trace de ce que vous utilisez en cuisine.",
    points: [
      'Vos plats dans la caisse, encaissés en quelques gestes.',
      'Vos ingrédients et la recette de chaque plat, pour suivre ce que vous consommez.',
      'Les serveurs encaissent, le gérant suit le bilan de la journée.',
    ],
  },
  {
    id: 'pharmacie',
    name: 'Pharmacie',
    short: 'Retrouvez un produit par son code-barres, surveillez les quantités.',
    intro:
      "Une pharmacie gère beaucoup de références qui se ressemblent. Le scan et les alertes de stock évitent les erreurs et les ruptures.",
    points: [
      'Le scan du code-barres pour retrouver ou vendre un produit sans chercher.',
      'Un seuil d’alerte sur les produits demandés tous les jours.',
      "Chaque vente enregistrée avec l'heure et la personne qui l'a faite.",
    ],
  },
  {
    id: 'quincaillerie',
    name: 'Quincaillerie',
    short: "Des centaines de références, vendues à l'unité ou au poids.",
    intro:
      "Vis, peinture, fil, ciment : impossible de tout retenir. QASH retrouve chaque article et tient les comptes des artisans qui prennent à crédit.",
    points: [
      'Cherchez par nom ou scannez le code-barres.',
      "La vente au poids ou à l'unité.",
      'Le cahier de dettes pour les clients et pour vos fournisseurs.',
      'La photo de la facture fournisseur pour remplir votre stock plus vite.',
    ],
  },
  {
    id: 'mode',
    name: 'Mode et habillement',
    short: 'Suivez chaque article et laissez vos vendeurs encaisser.',
    intro:
      "Dans une boutique de vêtements, la marge se joue article par article. QASH vous la montre, et vos vendeurs encaissent pendant votre absence.",
    points: [
      "Chaque article avec son prix d'achat : vous savez ce que vous gagnez.",
      'Vos vendeurs encaissent pendant que vous êtes chez le fournisseur.',
      'Le bilan de la semaine ou du mois pour savoir où vous en êtes.',
    ],
  },
  {
    id: 'services',
    name: 'Services',
    short: 'Coiffure, couture, réparation : enregistrez chaque prestation.',
    intro:
      "Un salon, un atelier de couture ou de réparation vend du temps et du savoir-faire. QASH garde la trace de chaque prestation payée ou à payer.",
    points: [
      'Vos prestations dans la caisse, avec leur prix.',
      'Le cahier de dettes pour les clients qui paient plus tard, même en plusieurs fois.',
      'Un rapport PDF pour faire le point à la fin du mois.',
    ],
  },
];
