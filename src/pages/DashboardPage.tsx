import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { PageRoute, MySubscriptionData } from '../types';
import { 
  LogOut, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  ShoppingBag, 
  LayoutDashboard, 
  Calendar, 
  Phone, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Store, 
  Receipt, 
  Clock, 
  Sparkles,
  Smartphone,
  CreditCard,
  MapPin,
  Tag,
  KeyRound,
  CheckCircle2,
  Users,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPageProps {
  onNavigate: (route: PageRoute) => void;
}

interface ProductItem {
  id: number;
  store_code: string;
  local_id: number;
  nom: string;
  code_barres: string | null;
  prix_achat: number;
  prix_vente: number;
  stock_actuel: number;
  seuil_alerte: number;
  vendu_par_poids: boolean;
}

interface SaleItem {
  id: string;
  store_id: string | null;
  store_code: string;
  employee_id: string | null;
  amount: number;
  created_at: string;
}

interface StoreData {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
  business_type?: string | null;
  location?: string | null;
}

interface ProfileData {
  id: string;
  role: 'GERANT' | 'EMPLOYE' | string;
  store_id: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
}

/**
 * Traduction française des types d'activité boutique
 */
function formatBusinessTypeFrench(type?: string | null): string {
  if (!type) return 'Non renseigné';
  const clean = type.toLowerCase().trim();
  switch (clean) {
    case 'mode':
    case 'clothing':
    case 'fashion':
      return 'Mode';
    case 'restaurant':
    case 'resto':
    case 'food_service':
    case 'traiteur':
    case 'catering':
      return 'Restaurant et traiteur';
    case 'alimentation':
    case 'food':
    case 'grocery':
      return 'Alimentation';
    case 'boutique':
    case 'epicerie':
    case 'épicerie':
    case 'boutique_epicerie':
    case 'retail':
      return 'Boutique et épicerie';
    case 'services':
    case 'service':
      return 'Services';
    case 'autre':
    case 'other':
    case 'autre_commerce':
      return 'Autre commerce';
    default:
      // Si la chaîne est déjà un libellé compréhensible, la capitaliser
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

/**
 * Formatage de date en français
 */
function formatDateFr(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr || '';
  }
}

/**
 * Calcul du nombre de jours calendaires restants jusqu'à une date serveur
 */
function calculateDaysRemaining(targetDateStr?: string | null): number {
  if (!targetDateStr) return 0;
  try {
    const target = new Date(targetDateStr).getTime();
    if (isNaN(target)) return 0;
    const now = Date.now();
    const diffMs = target - now;
    if (diffMs <= 0) return 0;
    // Arrondi supérieur en jours calendaires
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, loading: authLoading, signOut } = useAuth();

  // Profile
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Subscription (via RPC get_my_subscription)
  const [subscription, setSubscription] = useState<MySubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Store
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Stats (Products & Sales)
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!authLoading && !user) {
      onNavigate('/login');
    }
  }, [user, authLoading, onNavigate]);

  // 1. Fetch Subscription via RPC get_my_subscription
  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    setSubscriptionLoading(true);
    setSubscriptionError(null);

    try {
      const { data, error } = await supabase.rpc('get_my_subscription');
      if (error) {
        console.warn('Erreur RPC get_my_subscription:', error);
        setSubscriptionError(error.message || 'Impossible de charger l\'état de l\'abonnement.');
      } else {
        setSubscription(data as MySubscriptionData);
      }
    } catch (err: any) {
      console.warn('Exception get_my_subscription:', err);
      setSubscriptionError(err?.message || 'Erreur réseau lors de la récupération de l\'abonnement.');
    } finally {
      setSubscriptionLoading(false);
    }
  }, [user]);

  // 2. Fetch User Profile (public.profiles where id = user.id)
  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    setProfileError(null);

    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('id, role, store_id, first_name, last_name, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erreur Supabase lors du chargement du profil:', error);
        setProfileError(`Erreur base de données (${error.code || status}): ${error.message}`);
        setProfileData(null);
      } else if (!data) {
        console.warn('Aucun enregistrement profil trouvé pour user.id =', user.id);
        setProfileError('Aucun profil associé à cet utilisateur dans Supabase. Veuillez vous assurer d\'avoir créé votre boutique sur l\'application Android QASH.');
        setProfileData(null);
      } else {
        setProfileData(data as ProfileData);
      }
    } catch (err: any) {
      console.error('Erreur inattendue profil:', err);
      setProfileError('Impossible de charger les informations de profil.');
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  // Initial load when user is present
  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchUserProfile();
    }
  }, [user, fetchSubscription, fetchUserProfile]);

  // 3. Fetch Store and Store Stats once Profile is loaded
  const fetchStoreAndStats = useCallback(async () => {
    if (!profileData?.store_id) return;

    setStoreLoading(true);
    setStoreError(null);

    try {
      // a) Get store from public.stores where id = profileData.store_id
      const { data: storeRow, error: storeErr } = await supabase
        .from('stores')
        .select('id, name, owner_id, invite_code, business_type, location')
        .eq('id', profileData.store_id)
        .single();

      if (storeErr || !storeRow) {
        console.error('Erreur chargement boutique:', storeErr);
        setStoreError('Boutique introuvable pour ce compte.');
        setStoreLoading(false);
        return;
      }

      setStoreData(storeRow as StoreData);
      setStoreLoading(false);

      // Pour les gérants, charger également le catalogue et les ventes
      if (profileData.role === 'GERANT') {
        setStatsLoading(true);
        setStatsError(null);
        const storeCode = storeRow.invite_code;

        // b) Fetch Products
        const { data: productsData, error: productsErr } = await supabase
          .from('products')
          .select('*')
          .eq('store_code', storeCode);

        if (productsErr) {
          console.error('Erreur chargement produits:', productsErr);
        } else {
          setProducts(productsData || []);
        }

        // c) Fetch Sales
        const { data: salesData, error: salesErr } = await supabase
          .from('sales')
          .select('*')
          .eq('store_code', storeCode)
          .order('created_at', { ascending: false });

        if (salesErr) {
          console.error('Erreur chargement ventes:', salesErr);
        } else {
          setSales(salesData || []);
        }
      }
    } catch (err: any) {
      console.error('Erreur chargement données boutique:', err);
      setStoreError('Erreur lors du chargement des données de la boutique.');
      setStatsError('Erreur lors du chargement des statistiques.');
    } finally {
      setStoreLoading(false);
      setStatsLoading(false);
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData?.store_id) {
      fetchStoreAndStats();
    }
  }, [profileData, fetchStoreAndStats]);

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/login');
  };

  const handleRefreshAll = () => {
    if (user) {
      fetchSubscription();
      fetchUserProfile();
      if (profileData?.store_id) {
        fetchStoreAndStats();
      }
    }
  };

  // Profile details (priorité aux colonnes profiles puis metadata)
  const metadata = user?.user_metadata || {};
  const firstName = profileData?.first_name || metadata.first_name || '';
  const lastName = profileData?.last_name || metadata.last_name || '';
  const phone = profileData?.phone || metadata.phone || '';
  const userRole = profileData?.role || subscription?.role || 'GERANT';
  const isEmployee = userRole === 'EMPLOYE' || userRole === 'employee';

  const displayedFullName = (firstName || lastName) 
    ? `${firstName} ${lastName}`.trim() 
    : (metadata.full_name || user?.email?.split('@')[0] || 'Commerçant');

  // Stats calculations
  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0), [sales]);
  const salesCount = sales.length;
  const totalProducts = products.length;
  const lowStockProducts = useMemo(() => 
    products
      .filter((p) => Number(p.stock_actuel) <= Number(p.seuil_alerte))
      .sort((a, b) => Number(a.stock_actuel) - Number(b.stock_actuel)),
    [products]
  );

  // Global initial loading state with skeleton
  const isInitialLoading = authLoading || (user && profileLoading && subscriptionLoading);

  if (!user && !authLoading) {
    return null;
  }

  // Helper pour formater la pastille et libellé d'abonnement
  const renderSubscriptionBadge = () => {
    const status = subscription?.status || (profileData?.store_id ? 'no_subscription' : 'no_store');
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Actif
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Essai gratuit
          </span>
        );
      case 'grace':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Période de grâce
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Expiré
          </span>
        );
      case 'no_store':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
            <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
            Pas de boutique
          </span>
        );
      case 'no_subscription':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
            <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
            Aucun abonnement
          </span>
        );
    }
  };

  // Date de fin et calcul des jours restants
  const endDate = subscription?.current_period_end || subscription?.access_until || subscription?.trial_ends_at;
  const daysRemaining = calculateDaysRemaining(endDate);
  const employeeCount = subscription?.employee_count ?? 0;

  return (
    <div className="min-h-[85vh] bg-neutral-50/70 py-8 sm:py-12 px-4 sm:px-6 lg:px-8" id="dashboard-page">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* En-tête général Mon Espace */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-700 border border-neutral-200/80 rounded-full text-xs font-semibold mb-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-neutral-600" />
              <span>Mon espace QASH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Bonjour, {displayedFullName}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              Bienvenue sur votre espace web de supervision et de gestion de votre compte QASH.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleRefreshAll}
              disabled={profileLoading || subscriptionLoading || storeLoading || statsLoading}
              className="min-h-[48px] px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <RefreshCw className={`w-4 h-4 ${(profileLoading || subscriptionLoading || storeLoading || statsLoading) ? 'animate-spin text-rose-500' : ''}`} />
              <span>Actualiser</span>
            </button>
            <button
              onClick={handleSignOut}
              className="min-h-[48px] px-4 py-2.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border border-neutral-200/50 active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>

        {/* SECTION 1 — ABONNEMENT EN HAUT (LISIBLE) */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6" id="dashboard-subscription-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-neutral-900">Abonnement QASH</h2>
                  {!subscriptionLoading && renderSubscriptionBadge()}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Statut de synchronisation et licence d&apos;utilisation
                </p>
              </div>
            </div>

            {/* Bouton d'action selon le rôle */}
            {subscriptionLoading ? (
              <div className="h-12 w-36 bg-neutral-100 rounded-xl animate-pulse"></div>
            ) : isEmployee ? (
              <div className="self-start sm:self-center shrink-0 px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs sm:text-sm font-medium">
                L&apos;abonnement est géré par votre gérant
              </div>
            ) : (
              <button
                onClick={() => onNavigate('/pricing')}
                className="self-start sm:self-center shrink-0 min-h-[48px] px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <CreditCard className="w-4 h-4" />
                <span>Renouveler / Payer</span>
              </button>
            )}
          </div>

          {/* Corps de la section Abonnement */}
          {subscriptionLoading ? (
            /* Skeleton de chargement */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
              <div className="h-20 bg-neutral-100 rounded-xl"></div>
              <div className="h-20 bg-neutral-100 rounded-xl"></div>
              <div className="h-20 bg-neutral-100 rounded-xl"></div>
            </div>
          ) : subscriptionError ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Information d&apos;abonnement non disponible</p>
                <p className="text-xs text-amber-800 mt-0.5">{subscriptionError}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Cartes d'indicateurs d'abonnement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Carte Date de fin */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs font-semibold mb-1">
                    <Calendar className="w-4 h-4 text-neutral-600" />
                    <span>Échéance calendaire</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-neutral-900">
                    {endDate ? formatDateFr(endDate) : 'Aucune date'}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {subscription?.status === 'active' 
                      ? `Actif jusqu'au ${formatDateFr(endDate)}`
                      : subscription?.status === 'trial'
                      ? `Période d'essai jusqu'au ${formatDateFr(endDate)}`
                      : subscription?.status === 'grace'
                      ? `Période de grâce jusqu'au ${formatDateFr(endDate)}`
                      : 'Non abonné'}
                  </div>
                </div>

                {/* Carte Jours restants */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs font-semibold mb-1">
                    <Clock className="w-4 h-4 text-neutral-600" />
                    <span>Jours restants</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-neutral-900">
                    {endDate ? (
                      daysRemaining > 0 ? (
                        <span className="text-emerald-700">{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-rose-600">0 jour (expiré)</span>
                      )
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Calculé d&apos;après les dates du serveur
                  </div>
                </div>

                {/* Carte Nombre d'employés */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs font-semibold mb-1">
                    <Users className="w-4 h-4 text-neutral-600" />
                    <span>Équipe associée</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold text-neutral-900">
                    {employeeCount} employé{employeeCount > 1 ? 's' : ''}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Rattaché{employeeCount > 1 ? 's' : ''} à la boutique
                  </div>
                </div>

              </div>

              {/* RÈGLE MÉTIER CALENDAIRE EXPLICITE */}
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
                <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-rose-950 leading-relaxed">
                  Chaque paiement prolonge votre abonnement de <strong>30 jours (1 mois)</strong> ou <strong>365 jours (12 mois)</strong> à partir de la date de fin. L&apos;abonnement est une période calendaire fixée par le serveur : les jours s&apos;écoulent en continu même si l&apos;application n&apos;est pas utilisée.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* GRILLE : BLOC « MA BOUTIQUE » ET BLOC « MON PROFIL » */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* BLOC 2 — MA BOUTIQUE */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6" id="dashboard-store-block">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Ma boutique</h2>
                    <p className="text-xs text-neutral-500">Informations enregistrées (lecture seule)</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                  Stores
                </span>
              </div>

              {storeLoading ? (
                /* Skeleton */
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 bg-neutral-100 rounded-lg"></div>
                  <div className="h-10 bg-neutral-100 rounded-lg"></div>
                  <div className="h-10 bg-neutral-100 rounded-lg"></div>
                </div>
              ) : storeError ? (
                <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-600 text-xs">
                  {storeError}
                </div>
              ) : storeData ? (
                <div className="space-y-3.5 text-xs sm:text-sm">
                  {/* Nom */}
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                    <span className="text-neutral-500 font-medium">Nom de la boutique</span>
                    <span className="font-bold text-neutral-900 text-right">{storeData.name || 'Non renseigné'}</span>
                  </div>

                  {/* Type d'activité */}
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                    <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Activité</span>
                    </span>
                    <span className="font-bold text-neutral-900 text-right">
                      {formatBusinessTypeFrench(storeData.business_type)}
                    </span>
                  </div>

                  {/* Lieu */}
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                    <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Lieu</span>
                    </span>
                    <span className="font-bold text-neutral-900 text-right">
                      {storeData.location || 'Non renseigné'}
                    </span>
                  </div>

                  {/* Code d'invitation */}
                  <div className="flex items-start justify-between py-2 gap-4">
                    <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Code d&apos;invitation</span>
                    </span>
                    <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-right">
                      {storeData.invite_code || '—'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-neutral-50 rounded-xl text-xs text-neutral-500 text-center">
                  Aucune information de boutique enregistrée pour ce compte.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
              Pour modifier le nom ou l&apos;adresse de votre boutique, rendez-vous dans les paramètres de l&apos;application mobile Android QASH.
            </div>
          </div>

          {/* BLOC 3 — MON PROFIL */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6" id="dashboard-profile-block">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Mon profil</h2>
                    <p className="text-xs text-neutral-500">Coordonnées du compte (lecture seule)</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                  Profiles
                </span>
              </div>

              {profileLoading ? (
                /* Skeleton */
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 bg-neutral-100 rounded-lg"></div>
                  <div className="h-10 bg-neutral-100 rounded-lg"></div>
                  <div className="h-10 bg-neutral-100 rounded-lg"></div>
                </div>
              ) : profileError ? (
                <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-600 text-xs">
                  {profileError}
                </div>
              ) : (
                <div className="space-y-3.5 text-xs sm:text-sm">
                  {/* Prénom */}
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                    <span className="text-neutral-500 font-medium">Prénom</span>
                    <span className="font-bold text-neutral-900 text-right">
                      {firstName || 'Non renseigné'}
                    </span>
                  </div>

                  {/* Nom */}
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                    <span className="text-neutral-500 font-medium">Nom</span>
                    <span className="font-bold text-neutral-900 text-right">
                      {lastName || 'Non renseigné'}
                    </span>
                  </div>

                  {/* Téléphone */}
                  <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                    <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Téléphone</span>
                    </span>
                    <span className="font-bold text-neutral-900 text-right">
                      {phone || 'Non renseigné'}
                    </span>
                  </div>

                  {/* Email & Rôle */}
                  <div className="flex items-start justify-between py-2 gap-4">
                    <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Email de connexion</span>
                    </span>
                    <span className="font-semibold text-neutral-800 text-right break-all">
                      {user.email || '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
              Rôle actuel : <strong className="text-neutral-700">{userRole}</strong>. Consultation sécurisée sans modification directe sur le web.
            </div>
          </div>

        </div>

        {/* LOGIQUE DES STATISTIQUES EXISTANTES (INCHANGÉE POUR LES GÉRANTS) */}
        {profileData && profileData.role === 'GERANT' && (
          <div className="space-y-8 pt-4" id="dashboard-stats-section">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Activité de la boutique</h3>
                <p className="text-xs text-neutral-500">Statistiques des ventes et des stocks synchronisés</p>
              </div>
            </div>

            {/* 4 Cartes KPI existantes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Revenue */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Chiffre d&apos;Affaires</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {statsLoading ? (
                      <span className="text-neutral-300 text-lg">Chargement...</span>
                    ) : (
                      `${totalRevenue.toLocaleString('fr-FR')} FCFA`
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  Total des encaissements
                </div>
              </div>

              {/* Card 2: Sales Count */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ventes enregistrées</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {statsLoading ? (
                      <span className="text-neutral-300 text-lg">Chargement...</span>
                    ) : (
                      `${salesCount} transactions`
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  Nombre total de reçus
                </div>
              </div>

              {/* Card 3: Products */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Catalogue Produits</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {statsLoading ? (
                      <span className="text-neutral-300 text-lg">Chargement...</span>
                    ) : (
                      `${totalProducts} articles`
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  Produits référencés
                </div>
              </div>

              {/* Card 4: Low Stock Alert */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Stock Faible</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {statsLoading ? (
                      <span className="text-neutral-300 text-lg">Chargement...</span>
                    ) : (
                      `${lowStockProducts.length} alertes`
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                  {lowStockProducts.length > 0 ? (
                    <span className="text-amber-700 font-semibold">Réapprovisionnement nécessaire</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">Stock optimal ✓</span>
                  )}
                </div>
              </div>

            </div>

            {/* Détails : Stock faible et dernières ventes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Alertes stock */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                    <h4 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Produits en Stock Faible
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {lowStockProducts.length} alerte{lowStockProducts.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {statsLoading ? (
                    <div className="py-8 text-center text-xs text-neutral-400">Analyse du stock...</div>
                  ) : lowStockProducts.length === 0 ? (
                    <div className="py-10 text-center text-neutral-400 text-xs font-medium space-y-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        ✓
                      </div>
                      <p>Tous les produits ont un niveau de stock suffisant.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {lowStockProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/60 text-xs">
                          <div>
                            <p className="font-bold text-neutral-900">{p.nom}</p>
                            <p className="text-[10px] text-neutral-500">Prix : {Number(p.prix_vente).toLocaleString('fr-FR')} FCFA</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">
                              {p.stock_actuel} restant{Number(p.stock_actuel) > 1 ? 's' : ''}
                            </span>
                            <p className="text-[10px] text-neutral-400 mt-0.5">Seuil : {p.seuil_alerte}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                  Calculé à partir des seuils d&apos;alerte configurés sur l&apos;application mobile.
                </div>
              </div>

              {/* Dernières ventes */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                    <h4 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-500" />
                      Dernières Ventes Enregistrées
                    </h4>
                    <span className="text-xs font-medium text-neutral-500">
                      {sales.length} total
                    </span>
                  </div>

                  {statsLoading ? (
                    <div className="py-8 text-center text-xs text-neutral-400">Chargement des transactions...</div>
                  ) : sales.length === 0 ? (
                    <div className="py-10 text-center text-neutral-400 text-xs font-medium space-y-2">
                      <p>Aucune vente enregistrée pour cette boutique.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {sales.slice(0, 8).map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/60 text-xs">
                          <div>
                            <p className="font-mono text-[10px] text-neutral-400 uppercase">
                              N° {String(s.id).substring(0, 8)}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              {new Date(s.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-600 text-sm">
                              +{Number(s.amount).toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                  Mises à jour en direct depuis l&apos;application Android et Supabase Realtime.
                </div>
              </div>

            </div>

            {/* Bannière d'information synchro */}
            <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Synchronisation QASH Android & Web
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                  Toutes les ventes réalisées par votre équipe depuis leurs téléphones Android apparaissent instantanément sur cette console. L&apos;authentification et la base de données sont 100% unifiées.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Base Live & Connectée
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
