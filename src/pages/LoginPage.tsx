import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { consumeRedirect } from '../lib/redirect';
import { PageRoute } from '../types';
import { GoogleIcon } from '../components/GoogleIcon';
import { AuthShell, Field, Notice, PasswordField, Spinner } from '../components/ui/AuthShell';
import { Button, buttonClasses } from '../components/ui/Button';
import { AppLink } from '../lib/navigation';

interface LoginPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already logged in, redirect to destination
  useEffect(() => {
    if (!loading && user) {
      onNavigate(consumeRedirect());
    }
  }, [user, loading, onNavigate]);

  const handleGoogleSignIn = async () => {
    if (isSubmitting || isGoogleLoading) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setIsGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Une erreur inattendue est survenue lors de la connexion avec Google.');
      console.error(err);
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }

    setErrorMsg(null);
    setInfoMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setErrorMsg('Identifiants incorrects. Veuillez vérifier votre e-mail et votre mot de passe.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Votre adresse e-mail n\'a pas encore été confirmée. Veuillez vérifier votre boîte de réception.');
        } else {
          setErrorMsg(error.message);
        }
      } else {
        // Redirect will happen via useEffect onAuthChange or immediate navigate
        onNavigate(consumeRedirect());
      }
    } catch (err: any) {
      setErrorMsg('Une erreur inattendue est survenue. Veuillez vérifier votre connexion réseau.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const busy = isSubmitting || isGoogleLoading;

  return (
    <AuthShell title="Se connecter." intro="Accédez à votre espace : abonnement, équipe et compte de votre boutique.">
      <div className="space-y-6">
        {errorMsg && <Notice kind="error">{errorMsg}</Notice>}
        {infoMsg && <Notice kind="success">{infoMsg}</Notice>}

        <button type="button" id="google-login-btn" onClick={handleGoogleSignIn} disabled={busy} className={buttonClasses('quiet', 'lg', 'w-full')}>
          {isGoogleLoading ? (
            <Spinner />
          ) : (
            <>
              <GoogleIcon className="h-5 w-5 shrink-0" />
              Continuer avec Google
            </>
          )}
        </button>

        <p className="text-center text-base font-semibold text-muted">ou avec votre e-mail</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <Field
            id="email-input"
            label="Adresse e-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            disabled={busy}
          />
          <PasswordField
            id="password-input"
            label="Mot de passe"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={busy}
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            extra={
              <AppLink to="/mot-de-passe-oublie" className="text-base font-semibold underline decoration-2 underline-offset-4 hover:text-brand-red">
                Mot de passe oublié&nbsp;?
              </AppLink>
            }
          />
          <Button id="submit-login-btn" type="submit" size="lg" disabled={busy} className="w-full">
            {isSubmitting ? <Spinner /> : 'Se connecter'}
          </Button>
        </form>

        <p className="pt-4 text-lg">
          Nouveau sur QASH&nbsp;?{' '}
          <AppLink to="/register" className="inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
            Créer un compte
          </AppLink>
        </p>
      </div>
    </AuthShell>
  );
};
