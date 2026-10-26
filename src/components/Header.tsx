import React, { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { AppLink, useNavigation } from '../lib/navigation';
import { PageRoute } from '../types';
import { Container } from './ui/Layout';
import { Wordmark } from './ui/Logo';
import { buttonClasses } from './ui/Button';

const NAV_LINKS: Array<{ to: PageRoute; label: string }> = [
  { to: '/fonctionnalites', label: 'Fonctionnalités' },
  { to: '/metiers', label: 'Métiers' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export const Header: React.FC = () => {
  const { currentRoute } = useNavigation();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Fermer le menu à chaque changement de page
  useEffect(() => {
    setOpen(false);
  }, [currentRoute]);

  // Menu mobile : Échap pour fermer, défilement de la page bloqué, focus sur le premier lien
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstLinkRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const isLoggedIn = !loading && !!user;
  const accountLink: { to: PageRoute; label: string } = isLoggedIn
    ? { to: '/dashboard', label: 'Mon espace' }
    : { to: '/login', label: 'Se connecter' };

  return (
    <header className="sticky top-0 z-40 bg-white">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <AppLink to="/" aria-label="QASH, accueil" className="flex min-h-11 items-center rounded-lg">
          <Wordmark height={30} alt="" />
        </AppLink>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = currentRoute === link.to;
              return (
                <li key={link.to}>
                  <AppLink
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-11 items-center rounded-full px-4 text-base font-semibold transition-colors hover:bg-field ${
                      active ? 'text-brand-red' : 'text-ink'
                    }`}
                  >
                    {link.label}
                  </AppLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <AppLink to={accountLink.to} className={buttonClasses('quiet', 'md')}>
            {accountLink.label}
          </AppLink>
          <AppLink to="/telecharger" className={buttonClasses('primary', 'md')}>
            Télécharger
          </AppLink>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-field lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </Container>

      {open && (
        <div id="menu-mobile" className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-white lg:hidden">
          <Container className="flex min-h-full flex-col pb-8 pt-4">
            <nav aria-label="Navigation principale">
              <ul>
                {NAV_LINKS.map((link, i) => (
                  <li key={link.to}>
                    <AppLink
                      ref={i === 0 ? firstLinkRef : undefined}
                      to={link.to}
                      aria-current={currentRoute === link.to ? 'page' : undefined}
                      className={`flex min-h-14 items-center text-3xl font-black tracking-tight ${
                        currentRoute === link.to ? 'text-brand-red' : 'text-ink'
                      }`}
                    >
                      {link.label}
                    </AppLink>
                  </li>
                ))}
                <li>
                  <AppLink to="/comment-ca-marche" className="flex min-h-14 items-center text-3xl font-black tracking-tight">
                    Comment ça marche
                  </AppLink>
                </li>
              </ul>
            </nav>
            <div className="mt-auto grid gap-3 pt-10">
              <AppLink to="/telecharger" className={buttonClasses('primary', 'lg', 'w-full')}>
                Télécharger l&apos;app
              </AppLink>
              <AppLink to={accountLink.to} className={buttonClasses('quiet', 'lg', 'w-full')}>
                {accountLink.label}
              </AppLink>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
};
