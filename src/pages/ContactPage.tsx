import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Container, PageHero, Reveal, Section } from '../components/ui/Layout';
import { ExternalButton } from '../components/ui/Button';
import { AppLink } from '../lib/navigation';
import { CONTACT_EMAIL, CONTACT_HOURS, mailtoLink, whatsappLink } from '../config/site';
import { PageRoute } from '../types';
import { nb } from '../lib/typo';

const HELP_LINKS: Array<{ to: PageRoute; label: string; text: string }> = [
  { to: '/faq', label: 'Questions fréquentes', text: 'Hors ligne, équipe, abonnement : la réponse y est peut-être déjà.' },
  { to: '/mot-de-passe-oublie', label: 'Mot de passe oublié', text: 'Recevez un lien pour en choisir un nouveau.' },
  { to: '/suppression-compte', label: 'Supprimer mon compte', text: 'La procédure pour effacer votre compte et vos données.' },
];

export const ContactPage: React.FC = () => {
  const whatsapp = whatsappLink('Bonjour QASH, ');
  const mail = mailtoLink('Question sur QASH');

  return (
    <>
      <PageHero
        title="Parlons-en."
        intro={nb("Une question sur l'application, votre compte ou votre abonnement ? Écrivez-nous, l'équipe QASH vous répondra.")}
      />

      <Section tone="paper" spacing="none" className="pb-20 sm:pb-28">
        <Container>
          <div className="grid gap-4 lg:grid-cols-2">
            <Reveal className="flex flex-col rounded-[2rem] bg-brand-yellow p-8 sm:p-12">
              <h2 className="text-headline font-black">WhatsApp</h2>
              <p className="mt-6 max-w-[28rem] text-xl leading-relaxed">
                Le plus simple depuis votre téléphone : écrivez-nous comme à un ami.
              </p>
              <div className="mt-auto pt-10">
                {whatsapp ? (
                  <ExternalButton href={whatsapp} target="_blank" rel="noopener noreferrer" variant="dark" size="lg">
                    Écrire sur WhatsApp
                  </ExternalButton>
                ) : (
                  <p className="text-lg font-bold">Numéro WhatsApp bientôt disponible.</p>
                )}
              </div>
            </Reveal>

            <Reveal className="flex flex-col rounded-[2rem] bg-ink p-8 text-white sm:p-12" delay={90}>
              <h2 className="text-headline font-black">E-mail</h2>
              <p className="mt-6 max-w-[28rem] text-xl leading-relaxed">
                Pour les demandes plus longues, ou avec une capture d&apos;écran.
              </p>
              <div className="mt-auto pt-10">
                {mail ? (
                  <>
                    <ExternalButton href={mail} variant="yellow" size="lg">
                      Écrire un e-mail
                    </ExternalButton>
                    <p className="mt-4 break-all text-lg">{CONTACT_EMAIL}</p>
                  </>
                ) : (
                  <p className="text-lg font-bold">Adresse e-mail bientôt disponible.</p>
                )}
              </div>
            </Reveal>
          </div>

          {CONTACT_HOURS && (
            <p className="mt-8 text-xl">
              <strong className="font-black">Horaires&nbsp;:</strong> {CONTACT_HOURS}
            </p>
          )}
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Reveal>
            <h2 className="text-headline font-black">Avant d&apos;écrire.</h2>
          </Reveal>
          <ul className="mt-12">
            {HELP_LINKS.map((item) => (
              <li key={item.to}>
                <AppLink to={item.to} className="group grid gap-1 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6">
                  <span className="text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-black leading-none tracking-tight group-hover:text-brand-red sm:col-span-6">
                    {item.label}
                  </span>
                  <span className="text-lg sm:col-span-5">{item.text}</span>
                  <ArrowRight aria-hidden="true" className="hidden h-7 w-7 justify-self-end sm:col-span-1 sm:block" />
                </AppLink>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
};
