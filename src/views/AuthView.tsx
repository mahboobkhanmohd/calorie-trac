import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { ArrowLeft } from 'lucide-react';

export type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

interface AuthViewProps {
  initialMode?: AuthMode;
  onSuccess?: () => void;
  onBackToLanding?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
  onBackToLanding
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Animated Gradient Mesh & Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#FF6B4A]/15 via-[#9B7BFF]/10 to-[#4D8DFF]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Subtle Floating Particle Dots */}
      <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-[#FF6B4A]/30 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-3 h-3 rounded-full bg-[#4D8DFF]/25 animate-pulse pointer-events-none" />
      <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 rounded-full bg-[#9B7BFF]/35 pointer-events-none" />

      {/* Main Auth Card Container */}
      <div className="relative w-full max-w-lg bg-[#19191C]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Back to Home Button */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-[#8C8C8E] hover:text-[#F5F3EE] transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>
        )}

        {/* Dynamic Mode Switch */}
        {mode === 'login' && (
          <LoginForm
            onSwitchToSignup={() => setMode('signup')}
            onSwitchToForgotPassword={() => setMode('forgot-password')}
            onSuccess={onSuccess}
          />
        )}

        {mode === 'signup' && (
          <SignupForm
            onSwitchToLogin={() => setMode('login')}
            onSuccess={onSuccess}
          />
        )}

        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            onSwitchToLogin={() => setMode('login')}
            onEnterResetCode={() => setMode('reset-password')}
          />
        )}

        {mode === 'reset-password' && (
          <ResetPasswordForm
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
};
