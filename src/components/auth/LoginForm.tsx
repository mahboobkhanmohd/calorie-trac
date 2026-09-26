import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignup,
  onSwitchToForgotPassword,
  onSuccess
}) => {
  const { loginWithEmail, signInWithGoogle, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim() || !password) {
      setFormError('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      onSuccess?.();
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    clearError();
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      setFormError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedError = formError || error;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B4A]/20 via-[#19191C] to-[#4D8DFF]/20 border border-white/10 mb-4 shadow-xl shadow-[#FF6B4A]/10">
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
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F5F3EE] tracking-tight">
          Welcome to CALORA
        </h1>
        <p className="text-xs sm:text-sm text-[#8C8C8E] mt-1.5">
          Access your precision metabolic intelligence &amp; biometric telemetry
        </p>
      </div>

      {/* Error notification badge */}
      {displayedError && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fade-in" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{displayedError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] mb-1.5 font-medium">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C8E]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@calora.fit"
              className="w-full bg-[#141417] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#F5F3EE] placeholder-white/20 focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] font-medium">
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs text-[#FF6B4A] hover:text-[#ff8a65] transition-colors focus:outline-none cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C8E]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#141417] border border-white/10 rounded-2xl pl-10 pr-11 py-3 text-sm text-[#F5F3EE] placeholder-white/20 focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C8C8E] hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button (Coral CTA) */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display font-bold text-sm tracking-wide shadow-lg shadow-[#FF6B4A]/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Log In</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#19191C] px-3 text-[#8C8C8E] font-display font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl bg-[#141417] hover:bg-[#1f1f24] text-[#F5F3EE] border border-white/10 font-display font-semibold text-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3 shadow-sm hover:border-white/20"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-8 text-center text-xs text-[#8C8C8E]">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-[#FF6B4A] hover:text-[#ff8a65] font-semibold transition-colors focus:outline-none cursor-pointer"
        >
          Create account
        </button>
      </div>
    </div>
  );
};
