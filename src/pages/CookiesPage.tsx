import React from 'react';
import { Cookie, ArrowLeft, ShieldCheck, CheckCircle2, Info } from 'lucide-react';
import { PageRoute } from '../types';

interface CookiesPageProps {
  onNavigate: (route: PageRoute) => void;
}

export const CookiesPage: React.FC<CookiesPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 sm:py-20 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton retour */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l&apos;accueil</span>
        </button>

        {/* En-tête */}
        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-3 border border-rose-100">
            <Cookie className="w-3.5 h-3.5" />
            <span>Transparence & Respect de la vie privée</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Gestion des cookies et du stockage local
          </h1>
          <p className="text-sm text-neutral-500">
            Dernière mise à jour : 10 octobre 2026
          </p>
        </div>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm sm:text-base">
          {/* Introduction */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              1. Notre engagement de sobriété
            </h2>
            <p>
              Le site <strong>QASH</strong> (accessible sur <em>qashapp.vercel.app</em>) applique un principe strict de minimalisme technique concernant les traceurs et données déposées sur votre terminal.
            </p>
            <p>
              À ce jour, notre site <strong>n&apos;utilise aucun cookie publicitaire, aucun cookie de ciblage commercial, ni aucun outil d&apos;analyse d&apos;audience tiers ou traceur invasif</strong>.
            </p>
          </section>

          {/* Traceurs réellement utilisés */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>2. Traceurs et stockages réellement utilisés sur ce site</span>
            </h2>
            <p>
              Les seuls mécanismes de stockage utilisés sont <strong>strictement nécessaires</strong> au bon fonctionnement technique de l&apos;application web et à la sécurisation de votre espace :
            </p>

            <div className="space-y-3">
              {/* Jeton Supabase */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-900 text-sm">
                    Session d&apos;authentification Supabase (sb-*-auth-token)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    Strictement nécessaire
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  <strong>Finalité :</strong> Mémoriser votre session sécurisée lorsque vous vous connectez à « Mon espace » ou accédez à la gestion de votre abonnement, afin d&apos;éviter de devoir ressaisir vos identifiants à chaque page.
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  <strong>Emplacement :</strong> Stockage local du navigateur (<code>localStorage</code>) sous le préfixe Supabase. Durée de conservation : limitée à la validité de votre session de connexion.
                </p>
              </div>

              {/* Redirection temporaire */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-900 text-sm">
                    Mémorisation temporaire de la destination (qash_redirect_after_login)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    Strictement nécessaire
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  <strong>Finalité :</strong> Si vous cliquez sur « Payer » depuis la page Tarifs sans être encore connecté, cette clé permet de vous ramener automatiquement sur la page Tarifs dès votre connexion réussie, au lieu du tableau de bord générique.
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  <strong>Emplacement :</strong> Stockage de session temporaire (<code>sessionStorage</code>). Durée de conservation : détruit dès la connexion effectuée ou à la fermeture de votre onglet.
                </p>
              </div>
            </div>
          </section>

          {/* Absence de bandeau de consentement */}
          <section className="space-y-3 p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs sm:text-sm text-neutral-700">
                <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                  Pourquoi aucun bandeau de consentement n&apos;est affiché ?
                </h3>
                <p className="leading-relaxed">
                  Conformément aux directives de la CNIL et au Règlement Général sur la Protection des Données (RGPD), les traceurs ayant pour finalité exclusive de permettre ou faciliter la communication par voie électronique, ou étant strictement nécessaires à la fourniture d&apos;un service expressément demandé par l&apos;utilisateur (authentification et maintien de session), sont <strong>dispensés du recueil préalable de consentement</strong>.
                </p>
                <p className="leading-relaxed font-medium text-neutral-900">
                  Si des outils de mesure d&apos;audience non anonymisés ou d&apos;autres traceurs non essentiels venaient à être ajoutés à l&apos;avenir, un bandeau de consentement préalable clair et conforme sera immédiatement mis en place pour recueillir votre accord explicite avant tout dépôt.
                </p>
              </div>
            </div>
          </section>

          {/* Gestion par le navigateur */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900">
              3. Comment contrôler ou supprimer ces données ?
            </h2>
            <p>
              Vous pouvez à tout moment consulter, bloquer ou purger les éléments de stockage local et de session en configurant les préférences de votre navigateur web :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-neutral-600">
              <li><strong>Google Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Données de sites tiers.</li>
              <li><strong>Mozilla Firefox :</strong> Paramètres &gt; Vie privée et sécurité &gt; Cookies et données de sites.</li>
              <li><strong>Apple Safari :</strong> Préférences &gt; Confidentialité &gt; Gérer les données de sites web.</li>
            </ul>
            <p className="text-xs text-neutral-500 italic">
              Note : La désactivation complète du stockage local empêchera le maintien de votre connexion dans « Mon espace ».
            </p>
          </section>

          {/* Liens connexes */}
          <section className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-600">
            <div>
              Consultez également notre{' '}
              <button
                onClick={() => onNavigate('/privacy')}
                className="text-rose-600 font-semibold hover:underline cursor-pointer"
              >
                Politique de confidentialité
              </button>{' '}
              et nos{' '}
              <button
                onClick={() => onNavigate('/cgu')}
                className="text-rose-600 font-semibold hover:underline cursor-pointer"
              >
                Conditions Générales d&apos;Utilisation (CGU)
              </button>.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
