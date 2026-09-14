import React from 'react';
import { ArrowRight, WifiOff, Scan, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

interface HomeHeroProps {
  onOpenStartModal: () => void;
  onExploreClick: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onOpenStartModal,
  onExploreClick,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-white via-neutral-50/50 to-neutral-50">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-12 right-1/4 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100/80 text-rose-700 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            <span>Gestion de boutique & Caisse POS nouvelle génération</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.12] mb-6">
            Votre boutique.{' '}
            <span className="text-rose-600">Simplifiée.</span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal mb-8 max-w-2xl mx-auto">
            La solution moderne pour gérer votre caisse, vos ventes, votre stock et votre équipe depuis une seule application.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onOpenStartModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
              style={{ backgroundColor: '#E11D48' }}
            >
              <span>Commencer avec QASH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-300/80 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Découvrir QASH
            </button>
          </div>

          {/* Quick trust tags */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-medium">
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-4 h-4 text-neutral-600" />
              <span>Fonctionne hors-ligne</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Outils IA intégrés</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Données cloisonnées</span>
            </div>
          </div>
        </div>

        {/* Product Visual Mockup */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl md:rounded-3xl border border-neutral-200/90 bg-white shadow-xl overflow-hidden p-2 sm:p-4 bg-neutral-900/5">
            {/* Top Device Bar */}
            <div className="bg-neutral-900 text-white rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-inner">
              {/* App Status Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-sm">
                    Q
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Ma Boutique QASH</div>
                    <div className="text-xs text-neutral-400">Session ouverte · Rôle : Gérant</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Synchronisé
                  </span>
                </div>
              </div>

              {/* Grid content inside app preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left Column: Quick POS stats & modes */}
                <div className="space-y-3 bg-neutral-800/60 p-3.5 rounded-xl border border-neutral-700/60">
                  <div className="text-xs text-neutral-400 font-medium">Activité du jour (Exemple)</div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    185 000 <span className="text-sm font-normal text-neutral-300">FCFA</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-neutral-700/50">
                    <span>14 ventes enregistrées</span>
                    <span className="text-emerald-400 font-medium">Caisse équilibrée</span>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold mb-2">
                      Raccourcis caisse
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-neutral-700/70 text-white flex items-center gap-2 font-medium">
                        <Scan className="w-4 h-4 text-amber-400" />
                        <span>Scan IA</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-neutral-700/70 text-white flex items-center gap-2 font-medium">
                        <ShoppingBag className="w-4 h-4 text-rose-400" />
                        <span>Catalogue</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center / Right Column: Active Sale Register UI */}
                <div className="md:col-span-2 bg-neutral-800/40 p-4 rounded-xl border border-neutral-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="text-neutral-300 font-semibold uppercase tracking-wider">
                        Vente en cours #014
                      </span>
                      <span className="text-amber-400 text-xs font-medium">
                        Scan panier validé
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-700/40 text-neutral-200">
                        <span>Savon Douceur 200g (x2)</span>
                        <span className="font-semibold text-white">1 500 FCFA</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-700/40 text-neutral-200">
                        <span>Huile Alimentaire Raffinée 1L</span>
                        <span className="font-semibold text-white">2 200 FCFA</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-700/40 text-neutral-200">
                        <span>Pack Boisson Énergisante 33cl (x3)</span>
                        <span className="font-semibold text-white">1 500 FCFA</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-700/70 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-neutral-400">Total à encaisser</div>
                      <div className="text-xl font-bold text-white">5 200 FCFA</div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-rose-600 text-white font-semibold text-xs rounded-lg hover:bg-rose-500 transition-colors shadow-sm"
                      style={{ backgroundColor: '#E11D48' }}
                    >
                      Valider l&apos;encaissement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-neutral-600 mt-3">
            Interface illustrative de l&apos;application QASH pour commerçants (vue caisse & suivi).
          </p>
        </div>
      </div>
    </section>
  );
};
