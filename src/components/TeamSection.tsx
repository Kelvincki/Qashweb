import React from 'react';
import { UserCheck, Shield, ShoppingBag, BarChart3, ArrowRight } from 'lucide-react';

export const TeamSection: React.FC = () => {
  return (
    <section className="py-24 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-qash-red-500 mb-2 block">
            Organisation collaborative
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Une boutique. Une équipe. Une vision claire.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Déléguez l&apos;encaissement à vos vendeurs tout en conservant le contrôle exclusif sur vos marges, vos prix d&apos;achat et la gestion globale de votre boutique.
          </p>
        </div>

        {/* Roles and Workflow Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Role Gérant Card */}
          <div className="lg:col-span-6 rounded-3xl p-8 bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-qash-red-50 border border-qash-red-100 text-qash-red-600 text-xs font-bold">
                <Shield className="w-3.5 h-3.5 text-qash-red-600" />
                <span>Rôle : Gérant</span>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">
                Pilotage complet & supervision
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Le gérant dispose d&apos;un accès étendu pour gérer le catalogue, modifier les prix, suivre les marges réelles, superviser les totaux de caisse et ajouter ou retirer des employés.
              </p>
              <div className="space-y-2 pt-2 text-xs text-neutral-700">
                <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                  <span>Configuration des produits et prix d&apos;achat</span>
                  <span className="font-semibold text-qash-red-600">Autorisé</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                  <span>Accès aux bilans financiers & marges</span>
                  <span className="font-semibold text-qash-red-600">Autorisé</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                  <span>Gestion des membres de l&apos;équipe</span>
                  <span className="font-semibold text-qash-red-600">Autorisé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Employé Card */}
          <div className="lg:col-span-6 rounded-3xl p-8 bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-qash-gold-400/10 border border-qash-gold-600/20 text-qash-gold-600 text-xs font-bold">
                <UserCheck className="w-3.5 h-3.5 text-qash-gold-600" />
                <span>Rôle : Employé / Vendeur</span>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">
                Ventes & encaissement ciblés
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                L&apos;employé utilise une interface simplifiée et sécurisée dédiée à la vente, au scan et à l&apos;encaissement, sans pouvoir consulter les chiffres d&apos;affaires globaux ni modifier les paramètres sensibles.
              </p>
              <div className="space-y-2 pt-2 text-xs text-neutral-700">
                <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                  <span>Enregistrement des ventes & encaissement</span>
                  <span className="font-semibold text-qash-green-600">Autorisé</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                  <span>Scan du panier & consultation du catalogue</span>
                  <span className="font-semibold text-qash-green-600">Autorisé</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-neutral-200 flex items-center justify-between">
                  <span>Paramètres de boutique & données financières</span>
                  <span className="font-semibold text-neutral-400">Verrouillé</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chain Flow */}
        <div className="p-6 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-qash-gold-400 mb-1">
              Traçabilité garantie
            </div>
            <div className="text-sm text-neutral-300">
              Gérant <span className="text-qash-red-500">→</span> Employés <span className="text-qash-red-500">→</span> Ventes au comptoir <span className="text-qash-red-500">→</span> Suivi détaillé
            </div>
          </div>
          <div className="text-xs text-neutral-400 max-w-sm">
            Chaque vente est reliée au compte de l&apos;employé qui l&apos;a effectuée pour une réconciliation sereine en fin de journée.
          </div>
        </div>
      </div>
    </section>
  );
};
