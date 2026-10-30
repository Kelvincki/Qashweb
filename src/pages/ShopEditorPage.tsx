import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, ExternalLink, ImagePlus, Search, Share2, Trash2 } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { Container } from '../components/ui/Layout';
import { Button, ButtonLink, buttonClasses } from '../components/ui/Button';
import { Field, Notice, Spinner, inputClass } from '../components/ui/AuthShell';
import { AppLink } from '../lib/navigation';
import { PageRoute } from '../types';
import { SITE_URL } from '../config/site';
import { fold, formatPrice, priceUnit, sanitizeWhatsapp } from '../shop/format';
import {
  CatalogItem,
  CatalogSettings,
  EditorProduct,
  EditorStore,
  ItemUpdate,
  loadItems,
  loadProducts,
  loadProfile,
  loadSettings,
  loadStore,
  loadSubscriptionStatus,
  publicCatalogVisible,
  publicImageUrl,
  removeImages,
  saveSettings,
  setItems as saveItems,
  slugAvailable,
  storagePath,
  uploadImage,
} from '../catalog/api';
import { catalogErrorMessage } from '../catalog/errors';
import { ImageError, PreparedImage, prepareImage } from '../catalog/image';
import { SLUG_MAX, SLUG_MIN, cleanSlugInput, finalizeSlug, isValidSlugFormat, slugFromName } from '../catalog/slug';

/**
 * Ma boutique en ligne (gérant) : réglages, produits visibles, photos, publication.
 * Tout passe par la session du gérant (RLS et RPC catalog_*). Aucune décision de droit ici :
 * le rôle lu sert à l'affichage, le serveur refuse not_manager. Ni prix d'achat ni stock.
 */

interface ShopEditorPageProps {
  onNavigate: (route: PageRoute) => void;
}

interface Form {
  slug: string;
  title: string;
  description: string;
  whatsapp: string;
  address: string;
  logoPath: string | null;
  published: boolean;
}

type Items = Record<number, CatalogItem>;
type Phase = 'loading' | 'error' | 'no_store' | 'not_manager' | 'ready';
type SlugState = 'idle' | 'checking' | 'free' | 'own' | 'taken' | 'invalid' | 'error';

const HIDDEN: CatalogItem = { visible: false, photoPath: null };
const PAGE_SIZE = 50;
const ALL = '__all__';
const OTHER = 'Autres';

const formEquals = (a: Form, b: Form): boolean =>
  a.slug === b.slug &&
  a.title.trim() === b.title.trim() &&
  a.description.trim() === b.description.trim() &&
  a.whatsapp.trim() === b.whatsapp.trim() &&
  a.address.trim() === b.address.trim() &&
  a.logoPath === b.logoPath &&
  a.published === b.published;

const shopUrl = (slug: string): string => `${SITE_URL}/b/${slug}`;

export const ShopEditorPage: React.FC<ShopEditorPageProps> = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [store, setStore] = useState<EditorStore | null>(null);
  const [products, setProducts] = useState<EditorProduct[]>([]);
  const [subStatus, setSubStatus] = useState<string | null>(null);

  // Brouillon (ce qui est affiché) et référence (ce que le serveur a enregistré)
  const [form, setForm] = useState<Form | null>(null);
  const [items, setItems] = useState<Items>({});
  const [base, setBase] = useState<{ form: Form; items: Items; isNew: boolean } | null>(null);
  const [pendingLogo, setPendingLogo] = useState<PreparedImage | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<Record<number, PreparedImage>>({});

  const [slugState, setSlugState] = useState<SlugState>('idle');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [showPreview, setShowPreview] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveStep, setSaveStep] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<{ kind: 'success' | 'info'; text: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const fileTarget = useRef<number | 'logo' | null>(null);

  // Non connecté : page de connexion (même comportement que Mon espace)
  useEffect(() => {
    if (!authLoading && !user) onNavigate('/login');
  }, [authLoading, user, onNavigate]);

  const load = useCallback(async () => {
    if (!user) return;
    setPhase('loading');
    setLoadError(null);
    try {
      const profile = await loadProfile(user.id);
      if (!profile || !profile.storeId) {
        setPhase('no_store');
        return;
      }
      if (profile.role.toUpperCase() !== 'GERANT') {
        setPhase('not_manager');
        return;
      }
      const st = await loadStore(profile.storeId);
      const [settings, savedItems, prods, status] = await Promise.all([
        loadSettings(st.id),
        loadItems(st.id),
        loadProducts(st.inviteCode),
        loadSubscriptionStatus().catch(() => null),
      ]);
      const initial = formFrom(settings, st);
      setStore(st);
      setProducts(prods);
      setSubStatus(status);
      setForm(initial);
      setItems(savedItems);
      setBase({ form: initial, items: savedItems, isNew: settings === null });
      setPendingLogo(null);
      setPendingPhotos({});
      setPhase('ready');
    } catch (err) {
      setLoadError(catalogErrorMessage(err));
      setPhase('error');
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  // Libère les aperçus locaux en quittant la page
  const previews = useRef<string[]>([]);
  previews.current = [pendingLogo?.previewUrl, ...(Object.values(pendingPhotos) as PreparedImage[]).map((p) => p.previewUrl)].filter(Boolean) as string[];
  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const getItem = useCallback((id: number): CatalogItem => items[id] ?? HIDDEN, [items]);

  const dirty = useMemo(() => {
    if (!form || !base) return false;
    if (base.isNew || !formEquals(form, base.form) || pendingLogo || Object.keys(pendingPhotos).length > 0) return true;
    return products.some((p) => {
      const a = items[p.localId] ?? HIDDEN;
      const b = base.items[p.localId] ?? HIDDEN;
      return a.visible !== b.visible || a.photoPath !== b.photoPath;
    });
  }, [form, base, items, products, pendingLogo, pendingPhotos]);

  // Avertit avant de quitter avec des modifications non enregistrées
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Disponibilité de l'adresse, 400 ms après la dernière frappe
  const slug = form?.slug ?? '';
  const baseSlug = base && !base.isNew ? base.form.slug : null;
  useEffect(() => {
    if (!slug) {
      setSlugState('idle');
      return;
    }
    if (!isValidSlugFormat(slug)) {
      setSlugState('invalid');
      return;
    }
    if (slug === baseSlug) {
      setSlugState('own');
      return;
    }
    setSlugState('checking');
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const free = await slugAvailable(slug);
        if (!cancelled) setSlugState(free ? 'free' : 'taken');
      } catch {
        if (!cancelled) setSlugState('error');
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, baseSlug]);

  const update = (patch: Partial<Form>) => {
    setSaveNotice(null);
    setForm((f) => (f ? { ...f, ...patch } : f));
  };

  const setVisible = (ids: number[], visible: boolean) => {
    setSaveNotice(null);
    setItems((cur) => {
      const next = { ...cur };
      for (const id of ids) next[id] = { ...(next[id] ?? HIDDEN), visible };
      return next;
    });
  };

  // Choix d'un fichier (logo ou photo de produit) : contrôle puis compression dans le navigateur
  const pickFile = (target: number | 'logo') => {
    fileTarget.current = target;
    fileInput.current?.click();
  };

  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = fileTarget.current;
    e.target.value = '';
    if (!file || target === null) return;
    setImageError(null);
    setSaveNotice(null);
    try {
      const prepared = await prepareImage(file);
      if (target === 'logo') {
        setPendingLogo((old) => {
          if (old) URL.revokeObjectURL(old.previewUrl);
          return prepared;
        });
      } else {
        setPendingPhotos((old) => {
          if (old[target]) URL.revokeObjectURL(old[target].previewUrl);
          return { ...old, [target]: prepared };
        });
      }
    } catch (err) {
      setImageError(err instanceof ImageError ? err.message : catalogErrorMessage(err));
    }
  };

  const removePhoto = (id: number) => {
    setPendingPhotos((old) => {
      if (!old[id]) return old;
      URL.revokeObjectURL(old[id].previewUrl);
      const { [id]: _gone, ...rest } = old;
      return rest;
    });
    setItems((cur) => ({ ...cur, [id]: { ...(cur[id] ?? HIDDEN), photoPath: null } }));
  };

  const removeLogo = () => {
    if (pendingLogo) URL.revokeObjectURL(pendingLogo.previewUrl);
    setPendingLogo(null);
    update({ logoPath: null });
  };

  const save = async () => {
    if (!form || !base || !store || saving) return;
    setSaveError(null);
    setSaveNotice(null);

    const finalSlug = finalizeSlug(form.slug);
    if (!isValidSlugFormat(finalSlug)) {
      setSaveError("Choisissez d'abord l'adresse de votre boutique (3 à 30 caractères : lettres, chiffres, tirets).");
      return;
    }
    if (slugState === 'taken') {
      setSaveError('Cette adresse est déjà prise ou réservée. Choisissez-en une autre.');
      return;
    }
    const hasPhone = form.whatsapp.trim() !== '';
    const digits = hasPhone ? sanitizeWhatsapp(form.whatsapp) : null;
    if (hasPhone && !digits) {
      setSaveError('Le numéro WhatsApp n’est pas valide. Saisissez 8 à 15 chiffres avec l’indicatif du pays, par exemple +221 77 123 45 67.');
      return;
    }
    if (form.published && (!form.title.trim() || !digits)) {
      setSaveError('Pour publier, indiquez le nom de la boutique et un numéro WhatsApp.');
      return;
    }

    setSaving(true);
    const work: Items = { ...items };
    const replaced: string[] = [];
    let logoPath = form.logoPath;
    try {
      // 1. Logo : envoi dans {store_id}/…
      if (pendingLogo) {
        setSaveStep('Envoi du logo…');
        const path = storagePath(store.id, `logo-${Date.now()}.${pendingLogo.ext}`);
        await uploadImage(path, pendingLogo.blob, pendingLogo.mime);
        URL.revokeObjectURL(pendingLogo.previewUrl);
        logoPath = path;
        setPendingLogo(null);
        setForm((f) => (f ? { ...f, logoPath: path } : f));
      }

      // 2. Réglages (catalog_save_settings)
      setSaveStep('Enregistrement des réglages…');
      await saveSettings({
        slug: finalSlug,
        title: form.title.trim(),
        description: form.description.trim(),
        whatsapp: digits ?? '',
        address: form.address.trim(),
        logoPath,
        published: form.published,
      });

      // 3. Photos des produits : envoi, puis chemin conservé dans le brouillon
      const photoIds = Object.keys(pendingPhotos).map(Number);
      let done = 0;
      for (const id of photoIds) {
        done += 1;
        setSaveStep(`Envoi des photos (${done}/${photoIds.length})…`);
        const img = pendingPhotos[id];
        const path = storagePath(store.id, `p-${id}-${Date.now()}.${img.ext}`);
        await uploadImage(path, img.blob, img.mime);
        URL.revokeObjectURL(img.previewUrl);
        work[id] = { ...(work[id] ?? HIDDEN), photoPath: path };
        setItems({ ...work });
        setPendingPhotos((old) => {
          const { [id]: _sent, ...rest } = old;
          return rest;
        });
      }

      // 4. Visibilité et photos (catalog_set_items), seulement ce qui a changé
      setSaveStep('Enregistrement des produits…');
      const updates: ItemUpdate[] = [];
      for (const p of products) {
        const cur = work[p.localId] ?? HIDDEN;
        const old = base.items[p.localId] ?? HIDDEN;
        const photoChanged = cur.photoPath !== old.photoPath;
        if (cur.visible !== old.visible || photoChanged) {
          updates.push({ local_id: p.localId, visible: cur.visible, ...(photoChanged ? { photo_path: cur.photoPath } : {}) });
          if (photoChanged && old.photoPath) replaced.push(old.photoPath);
        }
      }
      await saveItems(updates);
      if (base.form.logoPath && base.form.logoPath !== logoPath) replaced.push(base.form.logoPath);

      const saved: Form = { ...form, slug: finalSlug, logoPath };
      setForm(saved);
      setBase({ form: saved, items: { ...work }, isNew: false });
      void removeImages(store.id, replaced);

      // Ce que le public voit vraiment (le serveur masque une boutique dont l'abonnement est terminé)
      if (saved.published) {
        let visible = true;
        try {
          visible = await publicCatalogVisible(finalSlug);
        } catch {
          visible = true;
        }
        setSaveNotice(
          visible
            ? { kind: 'success', text: 'Votre boutique est enregistrée et publiée.' }
            : {
                kind: 'info',
                text: "Vos modifications sont enregistrées, mais le serveur ne montre pas encore votre boutique au public. Cela arrive quand l'abonnement est terminé depuis plus de 3 jours.",
              },
        );
      } else {
        setSaveNotice({ kind: 'success', text: 'Modifications enregistrées. Votre boutique n’est pas publiée.' });
      }
    } catch (err) {
      setSaveError(catalogErrorMessage(err));
    } finally {
      setSaving(false);
      setSaveStep('');
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setSaveNotice({ kind: 'info', text: `Copiez le lien à la main : ${url}` });
    }
  };

  // Liste filtrée
  const categories = useMemo(() => {
    const names: string[] = [];
    let hasOther = false;
    for (const p of products) {
      if (!p.category) hasOther = true;
      else if (!names.includes(p.category)) names.push(p.category);
    }
    if (hasOther && names.length > 0) names.push(OTHER);
    return names;
  }, [products]);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return products.filter((p) => {
      if (category !== ALL && (p.category || OTHER) !== category) return false;
      return !q || fold(`${p.name} ${p.variant} ${p.category}`).includes(q);
    });
  }, [products, query, category]);

  useEffect(() => setShown(PAGE_SIZE), [query, category]);

  const visibleCount = products.filter((p) => getItem(p.localId).visible).length;
  const filteredIds = filtered.map((p) => p.localId);
  const allVisible = filtered.length > 0 && filtered.every((p) => getItem(p.localId).visible);

  // --- États de la page ---
  if (authLoading || !user || phase === 'loading') return <EditorSkeleton />;

  if (phase === 'error') {
    return (
      <Shell>
        <Notice kind="error">{loadError ?? 'Impossible de charger votre boutique.'}</Notice>
        <Button className="mt-6" size="lg" onClick={() => void load()}>
          Réessayer
        </Button>
      </Shell>
    );
  }

  if (phase === 'not_manager' || phase === 'no_store') {
    return (
      <Shell>
        <Panel>
          <h1 className="text-title font-black">
            {phase === 'not_manager' ? 'Réservé au gérant de la boutique.' : 'Pas encore de boutique.'}
          </h1>
          <p className="mt-3 max-w-[36rem] text-lg leading-relaxed">
            {phase === 'not_manager'
              ? 'Seul le gérant peut créer et publier la boutique en ligne. Demandez-lui de le faire depuis son compte.'
              : "Créez d'abord votre boutique dans l'application QASH. Elle apparaîtra ensuite ici."}
          </p>
          <ButtonLink to="/dashboard" className="mt-6" size="lg">
            Retour à Mon espace
          </ButtonLink>
        </Panel>
      </Shell>
    );
  }

  if (!form || !base || !store) return <EditorSkeleton />;

  const publishedUrl = base.form.published && !base.isNew ? shopUrl(base.form.slug) : null;
  const waDigits = form.whatsapp.trim() ? sanitizeWhatsapp(form.whatsapp) : null;
  const waProblem = form.whatsapp.trim() !== '' && !waDigits;
  const waMaybeLocal = waDigits !== null && waDigits.length === 9;
  const logoSrc = pendingLogo?.previewUrl ?? publicImageUrl(form.logoPath);
  const slugMessage = slugText(slugState, slug);

  return (
    <div className="bg-field pb-40">
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={onFileChosen} />

      <div className="bg-white">
        <Container className="pb-8 pt-8 sm:pt-12">
          <AppLink
            to="/dashboard"
            onClick={(e) => {
              if (dirty && !window.confirm('Vous avez des modifications non enregistrées. Quitter quand même ?')) e.preventDefault();
            }}
            className="inline-flex min-h-11 items-center gap-2 text-lg font-bold underline decoration-2 underline-offset-4 hover:text-brand-red"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Mon espace
          </AppLink>
          <h1 className="mt-4 text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] font-black leading-[1] tracking-tight">Ma boutique en ligne</h1>
          <p className="mt-4 max-w-[40rem] text-xl leading-relaxed">
            Choisissez les produits à montrer à vos clients. Ils commandent par WhatsApp : aucun paiement en ligne.
          </p>
          <p
            className={`mt-5 inline-flex rounded-full px-4 py-2 text-lg font-black ${base.form.published && !base.isNew ? 'bg-success-soft' : 'bg-field'}`}
          >
            {base.form.published && !base.isNew ? 'Publiée' : 'Non publiée'}
          </p>
        </Container>
      </div>

      <Container className="space-y-4 pt-8">
        {subStatus === 'expired' && (
          <Notice kind="info">
            Votre abonnement est terminé : le serveur masque votre boutique publique, même si elle est marquée « publiée ». Vos réglages et vos
            produits sont conservés. La boutique réapparaît dès que l’abonnement est renouvelé, depuis Mon espace.
          </Notice>
        )}
        {subStatus === 'grace' && (
          <Notice kind="info">
            Votre abonnement est en période de grâce. Si l’échéance est dépassée depuis plus de 3 jours, le serveur masque la boutique publique.
          </Notice>
        )}

        {/* Lien après publication */}
        {publishedUrl && (
          <Panel>
            <h2 className="text-title font-black">Votre boutique est en ligne</h2>
            <p className="mt-3 break-all rounded-2xl bg-field p-4 text-lg font-bold" data-testid="shop-link">
              {publishedUrl}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="dark" onClick={() => void copyLink(publishedUrl)}>
                {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
                {copied ? 'Lien copié' : 'Copier le lien'}
              </Button>
              <a
                className={buttonClasses('primary', 'md')}
                href={`https://wa.me/?text=${encodeURIComponent(`Découvrez ma boutique en ligne : ${publishedUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Share2 className="h-5 w-5" aria-hidden="true" />
                Partager sur WhatsApp
              </a>
              <a className={buttonClasses('quiet', 'md')} href={publishedUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
                Voir ma boutique
              </a>
            </div>
          </Panel>
        )}

        {/* Réglages */}
        <Panel>
          <h2 className="text-title font-black">Réglages</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <label htmlFor="shop-slug" className="block text-lg font-bold">
                Adresse de la boutique
              </label>
              <input
                id="shop-slug"
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={SLUG_MAX}
                value={form.slug}
                onChange={(e) => update({ slug: cleanSlugInput(e.target.value) })}
                onBlur={() => update({ slug: finalizeSlug(form.slug) })}
                aria-describedby="shop-slug-hint shop-slug-state"
                aria-invalid={slugState === 'invalid' || slugState === 'taken'}
                className={`mt-2 ${inputClass}`}
              />
              <p id="shop-slug-hint" className="mt-2 break-all text-base text-muted">
                {SITE_URL}/b/<strong className="text-ink">{slug || 'votre-boutique'}</strong>
              </p>
              <p id="shop-slug-state" role="status" className={`mt-1 text-base font-bold ${slugMessage.bad ? 'text-brand-red-dark' : ''}`}>
                {slugState === 'checking' && <Spinner className="mr-2 h-4 w-4 align-[-2px]" />}
                {slugMessage.text}
              </p>
              <p className="mt-1 text-base text-muted">
                {SLUG_MIN} à {SLUG_MAX} caractères : lettres minuscules, chiffres et tirets.
              </p>
            </div>

            <Field
              id="shop-title"
              label="Nom affiché"
              type="text"
              maxLength={120}
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              autoComplete="organization"
            />

            <div className="lg:col-span-2">
              <label htmlFor="shop-description" className="block text-lg font-bold">
                Description <span className="font-normal text-muted">(facultatif)</span>
              </label>
              <textarea
                id="shop-description"
                rows={3}
                maxLength={600}
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                className={`mt-2 ${inputClass}`}
              />
            </div>

            <div>
              <Field
                id="shop-whatsapp"
                label="Numéro WhatsApp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={30}
                placeholder="+221 77 123 45 67"
                value={form.whatsapp}
                onChange={(e) => update({ whatsapp: e.target.value })}
                aria-invalid={waProblem}
                hint="Avec l'indicatif du pays. Vos clients vous écrivent à ce numéro pour commander."
              />
              {waProblem && (
                <p role="alert" className="mt-2 text-base font-bold text-brand-red-dark">
                  Numéro non valide : 8 à 15 chiffres.
                </p>
              )}
              {waMaybeLocal && (
                <p className="mt-2 text-base">Il manque peut-être l’indicatif du pays (221 pour le Sénégal).</p>
              )}
            </div>

            <Field
              id="shop-address"
              label="Adresse de la boutique (facultatif)"
              type="text"
              maxLength={200}
              value={form.address}
              onChange={(e) => update({ address: e.target.value })}
              autoComplete="street-address"
            />

            <div className="lg:col-span-2">
              <p className="text-lg font-bold">
                Logo <span className="font-normal text-muted">(facultatif)</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-field">
                  {logoSrc ? (
                    <img src={logoSrc} alt="Logo de la boutique" className="h-full w-full object-contain" />
                  ) : (
                    <span aria-hidden="true" className="text-4xl font-black text-ink/30">
                      {(form.title || store.name).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="quiet" onClick={() => pickFile('logo')}>
                    <ImagePlus className="h-5 w-5" aria-hidden="true" />
                    {logoSrc ? 'Changer le logo' : 'Choisir un logo'}
                  </Button>
                  {logoSrc && (
                    <Button variant="quiet" onClick={removeLogo}>
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      Retirer
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-base text-muted">WebP, JPEG ou PNG. L’image est réduite automatiquement (1 Mo au maximum).</p>
            </div>
          </div>
        </Panel>

        {/* Publication */}
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 id="publish-label" className="text-title font-black">
                Publier ma boutique
              </h2>
              <p id="publish-hint" className="mt-1 text-lg">
                {form.published
                  ? 'Les clients qui ont le lien voient les produits affichés.'
                  : 'Tant que la boutique n’est pas publiée, personne ne la voit.'}
              </p>
            </div>
            <Switch checked={form.published} onChange={(v) => update({ published: v })} labelledBy="publish-label" describedBy="publish-hint" />
          </div>
          {form.published && (!form.title.trim() || !waDigits) && (
            <p className="mt-4 text-base font-bold text-brand-red-dark">Pour publier, indiquez le nom de la boutique et un numéro WhatsApp valide.</p>
          )}
        </Panel>

        {/* Produits */}
        <Panel>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-title font-black">Produits</h2>
            <p className="text-lg" aria-live="polite">
              {visibleCount} affiché{visibleCount > 1 ? 's' : ''} sur {products.length}
            </p>
          </div>

          {products.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-field p-5 text-lg">
              Vous n’avez pas encore de produits. Ajoutez-les dans l’application QASH : ils apparaîtront ici après la synchronisation.
            </p>
          ) : (
            <>
              <p className="mt-2 text-base text-muted">Seuls les produits « affichés » apparaissent dans votre boutique. Les prix viennent de l’application.</p>

              <div className="relative mt-5">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Rechercher un produit"
                  placeholder="Rechercher un produit"
                  value={query}
                  maxLength={80}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`${inputClass} pl-12`}
                />
              </div>

              {categories.length > 0 && (
                <div role="group" aria-label="Catégories" className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
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

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="quiet" disabled={filtered.length === 0 || allVisible} onClick={() => setVisible(filteredIds, true)}>
                  Tout afficher{filtered.length !== products.length ? ` (${filtered.length})` : ''}
                </Button>
                <Button variant="quiet" disabled={filtered.length === 0 || filtered.every((p) => !getItem(p.localId).visible)} onClick={() => setVisible(filteredIds, false)}>
                  Tout masquer{filtered.length !== products.length ? ` (${filtered.length})` : ''}
                </Button>
              </div>

              {imageError && (
                <div className="mt-4">
                  <Notice kind="error">{imageError}</Notice>
                </div>
              )}

              {filtered.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-field p-5 text-lg">Aucun produit trouvé. Essayez un autre mot, ou choisissez « Tout ».</p>
              ) : (
                <ul className="mt-5 space-y-2">
                  {filtered.slice(0, shown).map((p) => (
                    <ProductRow
                      key={p.localId}
                      product={p}
                      item={getItem(p.localId)}
                      pendingUrl={pendingPhotos[p.localId]?.previewUrl ?? null}
                      onToggle={(v) => setVisible([p.localId], v)}
                      onPick={() => pickFile(p.localId)}
                      onRemovePhoto={() => removePhoto(p.localId)}
                    />
                  ))}
                </ul>
              )}
              {shown < filtered.length && (
                <div className="mt-6 flex justify-center">
                  <Button variant="quiet" size="lg" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                    Voir plus de produits
                  </Button>
                </div>
              )}
            </>
          )}
        </Panel>

        {/* Aperçu */}
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-title font-black">Aperçu</h2>
              <p className="mt-1 text-lg">Ce que verront vos clients, avant même de publier.</p>
            </div>
            <Button variant="quiet" aria-expanded={showPreview} onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? 'Masquer l’aperçu' : 'Voir l’aperçu'}
            </Button>
          </div>
          {showPreview && (
            <PreviewPane
              form={form}
              logoSrc={logoSrc}
              products={products.filter((p) => getItem(p.localId).visible)}
              photoFor={(id) => pendingPhotos[id]?.previewUrl ?? publicImageUrl(getItem(id).photoPath)}
            />
          )}
        </Panel>
      </Container>

      {/* Barre d'enregistrement */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-ink px-3 py-3">
        <Container>
          <div className="space-y-2">
            {saveError && (
              <div className="rounded-2xl bg-danger-soft p-3 text-base leading-snug" role="alert">
                {saveError}
              </div>
            )}
            {saveNotice && !saveError && (
              <div className={`rounded-2xl p-3 text-base leading-snug ${saveNotice.kind === 'success' ? 'bg-success-soft' : 'bg-warning-soft'}`} role="status">
                {saveNotice.text}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-base font-semibold text-white" role="status">
                {saving ? saveStep || 'Enregistrement…' : dirty ? 'Modifications non enregistrées' : 'Tout est enregistré'}
              </p>
              <Button variant="yellow" size="lg" disabled={!dirty || saving} onClick={() => void save()}>
                {saving && <Spinner />}
                {form.published && (!base.form.published || base.isNew) ? 'Enregistrer et publier' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

function formFrom(settings: CatalogSettings | null, store: EditorStore): Form {
  if (settings) {
    return {
      slug: settings.slug,
      title: settings.title,
      description: settings.description,
      whatsapp: settings.whatsapp,
      address: settings.address,
      logoPath: settings.logoPath,
      published: settings.published,
    };
  }
  // Première visite : propositions tirées de la boutique, à vérifier avant d'enregistrer
  const proposed = slugFromName(store.name);
  return {
    slug: isValidSlugFormat(proposed) ? proposed : '',
    title: store.name,
    description: '',
    whatsapp: '',
    address: store.location,
    logoPath: null,
    published: false,
  };
}

function slugText(state: SlugState, slug: string): { text: string; bad: boolean } {
  switch (state) {
    case 'checking':
      return { text: 'Vérification…', bad: false };
    case 'free':
      return { text: 'Cette adresse est libre.', bad: false };
    case 'own':
      return { text: 'C’est l’adresse actuelle de votre boutique.', bad: false };
    case 'taken':
      return { text: 'Déjà prise ou réservée. Essayez-en une autre.', bad: true };
    case 'invalid':
      return {
        text: slug.endsWith('-')
          ? 'Pas de tiret à la fin.'
          : slug.length < SLUG_MIN
            ? `Trop courte : ${SLUG_MIN} caractères au minimum.`
            : 'Adresse non valide.',
        bad: true,
      };
    case 'error':
      return { text: 'Vérification impossible pour le moment. Elle sera refaite à l’enregistrement.', bad: false };
    default:
      return { text: 'Choisissez l’adresse de votre boutique.', bad: false };
  }
}

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-field pb-24">
    <Container className="pt-10 sm:pt-14">
      <AppLink to="/dashboard" className="mb-6 inline-flex min-h-11 items-center gap-2 text-lg font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Mon espace
      </AppLink>
      {children}
    </Container>
  </div>
);

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="rounded-[2rem] bg-white p-6 sm:p-8">{children}</section>
);

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string; labelledBy?: string; describedBy?: string }> = ({
  checked,
  onChange,
  label,
  labelledBy,
  describedBy,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    aria-labelledby={labelledBy}
    aria-describedby={describedBy}
    onClick={() => onChange(!checked)}
    className="group flex h-11 w-16 shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ink"
  >
    <span className={`flex h-8 w-14 items-center rounded-full px-1 transition-colors ${checked ? 'bg-ink' : 'bg-field-strong'}`}>
      <span className={`h-6 w-6 rounded-full transition-transform ${checked ? 'translate-x-6 bg-brand-yellow' : 'translate-x-0 bg-white'}`} />
    </span>
  </button>
);

const ProductRow: React.FC<{
  product: EditorProduct;
  item: CatalogItem;
  pendingUrl: string | null;
  onToggle: (visible: boolean) => void;
  onPick: () => void;
  onRemovePhoto: () => void;
}> = ({ product, item, pendingUrl, onToggle, onPick, onRemovePhoto }) => {
  const [failed, setFailed] = useState(false);
  const src = pendingUrl ?? (failed ? null : publicImageUrl(item.photoPath));
  const unit = priceUnit(product);
  return (
    <li className={`rounded-3xl p-3 ${item.visible ? 'bg-field' : 'bg-field/60'}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-field-strong">
          {src ? (
            <img src={src} alt="" width={56} height={56} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true" className="text-2xl font-black text-ink/30">
              {product.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-base font-bold leading-snug">{product.name}</p>
          {product.variant && <p className="break-words text-sm text-muted">{product.variant}</p>}
          <p className="text-base font-semibold">
            {formatPrice(product.price)}
            {unit && <span className="ml-1 text-sm">{unit}</span>}
            {!product.available && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-sm font-bold text-white">Rupture</span>}
          </p>
        </div>
        <Switch checked={item.visible} onChange={onToggle} label={`${item.visible ? 'Masquer' : 'Afficher'} « ${product.name} » dans la boutique`} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 pl-[68px]">
        <button
          type="button"
          onClick={onPick}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-base font-semibold hover:bg-field-strong focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ink"
        >
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
          {src ? 'Changer la photo' : 'Ajouter une photo'}
          <span className="sr-only"> de {product.name}</span>
        </button>
        {(item.photoPath || pendingUrl) && (
          <button
            type="button"
            onClick={onRemovePhoto}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-base font-semibold underline decoration-2 underline-offset-4 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ink"
          >
            Retirer la photo<span className="sr-only"> de {product.name}</span>
          </button>
        )}
      </div>
    </li>
  );
};

const PreviewPane: React.FC<{
  form: Form;
  logoSrc: string | null;
  products: EditorProduct[];
  photoFor: (id: number) => string | null;
}> = ({ form, logoSrc, products, photoFor }) => (
  <div className="mt-6 overflow-hidden rounded-[1.5rem] border-2 border-field-strong" aria-label="Aperçu de la boutique">
    <div className="bg-brand-yellow p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="h-full w-full object-contain" />
          ) : (
            <span aria-hidden="true" className="text-3xl font-black">
              {(form.title || '?').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="break-words text-2xl font-black leading-tight">{form.title.trim() || 'Nom de la boutique'}</p>
          {form.address.trim() && <p className="mt-1 break-words text-base font-semibold">{form.address.trim()}</p>}
        </div>
      </div>
      {form.description.trim() && <p className="mt-3 whitespace-pre-line break-words text-base">{form.description.trim()}</p>}
    </div>
    <div className="bg-white p-4">
      {products.length === 0 ? (
        <p className="text-lg">Aucun produit affiché pour le moment.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.slice(0, 12).map((p) => {
            const src = photoFor(p.localId);
            const unit = priceUnit(p);
            return (
              <li key={p.localId} className="overflow-hidden rounded-2xl bg-field">
                <div className="flex aspect-square w-full items-center justify-center bg-field-strong">
                  {src ? (
                    <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="text-4xl font-black text-ink/30">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="break-words text-sm font-bold leading-snug">{p.name}</p>
                  {p.variant && <p className="break-words text-xs text-muted">{p.variant}</p>}
                  <p className="mt-1 text-base font-black">
                    {formatPrice(p.price)}
                    {unit && <span className="ml-1 text-xs font-semibold">{unit}</span>}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {products.length > 12 && <p className="mt-3 text-base">… et {products.length - 12} autre{products.length - 12 > 1 ? 's' : ''} produit{products.length - 12 > 1 ? 's' : ''}.</p>}
    </div>
  </div>
);

const EditorSkeleton: React.FC = () => (
  <div className="bg-field pb-24" aria-busy="true" aria-label="Chargement de votre boutique en ligne">
    <div className="bg-white">
      <Container className="pb-8 pt-10 sm:pt-14">
        <div className="h-6 w-32 animate-pulse rounded-full bg-field" />
        <div className="mt-5 h-12 w-3/4 animate-pulse rounded-full bg-field" />
      </Container>
    </div>
    <Container className="space-y-4 pt-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-[2rem] bg-white p-6 sm:p-8">
          <div className="h-8 w-40 animate-pulse rounded-full bg-field" />
          <div className="mt-6 h-14 w-full animate-pulse rounded-2xl bg-field" />
          <div className="mt-3 h-14 w-full animate-pulse rounded-2xl bg-field" />
        </div>
      ))}
    </Container>
  </div>
);
