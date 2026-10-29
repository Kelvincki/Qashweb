/**
 * Configuration publique du site QASH.
 * Tout le site lit ces valeurs : aucun numéro, e-mail ou lien de store écrit en dur dans les pages.
 * Aucune clé ni aucun secret ici (ce fichier part dans le navigateur).
 */

export const SITE_NAME = 'QASH';

/** URL publique de production (balises canoniques, Open Graph, sitemap). */
export const SITE_URL = 'https://www.useqash.com';

/**
 * Numéro WhatsApp au format international, chiffres uniquement (ex. 221771234567).
 * TODO : renseigner le numéro officiel. Vide = le site affiche « bientôt disponible ».
 */
export const WHATSAPP_NUMBER = '';

/**
 * Adresse e-mail de contact.
 * Adresse officielle (domaine useqash.com), utilisée par les pages légales, la FAQ,
 * Contact et la suppression de compte.
 */
export const CONTACT_EMAIL = 'contact@useqash.com';

/** Horaires de réponse affichés sur la page Contact. TODO : renseigner (ex. « Lun–sam, 9 h–19 h »). */
export const CONTACT_HOURS = '';

/** Lien Google Play de l'application. TODO : renseigner dès la publication. Vide = « Bientôt sur Google Play ». */
export const PLAY_STORE_URL = '';

/** Identifiant du paquet Android (lien de secours « intent:// » des pages de paiement). TODO : renseigner. */
export const ANDROID_APP_ID = '';

/** Version minimale d'Android prise en charge. TODO : renseigner (ex. « Android 8.0 »). Vide = ligne masquée. */
export const ANDROID_MIN_VERSION = '';

/**
 * Paiement en ligne. false = aucun bouton de paiement, « Paiement bientôt disponible » à la place.
 * Le paiement réel passe uniquement par l'Edge Function create-checkout (page /pricing).
 */
export const PAYMENTS_ENABLED = false;

/** Grille tarifaire publique (affichage). Le montant facturé est toujours calculé par le serveur. */
export const PRICING = {
  managerMonthly: 5000,
  employeeMonthly: 3500,
  trialDays: 3,
  graceDays: 3,
  maxEmployees: 20,
} as const;

export function formatFcfa(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;
}

/** Lien wa.me construit depuis WHATSAPP_NUMBER, ou null si le numéro n'est pas renseigné. */
export function whatsappLink(message?: string): string | null {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

/** Lien mailto vers CONTACT_EMAIL, ou null si l'adresse n'est pas renseignée. */
export function mailtoLink(subject?: string, body?: string): string | null {
  if (!CONTACT_EMAIL) return null;
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${CONTACT_EMAIL}${query ? `?${query}` : ''}`;
}

/** Lien de secours Android vers l'écran d'abonnement de l'app, ou null si le paquet n'est pas connu. */
export function androidIntentLink(path: string): string | null {
  if (!ANDROID_APP_ID) return null;
  return `intent://${path}#Intent;scheme=qash;package=${ANDROID_APP_ID};end`;
}
