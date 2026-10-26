import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PageRoute } from '../types';
import { AuthShell, Field, Notice, Spinner } from '../components/ui/AuthShell';
import { Button } from '../components/ui/Button';
import { AppLink } from '../lib/navigation';

interface ForgotPasswordPageProps {
  onNavigate?: (route: PageRoute) => void;
}

/** Message identique que l'adresse existe ou non (on ne révèle pas quels comptes existent). */
const SENT_MESSAGE = "Si cette adresse existe, un e-mail vient d'être envoyé.";

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = () => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        // Erreur d'envoi (trop de demandes, réseau…) : on le dit, sans jamais indiquer si le compte existe
        const status = (error as any)?.status;
        setErrorMsg(
          status === 429
            ? 'Trop de demandes. Patientez quelques minutes avant de réessayer.'
            : "L'e-mail n'a pas pu être envoyé pour le moment. Réessayez plus tard."
        );
      } else {
        setSent(true);
      }
    } catch {
      setErrorMsg("L'e-mail n'a pas pu être envoyé. Vérifiez votre connexion et réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell
      title="Mot de passe oublié."
      intro="Indiquez l'adresse e-mail de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe."
    >
      <div className="space-y-6">
        {sent ? (
          <>
            <Notice kind="success">{SENT_MESSAGE}</Notice>
            <p className="text-lg leading-relaxed">
              Ouvrez le lien depuis ce téléphone ou cet ordinateur. Pensez à regarder dans les courriers indésirables.
            </p>
            <Button variant="quiet" size="lg" onClick={() => setSent(false)}>
              Renvoyer un e-mail
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && <Notice kind="error">{errorMsg}</Notice>}
            <Field
              id="forgot-email"
              label="Adresse e-mail"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={sending}
            />
            <Button type="submit" size="lg" disabled={sending} className="w-full">
              {sending ? <Spinner /> : 'Recevoir le lien'}
            </Button>
          </form>
        )}

        <p className="pt-4 text-lg">
          <AppLink to="/login" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-red">
            Retour à la connexion
          </AppLink>
        </p>
      </div>
    </AuthShell>
  );
};
