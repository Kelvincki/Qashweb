import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, KeyRound, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { QashLogo } from '../components/QashLogo';
import { PageRoute } from '../types';

interface JoinPageProps {
  onNavigate: (route: PageRoute) => void;
}

/**
 * Nettoie le code d'invitation lu dans l'URL :
 * majuscules, lettres/chiffres/tiret uniquement, 20 caractères maximum.
 */
function sanitizeInviteCode(raw: string | null): string {
  if (!raw) return '';
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 20);
}

export const JoinPage: React.FC<JoinPageProps> = ({ onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const code = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return sanitizeInviteCode(new URLSearchParams(window.location.search).get('code'));
  }, []);

  // Page publique : titre dédié et pas d'indexation (le code d'invitation est dans l'URL)
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Rejoindre une boutique — QASH';

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
      document.title = originalTitle;
      if (createdMeta && metaRobots && metaRobots.parentNode) {
        metaRobots.parentNode.removeChild(metaRobots);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!code) return;
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Erreur copie presse-papier:', err);
      setCopyError(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-qash-surface" id="join-page">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-qash-border rounded-2xl p-8 shadow-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <QashLogo className="h-10 text-qash-ink" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-qash-ink text-center">
            Rejoindre une boutique
          </h1>
        </div>

        {code ? (
          <div className="space-y-6">
            <p className="text-sm text-neutral-600 leading-relaxed text-center">
              Vous êtes invité à rejoindre une boutique sur QASH. Ouvrez l&apos;application QASH, choisissez <strong className="text-neutral-900">Employé</strong> et saisissez ce code.
            </p>

            <div className="bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-4 flex items-center justify-center gap-3">
              <KeyRound className="w-5 h-5 text-neutral-400 shrink-0" aria-hidden="true" />
              <span
                className="font-mono text-2xl font-black text-neutral-900 tracking-wider break-all"
                aria-label="Code d'invitation"
              >
                {code}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full min-h-[48px] py-3 bg-qash-red-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-qash-red-600 focus:outline-none focus:ring-2 focus:ring-qash-red-500/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Code copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier le code</span>
                </>
              )}
            </button>

            <div aria-live="polite">
              {copyError && (
                <p className="text-xs text-qash-red-600 text-center">
                  La copie n&apos;a pas fonctionné. Recopiez le code manuellement.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-qash-red-50 border border-qash-red-100 rounded-xl flex items-start gap-3 text-qash-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-qash-red-500 mt-0.5" />
            <div>Code d&apos;invitation introuvable</div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-qash-border text-center">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-sm font-semibold text-qash-ink hover:underline focus:outline-none cursor-pointer"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </motion.div>
    </div>
  );
};
