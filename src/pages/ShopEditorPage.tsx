import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Copy, ExternalLink, ImagePlus, Search, Share2, Trash2 } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { Container } from '../components/ui/Layout';
import { Button, ButtonLink, buttonClasses } from '../components/ui/Button';
import { Field, Notice, Spinner, inputClass } from '../components/ui/AuthShell';
import { AppLink } from '../lib/navigation';
import { PageRoute } from '../types';
import { SITE_URL } from '../config/site';
import { fold, sanitizeWhatsapp } from '../shop/format';
import { Shop, ShopProduct } from '../shop/api';
import { ShopView } from '../shop/ShopView';
import { AccentName, isAccentName } from '../shop/accent';
import { NETWORKS, NETWORK_LABEL, Network, Social, parseSocialId } from '../shop/social';
import {
  CatalogItem,
  CatalogSettings,
  EditorProduct,
  EditorStore,
  ItemUpdate,
  ProfilePatch,
  loadItems,
  loadProducts,
  loadProfile,
  loadSettings,
  loadStore,
  loadSubscriptionStatus,
  publicCatalogVisible,
  publicImageUrl,
  removeImages,
  saveProfile,
  saveSettings,
  setItems as saveItems,
  slugAvailable,
  storagePath,
  uploadImage,
} from '../catalog/api';
import { catalogErrorMessage } from '../catalog/errors';
import { ImageError, PrepareOptions, PreparedImage, prepareImage } from '../catalog/image';
import { SLUG_MAX, SLUG_MIN, cleanSlugInput, finalizeSlug, isValidSlugFormat, slugFromName } from '../catalog/slug';
import { HoursForm, formToHours, hoursSetCount, hoursToForm, validateHoursForm } from '../catalog/hoursForm';
import { computeCompletion } from '../catalog/completion';
import { AccentPicker, CompletionCard, CounterField, HoursEditor, Panel, ProductRow, Switch } from '../catalog/EditorParts';

/**
 * Ma boutique en ligne (gérant) : réglages, présentation, horaires, réseaux, couleur, produits, publication.
 * Tout passe par la session du gérant (RLS et RPC catalog_*). Aucune décision de droit ici :
 * le rôle lu sert à l'affichage, le serveur refuse not_manager. Ni prix d'achat ni stock.
 * Ordre d'enregistrement : catalog_save_settings → catalog_save_profile → catalog_set_items.
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
  tagline: string;
  about: string;
  bannerPath: string | null;
  hours: HoursForm;
  instagram: string;
  facebook: string;
  tiktok: string;
  deliveryInfo: string;
  paymentInfo: string;
  accent: AccentName | null;
}

type Items = Record<number, CatalogItem>;
type Phase = 'loading' | 'error' | 'no_store' | 'not_manager' | 'ready';
type SlugState = 'idle' | 'checking' | 'free' | 'own' | 'taken' | 'invalid' | 'error';
type FileTarget = number | 'logo' | 'banner';

const HIDDEN: CatalogItem = { visible: false, photoPath: null, featured: false };
const PAGE_SIZE = 50;
const ALL = '__all__';
const OTHER = 'Autres';

/** Valeur comparable d'un champ réseau : l'identifiant extrait, ou le texte tel quel s'il n'est pas valide. */
const socialKey = (network: Network, raw: string): string => parseSocialId(network, raw) ?? raw.trim();

/** Le formulaire sous une forme comparable : deux formulaires identiques donnent le même texte. */
function snapshot(f: Form): string {
  return JSON.stringify([
    f.slug,
    f.title.trim(),
    f.description.trim(),
    f.whatsapp.trim(),
    f.address.trim(),
    f.logoPath,
    f.published,
    f.tagline.trim(),
    f.about.trim(),
    f.bannerPath,
    formToHours(f.hours),
    socialKey('instagram', f.instagram),
    socialKey('facebook', f.facebook),
    socialKey('tiktok', f.tiktok),
    f.deliveryInfo.trim(),
    f.paymentInfo.trim(),
    f.accent ?? 'rouge',
  ]);
}

const itemChanged = (a: CatalogItem, b: CatalogItem): boolean => a.visible !== b.visible || a.photoPath !== b.photoPath || a.featured !== b.featured;

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
  const [pendingBanner, setPendingBanner] = useState<PreparedImage | null>(null);
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
  const fileTarget = useRef<FileTarget | null>(null);

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
      setPendingBanner(null);
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
  previews.current = [pendingLogo?.previewUrl, pendingBanner?.previewUrl, ...(Object.values(pendingPhotos) as PreparedImage[]).map((p) => p.previewUrl)].filter(
    Boolean,
  ) as string[];
  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const getItem = useCallback((id: number): CatalogItem => items[id] ?? HIDDEN, [items]);

  const dirty = useMemo(() => {
    if (!form || !base) return false;
    if (base.isNew || snapshot(form) !== snapshot(base.form) || pendingLogo || pendingBanner || Object.keys(pendingPhotos).length > 0) return true;
    return products.some((p) => itemChanged(items[p.localId] ?? HIDDEN, base.items[p.localId] ?? HIDDEN));
  }, [form, base, items, products, pendingLogo, pendingBanner, pendingPhotos]);

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

  const patchItem = (ids: number[], patch: Partial<CatalogItem>) => {
    setSaveNotice(null);
    setItems((cur) => {
      const next = { ...cur };
      for (const id of ids) next[id] = { ...(next[id] ?? HIDDEN), ...patch };
      return next;
    });
  };

  // Choix d'un fichier (logo, bannière ou photo de produit) : contrôle puis compression dans le navigateur
  const pickFile = (target: FileTarget) => {
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
    const options: PrepareOptions = target === 'banner' ? { aspect: 3, maxSide: 1536 } : {};
    try {
      const prepared = await prepareImage(file, options);
      if (target === 'logo') {
        setPendingLogo((old) => {
          if (old) URL.revokeObjectURL(old.previewUrl);
          return prepared;
        });
      } else if (target === 'banner') {
        setPendingBanner((old) => {
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
    patchItem([id], { photoPath: null });
  };

  const removeLogo = () => {
    if (pendingLogo) URL.revokeObjectURL(pendingLogo.previewUrl);
    setPendingLogo(null);
    update({ logoPath: null });
  };

  const removeBanner = () => {
    if (pendingBanner) URL.revokeObjectURL(pendingBanner.previewUrl);
    setPendingBanner(null);
    update({ bannerPath: null });
  };

  // Réseaux : problèmes de saisie, champ par champ
  const socialProblem = (network: Network, raw: string): string | null =>
    raw.trim() !== '' && parseSocialId(network, raw) === null ? `Identifiant ${NETWORK_LABEL[network]} non valide : collez le @nom ou le lien de votre page.` : null;
  const hoursProblem = form ? validateHoursForm(form.hours) : null;

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
    const badSocial = NETWORKS.map((n) => socialProblem(n, form[n])).find(Boolean);
    if (badSocial) {
      setSaveError(badSocial);
      return;
    }
    if (hoursProblem) {
      setSaveError(hoursProblem);
      return;
    }

    setSaving(true);
    const work: Items = { ...items };
    const replaced: string[] = [];
    let logoPath = form.logoPath;
    let bannerPath = form.bannerPath;
    try {
      // 1. Logo et bannière : envoi dans {store_id}/…
      if (pendingLogo) {
        setSaveStep('Envoi du logo…');
        const path = storagePath(store.id, `logo-${Date.now()}.${pendingLogo.ext}`);
        await uploadImage(path, pendingLogo.blob, pendingLogo.mime);
        URL.revokeObjectURL(pendingLogo.previewUrl);
        logoPath = path;
        setPendingLogo(null);
        setForm((f) => (f ? { ...f, logoPath: path } : f));
      }
      if (pendingBanner) {
        setSaveStep('Envoi de la bannière…');
        const path = storagePath(store.id, `banner-${Date.now()}.${pendingBanner.ext}`);
        await uploadImage(path, pendingBanner.blob, pendingBanner.mime);
        URL.revokeObjectURL(pendingBanner.previewUrl);
        bannerPath = path;
        setPendingBanner(null);
        setForm((f) => (f ? { ...f, bannerPath: path } : f));
      }

      // 2. Réglages de base (catalog_save_settings) : crée la ligne boutique, toujours en premier
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

      // 3. Présentation (catalog_save_profile) : seulement les champs modifiés
      const patch = buildProfilePatch({ ...form, bannerPath }, base.form);
      if (Object.keys(patch).length > 0) {
        setSaveStep('Enregistrement de la présentation…');
        await saveProfile(patch);
      }

      // 4. Photos des produits : envoi, puis chemin conservé dans le brouillon
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

      // 5. Visibilité, photos et coups de cœur (catalog_set_items), seulement ce qui a changé
      setSaveStep('Enregistrement des produits…');
      const updates: ItemUpdate[] = [];
      for (const p of products) {
        const cur = work[p.localId] ?? HIDDEN;
        const old = base.items[p.localId] ?? HIDDEN;
        if (!itemChanged(cur, old)) continue;
        const photoChanged = cur.photoPath !== old.photoPath;
        updates.push({
          local_id: p.localId,
          visible: cur.visible,
          ...(photoChanged ? { photo_path: cur.photoPath } : {}),
          ...(cur.featured !== old.featured ? { featured: cur.featured } : {}),
        });
        if (photoChanged && old.photoPath) replaced.push(old.photoPath);
      }
      await saveItems(updates);
      if (base.form.logoPath && base.form.logoPath !== logoPath) replaced.push(base.form.logoPath);
      if (base.form.bannerPath && base.form.bannerPath !== bannerPath) replaced.push(base.form.bannerPath);

      // Les identifiants de réseaux sont remplacés par leur forme enregistrée (sans @ ni lien)
      const saved: Form = {
        ...form,
        slug: finalSlug,
        logoPath,
        bannerPath,
        instagram: socialKey('instagram', form.instagram),
        facebook: socialKey('facebook', form.facebook),
        tiktok: socialKey('tiktok', form.tiktok),
      };
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

  // Aperçu en direct : la même composante que la page publique, alimentée par le brouillon
  const draftShop = useMemo<Shop | null>(() => {
    if (!form || !store) return null;
    const social: Social = {};
    for (const n of NETWORKS) {
      const id = parseSocialId(n, form[n]);
      if (id) social[n] = id;
    }
    const visibleProducts: ShopProduct[] = products
      .filter((p) => (items[p.localId] ?? HIDDEN).visible)
      .map((p) => {
        const item = items[p.localId] ?? HIDDEN;
        return {
          id: String(p.localId),
          name: p.name,
          variant: p.variant,
          price: p.price,
          unit: p.unit,
          byWeight: p.byWeight,
          category: p.category,
          description: p.description,
          available: p.available,
          photo: item.photoPath,
          photoUrl: pendingPhotos[p.localId]?.previewUrl ?? publicImageUrl(item.photoPath),
          featured: item.featured,
          v: null,
        };
      });
    return {
      slug: form.slug || 'votre-boutique',
      title: form.title.trim() || store.name || 'Ma boutique',
      description: form.description.trim(),
      whatsapp: form.whatsapp,
      address: form.address.trim(),
      logo: form.logoPath,
      logoUrl: pendingLogo?.previewUrl ?? publicImageUrl(form.logoPath),
      businessType: '',
      tagline: form.tagline.trim(),
      about: form.about.trim(),
      banner: form.bannerPath,
      bannerUrl: pendingBanner?.previewUrl ?? publicImageUrl(form.bannerPath),
      hours: formToHours(form.hours),
      social,
      deliveryInfo: form.deliveryInfo.trim(),
      paymentInfo: form.paymentInfo.trim(),
      accent: form.accent,
      v: null,
      products: visibleProducts,
    };
  }, [form, store, products, items, pendingLogo, pendingBanner, pendingPhotos]);

  const completion = useMemo(() => {
    if (!form || !draftShop) return null;
    return computeCompletion({
      description: form.description,
      tagline: form.tagline,
      address: form.address,
      hasBanner: Boolean(form.bannerPath || pendingBanner),
      hoursDays: hoursSetCount(form.hours),
      socialCount: NETWORKS.filter((n) => parseSocialId(n, form[n])).length,
      deliveryInfo: form.deliveryInfo,
      visible: draftShop.products.map((p) => ({ hasPhoto: Boolean(p.photoUrl), category: p.category, featured: p.featured })),
    });
  }, [form, draftShop, pendingBanner]);

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
          <h1 className="text-title font-black">{phase === 'not_manager' ? 'Réservé au gérant de la boutique.' : 'Pas encore de boutique.'}</h1>
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

  if (!form || !base || !store || !draftShop || !completion) return <EditorSkeleton />;

  const publishedUrl = base.form.published && !base.isNew ? shopUrl(base.form.slug) : null;
  const waDigits = form.whatsapp.trim() ? sanitizeWhatsapp(form.whatsapp) : null;
  const waProblem = form.whatsapp.trim() !== '' && !waDigits;
  const waMaybeLocal = waDigits !== null && waDigits.length === 9;
  const logoSrc = pendingLogo?.previewUrl ?? publicImageUrl(form.logoPath);
  const bannerSrc = pendingBanner?.previewUrl ?? publicImageUrl(form.bannerPath);
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
          <p className={`mt-5 inline-flex rounded-full px-4 py-2 text-lg font-black ${base.form.published && !base.isNew ? 'bg-success-soft' : 'bg-field'}`}>
            {base.form.published && !base.isNew ? 'Publiée' : 'Non publiée'}
          </p>
        </Container>
      </div>

      <Container className="pt-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-6">
          <div className="min-w-0 space-y-4">
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
                <p className="mt-3 break-all rounded-2xl bg-field p-4 text-lg font-bold">{publishedUrl}</p>
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

            <CompletionCard completion={completion} />

            {/* Réglages */}
            <Panel>
              <h2 className="text-title font-black">Réglages</h2>
              <div className="mt-6 grid gap-6 xl:grid-cols-2">
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

                <div className="xl:col-span-2">
                  <label htmlFor="shop-description" className="block text-lg font-bold">
                    Description courte <span className="font-normal text-muted">(facultatif)</span>
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

                <div className="xl:col-span-2">
                  <p className="text-lg font-bold">
                    Logo <span className="font-normal text-muted">(facultatif)</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-field">
                      {logoSrc ? (
                        <img src={logoSrc} alt="Logo de la boutique" className="h-full w-full object-cover" />
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

            {/* Présentation */}
            <Panel id="presentation">
              <h2 className="text-title font-black">Présentation</h2>
              <div className="mt-6 space-y-6">
                <CounterField
                  id="shop-tagline"
                  label="Accroche"
                  value={form.tagline}
                  max={80}
                  onChange={(v) => update({ tagline: v })}
                  placeholder="Ex : Tout pour la maison, à deux pas de chez vous"
                  hint="Une phrase courte sous le nom de la boutique."
                />
                <CounterField
                  id="shop-about"
                  label="À propos"
                  value={form.about}
                  max={1000}
                  rows={5}
                  onChange={(v) => update({ about: v })}
                  hint="Racontez votre boutique. Les retours à la ligne sont conservés."
                />
                <div>
                  <p className="text-lg font-bold">
                    Bannière <span className="font-normal text-muted">(facultatif)</span>
                  </p>
                  <div className="mt-2 aspect-[3/1] w-full overflow-hidden rounded-3xl bg-field">
                    {bannerSrc ? (
                      <img src={bannerSrc} alt="Bannière de la boutique" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-4 text-center text-base text-muted">Sans bannière, la couleur de la boutique est utilisée.</div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="quiet" onClick={() => pickFile('banner')}>
                      <ImagePlus className="h-5 w-5" aria-hidden="true" />
                      {bannerSrc ? 'Changer la bannière' : 'Choisir une bannière'}
                    </Button>
                    {bannerSrc && (
                      <Button variant="quiet" onClick={removeBanner}>
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                        Retirer
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-base text-muted">L’image est recadrée au centre en 3:1 et réduite automatiquement (1 Mo au maximum).</p>
                </div>
                {imageError && <Notice kind="error">{imageError}</Notice>}
              </div>
            </Panel>

            {/* Horaires */}
            <Panel id="horaires">
              <h2 className="text-title font-black">Horaires</h2>
              <p className="mt-2 text-lg">Vos clients voient « Ouvert maintenant » ou l’heure de la prochaine ouverture.</p>
              <div className="mt-5">
                <HoursEditor value={form.hours} onChange={(hours) => update({ hours })} problem={hoursProblem} />
              </div>
            </Panel>

            {/* Contact et réseaux */}
            <Panel id="contact">
              <h2 className="text-title font-black">Contact et réseaux</h2>
              <div className="mt-6 grid gap-6 xl:grid-cols-2">
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
                  {waMaybeLocal && <p className="mt-2 text-base">Il manque peut-être l’indicatif du pays (221 pour le Sénégal).</p>}
                </div>

                <Field
                  id="shop-address"
                  label="Adresse de la boutique (facultatif)"
                  type="text"
                  maxLength={200}
                  value={form.address}
                  onChange={(e) => update({ address: e.target.value })}
                  autoComplete="street-address"
                  hint="Elle sert aussi au bouton « Itinéraire »."
                />

                {NETWORKS.map((n) => {
                  const problem = socialProblem(n, form[n]);
                  return (
                    <div key={n}>
                      <Field
                        id={`shop-${n}`}
                        label={`${NETWORK_LABEL[n]} (facultatif)`}
                        type="text"
                        maxLength={200}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder={n === 'facebook' ? 'nom-de-la-page' : '@votre_nom'}
                        value={form[n]}
                        aria-invalid={problem !== null}
                        onChange={(e) => update({ [n]: e.target.value } as Partial<Form>)}
                        onBlur={() => {
                          const id = parseSocialId(n, form[n]);
                          if (id !== null && id !== form[n]) update({ [n]: id } as Partial<Form>);
                        }}
                        hint="Collez le @nom ou le lien de votre page."
                      />
                      {problem && (
                        <p role="alert" className="mt-2 text-base font-bold text-brand-red-dark">
                          {problem}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Livraison et paiement */}
            <Panel id="livraison">
              <h2 className="text-title font-black">Livraison et paiement</h2>
              <div className="mt-6 space-y-6">
                <CounterField
                  id="shop-delivery"
                  label="Livraison"
                  value={form.deliveryInfo}
                  max={300}
                  rows={3}
                  onChange={(v) => update({ deliveryInfo: v })}
                  placeholder="Ex : Livraison à Dakar sous 24 h, 1 000 F selon la zone."
                />
                <CounterField
                  id="shop-payment"
                  label="Moyens de paiement acceptés"
                  value={form.paymentInfo}
                  max={200}
                  rows={2}
                  onChange={(v) => update({ paymentInfo: v })}
                  placeholder="Ex : Espèces, Wave, Orange Money."
                />
                <p className="rounded-2xl bg-warning-soft p-4 text-base">Information affichée seulement ; QASH ne prend aucun paiement en ligne.</p>
              </div>
            </Panel>

            {/* Couleur */}
            <Panel id="couleur">
              <h2 className="text-title font-black">Couleur de la boutique</h2>
              <p className="mt-2 text-lg">Elle colore les boutons, les badges et le haut de la page. Le texte reste toujours lisible.</p>
              <div className="mt-5">
                <AccentPicker value={form.accent} onChange={(accent) => update({ accent })} />
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
                    {form.published ? 'Les clients qui ont le lien voient les produits affichés.' : 'Tant que la boutique n’est pas publiée, personne ne la voit.'}
                  </p>
                </div>
                <Switch checked={form.published} onChange={(v) => update({ published: v })} labelledBy="publish-label" describedBy="publish-hint" />
              </div>
              {form.published && (!form.title.trim() || !waDigits) && (
                <p className="mt-4 text-base font-bold text-brand-red-dark">Pour publier, indiquez le nom de la boutique et un numéro WhatsApp valide.</p>
              )}
            </Panel>

            {/* Produits */}
            <Panel id="produits">
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
                  <p className="mt-2 text-base text-muted">
                    Seuls les produits « affichés » apparaissent dans votre boutique. Les prix viennent de l’application. Un coup de cœur est mis en avant en haut de la page.
                  </p>

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
                    <Button variant="quiet" disabled={filtered.length === 0 || allVisible} onClick={() => patchItem(filteredIds, { visible: true })}>
                      Tout afficher{filtered.length !== products.length ? ` (${filtered.length})` : ''}
                    </Button>
                    <Button
                      variant="quiet"
                      disabled={filtered.length === 0 || filtered.every((p) => !getItem(p.localId).visible)}
                      onClick={() => patchItem(filteredIds, { visible: false })}
                    >
                      Tout masquer{filtered.length !== products.length ? ` (${filtered.length})` : ''}
                    </Button>
                  </div>

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
                          onToggle={(v) => patchItem([p.localId], { visible: v })}
                          onFeature={(v) => patchItem([p.localId], { featured: v })}
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

            {/* Aperçu : bouton pour les petits écrans (sur grand écran, l'aperçu est toujours à droite) */}
            <div className="lg:hidden">
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
              </Panel>
            </div>
          </div>

          <aside aria-label="Aperçu en direct de la boutique" className={`${showPreview ? 'mt-4 block' : 'hidden'} lg:sticky lg:top-4 lg:mt-0 lg:block`}>
            <p className="mb-2 hidden text-lg font-black lg:block">Aperçu en direct</p>
            <div className="max-h-[80vh] overflow-y-auto overscroll-contain rounded-[2rem] border-4 border-ink bg-white lg:max-h-[calc(100dvh-6rem)]">
              <ShopView shop={draftShop} cart={{}} onChangeQty={() => undefined} cartCount={0} cartTotal={0} onOpenCart={() => undefined} preview />
            </div>
            <p className="mt-2 text-base text-muted">Aperçu : l’heure « ouvert / fermé » suit les horaires saisis (heure du Sénégal).</p>
          </aside>
        </div>
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

/** Les seuls champs de présentation à envoyer : ceux qui ont changé (une chaîne vide efface le champ). */
function buildProfilePatch(form: Form, base: Form): ProfilePatch {
  const patch: ProfilePatch = {};
  if (form.tagline.trim() !== base.tagline.trim()) patch.tagline = form.tagline.trim();
  if (form.about.trim() !== base.about.trim()) patch.about = form.about.trim();
  if (form.deliveryInfo.trim() !== base.deliveryInfo.trim()) patch.delivery_info = form.deliveryInfo.trim();
  if (form.paymentInfo.trim() !== base.paymentInfo.trim()) patch.payment_info = form.paymentInfo.trim();
  if (form.bannerPath !== base.bannerPath) patch.banner_path = form.bannerPath ?? '';
  if ((form.accent ?? 'rouge') !== (base.accent ?? 'rouge')) patch.accent = form.accent ?? 'rouge';
  for (const n of NETWORKS) {
    const next = parseSocialId(n, form[n]) ?? '';
    const prev = parseSocialId(n, base[n]) ?? '';
    if (next !== prev) patch[n] = next;
  }
  if (JSON.stringify(formToHours(form.hours)) !== JSON.stringify(formToHours(base.hours))) patch.hours = formToHours(form.hours);
  return patch;
}

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
      tagline: settings.tagline,
      about: settings.about,
      bannerPath: settings.bannerPath,
      hours: hoursToForm(settings.hours),
      instagram: settings.instagram,
      facebook: settings.facebook,
      tiktok: settings.tiktok,
      deliveryInfo: settings.deliveryInfo,
      paymentInfo: settings.paymentInfo,
      accent: isAccentName(settings.accent) ? settings.accent : null,
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
    tagline: '',
    about: '',
    bannerPath: null,
    hours: hoursToForm(null),
    instagram: '',
    facebook: '',
    tiktok: '',
    deliveryInfo: '',
    paymentInfo: '',
    accent: null,
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
        text: slug.endsWith('-') ? 'Pas de tiret à la fin.' : slug.length < SLUG_MIN ? `Trop courte : ${SLUG_MIN} caractères au minimum.` : 'Adresse non valide.',
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
