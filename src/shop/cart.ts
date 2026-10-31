import { ShopProduct } from './api';
import { formatQty, shortPrice } from './format';
import { displayName } from './text';
import { SITE_URL } from '../config/site';

/** Panier : identifiant du produit → quantité. Les prix ne sont jamais stockés, ils viennent toujours du catalogue. */
export type Cart = Record<string, number>;

export interface CartLine {
  product: ShopProduct;
  qty: number;
  amount: number;
}

const MAX_QTY = 99;
const cartKey = (slug: string) => `qash_cart_${slug}`;

export const stepFor = (p: Pick<ShopProduct, 'byWeight'>): number => (p.byWeight ? 0.5 : 1);

/** Quantité arrondie au pas du produit (0,5 au poids, 1 sinon) et bornée. */
export function clampQty(qty: number, byWeight: boolean): number {
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  const step = byWeight ? 0.5 : 1;
  return Math.min(MAX_QTY, Math.round(qty / step) * step);
}

export function loadCart(slug: string): Cart {
  try {
    const raw = localStorage.getItem(cartKey(slug));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const cart: Cart = {};
    for (const [id, qty] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof qty === 'number' && Number.isFinite(qty) && qty > 0 && id.length <= 64) cart[id] = Math.min(MAX_QTY, qty);
    }
    return cart;
  } catch {
    return {};
  }
}

export function saveCart(slug: string, cart: Cart): void {
  try {
    if (Object.keys(cart).length === 0) localStorage.removeItem(cartKey(slug));
    else localStorage.setItem(cartKey(slug), JSON.stringify(cart));
  } catch {
    // Stockage indisponible : le panier reste en mémoire pour cette visite
  }
}

/** Ajoute ou retire un pas de quantité ; à 0, la ligne disparaît. */
export function changeQty(cart: Cart, product: ShopProduct, direction: 1 | -1): Cart {
  const next = clampQty((cart[product.id] ?? 0) + direction * stepFor(product), product.byWeight);
  const copy = { ...cart };
  if (next <= 0) delete copy[product.id];
  else copy[product.id] = next;
  return copy;
}

/** Après un chargement du catalogue : retire les produits disparus ou en rupture, remet les quantités au bon pas. */
export function reconcile(cart: Cart, products: ShopProduct[]): { cart: Cart; dropped: number } {
  const byId = new Map(products.map((p) => [p.id, p]));
  const next: Cart = {};
  let dropped = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const p = byId.get(id);
    if (!p || !p.available) {
      dropped++;
      continue;
    }
    const q = clampQty(qty, p.byWeight);
    if (q > 0) next[id] = q;
    else dropped++;
  }
  return { cart: next, dropped };
}

export function cartLines(cart: Cart, products: ShopProduct[]): { lines: CartLine[]; total: number } {
  const lines: CartLine[] = [];
  let total = 0;
  for (const p of products) {
    const qty = cart[p.id];
    if (!qty || !p.available) continue;
    const amount = Math.round(p.price * qty);
    lines.push({ product: p, qty, amount });
    total += amount;
  }
  return { lines, total };
}

export function buildOrderMessage(opts: {
  shopTitle: string;
  slug: string;
  lines: CartLine[];
  total: number;
  customerName: string;
  addressOrPickup: string;
}): string {
  // « 2 × Riz 5 kg : 7 000 F » ; au poids : « 1,5 kg × Oignon : 750 F »
  const rows = opts.lines.map(({ product: p, qty, amount }) => {
    const label = [displayName(p.name), p.variant].filter(Boolean).join(' ');
    const quantity = p.byWeight ? formatQty(qty, true).replace(/\s/g, ' ') : String(qty);
    return `- ${quantity} × ${label} : ${shortPrice(amount)}`;
  });
  const parts = [
    `Bonjour ${opts.shopTitle}, je voudrais commander :`,
    ...rows,
    '',
    `Total : ${shortPrice(opts.total)}`,
    'Commande à confirmer avec la boutique.',
    '',
    `Nom : ${opts.customerName.trim()}`,
    `Adresse : ${opts.addressOrPickup.trim()}`,
    '',
    `Boutique : ${SITE_URL}/b/${opts.slug}`,
  ];
  return parts.join('\n');
}

