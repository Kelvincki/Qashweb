/**
 * Écrans de téléphone affichés sur le site.
 *
 * Pour l'instant : écrans simplifiés dessinés en CSS (l'interface de l'app va être refaite),
 * sans chiffres de vente inventés : les montants sont remplacés par des barres neutres.
 *
 * TODO captures : quand les vraies captures existent, déposez-les dans public/screens/
 * (WebP, 1080 px de large environ) et renseignez `screenshot` ci-dessous. Le composant
 * PhoneMockup affichera alors l'image à la place du dessin, partout sur le site.
 */

export type MockupId = 'caisse' | 'stock' | 'bilan';

interface MockupBase {
  /** Texte alternatif (décrit l'écran, pas de promesse). */
  alt: string;
  /** Chemin d'une vraie capture, ex. '/screens/caisse.webp'. null = écran dessiné. */
  screenshot: string | null;
  /** Titre affiché en haut de l'écran dessiné. */
  title: string;
}

export interface CaisseMockup extends MockupBase {
  kind: 'caisse';
  items: string[];
  totalLabel: string;
  actionLabel: string;
}

export interface StockMockup extends MockupBase {
  kind: 'stock';
  items: Array<{ name: string; level: 'ok' | 'bas' | 'rupture' }>;
}

export interface BilanMockup extends MockupBase {
  kind: 'bilan';
  periods: string[];
  /** Hauteurs relatives des barres (0–1), purement illustratives, sans valeur affichée. */
  bars: number[];
  rows: string[];
}

export type Mockup = CaisseMockup | StockMockup | BilanMockup;

export const MOCKUPS: Record<MockupId, Mockup> = {
  caisse: {
    kind: 'caisse',
    alt: "Écran de caisse simplifié de l'application QASH : une liste de produits dans le panier et le bouton Encaisser.",
    screenshot: null,
    title: 'Caisse',
    items: ['Riz brisé 5 kg', 'Huile 1 L', 'Sucre en morceaux', 'Lait en poudre'],
    totalLabel: 'Total à payer',
    actionLabel: 'Encaisser',
  },
  stock: {
    kind: 'stock',
    alt: "Écran de stock simplifié de l'application QASH : des produits avec leur niveau de stock et une alerte de rupture.",
    screenshot: null,
    title: 'Stock',
    items: [
      { name: 'Savon de Marseille', level: 'ok' },
      { name: 'Café Touba 250 g', level: 'bas' },
      { name: 'Thé vert', level: 'ok' },
      { name: 'Bouillon cube', level: 'rupture' },
      { name: 'Lait concentré', level: 'ok' },
    ],
  },
  bilan: {
    kind: 'bilan',
    alt: "Écran de bilan simplifié de l'application QASH : un graphique en barres par jour, sans valeurs.",
    screenshot: null,
    title: 'Bilan',
    periods: ['Jour', 'Semaine', 'Mois'],
    bars: [0.45, 0.62, 0.38, 0.8, 0.56, 0.92, 0.7],
    rows: ['Ventes', 'Bénéfice', 'Dépenses'],
  },
};
