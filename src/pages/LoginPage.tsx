import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../lib/supabase';
import { PageRoute } from '../types';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { QashLogo } from '../components/QashLogo';
import { GoogleIcon } from '../components/GoogleIcon';

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

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      onNavigate('/dashboard');
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
        // Redirect will happen via useEffect onAuthChange
        onNavigate('/dashboard');
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
      <div className="min-h-[70vh] flex items-center justify-center bg-qash-surface" id="login-loading">
        <div className="w-8 h-8 border-2 border-qash-ink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-qash-surface" id="login-page">
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
            Bienvenue sur QASH
          </h1>
          <p className="text-neutral-500 text-sm mt-2 text-center">
            Connectez-vous pour gérer votre espace commerçant
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-qash-red-50 border border-qash-red-100 rounded-xl flex items-start gap-3 text-qash-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-qash-red-500 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {infoMsg && (
          <div className="mb-6 p-4 bg-qash-green-50 border border-qash-green-600/20 rounded-xl flex items-start gap-3 text-qash-green-600 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-qash-green-500 mt-0.5" />
            <div>{infoMsg}</div>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          id="google-login-btn"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleLoading}
          className="w-full py-3 px-4 bg-white border border-qash-border hover:bg-qash-surface hover:border-neutral-300 text-qash-ink font-medium text-sm rounded-xl flex items-center justify-center gap-3 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-xs active:scale-[0.99] mb-6"
        >
          {isGoogleLoading ? (
            <div className="w-5 h-5 border-2 border-qash-ink border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>Continuer avec Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-qash-border w-full"></div>
          <span className="bg-white px-3 text-xs text-neutral-400 font-semibold uppercase tracking-wider absolute">
            ou
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Adresse e-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={isSubmitting || isGoogleLoading}
                className="w-full pl-10 pr-4 py-3 bg-qash-surface border border-qash-border rounded-xl text-qash-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-qash-red-500/10 focus:border-qash-red-500 transition-all text-sm disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password-input" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Mot de passe
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isSubmitting || isGoogleLoading}
                className="w-full pl-10 pr-10 py-3 bg-qash-surface border border-qash-border rounded-xl text-qash-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-qash-red-500/10 focus:border-qash-red-500 transition-all text-sm disabled:opacity-60"
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

          <button
            id="submit-login-btn"
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full py-3.5 bg-qash-red-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-qash-red-600 active:bg-qash-red-700 focus:outline-none focus:ring-2 focus:ring-qash-red-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Se connecter
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-qash-border text-center">
          <p className="text-sm text-neutral-500">
            Nouveau sur QASH ?{' '}
            <button
              onClick={() => onNavigate('/register')}
              className="font-semibold text-qash-ink hover:underline focus:outline-none cursor-pointer"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
