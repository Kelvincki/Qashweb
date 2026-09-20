import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { PageRoute } from '../types';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { QashLogo } from '../components/QashLogo';
import { GoogleIcon } from '../components/GoogleIcon';

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

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      onNavigate('/dashboard');
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
      <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50" id="register-loading">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-neutral-50" id="register-page">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl p-8 shadow-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <QashLogo className="h-10 text-neutral-900" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 text-center">
            Créer un compte QASH
          </h1>
          <p className="text-neutral-500 text-sm mt-2 text-center">
            Rejoignez QASH et simplifiez la gestion de votre boutique
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          id="google-register-btn"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleLoading}
          className="w-full py-3 px-4 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-800 font-medium text-sm rounded-xl flex items-center justify-center gap-3 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-xs active:scale-[0.99] mb-6"
        >
          {isGoogleLoading ? (
            <div className="w-5 h-5 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>Continuer avec Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-neutral-200/80 w-full"></div>
          <span className="bg-white px-3 text-xs text-neutral-400 font-semibold uppercase tracking-wider absolute">
            ou
          </span>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first-name-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Prénom
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  id="first-name-input"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  required
                  disabled={isSubmitting || isGoogleLoading}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all text-sm disabled:opacity-60"
                />
              </div>
            </div>
            <div>
              <label htmlFor="last-name-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Nom
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  id="last-name-input"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  required
                  disabled={isSubmitting || isGoogleLoading}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all text-sm disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email-register-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Adresse e-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email-register-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={isSubmitting || isGoogleLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all text-sm disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-register-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password-register-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                required
                disabled={isSubmitting || isGoogleLoading}
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all text-sm disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || isGoogleLoading}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isSubmitting || isGoogleLoading}
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all text-sm disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting || isGoogleLoading}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="submit-register-btn"
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full py-3 bg-neutral-900 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-3"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-sm text-neutral-500">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => onNavigate('/login')}
              className="font-semibold text-neutral-900 hover:underline focus:outline-none cursor-pointer"
            >
              Se connecter
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
