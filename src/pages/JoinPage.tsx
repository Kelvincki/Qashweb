import React, { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { PageRoute } from '../types';
import { Container, Section } from '../components/ui/Layout';
import { Button, ButtonLink } from '../components/ui/Button';
import { Notice } from '../components/ui/AuthShell';

interface JoinPageProps {
  onNavigate?: (route: PageRoute) => void;
}

/**
 * Nettoie le code d'invitation lu dans l'URL :
 * majuscules, lettres/chiffres/tiret uniquement, 20 caractères maximum.
 */
function sanitizeInviteCode(raw: string | null): string {
  if (!raw) return '';
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 20);
}

/** Page publique : affiche le code, aucun appel serveur, aucun rattachement fait par le site. */
export const JoinPage: React.FC<JoinPageProps> = () => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const code = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return sanitizeInviteCode(new URLSearchParams(window.location.search).get('code'));
  }, []);

  const handleCopy = async () => {
    if (!code) return;
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Erreur copie presse-papier:', err);
      setCopyError(true);
    }
  };

  return (
    <Section tone="paper" spacing="none" className="pb-24 pt-14 sm:pt-20">
      <Container>
        <div className="max-w-[44rem]">
          <h1 className="text-[clamp(2.25rem,1.5rem+3vw,4rem)] font-black leading-[0.98] tracking-tight">Rejoindre une boutique.</h1>

          {code ? (
            <>
              <p className="mt-6 text-xl leading-relaxed sm:text-2xl">
                Vous êtes invité à rejoindre une boutique sur QASH. Ouvrez l&apos;application QASH, choisissez{' '}
                <strong className="font-black">Employé</strong> et saisissez ce code.
              </p>
              <div className="mt-10 rounded-[2rem] bg-brand-yellow p-8 sm:p-10">
                <p className="text-lg font-bold">Code d&apos;invitation</p>
                <p className="mt-3 break-all text-[clamp(2.5rem,1.8rem+3vw,4.5rem)] font-black leading-none tracking-wider">{code}</p>
                <Button variant="dark" size="lg" onClick={handleCopy} className="mt-8">
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" aria-hidden="true" />
                      Code copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" aria-hidden="true" />
                      Copier le code
                    </>
                  )}
                </Button>
              </div>
              <div aria-live="polite" className="mt-4">
                {copyError && <Notice kind="error">La copie n&apos;a pas fonctionné. Recopiez le code à la main.</Notice>}
              </div>
            </>
          ) : (
            <div className="mt-8">
              <Notice kind="error">Code d&apos;invitation introuvable</Notice>
            </div>
          )}

          <ButtonLink to="/" variant="quiet" size="lg" className="mt-10">
            Retour à l&apos;accueil
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
};
