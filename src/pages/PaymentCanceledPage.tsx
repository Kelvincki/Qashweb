import React, { useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { PageRoute } from '../types';
import { Container, Section } from '../components/ui/Layout';
import { Button, ButtonLink } from '../components/ui/Button';
import { androidIntentLink, mailtoLink } from '../config/site';

interface PaymentCanceledPageProps {
  onNavigate?: (route: PageRoute) => void;
}

export function PaymentCanceledPage(_props: PaymentCanceledPageProps) {
  const [showAndroidFallback, setShowAndroidFallback] = useState(false);
  const intentLink = androidIntentLink('subscription');
  const helpMail = mailtoLink('Question paiement QASH');

  const handleOpenApp = () => {
    // Lien profond vers l'écran Abonnement de l'application, déclenché par l'utilisateur
    window.location.href = 'qash://subscription';
    // Lien de secours Android si l'application ne s'est pas ouverte
    setTimeout(() => {
      setShowAndroidFallback(true);
    }, 1200);
  };

  return (
    <Section tone="paper" spacing="none" className="pb-24 pt-14 sm:pt-20">
      <Container>
        <div className="max-w-[44rem]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-field" aria-hidden="true">
            <MinusCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-8 text-[clamp(2.25rem,1.5rem+3vw,4rem)] font-black leading-[0.98] tracking-tight">Paiement annulé.</h1>
          <p className="mt-6 text-xl leading-relaxed sm:text-2xl">
            Votre paiement n&apos;a pas été effectué. Votre abonnement n&apos;a pas changé. Vous pouvez réessayer à tout
            moment.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" onClick={handleOpenApp}>
              Retourner dans QASH
            </Button>
            <ButtonLink to="/dashboard" variant="quiet" size="lg">
              Mon espace
            </ButtonLink>
          </div>
          <p className="mt-6 text-lg">Si rien ne se passe, ouvrez l&apos;application QASH vous-même.</p>
          {showAndroidFallback && intentLink && (
            <p className="mt-2 text-lg">
              <a href={intentLink} className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
                Lien de secours Android
              </a>
            </p>
          )}

          <div className="mt-12 rounded-[2rem] bg-field p-6 sm:p-8">
            <h2 className="text-title font-black">Comment reprendre&nbsp;?</h2>
            <p className="mt-3 text-lg leading-relaxed">
              Dans QASH, ouvrez <strong className="font-black">Plus &gt; Abonnement</strong>, puis touchez{' '}
              <strong className="font-black">Renouveler / Payer</strong>.
            </p>
          </div>

          {helpMail && (
            <p className="mt-10 text-lg">
              Un souci avec votre paiement&nbsp;?{' '}
              <a href={helpMail} className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
                Contactez-nous
              </a>
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
