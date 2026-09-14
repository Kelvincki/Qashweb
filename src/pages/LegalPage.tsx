import React from 'react';
import { Scale, ArrowLeft } from 'lucide-react';
import { PageRoute } from '../types';

interface LegalPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 sm:py-20 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l&apos;accueil</span>
        </button>

        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-3 border border-rose-100">
            <Scale className="w-3.5 h-3.5" />
            <span>Transparence légale</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Mentions Légales
          </h1>
          <p className="text-sm text-neutral-500">
            Informations officielles relatives à l&apos;éditeur et à l&apos;hébergement du site officiel QASH.
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-sm sm:text-base text-neutral-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-normal">
            Les éléments d&apos;identification légale entre crochets correspondent aux informations officielles en cours d&apos;immatriculation de la structure éditrice.
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              1. Éditeur du site
            </h2>
            <p>
              Le site officiel <strong>QASH</strong> est édité par :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Dénomination sociale :</strong> [NOM DE L&apos;ENTREPRISE]</li>
              <li><strong>Forme juridique :</strong> [FORME JURIDIQUE]</li>
              <li><strong>Numéro d&apos;immatriculation / Registre du commerce :</strong> [NUMÉRO D&apos;ENREGISTREMENT]</li>
              <li><strong>Siège social :</strong> [ADRESSE]</li>
              <li><strong>Courrier électronique :</strong> [EMAIL QASH]</li>
              <li><strong>Directeur de la publication :</strong> [REPRÉSENTANT LÉGAL]</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              2. Hébergement du site
            </h2>
            <p>
              Le site est hébergé sur des infrastructures cloud de haute disponibilité :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Hébergeur :</strong> [HÉBERGEUR DU SITE]</li>
              <li><strong>Adresse de l&apos;hébergeur :</strong> [ADRESSE HÉBERGEUR]</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              3. Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble des éléments composant le site officiel QASH (logos, marques, éléments graphiques, photographies, textes, icônes et architecture logicielle) est protégé par les législations nationales et internationales relatives à la propriété intellectuelle et aux droits d&apos;auteur.
            </p>
            <p>
              Toute reproduction, représentation, diffusion ou exploitation totale ou partielle du nom, de la marque QASH ou de ses contenus sans autorisation expresse et préalable de l&apos;éditeur est strictement interdite.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              4. Responsabilité
            </h2>
            <p>
              L&apos;éditeur met tout en œuvre pour fournir des informations exactes et à jour sur le site officiel QASH. Toutefois, il ne saurait être tenu responsable des omissions, inexactitudes ou retards de mise à jour.
            </p>
            <p>
              L&apos;utilisateur reconnaît utiliser les fonctionnalités et informations du site sous sa responsabilité exclusive.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              5. Contact officiel
            </h2>
            <p>
              Pour toute notification ou demande d&apos;information concernant le site ou le service QASH, vous pouvez contacter l&apos;équipe par email à l&apos;adresse suivante : <strong>[EMAIL QASH]</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
