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
  TrendingDown,
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
  AlertCircle,
  Bell,
  Filter,
  BarChart3,
  Settings,
  ChevronDown,
  HelpCircle
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

type TabId = 'overview' | 'activity' | 'subscription' | 'team' | 'store_profile' | 'settings_help';

// Adresse de contact officielle (déjà utilisée dans les pages CGU, suppression de compte et paiement)
const CONTACT_EMAIL = 'contact@qashapp.com';

interface TabDefinition {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface PaymentItem {
  id: string | number;
  amount: number;
  seats?: number | null;
  period_days?: number | null;
  kind?: 'renewal' | 'extend' | string;
  status: string;
  created_at: string;
  completed_at?: string | null;
}

type PeriodFilter = 'today' | '7d' | '30d';

const TAB_PARAM_MAP: Record<string, TabId> = {
  'vue-ensemble': 'overview',
  'overview': 'overview',
  'activite': 'activity',
  'activity': 'activity',
  'abonnement': 'subscription',
  'subscription': 'subscription',
  'equipe': 'team',
  'team': 'team',
  'boutique-profil': 'store_profile',
  'boutique_profil': 'store_profile',
  'store_profile': 'store_profile',
  'parametres-aide': 'settings_help',
  'parametres_aide': 'settings_help',
  'settings_help': 'settings_help',
};

const TAB_TO_PARAM: Record<TabId, string> = {
  overview: 'vue-ensemble',
  activity: 'activite',
  subscription: 'abonnement',
  team: 'equipe',
  store_profile: 'boutique-profil',
  settings_help: 'parametres-aide',
};

const GERANT_TABS: TabDefinition[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard, description: 'Résumé & accès direct' },
  { id: 'activity', label: 'Activité', icon: TrendingUp, description: 'Chiffre, ventes & stock' },
  { id: 'subscription', label: 'Abonnement', icon: CreditCard, description: 'Statut & extension' },
  { id: 'team', label: 'Équipe', icon: Users, description: 'Collaborateurs & code' },
  { id: 'store_profile', label: 'Boutique et profil', icon: Store, description: 'Coordonnées du compte' },
  { id: 'settings_help', label: 'Paramètres et aide', icon: Settings, description: 'Compte, FAQ & contact' },
];

const EMPLOYEE_TABS: TabDefinition[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard, description: 'Résumé & statut' },
  { id: 'activity', label: 'Activité', icon: TrendingUp, description: 'Chiffre, ventes & stock' },
  { id: 'store_profile', label: 'Boutique et profil', icon: Store, description: 'Coordonnées du compte' },
  { id: 'settings_help', label: 'Paramètres et aide', icon: Settings, description: 'Compte, FAQ & contact' },
];

// Dernière vente affichée en fuseau Africa/Dakar
function formatDateTimeDakar(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('fr-FR', {
    timeZone: 'Africa/Dakar',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

  // Tab State initialisé depuis l'URL (?onglet=...)
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ongletParam = params.get('onglet');
      if (ongletParam && TAB_PARAM_MAP[ongletParam.toLowerCase()]) {
        return TAB_PARAM_MAP[ongletParam.toLowerCase()];
      }
    }
    return 'overview';
  });

  // Filtre d'analyse d'activité (Aujourd'hui / 7 derniers jours / 30 derniers jours)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('7d');
  const [hoveredPointKey, setHoveredPointKey] = useState<string | null>(null);

  // Filtre d'affichage des alertes de stock (Toutes / Ruptures / Faibles)
  const [stockAlertFilter, setStockAlertFilter] = useState<'all' | 'rupture' | 'faible'>('all');

  // Historique des règlements (payments) pour le gérant
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

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

  // Paramètres et aide : réinitialisation du mot de passe et FAQ
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Section "Étendre" (ajout de places employés)
  const [seatsToAdd, setSeatsToAdd] = useState<number>(1);
  const [extendQuote, setExtendQuote] = useState<any>(null);
  const [extendQuoteLoading, setExtendQuoteLoading] = useState(false);
  const [extendQuoteError, setExtendQuoteError] = useState<string | null>(null);
  const [extendCheckoutLoading, setExtendCheckoutLoading] = useState(false);
  const [extendCheckoutError, setExtendCheckoutError] = useState<string | null>(null);

  // Navigation avec mémorisation de l'onglet actif dans l'URL (?onglet=...)
  const handleSelectTab = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('onglet', TAB_TO_PARAM[tabId] || tabId);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  }, []);

  // Écoute de l'historique navigateur (flèches précédente / suivante)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const ongletParam = params.get('onglet');
      if (ongletParam && TAB_PARAM_MAP[ongletParam.toLowerCase()]) {
        setActiveTab(TAB_PARAM_MAP[ongletParam.toLowerCase()]);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // Ensure an employee cannot stay on manager-only tabs (Abonnement, Équipe)
  useEffect(() => {
    if (isEmployee && (activeTab === 'subscription' || activeTab === 'team')) {
      handleSelectTab('overview');
    }
  }, [isEmployee, activeTab, handleSelectTab]);

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
        // Chargement paginé (Supabase limite chaque requête à 1000 lignes) : jamais de troncature silencieuse
        const fetchAllRows = async (table: 'products' | 'sales') => {
          const PAGE = 1000;
          const MAX_PAGES = 50;
          const all: any[] = [];
          for (let page = 0; page < MAX_PAGES; page++) {
            let q = supabase.from(table).select('*').eq('store_code', storeCode);
            if (table === 'sales') q = q.order('created_at', { ascending: false }).order('id', { ascending: true });
            else q = q.order('id', { ascending: true });
            const { data, error } = await q.range(page * PAGE, page * PAGE + PAGE - 1);
            if (error) return { data: null as any[] | null, error };
            all.push(...(data || []));
            if (!data || data.length < PAGE) break;
          }
          return { data: all, error: null as any };
        };

        const { data: productsData, error: productsErr } = await fetchAllRows('products');

        if (productsErr) {
          console.error('Erreur chargement produits:', productsErr);
        } else {
          setProducts(productsData || []);
        }

        // Fetch Sales
        const { data: salesData, error: salesErr } = await fetchAllRows('sales');

        if (salesErr) {
          console.error('Erreur chargement ventes:', salesErr);
        } else {
          setSales(salesData || []);
        }

        // Fetch Payments (Historique des règlements pour le gérant propriétaire)
        setPaymentsLoading(true);
        setPaymentsError(null);
        try {
          const { data: paymentsData, error: paymentsErr } = await supabase
            .from('payments')
            .select('id, amount, seats, period_days, kind, status, created_at, completed_at')
            .order('created_at', { ascending: false });

          if (paymentsErr) {
            console.warn('Erreur chargement paiements:', paymentsErr);
            setPaymentsError(paymentsErr.message);
          } else {
            setPayments((paymentsData as PaymentItem[]) || []);
          }
        } catch (err: any) {
          console.warn('Exception chargement paiements:', err);
          setPaymentsError(err?.message || 'Erreur lors du chargement des règlements.');
        } finally {
          setPaymentsLoading(false);
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

  // 4. Devis de l'Edge Function create-checkout pour l'extension de places
  // Contrat réel : body: { quote: true }. Un seul appel suffit.
  // extend = { available, months_remaining, unit_price, max_seats, period_end }
  const fetchExtendQuote = useCallback(async () => {
    if (!user) return;
    setExtendQuoteLoading(true);
    setExtendQuoteError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { quote: true }
      });

      if (error) {
        console.warn('Erreur quote extension:', error);
        let errorBody: any = null;
        if ((error as any)?.context && typeof (error as any).context.json === 'function') {
          try {
            errorBody = await (error as any).context.json();
          } catch {}
        }
        const status = (error as any)?.context?.status;
        const errorCode = errorBody?.error || errorBody?.code || errorBody?.message || '';

        if (status === 409 || errorCode === 'extend_requires_active_period') {
          setExtendQuoteError("Votre période d'abonnement doit être active pour ajouter des places employés.");
        } else if (status === 403 || errorCode === 'only_owner_can_pay') {
          setExtendQuoteError("Seul le gérant de la boutique peut consulter le devis.");
        } else if (status === 401 || errorCode === 'unauthorized') {
          setExtendQuoteError('Session expirée, veuillez vous reconnecter.');
        } else if (status === 503) {
          setExtendQuoteError('Le service de paiement est indisponible pour le moment.');
        } else if (status === 502) {
          setExtendQuoteError('Le service de paiement est momentanément inaccessible, réessayez.');
        } else {
          setExtendQuoteError(errorBody?.message || error.message || "Impossible d'obtenir le devis d'extension.");
        }
        setExtendQuote(null);
      } else {
        setExtendQuote(data);
      }
    } catch (err: any) {
      console.warn('Exception quote extension:', err);
      setExtendQuoteError(err?.message || 'Erreur réseau lors du calcul du devis.');
      setExtendQuote(null);
    } finally {
      setExtendQuoteLoading(false);
    }
  }, [user]);

  // Récupérer le devis une seule fois lorsque l'onglet abonnement est affiché
  useEffect(() => {
    if (subscription?.status === 'active' && !isEmployee && activeTab === 'subscription') {
      fetchExtendQuote();
    }
  }, [subscription?.status, isEmployee, activeTab, fetchExtendQuote]);

  // Paiement extension selon le contrat serveur :
  // body: { extend: { seats: N } } avec N entier de 1 à max_seats
  const handleExtendCheckout = async () => {
    if (!user || isEmployee) return;
    if (subscription?.status !== 'active') return;

    setExtendCheckoutLoading(true);
    setExtendCheckoutError(null);

    // Mémoriser le nombre actuel de paid_seats dans sessionStorage avant redirection
    try {
      const currentPaid = subscription?.paid_seats ?? 0;
      sessionStorage.setItem('qash_extend_before', String(currentPaid));
    } catch {}

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          extend: {
            seats: seatsToAdd
          }
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

        if (status === 409 || errorCode === 'extend_requires_active_period') {
          setExtendCheckoutError("L'extension nécessite une période d'abonnement active.");
        } else if (status === 400 || errorCode === 'invalid_seats') {
          setExtendCheckoutError("Nombre de places invalide pour l'extension.");
        } else if (status === 403 || errorCode === 'only_owner_can_pay' || String(errorCode).includes('only_owner_can_pay')) {
          setExtendCheckoutError('Seul le gérant de la boutique peut étendre les places employés.');
        } else if (status === 401 || errorCode === 'unauthorized' || String(errorCode).includes('unauthorized')) {
          setExtendCheckoutError('Session expirée, reconnectez-vous.');
        } else if (status === 503 || errorCode === 'payment_not_configured' || String(errorCode).includes('payment_not_configured')) {
          setExtendCheckoutError('Le service de paiement est indisponible pour le moment.');
        } else if (status === 502 || errorCode === 'provider_error' || String(errorCode).includes('provider_error')) {
          setExtendCheckoutError('Le service de paiement est indisponible, réessayez.');
        } else {
          setExtendCheckoutError(errorBody?.message || error.message || "Impossible d'initialiser le paiement pour l'extension.");
        }
        setExtendCheckoutLoading(false);
        return;
      }

      const targetUrl = data?.checkoutUrl ?? data?.checkout_url;
      if (targetUrl) {
        window.location.href = targetUrl;
      } else {
        setExtendCheckoutError("L'adresse de paiement n'a pas pu être générée.");
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

  // Changement de mot de passe : e-mail de réinitialisation envoyé par Supabase Auth
  const handleResetPassword = async () => {
    const accountEmail = user?.email;
    if (!accountEmail || resetLoading) return;
    setResetLoading(true);
    setResetMessage(null);
    setResetError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(accountEmail, {
        redirectTo: window.location.origin + '/auth/callback',
      });
      if (error) {
        console.warn('Erreur resetPasswordForEmail:', error);
        const status = (error as any)?.status;
        setResetError(
          status === 429
            ? 'Trop de demandes. Patientez quelques minutes avant de réessayer.'
            : "L'e-mail n'a pas pu être envoyé pour le moment. Réessayez plus tard."
        );
      } else {
        setResetMessage('Si cette adresse existe, un e-mail vient d\'être envoyé.');
      }
    } catch (err: any) {
      console.warn('Exception resetPasswordForEmail:', err);
      setResetError("L'e-mail n'a pas pu être envoyé pour le moment. Vérifiez votre connexion et réessayez.");
    } finally {
      setResetLoading(false);
    }
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

  // 1. Analyse détaillée des stocks (ruptures, faibles, optimaux, valorisation marchande à l'achat)
  const stockMetrics = useMemo(() => {
    let outOfStockCount = 0; // stock_actuel <= 0
    let lowStockCount = 0;   // 0 < stock_actuel <= seuil_alerte
    let optimalStockCount = 0; // stock_actuel > seuil_alerte
    let totalStockValuation = 0; // somme (prix_achat * stock_actuel) pour prix_achat > 0 et stock_actuel > 0
    let valuedProductsCount = 0;

    const outOfStockItems: ProductItem[] = [];
    const lowStockItems: ProductItem[] = [];

    products.forEach((p) => {
      const stock = Number(p.stock_actuel) || 0;
      const alertThreshold = Number(p.seuil_alerte) || 0;
      const purchasePrice = Number(p.prix_achat) || 0;

      if (stock <= 0) {
        outOfStockCount++;
        outOfStockItems.push(p);
      } else if (stock <= alertThreshold) {
        lowStockCount++;
        lowStockItems.push(p);
      } else {
        optimalStockCount++;
      }

      if (purchasePrice > 0 && stock > 0) {
        totalStockValuation += purchasePrice * stock;
        valuedProductsCount++;
      }
    });

    return {
      outOfStockCount,
      lowStockCount,
      optimalStockCount,
      totalStockValuation,
      valuedProductsCount,
      outOfStockItems,
      lowStockItems,
    };
  }, [products]);

  // 2. Bornes temporelles pour le fuseau Africa/Dakar (UTC+0)
  const periodDateBounds = useMemo(() => {
    const now = new Date();
    
    if (selectedPeriod === 'today') {
      // Aujourd'hui (minuit UTC à fin de journée UTC)
      const currentStart = new Date(now);
      currentStart.setUTCHours(0, 0, 0, 0);
      const currentEnd = new Date(currentStart);
      currentEnd.setUTCHours(23, 59, 59, 999);

      // Période précédente = hier complet
      const previousStart = new Date(currentStart);
      previousStart.setUTCDate(previousStart.getUTCDate() - 1);
      const previousEnd = new Date(previousStart);
      previousEnd.setUTCHours(23, 59, 59, 999);

      return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        currentLabel: "Aujourd'hui",
        previousLabel: 'hier',
      };
    }

    if (selectedPeriod === '7d') {
      // 7 derniers jours glissants
      const currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const currentEnd = now;
      const previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const previousEnd = currentStart;

      return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        currentLabel: '7 derniers jours',
        previousLabel: '7 jours précédents',
      };
    }

    // 30 derniers jours glissants
    const currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const currentEnd = now;
    const previousStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const previousEnd = currentStart;

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      currentLabel: '30 derniers jours',
      previousLabel: '30 jours précédents',
    };
  }, [selectedPeriod]);

  // 3. Indicateurs de la période sélectionnée et comparaison avec la période précédente équivalente
  const periodMetrics = useMemo(() => {
    const { currentStart, currentEnd, previousStart, previousEnd, currentLabel, previousLabel } = periodDateBounds;

    const currentSales = sales.filter((s) => {
      const t = new Date(s.created_at).getTime();
      return t >= currentStart.getTime() && t <= currentEnd.getTime();
    });

    const previousSales = sales.filter((s) => {
      const t = new Date(s.created_at).getTime();
      return t >= previousStart.getTime() && t <= previousEnd.getTime();
    });

    const currentRevenue = currentSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const previousRevenue = previousSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

    const currentCount = currentSales.length;
    const previousCount = previousSales.length;

    // Règle d'or : comparaison seulement si la période précédente contient des ventes
    const hasPreviousSales = previousCount > 0 && previousRevenue > 0;
    let revenueDiffPercent: number | null = null;
    let countDiffPercent: number | null = null;

    if (hasPreviousSales) {
      revenueDiffPercent = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);
      countDiffPercent = Math.round(((currentCount - previousCount) / previousCount) * 100);
    }

    return {
      currentSales,
      previousSales,
      currentRevenue,
      previousRevenue,
      currentCount,
      previousCount,
      hasPreviousSales,
      revenueDiffPercent,
      countDiffPercent,
      currentLabel,
      previousLabel,
    };
  }, [sales, periodDateBounds]);

  // 4. Données journalières pour le graphique sobre du CA (SVG)
  const chartData = useMemo(() => {
    const { currentSales } = periodMetrics;
    
    if (selectedPeriod === 'today') {
      const slots = [
        { label: '00h - 04h', short: '00h', startHour: 0, endHour: 4, revenue: 0, count: 0 },
        { label: '04h - 08h', short: '04h', startHour: 4, endHour: 8, revenue: 0, count: 0 },
        { label: '08h - 12h', short: '08h', startHour: 8, endHour: 12, revenue: 0, count: 0 },
        { label: '12h - 16h', short: '12h', startHour: 12, endHour: 16, revenue: 0, count: 0 },
        { label: '16h - 20h', short: '16h', startHour: 16, endHour: 20, revenue: 0, count: 0 },
        { label: '20h - 24h', short: '20h', startHour: 20, endHour: 24, revenue: 0, count: 0 },
      ];
      
      currentSales.forEach((s) => {
        const d = new Date(s.created_at);
        const h = d.getUTCHours();
        const slot = slots.find((sl) => h >= sl.startHour && h < sl.endHour);
        if (slot) {
          slot.revenue += Number(s.amount) || 0;
          slot.count += 1;
        }
      });

      return slots.map((sl) => ({
        key: sl.label,
        label: sl.label,
        shortLabel: sl.short,
        revenue: sl.revenue,
        count: sl.count,
      }));
    }

    const daysCount = selectedPeriod === '7d' ? 7 : 30;
    const now = new Date();
    const days: Array<{
      key: string;
      label: string;
      shortLabel: string;
      revenue: number;
      count: number;
    }> = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().slice(0, 10);
      const formattedDate = d.toLocaleDateString('fr-FR', {
        timeZone: 'UTC',
        day: 'numeric',
        month: 'short',
      });
      const shortLabel = d.toLocaleDateString('fr-FR', {
        timeZone: 'UTC',
        day: 'numeric',
      });

      days.push({
        key: dateKey,
        label: formattedDate,
        shortLabel: daysCount === 7 ? formattedDate : shortLabel,
        revenue: 0,
        count: 0,
      });
    }

    currentSales.forEach((s) => {
      const saleDateKey = new Date(s.created_at).toISOString().slice(0, 10);
      const dayItem = days.find((d) => d.key === saleDateKey);
      if (dayItem) {
        dayItem.revenue += Number(s.amount) || 0;
        dayItem.count += 1;
      }
    });

    return days;
  }, [selectedPeriod, periodMetrics]);

  // 5. Notifications réelles calculées dynamiquement
  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      level: 'critical' | 'warning' | 'info';
      title: string;
      description: string;
      targetTab?: TabId;
      actionLabel?: string;
    }> = [];

    // Ruptures de stock (critique)
    if (stockMetrics.outOfStockCount > 0) {
      list.push({
        id: 'out_of_stock',
        level: 'critical',
        title: `${stockMetrics.outOfStockCount} produit${stockMetrics.outOfStockCount > 1 ? 's' : ''} en rupture de stock`,
        description: 'Des articles ont un stock nul ou négatif. Un réapprovisionnement immédiat est nécessaire.',
        targetTab: 'activity',
        actionLabel: 'Voir les ruptures',
      });
    }

    // Stocks faibles (alerte)
    if (stockMetrics.lowStockCount > 0) {
      list.push({
        id: 'low_stock',
        level: 'warning',
        title: `${stockMetrics.lowStockCount} alerte${stockMetrics.lowStockCount > 1 ? 's' : ''} de stock faible`,
        description: "Le stock disponible a atteint le seuil d'alerte défini sur votre catalogue Android.",
        targetTab: 'activity',
        actionLabel: 'Consulter les stocks',
      });
    }

    // Statut de l'abonnement
    if (!isEmployee && subscription) {
      const targetDate = subscription.current_period_end || subscription.access_until || subscription.trial_ends_at;
      const daysLeft = calculateDaysRemaining(targetDate);
      if (subscription.status === 'grace') {
        list.push({
          id: 'sub_grace',
          level: 'critical',
          title: 'Abonnement en période de grâce',
          description: 'Votre forfait est arrivé à échéance. Renouvelez-le pour éviter toute interruption de synchronisation.',
          targetTab: 'subscription',
          actionLabel: 'Renouveler',
        });
      } else if (subscription.status === 'expired') {
        list.push({
          id: 'sub_expired',
          level: 'critical',
          title: 'Abonnement expiré',
          description: "Votre abonnement QASH a expiré. Réactivez-le pour reprendre l'accès complet.",
          targetTab: 'subscription',
          actionLabel: 'Réactiver',
        });
      } else if (subscription.status === 'active' && daysLeft <= 5) {
        list.push({
          id: 'sub_expiring',
          level: 'warning',
          title: `Abonnement expirant dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`,
          description: `Votre période active s'achève le ${formatDateFr(subscription.current_period_end)}. Vous pouvez renouveler par anticipation.`,
          targetTab: 'subscription',
          actionLabel: 'Renouveler',
        });
      }
    }

    // Capacité d'équipe saturée
    if (!isEmployee && subscription && typeof subscription.paid_seats === 'number') {
      const paid = subscription.paid_seats || 0;
      const used = employees.length;
      if (paid > 0 && used >= paid) {
        list.push({
          id: 'seats_full',
          level: 'info',
          title: `Capacité d'équipe atteinte (${used} / ${paid} place${paid > 1 ? 's' : ''} occupée${used > 1 ? 's' : ''})`,
          description: "Toutes les licences employés sont assignées. Utilisez l'option « Étendre » pour rattacher de nouveaux vendeurs.",
          targetTab: 'subscription',
          actionLabel: "Étendre l'équipe",
        });
      }
    }

    return list;
  }, [stockMetrics, subscription, isEmployee, employees.length]);

  // Dernière vente synchronisée : created_at le plus récent de sales
  const lastSaleAt = useMemo(() => {
    let latest = 0;
    for (const s of sales) {
      const t = new Date(s.created_at).getTime();
      if (!isNaN(t) && t > latest) latest = t;
    }
    return latest > 0 ? new Date(latest).toISOString() : null;
  }, [sales]);
  const lastSaleOlderThan24h = lastSaleAt
    ? Date.now() - new Date(lastSaleAt).getTime() > 24 * 60 * 60 * 1000
    : false;

  // Variables globales de base
  const totalRevenue =useMemo(() => sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0), [sales]);
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

  // FAQ de l'onglet Paramètres et aide (réponses alignées sur les règles réelles du service)
  const faqItems: Array<{ id: string; question: string; answer: React.ReactNode }> = [
    {
      id: 'essai',
      question: "Comment fonctionne l'essai gratuit de 3 jours ?",
      answer: "À la création de votre boutique, vous bénéficiez d'un essai gratuit de 3 jours pour découvrir QASH. Pendant l'essai, vos employés peuvent rejoindre votre boutique sans limite de places. L'ajout de places supplémentaires devient possible après le premier paiement.",
    },
    {
      id: 'payer',
      question: 'Comment payer mon abonnement ?',
      answer: (
        <>
          Le paiement se fait sur le site, depuis la page{' '}
          <button
            type="button"
            onClick={() => onNavigate('/pricing')}
            className="font-bold underline cursor-pointer text-rose-700 hover:text-rose-800"
          >
            Tarifs
          </button>
          . Le montant affiché est calculé par le serveur. Seul le gérant de la boutique peut payer.
        </>
      ),
    },
    {
      id: 'duree',
      question: "Les jours s'écoulent-ils si je n'utilise pas l'application ?",
      answer: "Oui. L'abonnement est une période calendaire fixée par le serveur : les jours s'écoulent en continu, même si l'application n'est pas utilisée.",
    },
    {
      id: 'employe',
      question: 'Comment ajouter un employé et que sont les places payées ?',
      answer: "Chaque employé occupe une place payée. Communiquez votre code d'invitation (onglet Équipe) à votre collaborateur : il le saisit dans l'application Android QASH pour rejoindre votre boutique. Si toutes les places payées sont occupées, le gérant peut en ajouter depuis l'onglet Abonnement, tant que l'abonnement est actif.",
    },
    {
      id: 'expiration',
      question: "Que se passe-t-il quand l'abonnement expire ?",
      answer: "Après la période de grâce de 3 jours, l'accès est bloqué tant que l'abonnement n'est pas renouvelé. Vos données sont conservées et redeviennent accessibles dès le renouvellement.",
    },
    {
      id: 'hors-ligne',
      question: "Puis-je vendre sans connexion Internet ?",
      answer: "Oui, l'application Android enregistre vos ventes localement. Elles apparaissent sur ce site après leur synchronisation depuis l'application, dès que la connexion revient. Utilisez le bouton « Actualiser » pour recharger les données.",
    },
    {
      id: 'suppression',
      question: 'Comment supprimer mon compte ?',
      answer: (
        <>
          La demande se fait depuis la page{' '}
          <button
            type="button"
            onClick={() => onNavigate('/suppression-compte')}
            className="font-bold underline cursor-pointer text-rose-700 hover:text-rose-800"
          >
            Suppression de compte
          </button>
          , qui prépare un e-mail à envoyer à notre équipe.
        </>
      ),
    },
    {
      id: 'contact',
      question: "Comment contacter l'équipe QASH ?",
      answer: (
        <>
          Écrivez-nous à{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-bold underline text-rose-700 hover:text-rose-800"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </>
      ),
    },
  ];

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
      handleSelectTab(availableTabs[nextIndex].id);
      const nextBtn = document.getElementById(`tab-btn-${availableTabs[nextIndex].id}`);
      nextBtn?.focus();
    }
  };

  // Calculs dérivés pour l'extension de places (contrat Edge Function create-checkout)
  const extendInfo = extendQuote?.extend || null;
  const extendUnitPrice = typeof extendInfo?.unit_price === 'number' ? extendInfo.unit_price : null;
  const extendMonthsRemaining = typeof extendInfo?.months_remaining === 'number' ? extendInfo.months_remaining : null;
  const extendMaxSeats = typeof extendInfo?.max_seats === 'number' ? extendInfo.max_seats : 50;
  const extendTotalAmount = extendUnitPrice !== null ? extendUnitPrice * seatsToAdd : null;
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
              type="button"
              onClick={() => handleSelectTab('overview')}
              aria-label={
                notifications.length > 0
                  ? `Alertes : ${notifications.length} à consulter dans la vue d'ensemble`
                  : "Alertes : aucune alerte, ouvrir la vue d'ensemble"
              }
              className="relative min-h-[48px] min-w-[48px] px-3 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                  {notifications.length}
                </span>
              )}
            </button>
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
              const tabBadgeCount = tab.id === 'activity' 
                ? (stockMetrics.outOfStockCount + stockMetrics.lowStockCount)
                : tab.id === 'subscription' && (subscription?.status === 'grace' || subscription?.status === 'expired' || daysRemaining <= 5)
                ? 1
                : 0;

              return (
                <button
                  key={tab.id}
                  id={`tab-btn-mobile-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleSelectTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-neutral-500'}`} />
                  <span>{tab.label}</span>
                  {tabBadgeCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tabBadgeCount}
                    </span>
                  )}
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
                          <h2 className="text-lg font-bold text-neutral-900">Statut de l'abonnement</h2>
                          {!subscriptionLoading && renderSubscriptionBadge()}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {isEmployee ? 'Abonnement géré par votre gérant' : 'Licence active et synchronisation cloud'}
                        </p>
                      </div>
                    </div>

                    {!isEmployee && (
                      <button
                        onClick={() => handleSelectTab('subscription')}
                        className="self-start sm:self-center shrink-0 min-h-[48px] px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                      >
                        <span>Gérer l'abonnement</span>
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

                {/* 2. Centre d'Alertes & Notifications */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-neutral-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">Alertes et notifications</h3>
                        <p className="text-xs text-neutral-500">Synthèse calculée à partir des dernières données synchronisées (stocks et abonnement)</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      notifications.length > 0
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {notifications.length > 0
                        ? `${notifications.length} alerte${notifications.length > 1 ? 's' : ''}`
                        : 'Tout est optimal'}
                    </span>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-4 px-4 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold">Aucune alerte à signaler</p>
                        <p className="text-emerald-700 mt-0.5">Stocks sous contrôle, période d'abonnement valide et licences synchronisées.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => {
                        const isCritical = notif.level === 'critical';
                        const isWarning = notif.level === 'warning';
                        return (
                          <div
                            key={notif.id}
                            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                              isCritical
                                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                                : isWarning
                                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                                : 'bg-blue-50/80 border-blue-200 text-blue-950'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                isCritical
                                  ? 'bg-rose-100 text-rose-700'
                                  : isWarning
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {isCritical ? (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold">{notif.title}</p>
                                <p className="opacity-90 mt-0.5 leading-relaxed">{notif.description}</p>
                              </div>
                            </div>

                            {notif.targetTab && notif.actionLabel && (
                              <button
                                type="button"
                                onClick={() => handleSelectTab(notif.targetTab!)}
                                className={`min-h-[48px] px-3.5 py-2 rounded-xl font-bold shrink-0 self-end sm:self-center transition-all cursor-pointer shadow-2xs text-xs flex items-center gap-1.5 ${
                                  isCritical
                                    ? 'bg-rose-900 text-white hover:bg-rose-950'
                                    : isWarning
                                    ? 'bg-amber-900 text-white hover:bg-amber-950'
                                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                                }`}
                              >
                                <span>{notif.actionLabel}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Trois Chiffres Clés */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    Chiffres clés de la boutique
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* CA */}
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-neutral-400 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Chiffre d'Affaires</span>
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
                      <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                        Total des encaissements enregistrés
                      </div>
                    </div>

                    {/* Ventes */}
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                      <div>
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
                            `${salesCount} reçu${salesCount > 1 ? 's' : ''}`
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                        Transactions synchronisées
                      </div>
                    </div>

                    {/* Stock faible & Ruptures */}
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-neutral-400 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Alertes Stock</span>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            stockMetrics.outOfStockCount > 0 
                              ? 'bg-rose-50 text-rose-600' 
                              : stockMetrics.lowStockCount > 0 
                              ? 'bg-amber-50 text-amber-600' 
                              : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-neutral-900 tracking-tight">
                          {statsLoading ? (
                            <span className="text-neutral-300 text-base">Chargement...</span>
                          ) : (
                            `${stockMetrics.outOfStockCount + stockMetrics.lowStockCount} alerte${(stockMetrics.outOfStockCount + stockMetrics.lowStockCount) > 1 ? 's' : ''}`
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                        {stockMetrics.outOfStockCount > 0 ? (
                          <span className="text-rose-600 font-semibold">{stockMetrics.outOfStockCount} en rupture</span>
                        ) : stockMetrics.lowStockCount > 0 ? (
                          <span className="text-amber-700 font-semibold">{stockMetrics.lowStockCount} sous le seuil</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Stock optimal ✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Raccourcis vers les autres onglets */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">
                    Raccourcis rapides
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleSelectTab('activity')}
                      className="min-h-[48px] p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-sm">Consulter l'activité</p>
                          <p className="text-xs text-neutral-500">Ventes synchronisées, catalogue & alertes</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                    </button>

                    {!isEmployee ? (
                      <>
                        <button
                          onClick={() => handleSelectTab('subscription')}
                          className="min-h-[48px] p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 text-sm">Gérer l'abonnement</p>
                              <p className="text-xs text-neutral-500">Renouveler ou étendre les places employés</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                        </button>

                        <button
                          onClick={() => handleSelectTab('team')}
                          className="min-h-[48px] p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Users className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 text-sm">Gérer l'équipe</p>
                              <p className="text-xs text-neutral-500">Employés rattachés & code d'invitation</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                        </button>

                        <button
                          onClick={() => handleSelectTab('store_profile')}
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
                    ) : (
                      <button
                        onClick={() => handleSelectTab('store_profile')}
                        className="min-h-[48px] p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 shadow-2xs hover:shadow-xs text-left flex items-center justify-between group transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Store className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 text-sm">Boutique et profil</p>
                            <p className="text-xs text-neutral-500">Coordonnées de la boutique et de votre profil</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div 
                role="tabpanel" 
                id="tabpanel-activity" 
                aria-labelledby="tab-btn-activity" 
                className="space-y-6"
              >
                {/* En-tête de section avec Filtre de période (Fuseau Africa/Dakar UTC+0) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">Activité de la boutique</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Statistiques des ventes et des stocks synchronisés depuis l'application Android (fuseau Africa/Dakar)
                    </p>
                  </div>

                  {/* Boutons Sélecteurs de Période (min-h-[48px]) */}
                  <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('today')}
                      className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedPeriod === 'today'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                      }`}
                    >
                      Aujourd'hui
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('7d')}
                      className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedPeriod === '7d'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                      }`}
                    >
                      7 derniers jours
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('30d')}
                      className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedPeriod === '30d'
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                      }`}
                    >
                      30 derniers jours
                    </button>
                  </div>
                </div>

                {/* Dernière vente synchronisée (gérant : les ventes ne sont chargées que pour le gérant) */}
                {!isEmployee && (
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          Dernière vente synchronisée
                        </p>
                        {statsLoading ? (
                          <p className="text-sm text-neutral-400 mt-0.5">Chargement...</p>
                        ) : lastSaleAt ? (
                          <>
                            <p className="text-base font-bold text-neutral-900 mt-0.5">
                              {formatDateTimeDakar(lastSaleAt)} <span className="text-xs font-medium text-neutral-500">(fuseau Africa/Dakar)</span>
                            </p>
                            {lastSaleOlderThan24h && (
                              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                                Les ventes faites hors ligne apparaissent après leur synchronisation depuis l&apos;application.
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-neutral-600 mt-0.5 leading-relaxed">
                            Vos statistiques apparaîtront ici lorsque vos premières ventes seront synchronisées.
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRefreshAll}
                      disabled={profileLoading || subscriptionLoading || storeLoading || statsLoading || employeesLoading}
                      className="self-start sm:self-center shrink-0 min-h-[48px] px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    >
                      <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin text-rose-500' : ''}`} />
                      <span>Actualiser</span>
                    </button>
                  </div>
                )}

                {/* 4 Cartes KPI avec Comparaison Période Précédente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Revenue période */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Chiffre d'Affaires</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-neutral-900 tracking-tight">
                        {statsLoading ? (
                          <span className="text-neutral-300 text-base">Chargement...</span>
                        ) : (
                          `${periodMetrics.currentRevenue.toLocaleString('fr-FR')} FCFA`
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-medium">
                      <span className="text-neutral-500">{periodMetrics.currentLabel}</span>
                      {periodMetrics.hasPreviousSales ? (
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          (periodMetrics.revenueDiffPercent ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {(periodMetrics.revenueDiffPercent ?? 0) >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {(periodMetrics.revenueDiffPercent ?? 0) >= 0 ? `+${periodMetrics.revenueDiffPercent}%` : `${periodMetrics.revenueDiffPercent}%`}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-normal">vs {periodMetrics.previousLabel}</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic text-[10px]">
                          (0 vente sur {periodMetrics.previousLabel})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Sales Count période */}
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
                          `${periodMetrics.currentCount} transaction${periodMetrics.currentCount > 1 ? 's' : ''}`
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-medium">
                      <span className="text-neutral-500">
                        Panier moyen : {periodMetrics.currentCount > 0 ? Math.round(periodMetrics.currentRevenue / periodMetrics.currentCount).toLocaleString('fr-FR') : 0} FCFA
                      </span>
                      {periodMetrics.hasPreviousSales && (
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          (periodMetrics.countDiffPercent ?? 0) >= 0 ? 'text-blue-600' : 'text-rose-600'
                        }`}>
                          {(periodMetrics.countDiffPercent ?? 0) >= 0 ? `+${periodMetrics.countDiffPercent}%` : `${periodMetrics.countDiffPercent}%`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Catalogue & Valeur du Stock à l'achat */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Valeur Stock (Achat)</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Package className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-neutral-900 tracking-tight">
                        {statsLoading ? (
                          <span className="text-neutral-300 text-base">Chargement...</span>
                        ) : (
                          `${stockMetrics.totalStockValuation.toLocaleString('fr-FR')} FCFA`
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium flex items-center justify-between">
                      <span>{totalProducts} produit{totalProducts > 1 ? 's' : ''} au catalogue</span>
                      <span className="text-[10px] text-neutral-400">({stockMetrics.valuedProductsCount} valorisé{stockMetrics.valuedProductsCount > 1 ? 's' : ''})</span>
                    </div>
                  </div>

                  {/* Card 4: Alertes Stock (Ruptures + Faibles) */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Alertes de Stock</span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          stockMetrics.outOfStockCount > 0 
                            ? 'bg-rose-50 text-rose-600' 
                            : stockMetrics.lowStockCount > 0 
                            ? 'bg-amber-50 text-amber-600' 
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-neutral-900 tracking-tight">
                        {statsLoading ? (
                          <span className="text-neutral-300 text-base">Chargement...</span>
                        ) : (
                          `${stockMetrics.outOfStockCount + stockMetrics.lowStockCount} alerte${(stockMetrics.outOfStockCount + stockMetrics.lowStockCount) > 1 ? 's' : ''}`
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] font-medium flex items-center justify-between">
                      {stockMetrics.outOfStockCount > 0 ? (
                        <span className="text-rose-600 font-bold">{stockMetrics.outOfStockCount} rupture{stockMetrics.outOfStockCount > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-emerald-600">0 rupture</span>
                      )}
                      {stockMetrics.lowStockCount > 0 ? (
                        <span className="text-amber-700 font-bold">{stockMetrics.lowStockCount} faible{stockMetrics.lowStockCount > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-emerald-600">Stock optimal ✓</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Graphique sobre du chiffre d'affaires par jour (SVG) */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        <span>Évolution des Encaissements</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Chiffre d'affaires par {selectedPeriod === 'today' ? 'tranche horaire' : 'jour'} sur {periodMetrics.currentLabel} (fuseau Dakar)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] text-neutral-400">Total période : </span>
                        <span className="text-xs font-black text-neutral-900">
                          {periodMetrics.currentRevenue.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart Container */}
                  <div className="pt-2">
                    {periodMetrics.currentRevenue === 0 && chartData.every(d => d.revenue === 0) ? (
                      <div className="py-12 text-center space-y-2">
                        <Receipt className="w-8 h-8 text-neutral-300 mx-auto" />
                        <p className="text-xs text-neutral-500 font-medium">
                          Aucun encaissement enregistré sur la période : {periodMetrics.currentLabel}.
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Les transactions saisies sur l'application Android QASH apparaîtront ici après leur synchronisation.
                        </p>
                      </div>
                    ) : (
                      (() => {
                        const maxRev = Math.max(...chartData.map(d => d.revenue), 1000);
                        const count = chartData.length;
                        const svgWidth = 640;
                        const svgHeight = 190;
                        const chartBottom = 150;
                        const chartTop = 20;
                        const chartHeight = chartBottom - chartTop;
                        const paddingX = 40;
                        const availableWidth = svgWidth - paddingX * 2;
                        const stepX = availableWidth / count;
                        const barWidth = Math.max(8, Math.min(36, stepX * 0.65));

                        return (
                          <div className="space-y-3">
                            <div className="w-full overflow-x-auto pb-1">
                              <svg 
                                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                                className="w-full h-48 sm:h-56 select-none"
                              >
                                {/* Guide Lines */}
                                <line x1={paddingX} y1={chartTop} x2={svgWidth - paddingX} y2={chartTop} stroke="#f1f5f9" strokeDasharray="4 4" />
                                <text x={paddingX - 6} y={chartTop + 4} textAnchor="end" className="text-[9px] fill-neutral-400">
                                  {maxRev >= 1000000 ? `${(maxRev / 1000000).toFixed(1)}M` : maxRev >= 1000 ? `${Math.round(maxRev / 1000)}k` : maxRev}
                                </text>

                                <line x1={paddingX} y1={chartTop + chartHeight / 2} x2={svgWidth - paddingX} y2={chartTop + chartHeight / 2} stroke="#f1f5f9" strokeDasharray="4 4" />
                                <text x={paddingX - 6} y={chartTop + chartHeight / 2 + 4} textAnchor="end" className="text-[9px] fill-neutral-400">
                                  {Math.round(maxRev / 2000)}k
                                </text>

                                <line x1={paddingX} y1={chartBottom} x2={svgWidth - paddingX} y2={chartBottom} stroke="#e2e8f0" strokeWidth="1.5" />
                                <text x={paddingX - 6} y={chartBottom + 4} textAnchor="end" className="text-[9px] fill-neutral-400">
                                  0
                                </text>

                                {/* Bars */}
                                {chartData.map((d, i) => {
                                  const barH = d.revenue > 0 ? Math.max(4, (d.revenue / maxRev) * chartHeight) : 0;
                                  const barX = paddingX + i * stepX + (stepX - barWidth) / 2;
                                  const barY = chartBottom - barH;
                                  const isHovered = hoveredPointKey === d.key;

                                  return (
                                    <g 
                                      key={d.key} 
                                      className="cursor-pointer transition-opacity"
                                      onMouseEnter={() => setHoveredPointKey(d.key)}
                                      onMouseLeave={() => setHoveredPointKey(null)}
                                      onClick={() => setHoveredPointKey(hoveredPointKey === d.key ? null : d.key)}
                                    >
                                      {/* Invisible hit area for mobile tap */}
                                      <rect 
                                        x={paddingX + i * stepX} 
                                        y={chartTop} 
                                        width={stepX} 
                                        height={chartHeight + 30} 
                                        fill="transparent" 
                                      />

                                      {/* Bar */}
                                      {barH > 0 && (
                                        <rect
                                          x={barX}
                                          y={barY}
                                          width={barWidth}
                                          height={barH}
                                          rx={3}
                                          fill={isHovered ? '#059669' : '#10b981'}
                                          className="transition-all"
                                        />
                                      )}

                                      {/* Label underneath */}
                                      {(count <= 10 || i % Math.ceil(count / 8) === 0 || i === count - 1) && (
                                        <text
                                          x={barX + barWidth / 2}
                                          y={chartBottom + 16}
                                          textAnchor="middle"
                                          className={`text-[10px] font-medium ${isHovered ? 'fill-neutral-900 font-bold' : 'fill-neutral-400'}`}
                                        >
                                          {d.shortLabel}
                                        </text>
                                      )}
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>

                            {/* Active Point Card Details */}
                            {hoveredPointKey && (() => {
                              const point = chartData.find(d => d.key === hoveredPointKey);
                              if (!point) return null;
                              return (
                                <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    <span className="font-bold text-neutral-800">{point.label}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-neutral-500">{point.count} vente{point.count > 1 ? 's' : ''}</span>
                                    <span className="font-black text-neutral-900">{point.revenue.toLocaleString('fr-FR')} FCFA</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>

                {/* Détails : Suivi des stocks avec sous-filtre & Dernières ventes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Alertes stock avec sous-filtre Rupture vs Faible */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4 mb-4">
                        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Suivi des Stocks & Alertes</span>
                        </h3>
                        {/* Sous-filtre stock */}
                        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg shrink-0">
                          <button
                            type="button"
                            onClick={() => setStockAlertFilter('all')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              stockAlertFilter === 'all'
                                ? 'bg-white text-neutral-900 shadow-2xs'
                                : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            Toutes ({stockMetrics.outOfStockCount + stockMetrics.lowStockCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStockAlertFilter('rupture')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              stockAlertFilter === 'rupture'
                                ? 'bg-rose-100 text-rose-900 shadow-2xs'
                                : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            Ruptures ({stockMetrics.outOfStockCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStockAlertFilter('faible')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              stockAlertFilter === 'faible'
                                ? 'bg-amber-100 text-amber-900 shadow-2xs'
                                : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            Faibles ({stockMetrics.lowStockCount})
                          </button>
                        </div>
                      </div>

                      {statsLoading ? (
                        <div className="py-8 text-center text-xs text-neutral-400">Analyse du stock...</div>
                      ) : (() => {
                        const displayedStockItems = stockAlertFilter === 'rupture'
                          ? stockMetrics.outOfStockItems
                          : stockAlertFilter === 'faible'
                          ? stockMetrics.lowStockItems
                          : [...stockMetrics.outOfStockItems, ...stockMetrics.lowStockItems];

                        if (displayedStockItems.length === 0) {
                          return (
                            <div className="py-10 text-center text-neutral-400 text-xs font-medium space-y-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                                ✓
                              </div>
                              <p>Aucun produit dans cette catégorie d'alerte.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                            {displayedStockItems.map((p) => {
                              const isOutOfStock = Number(p.stock_actuel) <= 0;
                              return (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/60 text-xs">
                                  <div>
                                    <p className="font-bold text-neutral-900">{p.nom}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                                      <span>Vente : {Number(p.prix_vente).toLocaleString('fr-FR')} FCFA</span>
                                      {Number(p.prix_achat) > 0 && (
                                        <span>· Achat : {Number(p.prix_achat).toLocaleString('fr-FR')} FCFA</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                                      isOutOfStock 
                                        ? 'bg-rose-100 text-rose-900' 
                                        : 'bg-amber-100 text-amber-900'
                                    }`}>
                                      {isOutOfStock ? '0 restant (Rupture)' : `${p.stock_actuel} restant${Number(p.stock_actuel) > 1 ? 's' : ''}`}
                                    </span>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">Seuil : {p.seuil_alerte}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                      Rupture : stock ≤ 0. Stock faible : stock ≤ seuil d'alerte configuré sur Android.
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
                          {sales.length} transaction{sales.length > 1 ? 's' : ''} au total
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
                                    timeZone: 'UTC',
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} (Dakar)
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
                      Données synchronisées depuis l'application Android. Utilisez « Actualiser » pour les recharger.
                    </div>
                  </div>
                </div>

                {/* Encart analyses avancées - Honnête et sans fausse donnée */}
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 border border-neutral-700 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-neutral-800 text-amber-400 flex items-center justify-center border border-neutral-700">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Analyses de rentabilité & Meilleures ventes</h4>
                        <p className="text-xs text-neutral-400">Indicateurs avancés de gestion commerciale</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 w-fit">
                      <span>Bientôt disponible : nécessite la synchronisation du détail des ventes</span>
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    La table des ventes enregistre actuellement le montant global de chaque reçu. Les calculs de la <strong>marge brute</strong>, du <strong>bénéfice net</strong> et du classement des <strong>produits les plus vendus</strong> seront automatiquement activés dès la mise en ligne de la synchronisation ligne à ligne des articles depuis l'application mobile Android QASH.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/80">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Articles les plus vendus</div>
                      <div className="text-xs text-neutral-400 mt-1 italic">En attente du détail des lignes</div>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/80">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Marge brute commerciale</div>
                      <div className="text-xs text-neutral-400 mt-1 italic">En attente du détail des lignes</div>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/80">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Bénéfice net estimé</div>
                      <div className="text-xs text-neutral-400 mt-1 italic">En attente du détail des lignes</div>
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
                      Les ventes réalisées par votre équipe depuis leurs téléphones Android apparaissent sur cette console après leur synchronisation depuis l'application. Utilisez « Actualiser » pour recharger les données.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Compte connecté</span>
                  </div>
                </div>
              </div>
            )}

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
                    /* CAS 3 : Abonnement actif (Formulaire interactif avec devis serveur) */
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
                            onClick={() => setSeatsToAdd((prev) => Math.min(extendMaxSeats, prev + 1))}
                            disabled={seatsToAdd >= extendMaxSeats || extendCheckoutLoading}
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
                          ) : extendTotalAmount !== null ? (
                            <span className="text-base sm:text-lg font-black text-purple-950">
                              {extendTotalAmount.toLocaleString('fr-FR')} FCFA
                            </span>
                          ) : extendQuote?.amount ? (
                            <span className="text-base sm:text-lg font-black text-purple-950">
                              {Number(extendQuote.amount).toLocaleString('fr-FR')} FCFA
                            </span>
                          ) : (
                            <span className="text-xs text-purple-700 font-medium">
                              Calcul automatique à la confirmation
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-purple-800 leading-relaxed">
                          Le prix se calcule par mois entamés restants (3 500 FCFA × {extendMonthsRemaining !== null ? String(extendMonthsRemaining) + " mois restants" : "mois entamés"}{extendUnitPrice !== null ? " = " + extendUnitPrice.toLocaleString("fr-FR") + " FCFA par place" : ""}).
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

                {/* 4. Historique des Règlements (table payments) */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-emerald-600" />
                        <span>Historique des Règlements</span>
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Transactions et reçus de paiement enregistrés pour votre boutique
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 w-fit">
                      {payments.length} règlement{payments.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {paymentsLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-neutral-400 text-xs">
                      <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
                      <span>Chargement des règlements...</span>
                    </div>
                  ) : paymentsError ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      Impossible de charger l'historique des règlements : {paymentsError}
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400 font-medium space-y-1">
                      <CreditCard className="w-8 h-8 text-neutral-300 mx-auto" />
                      <p>Aucun règlement enregistré pour cette boutique.</p>
                      <p className="text-[11px] text-neutral-400">Vos prochains paiements d'abonnement apparaîtront ici.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {payments.map((p) => {
                        const isCompleted = p.status?.toLowerCase() === 'complete' || p.status?.toLowerCase() === 'completed';
                        const isExtend = p.kind === 'extend';
                        return (
                          <div
                            key={p.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-neutral-50/70 hover:bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs gap-3 transition-colors"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                  isExtend ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                                }`}>
                                  {isExtend
                                    ? `Extension (+${p.seats || 1} place${(p.seats || 1) > 1 ? 's' : ''})`
                                    : `Renouvellement ${p.period_days ? `(${Math.round(p.period_days / 30)} mois)` : ''}`}
                                </span>
                                <span className="font-mono text-[10px] text-neutral-400 uppercase">
                                  N° {String(p.id).substring(0, 8)}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500">
                                {new Date(p.created_at).toLocaleDateString('fr-FR', {
                                  timeZone: 'UTC',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} (fuseau Dakar)
                              </p>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                              <span className="text-sm font-black text-neutral-900">
                                {Number(p.amount).toLocaleString('fr-FR')} FCFA
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isCompleted 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                              }`}>
                                {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                {isCompleted ? 'Confirmé' : p.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                    Seuls les règlements confirmés par le serveur de paiement sont comptabilisés.
                  </div>
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
            {activeTab === 'store_profile' && (
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

            {/* ═══════════════════════════════════════════════
                ONGLET 6 — PARAMÈTRES ET AIDE (GÉRANT ET EMPLOYÉ)
                ═══════════════════════════════════════════════ */}
            {activeTab === 'settings_help' && (
              <div
                role="tabpanel"
                id="tabpanel-settings_help"
                aria-labelledby="tab-btn-settings_help"
                className="space-y-6"
              >
                {/* 1. Profil en lecture seule + sécurité du compte */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">Mon compte</h2>
                      <p className="text-xs text-neutral-500">Informations du profil (lecture seule)</p>
                    </div>
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
                    <dl className="space-y-3.5 text-xs sm:text-sm">
                      <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                        <dt className="text-neutral-500 font-medium">Prénom</dt>
                        <dd className="font-bold text-neutral-900 text-right">{firstName || 'Non renseigné'}</dd>
                      </div>
                      <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                        <dt className="text-neutral-500 font-medium">Nom</dt>
                        <dd className="font-bold text-neutral-900 text-right">{lastName || 'Non renseigné'}</dd>
                      </div>
                      <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                        <dt className="text-neutral-500 font-medium">Téléphone</dt>
                        <dd className="font-bold text-neutral-900 text-right">{phone || 'Non renseigné'}</dd>
                      </div>
                      <div className="flex items-start justify-between py-2 border-b border-neutral-100 gap-4">
                        <dt className="text-neutral-500 font-medium">E-mail</dt>
                        <dd className="font-semibold text-neutral-800 text-right break-all">{user?.email || '—'}</dd>
                      </div>
                      <div className="flex items-start justify-between py-2 gap-4">
                        <dt className="text-neutral-500 font-medium">Rôle</dt>
                        <dd className="font-bold text-neutral-900 text-right">{isEmployee ? 'Employé' : 'Gérant'}</dd>
                      </div>
                    </dl>
                  )}

                  <div className="pt-4 border-t border-neutral-100 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetLoading || !user?.email}
                        className="min-h-[48px] px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                      >
                        {resetLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-4 h-4" />
                            <span>Changer mon mot de passe</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="min-h-[48px] px-5 py-3 bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-200/50 active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>

                    <div aria-live="polite">
                      {resetMessage && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p>{resetMessage}</p>
                        </div>
                      )}
                      {resetError && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <p>{resetError}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. FAQ en accordéon (accessible au clavier) */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">Questions fréquentes</h2>
                      <p className="text-xs text-neutral-500">Les réponses aux questions les plus courantes</p>
                    </div>
                  </div>

                  <div className="divide-y divide-neutral-100 border border-neutral-200/80 rounded-xl overflow-hidden">
                    {faqItems.map((item) => {
                      const isOpen = openFaqId === item.id;
                      return (
                        <div key={item.id}>
                          <h3>
                            <button
                              type="button"
                              id={`faq-btn-${item.id}`}
                              aria-expanded={isOpen}
                              aria-controls={`faq-panel-${item.id}`}
                              onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                              className="w-full min-h-[48px] px-4 py-3.5 flex items-center justify-between gap-4 text-left text-sm font-bold text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500"
                            >
                              <span>{item.question}</span>
                              <ChevronDown
                                className={`w-4 h-4 shrink-0 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                              />
                            </button>
                          </h3>
                          {isOpen && (
                            <div
                              id={`faq-panel-${item.id}`}
                              role="region"
                              aria-labelledby={`faq-btn-${item.id}`}
                              className="px-4 pb-4 text-xs sm:text-sm text-neutral-600 leading-relaxed"
                            >
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Contact */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900">Besoin d&apos;aide ?</h2>
                      <p className="text-xs text-neutral-500">Notre équipe vous répond par e-mail.</p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="self-start sm:self-center min-h-[48px] px-5 py-3 bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 break-all"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>{CONTACT_EMAIL}</span>
                  </a>
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
                const tabBadgeCount = tab.id === 'activity' 
                  ? (stockMetrics.outOfStockCount + stockMetrics.lowStockCount)
                  : tab.id === 'subscription' && (subscription?.status === 'grace' || subscription?.status === 'expired' || daysRemaining <= 5)
                  ? 1
                  : 0;

                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => handleSelectTab(tab.id)}
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
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold leading-none ${isActive ? 'text-white' : 'text-neutral-900'}`}>
                          {tab.label}
                        </p>
                        {tabBadgeCount > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tabBadgeCount}
                          </span>
                        )}
                      </div>
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
