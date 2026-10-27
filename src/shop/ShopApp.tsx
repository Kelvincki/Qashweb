import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { SITE_URL } from '../config/site';
import { isValidSlug } from '../lib/shopSlug';
import { Shop, clearCachedShop, fetchCatalog, imageUrl, readCachedShop, writeCachedShop } from './api';
import { buttonClasses } from '../components/ui/Button';
import { Container } from '../components/ui/Layout';
import { fold, sanitizeWhatsapp, whatsappUrl } from './format';
import { applyShopMeta } from './meta';
import { ProductCard } from './ProductCard';

const PAGE_SIZE = 24;
const MIN_PRODUCTS_FOR_INDEXING = 3;
const ALL = '__all__';

type Status = 'loading' | 'ready' | 'not_found' | 'error';

export const ShopApp: React.FC<{ slug: string }> = ({ slug }) => {
  const [status, setStatus] = useState<Status>('loading');
  const [shop, setShop] = useState<Shop | null>(null);
  const [stale, setStale] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState(ALL);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // Chargement : dernier catalogue connu tout de suite, puis actualisation depuis le serveur
  useEffect(() => {
    if (!isValidSlug(slug)) {
      setStatus('not_found');
      return;
    }
    const controller = new AbortController();
    const cached = readCachedShop(slug);
    if (cached) {
      setShop(cached);
      setStale(true);
      setStatus('ready');
    } else {
      setShop(null);
      setStatus('loading');
    }

    fetchCatalog(slug, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.kind === 'ok') {
          setShop(result.shop);
          setStale(false);
          setStatus('ready');
          writeCachedShop(slug, result.raw);
        } else {
          clearCachedShop(slug);
          setShop(null);
          setStatus('not_found');
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        // Hors ligne ou serveur injoignable : on garde les dernières données si on en a
        setStatus((current) => (current === 'ready' ? 'ready' : 'error'));
      });

    return () => controller.abort();
  }, [slug, attempt]);

  // Titre, description et aperçu de partage
  useEffect(() => {
    if (status === 'ready' && shop) {
      applyShopMeta({
        slug,
        title: shop.title,
        description: shop.description,
        logoUrl: imageUrl(shop.logo, shop.v),
        indexable: shop.products.length >= MIN_PRODUCTS_FOR_INDEXING,
      });
    } else {
      applyShopMeta(null);
    }
  }, [status, shop, slug]);

  const categories = useMemo(() => {
    if (!shop) return [];
    const names: string[] = [];
    let hasOther = false;
    for (const p of shop.products) {
      if (!p.category) hasOther = true;
      else if (!names.includes(p.category)) names.push(p.category);
    }
    if (hasOther && names.length > 0) names.push('Autres');
    return names;
  }, [shop]);

  const filtered = useMemo(() => {
    if (!shop) return [];
    const q = fold(deferredQuery.trim());
    return shop.products.filter((p) => {
      const cat = p.category || 'Autres';
      if (category !== ALL && cat !== category) return false;
      if (!q) return true;
      return fold(`${p.name} ${p.variant} ${p.category}`).includes(q);
    });
  }, [shop, deferredQuery, category]);

  // Retour à la première page de résultats quand le filtre change
  useEffect(() => setVisible(PAGE_SIZE), [deferredQuery, category]);

  if (status === 'loading') return <ShopSkeleton />;

  if (status === 'not_found') {
    return (
      <Unavailable
        title="Cette boutique n'est pas disponible."
        text="Elle n'existe pas, ou son propriétaire ne l'a pas encore publiée."
      />
    );
  }

  if (status === 'error' || !shop) {
    return (
      <Unavailable
        title="La boutique ne s'est pas chargée."
        text="Vérifiez votre connexion internet, puis réessayez."
        onRetry={retry}
        showSiteLink={false}
      />
    );
  }

  const whatsappDigits = sanitizeWhatsapp(shop.whatsapp);
  const logo = imageUrl(shop.logo, shop.v);

  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <header className="bg-brand-yellow">
        <Container className="py-8 sm:py-12">
          <div className="flex items-start gap-4 sm:gap-6">
            <ShopLogo src={logo} name={shop.title} />
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-[clamp(1.875rem,1.2rem+3vw,3.75rem)] font-black leading-[1] tracking-tight">{shop.title}</h1>
              {shop.address && (
                <p className="mt-3 flex items-start gap-2 text-lg font-semibold leading-snug">
                  <MapPin className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="break-words">{shop.address}</span>
                </p>
              )}
            </div>
          </div>
          {shop.description && <p className="mt-5 max-w-[44rem] whitespace-pre-line break-words text-lg leading-relaxed">{shop.description}</p>}
          {whatsappDigits && (
            <a
              href={whatsappUrl(whatsappDigits, `Bonjour ${shop.title}, `)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses('dark', 'lg', 'mt-6')}
            >
              Écrire sur WhatsApp
            </a>
          )}
        </Container>
      </header>

      <main className="flex-1 pb-12">
        {/* Recherche et catégories, toujours à portée de pouce */}
        <div className="sticky top-0 z-20 bg-white py-3">
          <Container>
            <div className="relative">
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
            {categories.length > 0 && (
              <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0" role="group" aria-label="Catégories">
                {[ALL, ...categories].map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                    className={`flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-5 text-base font-bold transition-colors ${
                      category === c ? 'bg-ink text-white' : 'bg-field text-ink hover:bg-field-strong'
                    }`}
                  >
                    {c === ALL ? 'Tout' : c}
                  </button>
                ))}
              </div>
            )}
          </Container>
        </div>

        <Container className="pt-4">
          {stale && (
            <p className="mb-4 rounded-2xl bg-warning-soft p-4 text-base" role="status">
              Affichage des dernières données enregistrées sur cet appareil.{' '}
              <button type="button" onClick={retry} className="font-bold underline decoration-2 underline-offset-4">
                Actualiser
              </button>
            </p>
          )}

          {shop.products.length === 0 ? (
            <EmptyMessage title="Cette boutique n'a pas encore de produits." text="Revenez bientôt, ou écrivez directement à la boutique." />
          ) : filtered.length === 0 ? (
            <EmptyMessage title="Aucun produit trouvé." text="Essayez un autre mot, ou choisissez « Tout »." />
          ) : (
            <>
              <p className="mb-4 text-base" aria-live="polite">
                {filtered.length} produit{filtered.length > 1 ? 's' : ''}
              </p>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.slice(0, visible).map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 2} />
                ))}
              </ul>
              {visible < filtered.length && (
                <div className="mt-8 flex justify-center">
                  <button type="button" onClick={() => setVisible((n) => n + PAGE_SIZE)} className={buttonClasses('quiet', 'lg')}>
                    Voir plus de produits
                  </button>
                </div>
              )}
            </>
          )}
        </Container>
      </main>

      <ShopFooter />
    </div>
  );
};

const ShopLogo: React.FC<{ src: string | null; name: string }> = ({ src, name }) => {
  const [failed, setFailed] = useState(false);
  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-white sm:h-28 sm:w-28">
      {src && !failed ? (
        <img src={src} alt={`Logo de ${name}`} width={112} height={112} decoding="async" fetchPriority="high" onError={() => setFailed(true)} className="h-full w-full object-contain" />
      ) : (
        <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-4xl font-black sm:text-5xl">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

const ShopFooter: React.FC = () => (
  <footer className="bg-field py-8">
    <Container>
      <p className="text-base">
        Boutique en ligne propulsée par{' '}
        <a href={SITE_URL} className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
          QASH
        </a>
      </p>
    </Container>
  </footer>
);

const EmptyMessage: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="rounded-[2rem] bg-field p-8 sm:p-12">
    <p className="text-title font-black">{title}</p>
    <p className="mt-2 text-lg">{text}</p>
  </div>
);

const Unavailable: React.FC<{ title: string; text: string; onRetry?: () => void; showSiteLink?: boolean }> = ({ title, text, onRetry, showSiteLink = true }) => (
  <div className="flex min-h-screen flex-col bg-white text-ink">
    <main className="flex-1">
      <Container className="py-16 sm:py-24">
        <h1 className="max-w-[18ch] text-[clamp(2.25rem,1.5rem+3.4vw,4.5rem)] font-black leading-[0.98] tracking-tight">{title}</h1>
        <p className="mt-6 max-w-[36rem] text-xl leading-relaxed">{text}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          {onRetry && (
            <button type="button" onClick={onRetry} className={buttonClasses('primary', 'lg')}>
              Réessayer
            </button>
          )}
          {showSiteLink && (
            <a href={SITE_URL} className={buttonClasses(onRetry ? 'quiet' : 'primary', 'lg')}>
              Découvrir QASH
            </a>
          )}
        </div>
      </Container>
    </main>
    <ShopFooter />
  </div>
);

/** Squelette : même mise en page que la boutique, pour que rien ne saute à l'arrivée des données. */
const ShopSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white" aria-busy="true" aria-label="Chargement de la boutique">
    <div className="bg-brand-yellow">
      <Container className="py-8 sm:py-12">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 animate-pulse rounded-3xl bg-white/70 sm:h-28 sm:w-28" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-9 w-3/4 animate-pulse rounded-full bg-white/70" />
            <div className="h-5 w-1/2 animate-pulse rounded-full bg-white/70" />
          </div>
        </div>
      </Container>
    </div>
    <Container className="pt-6">
      <div className="h-12 w-full animate-pulse rounded-full bg-field" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[1.5rem] bg-field">
            <div className="aspect-square w-full animate-pulse bg-field-strong" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-field-strong" />
              <div className="h-5 w-1/2 animate-pulse rounded-full bg-field-strong" />
              <div className="h-11 w-full animate-pulse rounded-full bg-field-strong" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  </div>
);
