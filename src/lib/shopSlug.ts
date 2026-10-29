/**
 * Identifiant de la boutique publique, sans aucune dépendance (chargé avant tout le reste).
 * Deux sources, une seule fonction :
 *  - sous-domaine : {slug}.useqash.com (les noms réservés comme www ou app sont exclus) ;
 *  - chemin : /b/{slug}.
 * Pour tester en local : {slug}.localhost (ex. http://ma-boutique.localhost:3000).
 */

/** Sous-domaines qui ne sont jamais des boutiques. */
export const RESERVED_SUBDOMAINS = new Set([
  'www', 'app', 'api', 'contact', 'admin', 'mail', 'email', 'smtp', 'imap', 'pop', 'ftp', 'mx', 'ns1', 'ns2',
  'cdn', 'static', 'assets', 'img', 'images', 'media', 'docs', 'help', 'aide', 'support', 'blog', 'status',
  'dev', 'staging', 'test', 'preview', 'demo', 'dashboard', 'login', 'auth', 'account', 'compte', 'my',
  'webmail', 'shop', 'boutique', 'store', 'qash', 'useqash',
]);

const SLUG_RE = /^[a-z0-9-]{3,30}$/;

/** Syntaxe seulement (3 à 30 caractères : a-z, 0-9, tiret) : les noms réservés ne concernent que les sous-domaines (voir getShopSlug). */
export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export function getShopSlug(loc: { hostname: string; pathname: string } = window.location): string | null {
  const host = loc.hostname.toLowerCase();

  const sub = host.match(/^([a-z0-9-]+)\.(?:useqash\.com|localhost)$/);
  if (sub && !RESERVED_SUBDOMAINS.has(sub[1])) {
    return sub[1];
  }

  const path = loc.pathname.match(/^\/b\/([^/]+)\/?$/);
  if (path) {
    try {
      return decodeURIComponent(path[1]).toLowerCase();
    } catch {
      return path[1].toLowerCase();
    }
  }

  return null;
}
