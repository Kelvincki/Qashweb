import React from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Container } from './Layout';
import { PhoneMockup } from './PhoneMockup';

interface AuthShellProps {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  /** Phrase affichée sur le panneau jaune (grand écran uniquement). */
  aside?: string;
}

/** Mise en page des pages de compte : formulaire à gauche, panneau jaune avec l'app à droite (grand écran). */
export const AuthShell: React.FC<AuthShellProps> = ({ title, intro, children, aside = 'La caisse de votre boutique, même sans internet.' }) => (
  <section className="bg-white pb-20 pt-10 sm:pt-16">
    <Container>
      <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-6 xl:col-span-5">
          <h1 className="text-[clamp(2.25rem,1.5rem+3vw,4rem)] font-black leading-[0.98] tracking-tight">{title}</h1>
          {intro && <div className="mt-5 text-xl leading-relaxed">{intro}</div>}
          <div className="mt-10">{children}</div>
        </div>
        <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
          <div className="overflow-hidden rounded-[2.5rem] bg-brand-yellow px-10 pt-10">
            <p className="max-w-[16ch] text-title font-black">{aside}</p>
            <div className="mt-8 flex h-[380px] justify-center overflow-hidden">
              <PhoneMockup id="caisse" width={250} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  </section>
);

export const inputClass =
  'w-full rounded-2xl bg-field px-4 py-3.5 text-lg text-ink placeholder:text-muted transition-colors focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-ink disabled:opacity-60';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  /** Lien ou action affichés à droite du libellé (ex. « Mot de passe oublié ? »). */
  extra?: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ id, label, hint, extra, ...rest }) => (
  <div>
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="block text-lg font-bold">
        {label}
      </label>
      {extra}
    </div>
    <input id={id} aria-describedby={hint ? `${id}-hint` : undefined} className={`mt-2 ${inputClass}`} {...rest} />
    {hint && (
      <p id={`${id}-hint`} className="mt-2 text-base text-muted">
        {hint}
      </p>
    )}
  </div>
);

interface PasswordFieldProps extends Omit<FieldProps, 'type'> {
  visible: boolean;
  onToggle: () => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ id, label, hint, extra, visible, onToggle, disabled, ...rest }) => (
  <div>
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="block text-lg font-bold">
        {label}
      </label>
      {extra}
    </div>
    <div className="relative mt-2">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        aria-describedby={hint ? `${id}-hint` : undefined}
        disabled={disabled}
        className={`${inputClass} pr-14`}
        {...rest}
      />
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="absolute inset-y-0 right-1 flex w-12 items-center justify-center rounded-2xl text-ink"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
    {hint && (
      <p id={`${id}-hint`} className="mt-2 text-base text-muted">
        {hint}
      </p>
    )}
  </div>
);

export const Notice: React.FC<{ kind: 'error' | 'success' | 'info'; children: React.ReactNode }> = ({ kind, children }) => {
  const cls = kind === 'error' ? 'bg-danger-soft' : kind === 'success' ? 'bg-success-soft' : 'bg-warning-soft';
  const Icon = kind === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-2xl p-4 text-lg leading-relaxed ${cls}`}>
      <Icon
        className={`mt-1 h-5 w-5 shrink-0 ${kind === 'error' ? 'text-brand-red-dark' : kind === 'success' ? 'text-success' : 'text-ink'}`}
        aria-hidden="true"
      />
      <div>{children}</div>
    </div>
  );
};

export const Spinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span aria-hidden="true" className={`inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-current border-t-transparent ${className}`} />
);
