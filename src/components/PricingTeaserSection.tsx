import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { PageRoute } from '../types';

interface PricingTeaserSectionProps {
  onNavigate: (route: PageRoute) => void;
}

export const PricingTeaserSection: React.FC<PricingTeaserSectionProps> = ({
  onNavigate,
}) => {
  return (
    <section className="py-24 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-qash-red-500 mb-2 block">
            Abonnement mensuel
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Un prix simple pour une gestion plus simple.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Une tarification prévisible, sans engagement long terme et calculée au plus juste selon la taille de votre équipe.
          </p>
        </div>

        {/* Pricing Teaser Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Gérant Card */}
          <div className="rounded-3xl border-2 border-qash-red-500/30 bg-qash-red-50/20 p-8 sm:p-10 flex flex-col justify-between shadow-xs">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-qash-red-50 border border-qash-red-100 text-qash-red-600 text-xs font-bold mb-4">
                Compte principal
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Gérant
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm mb-6">
                Accès administrateur complet pour piloter le commerce, les prix et les bilans.
              </p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
                  5 000
                </span>
                <span className="text-neutral-600 font-semibold ml-2 text-base sm:text-lg">
                  FCFA / mois
                </span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Gestion complète de la boutique</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Tous les outils IA & Offline-first inclus</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Employé Card */}
          <div className="rounded-3xl border border-neutral-200/90 bg-neutral-50/60 p-8 sm:p-10 flex flex-col justify-between shadow-xs">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-qash-gold-400/10 border border-qash-gold-600/20 text-qash-gold-600 text-xs font-bold mb-4">
                Par membre supplémentaire
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Employé
              </h3>
              <p className="text-neutral-600 text-xs sm:text-sm mb-6">
                Compte vendeur dédié pour enregistrer les ventes et les encaissements au comptoir.
              </p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
                  3 500
                </span>
                <span className="text-neutral-600 font-semibold ml-2 text-base sm:text-lg">
                  FCFA / mois
                </span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Accès caisse & scan panier sécurisé</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Suivi individuel par vendeur</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA to /pricing */}
        <div className="text-center">
          <button
            onClick={() => onNavigate('/pricing')}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 text-base font-semibold text-white bg-qash-red-500 hover:bg-qash-red-600 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Voir les tarifs et le calculateur</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
