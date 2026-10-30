/**
 * Adresse de la boutique en ligne (slug). Mêmes règles que le serveur (catalog_save_settings) :
 * 3 à 30 caractères a-z, 0-9 et tiret, sans tiret au début ni à la fin, sans « -- ».
 * Le serveur reste l'autorité (il refuse aussi les noms réservés et les adresses déjà prises).
 */

export const SLUG_MIN = 3;
export const SLUG_MAX = 30;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

/** Nettoyage pendant la frappe : minuscules, sans accents, espaces en tirets. Garde le tiret final pour pouvoir continuer à écrire. */
export function cleanSlugInput(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .slice(0, SLUG_MAX);
}

/** Forme définitive : sans tiret au bout. */
export function finalizeSlug(input: string): string {
  return cleanSlugInput(input).replace(/-+$/, '');
}

export function isValidSlugFormat(slug: string): boolean {
  return SLUG_RE.test(slug) && !slug.includes('--');
}

/** Adresse proposée à partir du nom de la boutique. */
export function slugFromName(name: string): string {
  return finalizeSlug(name);
}
