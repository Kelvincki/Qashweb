import React from 'react';
import { CreditCard, TrendingUp, Boxes, Tag, Users2, BarChart3, ArrowRight } from 'lucide-react';

export const SolutionSection: React.FC = () => {
  const pillars = [
    {
      icon: CreditCard,
      name: 'Caisse',
      detail: 'Encaissement fluide, saisie rapide et gestion des règlements.',
    },
    {
      icon: TrendingUp,
      name: 'Ventes',
      detail: 'Historique exhaustif, suivi des transactions par jour et par vendeur.',
    },
    {
      icon: Boxes,
      name: 'Stock',
      detail: 'Quantités en temps réel, alertes de seuil et réapprovisionnement.',
    },
    {
      icon: Tag,
      name: 'Produits',
      detail: 'Catalogue clair, variantes, prix d’achat et prix de vente.',
    },
    {
      icon: Users2,
      name: 'Employés',
      detail: 'Rôles gérant et employés, permissions adaptées et suivi d’équipe.',
    },
    {
      icon: BarChart3,
      name: 'Performances',
      detail: 'Chiffre d’affaires, marges et produits les plus demandés.',
    },
  ];

  return (
    <section id="solution" className="py-20 bg-neutral-900 text-white relative overflow-hidden">
      {/* Decorative ambient subtle circle */}
      <div className="absolute top-1/2 -right-32 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 block">
            Solution Unifiée
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Tout ce dont votre boutique a besoin, au même endroit.
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg leading-relaxed">
            QASH rassemble l&apos;ensemble des fonctions vitales de votre commerce dans une application intuitive, conçue pour vous faire gagner du temps chaque jour.
          </p>
        </div>

        {/* Centralization Equation Display */}
        <div className="mb-14 p-4 sm:p-6 bg-neutral-800/80 border border-neutral-700/80 rounded-2xl max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-neutral-200">
            <span className="px-3 py-1.5 rounded-lg bg-neutral-700/90 text-white">Caisse</span>
            <span className="text-rose-400 font-bold">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-neutral-700/90 text-white">Ventes</span>
            <span className="text-rose-400 font-bold">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-neutral-700/90 text-white">Stock</span>
            <span className="text-rose-400 font-bold">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-neutral-700/90 text-white">Produits</span>
            <span className="text-rose-400 font-bold">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-neutral-700/90 text-white">Employés</span>
            <span className="text-rose-400 font-bold">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-neutral-700/90 text-white">Performances</span>
            <span className="text-amber-400 font-bold px-1">=</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-extrabold shadow-xs" style={{ backgroundColor: '#E11D48' }}>
              QASH
            </span>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-800/60 border border-neutral-700/70 hover:border-neutral-600 transition-all duration-150"
              >
                <div className="w-11 h-11 rounded-xl bg-neutral-700 text-amber-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span>{item.name}</span>
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
