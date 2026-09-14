import React from 'react';
import { KeyRound, Lock, Split, ShieldCheck, ShieldAlert } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const securityPillars = [
    {
      icon: KeyRound,
      title: 'Authentification individuelle',
      desc: 'Chaque utilisateur se connecte avec ses propres identifiants vérifiés.',
    },
    {
      icon: Lock,
      title: 'Gestion stricte des permissions',
      desc: 'Séparation rigoureuse des droits d’accès selon le profil gérant ou employé.',
    },
    {
      icon: Split,
      title: 'Séparation étanche des boutiques',
      desc: 'Chaque commerce dispose d’un environnement de données autonome et isolé.',
    },
    {
      icon: ShieldCheck,
      title: 'Synchronisation sécurisée',
      desc: 'Les échanges entre l’appareil et l’infrastructure cloud sont chiffrés et vérifiés.',
    },
  ];

  return (
    <section className="py-20 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2 block">
            Confidentialité & intégrité
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-3">
            Vos données, protégées.
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
            QASH applique des standards stricts d&apos;ingénierie logicielle pour assurer l&apos;étanchéité de vos comptes et la protection de vos informations commerciales.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
