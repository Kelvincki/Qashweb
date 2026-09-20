import React from 'react';
import { QashLogo } from './QashLogo';
import { PageRoute } from '../types';

interface FooterProps {
  onNavigate: (route: PageRoute, hash?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-neutral-200/80 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-100">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <QashLogo size="md" />
            <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
              QASH — La gestion de boutique simplifiée. Solution moderne pour gérer votre caisse, votre stock, vos ventes et votre équipe.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-qash-green-500"></span>
              <span>Plateforme certifiée pour les commerçants</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-qash-red-500 transition-colors cursor-pointer"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/', '#features')}
                  className="hover:text-qash-red-500 transition-colors cursor-pointer"
                >
                  Fonctionnalités
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/', '#how-it-works')}
                  className="hover:text-qash-red-500 transition-colors cursor-pointer"
                >
                  Comment ça marche
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/pricing')}
                  className="hover:text-qash-red-500 transition-colors cursor-pointer"
                >
                  Tarifs (Pricing)
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4">
              Informations légales
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li>
                <button
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-qash-red-500 transition-colors cursor-pointer"
                >
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/legal')}
                  className="hover:text-qash-red-500 transition-colors cursor-pointer"
                >
                  Mentions légales
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 QASH. Tous droits réservés.</p>
          <p className="text-neutral-400">
            Conçu pour les commerçants modernes.
          </p>
        </div>
      </div>
    </footer>
  );
};
