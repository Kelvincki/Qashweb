import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { consumeRedirect } from '../lib/redirect';
import { PageRoute } from '../types';
import { Container, Section } from '../components/ui/Layout';
import { ButtonLink } from '../components/ui/Button';
import { Notice, Spinner } from '../components/ui/AuthShell';

interface AuthCallbackPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ onNavigate }) => {
  const { user, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if there are error parameters in URL query or hash fragment
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const error = searchParams.get('error') || hashParams.get('error');
    const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

    if (error || errorDescription) {
      const decodedMsg = errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : 'L\'authentification avec Google a échoué ou a été annulée.';
      setErrorMessage(decodedMsg);
      return;
    }

    // If user is authenticated, redirect to destination
    if (!loading && user) {
      onNavigate(consumeRedirect());
    }
  }, [user, loading, onNavigate]);

  return (
    <Section tone="paper" spacing="none" className="pb-24 pt-14 sm:pt-20">
      <Container>
        {errorMessage ? (
          <div className="max-w-[40rem]">
            <h1 className="text-[clamp(2.25rem,1.5rem+3vw,4rem)] font-black leading-[0.98] tracking-tight">La connexion n&apos;a pas abouti.</h1>
            <div className="mt-8">
              <Notice kind="error">{errorMessage}</Notice>
            </div>
            <ButtonLink to="/login" size="lg" className="mt-8">
              Retour à la connexion
            </ButtonLink>
          </div>
        ) : (
          <div className="flex max-w-[40rem] flex-col gap-6" aria-live="polite">
            <Spinner className="h-10 w-10" />
            <h1 className="text-[clamp(2.25rem,1.5rem+3vw,4rem)] font-black leading-[0.98] tracking-tight">Connexion en cours…</h1>
            <p className="text-xl">Nous vérifions votre session QASH, un instant.</p>
          </div>
        )}
      </Container>
    </Section>
  );
};
