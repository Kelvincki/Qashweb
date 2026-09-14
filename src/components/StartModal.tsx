import React from 'react';
import { X, CheckCircle2, Store, Smartphone } from 'lucide-react';

interface StartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartModal: React.FC<StartModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Fermer la fenêtre"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
          <Store className="w-6 h-6" />
        </div>

        <h3 id="modal-title" className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">
          Rejoindre QASH
        </h3>

        <p className="text-neutral-600 text-sm leading-relaxed mb-6">
          QASH est actuellement déployé auprès des commerçants partenaires. L&apos;application sera accessible prochainement sur les stores officiels.
        </p>

        <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100 mb-6">
          <div className="flex items-start gap-3 text-sm text-neutral-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Déploiement et configuration assistée de votre boutique</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-neutral-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Application mobile & tablette prête pour votre équipe</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-neutral-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Tarification transparente sans frais cachés</span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center gap-2 mb-6">
          <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Activation officielle lors du lancement public.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          style={{ backgroundColor: '#E11D48' }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
