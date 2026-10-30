import { supabase } from '../lib/supabase';

/**
 * Accès serveur de l'éditeur « Ma boutique en ligne ».
 * Tout passe par la session du gérant connecté (RLS et RPC) : le serveur décide des droits.
 * Jamais de prix d'achat ni de quantité de stock : ces colonnes ne sont même pas demandées.
 */

const PAGE = 1000;
export const ITEMS_PER_CALL = 300;
export const CATALOG_BUCKET = 'catalog';

export interface EditorProduct {
  localId: number;
  name: string;
  variant: string;
  price: number;
  unit: string;
  byWeight: boolean;
  category: string;
  description: string;
  available: boolean;
}

export interface CatalogSettings {
  slug: string;
  published: boolean;
  title: string;
  description: string;
  whatsapp: string;
  address: string;
  logoPath: string | null;
}

export interface CatalogItem {
  visible: boolean;
  photoPath: string | null;
}

export interface EditorStore {
  id: string;
  name: string;
  inviteCode: string;
  location: string;
}

type PageResult<T> = PromiseLike<{ data: T[] | null; error: unknown }>;

/** Lit toutes les lignes, 1 000 à la fois (limite de Supabase). */
async function fetchAllRows<T>(page: (from: number, to: number) => PageResult<T>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw error;
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE) return rows;
  }
}

const s = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Profil de l'utilisateur connecté (RLS). Le rôle sert seulement à l'affichage : le serveur refuse not_manager. */
export async function loadProfile(userId: string): Promise<{ role: string; storeId: string | null } | null> {
  const { data, error } = await supabase.from('profiles').select('id, role, store_id').eq('id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { role: s(data.role), storeId: s(data.store_id) || null };
}

export async function loadStore(storeId: string): Promise<EditorStore> {
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, invite_code, location')
    .eq('id', storeId)
    .single();
  if (error) throw error;
  return { id: s(data.id), name: s(data.name), inviteCode: s(data.invite_code), location: s(data.location) };
}

export async function loadSettings(storeId: string): Promise<CatalogSettings | null> {
  const { data, error } = await supabase
    .from('store_catalog')
    .select('slug, published, title, description, whatsapp, address, logo_path')
    .eq('store_id', storeId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    slug: s(data.slug),
    published: data.published === true,
    title: s(data.title),
    description: s(data.description),
    whatsapp: s(data.whatsapp),
    address: s(data.address),
    logoPath: s(data.logo_path) || null,
  };
}

export async function loadItems(storeId: string): Promise<Record<number, CatalogItem>> {
  const rows = await fetchAllRows<{ product_local_id: number; visible: boolean; photo_path: string | null }>((from, to) =>
    supabase
      .from('catalog_items')
      .select('product_local_id, visible, photo_path')
      .eq('store_id', storeId)
      .order('product_local_id')
      .range(from, to),
  );
  const items: Record<number, CatalogItem> = {};
  for (const r of rows) items[r.product_local_id] = { visible: r.visible === true, photoPath: r.photo_path || null };
  return items;
}

export async function loadProducts(inviteCode: string): Promise<EditorProduct[]> {
  const rows = await fetchAllRows<Record<string, unknown>>((from, to) =>
    supabase
      .from('products')
      .select('local_id, nom, variante, prix_vente, unite, vendu_par_poids, categorie, description, disponible')
      .eq('store_code', inviteCode)
      .order('local_id')
      .range(from, to),
  );
  const seen = new Set<number>();
  const products: EditorProduct[] = [];
  for (const r of rows) {
    const localId = typeof r.local_id === 'number' ? r.local_id : NaN;
    const name = s(r.nom).trim();
    if (!Number.isFinite(localId) || !name || seen.has(localId)) continue;
    seen.add(localId);
    products.push({
      localId,
      name,
      variant: s(r.variante).trim(),
      price: typeof r.prix_vente === 'number' && Number.isFinite(r.prix_vente) ? r.prix_vente : 0,
      unit: s(r.unite).trim(),
      byWeight: r.vendu_par_poids === true,
      category: s(r.categorie).trim(),
      description: s(r.description).trim(),
      available: r.disponible !== false,
    });
  }
  return products;
}

/** Statut d'abonnement calculé par le serveur (affichage d'un avertissement seulement). */
export async function loadSubscriptionStatus(): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_my_subscription');
  if (error || !data || typeof data !== 'object') return null;
  const status = (data as Record<string, unknown>).status;
  return typeof status === 'string' ? status : null;
}

export async function slugAvailable(slug: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('catalog_slug_available', { p_slug: slug });
  if (error) throw error;
  return data === true;
}

export async function saveSettings(input: {
  slug: string;
  title: string;
  description: string;
  whatsapp: string;
  address: string;
  logoPath: string | null;
  published: boolean;
}): Promise<void> {
  const { error } = await supabase.rpc('catalog_save_settings', {
    p_slug: input.slug,
    p_title: input.title,
    p_description: input.description,
    p_whatsapp: input.whatsapp,
    p_address: input.address,
    p_logo_path: input.logoPath,
    p_published: input.published,
  });
  if (error) throw error;
}

export interface ItemUpdate {
  local_id: number;
  visible: boolean;
  /** Présent seulement si la photo change (null = retirer la photo). */
  photo_path?: string | null;
}

/** Enregistre la visibilité et les photos, 300 produits par appel (limite du serveur). */
export async function setItems(updates: ItemUpdate[]): Promise<void> {
  for (let i = 0; i < updates.length; i += ITEMS_PER_CALL) {
    const { error } = await supabase.rpc('catalog_set_items', { p_items: updates.slice(i, i + ITEMS_PER_CALL) });
    if (error) throw error;
  }
}

/** Chemin d'un fichier du bucket : toujours sous {store_id}/. */
export function storagePath(storeId: string, name: string): string {
  return `${storeId}/${name}`;
}

export async function uploadImage(path: string, blob: Blob, contentType: string): Promise<void> {
  const { error } = await supabase.storage.from(CATALOG_BUCKET).upload(path, blob, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
}

/** Suppression d'anciens fichiers remplacés : au mieux, sans bloquer l'enregistrement. */
export async function removeImages(storeId: string, paths: string[]): Promise<void> {
  const own = paths.filter((p) => p.startsWith(`${storeId}/`) && !p.includes('..'));
  if (own.length === 0) return;
  try {
    await supabase.storage.from(CATALOG_BUCKET).remove(own);
  } catch {
    // ignoré : un fichier orphelin ne gêne personne
  }
}

export function publicImageUrl(path: string | null): string | null {
  if (!path || !path.includes('/') || path.includes('..')) return null;
  return supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Vérifie ce que le public verrait (get_public_catalog) : null si le serveur masque la boutique. */
export async function publicCatalogVisible(slug: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('get_public_catalog', { p_slug: slug });
  if (error) throw error;
  return data !== null;
}
