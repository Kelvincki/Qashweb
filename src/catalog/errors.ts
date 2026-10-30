/**
 * Messages en français pour chaque erreur du serveur (RPC catalog_*, stockage « catalog »).
 * Jamais de message générique : un code inconnu est cité tel quel.
 */

const MESSAGES: Record<string, string> = {
  not_manager: 'Seul le gérant de la boutique peut modifier la boutique en ligne.',
  slug_invalid:
    "L'adresse n'est pas valide. Utilisez 3 à 30 caractères : lettres minuscules, chiffres et tirets (pas de tiret au début ni à la fin). Certains noms sont réservés.",
  slug_taken: 'Cette adresse est déjà prise par une autre boutique. Choisissez-en une autre.',
  whatsapp_invalid: 'Le numéro WhatsApp n’est pas valide. Saisissez 8 à 15 chiffres avec l’indicatif du pays, par exemple +221 77 123 45 67.',
  path_invalid: "L'emplacement de l'image n'est pas valide. Choisissez de nouveau l'image, puis réessayez.",
  title_and_whatsapp_required: 'Pour publier, indiquez le nom de la boutique et un numéro WhatsApp.',
  items_invalid: 'La liste des produits a été refusée par le serveur (300 produits au maximum par envoi). Réessayez.',
};

interface ErrorLike {
  message?: unknown;
  details?: unknown;
  hint?: unknown;
  code?: unknown;
  status?: unknown;
  statusCode?: unknown;
}

const text = (v: unknown): string => (typeof v === 'string' ? v : '');

export function catalogErrorMessage(err: unknown): string {
  const e: ErrorLike = err && typeof err === 'object' ? (err as ErrorLike) : { message: String(err ?? '') };
  const haystack = `${text(e.message)} ${text(e.details)} ${text(e.hint)}`;

  for (const code of Object.keys(MESSAGES)) {
    if (new RegExp(`\\b${code}\\b`).test(haystack)) return MESSAGES[code];
  }

  const status = Number(e.statusCode ?? e.status);
  const lower = haystack.toLowerCase();

  if (err instanceof TypeError || /failed to fetch|networkerror|load failed|network request failed/.test(lower)) {
    return 'Connexion impossible. Vérifiez votre internet, puis réessayez.';
  }
  if (status === 401 || /jwt|not authenticated|invalid token/.test(lower) || text(e.code) === 'PGRST301') {
    return 'Votre session a expiré. Reconnectez-vous, puis réessayez.';
  }
  if (status === 413 || /exceeded the maximum|too large|payload/.test(lower)) {
    return 'Cette image est trop lourde : 1 Mo au maximum.';
  }
  if (/mime|not supported|invalid.*type/.test(lower)) {
    return 'Ce format d’image n’est pas accepté. Utilisez une image WebP, JPEG ou PNG.';
  }
  if (status === 403 || text(e.code) === '42501' || /row-level security|permission denied|not allowed|unauthorized/.test(lower)) {
    return 'Le serveur a refusé cette action (droits insuffisants, ou abonnement terminé).';
  }
  if (status === 429) return 'Trop de demandes. Patientez un instant, puis réessayez.';
  if (status >= 500) return 'Le serveur ne répond pas pour le moment. Réessayez dans quelques minutes.';

  const detail = text(e.message).trim().slice(0, 160);
  return detail ? `Le serveur a répondu : « ${detail} ». Rien n'a été perdu : réessayez.` : 'Le serveur n’a pas répondu comme prévu. Réessayez.';
}
