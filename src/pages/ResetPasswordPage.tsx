import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthContext';
import { PageRoute } from '../types';
import { AuthShell, Notice, PasswordField, Spinner } from '../components/ui/AuthShell';
import { Button, ButtonLink } from '../components/ui/Button';

interface ResetPasswordPageProps {
  onNavigate?: (route: PageRoute) => void;
}

type LinkStatus = 'checking' | 'ready' | 'invalid';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Lecture unique de l'URL au premier rendu : supabase-js nettoie ensuite le fragment (#...).
 * - lien de récupération : #access_token=...&type=recovery (ou ?code=... en flux PKCE)
 * - lien expiré : #error=access_denied&error_code=otp_expired...
 * Aucun jeton n'est lu, stocké ni journalisé ici : seule leur présence est testée.
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

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = () => {
  const { signOut } = useAuth();
  const [urlInfo] = useState(readRecoveryUrl);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(urlInfo.hasError ? 'invalid' : 'checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Attente de la session de récupération (événement PASSWORD_RECOVERY) créée par supabase-js depuis le lien de l'e-mail
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
      setErrorMsg('Saisissez le nouveau mot de passe dans les deux champs.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMsg(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Les deux mots de passe ne sont pas identiques.');
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
          setErrorMsg('Ce mot de passe est trop faible. Choisissez-en un plus long ou plus varié.');
        } else {
          setErrorMsg("Le mot de passe n'a pas pu être modifié. Réessayez dans un instant.");
        }
      } else {
        setPassword('');
        setConfirmPassword('');
        // Retour à la connexion avec le nouveau mot de passe : on ferme la session de récupération
        await signOut();
        setIsDone(true);
      }
    } catch {
      setErrorMsg('Une erreur inattendue est survenue. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <AuthShell title="Mot de passe modifié." intro="Connectez-vous maintenant avec votre nouveau mot de passe.">
        <div className="space-y-6">
          <Notice kind="success">Votre mot de passe a bien été modifié.</Notice>
          <ButtonLink to="/login" size="lg">
            Se connecter
          </ButtonLink>
        </div>
      </AuthShell>
    );
  }

  if (linkStatus === 'invalid') {
    return (
      <AuthShell title="Lien expiré." intro="Ce lien de réinitialisation n'est plus valable : il a expiré ou a déjà servi.">
        <div className="space-y-6">
          <Notice kind="error">Demandez un nouveau lien : il arrive en quelques instants dans votre boîte e-mail.</Notice>
          <ButtonLink to="/mot-de-passe-oublie" size="lg">
            Demander un nouveau lien
          </ButtonLink>
        </div>
      </AuthShell>
    );
  }

  if (linkStatus === 'checking') {
    return (
      <AuthShell title="Nouveau mot de passe.">
        <div className="flex items-center gap-3 text-xl" aria-live="polite">
          <Spinner />
          Vérification du lien…
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nouveau mot de passe." intro="Choisissez un nouveau mot de passe pour votre compte QASH.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && <Notice kind="error">{errorMsg}</Notice>}
        <PasswordField
          id="new-password-input"
          label="Nouveau mot de passe"
          autoComplete="new-password"
          hint={`${MIN_PASSWORD_LENGTH} caractères minimum.`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={MIN_PASSWORD_LENGTH}
          disabled={isSubmitting}
          visible={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
        />
        <PasswordField
          id="confirm-new-password-input"
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isSubmitting}
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
        />
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Spinner /> : 'Enregistrer le mot de passe'}
        </Button>
      </form>
    </AuthShell>
  );
};
