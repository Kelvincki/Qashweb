import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { PageRoute, MySubscriptionData } from '../types';
import { supabase } from '../lib/supabase';
import { Container, Section } from '../components/ui/Layout';
import { ButtonLink, buttonClasses } from '../components/ui/Button';
import { androidIntentLink, mailtoLink } from '../config/site';

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
  const [confirmedSeats, setConfirmedSeats] = useState<number | null>(null);
  const [isExtensionPayment, setIsExtensionPayment] = useState<boolean>(false);
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

          const currentPaidSeats = typeof sub.paid_seats === 'number' ? sub.paid_seats : null;
          let extendBeforeRaw: string | null = null;
          try {
            extendBeforeRaw = typeof window !== 'undefined' ? sessionStorage.getItem('qash_extend_before') : null;
          } catch {}

          if (extendBeforeRaw !== null) {
            setIsExtensionPayment(true);
            const extendBeforeVal = parseInt(extendBeforeRaw, 10);
            const prevSeats = isNaN(extendBeforeVal) ? 0 : extendBeforeVal;
            if (currentPaidSeats !== null && currentPaidSeats > prevSeats) {
              setConfirmedDate(targetDate || null);
              setConfirmedSeats(currentPaidSeats);
              setSyncState('confirmed');
              try { sessionStorage.removeItem('qash_extend_before'); } catch {}
              return; // Confirmation achieved, stop polling
            }
          } else {
            if (sub.status === 'active' && isFutureDate(targetDate)) {
              setConfirmedDate(targetDate || null);
              setSyncState('confirmed');
              return; // Confirmation achieved, stop polling
            }
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


  const intentLink = androidIntentLink('subscription');
  const helpMail = mailtoLink('Question paiement QASH');

  return (
    <Section tone="paper" spacing="none" className="pb-24 pt-14 sm:pt-20">
      <Container>
        <div className="max-w-[44rem]">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              syncState === 'timeout' ? 'bg-warning-soft' : 'bg-success-soft text-success'
            }`}
            aria-hidden="true"
          >
            {syncState === 'timeout' ? <Clock className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
          </div>

          <h1 className="mt-8 text-[clamp(2.25rem,1.5rem+3vw,4rem)] font-black leading-[0.98] tracking-tight" aria-live="polite">
            {syncState === 'confirmed'
              ? 'Paiement confirmé.'
              : syncState === 'timeout'
              ? 'Paiement en cours de vérification.'
              : 'Merci !'}
          </h1>

          {syncState === 'confirmed' ? (
            <p className="mt-6 text-xl leading-relaxed sm:text-2xl">
              {isExtensionPayment && confirmedSeats !== null ? (
                <>
                  Votre boutique dispose désormais de{' '}
                  <strong className="font-black">
                    {confirmedSeats} place{confirmedSeats > 1 ? 's' : ''} employé{confirmedSeats > 1 ? 's' : ''}
                  </strong>
                  {confirmedDate && (
                    <>
                      {' '}
                      (actif jusqu&apos;au <strong className="font-black">{formatDateFrench(confirmedDate)}</strong>)
                    </>
                  )}
                  .
                </>
              ) : (
                <>
                  Abonnement actif jusqu&apos;au <strong className="font-black">{formatDateFrench(confirmedDate)}</strong>.
                </>
              )}
            </p>
          ) : syncState === 'timeout' ? (
            <p className="mt-6 text-xl leading-relaxed sm:text-2xl">
              La confirmation prend plus de temps que prévu. Rouvrez l&apos;application QASH : l&apos;abonnement
              s&apos;actualisera tout seul.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="text-xl leading-relaxed sm:text-2xl">
                Nous attendons la confirmation du paiement par le serveur. Votre abonnement sera mis à jour dès qu’elle arrive.
              </p>
              <p className="text-lg">Retournez dans l&apos;application, elle se mettra à jour toute seule.</p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <a href="qash://subscription" onClick={handleDeepLinkClick} className={buttonClasses('primary', 'lg')}>
              Retourner dans QASH
            </a>
            <ButtonLink to="/dashboard" variant="quiet" size="lg">
              Mon espace
            </ButtonLink>
          </div>

          <p className="mt-6 text-lg">Si rien ne se passe, ouvrez l&apos;application QASH vous-même.</p>
          {intentLink && (
            <p className="mt-2 text-lg">
              <a href={intentLink} className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
                Lien de secours Android
              </a>
            </p>
          )}

          {helpMail && (
            <p className="mt-10 text-lg">
              Un souci&nbsp;?{' '}
              <a href={helpMail} className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
                Contactez-nous
              </a>
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
};
