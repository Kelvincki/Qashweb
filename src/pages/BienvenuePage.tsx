import React, { useEffect } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { QashLogo } from '../components/QashLogo';
import { PageRoute } from '../types';

interface BienvenuePageProps {
  onNavigate: (route: PageRoute) => void;
}

const STEPS: Array<{ title: string; text: React.ReactNode }> = [
  {
    title: 'Ouvrez l’application QASH et connectez-vous',
    text: 'Connectez-vous avec votre compte QASH.',
  },
  {
    title: 'Choisissez votre profil',
    text: (
      <>
        <strong className="text-neutral-900">Gérant</strong> pour créer votre boutique, ou{' '}
        <strong className="text-neutral-900">Employé</strong> pour rejoindre une boutique avec un code d&apos;invitation.
      </>
    ),
  },
  {
    title: 'Profitez de 3 jours d’essai gratuit',
    text: 'L’essai vous permet de découvrir QASH avant tout paiement.',
  },
];

export const BienvenuePage: React.FC<BienvenuePageProps> = ({ onNavigate }) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Bienvenue sur QASH';
    window.scrollTo({ top: 0 });
    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-qash-surface" id="bienvenue-page">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white border border-qash-border rounded-2xl p-8 shadow-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <QashLogo className="h-10 text-qash-ink" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-qash-ink text-center">
            Bienvenue sur QASH
          </h1>
          <p className="text-neutral-500 text-sm mt-2 text-center">
            Voici comment démarrer en trois étapes.
          </p>
        </div>

        <ol className="space-y-4 mb-8">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80"
            >
              <span
                className="w-8 h-8 rounded-full bg-qash-ink text-white text-sm font-bold flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div>
                <p className="font-bold text-neutral-900 text-sm">{step.title}</p>
                <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 mb-8">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            L&apos;essai commence à la création de la boutique. Le paiement se fait uniquement depuis la page{' '}
            <button
              type="button"
              onClick={() => onNavigate('/pricing')}
              className="font-bold underline cursor-pointer hover:text-amber-950"
            >
              Tarifs
            </button>{' '}
            du site.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            className="flex-1 min-h-[48px] py-3 bg-qash-red-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-qash-red-600 focus:outline-none focus:ring-2 focus:ring-qash-red-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Mon espace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex-1 min-h-[48px] py-3 bg-white border border-qash-border text-qash-ink rounded-xl font-medium text-sm flex items-center justify-center hover:bg-qash-surface focus:outline-none focus:ring-2 focus:ring-qash-red-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </motion.div>
    </div>
  );
};
