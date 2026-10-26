import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CookieNotice } from './components/CookieNotice';
import { AuthProvider } from './components/AuthContext';
import { HomePage } from './pages/HomePage';
import { PageRoute } from './types';
import { VALID_ROUTES, ROUTE_META, NOT_FOUND_META } from './config/routes';
import { CurrentRoute, NavigationProvider } from './lib/navigation';
import { applyRouteMeta } from './lib/seo';

// Pages chargées à la demande : la page d'accueil reste dans le paquet principal,
// le reste n'est téléchargé que si on l'ouvre (important sur 3G).
function page<K extends string>(loader: () => Promise<Record<K, React.ComponentType<any>>>, name: K) {
  return lazy(() => loader().then((m) => ({ default: m[name] })));
}

const FeaturesPage = page(() => import('./pages/FeaturesPage'), 'FeaturesPage');
const TradesPage = page(() => import('./pages/TradesPage'), 'TradesPage');
const TarifsPage = page(() => import('./pages/TarifsPage'), 'TarifsPage');
const HowItWorksPage = page(() => import('./pages/HowItWorksPage'), 'HowItWorksPage');
const DownloadPage = page(() => import('./pages/DownloadPage'), 'DownloadPage');
const FaqPage = page(() => import('./pages/FaqPage'), 'FaqPage');
const ContactPage = page(() => import('./pages/ContactPage'), 'ContactPage');
const PricingPage = page(() => import('./pages/PricingPage'), 'PricingPage');
const PrivacyPage = page(() => import('./pages/PrivacyPage'), 'PrivacyPage');
const LegalPage = page(() => import('./pages/LegalPage'), 'LegalPage');
const TermsPage = page(() => import('./pages/TermsPage'), 'TermsPage');
const CookiesPage = page(() => import('./pages/CookiesPage'), 'CookiesPage');
const DeleteAccountPage = page(() => import('./pages/DeleteAccountPage'), 'DeleteAccountPage');
const LoginPage = page(() => import('./pages/LoginPage'), 'LoginPage');
const RegisterPage = page(() => import('./pages/RegisterPage'), 'RegisterPage');
const DashboardPage = page(() => import('./pages/DashboardPage'), 'DashboardPage');
const AuthCallbackPage = page(() => import('./pages/AuthCallbackPage'), 'AuthCallbackPage');
const PaymentSuccessPage = page(() => import('./pages/PaymentSuccessPage'), 'PaymentSuccessPage');
const PaymentCanceledPage = page(() => import('./pages/PaymentCanceledPage'), 'PaymentCanceledPage');
const JoinPage = page(() => import('./pages/JoinPage'), 'JoinPage');
const BienvenuePage = page(() => import('./pages/BienvenuePage'), 'BienvenuePage');
const ResetPasswordPage = page(() => import('./pages/ResetPasswordPage'), 'ResetPasswordPage');
const NotFoundPage = page(() => import('./pages/NotFoundPage'), 'NotFoundPage');

function resolveRoute(): CurrentRoute {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (VALID_ROUTES.includes(path as PageRoute)) return path as PageRoute;
  // Ancien format : /#/route
  const hash = window.location.hash.replace(/^#/, '');
  if (VALID_ROUTES.includes(hash as PageRoute)) return hash as PageRoute;
  return 'not-found';
}

function renderPage(route: CurrentRoute, navigate: (route: PageRoute, hash?: string) => void) {
  switch (route) {
    case '/':
      return <HomePage />;
    case '/fonctionnalites':
      return <FeaturesPage />;
    case '/metiers':
      return <TradesPage />;
    case '/tarifs':
      return <TarifsPage />;
    case '/comment-ca-marche':
      return <HowItWorksPage />;
    case '/telecharger':
      return <DownloadPage />;
    case '/faq':
      return <FaqPage />;
    case '/contact':
      return <ContactPage />;
    case '/pricing':
      return <PricingPage onNavigate={navigate} />;
    case '/confidentialite':
    case '/privacy':
      return <PrivacyPage onNavigate={navigate} />;
    case '/mentions-legales':
    case '/legal':
      return <LegalPage onNavigate={navigate} />;
    case '/conditions':
    case '/cgu':
    case '/terms':
      return <TermsPage onNavigate={navigate} />;
    case '/cookies':
      return <CookiesPage onNavigate={navigate} />;
    case '/suppression-compte':
    case '/suppression-donnees':
    case '/delete-account':
      return <DeleteAccountPage onNavigate={navigate} />;
    case '/login':
      return <LoginPage onNavigate={navigate} />;
    case '/register':
      return <RegisterPage onNavigate={navigate} />;
    case '/dashboard':
      return <DashboardPage onNavigate={navigate} />;
    case '/auth/callback':
      return <AuthCallbackPage onNavigate={navigate} />;
    case '/paiement/succes':
      return <PaymentSuccessPage onNavigate={navigate} />;
    case '/paiement/annule':
      return <PaymentCanceledPage onNavigate={navigate} />;
    case '/join':
      return <JoinPage onNavigate={navigate} />;
    case '/bienvenue':
      return <BienvenuePage onNavigate={navigate} />;
    case '/reset-password':
      return <ResetPasswordPage onNavigate={navigate} />;
    default:
      return <NotFoundPage />;
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<CurrentRoute>(resolveRoute);
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // Retour / avance du navigateur
  useEffect(() => {
    const handlePopState = () => setCurrentRoute(resolveRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Titre, description, Open Graph et URL canonique de chaque page
  useEffect(() => {
    const meta = currentRoute === 'not-found' ? NOT_FOUND_META : ROUTE_META[currentRoute];
    applyRouteMeta(meta, currentRoute === 'not-found' ? window.location.pathname : currentRoute);
  }, [currentRoute]);

  // Après une navigation interne : focus sur le contenu (lecteurs d'écran, clavier)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!window.location.hash) mainRef.current?.focus({ preventScroll: true });
  }, [currentRoute]);

  const navigate = useCallback((route: PageRoute, hash?: string) => {
    setCurrentRoute(route);
    const targetUrl = hash ? `${route}${hash}` : route;
    if (window.location.pathname !== route || (hash && window.location.hash !== hash) || (!hash && window.location.hash)) {
      window.history.pushState(null, '', targetUrl);
    }
    if (hash) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  return (
    <AuthProvider>
      <NavigationProvider value={{ currentRoute, navigate }}>
        <div className="flex min-h-screen flex-col bg-white text-ink">
          <Header />
          <main id="contenu" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
            <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
              {renderPage(currentRoute, navigate)}
            </Suspense>
          </main>
          <Footer />
          <CookieNotice />
        </div>
      </NavigationProvider>
    </AuthProvider>
  );
}
