import React from 'react';
import { ScanText, ShoppingCart, Check, Sparkles } from 'lucide-react';

export const AiSection: React.FC = () => {
  return (
    <section className="py-24 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Automatisation utile & concrète</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight mb-4">
            L&apos;intelligence artificielle au service de votre boutique.
          </h2>
          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
            Chez QASH, l&apos;intelligence artificielle n&apos;est pas un gadget : c&apos;est un assistant pratique dédié à deux opérations répétitives et chronophages pour vous faire gagner de précieuses minutes à chaque arrivage et lors de chaque encaissement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Scan de factures */}
          <div className="rounded-3xl border border-neutral-200/90 bg-neutral-50/60 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-6 shadow-xs" style={{ backgroundColor: '#E11D48' }}>
                <ScanText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1 block">
                Module 01
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
                Scan de factures IA
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Ne passez plus des heures à recopier ligne par ligne les factures de vos grossistes. Prenez une photo de votre facture papier ou importez le document numérique : QASH extrait les désignations, quantités et coûts d&apos;achat pour alimenter directement votre stock après votre validation.
              </p>

              <div className="space-y-2.5 text-xs text-neutral-700 font-medium bg-white p-4 rounded-xl border border-neutral-200/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Lecture optique et reconnaissance des lignes produits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Préremplissage des quantités et des prix fournisseurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Validation humaine préalable avant mise en stock définitive</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-200/80 flex items-center justify-between text-xs text-neutral-500">
              <span>Gain de temps à l&apos;approvisionnement</span>
              <span className="font-semibold text-rose-600">Zéro ressaisie papier</span>
            </div>
          </div>

          {/* Card 2: Scan du panier */}
          <div className="rounded-3xl border border-neutral-200/90 bg-neutral-50/60 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-xs">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 block">
                Module 02
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
                Scan du panier IA
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Lors des heures d&apos;affluence, chaque seconde compte au comptoir. Pointez la caméra vers le panier ou les articles posés devant vous : la reconnaissance visuelle identifie les articles présents, compose la vente et calcule le total en un instant.
              </p>

              <div className="space-y-2.5 text-xs text-neutral-700 font-medium bg-white p-4 rounded-xl border border-neutral-200/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Détection rapide des articles du panier</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Réduction drastique du temps d&apos;attente en caisse</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ajustement manuel toujours possible en un toucher</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-200/80 flex items-center justify-between text-xs text-neutral-500">
              <span>Fluidité du comptoir</span>
              <span className="font-semibold text-amber-600">Encaissement accéléré</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
