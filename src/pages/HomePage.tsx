import React from 'react';
import { HomeHero } from '../components/HomeHero';
import { ProblemSection } from '../components/ProblemSection';
import { SolutionSection } from '../components/SolutionSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { AiSection } from '../components/AiSection';
import { OfflineSection } from '../components/OfflineSection';
import { TeamSection } from '../components/TeamSection';
import { SecuritySection } from '../components/SecuritySection';
import { AudienceSection } from '../components/AudienceSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { PricingTeaserSection } from '../components/PricingTeaserSection';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { PageRoute } from '../types';

interface HomePageProps {
  onNavigate: (route: PageRoute, hash?: string) => void;
  onOpenStartModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenStartModal,
}) => {
  const handleExploreClick = () => {
    const solutionElem = document.getElementById('solution');
    if (solutionElem) {
      solutionElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('/', '#solution');
    }
  };

  return (
    <div className="w-full">
      {/* 1. Hero */}
      <HomeHero
        onOpenStartModal={onOpenStartModal}
        onExploreClick={handleExploreClick}
      />

      {/* 2. Problème */}
      <ProblemSection />

      {/* 3. Solution */}
      <SolutionSection />

      {/* 4. Fonctionnalités (Caisse & Ventes, Produits & Stock, etc.) */}
      <FeaturesSection />

      {/* 5. Intelligence Artificielle (Scan Factures & Scan Panier) */}
      <AiSection />

      {/* 6. Offline-first */}
      <OfflineSection />

      {/* 7. Gestion des équipes */}
      <TeamSection />

      {/* 8. Sécurité (discrète & factuelle) */}
      <SecuritySection />

      {/* 9. Pour qui ? */}
      <AudienceSection />

      {/* 10. Comment ça marche */}
      <HowItWorksSection />

      {/* 11. Pricing teaser */}
      <PricingTeaserSection onNavigate={onNavigate} />

      {/* 12. CTA final */}
      <FinalCtaSection onOpenStartModal={onOpenStartModal} />
    </div>
  );
};
