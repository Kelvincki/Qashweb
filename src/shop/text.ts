const SMALL_WORDS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'à', 'au', 'aux', 'en', 'un', 'une', 'sur', 'sans', 'avec', 'pour']);

/**
 * Casse « Titre » pour l'affichage d'un nom de produit écrit tout en majuscules ou tout en minuscules.
 * Un nom déjà en casse mixte (« USB-C Samsung ») est laissé tel quel. La donnée n'est jamais modifiée.
 */
export function displayName(name: string): string {
  const text = name.trim();
  if (!text) return text;
  if (text !== text.toUpperCase() && text !== text.toLowerCase()) return text;
  let index = 0;
  return text.toLowerCase().replace(/\p{L}[\p{L}'’]*/gu, (word, offset: number, whole: string) => {
    const first = index++ === 0;
    // « 5kg », « 25cl » : l'unité collée à un chiffre reste en minuscules
    if (offset > 0 && /\d/.test(whole.charAt(offset - 1))) return word;
    if (!first && SMALL_WORDS.has(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

/** Lien d'itinéraire Google Maps pour une adresse (texte encodé). */
export function directionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/** Initiales (2 lettres au plus) d'un nom, pour les logos de remplacement. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters = words.length === 1 ? Array.from(words[0]).slice(0, 2) : [Array.from(words[0])[0], Array.from(words[1])[0]];
  return letters.join('').toUpperCase();
}
