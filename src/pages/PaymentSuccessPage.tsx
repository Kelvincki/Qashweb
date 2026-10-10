import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, HelpCircle, Smartphone, Clock } from 'lucide-react';
import { QashLogo } from '../components/QashLogo';
import { PageRoute, MySubscriptionData } from '../types';
import { supabase } from '../lib/supabase';

interface PaymentSuccessPageProps {
  onNavigate: (route: PageRoute) => void;
}

type SyncState = 'pending' | 'confirmed' | 'timeout';

function formatDateFrench(dateStr?: string | null): string {
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

function isFutureDate(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const t = new Date(dateStr).getTime();
  return !isNaN(t) && t > Date.now();
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ onNavigate }) => {
  const [syncState, setSyncState] = useState<SyncState>('pending');
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);
  const [showAndroidFallback, setShowAndroidFallback] = useState(false);

  // Poll get_my_subscription if user is logged in (every 3s, max 60s, cancelable setTimeout)
  useEffect(() => {
    let isMounted = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    const startTime = Date.now();
    const MAX_DURATION_MS = 60000; // 60 seconds
    const INTERVAL_MS = 3000; // 3 seconds

    async function checkSubscription() {
      if (!isMounted) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !isMounted) {
          // Non-logged-in visitor: no polling, maintain default pending state
          return;
        }

        const { data, error } = await supabase.rpc('get_my_subscription');
        if (!isMounted) return;

        if (!error && data) {
          const sub = data as MySubscriptionData;
          const targetDate = sub.current_period_end || sub.access_until;

          if (sub.status === 'active' && isFutureDate(targetDate)) {
            setConfirmedDate(targetDate || null);
            setSyncState('confirmed');
            return; // Confirmation achieved, stop polling
          }
        }
      } catch (err) {
        console.warn('Vérification abonnement:', err);
      }

      if (!isMounted) return;

      // Check 60s expiration
      if (Date.now() - startTime >= MAX_DURATION_MS) {
        setSyncState('timeout');
        return;
      }

      // Schedule next poll in 3s
      timerId = setTimeout(checkSubscription, INTERVAL_MS);
    }

    checkSubscription();

    return () => {
      isMounted = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, []);

  // Update tab title and inject robots noindex meta tag
  useEffect(() => {
    const prevTitle = document.title;
    if (syncState === 'confirmed') {
      document.title = 'Paiement confirmé — QASH';
    } else if (syncState === 'timeout') {
      document.title = 'Paiement en cours de vérification — QASH';
    } else {
      document.title = 'Paiement — QASH';
    }

    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let createdMeta = false;

    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      metaRobots.content = 'noindex, nofollow';
      document.head.appendChild(metaRobots);
      createdMeta = true;
    } else {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    }

    return () => {
      document.title = prevTitle;
      if (createdMeta && metaRobots) {
        metaRobots.remove();
      }
    };
  }, [syncState]);

  const handleDeepLinkClick = () => {
    setTimeout(() => {
      setShowAndroidFallback(true);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 bg-neutral-50/70">
      <div className="w-full max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-8 shadow-xs text-center flex flex-col items-center">
          
          {/* Logo Brand Header */}
          <div className="mb-6">
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex cursor-pointer hover:opacity-90 transition-opacity focus:outline-hidden"
              aria-label="Accueil QASH"
            >
              <QashLogo size="sm" />
            </button>
          </div>

          {/* Icon based on syncState */}
          {syncState === 'confirmed' ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-5 shadow-2xs">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>
          ) : syncState === 'timeout' ? (
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-5 shadow-2xs">
              <Clock className="w-9 h-9 stroke-[2.2]" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-5 shadow-2xs">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-4">
            {syncState === 'confirmed'
              ? 'Paiement confirmé'
              : syncState === 'timeout'
              ? 'Paiement en cours de vérification'
              : 'Merci !'}
          </h1>

          {/* Explanatory Text */}
          {syncState === 'confirmed' ? (
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 max-w-sm font-medium">
              Paiement confirmé — abonnement actif jusqu&apos;au{' '}
              <span className="text-emerald-700 font-semibold">
                {formatDateFrench(confirmedDate)}
              </span>.
            </p>
          ) : syncState === 'timeout' ? (
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 max-w-sm">
              La confirmation prend plus de temps que prévu. Rouvrez l&apos;application QASH, l&apos;abonnement s&apos;actualisera automatiquement.
            </p>
          ) : (
            <div className="space-y-2 mb-6 max-w-sm">
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-medium">
                Nous confirmons votre paiement. Votre abonnement QASH sera activé dans quelques instants.
              </p>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Retournez dans l&apos;application, elle se mettra à jour toute seule.
              </p>
            </div>
          )}

          {/* Main Action Button - qash://subscription (Min height 48px for accessibility) */}
          <div className="w-full space-y-3 mb-5">
            <a
              href="qash://subscription"
              onClick={handleDeepLinkClick}
              className="w-full min-h-[48px] py-3.5 px-6 bg-qash-red-500 hover:bg-qash-red-600 active:bg-qash-red-700 text-white font-semibold text-base rounded-xl shadow-sm transition-all duration-150 inline-flex items-center justify-center gap-2 text-center select-none cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-qash-red-500 focus-visible:ring-offset-2"
            >
              <span>Retourner dans QASH</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {/* Android Fallback Intent Link */}
            <div className="pt-1">
              <a
                href="intent://subscription#Intent;scheme=qash;package=com.example;end"
                className="text-xs font-medium text-neutral-500 hover:text-neutral-800 underline underline-offset-4 transition-colors inline-flex items-center gap-1 py-1"
              >
                <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Lien de secours Android (si l&apos;application ne s&apos;ouvre pas)</span>
              </a>
            </div>
          </div>

          {/* Helper Note Under Button */}
          <p className="text-xs text-neutral-500 leading-normal max-w-xs mb-6">
            Si rien ne se passe, ouvrez l&apos;application QASH manuellement.
          </p>

          {/* Divider */}
          <div className="w-full border-t border-neutral-100 my-2"></div>

          {/* Bottom Help Section */}
          <div className="pt-4 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>Un souci ?</span>
              <a
                href="mailto:contact@qashapp.com?subject=Question%20paiement%20QASH"
                className="font-semibold text-qash-red-600 hover:text-qash-red-700 hover:underline transition-colors"
              >
                Contactez-nous
              </a>
            </div>
            <p className="text-[11px] text-neutral-400">
              Notre équipe d&apos;assistance vous répond rapidement.
            </p>
          </div>

        </div>

        {/* Back to Home or Dashboard Links */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="text-xs text-neutral-700 hover:text-neutral-900 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-200/60"
          >
            <span>Accéder à mon espace</span>
          </button>
          <span className="hidden sm:inline text-neutral-300">•</span>
          <button
            onClick={() => onNavigate('/')}
            className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-neutral-100"
          >
            <span>Retourner sur le site officiel</span>
          </button>
        </div>

      </div>
    </div>
  );
};
