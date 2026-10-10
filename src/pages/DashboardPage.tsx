import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { PageRoute, MySubscriptionData } from '../types';
import { 
  LogOut, 
  User as UserIcon, 
  Mail, 
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
  CreditCard,
  MapPin,
  Tag,
  KeyRound,
  CheckCircle2,
  Users,
  Info,
  Copy,
  Check,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Loader2,
  ChevronRight,
  AlertCircle
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

interface StoreEmployeeItem {
  id: string | number;
  store_code: string;
  employee_name: string;
  role: string;
  created_at?: string;
}

type TabId = 'overview' | 'activity' | 'subscription' | 'team' | 'store_profile';

interface TabDefinition {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const GERANT_TABS: TabDefinition[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard, description: 'Résumé & accès direct' },
  { id: 'activity', label: 'Activité', icon: TrendingUp, description: 'Chiffre, ventes & stock' },
  { id: 'subscription', label: 'Abonnement', icon: CreditCard, description: 'Statut & extension' },
  { id: 'team', label: 'Équipe', icon: Users, description: 'Collaborateurs & code' },
  { id: 'store_profile', label: 'Boutique et profil', icon: Store, description: 'Coordonnées du compte' },
];

const EMPLOYEE_TABS: TabDefinition[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard, description: 'Résumé & statut' },
  { id: 'activity', label: 'Activité', icon: TrendingUp, description: 'Chiffre, ventes & stock' },
];

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
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, loading: authLoading, signOut } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabId>('overview');

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

  // Team (from public.store_employees)
  const [employees, setEmployees] = useState<StoreEmployeeItem[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Stats (Products & Sales)
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Section "Étendre" (ajout de places employés)
  const [seatsToAdd, setSeatsToAdd] = useState<number>(1);
  const [extendQuote, setExtendQuote] = useState<any>(null);
  const [extendQuoteLoading, setExtendQuoteLoading] = useState(false);
  const [extendQuoteError, setExtendQuoteError] = useState<string | null>(null);
  const [extendCheckoutLoading, setExtendCheckoutLoading] = useState(false);
  const [extendCheckoutError, setExtendCheckoutError] = useState<string | null>(null);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!authLoading && !user) {
      onNavigate('/login');
    }
  }, [user, authLoading, onNavigate]);

  // Profile details (priorité aux colonnes profiles puis metadata)
  const metadata = user?.user_metadata || {};
  const firstName = profileData?.first_name || metadata.first_name || '';
  const lastName = profileData?.last_name || metadata.last_name || '';
  const phone = profileData?.phone || metadata.phone || '';
  const userRole = profileData?.role || subscription?.role || 'GERANT';
  const isEmployee = userRole.toUpperCase() === 'EMPLOYE' || userRole.toLowerCase() === 'employee';

  // Ensure an employee cannot stay on manager-only tabs
  useEffect(() => {
    if (isEmployee && (activeTab === 'subscription' || activeTab === 'team' || activeTab === 'store_profile')) {
      setActiveTab('overview');
    }
  }, [isEmployee, activeTab]);

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
        console.warn('Aucun profil trouvé pour user.id =', user.id);
        setProfileError('Aucun profil associé à cet utilisateur dans Supabase.');
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

  // 3. Fetch Store, Stats and Employees
  const fetchStoreAndStats = useCallback(async () => {
    if (!profileData?.store_id) return;

    setStoreLoading(true);
    setStoreError(null);

    try {
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

      const storeCode = storeRow.invite_code;

      // Pour les gérants, charger l'équipe depuis public.store_employees
      if (profileData.role === 'GERANT' && storeCode) {
        setEmployeesLoading(true);
        setEmployeesError(null);
        try {
          const { data: empData, error: empErr } = await supabase
            .from('store_employees')
            .select('id, store_code, employee_name, role, created_at')
            .eq('store_code', storeCode);

          if (empErr) {
            console.warn('Erreur chargement store_employees:', empErr);
            setEmployeesError(empErr.message);
          } else {
            setEmployees((empData as StoreEmployeeItem[]) || []);
          }
        } catch (err: any) {
          console.warn('Exception store_employees:', err);
          setEmployeesError(err?.message || 'Erreur lors du chargement de l\'équipe.');
        } finally {
          setEmployeesLoading(false);
        }
      }

      // Pour les gérants, charger également le catalogue et les ventes
      if (profileData.role === 'GERANT' && storeCode) {
        setStatsLoading(true);
        setStatsError(null);

        // Fetch Products
        const { data: productsData, error: productsErr } = await supabase
          .from('products')
          .select('*')
          .eq('store_code', storeCode);

        if (productsErr) {
          console.error('Erreur chargement produits:', productsErr);
        } else {
          setProducts(productsData || []);
        }

        // Fetch Sales
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

  // 4. Fetch quote from server for extending seats
  const fetchExtendQuote = useCallback(async (count: number) => {
    if (!user || count < 1) return;
    setExtendQuoteLoading(true);
    setExtendQuoteError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          quote: true,
          action: 'extend',
          plan: 'extend',
          seats: count,
          add_seats: count,
          extend_seats: count
        }
      });

      if (error) {
        console.warn('Erreur quote extension:', error);
        let errorBody: any = null;
        if ((error as any)?.context && typeof (error as any).context.json === 'function') {
          try {
            errorBody = await (error as any).context.json();
          } catch {}
        }
        setExtendQuoteError(errorBody?.message || error.message || 'Impossible d\'obtenir le calcul du montant.');
        setExtendQuote(null);
      } else {
        setExtendQuote(data);
      }
    } catch (err: any) {
      console.warn('Exception quote extension:', err);
      setExtendQuoteError(err?.message || 'Erreur réseau lors du calcul.');
      setExtendQuote(null);
    } finally {
      setExtendQuoteLoading(false);
    }
  }, [user]);

  // Request quote whenever active tab is subscription and seatsToAdd changes
  useEffect(() => {
    if (subscription?.status === 'active' && !isEmployee && activeTab === 'subscription') {
      fetchExtendQuote(seatsToAdd);
    }
  }, [subscription?.status, isEmployee, activeTab, seatsToAdd, fetchExtendQuote]);

  // Handle Checkout for Extend option
  const handleExtendCheckout = async () => {
    if (!user || isEmployee) return;
    if (subscription?.status !== 'active') return;

    setExtendCheckoutLoading(true);
    setExtendCheckoutError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          action: 'extend',
          plan: 'extend',
          seats: seatsToAdd,
          add_seats: seatsToAdd,
          extend_seats: seatsToAdd
        }
      });

      if (error) {
        console.error('Erreur create-checkout extend:', error);
        let errorBody: any = null;
        const status = (error as any)?.context?.status;
        if ((error as any)?.context && typeof (error as any).context.json === 'function') {
          try {
            errorBody = await (error as any).context.json();
          } catch {}
        }
        const errorCode = errorBody?.error || errorBody?.code || errorBody?.message || '';

        if (status === 403 || errorCode === 'only_owner_can_pay' || String(errorCode).includes('only_owner_can_pay')) {
          setExtendCheckoutError('Seul le gérant de la boutique peut étendre les places employés.');
        } else if (status === 401 || errorCode === 'unauthorized' || String(errorCode).includes('unauthorized')) {
          setExtendCheckoutError('Session expirée, reconnectez-vous.');
        } else if (status === 503 || errorCode === 'payment_not_configured' || String(errorCode).includes('payment_not_configured')) {
          setExtendCheckoutError('Le service de paiement est indisponible pour le moment.');
        } else if (status === 502 || errorCode === 'provider_error' || String(errorCode).includes('provider_error')) {
          setExtendCheckoutError('Le service de paiement est indisponible, réessayez.');
        } else {
          setExtendCheckoutError(errorBody?.message || error.message || 'Impossible d\'initialiser le paiement pour l\'extension.');
        }
        setExtendCheckoutLoading(false);
        return;
      }

      const targetUrl = data?.checkoutUrl ?? data?.checkout_url;
      if (targetUrl) {
        window.location.href = targetUrl;
      } else {
        setExtendCheckoutError('L\'adresse de paiement n\'a pas pu être générée.');
        setExtendCheckoutLoading(false);
      }
    } catch (err: any) {
      console.error('Exception create-checkout extend:', err);
      setExtendCheckoutError(err?.message || 'Erreur lors de la redirection vers le paiement.');
      setExtendCheckoutLoading(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!storeData?.invite_code) return;
    try {
      await navigator.clipboard.writeText(storeData.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (err) {
      console.warn('Erreur copie presse-papier:', err);
    }
  };

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

  // Dates et places
  const endDate = subscription?.current_period_end || subscription?.access_until || subscription?.trial_ends_at;
  const daysRemaining = calculateDaysRemaining(endDate);

  // Places employés : payées vs utilisées
  const paidSeatsCount = subscription?.paid_seats ?? 0;
  const usedSeatsCount = employees.length > 0 ? employees.length : (subscription?.employee_count ?? 0);

  const availableTabs = isEmployee ? EMPLOYEE_TABS : GERANT_TABS;

  // Clavier tablist
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % availableTabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + availableTabs.length) % availableTabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = availableTabs.length - 1;
    }
    if (nextIndex !== index) {
      setActiveTab(availableTabs[nextIndex].id);
      const nextBtn = document.getElementById(`tab-btn-${availableTabs[nextIndex].id}`);
      nextBtn?.focus();
    }
  };

  if (!user && !authLoading) {
    return null;
  }

  // Helper pour formater la pastille d'abonnement
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

  return (
    <div className="min-h-[85vh] bg-neutral-50/70 py-6 sm:py-10 px-4 sm:px-6 lg:px-8" id="dashboard-page">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* En-tête général Mon Espace */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-700 border border-neutral-200/80 rounded-full text-xs font-semibold mb-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-neutral-600" />
              <span>Mon espace QASH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Bonjour, {displayedFullName}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500">
              {isEmployee 
                ? 'Espace consultation employé lié à votre boutique QASH.' 
                : 'Console de supervision et de gestion de votre commerce QASH.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleRefreshAll}
              disabled={profileLoading || subscriptionLoading || storeLoading || statsLoading || employeesLoading}
              className="min-h-[48px] px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <RefreshCw className={`w-4 h-4 ${(profileLoading || subscriptionLoading || storeLoading || statsLoading || employeesLoading) ? 'animate-spin text-rose-500' : ''}`} />
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

        {/* NAVIGATION DES ONGLETS SUR MOBILE (DÉFILANTE HORIZONTALEMENT EN HAUT) */}
        <div className="lg:hidden">
          <div 
            role="tablist" 
            aria-label="Onglets de navigation mobile" 
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
          >
            {availableTabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-mobile-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-neutral-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DISPOSITION PRINCIPALE : CONTENU À GAUCHE, ONGLETS VERTICAUX À DROITE SUR ÉCRAN LARGE (≥ 1024 px) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ZONE PRINCIPALE : UN SEUL ONGLET AFFICHÉ À LA FOIS */}
          <div className="flex-1 w-full min-w-0">

            {/* ═══════════════════════════════════════════════
                ONGLET 1 — VUE D'ENSEMBLE
                ═══════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div 
                role="tabpanel" 
                id="tabpanel-overview" 
                aria-labelledby="tab-btn-overview" 
                className="space-y-6"
              >
                {/* 1. Carte Résumé Abonnement + Jours restants */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg font-bold text-neutral-900">Statut de l&apos;abonnement</h2>
                          {!subscriptionLoading && renderSubscriptionBadge()}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {isEmployee ? 'Abonnement géré par votre gérant' : 'Licence active et synchronisation cloud'}
                        </p>
                      </div>
                    </div>

                    {!isEmployee && (
                      <button
                        onClick={() => setActiveTab('subscription')}
                        className="self-start sm:self-center shrink-0 min-h-[48px] px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                      >
                        <span>Gérer l&apos;abonnement</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                      <div className="text-neutral-500 text-xs font-semibold flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Jours restants</span>
                      </div>
                      <div className="text-xl font-black text-neutral-900">
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
                        Calculé par le serveur
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                      <div className="text-neutral-500 text-xs font-semibold flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Échéance calendaire</span>
                      </div>
                      <div className="text-base sm:text-lg font-bold text-neutral-900">
                        {endDate ? formatDateFr(endDate) : 'Aucune date'}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Date de fin de période
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                      <div className="text-neutral-500 text-xs font-semibold flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Places employés</span>
                      </div>
                      <div className="text-base sm:text-lg font-bold text-neutral-900">
                        {usedSeatsCount} / {paidSeatsCount} place{paidSeatsCount > 1 ? 's' : ''}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Utilisées sur payées
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Trois Chiffres Clés */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    Chiffres clés de la boutique
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* CA */}
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Chiffre d&apos;Affaires</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-neutral-900 tracking-tight">
                        {statsLoading ? (
                          <span className="text-neutral-300 text-base">Chargement...</span>
                        ) : (
                          `${totalRevenue.toLocaleString('fr-FR')} FCFA`
                        )}
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                        Total des encaissements
                      </div>
                    </div>

                    {/* Ventes */}
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Ventes enregistrées</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Receipt className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-neutral-900 tracking-tight">
                        {statsLoading ? (
                          <span className="text-neutral-300 text-base">Chargement...</span>
                        ) : (
                          `${salesCount} reçus`
                        )}
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                        Transactions synchronisées
                      </div>
                    </div>

                    {/* Stock faible */}
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Stock Faible</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-neutral-900 tracking-tight">
                        {statsLoading ? (
                          <span className="text-neutral-300 text-base">Chargement...</span>
                        ) : (
                          `${lowStockProducts.length} alertes`
                        )}
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                        {lowStockProducts.length > 0 ? (
                          <span className="text-amber-700 font-semibold">À réapprovisionner</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Stock suffisant ✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Raccourcis vers les autres onglets */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    Raccourcis rapides
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="min-h-[48px] p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-sm">Consulter l&apos;activité</p>
                          <p className="text-xs text-neutral-500">Ventes en direct, catalogue & alertes</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                    </button>

                    {!isEmployee && (
                      <>
                        <button
                          onClick={() => setActiveTab('subscription')}
                          className="min-h-[48px] p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 text-sm">Gérer l&apos;abonnement</p>
                              <p className="text-xs text-neutral-500">Renouveler ou étendre les places employés</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                        </button>

                        <button
                          onClick={() => setActiveTab('team')}
                          className="min-h-[48px] p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Users className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 text-sm">Gérer l&apos;équipe</p>
                              <p className="text-xs text-neutral-500">Employés rattachés & code d&apos;invitation</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                        </button>

                        <button
                          onClick={() => setActiveTab('store_profile')}
                          className="min-h-[48px] p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Store className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 text-sm">Boutique et profil</p>
                              <p className="text-xs text-neutral-500">Coordonnées du compte en lecture seule</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════
                ONGLET 2 — ACTIVITÉ (LOGIQUE DES STATS CONSERVÉE)
                ═══════════════════════════════════════════════ */}
            {activeTab === 'activity' && (
              <div 
                role="tabpanel" 
                id="tabpanel-activity" 
                aria-labelledby="tab-btn-activity" 
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Activité de la boutique</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Statistiques des ventes et des stocks synchronisés depuis l&apos;application Android
                  </p>
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
                          <span className="text-neutral-300 text-base">Chargement...</span>
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
                          <span className="text-neutral-300 text-base">Chargement...</span>
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
                          <span className="text-neutral-300 text-base">Chargement...</span>
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
                          <span className="text-neutral-300 text-base">Chargement...</span>
                        ) : (
                          `${lowStockProducts.length} alertes`
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
                      {lowStockProducts.length > 0 ? (
                        <span className="text-amber-700 font-semibold">Réapprovisionnement requis</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Stock optimal ✓</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Détails : Stock faible et dernières ventes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Alertes stock */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Produits en Stock Faible</span>
                        </h3>
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
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-rose-500" />
                          <span>Dernières Ventes Enregistrées</span>
                        </h3>
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
                      Mises à jour en direct depuis l&apos;application Android et Supabase.
                    </div>
                  </div>
                </div>

                {/* Bannière d'information synchro */}
                <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Synchronisation QASH Android & Web</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                      Toutes les ventes réalisées par votre équipe depuis leurs téléphones Android apparaissent instantanément sur cette console. L&apos;authentification et la base de données sont unifiées.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Base Live & Connectée</span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════
                ONGLET 3 — ABONNEMENT (AVEC OPTION ÉTENDRE PARTIE 2)
                ═══════════════════════════════════════════════ */}
            {activeTab === 'subscription' && !isEmployee && (
              <div 
                role="tabpanel" 
                id="tabpanel-subscription" 
                aria-labelledby="tab-btn-subscription" 
                className="space-y-6"
              >
                {/* 1. Bloc Statut et Renouvellement */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                    <div className="flex items-center gap-3.5">
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

                    <button
                      onClick={() => onNavigate('/pricing')}
                      className="self-start sm:self-center shrink-0 min-h-[48px] px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Renouveler / Payer</span>
                    </button>
                  </div>

                  {subscriptionLoading ? (
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Carte Échéance */}
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

                        {/* Carte Places employés */}
                        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                          <div className="flex items-center gap-2 text-neutral-500 text-xs font-semibold mb-1">
                            <Users className="w-4 h-4 text-neutral-600" />
                            <span>Places employés</span>
                          </div>
                          <div className="text-base sm:text-lg font-bold text-neutral-900">
                            {usedSeatsCount} / {paidSeatsCount}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {paidSeatsCount} payée{paidSeatsCount > 1 ? 's' : ''} / {usedSeatsCount} utilisée{usedSeatsCount > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Règle métier calendaire explicite */}
                      <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
                        <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-rose-950 leading-relaxed">
                          Chaque paiement prolonge votre abonnement de <strong>30 jours (1 mois)</strong> ou <strong>365 jours (12 mois)</strong> à partir de la date de fin. L&apos;abonnement est une période calendaire fixée par le serveur : les jours s&apos;écoulent en continu même si l&apos;application n&apos;est pas utilisée.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. SECTION ÉTENDRE (AJOUT D'EMPLOYÉS - PARTIE 2) */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6" id="dashboard-extend-section">
                  <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>Extension de l&apos;équipe</span>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        Étendre votre abonnement (places employés)
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                        Ajoutez des places pour permettre à vos collaborateurs d&apos;encaisser depuis leur téléphone.
                      </p>
                    </div>
                  </div>

                  {/* CAS 1 : Boutique en essai gratuit (Bouton désactivé avec explication) */}
                  {subscription?.status === 'trial' ? (
                    <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-900">
                            Option Étendre non disponible en période d&apos;essai
                          </p>
                          <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                            L&apos;ajout d&apos;employés supplémentaires n&apos;est pas disponible pendant la période d&apos;essai gratuit. Vous devez d&apos;abord activer un abonnement payant pour pouvoir étendre les places de votre équipe.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                          disabled
                          className="min-h-[48px] px-5 py-3 rounded-xl bg-neutral-200 text-neutral-400 font-bold text-xs sm:text-sm cursor-not-allowed border border-neutral-300"
                        >
                          Étendre l&apos;équipe (Désactivé en essai)
                        </button>
                        <button
                          onClick={() => onNavigate('/pricing')}
                          className="min-h-[48px] px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
                        >
                          Souscrire un abonnement payant →
                        </button>
                      </div>
                    </div>
                  ) : subscription?.status !== 'active' ? (
                    /* CAS 2 : Abonnement non actif (expiré, grâce...) */
                    <div className="p-5 rounded-2xl bg-neutral-100 border border-neutral-200 space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-neutral-900">
                            Abonnement inactif
                          </p>
                          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                            Votre abonnement doit être actif pour étendre les places employés. Veuillez renouveler votre abonnement.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('/pricing')}
                        className="min-h-[48px] px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
                      >
                        Renouveler sur la page Tarifs →
                      </button>
                    </div>
                  ) : (
                    /* CAS 3 : Abonnement actif (Formulaire interactif avec prix serveur) */
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                        <div>
                          <p className="text-sm font-bold text-neutral-900">
                            Nombre de places employés à ajouter
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Places actuelles : {paidSeatsCount} payée{paidSeatsCount > 1 ? 's' : ''} ({usedSeatsCount} occupée{usedSeatsCount > 1 ? 's' : ''})
                          </p>
                        </div>

                        {/* Sélecteur de places avec boutons min-h-[48px] */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSeatsToAdd((prev) => Math.max(1, prev - 1))}
                            disabled={seatsToAdd <= 1 || extendCheckoutLoading}
                            className="w-12 h-12 min-h-[48px] rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg text-neutral-700 shadow-2xs cursor-pointer transition-all"
                            aria-label="Diminuer le nombre de places"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center text-lg font-black text-neutral-900">
                            +{seatsToAdd}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSeatsToAdd((prev) => prev + 1)}
                            disabled={extendCheckoutLoading}
                            className="w-12 h-12 min-h-[48px] rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg text-neutral-700 shadow-2xs cursor-pointer transition-all"
                            aria-label="Augmenter le nombre de places"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Devis calculé par le serveur */}
                      <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                            Montant calculé par le serveur
                          </span>
                          {extendQuoteLoading ? (
                            <span className="text-xs text-purple-600 flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Calcul en cours...</span>
                            </span>
                          ) : extendQuote?.amount ? (
                            <span className="text-base sm:text-lg font-black text-purple-950">
                              {Number(extendQuote.amount).toLocaleString('fr-FR')} FCFA
                            </span>
                          ) : extendQuote?.monthly ? (
                            <span className="text-base sm:text-lg font-black text-purple-950">
                              {Number(extendQuote.monthly).toLocaleString('fr-FR')} FCFA
                            </span>
                          ) : (
                            <span className="text-xs text-purple-700 font-medium">
                              Calcul automatique à la confirmation
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-purple-800">
                          Le montant est calculé par le serveur au prorata de la période restante de votre abonnement actif.
                        </p>
                      </div>

                      {/* Message d'erreur extension éventuel */}
                      {extendCheckoutError && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <p>{extendCheckoutError}</p>
                        </div>
                      )}

                      {/* Bouton de validation de l'extension (min-h-[48px]) */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleExtendCheckout}
                          disabled={extendCheckoutLoading || extendQuoteLoading}
                          className="min-h-[48px] w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-50"
                        >
                          {extendCheckoutLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Connexion au paiement sécurisé...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>
                                Valider et ajouter {seatsToAdd} place{seatsToAdd > 1 ? 's' : ''} employé{seatsToAdd > 1 ? 's' : ''}
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════
                ONGLET 4 — ÉQUIPE (STORE_EMPLOYEES + CODE D'INVITATION)
                ═══════════════════════════════════════════════ */}
            {activeTab === 'team' && !isEmployee && (
              <div 
                role="tabpanel" 
                id="tabpanel-team" 
                aria-labelledby="tab-btn-team" 
                className="space-y-6"
              >
                {/* 1. Carte Code d'invitation avec bouton Copier */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Rattachement des collaborateurs</span>
                      </div>
                      <h2 className="text-xl font-bold text-neutral-900">
                        Code d&apos;invitation boutique
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                        Vos employés saisissent ce code sur leur application Android QASH pour rejoindre votre boutique.
                      </p>
                    </div>

                    {/* Places utilisées X / Y */}
                    <div className="self-start sm:self-center shrink-0 px-4 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs sm:text-sm font-bold">
                      Places utilisées : <span className="text-rose-600">{usedSeatsCount}</span> / {paidSeatsCount}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 font-mono text-lg font-black text-neutral-900 tracking-wider">
                      {storeData?.invite_code || 'Aucun code disponible'}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyInviteCode}
                      disabled={!storeData?.invite_code}
                      className="min-h-[48px] px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Code copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copier le code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {usedSeatsCount >= paidSeatsCount && paidSeatsCount > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Toutes vos places employés payées sont occupées</p>
                        <p className="mt-0.5 text-xs text-amber-800">
                          Pour permettre à un nouveau collaborateur de se connecter, rendez-vous dans l&apos;onglet{' '}
                          <button 
                            onClick={() => setActiveTab('subscription')} 
                            className="font-bold underline cursor-pointer"
                          >
                            Abonnement
                          </button>{' '}
                          pour étendre le nombre de places.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Liste des employés rattachés (store_employees en lecture seule) */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        Collaborateurs rattachés
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Comptes enregistrés sur la table store_employees (lecture seule)
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                      {employees.length} collaborateur{employees.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {employeesLoading ? (
                    <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-500" />
                      <p>Chargement des membres de l&apos;équipe...</p>
                    </div>
                  ) : employeesError ? (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
                      {employeesError}
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs sm:text-sm space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-neutral-800">Aucun employé rattaché pour l&apos;instant</p>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        Donnez votre code d&apos;invitation ci-dessus à vos collaborateurs pour qu&apos;ils puissent se rattacher depuis l&apos;application Android QASH.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 border border-neutral-200/80 rounded-xl overflow-hidden">
                      {employees.map((emp) => (
                        <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                              {emp.employee_name ? emp.employee_name.charAt(0).toUpperCase() : 'E'}
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 text-sm">{emp.employee_name || 'Collaborateur'}</p>
                              <p className="text-xs text-neutral-500">
                                Ajouté le {formatDateFr(emp.created_at) || '—'}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 capitalize border border-neutral-200">
                            {emp.role || 'Employé'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                    Les accès et suppressions d&apos;employés sont gérés directement sur l&apos;application Android QASH du gérant.
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════
                ONGLET 5 — BOUTIQUE ET PROFIL (LECTURE SEULE)
                ═══════════════════════════════════════════════ */}
            {activeTab === 'store_profile' && !isEmployee && (
              <div 
                role="tabpanel" 
                id="tabpanel-store_profile" 
                aria-labelledby="tab-btn-store_profile" 
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* BLOC BOUTIQUE */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
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
                        <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                          <span className="text-neutral-500 font-medium">Nom de la boutique</span>
                          <span className="font-bold text-neutral-900 text-right">{storeData.name || 'Non renseigné'}</span>
                        </div>

                        <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                          <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Activité</span>
                          </span>
                          <span className="font-bold text-neutral-900 text-right">
                            {formatBusinessTypeFrench(storeData.business_type)}
                          </span>
                        </div>

                        <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                          <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Lieu</span>
                          </span>
                          <span className="font-bold text-neutral-900 text-right">
                            {storeData.location || 'Non renseigné'}
                          </span>
                        </div>

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

                {/* BLOC PROFIL */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
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
                        <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                          <span className="text-neutral-500 font-medium">Prénom</span>
                          <span className="font-bold text-neutral-900 text-right">
                            {firstName || 'Non renseigné'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                          <span className="text-neutral-500 font-medium">Nom</span>
                          <span className="font-bold text-neutral-900 text-right">
                            {lastName || 'Non renseigné'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                          <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Téléphone</span>
                          </span>
                          <span className="font-bold text-neutral-900 text-right">
                            {phone || 'Non renseigné'}
                          </span>
                        </div>

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
            )}

          </div>

          {/* ═══════════════════════════════════════════════
              LISTE D'ONGLETS VERTICALE À DROITE SUR ÉCRAN LARGE (≥ 1024 px)
              ═══════════════════════════════════════════════ */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
            <div 
              role="tablist" 
              aria-label="Navigation des sections Mon Espace"
              aria-orientation="vertical"
              className="bg-white border border-neutral-200/80 rounded-2xl p-3 shadow-xs space-y-1.5"
            >
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Menu de gestion
              </div>

              {availableTabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    className={`min-h-[48px] w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white hover:bg-neutral-50 text-neutral-700 border-transparent hover:border-neutral-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-neutral-800 text-rose-400' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold leading-none ${isActive ? 'text-white' : 'text-neutral-900'}`}>
                        {tab.label}
                      </p>
                      <p className={`text-[10px] mt-1 truncate ${isActive ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        {tab.description}
                      </p>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-4 bg-rose-500 rounded-full shrink-0"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
};
