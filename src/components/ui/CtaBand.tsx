import React from 'react';
import { Container, Section } from './Layout';
import { DownloadButton } from './DownloadButton';
import { ButtonLink } from './Button';
import { PRICING } from '../../config/site';
import { nb } from '../../lib/typo';

interface CtaBandProps {
  title?: string;
  text?: string;
}

/** Bandeau d'appel final, champ rouge plein. */
export const CtaBand: React.FC<CtaBandProps> = ({
  title = 'Ouvrez votre caisse aujourd’hui.',
  text = `Installez QASH, créez votre boutique et vendez. Les ${PRICING.trialDays} premiers jours sont gratuits.`,
}) => (
  <Section tone="red">
    <Container>
      <div className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="text-headline font-black">{nb(title)}</h2>
          <p className="mt-6 max-w-[36rem] text-xl leading-relaxed">{nb(text)}</p>
        </div>
        <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
          <DownloadButton variant="light" />
          <ButtonLink to="/tarifs" variant="dark" size="lg">
            Voir les tarifs
          </ButtonLink>
        </div>
      </div>
    </Container>
  </Section>
);
