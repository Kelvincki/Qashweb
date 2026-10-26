import React from 'react';
import { Container, Section } from './Layout';
import { AppLink } from '../../lib/navigation';
import { PageRoute } from '../../types';

const RELATED: Array<{ to: PageRoute; label: string }> = [
  { to: '/mentions-legales', label: 'Mentions légales' },
  { to: '/confidentialite', label: 'Confidentialité' },
  { to: '/conditions', label: "Conditions d'utilisation" },
  { to: '/cookies', label: 'Cookies' },
  { to: '/suppression-compte', label: 'Supprimer mon compte' },
];

interface LegalLayoutProps {
  title: string;
  updated?: string;
  /** Avertissement affiché sous le titre (texte d'origine conservé). */
  notice?: React.ReactNode;
  /** Route de la page courante, pour l'exclure des liens connexes. */
  current: PageRoute;
  children: React.ReactNode;
}

/** Mise en page commune des documents légaux : une colonne de lecture, titres de section nets. */
export const LegalLayout: React.FC<LegalLayoutProps> = ({ title, updated, notice, current, children }) => (
  <>
    <Section tone="paper" spacing="none" className="pb-12 pt-14 sm:pt-20">
      <Container>
        <h1 className="max-w-[22ch] text-[clamp(1.875rem,1.1rem+3.4vw,4.5rem)] font-black leading-[0.98] tracking-tight">{title}</h1>
        {updated && <p className="mt-6 text-lg">{updated}</p>}
      </Container>
    </Section>
    <Section tone="paper" spacing="none" className="pb-20 sm:pb-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-12 text-lg leading-relaxed lg:col-span-8">
            {notice && <div className="rounded-3xl bg-warning-soft p-6 text-base leading-relaxed">{notice}</div>}
            {children}
          </div>
          <nav aria-label="Autres documents" className="lg:col-span-3 lg:col-start-10">
            <div className="rounded-3xl bg-field p-6 lg:sticky lg:top-24">
              <h2 className="text-base font-bold text-muted">Autres documents</h2>
              <ul className="mt-2">
                {RELATED.filter((r) => r.to !== current).map((r) => (
                  <li key={r.to}>
                    <AppLink to={r.to} className="flex min-h-11 items-center text-base font-semibold hover:text-brand-red">
                      {r.label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </Container>
    </Section>
  </>
);

export const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-title font-black">{title}</h2>
    {children}
  </section>
);

export const LegalList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="list-disc space-y-2 pl-6 marker:text-brand-red">{children}</ul>
);

export const legalLink = 'font-bold underline decoration-2 underline-offset-4 hover:text-brand-red';
