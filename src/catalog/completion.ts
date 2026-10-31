/**
 * « Votre boutique est complète à N % » : une liste de points, chacun fait ou à faire.
 * Un repère pour le gérant, calculé sur son brouillon ; ce n'est pas une règle du serveur.
 */

/** Nombre de photos visé (ramené au nombre de produits affichés s'il est plus petit). */
export const PHOTO_TARGET = 5;

export interface CompletionInput {
  description: string;
  tagline: string;
  address: string;
  hasBanner: boolean;
  hoursDays: number;
  socialCount: number;
  deliveryInfo: string;
  /** Produits affichés dans la boutique. */
  visible: Array<{ hasPhoto: boolean; category: string; featured: boolean }>;
}

export interface CompletionItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Completion {
  items: CompletionItem[];
  done: number;
  percent: number;
}

export function computeCompletion(input: CompletionInput): Completion {
  const photos = input.visible.filter((p) => p.hasPhoto).length;
  const photoGoal = Math.max(1, Math.min(PHOTO_TARGET, input.visible.length));
  const items: CompletionItem[] = [
    { id: 'description', label: 'Une description de la boutique', done: input.description.trim() !== '' },
    { id: 'tagline', label: 'Une accroche', done: input.tagline.trim() !== '' },
    { id: 'address', label: "L'adresse de la boutique", done: input.address.trim() !== '' },
    { id: 'banner', label: 'Une bannière', done: input.hasBanner },
    { id: 'hours', label: 'Les horaires', done: input.hoursDays > 0 },
    { id: 'social', label: 'Un réseau social', done: input.socialCount > 0 },
    { id: 'delivery', label: 'Les informations de livraison', done: input.deliveryInfo.trim() !== '' },
    {
      id: 'photos',
      label: input.visible.length >= PHOTO_TARGET || input.visible.length === 0 ? `Des photos sur ${PHOTO_TARGET} produits` : 'Des photos sur tous vos produits affichés',
      done: input.visible.length > 0 && photos >= photoGoal,
    },
    { id: 'categories', label: 'Des produits classés par catégorie', done: input.visible.some((p) => p.category.trim() !== '') },
    { id: 'featured', label: 'Au moins un coup de cœur', done: input.visible.some((p) => p.featured) },
  ];
  const done = items.filter((i) => i.done).length;
  return { items, done, percent: Math.round((done / items.length) * 100) };
}
