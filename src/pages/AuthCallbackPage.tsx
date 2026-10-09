import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { PageRoute } from '../types';
import { motion } from 'motion/react';
import { QashLogo } from '../components/QashLogo';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface AuthCallbackPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ onNavigate }) => {
  const { user, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if there are error parameters in URL query or hash fragment
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const error = searchParams.get('error') || hashParams.get('error');
    const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

    if (error || errorDescription) {
      const decodedMsg = errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : 'L\'authentification avec Google a échoué ou a été annulée.';
      setErrorMessage(decodedMsg);
      return;
    }

    // If user is authenticated, redirect to destination
    if (!loading && user) {
      let target: PageRoute = '/dashboard';
      if (typeof window !== 'undefined') {
        const saved = (sessionStorage.getItem('qash_redirect_after_login') ||
          sessionStorage.getItem('redirect_after_login')) as PageRoute | null;
        if (saved) {
          sessionStorage.removeItem('qash_redirect_after_login');
          sessionStorage.removeItem('redirect_after_login');
          target = saved;
        }
      }
      onNavigate(target);
    }
  }, [user, loading, onNavigate]);

  if (errorMessage) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-qash-surface" id="auth-callback-error">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white border border-qash-border rounded-2xl p-8 shadow-sm text-center"
        >
          <div className="w-12 h-12 rounded-full bg-qash-red-50 text-qash-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-qash-ink mb-2">
            Échec de l'authentification
          </h2>
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <button
            onClick={() => onNavigate('/login')}
            className="w-full py-3 bg-qash-red-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-qash-red-600 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 bg-qash-surface" id="auth-callback-loading">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <QashLogo className="h-10 text-qash-ink mb-6" />
        <div className="w-8 h-8 border-2 border-qash-ink border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-base font-semibold text-neutral-800">
          Authentification en cours...
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          Veuillez patienter pendant la validation de votre session QASH.
        </p>
      </motion.div>
    </div>
  );
};
