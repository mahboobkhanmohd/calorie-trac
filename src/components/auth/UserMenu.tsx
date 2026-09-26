import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNutrition } from '../../context/NutritionContext';
import { User, Shield, LogOut, LayoutGrid, CheckCircle2, ChevronDown, KeyRound, Sparkles } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, isEmailVerified, logout } = useAuth();
  const { setActiveTab } = useNutrition();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'Athlete';
  const initial = (displayName[0] || 'U').toUpperCase();

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    setActiveTab('landing');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#19191C] hover:bg-[#212125] border border-white/10 transition-all focus:outline-none cursor-pointer group"
        aria-expanded={isOpen}
      >
        <div className="relative">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-2 ring-[#4D8DFF]/40 group-hover:ring-[#FF6B4A] transition-all"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#2a2a30] text-[#F5F3EE] font-display font-bold text-xs flex items-center justify-center ring-2 ring-[#4D8DFF]/40">
              {initial}
            </div>
          )}
          {isEmailVerified && (
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#121214]"
              title="Verified Account"
            />
          )}
        </div>

        <span className="hidden sm:inline font-display font-semibold text-xs text-[#F5F3EE] max-w-[100px] truncate">
          {displayName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#8C8C8E] group-hover:text-white transition-colors" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-[#141417] border border-white/10 shadow-2xl p-2 z-50 animate-fade-in divide-y divide-white/5">
          {/* User Details */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-bold text-sm text-[#F5F3EE] truncate">{displayName}</span>
              {isEmailVerified && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-[#8C8C8E] truncate">{user.email}</p>
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            <button
              onClick={() => handleNavigate('dashboard')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-display font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
            >
              <LayoutGrid className="w-4 h-4 text-[#FF6B4A]" />
              <span>Metabolic Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigate('profile')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-display font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
            >
              <User className="w-4 h-4 text-[#4D8DFF]" />
              <span>Biometric Profile &amp; Targets</span>
            </button>

            <button
              onClick={() => handleNavigate('profile')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-display font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
            >
              <Shield className="w-4 h-4 text-[#9B7BFF]" />
              <span>Security &amp; Encryption</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-display font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
