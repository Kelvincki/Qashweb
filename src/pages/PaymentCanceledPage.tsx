import React, { useEffect, useState } from 'react';
import { MinusCircle, ArrowRight, HelpCircle, Smartphone, ExternalLink, Mail, ArrowLeft } from 'lucide-react';
import { QashLogo } from '../components/QashLogo';
import { PageRoute } from '../types';

interface PaymentCanceledPageProps {
  onNavigate?: (route: PageRoute) => void;
}

export function PaymentCanceledPage({ onNavigate }: PaymentCanceledPageProps) {
  const [showAndroidFallback, setShowAndroidFallback] = useState(false);

  // Configure meta robots (noindex, nofollow) and page title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Paiement annulé — QASH';

    // Inject or update meta robots tag
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

    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = originalTitle;
      if (createdMeta && metaRobots && metaRobots.parentNode) {
        metaRobots.parentNode.removeChild(metaRobots);
      }
    };
  }, []);

  const handleOpenApp = () => {
    // Deep link scheme for QASH mobile app
    const deepLink = 'qash://subscription';
    
    // User-triggered opening
    window.location.href = deepLink;

    // Show Android intent fallback after a brief delay if app did not open
    setTimeout(() => {
      setShowAndroidFallback(true);
    }, 1200);
  };

  const handleOpenAndroidIntent = () => {
    const androidIntent = 'intent://subscription#Intent;scheme=qash;package=com.example;end';
    window.location.href = androidIntent;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50/70">
      <div className="max-w-md w-full mx-auto my-auto space-y-8 text-center">
        
        {/* Brand Header */}
        <div className="flex justify-center">
          <button
            onClick={() => onNavigate?.('/')}
            className="inline-flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-xl p-1"
            aria-label="Accueil QASH"
          >
            <QashLogo size={44} className="transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-2xl tracking-tight text-neutral-900">
              QASH<span className="text-[#FA1316]">.</span>
            </span>
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-neutral-900/5 border border-neutral-100 text-left relative overflow-hidden">
          
          {/* Subtle top decoration bar - neutral slate/gray */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neutral-300 via-slate-400 to-neutral-400" />

          {/* Neutral Status Icon */}
          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-sm">
              <MinusCircle className="w-9 h-9 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                Paiement annulé
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-sm">
                Votre paiement n'a pas été effectué. Votre abonnement n'a pas changé. Vous pouvez réessayer à tout moment depuis l'application.
              </p>
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-8 space-y-3.5">
            {/* Primary Action Button (min-height: 48px+) */}
            <button
              type="button"
              onClick={handleOpenApp}
              className="w-full min-h-[52px] px-6 py-3.5 rounded-2xl bg-[#FA1316] hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-base shadow-lg shadow-rose-600/25 hover:shadow-rose-600/35 transition-all duration-200 flex items-center justify-center gap-2.5 group focus:outline-none focus:ring-4 focus:ring-rose-500/25"
            >
              <span>Retourner dans QASH</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Android Intent Fallback (shown on request or if deep link did not respond) */}
            {showAndroidFallback && (
              <div className="pt-2 animate-fadeIn">
                <button
                  type="button"
                  onClick={handleOpenAndroidIntent}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 active:bg-neutral-200 text-neutral-700 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 border border-neutral-200/70"
                >
                  <Smartphone className="w-4 h-4 text-neutral-500" />
                  <span>Lien de secours Android (Intent)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>
            )}

            {/* Manual Instruction Hint */}
            <p className="text-xs text-neutral-500 text-center pt-1 leading-normal">
              Si rien ne se passe, ouvrez l'application QASH manuellement.
            </p>
          </div>

          {/* How to Retry in App Info Box */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <div className="rounded-2xl bg-slate-50/80 border border-slate-200/60 p-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold block text-slate-900 mb-0.5">Comment reprendre ?</span>
                Dans QASH, ouvrez <strong className="font-semibold text-slate-900">Plus &gt; Abonnement</strong>, puis appuyez sur <strong className="font-semibold text-slate-900">Renouveler / Payer</strong>.
              </div>
            </div>
          </div>

        </div>

        {/* Support & Navigation Links */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-neutral-200/60 shadow-sm">
            <Mail className="w-4 h-4 text-neutral-500" />
            <span>Un souci avec votre paiement ?</span>
            <a
              href="mailto:contact@qashapp.com"
              className="font-semibold text-neutral-900 hover:text-rose-600 underline underline-offset-2 transition-colors"
            >
              Contactez-nous
            </a>
          </div>

          {onNavigate && (
            <div>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors font-medium py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour au site principal</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
