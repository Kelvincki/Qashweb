import React from 'react';
import { PackageX, Layers, Calculator, FileText, EyeOff, Users, WifiOff } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: PackageX,
      title: 'Suivi du stock compliqué',
      desc: 'Des ruptures imprévues ou des surplus immobilisés faute de visibilité en temps réel.',
    },
    {
      icon: Layers,
      title: 'Ventes difficiles à centraliser',
      desc: 'Des ventes notées sur des carnets qui se perdent ou se contredisent en fin de mois.',
    },
    {
      icon: Calculator,
      title: 'Erreurs de saisie',
      desc: 'Des erreurs de calcul manuel lors des encaissements ou des totaux de caisse faussés.',
    },
    {
      icon: FileText,
      title: 'Factures papier encombrantes',
      desc: 'Des piles de factures fournisseurs difficiles à retranscrire manuellement dans le stock.',
    },
    {
      icon: EyeOff,
      title: 'Manque de visibilité',
      desc: 'Difficile de savoir précisément quel est le bénéfice réel ou quel produit se vend le mieux.',
    },
    {
      icon: Users,
      title: 'Gestion des employés dispersée',
      desc: 'Manque de clarté sur qui a encaissé quoi et absence de permissions adaptées par rôle.',
    },
    {
      icon: WifiOff,
      title: 'Dépendance excessive à Internet',
      desc: 'Blocage total des ventes et de la caisse dès que le réseau cellulaire ou Wi-Fi est coupé.',
    },
  ];

  return (
    <section className="py-20 bg-white border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2 block">
            Les défis du quotidien
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Une boutique ne devrait pas être compliquée à gérer.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Chaque jour, les commerçants perdent un temps précieux avec des outils inadaptés ou des méthodes manuelles qui ralentissent la croissance de leur commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 hover:border-neutral-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-200/80 text-neutral-700 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
