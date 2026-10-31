import { SITE_URL } from '../config/site';
import { Shop } from './api';
import { jsonLdText, shopJsonLd } from './jsonld';

/** Une boutique de moins de 3 produits n'est pas indexée. */
export const MIN_PRODUCTS_FOR_INDEXING = 3;

const OG_FALLBACK = `${SITE_URL}/brand/og-image.png`;

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

const JSONLD_ID = 'shop-jsonld';

function setJsonLd(text: string | null) {
  document.getElementById(JSONLD_ID)?.remove();
  if (!text) return;
  const el = document.createElement('script');
  el.id = JSONLD_ID;
  el.type = 'application/ld+json';
  el.textContent = text;
  document.head.appendChild(el);
}

/**
 * Titre, description, Open Graph, robots et données structurées de la boutique (texte seulement, via les API du DOM).
 * Sans boutique (chargement, introuvable, erreur) : pas d'indexation.
 */
export function applyShopMeta(shop: Shop | null): void {
  if (!shop) {
    document.title = 'Boutique en ligne — QASH';
    setMeta('name', 'robots', 'noindex, nofollow');
    setJsonLd(null);
    return;
  }
  const description = (shop.tagline || shop.description || `Commandez chez ${shop.title} : parcourez les produits et envoyez votre commande sur WhatsApp.`)
    .replace(/\s+/g, ' ')
    .slice(0, 200);
  const title = `${shop.title} — Boutique en ligne`;
  const url = `${SITE_URL}/b/${encodeURIComponent(shop.slug)}`;
  const image = shop.bannerUrl || shop.logoUrl || OG_FALLBACK;
  const indexable = shop.products.length >= MIN_PRODUCTS_FOR_INDEXING;

  document.title = title;
  setMeta('name', 'description', description);
  setMeta('name', 'robots', indexable ? 'index, follow' : 'noindex, nofollow');
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('name', 'twitter:card', shop.bannerUrl || !shop.logoUrl ? 'summary_large_image' : 'summary');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);
  setCanonical(url);
  setJsonLd(jsonLdText(shopJsonLd(shop)));
}
