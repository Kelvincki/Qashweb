import React from 'react';
import { Container, Section } from '../components/ui/Layout';
import { ButtonLink } from '../components/ui/Button';
import { PhoneMockup } from '../components/ui/PhoneMockup';

export const NotFoundPage: React.FC = () => (
  <Section tone="paper" spacing="none" className="overflow-hidden pt-14 sm:pt-20">
    <Container>
      <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
        <div className="pb-16 lg:col-span-7 lg:pb-28">
          <h1 className="text-display font-black">Page introuvable.</h1>
          <p className="mt-8 max-w-[32rem] text-xl leading-relaxed sm:text-2xl">
            Cette adresse n&apos;existe pas ou a changé. Le reste du site, lui, est bien là.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink to="/" size="lg">
              Retour à l&apos;accueil
            </ButtonLink>
            <ButtonLink to="/contact" variant="quiet" size="lg">
              Nous contacter
            </ButtonLink>
          </div>
        </div>
        <div className="hidden justify-center lg:col-span-5 lg:flex">
          <div className="flex h-[420px] w-full items-end justify-center overflow-hidden rounded-t-[2.5rem] bg-field">
            <div className="translate-y-24">
              <PhoneMockup id="stock" width={250} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  </Section>
);
