/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NutritionProvider, useNutrition } from './context/NutritionContext';
import { Navbar } from './components/Navbar';
import { MobileNavigation } from './components/MobileNavigation';
import { Footer } from './components/Footer';
import { AddFoodModal } from './components/AddFoodModal';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { Toast } from './components/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { EmailVerification } from './components/auth/EmailVerification';

import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { FoodLogView } from './views/FoodLogView';
import { ProgressView } from './views/ProgressView';
import { CalculatorView } from './views/CalculatorView';
import { InsightsView } from './views/InsightsView';
import { ProfileView } from './views/ProfileView';

const PROTECTED_ROUTES = ['dashboard', 'food-log', 'calculator', 'progress', 'insights', 'profile'];

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useNutrition();
  const { user, loading } = useAuth();

  // Redirect unauthenticated users attempting to access protected routes to login
  useEffect(() => {
    if (loading) return;

    if (!user && PROTECTED_ROUTES.includes(activeTab)) {
      setActiveTab('login');
    } else if (user && (activeTab === 'landing' || activeTab === 'login' || activeTab === 'signup')) {
      setActiveTab('dashboard');
    }
  }, [user, loading, activeTab, setActiveTab]);

  // Synchronize route from browser URL/pathname/hash
  useEffect(() => {
    const syncFromLocation = () => {
      const path = window.location.pathname.replace(/^\/+/, '').split('/')[0] || '';
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0] || '';
      const urlParams = new URLSearchParams(window.location.search);

      if (urlParams.get('oobCode') || path === 'reset-password' || hash === 'reset-password') {
        setActiveTab('reset-password');
        return;
      }

      const route = hash || path;
      const knownRoutes = [
        'landing',
        'login',
        'signup',
        'forgot-password',
        'reset-password',
        'dashboard',
        'food-log',
        'calculator',
        'progress',
        'insights',
        'profile',
      ];

      if (route && knownRoutes.includes(route)) {
        if (!user && !loading && PROTECTED_ROUTES.includes(route)) {
          setActiveTab('login');
        } else {
          setActiveTab(route);
        }
      }
    };

    syncFromLocation();

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, [user, loading, setActiveTab]);

  // Keep browser history updated on tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const targetPath = activeTab === 'landing' ? '/' : `/${activeTab}`;
      if (window.location.pathname !== targetPath && !window.location.search.includes('oobCode')) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, [activeTab]);

  const renderView = () => {
    // Show validation state while initial session is verifying
    if (loading && PROTECTED_ROUTES.includes(activeTab)) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center p-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping" />
            <svg className="w-12 h-12 -rotate-45 animate-spin" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#212125" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#FF6B4A"
                strokeWidth="3"
                strokeDasharray="45, 100"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-[#F5F3EE] tracking-wide">
              Validating Authenticated Session
            </p>
            <p className="text-xs text-[#8C8C8E] mt-0.5">Secure biometric telemetry isolation in progress...</p>
          </div>
        </div>
      );
    }

    // Unauthenticated landing view
    if (activeTab === 'landing') {
      return (
        <LandingView
          onOpenLogin={() => setActiveTab('login')}
          onOpenSignup={() => setActiveTab('signup')}
        />
      );
    }

    // Authentication view modes
    if (
      activeTab === 'login' ||
      activeTab === 'signup' ||
      activeTab === 'forgot-password' ||
      activeTab === 'reset-password'
    ) {
      return (
        <AuthView
          initialMode={activeTab as any}
          onSuccess={() => setActiveTab('dashboard')}
          onBackToLanding={() => setActiveTab('landing')}
        />
      );
    }

    // Protected application views
    return (
      <ProtectedRoute onRedirectToLogin={() => setActiveTab('login')}>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'food-log' && <FoodLogView />}
        {activeTab === 'progress' && <ProgressView />}
        {activeTab === 'calculator' && <CalculatorView />}
        {activeTab === 'insights' && <InsightsView />}
        {activeTab === 'profile' && <ProfileView />}
        {!PROTECTED_ROUTES.includes(activeTab) && <DashboardView />}
      </ProtectedRoute>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#e5e2e1] flex flex-col font-sans selection:bg-[#FF6B4A] selection:text-[#101010]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full pt-20">
        <EmailVerification />
        {renderView()}
      </main>

      {/* Global Modals & Notifications (Only for authenticated users) */}
      {user && (
        <>
          <AddFoodModal />
          <LiveVoiceModal />
        </>
      )}
      <Toast />

      {/* Mobile Navigation Dock */}
      <MobileNavigation />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NutritionProvider>
        <AppContent />
      </NutritionProvider>
    </AuthProvider>
  );
}
