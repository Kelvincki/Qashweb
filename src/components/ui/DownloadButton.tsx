import React from 'react';
import { PLAY_STORE_URL } from '../../config/site';
import { ButtonLink, ButtonSize, ButtonVariant, ExternalButton } from './Button';

interface DownloadButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  label?: string;
}

/**
 * « Télécharger l'app » : lien Google Play quand il existe,
 * sinon la page /telecharger (qui annonce la disponibilité prochaine).
 */
export const DownloadButton: React.FC<DownloadButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  className = '',
  label = "Télécharger l'app",
}) => {
  if (PLAY_STORE_URL) {
    return (
      <ExternalButton href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" variant={variant} size={size} className={className}>
        {label}
      </ExternalButton>
    );
  }
  return (
    <ButtonLink to="/telecharger" variant={variant} size={size} className={className}>
      {label}
    </ButtonLink>
  );
};
