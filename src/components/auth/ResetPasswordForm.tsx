import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, Check, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

interface ResetPasswordFormProps {
  initialCode?: string;
  onSwitchToLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ initialCode = '', onSwitchToLogin }) => {
  const { confirmResetPassword, error, clearError } = useAuth();
  const [code, setCode] = useState(initialCode);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Check if code exists in URL search params (e.g. ?oobCode=... or &oobCode=...)
    if (!initialCode && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('oobCode');
      if (urlCode) {
        setCode(urlCode);
      }
    }
  }, [initialCode]);

  // Password Requirements Validation
  const passwordChecks = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const passedChecksCount = useMemo(() => {
    return Object.values(passwordChecks).filter(Boolean).length;
  }, [passwordChecks]);

  const isFormValid =
    code.trim().length > 0 &&
    passedChecksCount >= 4 &&
    newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!code.trim()) {
      setFormError('Please enter the password reset code from your email link.');
      return;
    }

    if (passedChecksCount < 4) {
      setFormError('Password does not satisfy the security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsLoading(true);
    try {
      await confirmResetPassword(code.trim(), newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Could not reset password. The link or code may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B4A]/20 via-[#19191C] to-[#4D8DFF]/20 border border-white/10 mb-4 shadow-xl shadow-[#FF6B4A]/10">
          <KeyRound className="w-7 h-7 text-[#FF6B4A]" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F5F3EE] tracking-tight">
          Set New Password
        </h1>
        <p className="text-xs sm:text-sm text-[#8C8C8E] mt-1.5">
          Establish a resilient credential for your CALORA account
        </p>
      </div>

      {isSuccess ? (
        <div className="p-6 rounded-3xl bg-[#141417] border border-white/10 text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[#F5F3EE]">Password Successfully Updated</h3>
            <p className="text-xs text-[#8C8C8E] mt-1.5 leading-relaxed">
              Your password has been changed. You can now log into CALORA with your new credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FF6B4A] hover:bg-[#ff7a5c] text-xs font-display font-bold text-[#101010] transition-colors cursor-pointer"
          >
            Continue to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Reset Code Input */}
          <div>
            <label htmlFor="reset-code" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] mb-1.5 font-medium">
              Reset Code (from recovery email)
            </label>
            <input
              id="reset-code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste action code or oobCode here"
              className="w-full bg-[#141417] border border-white/10 rounded-2xl px-4 py-3 text-sm text-[#F5F3EE] placeholder-white/20 focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all font-mono"
            />
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="new-password" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] mb-1.5 font-medium">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C8E]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#141417] border border-white/10 rounded-2xl pl-10 pr-11 py-3 text-sm text-[#F5F3EE] placeholder-white/20 focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C8C8E] hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirm-new-password" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] mb-1.5 font-medium">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C8E]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm-new-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full bg-[#141417] border rounded-2xl pl-10 pr-11 py-3 text-sm text-[#F5F3EE] placeholder-white/20 focus:outline-none transition-all ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-500/60 focus:border-red-500'
                    : 'border-white/10 focus:border-[#FF6B4A]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C8C8E] hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
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

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display font-bold text-sm tracking-wide shadow-lg shadow-[#FF6B4A]/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

          <div className="text-center pt-3">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs text-[#8C8C8E] hover:text-[#F5F3EE] transition-colors focus:outline-none cursor-pointer"
            >
              Cancel and return to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
