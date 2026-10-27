/**
 * Catalogue public d'une boutique : RPC get_public_catalog(p_slug), appelable avec la clé anon.
 * Appel direct à l'API REST (pas de supabase-js) pour garder la page légère sur 3G.
 * Aucune clé secrète : seulement l'URL et la clé publique déjà utilisées par le site.
 */

// Même valeur par défaut que src/lib/supabase.ts (non modifié : il touche à l'authentification)
const DEFAULT_URL = 'https://afstcyjnzwaurkqmomnj.supabase.co';
const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const SUPABASE_URL = (rawUrl && rawUrl.startsWith('http') ? rawUrl.trim() : DEFAULT_URL).replace(/\/+$/, '');
const PUBLIC_KEY = rawKey ? rawKey.trim() : '';

export interface ShopProduct {
  id: string;
  name: string;
  variant: string;
  price: number;
  unit: string;
  byWeight: boolean;
  category: string;
  description: string;
  available: boolean;
  /** Chemin dans le bucket public « catalog », ou null. */
  photo: string | null;
  v: number | null;
}

export interface Shop {
  slug: string;
  title: string;
  description: string;
  /** Valeur brute : à valider avec sanitizeWhatsapp avant tout usage. */
  whatsapp: string;
  address: string;
  logo: string | null;
  businessType: string;
  v: number | null;
  products: ShopProduct[];
}

export type CatalogResult = { kind: 'ok'; shop: Shop; raw: string } | { kind: 'not_found' };

const str = (value: unknown, max: number): string => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const num = (value: unknown): number | null => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
};

/** Valide et nettoie la réponse du serveur : tout est traité comme du texte, jamais comme du HTML. */
export function normalizeShop(input: unknown, expectedSlug: string): Shop | null {
  if (!input || typeof input !== 'object') return null;
  const o = input as Record<string, unknown>;
  const title = str(o.title, 120);
  if (!title) return null;

  const seen = new Set<string>();
  const products: ShopProduct[] = [];
  if (Array.isArray(o.products)) {
    for (const item of o.products) {
      if (!item || typeof item !== 'object') continue;
      const p = item as Record<string, unknown>;
      const id = p.id === null || p.id === undefined ? '' : String(p.id).slice(0, 64);
      const name = str(p.name, 140);
      const price = num(p.price);
      if (!id || !name || price === null || price < 0 || seen.has(id)) continue;
      seen.add(id);
      products.push({
        id,
        name,
        variant: str(p.variant, 80),
        price,
        unit: str(p.unit, 20),
        byWeight: p.by_weight === true,
        category: str(p.category, 60),
        description: str(p.description, 400),
        available: p.available !== false,
        photo: str(p.photo, 300) || null,
        v: num(p.v),
      });
    }
  }

  return {
    slug: str(o.slug, 64) || expectedSlug,
    title,
    description: str(o.description, 600),
    whatsapp: str(o.whatsapp, 40),
    address: str(o.address, 200),
    logo: str(o.logo, 300) || null,
    businessType: str(o.business_type, 60),
    v: num(o.v),
    products,
  };
}

/** URL publique d'une image du bucket « catalog » ({chemin}?v={v}) ; null si le chemin est suspect. */
export function imageUrl(path: string | null, v: number | null): string | null {
  if (!path) return null;
  const clean = path.replace(/^\/+/, '');
  if (!clean || /^[a-z][a-z0-9+.-]*:/i.test(clean) || /[\u0000-\u001f\\]/.test(clean)) return null;
  const segments = clean.split('/');
  if (segments.some((s) => s === '' || s === '.' || s === '..')) return null;
  const encoded = segments.map(encodeURIComponent).join('/');
  return `${SUPABASE_URL}/storage/v1/object/public/catalog/${encoded}${v !== null ? `?v=${encodeURIComponent(String(v))}` : ''}`;
}

export async function fetchCatalog(slug: string, signal?: AbortSignal): Promise<CatalogResult> {
  if (!PUBLIC_KEY) throw new Error('config');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_catalog`, {
      method: 'POST',
      headers: {
        apikey: PUBLIC_KEY,
        Authorization: `Bearer ${PUBLIC_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ p_slug: slug }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`http_${res.status}`);
    const raw = await res.text();
    const json = JSON.parse(raw);
    if (json === null) return { kind: 'not_found' };
    const shop = normalizeShop(json, slug);
    if (!shop) return { kind: 'not_found' };
    return { kind: 'ok', shop, raw };
  } finally {
    clearTimeout(timer);
  }
}

// Dernier catalogue vu, gardé sur l'appareil pour afficher la boutique tout de suite aux visites suivantes
const catalogKey = (slug: string) => `qash_catalog_${slug}`;

export function readCachedShop(slug: string): Shop | null {
  try {
    const raw = localStorage.getItem(catalogKey(slug));
    return raw ? normalizeShop(JSON.parse(raw), slug) : null;
  } catch {
    return null;
  }
}

export function writeCachedShop(slug: string, raw: string): void {
  try {
    if (raw.length < 400_000) localStorage.setItem(catalogKey(slug), raw);
  } catch {
    // Stockage plein ou indisponible : la boutique marche sans
  }
}

export function clearCachedShop(slug: string): void {
  try {
    localStorage.removeItem(catalogKey(slug));
  } catch {
    // ignoré
  }
}
