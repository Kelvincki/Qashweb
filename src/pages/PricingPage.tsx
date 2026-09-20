import React, { useState } from 'react';
import { Minus, Plus, Check, HelpCircle, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { FaqItem } from '../types';

interface PricingPageProps {
  onOpenStartModal: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenStartModal }) => {
  // State for interactive calculator
  const [managers, setManagers] = useState<number>(1);
  const [employees, setEmployees] = useState<number>(2);

  // FAQ state: open accordion items
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Constants
  const PRICE_PER_MANAGER = 5000;
  const PRICE_PER_EMPLOYEE = 3500;

  // Formatting helper: "12 000 FCFA" (no decimals, space separator)
  const formatPrice = (amount: number): string => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  };

  const handleManagerChange = (delta: number) => {
    setManagers((prev) => {
      const nextVal = Math.max(0, prev + delta);
      if (nextVal > 0) {
        setEmployees(0);
      }
      return nextVal;
    });
  };

  const handleEmployeeChange = (delta: number) => {
    setEmployees((prev) => {
      const nextVal = Math.max(0, prev + delta);
      if (nextVal > 0) {
        setManagers(0);
      }
      return nextVal;
    });
  };

  const managersTotal = managers * PRICE_PER_MANAGER;
  const employeesTotal = employees * PRICE_PER_EMPLOYEE;
  const grandTotal = managersTotal + employeesTotal;

  // Features list as explicitly defined in prompt section 22.3
  const includedFeatures = [
    'Caisse',
    'Gestion des ventes',
    'Gestion des produits',
    'Gestion du stock',
    'Scan de factures IA',
    'Scan du panier IA',
    'Bilan & performances',
    'Gestion des employés',
    'Offline-first',
    'Synchronisation cloud',
  ];

  // Factual FAQ items as requested in prompt section 22.4
  const faqItems: FaqItem[] = [
    {
      question: 'Comment fonctionne la tarification ?',
      answer:
        'La tarification QASH est un abonnement mensuel simple sans engagement. Elle comprend un forfait de 5 000 FCFA par mois pour le compte gérant, auquel s’ajoute 3 500 FCFA par mois pour chaque compte employé activé.',
    },
    {
      question: 'Combien coûte un employé supplémentaire ?',
      answer:
        'Chaque compte employé supplémentaire est facturé 3 500 FCFA par mois. Les employés disposent de leur propre identifiant sécurisé pour encaisser au comptoir.',
    },
    {
      question: 'Puis-je ajouter des employés plus tard ?',
      answer:
        'Oui. Vous pouvez créer de nouveaux accès employés à tout moment depuis votre espace gérant au fur et à mesure que votre équipe s’agrandit.',
    },
    {
      question: 'Puis-je réduire mon équipe ?',
      answer:
        'Oui. Si un employé quitte votre boutique ou si vos effectifs évoluent, vous pouvez désactiver son accès directement pour ajuster votre abonnement.',
    },
    {
      question: 'QASH fonctionne-t-il sans Internet ?',
      answer:
        'Oui. Grâce à l’architecture Offline-first de QASH, vous continuez à enregistrer vos ventes même en cas de coupure de réseau. Dès que la connexion revient, les données sont synchronisées automatiquement avec le cloud.',
    },
    {
      question: 'Que se passe-t-il si mon abonnement expire ?',
      answer:
        'Cette information sera précisée prochainement lors de l’ouverture officielle des abonnements.',
    },
  ];

  return (
    <div className="py-12 sm:py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-qash-red-50 text-qash-red-600 mb-4 border border-qash-red-100">
            <span>Abonnement mensuel transparent</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Des tarifs simples et transparents.
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Choisissez votre équipe et adaptez QASH à votre boutique.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Card Gérant */}
          <motion.div
            onClick={() => {
              if (managers === 0) {
                setManagers(1);
                setEmployees(0); // Only allow one selected plan
              } else {
                setManagers(0);
              }
            }}
            whileHover={{ y: -6 }}
            className={`rounded-3xl bg-white p-8 sm:p-10 shadow-sm relative flex flex-col justify-between cursor-pointer border-2 transition-all duration-300 ${
              managers > 0
                ? 'border-qash-red-500 ring-4 ring-qash-red-500/5 shadow-md'
                : 'border-neutral-200/90 hover:border-neutral-300'
            }`}
          >
            {managers > 0 && (
              <div className="absolute -top-3.5 left-8 px-3 py-0.5 bg-qash-red-500 text-white font-bold text-xs rounded-full uppercase tracking-wider animate-pulse">
                Sélectionné
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-qash-red-500 uppercase tracking-wider">
                  Compte d&apos;administration
                </span>
                {managers > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-qash-red-50 text-qash-red-600 text-xs font-semibold border border-qash-red-100">
                    <Check className="w-3 h-3" /> Actif ({managers})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-xs font-semibold">
                    Inactif
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2 font-display">
                Gérant
              </h2>
              <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                Supervision totale de la boutique, gestion des stocks, des prix et accès aux bilans financiers.
              </p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
                  5 000
                </span>
                <span className="text-neutral-600 font-semibold ml-2 text-lg">
                  FCFA / mois
                </span>
              </div>
              <p className="text-xs text-neutral-500 pb-6 border-b border-neutral-100">
                Optionnel — pour les administrateurs et décideurs de la boutique
              </p>
            </div>

            <div className="pt-6">
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Accès complet aux paramètres de la boutique</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Gestion des marges et du chiffre d&apos;affaires</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Toutes les fonctionnalités IA & Offline incluses</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Card Employé */}
          <motion.div
            onClick={() => {
              if (employees === 0) {
                setEmployees(1);
                setManagers(0); // Only allow one selected plan
              } else {
                setEmployees(0);
              }
            }}
            whileHover={{ y: -6 }}
            className={`rounded-3xl bg-white p-8 sm:p-10 shadow-xs flex flex-col justify-between cursor-pointer border-2 transition-all ${
              employees > 0
                ? 'border-qash-gold-500 ring-4 ring-qash-gold-500/5 shadow-md'
                : 'border-neutral-200/90 hover:border-neutral-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-qash-gold-600 uppercase tracking-wider">
                  Pour chaque collaborateur
                </span>
                {employees > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-qash-gold-50 text-qash-gold-700 text-xs font-semibold border border-qash-gold-100">
                    <Check className="w-3 h-3 text-qash-gold-600" /> Actif ({employees})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-xs font-semibold">
                    Inactif
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2 font-display">
                Employé
              </h2>
              <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                Compte dédié à la vente au comptoir, au scan des articles et à l&apos;encaissement sans accès aux chiffres sensibles.
              </p>
              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
                  3 500
                </span>
                <span className="text-neutral-600 font-semibold ml-2 text-lg">
                  FCFA / mois
                </span>
              </div>
              <p className="text-xs text-neutral-500 pb-6 border-b border-neutral-100">
                Facturé par employé supplémentaire actif
              </p>
            </div>

            <div className="pt-6">
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Interface de caisse rapide et intuitive</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Scan du panier IA pour encaissement fluide</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-qash-green-600 shrink-0" />
                  <span>Traçabilité des ventes de chaque vendeur</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Calculator Section */}
        <div className="max-w-3xl mx-auto mb-20 bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/90 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
              Calculateur de tarif
            </h2>
            <p className="text-neutral-600 text-sm">
              Simulez le coût mensuel selon la taille de votre équipe.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Votre équipe
            </div>

            {/* Manager selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 gap-4">
              <div>
                <div className="font-bold text-neutral-900 text-base">Gérants</div>
                <div className="text-xs text-neutral-500">
                  {formatPrice(PRICE_PER_MANAGER)} / mois par gérant
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleManagerChange(-1)}
                  disabled={managers <= 0}
                  className="w-11 h-11 rounded-xl bg-white border border-neutral-300 text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs"
                  aria-label="Diminuer le nombre de gérants"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <span className="w-12 text-center text-xl font-bold text-neutral-900 select-none">
                  {managers}
                </span>

                <button
                  type="button"
                  onClick={() => handleManagerChange(1)}
                  className="w-11 h-11 rounded-xl bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs"
                  aria-label="Augmenter le nombre de gérants"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Employees selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 gap-4">
              <div>
                <div className="font-bold text-neutral-900 text-base">Employés</div>
                <div className="text-xs text-neutral-500">
                  {formatPrice(PRICE_PER_EMPLOYEE)} / mois par employé
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleEmployeeChange(-1)}
                  disabled={employees <= 0}
                  className="w-11 h-11 rounded-xl bg-white border border-neutral-300 text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs"
                  aria-label="Diminuer le nombre d'employés"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <span className="w-12 text-center text-xl font-bold text-neutral-900 select-none">
                  {employees}
                </span>

                <button
                  type="button"
                  onClick={() => handleEmployeeChange(1)}
                  className="w-11 h-11 rounded-xl bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs"
                  aria-label="Augmenter le nombre d'employés"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="p-5 rounded-2xl bg-neutral-100/70 space-y-3 text-sm border border-neutral-200">
              <div className="flex items-center justify-between text-neutral-700">
                <span>
                  {managers} gérant{managers > 1 ? 's' : ''} ({formatPrice(PRICE_PER_MANAGER)})
                </span>
                <span className="font-semibold text-neutral-900">{formatPrice(managersTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-700">
                <span>
                  {employees} employé{employees > 1 ? 's' : ''} ({formatPrice(PRICE_PER_EMPLOYEE)})
                </span>
                <span className="font-semibold text-neutral-900">{formatPrice(employeesTotal)}</span>
              </div>

              {/* Total Row */}
              <div className="pt-4 border-t border-neutral-300/80 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-neutral-500">
                    Total mensuel
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-qash-red-500 tracking-tight">
                    {formatPrice(grandTotal)}{' '}
                    <span className="text-xs font-normal text-neutral-500">/ mois</span>
                  </div>
                </div>

                <button
                  onClick={onOpenStartModal}
                  className="px-5 py-2.5 rounded-xl bg-qash-red-500 hover:bg-qash-red-600 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
                >
                  Commencer avec QASH
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Included Features Section */}
        <div className="max-w-4xl mx-auto mb-20 bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/90 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-qash-green-600 mb-1 block">
              Inclus sans surcoût
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
              Fonctionnalités incluses
            </h2>
            <p className="text-neutral-600 text-sm">
              Toutes les fonctions sont actives dès votre abonnement, sans option payante cachée.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {includedFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 text-sm font-semibold text-neutral-800"
              >
                <div className="w-5 h-5 rounded-full bg-qash-green-50 text-qash-green-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-qash-red-500 mb-1 block">
              Questions fréquentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
              Foire aux questions
            </h2>
            <p className="text-neutral-600 text-sm">
              Des réponses claires et factuelles sur le fonctionnement des abonnements QASH.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-neutral-200 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-sm sm:text-base text-neutral-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/60 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-qash-red-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Page CTA */}
        <div className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-neutral-900 text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">
            Prêt à équiper votre boutique ?
          </h3>
          <p className="text-neutral-400 text-sm sm:text-base mb-6 max-w-xl mx-auto leading-relaxed">
            Rejoignez les commerçants qui simplifient leur gestion quotidienne avec QASH.
          </p>
          <button
            onClick={onOpenStartModal}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-qash-red-500 hover:bg-qash-red-600 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm"
          >
            <span>Commencer avec QASH</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
