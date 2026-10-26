import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Loader2, Store, Users, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { rememberRedirect } from '../lib/redirect';
import { PageRoute, MySubscriptionData, CheckoutQuote, CheckoutQuotePlan } from '../types';
import { Container, Section } from '../components/ui/Layout';
import { Button, ButtonLink, buttonClasses } from '../components/ui/Button';
import { PAYMENTS_ENABLED, PRICING, formatFcfa } from '../config/site';
import { AppLink } from '../lib/navigation';

interface PricingPageProps {
  onNavigate?: (route: PageRoute) => void;
}

/**
 * /pricing : paiement de l'abonnement (gérant connecté).
 * Logique inchangée : statut via get_my_subscription, montants via create-checkout { quote: true },
 * paiement via create-checkout { plan }. Les boutons de paiement n'apparaissent que si PAYMENTS_ENABLED.
 */
export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
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
  const [checkoutErrorType, setCheckoutErrorType] = useState<
    'only_owner_can_pay' | 'unauthorized' | 'payment_not_configured' | 'provider_error' | 'generic' | null
  >(null);

  // Is connected user an employee?
  const isEmployee = subscription?.role?.toUpperCase() === 'EMPLOYE';

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
        let errorBody: any = null;
        const status = (error as any)?.context?.status;
        if ((error as any)?.context && typeof (error as any).context.json === 'function') {
          try {
            errorBody = await (error as any).context.json();
          } catch {
            // ignore
          }
        }
        const errorCode = errorBody?.error || errorBody?.code || errorBody?.message || '';
        if (status === 403 || errorCode === 'only_owner_can_pay' || String(errorCode).includes('only_owner_can_pay')) {
          setQuoteError('Seul le gérant de la boutique peut accéder aux tarifs d\'abonnement.');
        } else if (status === 401 || errorCode === 'unauthorized' || String(errorCode).includes('unauthorized')) {
          setQuoteError('Session expirée, reconnectez-vous.');
        } else if (status === 503 || errorCode === 'payment_not_configured' || String(errorCode).includes('payment_not_configured')) {
          setQuoteError('Le calcul des tarifs n\'est pas disponible pour le moment.');
        } else if (status === 502 || errorCode === 'provider_error' || String(errorCode).includes('provider_error')) {
          setQuoteError('Le service de paiement est indisponible, réessayez.');
        } else {
          setQuoteError(errorBody?.message || error.message || 'Impossible d\'obtenir le calcul du tarif personnalisé.');
        }
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
    if (!PAYMENTS_ENABLED) return;

    // Si l'utilisateur n'est pas connecté, mémoriser la destination pour y revenir après login
    if (!user) {
      rememberRedirect('/pricing');
      if (onNavigate) {
        onNavigate('/login');
      }
      return;
    }

    // Un employé ne peut pas initier un paiement
    if (isEmployee) {
      return;
    }

    // Supprimer tout contexte d'extension avant de lancer un paiement de renouvellement
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('qash_extend_before');
      } catch {}
    }

    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutErrorType(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planKey }
      });

      if (error) {
        console.error('Erreur create-checkout invoke:', error);
        let errorBody: any = null;
        const status = (error as any)?.context?.status;

        // Lire le corps JSON via error.context (Response) en cas de HTTP non-2xx
        if ((error as any)?.context && typeof (error as any).context.json === 'function') {
          try {
            errorBody = await (error as any).context.json();
          } catch {
            // Échec du parsing JSON
          }
        }

        const errorCode = errorBody?.error || errorBody?.code || errorBody?.message || '';

        // Mapping précis des codes HTTP et erreurs attendues
        if (status === 403 || errorCode === 'only_owner_can_pay' || String(errorCode).includes('only_owner_can_pay')) {
          setCheckoutError('Seul le gérant de la boutique peut payer l\'abonnement.');
          setCheckoutErrorType('only_owner_can_pay');
        } else if (status === 401 || errorCode === 'unauthorized' || String(errorCode).includes('unauthorized')) {
          setCheckoutError('Session expirée, reconnectez-vous.');
          setCheckoutErrorType('unauthorized');
        } else if (status === 503 || errorCode === 'payment_not_configured' || String(errorCode).includes('payment_not_configured')) {
          setCheckoutError('Le paiement n\'est pas disponible pour le moment.');
          setCheckoutErrorType('payment_not_configured');
        } else if (status === 502 || errorCode === 'provider_error' || String(errorCode).includes('provider_error')) {
          setCheckoutError('Le service de paiement est indisponible, réessayez.');
          setCheckoutErrorType('provider_error');
        } else {
          setCheckoutError(
            errorBody?.message ||
            error.message ||
            'Une erreur est survenue lors de l\'initialisation du paiement.'
          );
          setCheckoutErrorType('generic');
        }
        setCheckoutLoading(false);
        return;
      }

      // Support de checkoutUrl (camelCase) et checkout_url
      const target = data?.checkoutUrl ?? data?.checkout_url;
      if (target) {
        window.location.href = target;
      } else {
        setCheckoutError('L\'adresse de paiement n\'a pas pu être générée. Veuillez réessayer.');
        setCheckoutErrorType('generic');
        setCheckoutLoading(false);
      }
    } catch (err: any) {
      console.error('Exception create-checkout:', err);
      setCheckoutError(err?.message || 'Erreur lors de la redirection vers le paiement.');
      setCheckoutErrorType('generic');
      setCheckoutLoading(false);
    }
  };

  // Statut lu depuis le serveur (get_my_subscription)
  const renderStatus = () => {
    if (!subscription) return null;
    const st = subscription.status;

    const managedByOwner = (
      <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-base font-semibold">L&apos;abonnement est géré par votre gérant.</p>
    );

    if (st === 'trial') {
      return (
        <StatusPanel tone="bg-warning-soft" title="Essai gratuit en cours">
          Votre essai se termine le <strong>{formatDateFr(subscription.trial_ends_at || subscription.access_until)}</strong>.
          {isEmployee && managedByOwner}
        </StatusPanel>
      );
    }
    if (st === 'active') {
      return (
        <StatusPanel tone="bg-success-soft" title="Abonnement actif">
          Valable jusqu&apos;au <strong>{formatDateFr(subscription.current_period_end || subscription.access_until)}</strong>.
          {isEmployee && managedByOwner}
        </StatusPanel>
      );
    }
    if (st === 'grace') {
      return (
        <StatusPanel tone="bg-warning-soft" title="Période de grâce">
          Votre abonnement est arrivé à échéance. QASH reste utilisable jusqu&apos;au{' '}
          <strong>{formatDateFr(subscription.access_until)}</strong>, puis passe en lecture seule.
          {isEmployee && managedByOwner}
        </StatusPanel>
      );
    }
    if (st === 'expired') {
      return (
        <StatusPanel tone="bg-danger-soft" title="Abonnement expiré">
          QASH est en lecture seule. Vos données sont conservées : tout revient dès le renouvellement.
          {isEmployee && managedByOwner}
        </StatusPanel>
      );
    }
    if (st === 'no_store') {
      return (
        <StatusPanel tone="bg-field" title="Aucune boutique associée">
          Votre compte n&apos;est pas encore lié à une boutique. Créez d&apos;abord votre boutique dans l&apos;application
          QASH.
        </StatusPanel>
      );
    }
    return null;
  };

  const plan1m = quote?.plans?.find((p) => p.key === '1m');
  const plan12m = quote?.plans?.find((p) => p.key === '12m');
  const selectedPlan = selectedPlanKey === '1m' ? plan1m : plan12m;
  const plans: Array<{ key: '1m' | '12m'; label: string; plan?: CheckoutQuotePlan }> = [
    { key: '1m', label: '1 mois', plan: plan1m },
    { key: '12m', label: '12 mois', plan: plan12m },
  ];

  return (
    <>
      <Section tone="paper" spacing="none" className="pb-14 pt-14 sm:pb-20 sm:pt-20">
        <Container>
          <h1 className="text-display font-black">Payer mon abonnement.</h1>
          <p className="mt-8 max-w-[38rem] text-xl leading-relaxed sm:text-2xl">
            Le montant de votre boutique est calculé par le serveur, d&apos;après le nombre d&apos;employés inscrits.{' '}
            <AppLink to="/tarifs" className="font-bold underline decoration-2 underline-offset-4">
              Voir la grille des tarifs
            </AppLink>
          </p>
        </Container>
      </Section>

      {!PAYMENTS_ENABLED && (
        <Section tone="ink" spacing="compact">
          <Container>
            <h2 className="text-headline font-black">Paiement bientôt disponible.</h2>
            <p className="mt-6 max-w-[38rem] text-xl leading-relaxed">
              Le paiement en ligne de l&apos;abonnement arrive bientôt sur ce site. Vous pouvez déjà suivre l&apos;état de
              votre abonnement ci-dessous et dans Mon espace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/dashboard" variant="yellow" size="lg">
                Mon espace
              </ButtonLink>
              <ButtonLink to="/contact" variant="light" size="lg">
                Nous contacter
              </ButtonLink>
            </div>
          </Container>
        </Section>
      )}

      <Section tone="field" spacing="compact">
        <Container>
          {authLoading ? (
            <div className="flex items-center gap-3 text-lg">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Chargement…
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="min-w-0">
                  <p className="break-all text-lg font-bold">{user.email}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-base">
                    {subscription?.store_name && (
                      <span className="inline-flex items-center gap-1.5">
                        <Store className="h-4 w-4" aria-hidden="true" />
                        {subscription.store_name}
                      </span>
                    )}
                    {typeof subscription?.employee_count === 'number' && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        {subscription.employee_count} employé{subscription.employee_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="quiet"
                    onClick={() => {
                      fetchSubscription();
                      fetchQuote();
                    }}
                    disabled={subLoading || quoteLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${subLoading || quoteLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                    Actualiser
                  </Button>
                  <Button variant="quiet" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Se déconnecter
                  </Button>
                </div>
              </div>

              {subLoading ? (
                <div className="flex items-center gap-3 rounded-[2rem] bg-white p-6 text-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-red" aria-hidden="true" />
                  Vérification de votre abonnement…
                </div>
              ) : subError ? (
                <div className="flex flex-col gap-3 rounded-[2rem] bg-danger-soft p-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-start gap-2 text-lg">
                    <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-brand-red-dark" aria-hidden="true" />
                    {subError}
                  </p>
                  <Button variant="dark" onClick={fetchSubscription}>
                    Réessayer
                  </Button>
                </div>
              ) : (
                renderStatus()
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6 rounded-[2rem] bg-white p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-title font-black">Connectez-vous pour voir le montant de votre boutique.</h2>
                <p className="mt-3 max-w-[38rem] text-lg">
                  Grille publique : {formatFcfa(PRICING.managerMonthly)} par mois pour le gérant, plus{' '}
                  {formatFcfa(PRICING.employeeMonthly)} par mois et par employé.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={() => {
                    rememberRedirect('/pricing');
                    onNavigate?.('/login');
                  }}
                >
                  Se connecter
                </Button>
                <ButtonLink to="/register" variant="quiet" size="lg">
                  Créer un compte
                </ButtonLink>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {PAYMENTS_ENABLED && (
        <Section tone="paper" id="plans-selection" className="scroll-mt-24">
          <Container>
            <h2 className="text-headline font-black">Choisissez la durée.</h2>
            <p className="mt-6 max-w-[38rem] text-xl">
              Paiement unique, sans prélèvement automatique. Vous renouvelez quand vous voulez.
            </p>

            {quoteError && user && (
              <p className="mt-8 flex items-start gap-2 rounded-2xl bg-danger-soft p-4 text-lg">
                <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-brand-red-dark" aria-hidden="true" />
                {quoteError}
              </p>
            )}

            <div className="mt-10 grid gap-4 md:grid-cols-2" role="radiogroup" aria-label="Durée de l'abonnement">
              {plans.map(({ key, label, plan }) => {
                const selected = selectedPlanKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedPlanKey(key)}
                    className={`rounded-[2rem] p-8 text-left transition-colors sm:p-10 ${
                      selected ? 'bg-ink text-white' : 'bg-field text-ink hover:bg-field-strong'
                    }`}
                  >
                    <span className="block text-title font-black">{label}</span>
                    <span className="mt-6 block min-h-[3.5rem]">
                      {quoteLoading ? (
                        <span className="inline-flex items-center gap-2 text-lg">
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                          Calcul du montant…
                        </span>
                      ) : plan ? (
                        <>
                          <span className="block text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] font-black leading-none tracking-tight">
                            {formatFcfa(plan.amount)}
                          </span>
                          {typeof plan.discount === 'number' && plan.discount > 0 && (
                            <span className={`mt-2 block text-lg font-semibold ${selected ? 'text-brand-yellow' : 'text-brand-red-dark'}`}>
                              Remise appliquée par le serveur : {formatFcfa(plan.discount)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="block text-lg">{user ? 'Montant indisponible' : 'Connectez-vous pour voir le montant'}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {user && quote && (
              <p className="mt-6 text-lg">
                Calculé par le serveur pour {quote.seats} utilisateur{quote.seats > 1 ? 's' : ''} (1 gérant +{' '}
                {quote.seats - 1} employé{quote.seats - 1 > 1 ? 's' : ''}), soit {formatFcfa(quote.monthly)} par mois.
              </p>
            )}

            {checkoutError && (
              <div className="mt-8 flex flex-col gap-3 rounded-[2rem] bg-danger-soft p-6 sm:flex-row sm:items-center sm:justify-between" role="alert">
                <p className="flex items-start gap-2 text-lg font-semibold">
                  <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-brand-red-dark" aria-hidden="true" />
                  {checkoutError}
                </p>
                <div className="flex flex-wrap gap-2">
                  {checkoutErrorType === 'unauthorized' && (
                    <Button
                      onClick={() => {
                        rememberRedirect('/pricing');
                        onNavigate?.('/login');
                      }}
                    >
                      Se reconnecter
                    </Button>
                  )}
                  <Button
                    variant="quiet"
                    onClick={() => {
                      setCheckoutError(null);
                      setCheckoutErrorType(null);
                    }}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-10">
              {isEmployee ? (
                <p className="rounded-2xl bg-field px-5 py-4 text-lg font-semibold">L&apos;abonnement est géré par votre gérant.</p>
              ) : (
                <Button size="lg" onClick={() => handleCheckout(selectedPlanKey)} disabled={checkoutLoading || (!!user && !selectedPlan)}>
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      Ouverture du paiement…
                    </>
                  ) : (
                    <>
                      {user
                        ? `Payer ${selectedPlanKey === '1m' ? '1 mois' : '12 mois'}${selectedPlan ? ` (${formatFcfa(selectedPlan.amount)})` : ''}`
                        : 'Se connecter pour payer'}
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="paper" spacing="compact">
        <Container>
          <AppLink to="/faq" className={buttonClasses('quiet', 'lg')}>
            Questions fréquentes
          </AppLink>
        </Container>
      </Section>
    </>
  );
};

const StatusPanel: React.FC<{ tone: string; title: string; children: React.ReactNode }> = ({ tone, title, children }) => (
  <div className={`rounded-[2rem] p-6 sm:p-8 ${tone}`}>
    <h2 className="text-title font-black">{title}</h2>
    <div className="mt-3 text-lg leading-relaxed">{children}</div>
  </div>
);
