import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FinalCtaSectionProps {
  onOpenStartModal: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onOpenStartModal,
}) => {
  return (
    <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
      {/* Subtle ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold mb-6 border border-neutral-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Modernisez votre point de vente</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
          Prêt à simplifier votre boutique ?
        </h2>

        <p className="text-neutral-300 text-base sm:text-xl font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
          Découvrez une nouvelle façon de gérer votre activité.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenStartModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-lg transition-all duration-150 cursor-pointer"
            style={{ backgroundColor: '#E11D48' }}
          >
            <span>Commencer avec QASH</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
