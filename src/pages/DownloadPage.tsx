import React from 'react';
import { Container, PageHero, Reveal, Section } from '../components/ui/Layout';
import { ButtonLink, ExternalButton } from '../components/ui/Button';
import { PhoneMockup } from '../components/ui/PhoneMockup';
import { QIcon } from '../components/ui/Logo';
import { ANDROID_MIN_VERSION, PLAY_STORE_URL, mailtoLink, whatsappLink } from '../config/site';
import { AppLink } from '../lib/navigation';
import { nb } from '../lib/typo';

const INSTALL_STEPS = [
  'Ouvrez Google Play sur votre téléphone Android.',
  'Cherchez « QASH » ou touchez le bouton de cette page.',
  'Touchez Installer, puis Ouvrir.',
  'Créez votre compte, ou connectez-vous si vous en avez déjà un.',
];

export const DownloadPage: React.FC = () => {
  const whatsapp = whatsappLink("Bonjour, je voudrais être prévenu quand QASH sera sur Google Play.");
  const mail = mailtoLink('QASH sur Google Play', 'Bonjour, je voudrais être prévenu quand QASH sera sur Google Play.');

  return (
    <>
      <PageHero
        title="Installez QASH."
        intro="QASH est une application Android pour votre téléphone. Elle s'installe depuis Google Play, comme n'importe quelle application."
        aside={
          <div className="flex justify-center">
            <div className="flex w-full max-w-[420px] items-end justify-center overflow-hidden rounded-[2.5rem] bg-brand-yellow pt-12">
              <div className="h-[360px] overflow-hidden">
                <PhoneMockup id="caisse" width={240} priority />
              </div>
            </div>
          </div>
        }
      >
        {PLAY_STORE_URL ? (
          <ExternalButton href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" size="lg">
            Télécharger sur Google Play
          </ExternalButton>
        ) : (
          <div className="flex items-center gap-4 rounded-[2rem] bg-field py-3 pl-3 pr-6">
            <QIcon size={56} />
            <p className="text-lg font-bold leading-snug">
              Bientôt sur Google Play.
              <span className="block font-normal">Le lien apparaîtra ici dès la publication.</span>
            </p>
          </div>
        )}
      </PageHero>

      {!PLAY_STORE_URL && (whatsapp || mail) && (
        <Section tone="yellow" spacing="compact">
          <Container>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              <h2 className="text-title font-black lg:col-span-7">{nb('Vous voulez être prévenu ?')}</h2>
              <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
                {whatsapp && (
                  <ExternalButton href={whatsapp} target="_blank" rel="noopener noreferrer" variant="dark" size="lg">
                    Écrire sur WhatsApp
                  </ExternalButton>
                )}
                {mail && (
                  <ExternalButton href={mail} variant={whatsapp ? 'light' : 'dark'} size="lg">
                    Écrire un e-mail
                  </ExternalButton>
                )}
              </div>
            </div>
          </Container>
        </Section>
      )}

      <Section tone="paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <h2 className="text-headline font-black">Installer en quatre gestes.</h2>
            </Reveal>
            <ol className="list-decimal space-y-6 pl-8 text-xl leading-relaxed marker:font-black marker:text-brand-red lg:col-span-6 lg:col-start-7">
              {INSTALL_STEPS.map((step) => (
                <li key={step} className="pl-2">
                  {nb(step)}
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section tone="field">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <h2 className="text-headline font-black">Compatibilité.</h2>
            </Reveal>
            <ul className="space-y-6 text-xl leading-relaxed lg:col-span-6 lg:col-start-7">
              <li>
                <strong className="font-black">Android</strong>, sur téléphone ou tablette
                {ANDROID_MIN_VERSION ? <> ({ANDROID_MIN_VERSION} ou plus récent)</> : null}.
              </li>
              <li>
                <strong className="font-black">Internet</strong> est nécessaire pour créer votre compte et pour
                synchroniser. Ensuite, la caisse marche aussi sans connexion.
              </li>
              <li>
                <strong className="font-black">Votre compte</strong> se gère aussi sur ce site, dans{' '}
                <AppLink to="/dashboard" className="font-bold underline decoration-2 underline-offset-4">
                  Mon espace
                </AppLink>
                .
              </li>
            </ul>
          </div>
        </Container>
      </Section>

      <Section tone="paper" spacing="compact">
        <Container className="flex flex-wrap gap-3">
          <ButtonLink to="/comment-ca-marche" variant="quiet" size="lg">
            Comment ça marche
          </ButtonLink>
          <ButtonLink to="/faq" variant="quiet" size="lg">
            Questions fréquentes
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
};
