import { ShopProduct } from './api';

const group = (n: number, sep: string) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);

/** « 12 500 FCFA » (espaces insécables : le montant ne se coupe jamais en fin de ligne). */
export const formatPrice = (n: number): string => `${group(n, ' ')} FCFA`;

/** Même montant avec des espaces ordinaires, pour le message WhatsApp. */
export const plainPrice = (n: number): string => `${group(n, ' ')} FCFA`;

/** « 7 000 F » : version courte pour le message WhatsApp (espaces ordinaires). */
export const shortPrice = (n: number): string => `${group(n, ' ')} F`;

export function priceUnit(p: Pick<ShopProduct, 'byWeight' | 'unit'>): string {
  if (p.byWeight) return '/kg';
  return p.unit ? `/${p.unit}` : '';
}

export function formatQty(qty: number, byWeight: boolean): string {
  const text = String(qty).replace('.', ',');
  return byWeight ? `${text} kg` : text;
}

/** Minuscules sans accents, pour la recherche. */
export const fold = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/**
 * Numéro WhatsApp : on retire seulement les séparateurs usuels (espaces, points, tirets, parenthèses, « + » initial),
 * puis il ne doit rester que 8 à 15 chiffres. Sinon null : aucun lien n'est construit.
 */
export function sanitizeWhatsapp(raw: string): string | null {
  const compact = raw.trim().replace(/^\+/, '').replace(/[\s.\-()]/g, '').replace(/^00/, '');
  return /^\d{8,15}$/.test(compact) ? compact : null;
}

export const whatsappUrl = (digits: string, text?: string): string =>
  `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
