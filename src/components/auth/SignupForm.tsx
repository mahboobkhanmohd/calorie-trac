import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Check, X, ArrowRight, AlertCircle, Shield } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { registerWithEmail, signInWithGoogle, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Password Requirements Validation
  const passwordChecks = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passedChecksCount = useMemo(() => {
    return Object.values(passwordChecks).filter(Boolean).length;
  }, [passwordChecks]);

  const strengthMeta = useMemo(() => {
    if (!password) return { label: 'None', color: 'bg-white/10', percent: 0 };
    if (passedChecksCount <= 2) return { label: 'Weak', color: 'bg-red-500', percent: 25 };
    if (passedChecksCount === 3) return { label: 'Fair', color: 'bg-amber-500', percent: 50 };
    if (passedChecksCount === 4) return { label: 'Good', color: 'bg-blue-400', percent: 75 };
    return { label: 'Strong', color: 'bg-emerald-400', percent: 100 };
  }, [password, passedChecksCount]);

  const isFormValid =
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    passedChecksCount >= 4 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please provide a valid email address.');
      return;
    }

    if (passedChecksCount < 4) {
      setFormError('Password does not satisfy the security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithEmail(email, password, name);
      onSuccess?.();
    } catch (err: any) {
      setFormError(err.message || 'Registration could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError(null);
    clearError();
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      setFormError(err.message || 'Google account sign up could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedError = formError || error;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B4A]/20 via-[#19191C] to-[#4D8DFF]/20 border border-white/10 mb-3 shadow-xl shadow-[#FF6B4A]/10">
          <Shield className="w-7 h-7 text-[#FF6B4A]" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F5F3EE] tracking-tight">
          Create CALORA Account
        </h1>
        <p className="text-xs sm:text-sm text-[#8C8C8E] mt-1">
          Isolated biometric vaults &amp; real-time metabolic coaching
        </p>
      </div>

      {/* Error notification */}
      {displayedError && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fade-in" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{displayedError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] mb-1.5 font-medium">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C8E]">
              <User className="w-4 h-4" />
            </div>
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena Vance"
              className="w-full bg-[#141417] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#F5F3EE] placeholder-white/20 focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] mb-1.5 font-medium">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C8E]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="signup-email"
              type="email"
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
            <label htmlFor="signup-password" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] font-medium">
              Create Password
            </label>
            {password && (
              <span className="text-[11px] font-mono text-[#8C8C8E]">
                Strength: <span className="font-semibold text-white">{strengthMeta.label}</span>
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C8E]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
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

          {/* Strength bar */}
          {password && (
            <div className="mt-2 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strengthMeta.color}`}
                style={{ width: `${strengthMeta.percent}%` }}
              />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm-password" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] mb-1.5 font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C8E]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full bg-[#141417] border rounded-2xl pl-10 pr-11 py-3 text-sm text-[#F5F3EE] placeholder-white/20 focus:outline-none transition-all ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-500/60 focus:border-red-500'
                  : 'border-white/10 focus:border-[#FF6B4A]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C8C8E] hover:text-white transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Requirements Checklist */}
        <div className="p-3.5 rounded-2xl bg-[#121214] border border-white/5 text-xs text-[#8C8C8E] space-y-1.5">
          <p className="font-display uppercase tracking-wider text-[10px] text-white/50 mb-1 font-semibold">
            Security Requirements
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className={`flex items-center gap-1.5 ${passwordChecks.minLength ? 'text-emerald-400' : 'text-white/40'}`}>
              {passwordChecks.minLength ? <Check className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-white/20 ml-1" />}
              <span>8+ characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? 'text-emerald-400' : 'text-white/40'}`}>
              {passwordChecks.hasUpper ? <Check className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-white/20 ml-1" />}
              <span>Uppercase letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passwordChecks.hasLower ? 'text-emerald-400' : 'text-white/40'}`}>
              {passwordChecks.hasLower ? <Check className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-white/20 ml-1" />}
              <span>Lowercase letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? 'text-emerald-400' : 'text-white/40'}`}>
              {passwordChecks.hasNumber ? <Check className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-white/20 ml-1" />}
              <span>Number (0-9)</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display font-bold text-sm tracking-wide shadow-lg shadow-[#FF6B4A]/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-5">
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
          onClick={handleGoogleSignUp}
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

      {/* Switch to Login */}
      <div className="mt-6 text-center text-xs text-[#8C8C8E]">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#FF6B4A] hover:text-[#ff8a65] font-semibold transition-colors focus:outline-none cursor-pointer"
        >
          Log in
        </button>
      </div>
    </div>
  );
};
