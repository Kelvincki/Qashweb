import { SITE_URL } from '../config/site';
import { RouteMeta } from '../config/routes';

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

/** Met à jour titre, description, balises Open Graph / Twitter et URL canonique de la page affichée. */
export function applyRouteMeta(meta: RouteMeta, path: string) {
  const canonicalPath = meta.canonical ?? path;
  const url = `${SITE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`;
  document.title = meta.title;
  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow');
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);
  setCanonical(url);
}
