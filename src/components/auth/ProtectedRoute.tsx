import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirectToLogin: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onRedirectToLogin }) => {
  const { user, loading } = useAuth();

  if (loading) {
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
            Validating Biometric Vault
          </p>
          <p className="text-xs text-[#8C8C8E] mt-0.5">Secure session verification in progress...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] max-w-lg mx-auto flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF6B4A]/20 via-[#19191C] to-red-500/20 border border-[#FF6B4A]/30 flex items-center justify-center mb-5 shadow-2xl shadow-[#FF6B4A]/10">
          <ShieldAlert className="w-8 h-8 text-[#FF6B4A]" />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#FF6B4A] bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 px-3 py-1 rounded-full mb-3">
          Protected Area
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F5F3EE] tracking-tight">
          Authentication Required
        </h2>
        <p className="text-xs sm:text-sm text-[#8C8C8E] mt-2 max-w-sm leading-relaxed">
          Your nutrition records, personal food vaults, and metabolic telemetry are strictly isolated and encrypted per user account.
        </p>

        <button
          onClick={onRedirectToLogin}
          className="mt-6 px-6 py-3 rounded-full bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display font-bold text-xs tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-lg shadow-[#FF6B4A]/30 flex items-center gap-2 cursor-pointer"
        >
          <span>Sign In to Continue</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
