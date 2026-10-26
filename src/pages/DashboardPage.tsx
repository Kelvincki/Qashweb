import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { PageRoute, MySubscriptionData } from '../types';
import { Bell, Check, Copy, LogOut, Minus, Plus, RefreshCw, ChevronDown, ArrowRight } from 'lucide-react';
import { Container } from '../components/ui/Layout';
import { Button, ButtonLink } from '../components/ui/Button';
import { Notice, Spinner } from '../components/ui/AuthShell';
import { AppLink } from '../lib/navigation';
import { CONTACT_EMAIL, PAYMENTS_ENABLED, PRICING, SITE_URL, formatFcfa, mailtoLink } from '../config/site';
import { nb } from '../lib/typo';

/**
 * Mon espace (/dashboard).
 * Données lues sous RLS : abonnement (RPC get_my_subscription, seule source du statut), profil, boutique,
 * équipe et règlements d'abonnement. Aucune donnée de vente, de stock, de prix d'achat ni de bénéfice
 * n'est chargée ni affichée sur le site : elles restent dans l'application.
 */

interface DashboardPageProps {
  onNavigate: (route: PageRoute) => void;
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

type TabId = 'overview' | 'subscription' | 'team' | 'store_profile' | 'settings_help';

// Les anciennes adresses ?onglet=activite restent valides et ouvrent la vue d'ensemble
const TAB_PARAM_MAP: Record<string, TabId> = {
  'vue-ensemble': 'overview',
  overview: 'overview',
  activite: 'overview',
  activity: 'overview',
  abonnement: 'subscription',
  subscription: 'subscription',
  equipe: 'team',
  team: 'team',
  'boutique-profil': 'store_profile',
  boutique_profil: 'store_profile',
  store_profile: 'store_profile',
  'parametres-aide': 'settings_help',
  parametres_aide: 'settings_help',
  settings_help: 'settings_help',
};

const TAB_TO_PARAM: Record<TabId, string> = {
  overview: 'vue-ensemble',
  subscription: 'abonnement',
  team: 'equipe',
  store_profile: 'boutique-profil',
  settings_help: 'parametres-aide',
};

const GERANT_TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'subscription', label: 'Abonnement' },
  { id: 'team', label: 'Équipe' },
  { id: 'store_profile', label: 'Boutique et profil' },
  { id: 'settings_help', label: 'Paramètres et aide' },
];

const EMPLOYEE_TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'store_profile', label: 'Boutique et profil' },
  { id: 'settings_help', label: 'Paramètres et aide' },
];

/** Traduction française des types d'activité boutique */
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

/** Formatage de date en français */
function formatDateFr(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr || '';
  }
}

/** Nombre de jours calendaires restants jusqu'à une date fournie par le serveur (affichage seulement) */
function calculateDaysRemaining(targetDateStr?: string | null): number {
  if (!targetDateStr) return 0;
  try {
    const target = new Date(targetDateStr).getTime();
    if (isNaN(target)) return 0;
    const diffMs = target - Date.now();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  trial: { label: 'Essai gratuit', tone: 'bg-warning-soft' },
  active: { label: 'Actif', tone: 'bg-success-soft' },
  grace: { label: 'Période de grâce', tone: 'bg-warning-soft' },
  expired: { label: 'Expiré, lecture seule', tone: 'bg-danger-soft' },
  no_store: { label: 'Pas encore de boutique', tone: 'bg-field' },
  no_subscription: { label: 'Aucun abonnement', tone: 'bg-field' },
};

const linkCls = 'font-bold underline decoration-2 underline-offset-4 hover:text-brand-red';

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, loading: authLoading, signOut } = useAuth();

  // Onglet initialisé depuis l'URL (?onglet=...)
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window !== 'undefined') {
      const ongletParam = new URLSearchParams(window.location.search).get('onglet');
      if (ongletParam && TAB_PARAM_MAP[ongletParam.toLowerCase()]) {
        return TAB_PARAM_MAP[ongletParam.toLowerCase()];
      }
    }
    return 'overview';
  });

  // Historique des règlements (payments) pour le gérant
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  // Profil
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Abonnement (RPC get_my_subscription)
  const [subscription, setSubscription] = useState<MySubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Boutique
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Équipe (public.store_employees)
  const [employees, setEmployees] = useState<StoreEmployeeItem[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  // Paramètres et aide : réinitialisation du mot de passe et FAQ
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Ajout de places employés
  const [seatsToAdd, setSeatsToAdd] = useState<number>(1);
  const [extendQuote, setExtendQuote] = useState<any>(null);
  const [extendQuoteLoading, setExtendQuoteLoading] = useState(false);
  const [extendQuoteError, setExtendQuoteError] = useState<string | null>(null);
  const [extendCheckoutLoading, setExtendCheckoutLoading] = useState(false);
  const [extendCheckoutError, setExtendCheckoutError] = useState<string | null>(null);

  // Onglet actif mémorisé dans l'URL (?onglet=...)
  const handleSelectTab = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('onglet', TAB_TO_PARAM[tabId] || tabId);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  }, []);

  // Flèches précédente / suivante du navigateur
  useEffect(() => {
    const handlePopState = () => {
      const ongletParam = new URLSearchParams(window.location.search).get('onglet');
      if (ongletParam && TAB_PARAM_MAP[ongletParam.toLowerCase()]) {
        setActiveTab(TAB_PARAM_MAP[ongletParam.toLowerCase()]);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Non connecté : page de connexion
  useEffect(() => {
    if (!authLoading && !user) {
      onNavigate('/login');
    }
  }, [user, authLoading, onNavigate]);

  // Identité affichée (colonnes profiles puis metadata ; affichage seulement, jamais pour les droits)
  const metadata = user?.user_metadata || {};
  const firstName = profileData?.first_name || metadata.first_name || '';
  const lastName = profileData?.last_name || metadata.last_name || '';
  const phone = profileData?.phone || metadata.phone || '';
  const userRole = profileData?.role || subscription?.role || 'GERANT';
  const isEmployee = userRole.toUpperCase() === 'EMPLOYE' || userRole.toLowerCase() === 'employee';

  // Un employé ne reste pas sur les onglets du gérant (Abonnement, Équipe)
  useEffect(() => {
    if (isEmployee && (activeTab === 'subscription' || activeTab === 'team')) {
      handleSelectTab('overview');
    }
  }, [isEmployee, activeTab, handleSelectTab]);

  // 1. Abonnement via RPC get_my_subscription
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

  // 2. Profil (public.profiles où id = user.id)
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
        console.warn('Aucun profil trouvé pour cet utilisateur');
        setProfileError('Aucun profil associé à ce compte.');
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

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchUserProfile();
    }
  }, [user, fetchSubscription, fetchUserProfile]);

  // 3. Boutique, puis équipe et règlements (gérant)
  const fetchStoreAndTeam = useCallback(async () => {
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

      if (profileData.role === 'GERANT' && storeCode) {
        // Équipe (public.store_employees)
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

        // Règlements d'abonnement du gérant
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
    } finally {
      setStoreLoading(false);
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData?.store_id) {
      fetchStoreAndTeam();
    }
  }, [profileData, fetchStoreAndTeam]);

  // 4. Devis de l'Edge Function create-checkout pour l'ajout de places
  // Contrat : body { quote: true } ; extend = { available, months_remaining, unit_price, max_seats, period_end }
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

  // Devis demandé à l'ouverture de l'onglet Abonnement (seulement si le paiement est ouvert)
  useEffect(() => {
    if (PAYMENTS_ENABLED && subscription?.status === 'active' && !isEmployee && activeTab === 'subscription') {
      fetchExtendQuote();
    }
  }, [subscription?.status, isEmployee, activeTab, fetchExtendQuote]);

  // Paiement de l'extension selon le contrat serveur : body { extend: { seats: N } }
  const handleExtendCheckout = async () => {
    if (!PAYMENTS_ENABLED) return;
    if (!user || isEmployee) return;
    if (subscription?.status !== 'active') return;

    setExtendCheckoutLoading(true);
    setExtendCheckoutError(null);

    // Nombre actuel de places payées, pour confirmer l'ajout sur la page de retour
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

  const inviteLink = storeData?.invite_code ? `${SITE_URL}/join?code=${encodeURIComponent(storeData.invite_code)}` : '';

  const handleCopy = async (what: 'code' | 'link') => {
    const value = what === 'code' ? storeData?.invite_code : inviteLink;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(null), 2500);
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
        redirectTo: window.location.origin + '/reset-password',
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
        fetchStoreAndTeam();
      }
    }
  };

  const displayedFullName =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : metadata.full_name || user?.email?.split('@')[0] || 'Commerçant';

  // Dates et places
  // En période de grâce, la date utile est la fin de la grâce (access_until) ; sinon la fin de période ou d'essai
  const endDate =
    subscription?.status === 'grace'
      ? subscription?.access_until || subscription?.current_period_end
      : subscription?.current_period_end || subscription?.access_until || subscription?.trial_ends_at;
  const daysRemaining = calculateDaysRemaining(endDate);
  const paidSeatsCount = subscription?.paid_seats ?? 0;
  const usedSeatsCount = employees.length > 0 ? employees.length : subscription?.employee_count ?? 0;
  const statusKey = subscription?.status || (profileData?.store_id ? 'no_subscription' : 'no_store');
  const statusInfo = STATUS_LABEL[statusKey] || STATUS_LABEL.no_subscription;

  // Alertes : uniquement l'abonnement et les places (aucune donnée de vente ni de stock)
  const notifications = useMemo(() => {
    const list: Array<{ id: string; level: 'critical' | 'warning' | 'info'; title: string; description: string; targetTab?: TabId; actionLabel?: string }> = [];
    if (!isEmployee && subscription) {
      const target = subscription.current_period_end || subscription.access_until || subscription.trial_ends_at;
      const daysLeft = calculateDaysRemaining(target);
      if (subscription.status === 'grace') {
        list.push({
          id: 'sub_grace',
          level: 'critical',
          title: 'Abonnement en période de grâce',
          description: "L'échéance est passée. Après la période de grâce, QASH passe en lecture seule jusqu'au renouvellement.",
          targetTab: 'subscription',
          actionLabel: "Voir l'abonnement",
        });
      } else if (subscription.status === 'expired') {
        list.push({
          id: 'sub_expired',
          level: 'critical',
          title: 'Abonnement expiré',
          description: 'QASH est en lecture seule. Vos données sont conservées : tout revient dès le renouvellement.',
          targetTab: 'subscription',
          actionLabel: "Voir l'abonnement",
        });
      } else if (subscription.status === 'active' && daysLeft <= 5) {
        list.push({
          id: 'sub_expiring',
          level: 'warning',
          title: `Échéance dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`,
          description: `Votre période active se termine le ${formatDateFr(subscription.current_period_end)}.`,
          targetTab: 'subscription',
          actionLabel: "Voir l'abonnement",
        });
      } else if (subscription.status === 'trial' && daysLeft <= 1) {
        list.push({
          id: 'trial_ending',
          level: 'warning',
          title: "Fin de l'essai gratuit",
          description: `Votre essai se termine le ${formatDateFr(target)}.`,
          targetTab: 'subscription',
          actionLabel: "Voir l'abonnement",
        });
      }
    }
    if (!isEmployee && subscription && typeof subscription.paid_seats === 'number') {
      const paid = subscription.paid_seats || 0;
      const used = employees.length;
      if (paid > 0 && used >= paid) {
        list.push({
          id: 'seats_full',
          level: 'info',
          title: `Toutes les places sont occupées (${used} / ${paid})`,
          description: 'Pour ajouter un employé, ajoutez une place depuis l’onglet Abonnement.',
          targetTab: 'subscription',
          actionLabel: 'Ajouter des places',
        });
      }
    }
    return list;
  }, [subscription, isEmployee, employees.length]);

  const availableTabs = isEmployee ? EMPLOYEE_TABS : GERANT_TABS;

  // Navigation clavier dans la liste d'onglets
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (index + 1) % availableTabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (index - 1 + availableTabs.length) % availableTabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = availableTabs.length - 1;
    else return;
    e.preventDefault();
    handleSelectTab(availableTabs[nextIndex].id);
    document.getElementById(`tab-btn-${availableTabs[nextIndex].id}`)?.focus();
  };

  // Ajout de places : montants fournis par le serveur
  const extendInfo = extendQuote?.extend || null;
  const extendUnitPrice = typeof extendInfo?.unit_price === 'number' ? extendInfo.unit_price : null;
  const extendMonthsRemaining = typeof extendInfo?.months_remaining === 'number' ? extendInfo.months_remaining : null;
  const extendMaxSeats = typeof extendInfo?.max_seats === 'number' ? extendInfo.max_seats : PRICING.maxEmployees;
  const extendTotalAmount = extendUnitPrice !== null ? extendUnitPrice * seatsToAdd : null;

  const faqItems: Array<{ id: string; question: string; answer: React.ReactNode }> = [
    {
      id: 'essai',
      question: "Comment fonctionne l'essai gratuit de 3 jours ?",
      answer:
        "À la création de votre boutique, vous bénéficiez d'un essai gratuit de 3 jours pour découvrir QASH. Pendant l'essai, vos employés peuvent rejoindre votre boutique sans limite de places. L'ajout de places supplémentaires devient possible après le premier paiement.",
    },
    {
      id: 'payer',
      question: 'Comment payer mon abonnement ?',
      answer: PAYMENTS_ENABLED ? (
        <>
          Sur ce site, depuis la page{' '}
          <AppLink to="/pricing" className={linkCls}>
            Payer mon abonnement
          </AppLink>
          . Le montant est calculé par le serveur. Seul le gérant de la boutique peut payer.
        </>
      ) : (
        <>
          Le paiement en ligne de l&apos;abonnement arrive bientôt sur ce site. Pour toute question,{' '}
          <AppLink to="/contact" className={linkCls}>
            contactez-nous
          </AppLink>
          .
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
      question: 'Comment ajouter un employé ?',
      answer: "Communiquez votre code d'invitation (onglet Équipe) à votre collaborateur : il le saisit dans l'application QASH, en choisissant Employé. Après le premier paiement, chaque employé occupe une place payée ; le gérant peut en ajouter depuis l'onglet Abonnement tant que l'abonnement est actif.",
    },
    {
      id: 'expiration',
      question: "Que se passe-t-il quand l'abonnement expire ?",
      answer: `Après la période de grâce de ${PRICING.graceDays} jours, QASH passe en lecture seule tant que l'abonnement n'est pas renouvelé. Vos données sont conservées et tout revient dès le renouvellement.`,
    },
    {
      id: 'hors-ligne',
      question: 'Puis-je vendre sans connexion internet ?',
      answer: "Oui, l'application enregistre vos ventes sur le téléphone. Elles sont synchronisées automatiquement dès que vous êtes connecté à internet. Utilisez « Actualiser » sur cette page pour recharger votre abonnement et votre équipe.",
    },
    {
      id: 'suppression',
      question: 'Comment supprimer mon compte ?',
      answer: (
        <>
          La demande se fait depuis la page{' '}
          <AppLink to="/suppression-compte" className={linkCls}>
            Supprimer mon compte
          </AppLink>
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
          <a href={mailtoLink() ?? undefined} className={linkCls}>
            {CONTACT_EMAIL}
          </a>{' '}
          ou passez par la page{' '}
          <AppLink to="/contact" className={linkCls}>
            Contact
          </AppLink>
          .
        </>
      ),
    },
  ];

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const busy = profileLoading || subscriptionLoading || storeLoading || employeesLoading;

  // Action « Activer / Renouveler » : uniquement si le paiement en ligne est ouvert
  const renewAction = isEmployee ? (
    <p className="text-lg font-semibold">L&apos;abonnement est géré par votre gérant.</p>
  ) : PAYMENTS_ENABLED ? (
    <ButtonLink to="/pricing" size="lg">
      {subscription?.status === 'active' ? 'Renouveler' : 'Activer mon abonnement'}
    </ButtonLink>
  ) : (
    <p className="text-lg font-semibold">Paiement en ligne bientôt disponible.</p>
  );

  return (
    <div className="bg-field pb-24">
      {/* En-tête de Mon espace */}
      <div className="bg-white">
        <Container className="pb-8 pt-10 sm:pt-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-lg font-semibold">Mon espace{storeData?.name ? ` · ${storeData.name}` : ''}</p>
              <h1 className="mt-2 break-words text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] font-black leading-[1] tracking-tight">
                Bonjour, {displayedFullName}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectTab('overview')}
                aria-label={notifications.length > 0 ? `Alertes : ${notifications.length} à voir dans la vue d'ensemble` : "Alertes : aucune, ouvrir la vue d'ensemble"}
                className="relative flex h-12 w-12 items-center justify-center rounded-full bg-field transition-colors hover:bg-field-strong"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {notifications.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-red px-1.5 text-sm font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>
              <Button variant="quiet" onClick={handleRefreshAll} disabled={busy}>
                <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
                Actualiser
              </Button>
              <Button variant="quiet" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Se déconnecter
              </Button>
            </div>
          </div>

          {/* Onglets */}
          <div role="tablist" aria-label="Sections de Mon espace" className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {availableTabs.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleSelectTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={`flex min-h-12 shrink-0 items-center whitespace-nowrap rounded-full px-5 text-base font-bold transition-colors ${
                    isActive ? 'bg-ink text-white' : 'bg-field text-ink hover:bg-field-strong'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Container>
      </div>

      <Container className="pt-8">
        {/* VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-btn-overview" className="space-y-4">
            <Panel>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-title font-black">Abonnement</h2>
                  {subscriptionLoading ? (
                    <div className="mt-4 h-10 w-56 animate-pulse rounded-full bg-field" />
                  ) : subscriptionError ? (
                    <div className="mt-4">
                      <Notice kind="error">{subscriptionError}</Notice>
                    </div>
                  ) : (
                    <p className={`mt-4 inline-flex rounded-full px-4 py-2 text-xl font-black ${statusInfo.tone}`}>{statusInfo.label}</p>
                  )}
                </div>
                <div className="lg:text-right">{renewAction}</div>
              </div>
              <dl className={`mt-8 grid gap-4 ${isEmployee ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                <Stat label={subscription?.status === 'grace' ? 'Fin de la grâce' : 'Échéance'} value={endDate ? formatDateFr(endDate) : '—'} />
                <Stat
                  label="Jours restants"
                  value={endDate ? (daysRemaining > 0 ? `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}` : '0 jour') : '—'}
                />
                {!isEmployee && (
                  <Stat label="Places employés" value={`${usedSeatsCount} utilisée${usedSeatsCount > 1 ? 's' : ''} / ${paidSeatsCount} payée${paidSeatsCount > 1 ? 's' : ''}`} />
                )}
              </dl>
              <p className="mt-6 text-base text-muted">Statut et dates fournis par le serveur.</p>
            </Panel>

            <Panel>
              <h2 className="text-title font-black">Alertes</h2>
              {notifications.length === 0 ? (
                <p className="mt-4 text-lg">Rien à signaler : abonnement et places en ordre.</p>
              ) : (
                <ul className="mt-6 space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between ${
                        n.level === 'critical' ? 'bg-danger-soft' : n.level === 'warning' ? 'bg-warning-soft' : 'bg-field'
                      }`}
                    >
                      <div>
                        <p className="text-lg font-bold">{n.title}</p>
                        <p className="mt-1 text-base leading-relaxed">{n.description}</p>
                      </div>
                      {n.targetTab && n.actionLabel && (
                        <Button variant="dark" onClick={() => handleSelectTab(n.targetTab!)} className="shrink-0 self-start sm:self-center">
                          {n.actionLabel}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(isEmployee
                ? [
                    { id: 'store_profile' as TabId, title: 'Boutique et profil', text: 'Les informations de votre boutique et de votre compte.' },
                    { id: 'settings_help' as TabId, title: 'Paramètres et aide', text: 'Mot de passe, questions fréquentes et contact.' },
                  ]
                : [
                    { id: 'subscription' as TabId, title: 'Abonnement', text: 'Statut, places employés et règlements.' },
                    { id: 'team' as TabId, title: 'Équipe', text: "Code d'invitation et employés rattachés." },
                    { id: 'settings_help' as TabId, title: 'Paramètres et aide', text: 'Mot de passe, questions fréquentes et contact.' },
                  ]
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectTab(s.id)}
                  className="group flex min-h-12 items-center justify-between gap-4 rounded-[2rem] bg-white p-6 text-left transition-colors hover:bg-field-strong"
                >
                  <span>
                    <span className="block text-xl font-black">{s.title}</span>
                    <span className="mt-1 block text-base">{s.text}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              ))}
            </div>

            <p className="pt-2 text-base">
              Vos ventes, votre stock et votre bénéfice se consultent dans l&apos;application QASH.
            </p>
          </div>
        )}

        {/* ABONNEMENT (GÉRANT) */}
        {activeTab === 'subscription' && !isEmployee && (
          <div role="tabpanel" id="tabpanel-subscription" aria-labelledby="tab-btn-subscription" className="space-y-4">
            <Panel>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-title font-black">Abonnement QASH</h2>
                  {!subscriptionLoading && !subscriptionError && (
                    <p className={`mt-4 inline-flex rounded-full px-4 py-2 text-xl font-black ${statusInfo.tone}`}>{statusInfo.label}</p>
                  )}
                </div>
                <div className="lg:text-right">{renewAction}</div>
              </div>

              {subscriptionLoading ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="h-24 animate-pulse rounded-3xl bg-field" />
                  <div className="h-24 animate-pulse rounded-3xl bg-field" />
                  <div className="h-24 animate-pulse rounded-3xl bg-field" />
                </div>
              ) : subscriptionError ? (
                <div className="mt-6">
                  <Notice kind="error">Information d&apos;abonnement non disponible : {subscriptionError}</Notice>
                </div>
              ) : (
                <>
                  <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                    <Stat
                      label="Échéance"
                      value={endDate ? formatDateFr(endDate) : 'Aucune date'}
                      note={
                        subscription?.status === 'active'
                          ? 'Fin de la période payée'
                          : subscription?.status === 'trial'
                          ? "Fin de l'essai"
                          : subscription?.status === 'grace'
                          ? 'Fin de la période de grâce'
                          : undefined
                      }
                    />
                    <Stat label="Jours restants" value={endDate ? `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}` : '—'} />
                    <Stat label="Places employés" value={`${paidSeatsCount} payée${paidSeatsCount > 1 ? 's' : ''}`} note={`${usedSeatsCount} utilisée${usedSeatsCount > 1 ? 's' : ''}`} />
                  </dl>
                  <p className="mt-6 max-w-[48rem] text-lg leading-relaxed">
                    {nb(
                      `Chaque paiement prolonge l'abonnement de 1 mois ou de 12 mois à partir de la date de fin. C'est une période calendaire fixée par le serveur : les jours s'écoulent même si l'application n'est pas utilisée. Après l'échéance, ${PRICING.graceDays} jours de grâce, puis lecture seule (vos données restent conservées).`
                    )}
                  </p>
                </>
              )}
            </Panel>

            {/* Ajout de places employés */}
            <Panel>
              <h2 className="text-title font-black">Ajouter des places employés</h2>
              <p className="mt-3 max-w-[44rem] text-lg leading-relaxed">
                Une place par employé qui encaisse avec son propre accès. Places actuelles : {paidSeatsCount} payée
                {paidSeatsCount > 1 ? 's' : ''}, {usedSeatsCount} occupée{usedSeatsCount > 1 ? 's' : ''}.
              </p>

              {subscription?.status === 'trial' ? (
                <div className="mt-6">
                  <Notice kind="info">
                    Pendant l&apos;essai, vos employés peuvent rejoindre votre boutique sans limite de places. L&apos;ajout de
                    places supplémentaires devient possible après le premier paiement.
                  </Notice>
                </div>
              ) : subscription?.status !== 'active' ? (
                <div className="mt-6">
                  <Notice kind="info">Votre abonnement doit être actif pour ajouter des places employés.</Notice>
                </div>
              ) : !PAYMENTS_ENABLED ? (
                <div className="mt-6">
                  <Notice kind="info">Paiement en ligne bientôt disponible : l&apos;ajout de places se fera ici.</Notice>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSeatsToAdd((prev) => Math.max(1, prev - 1))}
                      disabled={seatsToAdd <= 1 || extendCheckoutLoading}
                      aria-label="Une place de moins"
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-field disabled:opacity-40"
                    >
                      <Minus className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <span className="min-w-16 text-center text-3xl font-black" aria-live="polite">
                      +{seatsToAdd}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSeatsToAdd((prev) => Math.min(extendMaxSeats, prev + 1))}
                      disabled={seatsToAdd >= extendMaxSeats || extendCheckoutLoading}
                      aria-label="Une place de plus"
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-field disabled:opacity-40"
                    >
                      <Plus className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="rounded-3xl bg-field p-5">
                    <p className="text-base font-bold">Montant calculé par le serveur</p>
                    {extendQuoteLoading ? (
                      <p className="mt-2 flex items-center gap-2 text-lg">
                        <Spinner /> Calcul en cours…
                      </p>
                    ) : extendTotalAmount !== null ? (
                      <p className="mt-2 text-3xl font-black">{formatFcfa(extendTotalAmount)}</p>
                    ) : extendQuoteError ? (
                      <p className="mt-2 text-lg">{extendQuoteError}</p>
                    ) : (
                      <p className="mt-2 text-lg">Calculé à la confirmation.</p>
                    )}
                    {extendUnitPrice !== null && extendMonthsRemaining !== null && (
                      <p className="mt-2 text-base">
                        {formatFcfa(extendUnitPrice)} par place, pour {extendMonthsRemaining} mois restant
                        {extendMonthsRemaining > 1 ? 's' : ''}.
                      </p>
                    )}
                  </div>

                  {extendCheckoutError && <Notice kind="error">{extendCheckoutError}</Notice>}

                  <Button size="lg" onClick={handleExtendCheckout} disabled={extendCheckoutLoading || extendQuoteLoading}>
                    {extendCheckoutLoading ? (
                      <>
                        <Spinner /> Ouverture du paiement…
                      </>
                    ) : (
                      `Payer ${seatsToAdd} place${seatsToAdd > 1 ? 's' : ''}`
                    )}
                  </Button>
                </div>
              )}
            </Panel>

            {/* Historique des règlements */}
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-title font-black">Historique des règlements</h2>
                <p className="text-base font-semibold">
                  {payments.length} règlement{payments.length > 1 ? 's' : ''}
                </p>
              </div>
              {paymentsLoading ? (
                <p className="mt-6 flex items-center gap-2 text-lg">
                  <Spinner /> Chargement des règlements…
                </p>
              ) : paymentsError ? (
                <div className="mt-6">
                  <Notice kind="error">Impossible de charger l&apos;historique des règlements : {paymentsError}</Notice>
                </div>
              ) : payments.length === 0 ? (
                <p className="mt-6 text-lg">Aucun règlement enregistré pour le moment.</p>
              ) : (
                <ul className="mt-6 space-y-2">
                  {payments.map((p) => {
                    const isCompleted = p.status?.toLowerCase() === 'complete' || p.status?.toLowerCase() === 'completed';
                    const isExtend = p.kind === 'extend';
                    return (
                      <li key={p.id} className="flex flex-col gap-2 rounded-3xl bg-field p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-bold">
                            {isExtend
                              ? `Ajout de ${p.seats || 1} place${(p.seats || 1) > 1 ? 's' : ''}`
                              : `Renouvellement${p.period_days ? ` (${Math.round(p.period_days / 30)} mois)` : ''}`}
                          </p>
                          <p className="text-base">
                            {new Date(p.created_at).toLocaleDateString('fr-FR', {
                              timeZone: 'Africa/Dakar',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xl font-black">{formatFcfa(Number(p.amount))}</p>
                          <p className={`text-base font-semibold ${isCompleted ? 'text-success' : ''}`}>{isCompleted ? 'Confirmé' : p.status}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-6 text-base text-muted">Seuls les règlements confirmés par le serveur de paiement sont comptabilisés.</p>
            </Panel>
          </div>
        )}

        {/* ÉQUIPE (GÉRANT) */}
        {activeTab === 'team' && !isEmployee && (
          <div role="tabpanel" id="tabpanel-team" aria-labelledby="tab-btn-team" className="space-y-4">
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-title font-black">Code d&apos;invitation</h2>
                <p className="text-lg font-semibold">
                  Places : {usedSeatsCount} / {paidSeatsCount}
                </p>
              </div>
              <p className="mt-3 max-w-[44rem] text-lg leading-relaxed">
                Vos employés saisissent ce code dans l&apos;application QASH, en choisissant Employé, pour rejoindre votre
                boutique.
              </p>
              <div className="mt-6 rounded-3xl bg-brand-yellow p-6 sm:p-8">
                <p className="break-all text-[clamp(2rem,1.5rem+2vw,3rem)] font-black leading-none tracking-wider">
                  {storeData?.invite_code || (storeLoading ? '…' : 'Aucun code disponible')}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="dark" onClick={() => handleCopy('code')} disabled={!storeData?.invite_code}>
                    {copied === 'code' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied === 'code' ? 'Code copié' : 'Copier le code'}
                  </Button>
                  <Button variant="light" onClick={() => handleCopy('link')} disabled={!inviteLink}>
                    {copied === 'link' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied === 'link' ? 'Lien copié' : "Copier le lien d'invitation"}
                  </Button>
                </div>
              </div>
              {usedSeatsCount >= paidSeatsCount && paidSeatsCount > 0 && (
                <div className="mt-6">
                  <Notice kind="info">
                    Toutes vos places payées sont occupées. Pour un nouvel employé, ajoutez une place depuis l&apos;onglet{' '}
                    <button type="button" onClick={() => handleSelectTab('subscription')} className={linkCls}>
                      Abonnement
                    </button>
                    .
                  </Notice>
                </div>
              )}
            </Panel>

            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-title font-black">Employés rattachés</h2>
                <p className="text-base font-semibold">
                  {employees.length} employé{employees.length > 1 ? 's' : ''}
                </p>
              </div>
              {employeesLoading ? (
                <p className="mt-6 flex items-center gap-2 text-lg">
                  <Spinner /> Chargement de l&apos;équipe…
                </p>
              ) : employeesError ? (
                <div className="mt-6">
                  <Notice kind="error">{employeesError}</Notice>
                </div>
              ) : employees.length === 0 ? (
                <p className="mt-6 text-lg">
                  Aucun employé rattaché pour l&apos;instant. Donnez votre code d&apos;invitation à vos collaborateurs.
                </p>
              ) : (
                <ul className="mt-6 space-y-2">
                  {employees.map((emp) => (
                    <li key={emp.id} className="flex items-center justify-between gap-4 rounded-3xl bg-field p-5">
                      <div className="flex min-w-0 items-center gap-4">
                        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-lg font-black text-white">
                          {emp.employee_name ? emp.employee_name.charAt(0).toUpperCase() : 'E'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-lg font-bold">{emp.employee_name || 'Employé'}</p>
                          <p className="text-base">Ajouté le {formatDateFr(emp.created_at) || '—'}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-base font-semibold capitalize">{emp.role || 'Employé'}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-6 text-base text-muted">Les accès des employés se gèrent dans l&apos;application QASH du gérant.</p>
            </Panel>
          </div>
        )}

        {/* BOUTIQUE ET PROFIL */}
        {activeTab === 'store_profile' && (
          <div role="tabpanel" id="tabpanel-store_profile" aria-labelledby="tab-btn-store_profile" className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <h2 className="text-title font-black">Ma boutique</h2>
              {storeLoading ? (
                <div className="mt-6 space-y-3">
                  <div className="h-10 animate-pulse rounded-2xl bg-field" />
                  <div className="h-10 animate-pulse rounded-2xl bg-field" />
                </div>
              ) : storeError ? (
                <div className="mt-6">
                  <Notice kind="error">{storeError}</Notice>
                </div>
              ) : storeData ? (
                <dl className="mt-6 space-y-1">
                  <Row label="Nom" value={storeData.name || 'Non renseigné'} />
                  <Row label="Activité" value={formatBusinessTypeFrench(storeData.business_type)} />
                  <Row label="Lieu" value={storeData.location || 'Non renseigné'} />
                  <Row label="Code d'invitation" value={storeData.invite_code || '—'} />
                </dl>
              ) : (
                <p className="mt-6 text-lg">Aucune boutique liée à ce compte. Créez-la dans l&apos;application QASH.</p>
              )}
              <p className="mt-6 text-base text-muted">Pour modifier ces informations, passez par l&apos;application QASH.</p>
            </Panel>
            <Panel>
              <h2 className="text-title font-black">Mon profil</h2>
              {profileLoading ? (
                <div className="mt-6 space-y-3">
                  <div className="h-10 animate-pulse rounded-2xl bg-field" />
                  <div className="h-10 animate-pulse rounded-2xl bg-field" />
                </div>
              ) : profileError ? (
                <div className="mt-6">
                  <Notice kind="error">{profileError}</Notice>
                </div>
              ) : (
                <dl className="mt-6 space-y-1">
                  <Row label="Prénom" value={firstName || 'Non renseigné'} />
                  <Row label="Nom" value={lastName || 'Non renseigné'} />
                  <Row label="Téléphone" value={phone || 'Non renseigné'} />
                  <Row label="E-mail" value={user?.email || '—'} />
                  <Row label="Rôle" value={isEmployee ? 'Employé' : 'Gérant'} />
                </dl>
              )}
              <p className="mt-6 text-base text-muted">Consultation seule : aucune modification depuis le site.</p>
            </Panel>
          </div>
        )}

        {/* PARAMÈTRES ET AIDE */}
        {activeTab === 'settings_help' && (
          <div role="tabpanel" id="tabpanel-settings_help" aria-labelledby="tab-btn-settings_help" className="space-y-4">
            <Panel>
              <h2 className="text-title font-black">Sécurité du compte</h2>
              <p className="mt-3 max-w-[44rem] text-lg leading-relaxed">
                Recevez par e-mail un lien pour choisir un nouveau mot de passe ({user?.email}).
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleResetPassword} disabled={resetLoading || !user?.email}>
                  {resetLoading ? (
                    <>
                      <Spinner /> Envoi en cours…
                    </>
                  ) : (
                    'Changer mon mot de passe'
                  )}
                </Button>
                <Button variant="quiet" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Se déconnecter
                </Button>
              </div>
              <div aria-live="polite" className="mt-4">
                {resetMessage && <Notice kind="success">{resetMessage}</Notice>}
                {resetError && <Notice kind="error">{resetError}</Notice>}
              </div>
            </Panel>

            <Panel>
              <h2 className="text-title font-black">Questions fréquentes</h2>
              <div className="mt-6 space-y-2">
                {faqItems.map((item) => {
                  const isOpen = openFaqId === item.id;
                  return (
                    <div key={item.id} className="rounded-3xl bg-field">
                      <h3>
                        <button
                          type="button"
                          id={`faq-btn-${item.id}`}
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${item.id}`}
                          onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                          className="flex min-h-14 w-full items-center justify-between gap-4 rounded-3xl px-5 py-4 text-left text-lg font-bold"
                        >
                          <span>{nb(item.question)}</span>
                          <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>
                      </h3>
                      <div id={`faq-panel-${item.id}`} role="region" aria-labelledby={`faq-btn-${item.id}`} hidden={!isOpen} className="px-5 pb-5 text-lg leading-relaxed">
                        {typeof item.answer === 'string' ? nb(item.answer) : item.answer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-title font-black">Besoin d&apos;aide&nbsp;?</h2>
                  <p className="mt-2 text-lg">WhatsApp ou e-mail : toutes nos coordonnées sont sur la page Contact.</p>
                </div>
                <ButtonLink to="/contact" variant="dark">
                  Nous contacter
                </ButtonLink>
              </div>
            </Panel>
          </div>
        )}
      </Container>
    </div>
  );
};

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="rounded-[2rem] bg-white p-6 sm:p-8">{children}</section>
);

const Stat: React.FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <div className="rounded-3xl bg-field p-5">
    <dt className="text-base font-semibold">{label}</dt>
    <dd className="mt-1 text-xl font-black">{value}</dd>
    {note && <dd className="mt-1 text-base">{note}</dd>}
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-2xl px-1 py-3">
    <dt className="text-lg">{label}</dt>
    <dd className="break-all text-right text-lg font-bold">{value}</dd>
  </div>
);
