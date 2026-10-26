import React from 'react';
import { AppLink } from '../../lib/navigation';
import { PageRoute } from '../../types';

export type ButtonVariant = 'primary' | 'dark' | 'light' | 'quiet' | 'yellow';
export type ButtonSize = 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-red text-white hover:bg-brand-red-dark',
  dark: 'bg-ink text-white hover:bg-black',
  light: 'bg-white text-ink hover:bg-field',
  quiet: 'bg-field text-ink hover:bg-field-strong',
  yellow: 'bg-brand-yellow text-ink hover:bg-[#FFC233]',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-12 px-5 text-base',
  lg: 'min-h-14 px-7 text-lg',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = ''): string {
  return [
    'inline-flex items-center justify-center gap-2 rounded-full font-bold leading-tight text-center',
    'transition-[background-color,transform] duration-150 active:scale-[0.97] cursor-pointer select-none',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    VARIANTS[variant],
    SIZES[size],
    extra,
  ].join(' ');
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: React.FC<ButtonProps> = ({ variant, size, className = '', type = 'button', ...rest }) => (
  <button type={type} className={buttonClasses(variant, size, className)} {...rest} />
);

interface ButtonLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: PageRoute;
  hash?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const ButtonLink: React.FC<ButtonLinkProps> = ({ variant, size, className = '', ...rest }) => (
  <AppLink className={buttonClasses(variant, size, className)} {...rest} />
);

interface ExternalButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const ExternalButton: React.FC<ExternalButtonProps> = ({ variant, size, className = '', ...rest }) => (
  <a className={buttonClasses(variant, size, className)} {...rest} />
);
