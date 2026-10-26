import React, { useEffect, useState } from 'react';
import { AppLink } from '../lib/navigation';
import { Container } from './ui/Layout';
import { buttonClasses } from './ui/Button';

/** Clé du choix, gardée sur l'appareil uniquement (voir /cookies). */
export const COOKIE_NOTICE_KEY = 'qash_cookie_notice';

/**
 * Bandeau d'information honnête : le site n'utilise que le stockage nécessaire
 * (session de connexion). Aucune mesure d'audience, aucune publicité : rien à accepter ou refuser.
 */
export const CookieNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_NOTICE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(COOKIE_NOTICE_KEY, 'essentiels');
    } catch {
      // Stockage indisponible : le bandeau se fermera seulement pour cette visite
    }
    setVisible(false);
  };

  return (
    <div role="region" aria-label="Information sur les cookies" className="fixed inset-x-0 bottom-0 z-50 bg-ink text-white">
      <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[46rem] text-base leading-relaxed">
          Ce site garde seulement ce qui sert à vous connecter à votre espace. Pas de mesure d&apos;audience, pas de
          publicité.{' '}
          <AppLink to="/cookies" className="font-bold underline decoration-2 underline-offset-4">
            En savoir plus
          </AppLink>
        </p>
        <button type="button" onClick={dismiss} className={buttonClasses('yellow', 'md', 'shrink-0')}>
          J&apos;ai compris
        </button>
      </Container>
    </div>
  );
};
