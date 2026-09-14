import React from 'react';
import { ShoppingBag, Store, Building2, ShoppingCart, Briefcase, Users } from 'lucide-react';

export const AudienceSection: React.FC = () => {
  const audiences = [
    {
      icon: Store,
      name: 'Boutiques & Prêt-à-porter',
      desc: 'Gestion des articles, des ventes au comptoir et des arrivages réguliers.',
    },
    {
      icon: ShoppingCart,
      name: 'Épiceries & Alimentation',
      desc: 'Encaissement rapide de petits paniers et suivi rigoureux des stocks sensibles.',
    },
    {
      icon: ShoppingBag,
      name: 'Magasins de détail',
      desc: 'Catalogue multi-produits avec visibilité claire des volumes disponibles.',
    },
    {
      icon: Building2,
      name: 'Commerces de proximité',
      desc: 'Outil tout-en-un léger, utilisable sur smartphone ou tablette sans matériel lourd.',
    },
    {
      icon: Briefcase,
      name: 'Petites entreprises',
      desc: 'Suivi journalier du chiffre d’affaires et contrôle des recettes par point de vente.',
    },
    {
      icon: Users,
      name: 'Équipes de vente',
      desc: 'Délégation sécurisée des ventes avec comptes individuels pour chaque vendeur.',
    },
  ];

  return (
    <section className="py-24 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2 block">
            Adaptabilité
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Pensé pour les commerçants.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Quelle que soit votre activité de vente au détail, QASH s&apos;adapte à la réalité de votre boutique sans nécessiter d&apos;installation matérielle complexe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 hover:border-neutral-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 text-rose-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                  {item.name}
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
