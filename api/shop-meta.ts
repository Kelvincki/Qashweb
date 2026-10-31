import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Aperçu des liens de boutique pour les robots (WhatsApp, Facebook, Twitter, Telegram, LinkedIn, Google).
 * vercel.json envoie ici seulement /b/:slug demandé par un de ces robots ; les humains reçoivent la SPA.
 *
 * Appel de la RPC publique get_public_catalog avec la clé publique (jamais de service_role).
 * Tout texte venant de la base est échappé avant d'entrer dans le HTML.
 */

const SITE_URL = 'https://www.useqash.com';
const DEFAULT_SUPABASE_URL = 'https://afstcyjnzwaurkqmomnj.supabase.co';
const SLUG_RE = /^[a-z0-9-]{3,30}$/;
const MIN_PRODUCTS_FOR_INDEXING = 3;
const FALLBACK_IMAGE = `${SITE_URL}/brand/og-image.png`;

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Texte d'une ligne : caractères de contrôle retirés, espaces réduits, longueur bornée. */
const clean = (value: unknown, max: number): string =>
  typeof value === 'string'
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, max)
    : '';

interface PageMeta {
  title: string;
  description: string;
  url: string;
  image: string;
  indexable: boolean;
  /** Données structurées schema.org, déjà sérialisées et sûres pour une balise script. */
  jsonLd?: string;
  /** Grande image (bannière) : carte Twitter large. */
  largeImage?: boolean;
}

function renderHtml(m: PageMeta): string {
  const title = escapeHtml(m.title);
  const description = escapeHtml(m.description);
  const url = escapeHtml(m.url);
  const image = escapeHtml(m.image);
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="${m.indexable ? 'index, follow' : 'noindex, nofollow'}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="QASH">
<meta property="og:locale" content="fr_FR">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="${m.largeImage ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">${m.jsonLd ? `
<script type="application/ld+json">${m.jsonLd}</script>` : ''}
</head>
<body>
<h1>${title}</h1>
<p>${description}</p>
<p><a href="${url}">Voir la boutique</a></p>
</body>
</html>
`;
}

/** URL publique d'une image du bucket « catalog », ou null si le chemin est suspect. */
function logoUrl(supabaseUrl: string, path: string, v: unknown): string | null {
  const clear = path.replace(/^\/+/, '');
  if (!clear || /^[a-z][a-z0-9+.-]*:/i.test(clear) || /[\u0000-\u001f\\]/.test(clear)) return null;
  const segments = clear.split('/');
  if (segments.some((s) => s === '' || s === '.' || s === '..')) return null;
  const version = typeof v === 'number' && Number.isFinite(v) ? `?v=${encodeURIComponent(String(v))}` : '';
  return `${supabaseUrl}/storage/v1/object/public/catalog/${segments.map(encodeURIComponent).join('/')}${version}`;
}

const DAYS: Array<[string, string]> = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];
const TIME_RE = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const SOCIAL_RE = /^[A-Za-z0-9._-]{1,50}$/;
const RESTAURANT_TYPES = new Set(['restaurant', 'resto', 'food_service', 'traiteur', 'catering']);

function socialLinks(social: unknown): string[] {
  if (!social || typeof social !== 'object') return [];
  const s = social as Record<string, unknown>;
  const networks: Array<[string, (id: string) => string]> = [
    ['instagram', (id) => `https://www.instagram.com/${encodeURIComponent(id)}`],
    ['facebook', (id) => `https://www.facebook.com/${encodeURIComponent(id)}`],
    ['tiktok', (id) => `https://www.tiktok.com/@${encodeURIComponent(id)}`],
  ];
  return networks.flatMap(([key, url]) => {
    const id = clean(s[key], 60).replace(/^@/, '');
    return id && SOCIAL_RE.test(id) ? [url(id)] : [];
  });
}

/** schema.org Store ou Restaurant : seulement ce que la boutique a fourni, ni prix ni disponibilité. */
function buildJsonLd(shop: Record<string, unknown>, title: string, url: string, image: string | null, description: string): string {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': RESTAURANT_TYPES.has(clean(shop.business_type, 60).toLowerCase()) ? 'Restaurant' : 'Store',
    name: title,
    url,
  };
  if (description) data.description = description;
  if (image) data.image = image;

  const digits = clean(shop.whatsapp, 40).replace(/^\+/, '').replace(/[\s.\-()]/g, '').replace(/^00/, '');
  if (/^\d{8,15}$/.test(digits)) data.telephone = `+${digits}`;
  const address = clean(shop.address, 200);
  if (address) data.address = { '@type': 'PostalAddress', streetAddress: address };

  const hours = shop.hours && typeof shop.hours === 'object' ? (shop.hours as Record<string, unknown>) : {};
  const specs = DAYS.flatMap(([key, day]) => {
    const slot = hours[key];
    if (!slot || typeof slot !== 'object') return [];
    const { open, close } = slot as Record<string, unknown>;
    return typeof open === 'string' && typeof close === 'string' && TIME_RE.test(open) && TIME_RE.test(close)
      ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: day, opens: open, closes: close }]
      : [];
  });
  if (specs.length > 0) data.openingHoursSpecification = specs;

  const sameAs = socialLinks(shop.social);
  if (sameAs.length > 0) data.sameAs = sameAs;

  // « < » écrit en < : rien ne peut fermer la balise script
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function send(res: ServerResponse, status: number, html: string, cache: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(html);
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end();
    return;
  }

  let slug = '';
  try {
    slug = (new URL(req.url ?? '', SITE_URL).searchParams.get('slug') ?? '').toLowerCase();
  } catch {
    slug = '';
  }

  const generic: PageMeta = {
    title: 'Boutique en ligne — QASH',
    description: 'Parcourez les produits de la boutique et envoyez votre commande sur WhatsApp.',
    url: SITE_URL,
    image: FALLBACK_IMAGE,
    indexable: false,
  };

  if (!SLUG_RE.test(slug)) {
    send(res, 404, renderHtml(generic), 'public, s-maxage=3600');
    return;
  }
  generic.url = `${SITE_URL}/b/${slug}`;

  const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseUrl = (rawUrl.startsWith('https://') ? rawUrl.trim() : DEFAULT_SUPABASE_URL).replace(/\/+$/, '');
  const key = (process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '').trim();
  if (!key) {
    send(res, 200, renderHtml(generic), 'no-store');
    return;
  }

  let json: unknown;
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_public_catalog`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ p_slug: slug }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`http_${response.status}`);
    json = await response.json();
  } catch {
    // Les robots réessaieront plus tard : on ne met pas cette erreur en cache
    send(res, 503, renderHtml(generic), 'no-store');
    return;
  }

  const shop = json && typeof json === 'object' ? (json as Record<string, unknown>) : null;
  const title = shop ? clean(shop.title, 120) : '';
  if (!shop || !title) {
    send(res, 404, renderHtml(generic), 'public, s-maxage=60');
    return;
  }

  const productCount = Array.isArray(shop.products)
    ? shop.products.filter((p) => p && typeof p === 'object' && clean((p as Record<string, unknown>).name, 140)).length
    : 0;
  const logo = typeof shop.logo === 'string' && shop.logo ? logoUrl(supabaseUrl, clean(shop.logo, 300), shop.v) : null;
  const banner = typeof shop.banner === 'string' && shop.banner ? logoUrl(supabaseUrl, clean(shop.banner, 300), shop.v) : null;
  const pageUrl = `${SITE_URL}/b/${slug}`;
  // L'accroche passe avant la description ; la bannière avant le logo
  const description =
    clean(shop.tagline, 80) || clean(shop.description, 200) || `Commandez chez ${title} : parcourez les produits et envoyez votre commande sur WhatsApp.`;

  const html = renderHtml({
    title: `${title} — Boutique en ligne`,
    description,
    url: pageUrl,
    image: banner ?? logo ?? FALLBACK_IMAGE,
    indexable: productCount >= MIN_PRODUCTS_FOR_INDEXING,
    jsonLd: buildJsonLd(shop, title, pageUrl, banner ?? logo, clean(shop.tagline, 80) || clean(shop.description, 200)),
    largeImage: banner !== null,
  });
  send(res, 200, req.method === 'HEAD' ? '' : html, 'public, s-maxage=300, stale-while-revalidate=600');
}
