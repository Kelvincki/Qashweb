import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PageRoute } from '../types';
import { Eye, EyeOff, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { QashLogo } from '../components/QashLogo';

interface ResetPasswordPageProps {
  onNavigate: (route: PageRoute) => void;
}

type LinkStatus = 'checking' | 'ready' | 'invalid';

const MIN_PASSWORD_LENGTH = 6;
const EXPIRED_LINK_MESSAGE =
  'Ce lien de réinitialisation est expiré ou invalide. Demandez un nouvel e-mail depuis « Mon espace », onglet « Paramètres et aide ».';

/**
 * Lecture unique de l'URL au premier rendu : supabase-js nettoie ensuite le fragment (#...).
 * - lien de récupération : #access_token=...&type=recovery (ou ?code=... en flux PKCE)
 * - lien expiré : #error=access_denied&error_code=otp_expired...
 */
function readRecoveryUrl(): { hasRecoveryParams: boolean; hasError: boolean } {
  if (typeof window === 'undefined') return { hasRecoveryParams: false, hasError: false };
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const hasError = Boolean(
    search.get('error') || search.get('error_code') || hash.get('error') || hash.get('error_code')
  );
  const hasRecoveryParams =
    hash.get('type') === 'recovery' || Boolean(hash.get('access_token')) || Boolean(search.get('code'));
  return { hasRecoveryParams, hasError };
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const [urlInfo] = useState(readRecoveryUrl);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(urlInfo.hasError ? 'invalid' : 'checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Titre dédié et pas d'indexation
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Nouveau mot de passe — QASH';

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

  // Attente de la session de récupération créée par supabase-js à partir du lien de l'e-mail
  useEffect(() => {
    if (urlInfo.hasError) return;

    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!cancelled && event === 'PASSWORD_RECOVERY') {
        setLinkStatus('ready');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session && urlInfo.hasRecoveryParams) {
        setLinkStatus('ready');
      }
    });

    // Sans session de récupération après quelques secondes : lien expiré ou page ouverte sans lien
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setLinkStatus((current) => (current === 'checking' ? 'invalid' : current));
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [urlInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);

    if (!password || !confirmPassword) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMsg(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        const message = error.message || '';
        if (/same|different from the old/i.test(message)) {
          setErrorMsg("Le nouveau mot de passe doit être différent de l'ancien.");
        } else if (/session|expired|jwt|not authenticated/i.test(message)) {
          setLinkStatus('invalid');
        } else if (/weak|at least|characters/i.test(message)) {
          setErrorMsg('Ce mot de passe est trop faible. Choisissez-en un plus long ou plus complexe.');
        } else {
          setErrorMsg("Le mot de passe n'a pas pu être mis à jour. Réessayez dans un instant.");
        }
      } else {
        setIsDone(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error('Exception updateUser:', err);
      setErrorMsg('Une erreur inattendue est survenue. Veuillez vérifier votre connexion réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-10 py-2.5 bg-qash-surface border border-qash-border rounded-xl text-qash-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-qash-red-500/10 focus:border-qash-red-500 transition-all text-sm disabled:opacity-60';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-qash-surface" id="reset-password-page">
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
            Nouveau mot de passe
          </h1>
        </div>

        {isDone ? (
          <div className="space-y-6">
            <div className="p-4 bg-qash-green-50 border border-qash-green-600/20 rounded-xl flex items-start gap-3 text-qash-green-600 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-qash-green-500 mt-0.5" />
              <div>Votre mot de passe a été mis à jour.</div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="w-full min-h-[48px] py-3 bg-qash-red-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-qash-red-600 focus:outline-none focus:ring-2 focus:ring-qash-red-500/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Accéder à Mon espace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : linkStatus === 'checking' ? (
          <div className="py-8 flex flex-col items-center gap-3" aria-live="polite">
            <div className="w-8 h-8 border-2 border-qash-ink border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-neutral-500">Vérification du lien en cours...</p>
          </div>
        ) : linkStatus === 'invalid' ? (
          <div className="space-y-6">
            <div className="p-4 bg-qash-red-50 border border-qash-red-100 rounded-xl flex items-start gap-3 text-qash-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-qash-red-500 mt-0.5" />
              <div>{EXPIRED_LINK_MESSAGE}</div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="w-full min-h-[48px] py-3 bg-qash-red-500 text-white rounded-xl font-medium text-sm hover:bg-qash-red-600 focus:outline-none focus:ring-2 focus:ring-qash-red-500/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-neutral-500 text-center -mt-4 mb-2">
              Choisissez un nouveau mot de passe pour votre compte QASH.
            </p>

            {errorMsg && (
              <div className="p-4 bg-qash-red-50 border border-qash-red-100 rounded-xl flex items-start gap-3 text-qash-red-600 text-sm" role="alert">
                <AlertCircle className="w-5 h-5 shrink-0 text-qash-red-500 mt-0.5" />
                <div>{errorMsg}</div>
              </div>
            )}

            <div>
              <label htmlFor="new-password-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="new-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-new-password-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirm-new-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3 bg-qash-red-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-qash-red-600 focus:outline-none focus:ring-2 focus:ring-qash-red-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-3"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Enregistrer le mot de passe</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
