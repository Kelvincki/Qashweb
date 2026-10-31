/**
 * Réseaux sociaux : le serveur ne garde que des identifiants (sans @, jamais d'URL).
 * Le site construit lui-même les liens, à partir d'identifiants validés.
 */

export type Network = 'instagram' | 'facebook' | 'tiktok';
export const NETWORKS: Network[] = ['instagram', 'facebook', 'tiktok'];

export const NETWORK_LABEL: Record<Network, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

export const SOCIAL_RE = /^[A-Za-z0-9._-]{1,50}$/;

export type Social = Partial<Record<Network, string>>;

export function isValidSocialId(id: string): boolean {
  return SOCIAL_RE.test(id);
}

const HOSTS: Record<Network, RegExp> = {
  instagram: /(^|\.)instagram\.com$/i,
  facebook: /(^|\.)(facebook\.com|fb\.com|fb\.me)$/i,
  tiktok: /(^|\.)tiktok\.com$/i,
};

/**
 * Extrait l'identifiant d'une saisie : « @nom », « nom » ou un lien (instagram.com/nom, tiktok.com/@nom…).
 * Renvoie '' si la saisie est vide, null si elle n'est pas valide.
 */
export function parseSocialId(network: Network, raw: string): string | null {
  let value = raw.trim();
  if (!value) return '';

  // Un lien : « https://… », un chemin, ou un nom de site connu (« instagram.com ») ; « chez.moussa » est un identifiant
  if (/[/\\]/.test(value) || /^[a-z][a-z0-9+.-]*:/i.test(value) || /^(www\.|m\.)?(instagram|facebook|fb|tiktok)\.(com|me)$/i.test(value)) {
    let url: URL;
    try {
      url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`);
    } catch {
      return null;
    }
    if (!HOSTS[network].test(url.hostname)) return null;
    const first = url.pathname.split('/').filter(Boolean)[0] ?? '';
    // facebook.com/profile.php?id=… : pas d'identifiant lisible
    value = decodeURIComponent(first);
  }

  value = value.replace(/^@/, '');
  return isValidSocialId(value) ? value : null;
}

/** Lien public d'un identifiant, ou null si l'identifiant n'est pas valide. */
export function socialUrl(network: Network, id: string): string | null {
  if (!isValidSocialId(id)) return null;
  const encoded = encodeURIComponent(id);
  switch (network) {
    case 'instagram':
      return `https://www.instagram.com/${encoded}`;
    case 'facebook':
      return `https://www.facebook.com/${encoded}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${encoded}`;
  }
}
