import React from 'react';
import { AppLink } from '../lib/navigation';
import { PageRoute } from '../types';
import { Container } from './ui/Layout';
import { Wordmark } from './ui/Logo';
import { CONTACT_EMAIL, mailtoLink, whatsappLink } from '../config/site';

const COLUMNS: Array<{ title: string; links: Array<{ to: PageRoute; label: string }> }> = [
  {
    title: 'Produit',
    links: [
      { to: '/fonctionnalites', label: 'Fonctionnalités' },
      { to: '/metiers', label: 'Métiers' },
      { to: '/comment-ca-marche', label: 'Comment ça marche' },
      { to: '/tarifs', label: 'Tarifs' },
      { to: '/telecharger', label: "Télécharger l'app" },
    ],
  },
  {
    title: 'Aide',
    links: [
      { to: '/faq', label: 'Questions fréquentes' },
      { to: '/contact', label: 'Contact' },
      { to: '/dashboard', label: 'Mon espace' },
      { to: '/suppression-compte', label: 'Supprimer mon compte' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { to: '/mentions-legales', label: 'Mentions légales' },
      { to: '/confidentialite', label: 'Confidentialité' },
      { to: '/conditions', label: "Conditions d'utilisation" },
      { to: '/cookies', label: 'Cookies' },
    ],
  },
];

export const Footer: React.FC = () => {
  const mail = mailtoLink();
  const whatsapp = whatsappLink();

  return (
    <footer className="bg-field pb-10 pt-20 text-ink sm:pt-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="max-w-[22rem] text-title font-black">La caisse de votre boutique, même sans internet.</p>
            <ul className="mt-6 space-y-2 text-lg">
              {whatsapp && (
                <li>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-2 underline-offset-4 hover:text-brand-red">
                    WhatsApp
                  </a>
                </li>
              )}
              {mail && (
                <li>
                  <a href={mail} className="font-semibold underline decoration-2 underline-offset-4 hover:text-brand-red">
                    {CONTACT_EMAIL}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <nav aria-label="Pied de page" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-base font-bold text-muted">{col.title}</h2>
                <ul className="mt-3">
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <AppLink to={link.to} className="flex min-h-11 items-center text-base font-semibold hover:text-brand-red">
                        {link.label}
                      </AppLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 sm:mt-28">
          <Wordmark height={240} alt="QASH" className="w-full max-w-[598px]" />
        </div>
        <p className="mt-8 text-base text-muted">© {new Date().getFullYear()} QASH. Tous droits réservés.</p>
      </Container>
    </footer>
  );
};
