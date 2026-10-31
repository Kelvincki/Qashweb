import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SITE_URL } from '../config/site';
import { isValidSlug } from '../lib/shopSlug';
import { Shop, ShopProduct, clearCachedShop, fetchCatalog, readCachedShop, writeCachedShop } from './api';
import { buttonClasses } from '../components/ui/Button';
import { Container } from '../components/ui/Layout';
import { sanitizeWhatsapp } from './format';
import { Cart, cartLines, changeQty, loadCart, reconcile, saveCart } from './cart';
import { CartSheet } from './CartSheet';
import { applyShopMeta } from './meta';
import { ShopView } from './ShopView';

type Status = 'loading' | 'ready' | 'not_found' | 'error';

export const ShopApp: React.FC<{ slug: string }> = ({ slug }) => {
  const [status, setStatus] = useState<Status>('loading');
  const [shop, setShop] = useState<Shop | null>(null);
  const [stale, setStale] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // Panier (sans compte) : gardé sur l'appareil, rien n'est envoyé à nos serveurs
  const [cart, setCart] = useState<Cart>(() => loadCart(slug));
  const [cartOpen, setCartOpen] = useState(false);
  const [droppedNotice, setDroppedNotice] = useState(false);

  useEffect(() => saveCart(slug, cart), [slug, cart]);

  // Quand le catalogue arrive ou change : retire les produits disparus ou en rupture
  useEffect(() => {
    if (!shop) return;
    const result = reconcile(cart, shop.products);
    if (result.dropped > 0) {
      setCart(result.cart);
      setDroppedNotice(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop]);

  const onChangeQty = useCallback((product: ShopProduct, direction: 1 | -1) => setCart((c) => changeQty(c, product, direction)), []);
  const onRemove = useCallback(
    (id: string) =>
      setCart((c) => {
        const { [id]: _removed, ...rest } = c;
        return rest;
      }),
    [],
  );
  const onClear = useCallback(() => {
    setCart({});
    setCartOpen(false);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const { lines, total } = useMemo(() => (shop ? cartLines(cart, shop.products) : { lines: [], total: 0 }), [cart, shop]);

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

  // Titre, description, aperçu de partage et données structurées
  useEffect(() => {
    applyShopMeta(status === 'ready' && shop ? shop : null);
  }, [status, shop]);

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

  return (
    <>
      <ShopView
        shop={shop}
        cart={cart}
        onChangeQty={onChangeQty}
        cartCount={lines.length}
        cartTotal={total}
        onOpenCart={() => setCartOpen(true)}
        stale={stale}
        onRefresh={retry}
        droppedNotice={droppedNotice}
        onDismissDropped={() => setDroppedNotice(false)}
      />
      {cartOpen && (
        <CartSheet
          shopTitle={shop.title}
          slug={slug}
          accent={shop.accent}
          whatsappDigits={sanitizeWhatsapp(shop.whatsapp)}
          lines={lines}
          total={total}
          onChange={(id, direction) => {
            const p = shop.products.find((x) => x.id === id);
            if (p) onChangeQty(p, direction);
          }}
          onRemove={onRemove}
          onClear={onClear}
          onClose={closeCart}
        />
      )}
    </>
  );
};

const ShopFooter: React.FC = () => (
  <footer className="bg-field py-6">
    <Container>
      <p className="text-base">
        Boutique créée avec{' '}
        <a href={SITE_URL} className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
          QASH
        </a>
      </p>
    </Container>
  </footer>
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

/** Squelette : même mise en page que la boutique (bannière, logo, grille), pour que rien ne saute à l'arrivée des données. */
const ShopSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white" aria-busy="true" aria-label="Chargement de la boutique">
    <div className="aspect-[3/1] w-full animate-pulse bg-field-strong sm:aspect-[4/1]" />
    <Container>
      <div className="-mt-10 h-20 w-20 animate-pulse rounded-full border-4 border-white bg-field sm:-mt-14 sm:h-28 sm:w-28" />
      <div className="mt-4 h-9 w-3/4 animate-pulse rounded-full bg-field" />
      <div className="mt-3 h-5 w-1/2 animate-pulse rounded-full bg-field" />
      <div className="mt-5 flex gap-2">
        <div className="h-12 w-48 animate-pulse rounded-full bg-field" />
        <div className="h-12 w-32 animate-pulse rounded-full bg-field" />
      </div>
      <div className="mt-8 h-12 w-full animate-pulse rounded-full bg-field" />
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
