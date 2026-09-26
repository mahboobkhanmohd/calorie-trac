import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, UtensilsCrossed, TrendingUp, Calculator, Sparkles, User, Plus, Mic, Home, LogIn } from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddModalOpen, setIsVoiceAssistantOpen } = useNutrition();
  const { user } = useAuth();

  const authenticatedTabs = [
    { id: 'dashboard', label: 'Core', icon: LayoutGrid },
    { id: 'food-log', label: 'Log', icon: UtensilsCrossed },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'calculator', label: 'Calc', icon: Calculator },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const unauthenticatedTabs = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'login', label: 'Log In', icon: LogIn },
    { id: 'signup', label: 'Sign Up', icon: User }
  ];

  const tabs = user ? authenticatedTabs : unauthenticatedTabs;

  return (
    <>
      {/* Floating Actions for Mobile: Voice AI & Add Food (Only when authenticated) */}
      {user && (
        <div className="md:hidden fixed bottom-20 right-4 z-40 flex flex-col items-center gap-3">
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="w-11 h-11 rounded-full bg-[#19191C] border border-[#FF6B4A]/50 text-[#FF6B4A] shadow-[0_0_16px_rgba(255,107,74,0.3)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            aria-label="Live Voice Assistant"
            title="Live AI Voice"
          >
            <Mic className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-13 h-13 rounded-full bg-[#FF6B4A] text-[#101010] shadow-[0_0_24px_rgba(255,107,74,0.5)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            aria-label="Add Food"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Bottom Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121214]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-2">
        <nav className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#FF6B4A] font-semibold'
                    : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="font-display text-[11px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
