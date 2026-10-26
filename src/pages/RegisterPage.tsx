import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { consumeRedirect } from '../lib/redirect';
import { PageRoute } from '../types';
import { GoogleIcon } from '../components/GoogleIcon';
import { AuthShell, Field, Notice, PasswordField, Spinner } from '../components/ui/AuthShell';
import { Button, buttonClasses } from '../components/ui/Button';
import { AppLink } from '../lib/navigation';
import { PRICING } from '../config/site';

interface RegisterPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { user, loading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
    setSuccessMsg(null);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/bienvenue`,
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Check if session exists immediately (email confirmation disabled in Supabase)
        if (data.session) {
          setSuccessMsg('Votre compte a été créé avec succès ! Redirection en cours...');
          setTimeout(() => {
            onNavigate('/dashboard');
          }, 2000);
        } else {
          // Email confirmation is enabled
          setSuccessMsg(
            'Votre compte a été créé ! Un e-mail de confirmation vous a été envoyé. Veuillez cliquer sur le lien dans l\'e-mail pour activer votre compte avant de vous connecter.'
          );
          // Clear inputs
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
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
    <AuthShell
      title="Créer un compte."
      intro={<>Ensuite, ouvrez l&apos;application pour créer votre boutique : les {PRICING.trialDays} premiers jours sont gratuits.</>}
    >
      <div className="space-y-6">
        {errorMsg && <Notice kind="error">{errorMsg}</Notice>}
        {successMsg && <Notice kind="success">{successMsg}</Notice>}

        <button type="button" id="google-register-btn" onClick={handleGoogleSignIn} disabled={busy} className={buttonClasses('quiet', 'lg', 'w-full')}>
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

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="first-name-input"
              label="Prénom"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={busy}
            />
            <Field
              id="last-name-input"
              label="Nom"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={busy}
            />
          </div>
          <Field
            id="email-register-input"
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
            id="password-register-input"
            label="Mot de passe"
            autoComplete="new-password"
            hint="6 caractères minimum."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={busy}
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
          <PasswordField
            id="confirm-password-input"
            label="Confirmer le mot de passe"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={busy}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />
          <Button id="submit-register-btn" type="submit" size="lg" disabled={busy} className="w-full">
            {isSubmitting ? <Spinner /> : 'Créer mon compte'}
          </Button>
        </form>

        <p className="pt-4 text-lg">
          Vous avez déjà un compte&nbsp;?{' '}
          <AppLink to="/login" className="inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
            Se connecter
          </AppLink>
        </p>
      </div>
    </AuthShell>
  );
};
