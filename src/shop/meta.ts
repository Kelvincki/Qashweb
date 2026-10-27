import { SITE_URL } from '../config/site';

interface ShopMeta {
  slug: string;
  title: string;
  description: string;
  logoUrl: string | null;
  /** false tant que la boutique a moins de 3 produits. */
  indexable: boolean;
}

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

/**
 * Titre, description, Open Graph et robots de la boutique (texte seulement, via les API du DOM).
 * Sans boutique (chargement, introuvable, erreur) : pas d'indexation.
 */
export function applyShopMeta(meta: ShopMeta | null): void {
  if (!meta) {
    document.title = 'Boutique en ligne — QASH';
    setMeta('name', 'robots', 'noindex, nofollow');
    return;
  }
  const description = (meta.description || `Commandez chez ${meta.title} : parcourez les produits et envoyez votre commande sur WhatsApp.`)
    .replace(/\s+/g, ' ')
    .slice(0, 200);
  const title = `${meta.title} — Boutique en ligne`;
  const url = `${SITE_URL}/b/${encodeURIComponent(meta.slug)}`;
  const image = meta.logoUrl || OG_FALLBACK;

  document.title = title;
  setMeta('name', 'description', description);
  setMeta('name', 'robots', meta.indexable ? 'index, follow' : 'noindex, nofollow');
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', image);
  setMeta('name', 'twitter:card', meta.logoUrl ? 'summary' : 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);
  setCanonical(url);
}
