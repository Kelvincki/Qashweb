import { SITE_URL } from '../config/site';
import { Shop } from './api';
import { DAY_KEYS, DAY_SCHEMA } from './hours';
import { sanitizeWhatsapp } from './format';
import { NETWORKS, socialUrl } from './social';

/** Types de commerce traités comme des restaurants (mêmes valeurs que Mon espace). */
const RESTAURANT_TYPES = new Set(['restaurant', 'resto', 'food_service', 'traiteur', 'catering']);

/**
 * Données structurées schema.org (Store ou Restaurant) : seulement ce que la boutique a fourni.
 * Ni prix, ni disponibilité, ni avis : rien d'inventé.
 */
export function shopJsonLd(shop: Shop): Record<string, unknown> {
  const phone = sanitizeWhatsapp(shop.whatsapp);
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': RESTAURANT_TYPES.has(shop.businessType.toLowerCase()) ? 'Restaurant' : 'Store',
    name: shop.title,
    url: `${SITE_URL}/b/${shop.slug}`,
  };
  const description = shop.tagline || shop.description;
  if (description) data.description = description;
  const image = shop.bannerUrl || shop.logoUrl;
  if (image) data.image = image;
  if (phone) data.telephone = `+${phone}`;
  if (shop.address) data.address = { '@type': 'PostalAddress', streetAddress: shop.address };

  if (shop.hours) {
    const specs = DAY_KEYS.flatMap((key) => {
      const slot = shop.hours?.[key];
      return slot ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_SCHEMA[key], opens: slot.open, closes: slot.close }] : [];
    });
    if (specs.length > 0) data.openingHoursSpecification = specs;
  }

  const sameAs = NETWORKS.flatMap((n) => {
    const id = shop.social[n];
    const url = id ? socialUrl(n, id) : null;
    return url ? [url] : [];
  });
  if (sameAs.length > 0) data.sameAs = sameAs;
  return data;
}

/** Sérialisation sûre pour une balise <script> : « < » est écrit en <. */
export function jsonLdText(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
