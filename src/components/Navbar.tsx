import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from './auth/UserMenu';
import { Plus, Mic, LogIn, Radio, WifiOff, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddModalOpen,
    setIsVoiceAssistantOpen,
    isOnline,
    offlineSyncStatus,
    pendingSyncCount,
    triggerSync,
  } = useNutrition();
  const { user } = useAuth();

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'food-log', label: 'Food Log' },
    { id: 'progress', label: 'Progress' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'insights', label: 'Insights' },
    { id: 'profile', label: 'Profile' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#121214]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none cursor-pointer"
          >
            {/* Custom CALORA Biometric Ring Brand Icon */}
            <div className="w-8 h-8 relative flex items-center justify-center">
              <svg className="w-8 h-8 -rotate-45" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#212125" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#FF6B4A"
                  strokeWidth="3.5"
                  strokeDasharray="45, 100"
                  strokeLinecap="round"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#4D8DFF"
                  strokeWidth="3.5"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-50"
                  strokeLinecap="round"
                />
                <circle cx="18" cy="18" r="4.5" fill="#FF6B4A" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl uppercase tracking-wider text-[#F5F3EE] group-hover:text-white transition-colors">
              CALORA
            </span>
          </button>

          {/* Zone 2: Navigation Links (Capsule Container - authenticated only) */}
          {user && (
            <nav className="hidden md:flex items-center bg-[#121214] p-1 rounded-full border border-white/[0.08]">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`px-4 py-1.5 rounded-full font-display text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#212125] text-[#F5F3EE] shadow-sm border border-white/[0.1]'
                        : 'text-[#8C8C8E] hover:text-[#F5F3EE] hover:bg-[#19191C]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Zone 3: Actions (Sync Status, Voice AI, Add Food, UserMenu / Auth) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Offline / Sync Status Indicator */}
          {user && (!isOnline ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono"
              title={`${pendingSyncCount} food logs queued locally for cloud sync`}
            >
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Offline</span>
              {pendingSyncCount > 0 && (
                <span className="bg-amber-500/20 px-1.5 py-0.2 rounded-full font-bold">{pendingSyncCount}</span>
              )}
            </div>
          ) : offlineSyncStatus === 'syncing' ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-mono"
              title="Syncing pending logs with Firebase Firestore"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span className="hidden lg:inline">Syncing...</span>
            </div>
          ) : pendingSyncCount > 0 ? (
            <button
              onClick={() => triggerSync()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#9B7BFF]/15 border border-[#9B7BFF]/30 text-[#9B7BFF] hover:bg-[#9B7BFF]/25 text-xs font-mono transition-colors cursor-pointer"
              title={`${pendingSyncCount} food logs queued. Click to sync with Firebase now.`}
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>Sync ({pendingSyncCount})</span>
            </button>
          ) : null)}

          {/* Live Voice API Button */}
          {user && (
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-[#19191C] hover:bg-[#212125] border border-[#FF6B4A]/30 text-white font-display text-xs font-semibold shadow-sm hover:border-[#FF6B4A] transition-all cursor-pointer group"
              title="Chat with Gemini 3.8 Live Voice Coach"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B4A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B4A]"></span>
              </span>
              <Mic className="w-3.5 h-3.5 text-[#FF6B4A] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-white/90">Live AI</span>
            </button>
          )}

          {/* Add Food Button */}
          {user && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-display font-semibold text-xs sm:text-sm hover:shadow-[0_0_24px_rgba(255,107,74,0.45)] transition-all duration-200 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Food</span>
            </button>
          )}

          {/* User Menu or Sign In / Sign Up CTAs */}
          {user ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('login')}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#19191C] hover:bg-[#212125] text-[#F5F3EE] border border-white/10 font-display text-xs font-semibold transition-all cursor-pointer hover:border-white/20"
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
