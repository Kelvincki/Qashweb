import React, { useState, useEffect, useCallback } from 'react';
import { 
  Check, 
  ChevronDown, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Sparkles, 
  Store, 
  Users, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  LogOut,
  ExternalLink,
  Crown
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  PageRoute, 
  FaqItem, 
  MySubscriptionData, 
  CheckoutQuote, 
  CheckoutQuotePlan 
} from '../types';

interface PricingPageProps {
  onNavigate?: (route: PageRoute) => void;
  onOpenStartModal: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ 
  onNavigate, 
  onOpenStartModal 
}) => {
  const { user, loading: authLoading, signOut } = useAuth();

  // Subscription state
  const [subscription, setSubscription] = useState<MySubscriptionData | null>(null);
  const [subLoading, setSubLoading] = useState<boolean>(false);
  const [subError, setSubError] = useState<string | null>(null);

  // Quote state
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Selected plan: '1m' or '12m'
  const [selectedPlanKey, setSelectedPlanKey] = useState<'1m' | '12m'>('12m');

  // Checkout redirect loading & error
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Helper formatting for FCFA: "12 000 FCFA" (no decimals, space thousand separator)
  const formatPrice = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0 FCFA';
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  };

  // Helper format date in French
  const formatDateFr = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // 1. Fetch Subscription status via RPC get_my_subscription
  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    setSubLoading(true);
    setSubError(null);

    try {
      const { data, error } = await supabase.rpc('get_my_subscription');
      if (error) {
        console.warn('Erreur RPC get_my_subscription:', error);
        setSubError(error.message || 'Impossible de charger l\'état de votre abonnement.');
      } else {
        setSubscription(data as MySubscriptionData);
      }
    } catch (err: any) {
      console.warn('Exception RPC get_my_subscription:', err);
      setSubError(err?.message || 'Erreur de connexion réseau.');
    } finally {
      setSubLoading(false);
    }
  }, [user]);

  // 2. Fetch Quote via Edge function create-checkout { quote: true }
  const fetchQuote = useCallback(async () => {
    if (!user) return;
    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { quote: true }
      });

      if (error) {
        console.warn('Erreur Edge Function create-checkout (quote):', error);
        setQuoteError(error.message || 'Impossible d\'obtenir le calcul du tarif personnalisé.');
      } else if (data) {
        setQuote(data as CheckoutQuote);
        // Default selected plan if available
        if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
          const has12m = data.plans.some((p: CheckoutQuotePlan) => p.key === '12m');
          if (has12m) {
            setSelectedPlanKey('12m');
          } else {
            setSelectedPlanKey(data.plans[0].key as '1m' | '12m');
          }
        }
      }
    } catch (err: any) {
      console.warn('Exception Edge Function create-checkout (quote):', err);
      setQuoteError(err?.message || 'Erreur lors du calcul du montant.');
    } finally {
      setQuoteLoading(false);
    }
  }, [user]);

  // Fetch when user is available or changed
  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchQuote();
    } else {
      setSubscription(null);
      setQuote(null);
    }
  }, [user, fetchSubscription, fetchQuote]);

  // Handle Checkout payment initiation
  const handleCheckout = async (planKey: '1m' | '12m') => {
    if (!user) {
      if (onNavigate) {
        onNavigate('/login');
      }
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planKey }
      });

      if (error) {
        console.error('Erreur create-checkout invoke:', error);
        setCheckoutError(error.message || 'Une erreur est survenue lors de l\'initialisation du paiement.');
        setCheckoutLoading(false);
        return;
      }

      if (data?.checkout_url) {
        // Redirection vers l'interface de paiement sécurisée
        window.location.href = data.checkout_url;
      } else {
        setCheckoutError('L\'adresse de paiement n\'a pas pu être générée. Veuillez réessayer.');
        setCheckoutLoading(false);
      }
    } catch (err: any) {
      console.error('Exception create-checkout:', err);
      setCheckoutError(err?.message || 'Erreur lors de la redirection vers le paiement.');
      setCheckoutLoading(false);
    }
  };

  // Included features list
  const includedFeatures = [
    'Caisse enregistreuse tactile & fluide',
    'Gestion des ventes & traçabilité',
    'Gestion du catalogue produits',
    'Gestion des stocks & alertes de seuil',
    'Scan de factures par Intelligence Artificielle',
    'Scan du panier IA pour encaissement rapide',
    'Bilan financier, marges & performances',
    'Gestion des comptes employés sécurisée',
    'Architecture 100% Offline-first',
    'Synchronisation cloud automatique',
  ];

  // Factual FAQ items
  const faqItems: FaqItem[] = [
    {
      question: 'Comment fonctionne la tarification ?',
      answer:
        'La tarification QASH comprend un forfait de base de 5 000 FCFA par mois pour le compte gérant, auquel s’ajoute 3 500 FCFA par mois pour chaque compte employé actif dans votre boutique. En choisissant l\'engagement annuel (12 mois), vous bénéficiez d\'une remise immédiate de 5 000 FCFA.',
    },
    {
      question: 'Combien coûte un employé supplémentaire ?',
      answer:
        'Chaque compte employé supplémentaire est facturé 3 500 FCFA par mois. Les employés disposent de leur propre identifiant sécurisé sur leur téléphone pour encaisser au comptoir, sans accès aux données sensibles.',
    },
    {
      question: 'Comment renouveler mon abonnement ?',
      answer:
        'Connectez-vous simplement à cette page depuis votre compte gérant, sélectionnez votre formule (1 mois ou 12 mois) et validez le paiement mobile money (Orange Money, Wave, etc.) en toute sécurité. Dès validation, votre application QASH se met à jour automatiquement.',
    },
    {
      question: 'Puis-je changer d\'équipe ou ajouter des employés plus tard ?',
      answer:
        'Oui. Vous pouvez ajouter des collaborateurs à tout moment depuis l\'application QASH. Le montant du renouvellement s\'ajuste automatiquement selon le nombre d\'employés actifs.',
    },
    {
      question: 'QASH fonctionne-t-il sans connexion Internet ?',
      answer:
        'Oui. Grâce à l’architecture Offline-first de QASH, vous continuez à enregistrer vos ventes même sans réseau ni électricité au comptoir. Dès que la connexion revient, les données sont synchronisées automatiquement avec le cloud.',
    },
  ];

  // Helper for status badge rendering
  const renderStatusBadge = () => {
    if (!subscription) return null;

    const st = subscription.status;

    if (st === 'trial') {
      const dateText = subscription.trial_ends_at || subscription.access_until;
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-50/90 border border-amber-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-base">Période d&apos;essai gratuit</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900">
                  Essai actif
                </span>
              </div>
              <p className="text-sm text-neutral-700 mt-1">
                Votre essai gratuit se termine le{' '}
                <strong className="text-neutral-900 font-semibold">{formatDateFr(dateText)}</strong>.
                Activez votre abonnement pour ne subir aucune interruption.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('plans-selection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="self-start sm:self-center shrink-0 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
          >
            S&apos;abonner maintenant
          </button>
        </div>
      );
    }

    if (st === 'active') {
      const dateText = subscription.current_period_end || subscription.access_until;
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-base">Abonnement actif</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900">
                  Actif
                </span>
              </div>
              <p className="text-sm text-neutral-700 mt-1">
                Votre abonnement est valide jusqu&apos;au{' '}
                <strong className="text-neutral-900 font-semibold">{formatDateFr(dateText)}</strong>.
                Vous pouvez prolonger ou renouveler votre formule dès maintenant.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('plans-selection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="self-start sm:self-center shrink-0 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
          >
            Prolonger l&apos;abonnement
          </button>
        </div>
      );
    }

    if (st === 'grace') {
      const dateText = subscription.access_until;
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-orange-50/90 border border-orange-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-base">Période de grâce</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-200 text-orange-900">
                  À renouveler
                </span>
              </div>
              <p className="text-sm text-neutral-700 mt-1">
                Votre abonnement a expiré. Vous bénéficiez d&apos;un accès temporaire de grâce jusqu&apos;au{' '}
                <strong className="text-neutral-900 font-semibold">{formatDateFr(dateText)}</strong>.
                Renouvelez pour maintenir la synchronisation cloud.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('plans-selection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="self-start sm:self-center shrink-0 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
          >
            Renouveler d&apos;urgence
          </button>
        </div>
      );
    }

    if (st === 'expired') {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-rose-50/90 border border-rose-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-base">Abonnement expiré</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-200 text-rose-900">
                  Expiré
                </span>
              </div>
              <p className="text-sm text-neutral-700 mt-1">
                Votre abonnement QASH est arrivé à terme. Réactivez votre compte pour continuer à synchroniser vos ventes.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('plans-selection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="self-start sm:self-center shrink-0 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
          >
            Réactiver maintenant
          </button>
        </div>
      );
    }

    if (st === 'no_store') {
      return (
        <div className="p-5 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-700 text-sm">
          <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1">
            <Store className="w-4 h-4 text-neutral-500" />
            <span>Aucune boutique associée</span>
          </div>
          <p>
            Votre profil n&apos;est pas encore lié à une boutique. Créez d&apos;abord votre commerce sur l&apos;application Android QASH pour activer un abonnement.
          </p>
        </div>
      );
    }

    return null;
  };

  // Render plans from quote if available, or fallbacks
  const plan1m = quote?.plans?.find((p) => p.key === '1m');
  const plan12m = quote?.plans?.find((p) => p.key === '12m');

  const selectedPlan = selectedPlanKey === '1m' ? plan1m : plan12m;

  return (
    <div className="py-12 sm:py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-qash-red-50 text-qash-red-600 mb-4 border border-qash-red-100">
            <span className="text-xs font-bold uppercase tracking-wider">Abonnement & Paiement direct</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Des tarifs simples et transparents.
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Activez ou renouvelez votre abonnement QASH en toute sécurité par Mobile Money.
          </p>
        </div>

        {/* User Status / Auth Banner */}
        {user ? (
          <div className="max-w-4xl mx-auto mb-12 space-y-4">
            {/* Header user identity */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base shrink-0">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'G'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-neutral-900 text-sm sm:text-base">
                      {user.email}
                    </span>
                    {subscription?.role && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-700 capitalize border border-neutral-200/80">
                        {subscription.role}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-3">
                    {subscription?.store_name && (
                      <span className="flex items-center gap-1 font-medium text-neutral-700">
                        <Store className="w-3.5 h-3.5 text-neutral-400" />
                        {subscription.store_name}
                      </span>
                    )}
                    {typeof subscription?.employee_count === 'number' && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        {subscription.employee_count} employé{subscription.employee_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => {
                    fetchSubscription();
                    fetchQuote();
                  }}
                  disabled={subLoading || quoteLoading}
                  className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  title="Actualiser"
                  aria-label="Actualiser les informations"
                >
                  <RefreshCw className={`w-4 h-4 ${(subLoading || quoteLoading) ? 'animate-spin' : ''}`} />
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('/dashboard')}
                    className="px-3.5 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Mon espace
                  </button>
                )}
                <button
                  onClick={() => signOut()}
                  className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Déconnexion"
                  aria-label="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subscription status feedback */}
            {subLoading ? (
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center gap-3 text-neutral-500 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-qash-red-500" />
                <span>Vérification de l&apos;abonnement auprès de votre boutique...</span>
              </div>
            ) : subError ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{subError}</span>
                </div>
                <button
                  onClick={fetchSubscription}
                  className="text-xs font-bold underline hover:no-underline cursor-pointer"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              renderStatusBadge()
            )}
          </div>
        ) : (
          /* Non connecté : Invitation claire à se connecter */
          <div className="max-w-4xl mx-auto mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold mb-2">
                <Store className="w-3.5 h-3.5" />
                <span>Gérant de boutique QASH</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Connectez-vous pour voir le montant de votre boutique
              </h2>
              <p className="text-sm text-neutral-600 max-w-xl">
                Le montant est calculé automatiquement d&apos;après le nombre d&apos;employés enregistrés sur votre compte.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
              {onNavigate && (
                <button
                  onClick={() => onNavigate('/login')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-qash-red-500 hover:bg-qash-red-600 active:bg-qash-red-700 text-white font-semibold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onOpenStartModal}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold text-sm transition-colors cursor-pointer text-center"
              >
                Créer un compte
              </button>
            </div>
          </div>
        )}

        {/* Plan Selection Section */}
        <div id="plans-selection" className="scroll-mt-24 mb-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
              Choisissez votre durée d&apos;abonnement
            </h2>
            <p className="text-neutral-600 text-sm">
              Paiement unique, aucun prélèvement automatique, renouvellement à la demande.
            </p>
          </div>

          {/* Pricing cards: 1 mois vs 12 mois */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Formule 1 Mois */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => setSelectedPlanKey('1m')}
              className={`rounded-3xl bg-white p-7 sm:p-9 relative flex flex-col justify-between cursor-pointer border-2 transition-all duration-200 ${
                selectedPlanKey === '1m'
                  ? 'border-neutral-900 ring-4 ring-neutral-900/5 shadow-md'
                  : 'border-neutral-200/90 hover:border-neutral-300 shadow-2xs'
              }`}
            >
              {selectedPlanKey === '1m' && (
                <div className="absolute -top-3.5 left-8 px-3.5 py-0.5 bg-neutral-900 text-white font-bold text-xs rounded-full uppercase tracking-wider">
                  Sélectionné
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Flexibilité mensuelle
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                    1 mois
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-neutral-900 mb-2 font-display">
                  Formule 1 mois
                </h3>
                <p className="text-neutral-600 text-xs sm:text-sm mb-6 leading-relaxed">
                  Idéal pour tester la gestion au mois le mois sans aucun engagement long terme.
                </p>

                {/* Price Display */}
                <div className="mb-6">
                  {quoteLoading ? (
                    <div className="flex items-center gap-2 text-neutral-400 py-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Calcul du montant...</span>
                    </div>
                  ) : plan1m ? (
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
                          {formatPrice(plan1m.amount).replace(' FCFA', '')}
                        </span>
                        <span className="text-neutral-600 font-semibold text-base sm:text-lg">
                          FCFA
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Pour 1 mois complet d&apos;accès
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
                          5 000
                        </span>
                        <span className="text-neutral-600 font-semibold text-base sm:text-lg">
                          FCFA
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Base gérant (3 500 FCFA / employé actif)
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-neutral-500 pb-6 border-b border-neutral-100">
                  Renouvelable à tout moment depuis le site ou l&apos;application
                </p>
              </div>

              <div className="pt-6">
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Accès complet gérant & synchronisation</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Scan facture & Scan panier IA inclus</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Paiement unique par Wave ou Orange Money</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanKey('1m');
                    handleCheckout('1m');
                  }}
                  disabled={checkoutLoading}
                  className="mt-6 w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkoutLoading && selectedPlanKey === '1m' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ouverture du paiement...</span>
                    </>
                  ) : (
                    <>
                      <span>{user ? 'Payer 1 mois' : 'Choisir 1 mois'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Formule 12 Mois (Recommandée avec remise) */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => setSelectedPlanKey('12m')}
              className={`rounded-3xl bg-white p-7 sm:p-9 relative flex flex-col justify-between cursor-pointer border-2 transition-all duration-200 ${
                selectedPlanKey === '12m'
                  ? 'border-qash-red-500 ring-4 ring-qash-red-500/5 shadow-md'
                  : 'border-neutral-200/90 hover:border-neutral-300 shadow-2xs'
              }`}
            >
              {/* Badge Promo */}
              <div className="absolute -top-3.5 right-6 px-3.5 py-0.5 bg-qash-red-500 text-white font-bold text-xs rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <Crown className="w-3 h-3" />
                <span>Économisez 5 000 FCFA</span>
              </div>

              {selectedPlanKey === '12m' && (
                <div className="absolute -top-3.5 left-8 px-3.5 py-0.5 bg-neutral-900 text-white font-bold text-xs rounded-full uppercase tracking-wider">
                  Sélectionné
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-qash-red-600 uppercase tracking-wider">
                    Meilleure valeur
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-qash-red-50 text-qash-red-600 text-xs font-semibold border border-qash-red-100">
                    12 mois (1 an)
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-neutral-900 mb-2 font-display">
                  Formule 12 mois
                </h3>
                <p className="text-neutral-600 text-xs sm:text-sm mb-6 leading-relaxed">
                  Tranquillité totale pendant 1 an pour toute votre équipe, avec 1 mois offert.
                </p>

                {/* Price Display */}
                <div className="mb-6">
                  {quoteLoading ? (
                    <div className="flex items-center gap-2 text-neutral-400 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-qash-red-500" />
                      <span className="text-sm">Calcul du montant...</span>
                    </div>
                  ) : plan12m ? (
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
                          {formatPrice(plan12m.amount).replace(' FCFA', '')}
                        </span>
                        <span className="text-neutral-600 font-semibold text-base sm:text-lg">
                          FCFA
                        </span>
                        {plan12m.full_price && plan12m.full_price > plan12m.amount && (
                          <span className="text-sm line-through text-neutral-400 font-medium ml-1">
                            {formatPrice(plan12m.full_price)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-qash-red-600 font-semibold mt-1">
                        Remise immédiate de {formatPrice(plan12m.discount || 5000)} appliquée
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
                          55 000
                        </span>
                        <span className="text-neutral-600 font-semibold text-base sm:text-lg">
                          FCFA
                        </span>
                        <span className="text-sm line-through text-neutral-400 font-medium">
                          60 000 FCFA
                        </span>
                      </div>
                      <div className="text-xs text-qash-red-600 font-semibold mt-1">
                        Remise de 5 000 FCFA incluse
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-neutral-500 pb-6 border-b border-neutral-100">
                  Valable pour 365 jours de service ininterrompu
                </p>
              </div>

              <div className="pt-6">
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tous les modules et mises à jour inclus</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Remise équivalente au compte gérant annuel</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Aucune interruption au comptoir durant l&apos;année</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanKey('12m');
                    handleCheckout('12m');
                  }}
                  disabled={checkoutLoading}
                  className="mt-6 w-full py-3 rounded-xl bg-qash-red-500 hover:bg-qash-red-600 active:bg-qash-red-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkoutLoading && selectedPlanKey === '12m' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ouverture du paiement...</span>
                    </>
                  ) : (
                    <>
                      <span>{user ? 'Payer 12 mois (Recommandé)' : 'Choisir 12 mois'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Checkout Error Message */}
          {checkoutError && (
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Impossible de lancer le paiement</p>
                <p className="text-xs text-rose-600 mt-0.5">{checkoutError}</p>
              </div>
              <button
                onClick={() => setCheckoutError(null)}
                className="text-xs font-semibold text-rose-700 hover:underline cursor-pointer"
              >
                Fermer
              </button>
            </div>
          )}

          {/* Detailed summary for logged-in user */}
          {user && quote && (
            <div className="mt-8 p-6 rounded-3xl bg-white border border-neutral-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div>
                  <h4 className="font-bold text-neutral-900 text-base">
                    Détail du calcul pour votre boutique
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Calculé en temps réel par le serveur pour {quote.seats} utilisateur{quote.seats > 1 ? 's' : ''} (1 gérant + {quote.seats - 1} employé{quote.seats - 1 > 1 ? 's' : ''})
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs text-neutral-400 uppercase font-bold tracking-wider">
                    Total mensuel de base
                  </div>
                  <div className="text-lg font-extrabold text-neutral-900">
                    {formatPrice(quote.monthly)} <span className="text-xs font-normal text-neutral-500">/ mois</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-neutral-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Paiement sécurisé via SenePay (Orange Money & Wave)</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckout(selectedPlanKey)}
                  disabled={checkoutLoading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-qash-red-500 hover:bg-qash-red-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connexion au paiement...</span>
                    </>
                  ) : (
                    <>
                      <span>Procéder au paiement ({selectedPlan ? formatPrice(selectedPlan.amount) : ''})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Included Features Section */}
        <div className="max-w-4xl mx-auto mb-20 bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/90 shadow-2xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1 block">
              Inclus sans surcoût
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
              Toutes les fonctionnalités incluses
            </h2>
            <p className="text-neutral-600 text-sm">
              Quel que soit le plan choisi, toutes les fonctionnalités QASH sont activées sans coût additionnel caché.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {includedFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-100 text-sm font-semibold text-neutral-800"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-qash-red-500 mb-1 block">
              Questions fréquentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
              Foire aux questions
            </h2>
            <p className="text-neutral-600 text-sm">
              Des réponses claires et factuelles sur le fonctionnement des abonnements QASH.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-neutral-200 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-sm sm:text-base text-neutral-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/60 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-qash-red-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Page CTA */}
        <div className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-neutral-900 text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">
            Prêt à simplifier la gestion de votre boutique ?
          </h3>
          <p className="text-neutral-400 text-sm sm:text-base mb-6 max-w-xl mx-auto leading-relaxed">
            Rejoignez les commerçants qui gagnent du temps chaque jour grâce à la caisse intelligente QASH.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <button
                onClick={() => {
                  const el = document.getElementById('plans-selection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-qash-red-500 hover:bg-qash-red-600 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm"
              >
                <span>Choisir ma formule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenStartModal}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-qash-red-500 hover:bg-qash-red-600 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm"
                >
                  <span>Créer mon compte</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('/login')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <span>Se connecter</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
