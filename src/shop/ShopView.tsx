import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, Navigation, Search, Share2, Star, Truck, Wallet, MessageCircle } from 'lucide-react';
import { SITE_URL } from '../config/site';
import { Shop, ShopProduct } from './api';
import { Cart } from './cart';
import { accentTheme } from './accent';
import { DAY_KEYS, DAY_LABEL, dayKeyAt, definedDays, openStatus, slotText } from './hours';
import { fold, formatPrice, sanitizeWhatsapp, whatsappUrl } from './format';
import { NetworkIcon } from './icons';
import { ProductCard } from './ProductCard';
import { ProductSheet } from './ProductSheet';
import { NETWORKS, NETWORK_LABEL, socialUrl } from './social';
import { directionsUrl, initials } from './text';

/**
 * Page publique d'une boutique (landing). Présentation seulement : les données arrivent déjà nettoyées
 * (api.ts), tout texte est affiché comme du texte (jamais de HTML brut) et les liens sont construits ici
 * à partir d'identifiants validés. Mise en page par « container queries » (@…) : la même composante sert
 * pleine page et dans l'aperçu en direct de l'éditeur.
 * Une section sans donnée n'est pas affichée.
 */

const PAGE_SIZE = 24;
const ALL = '__all__';
const OTHER = 'Autres';

type Sort = 'default' | 'price_asc' | 'price_desc' | 'name';

export interface ShopViewProps {
  shop: Shop;
  cart: Cart;
  onChangeQty: (product: ShopProduct, direction: 1 | -1) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  stale?: boolean;
  onRefresh?: () => void;
  droppedNotice?: boolean;
  onDismissDropped?: () => void;
  /** Aperçu dans l'éditeur : ni panier, ni barre fixe, ni défilement collant. */
  preview?: boolean;
}

const Wrap: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mx-auto w-full max-w-[1100px] px-5 @2xl:px-8 ${className}`}>{children}</div>
);

const accentButton =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-base font-bold text-[var(--on-accent)] transition-transform active:scale-[0.97]';
const quietButton =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-field px-5 text-base font-bold text-ink transition-colors hover:bg-field-strong active:scale-[0.97]';

export const ShopView: React.FC<ShopViewProps> = ({
  shop,
  cart,
  onChangeQty,
  cartCount,
  cartTotal,
  onOpenCart,
  stale = false,
  onRefresh,
  droppedNotice = false,
  onDismissDropped,
  preview = false,
}) => {
  const theme = useMemo(() => accentTheme(shop.accent), [shop.accent]);
  const themeVars = { '--accent': theme.color, '--on-accent': theme.on } as React.CSSProperties;

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const status = useMemo(() => openStatus(shop.hours, now), [shop.hours, now]);
  const today = dayKeyAt(now);

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState(ALL);
  const [sort, setSort] = useState<Sort>('default');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [detail, setDetail] = useState<ShopProduct | null>(null);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [shareNote, setShareNote] = useState('');

  const url = `${SITE_URL}/b/${shop.slug}`;
  const whatsappDigits = sanitizeWhatsapp(shop.whatsapp);

  const categories = useMemo(() => {
    const names: string[] = [];
    let hasOther = false;
    for (const p of shop.products) {
      if (!p.category) hasOther = true;
      else if (!names.includes(p.category)) names.push(p.category);
    }
    if (hasOther && names.length > 0) names.push(OTHER);
    return names;
  }, [shop.products]);

  const featured = useMemo(() => shop.products.filter((p) => p.featured && p.available), [shop.products]);

  const filtered = useMemo(() => {
    const q = fold(deferredQuery.trim());
    const list = shop.products.filter((p) => {
      if (category !== ALL && (p.category || OTHER) !== category) return false;
      return !q || fold(`${p.name} ${p.variant} ${p.category}`).includes(q);
    });
    if (sort === 'price_asc') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') return [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    return list;
  }, [shop.products, deferredQuery, category, sort]);

  useEffect(() => setVisible(PAGE_SIZE), [deferredQuery, category, sort]);

  const share = async () => {
    setShareNote('');
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: shop.title, text: shop.tagline || undefined, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote('Lien copié');
      setTimeout(() => setShareNote(''), 2500);
    } catch (err) {
      // L'utilisateur a fermé la fenêtre de partage : rien à signaler
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setShareNote(`Copiez ce lien : ${url}`);
    }
  };

  const hoursDays = definedDays(shop.hours);
  const socials = NETWORKS.filter((n) => shop.social[n] && socialUrl(n, shop.social[n]!));
  const hasInfo = hoursDays.length > 0 || Boolean(shop.address) || Boolean(shop.deliveryInfo) || Boolean(shop.paymentInfo) || socials.length > 0;
  const showBar = !preview && cartCount > 0;

  const bannerSrc = !bannerFailed ? shop.bannerUrl : null;
  const logoSrc = !logoFailed ? shop.logoUrl : null;
  const gradient = `linear-gradient(135deg, ${theme.color}, color-mix(in srgb, ${theme.color} 72%, ${theme.onIsDark ? 'white' : 'black'}))`;

  return (
    <div className={`@container flex flex-col bg-white text-ink ${preview ? '' : 'min-h-screen'}`} style={themeVars}>
      {/* 1. Hero */}
      <header>
        <div className="relative aspect-[3/1] w-full overflow-hidden @2xl:aspect-[4/1] @5xl:aspect-[5/1]" style={{ background: gradient }}>
          {bannerSrc && (
            <img
              src={bannerSrc}
              alt=""
              width={1536}
              height={512}
              decoding="async"
              fetchPriority={preview ? 'auto' : 'high'}
              onError={() => setBannerFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        <Wrap>
          <div className="relative -mt-10 @2xl:-mt-14">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white @2xl:h-28 @2xl:w-28">
              {logoSrc ? (
                <img src={logoSrc} alt={`Logo de ${shop.title}`} width={112} height={112} decoding="async" onError={() => setLogoFailed(true)} className="h-full w-full object-cover" />
              ) : (
                <span aria-hidden="true" className="flex h-full w-full items-center justify-center bg-[var(--accent)] text-2xl font-black text-[var(--on-accent)] @2xl:text-4xl">
                  {initials(shop.title)}
                </span>
              )}
            </div>
          </div>
          <h1 className="mt-4 break-words text-[clamp(1.875rem,1.2rem+3vw,3.5rem)] font-black leading-[1] tracking-tight">{shop.title}</h1>
          {shop.tagline && <p className="mt-2 max-w-[40rem] break-words text-xl leading-snug">{shop.tagline}</p>}
          {status && (
            <p
              className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold ${
                status.state === 'open' ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-field text-ink'
              }`}
            >
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${status.state === 'open' ? 'bg-[var(--on-accent)]' : 'bg-muted'}`} />
              {status.label}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {whatsappDigits &&
              (preview ? (
                <span className={accentButton}>
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Commander sur WhatsApp
                </span>
              ) : (
                <a href={whatsappUrl(whatsappDigits, `Bonjour ${shop.title}, `)} target="_blank" rel="noopener noreferrer" className={accentButton}>
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Commander sur WhatsApp
                </a>
              ))}
            {shop.address &&
              (preview ? (
                <span className={quietButton}>
                  <Navigation className="h-5 w-5" aria-hidden="true" />
                  Itinéraire
                </span>
              ) : (
                <a href={directionsUrl(shop.address)} target="_blank" rel="noopener noreferrer" className={quietButton}>
                  <Navigation className="h-5 w-5" aria-hidden="true" />
                  Itinéraire
                </a>
              ))}
            <button type="button" onClick={() => void share()} disabled={preview} className={`${quietButton} disabled:cursor-default`}>
              <Share2 className="h-5 w-5" aria-hidden="true" />
              Partager
            </button>
          </div>
          <p role="status" className="mt-2 min-h-6 break-all text-base">
            {shareNote}
          </p>
        </Wrap>
      </header>

      <main className={`flex-1 ${showBar ? 'pb-32' : 'pb-12'}`}>
        <Wrap>
          {stale && (
            <p className="mb-4 rounded-2xl bg-warning-soft p-4 text-base" role="status">
              Affichage des dernières données enregistrées sur cet appareil.{' '}
              {onRefresh && (
                <button type="button" onClick={onRefresh} className="font-bold underline decoration-2 underline-offset-4">
                  Actualiser
                </button>
              )}
            </p>
          )}
          {droppedNotice && (
            <p className="mb-4 rounded-2xl bg-warning-soft p-4 text-base" role="status">
              Certains articles de votre panier ne sont plus disponibles : ils ont été retirés.{' '}
              <button type="button" onClick={onDismissDropped} className="font-bold underline decoration-2 underline-offset-4">
                Fermer
              </button>
            </p>
          )}
        </Wrap>

        {/* 2. Coups de cœur */}
        {featured.length > 0 && (
          <section aria-labelledby="featured-title" className="pt-6">
            <Wrap>
              <h2 id="featured-title" className="flex items-center gap-2 text-title font-black">
                <Star className="h-6 w-6 fill-[var(--accent)] text-[var(--accent)]" aria-hidden="true" />
                Coups de cœur
              </h2>
            </Wrap>
            <ul className="mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-2 @2xl:px-8 [scrollbar-width:none]" tabIndex={0} aria-label="Coups de cœur de la boutique">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  qty={cart[p.id] ?? 0}
                  onChange={onChangeQty}
                  onOpen={setDetail}
                  inert={preview}
                  className="w-44 shrink-0 snap-start @2xl:w-52"
                />
              ))}
            </ul>
          </section>
        )}

        {/* 3. Catalogue */}
        <section aria-labelledby="catalog-title" className="pt-8">
          <Wrap>
            <h2 id="catalog-title" className="text-title font-black">
              Catalogue
            </h2>
          </Wrap>
          <div className={`${preview ? '' : 'sticky top-0 z-20'} mt-3 bg-white py-3`}>
            <Wrap>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input
                    type="search"
                    inputMode="search"
                    aria-label="Rechercher un produit"
                    placeholder="Rechercher un produit"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    maxLength={80}
                    className="h-12 w-full rounded-full bg-field pl-12 pr-4 text-lg placeholder:text-muted focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-ink"
                  />
                </div>
                {shop.products.length > 1 && (
                  <>
                    <label htmlFor="shop-sort" className="sr-only">
                      Trier les produits
                    </label>
                    <select
                      id="shop-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as Sort)}
                      className="h-12 max-w-[9.5rem] shrink-0 rounded-full bg-field px-4 text-base font-bold focus:outline-none focus:ring-[3px] focus:ring-ink"
                    >
                      <option value="default">Tri : normal</option>
                      <option value="price_asc">Prix croissant</option>
                      <option value="price_desc">Prix décroissant</option>
                      <option value="name">Nom A → Z</option>
                    </select>
                  </>
                )}
              </div>
              {categories.length > 0 && (
                <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] @2xl:mx-0 @2xl:px-0" role="group" aria-label="Catégories">
                  {[ALL, ...categories].map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={category === c}
                      onClick={() => setCategory(c)}
                      className={`flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-5 text-base font-bold transition-colors ${
                        category === c ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-field text-ink hover:bg-field-strong'
                      }`}
                    >
                      {c === ALL ? 'Tout' : c}
                    </button>
                  ))}
                </div>
              )}
            </Wrap>
          </div>

          <Wrap className="pt-3">
            {shop.products.length === 0 ? (
              <div className="rounded-[2rem] bg-field p-8">
                <p className="text-title font-black">Cette boutique n&apos;a pas encore de produits.</p>
                <p className="mt-2 text-lg">Revenez bientôt, ou écrivez directement à la boutique.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[2rem] bg-field p-8">
                <p className="text-title font-black">Aucun produit trouvé.</p>
                <p className="mt-2 text-lg">Essayez un autre mot, ou choisissez « Tout ».</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-base" aria-live="polite">
                  {filtered.length} produit{filtered.length > 1 ? 's' : ''}
                </p>
                <ul className="grid grid-cols-2 gap-3 @2xl:grid-cols-3 @4xl:grid-cols-4">
                  {filtered.slice(0, visible).map((p, i) => (
                    <ProductCard key={p.id} product={p} qty={cart[p.id] ?? 0} onChange={onChangeQty} onOpen={setDetail} priority={i < 2} inert={preview} />
                  ))}
                </ul>
                {visible < filtered.length && (
                  <div className="mt-8 flex justify-center">
                    <button type="button" onClick={() => setVisible((n) => n + PAGE_SIZE)} className={`${quietButton} min-h-14 px-7 text-lg`}>
                      Voir plus de produits
                    </button>
                  </div>
                )}
              </>
            )}
          </Wrap>
        </section>

        {/* 4. À propos */}
        {shop.about && (
          <section aria-labelledby="about-title" className="pt-12">
            <Wrap>
              <h2 id="about-title" className="text-title font-black">
                À propos
              </h2>
              <span aria-hidden="true" className="mt-2 block h-1 w-16 rounded-full bg-[var(--accent)]" />
              <p className="mt-4 max-w-[44rem] whitespace-pre-line break-words text-lg leading-relaxed">{shop.about}</p>
            </Wrap>
          </section>
        )}

        {/* 5. Infos pratiques */}
        {hasInfo && (
          <section aria-labelledby="info-title" className="pt-12">
            <Wrap>
              <h2 id="info-title" className="text-title font-black">
                Infos pratiques
              </h2>
              <span aria-hidden="true" className="mt-2 block h-1 w-16 rounded-full bg-[var(--accent)]" />
              <div className="mt-6 grid gap-3 @2xl:grid-cols-2">
                {hoursDays.length > 0 && shop.hours && (
                  <div className="rounded-[2rem] bg-field p-6">
                    <h3 className="flex items-center gap-2 text-lg font-black">
                      <Clock className="h-5 w-5" aria-hidden="true" />
                      Horaires
                    </h3>
                    <table className="mt-3 w-full text-base">
                      <caption className="sr-only">Horaires d&apos;ouverture (heure du Sénégal)</caption>
                      <tbody>
                        {DAY_KEYS.filter((k) => hoursDays.includes(k)).map((k) => {
                          const isToday = k === today;
                          return (
                            <tr key={k} className={isToday ? 'bg-[color-mix(in_srgb,var(--accent)_18%,white)] font-black' : ''}>
                              <th scope="row" className="rounded-l-xl py-2 pl-3 pr-2 text-left font-bold">
                                {DAY_LABEL[k]}
                                {isToday && <span className="ml-2 text-sm font-bold">(aujourd&apos;hui)</span>}
                              </th>
                              <td className="rounded-r-xl py-2 pl-2 pr-3 text-right">{slotText(shop.hours!, k)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {shop.address && (
                  <div className="rounded-[2rem] bg-field p-6">
                    <h3 className="flex items-center gap-2 text-lg font-black">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                      Adresse
                    </h3>
                    <p className="mt-3 whitespace-pre-line break-words text-lg">{shop.address}</p>
                    {!preview && (
                      <a href={directionsUrl(shop.address)} target="_blank" rel="noopener noreferrer" className={`${accentButton} mt-4`}>
                        <Navigation className="h-5 w-5" aria-hidden="true" />
                        Itinéraire
                      </a>
                    )}
                  </div>
                )}

                {shop.deliveryInfo && (
                  <div className="rounded-[2rem] bg-field p-6">
                    <h3 className="flex items-center gap-2 text-lg font-black">
                      <Truck className="h-5 w-5" aria-hidden="true" />
                      Livraison
                    </h3>
                    <p className="mt-3 whitespace-pre-line break-words text-lg">{shop.deliveryInfo}</p>
                  </div>
                )}

                {shop.paymentInfo && (
                  <div className="rounded-[2rem] bg-field p-6">
                    <h3 className="flex items-center gap-2 text-lg font-black">
                      <Wallet className="h-5 w-5" aria-hidden="true" />
                      Moyens de paiement
                    </h3>
                    <p className="mt-3 whitespace-pre-line break-words text-lg">{shop.paymentInfo}</p>
                    <p className="mt-2 text-sm text-muted">Information donnée par la boutique.</p>
                  </div>
                )}

                {socials.length > 0 && (
                  <div className="rounded-[2rem] bg-field p-6">
                    <h3 className="text-lg font-black">Suivez la boutique</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {socials.map((n) => {
                        const href = socialUrl(n, shop.social[n]!)!;
                        return (
                          <li key={n}>
                            {preview ? (
                              <span className="flex h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-white px-4 font-bold">
                                <NetworkIcon network={n} className="h-6 w-6" />
                                {NETWORK_LABEL[n]}
                              </span>
                            ) : (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-white px-4 font-bold hover:bg-field-strong"
                                aria-label={`${NETWORK_LABEL[n]} de ${shop.title} (nouvel onglet)`}
                              >
                                <NetworkIcon network={n} className="h-6 w-6" />
                                {NETWORK_LABEL[n]}
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </Wrap>
          </section>
        )}
      </main>

      {/* 7. Pied de page */}
      <footer className="bg-field py-6">
        <Wrap>
          <p className="text-base">
            Boutique créée avec{' '}
            <a href={SITE_URL} className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-red-dark">
              QASH
            </a>
          </p>
        </Wrap>
      </footer>

      {/* 6. Panier flottant (la feuille panier est gérée par la page) */}
      {showBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-ink p-3">
          <button
            type="button"
            onClick={onOpenCart}
            className="flex min-h-14 w-full items-center justify-between gap-3 rounded-full bg-[var(--accent)] px-6 text-lg font-bold text-[var(--on-accent)]"
          >
            <span className="flex items-center gap-2">
              Mon panier · {cartCount} produit{cartCount > 1 ? 's' : ''}
            </span>
            <span>{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}

      {detail && <ProductSheet product={detail} all={shop.products} cart={cart} onChange={onChangeQty} onClose={() => setDetail(null)} inert={preview} />}
    </div>
  );
};
