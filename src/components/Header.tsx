import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, User } from 'lucide-react';
import { QashLogo } from './QashLogo';
import { PageRoute } from '../types';
import { useAuth } from './AuthContext';

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
  const { user, loading } = useAuth();

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
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-qash-border py-3'
          : 'bg-white border-b border-neutral-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('/')}
          className="cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-qash-red-500 rounded-lg"
          aria-label="Accueil QASH"
        >
          <QashLogo size="md" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <button
            onClick={() => handleLinkClick('/')}
            className={`transition-colors hover:text-neutral-900 cursor-pointer ${
              currentRoute === '/' ? 'text-qash-red-600 font-semibold' : ''
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
              currentRoute === '/pricing' ? 'text-qash-red-600 font-semibold' : ''
            }`}
          >
            Pricing
          </button>
        </nav>

        {/* Action Button (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {!loading && user ? (
            <button
              onClick={() => handleLinkClick('/dashboard')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Mon espace</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => handleLinkClick('/login')}
                className={`transition-colors hover:text-neutral-900 text-sm font-semibold cursor-pointer ${
                  currentRoute === '/login' ? 'text-qash-red-600' : 'text-neutral-600'
                }`}
              >
                Se connecter
              </button>
              <button
                onClick={onOpenStartModal}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-qash-red-500 hover:bg-qash-red-600 active:bg-qash-red-700 rounded-xl shadow-xs transition-all duration-150 cursor-pointer hover:shadow-sm"
              >
                <span>Commencer avec QASH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
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
                  ? 'bg-qash-red-50 text-qash-red-600 font-semibold'
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
                  ? 'bg-qash-red-50 text-qash-red-600 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Pricing
            </button>
            
            {!loading && user ? (
              <button
                onClick={() => handleLinkClick('/dashboard')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                  currentRoute === '/dashboard'
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Mon espace Dashboard
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('/login')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                  currentRoute === '/login'
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Se connecter
              </button>
            )}
          </div>

          <div className="pt-2">
            {!loading && user ? (
              <button
                onClick={() => handleLinkClick('/dashboard')}
                className="w-full py-3 px-4 text-center font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Aller au Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenStartModal();
                }}
                className="w-full py-3 px-4 text-center font-semibold text-white bg-qash-red-500 hover:bg-qash-red-600 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Commencer avec QASH
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
