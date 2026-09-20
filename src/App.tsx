/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StartModal } from './components/StartModal';
import { HomePage } from './pages/HomePage';
import { PricingPage } from './pages/PricingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LegalPage } from './pages/LegalPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { AuthProvider } from './components/AuthContext';
import { PageRoute } from './types';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (['/pricing', '/privacy', '/legal', '/login', '/register', '/dashboard', '/auth/callback'].includes(path)) {
        return path as PageRoute;
      }
      // Check hash route fallback if applicable
      const hash = window.location.hash;
      if (hash === '#/pricing') return '/pricing';
      if (hash === '#/privacy') return '/privacy';
      if (hash === '#/legal') return '/legal';
      if (hash === '#/login') return '/login';
      if (hash === '#/register') return '/register';
      if (hash === '#/dashboard') return '/dashboard';
      if (hash === '#/auth/callback') return '/auth/callback';
    }
    return '/';
  });

  const [isStartModalOpen, setIsStartModalOpen] = useState(false);

  // Sync with browser history popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (['/pricing', '/privacy', '/legal', '/login', '/register', '/dashboard', '/auth/callback'].includes(path)) {
        setCurrentRoute(path as PageRoute);
      } else {
        const hash = window.location.hash;
        if (hash === '#/pricing') setCurrentRoute('/pricing');
        else if (hash === '#/privacy') setCurrentRoute('/privacy');
        else if (hash === '#/legal') setCurrentRoute('/legal');
        else if (hash === '#/login') setCurrentRoute('/login');
        else if (hash === '#/register') setCurrentRoute('/register');
        else if (hash === '#/dashboard') setCurrentRoute('/dashboard');
        else if (hash === '#/auth/callback') setCurrentRoute('/auth/callback');
        else setCurrentRoute('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: PageRoute, hash?: string) => {
    setCurrentRoute(route);

    const targetUrl = route === '/' && hash ? `${route}${hash}` : route;
    if (window.location.pathname !== route || (hash && window.location.hash !== hash)) {
      window.history.pushState(null, '', targetUrl);
    }

    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-rose-600 selection:text-white">
        {/* Header */}
        <Header
          currentRoute={currentRoute}
          onNavigate={navigate}
          onOpenStartModal={() => setIsStartModalOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1">
          {currentRoute === '/' && (
            <HomePage
              onNavigate={navigate}
              onOpenStartModal={() => setIsStartModalOpen(true)}
            />
          )}
          {currentRoute === '/pricing' && (
            <PricingPage
              onOpenStartModal={() => setIsStartModalOpen(true)}
            />
          )}
          {currentRoute === '/privacy' && (
            <PrivacyPage onNavigate={navigate} />
          )}
          {currentRoute === '/legal' && (
            <LegalPage onNavigate={navigate} />
          )}
          {currentRoute === '/login' && (
            <LoginPage onNavigate={navigate} />
          )}
          {currentRoute === '/register' && (
            <RegisterPage onNavigate={navigate} />
          )}
          {currentRoute === '/dashboard' && (
            <DashboardPage onNavigate={navigate} />
          )}
          {currentRoute === '/auth/callback' && (
            <AuthCallbackPage onNavigate={navigate} />
          )}
        </main>

        {/* Footer */}
        <Footer onNavigate={navigate} />

        {/* Onboarding Dialog */}
        <StartModal
          isOpen={isStartModalOpen}
          onClose={() => setIsStartModalOpen(false)}
        />
      </div>
    </AuthProvider>
  );
}

