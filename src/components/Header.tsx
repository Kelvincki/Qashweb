import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { QashLogo } from './QashLogo';
import { PageRoute } from '../types';

interface HeaderProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute, hash?: string) => void;
  onOpenStartModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenStartModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (route: PageRoute, hash?: string) => {
    setMobileMenuOpen(false);
    onNavigate(route, hash);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-neutral-200/80 py-3'
          : 'bg-white border-b border-neutral-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('/')}
          className="cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg"
          aria-label="Accueil QASH"
        >
          <QashLogo size="md" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <button
            onClick={() => handleLinkClick('/')}
            className={`transition-colors hover:text-neutral-900 cursor-pointer ${
              currentRoute === '/' ? 'text-rose-600 font-semibold' : ''
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => handleLinkClick('/', '#features')}
            className="transition-colors hover:text-neutral-900 cursor-pointer"
          >
            Fonctionnalités
          </button>
          <button
            onClick={() => handleLinkClick('/', '#how-it-works')}
            className="transition-colors hover:text-neutral-900 cursor-pointer"
          >
            Comment ça marche
          </button>
          <button
            onClick={() => handleLinkClick('/pricing')}
            className={`transition-colors hover:text-neutral-900 cursor-pointer ${
              currentRoute === '/pricing' ? 'text-rose-600 font-semibold' : ''
            }`}
          >
            Pricing
          </button>
        </nav>

        {/* Action Button (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenStartModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-all duration-150 cursor-pointer hover:shadow-sm"
            style={{ backgroundColor: '#E11D48' }}
          >
            <span>Commencer avec QASH</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleLinkClick('/')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                currentRoute === '/'
                  ? 'bg-rose-50 text-rose-600 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => handleLinkClick('/', '#features')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Fonctionnalités
            </button>
            <button
              onClick={() => handleLinkClick('/', '#how-it-works')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Comment ça marche
            </button>
            <button
              onClick={() => handleLinkClick('/pricing')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                currentRoute === '/pricing'
                  ? 'bg-rose-50 text-rose-600 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Pricing
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStartModal();
              }}
              className="w-full py-3 px-4 text-center font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              style={{ backgroundColor: '#E11D48' }}
            >
              Commencer avec QASH
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
