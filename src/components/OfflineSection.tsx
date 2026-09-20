import React from 'react';
import { WifiOff, HardDrive, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

export const OfflineSection: React.FC = () => {
  return (
    <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold mb-4">
            <WifiOff className="w-3.5 h-3.5 text-qash-red-500" />
            <span>Résilience réseau éprouvée</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Vendez même lorsque la connexion disparaît.
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg leading-relaxed">
            Les coupures d&apos;électricité ou d&apos;accès Internet ne doivent pas paralyser votre tiroir-caisse ni vous faire perdre de clients. QASH a été bâti dès le départ sur une architecture Offline-first pour garantir la continuité de votre commerce.
          </p>
        </div>

        {/* 3-Step Schematic Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Step 1 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-800/80 border border-neutral-700 relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-neutral-700 text-qash-red-500 flex items-center justify-center mb-6">
                <WifiOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-qash-red-500 mb-1 block">
                Étape 1
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Réseau indisponible
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Le Wi-Fi ou les données mobiles s&apos;interrompent. L&apos;application QASH reste totalement réactive et vous permet d&apos;enregistrer vos ventes normalement.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-700 text-xs text-neutral-500 font-medium">
              Aucun blocage d&apos;écran
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-800/80 border border-neutral-700 relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-neutral-700 text-qash-gold-400 flex items-center justify-center mb-6">
                <HardDrive className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-qash-gold-400 mb-1 block">
                Étape 2
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Enregistrement local
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Les transactions, montants et décrémentations de stock nécessaires sont enregistrés de façon sécurisée sur la mémoire locale de votre appareil.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-700 text-xs text-neutral-500 font-medium">
              Sauvegarde locale instantanée
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-800/80 border border-neutral-700 relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-neutral-700 text-qash-green-500 flex items-center justify-center mb-6">
                <RefreshCw className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-qash-green-500 mb-1 block">
                Étape 3
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Synchronisation automatique
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Dès que la connexion Internet est rétablie, l&apos;ensemble des données enregistrées hors-ligne se synchronise automatiquement avec le serveur cloud sans action requise.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-700 text-xs text-neutral-500 font-medium">
              Données consolidées & à jour
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 text-xs text-neutral-400 flex items-start gap-3 max-w-2xl">
          <CheckCircle2 className="w-4 h-4 text-qash-green-500 shrink-0 mt-0.5" />
          <span>
            Les fonctionnalités de vente et d&apos;encaissement indispensables restent opérationnelles hors-ligne. Les mises à jour distantes et sauvegardes globales s&apos;actualisent dès le retour de la connexion.
          </span>
        </div>
      </div>
    </section>
  );
};
