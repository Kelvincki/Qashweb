import React from 'react';
import { PageRoute } from '../types';
import { LegalLayout, LegalList, LegalSection } from '../components/ui/LegalLayout';
import { CONTACT_EMAIL } from '../config/site';

interface LegalPageProps {
  onNavigate?: (route: PageRoute) => void;
}

export const LegalPage: React.FC<LegalPageProps> = () => (
  <LegalLayout
    current="/mentions-legales"
    title="Mentions légales"
    updated="Informations officielles relatives à l'éditeur et à l'hébergement du site officiel QASH."
    notice={
      <>
        <strong>Avertissement :</strong> Ce document constitue un modèle indicatif de mentions légales à adapter et faire
        valider par un professionnel du droit. QASH ne prétend pas à une conformité juridique garantie sans révision
        personnalisée.
      </>
    }
  >
    <LegalSection title="1. Éditeur du site">
      <p>
        Le site officiel <strong>QASH</strong> est édité par :
      </p>
      <LegalList>
        <li><strong>Dénomination sociale :</strong> [NOM DE L&apos;ENTREPRISE]</li>
        <li><strong>Forme juridique :</strong> [FORME JURIDIQUE]</li>
        <li><strong>Numéro d&apos;immatriculation / Registre du commerce :</strong> [NUMÉRO D&apos;ENREGISTREMENT]</li>
        <li><strong>Siège social :</strong> [ADRESSE]</li>
        <li><strong>Courrier électronique :</strong> {CONTACT_EMAIL}</li>
        <li><strong>Directeur de la publication :</strong> [REPRÉSENTANT LÉGAL]</li>
      </LegalList>
    </LegalSection>

    <LegalSection title="2. Hébergement du site">
      <p>Le site est hébergé sur des infrastructures cloud de haute disponibilité :</p>
      <LegalList>
        <li><strong>Hébergeur :</strong> [HÉBERGEUR DU SITE]</li>
        <li><strong>Adresse de l&apos;hébergeur :</strong> [ADRESSE HÉBERGEUR]</li>
      </LegalList>
    </LegalSection>

    <LegalSection title="3. Propriété intellectuelle">
      <p>
        L&apos;ensemble des éléments composant le site officiel QASH (logos, marques, éléments graphiques, photographies,
        textes, icônes et architecture logicielle) est protégé par les législations nationales et internationales relatives
        à la propriété intellectuelle et aux droits d&apos;auteur.
      </p>
      <p>
        Toute reproduction, représentation, diffusion ou exploitation totale ou partielle du nom, de la marque QASH ou de
        ses contenus sans autorisation expresse et préalable de l&apos;éditeur est strictement interdite.
      </p>
    </LegalSection>

    <LegalSection title="4. Responsabilité">
      <p>
        L&apos;éditeur met tout en œuvre pour fournir des informations exactes et à jour sur le site officiel QASH.
        Toutefois, il ne saurait être tenu responsable des omissions, inexactitudes ou retards de mise à jour.
      </p>
      <p>L&apos;utilisateur reconnaît utiliser les fonctionnalités et informations du site sous sa responsabilité exclusive.</p>
    </LegalSection>

    <LegalSection title="5. Contact officiel">
      <p>
        Pour toute notification ou demande d&apos;information concernant le site ou le service QASH, vous pouvez contacter
        l&apos;équipe par email à l&apos;adresse suivante : <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </LegalSection>
  </LegalLayout>
);
