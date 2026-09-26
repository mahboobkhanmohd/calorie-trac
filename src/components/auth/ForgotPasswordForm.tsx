import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onEnterResetCode?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
  onEnterResetCode,
}) => {
  const { sendPasswordReset, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      // Generic success message to prevent user enumeration
      setIsSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || 'Unable to process request. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B4A]/20 via-[#19191C] to-[#9B7BFF]/20 border border-white/10 mb-4 shadow-xl shadow-[#FF6B4A]/10">
          <Mail className="w-7 h-7 text-[#FF6B4A]" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F5F3EE] tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-xs sm:text-sm text-[#8C8C8E] mt-1.5">
          Enter your registered email address to receive secure recovery instructions
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-6 rounded-3xl bg-[#141417] border border-white/10 text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[#F5F3EE]">Recovery Email Dispatched</h3>
            <p className="text-xs text-[#8C8C8E] mt-1.5 leading-relaxed">
              If an account matches <span className="text-white font-medium">{email}</span>, you will receive an email shortly with a secure password reset link.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            {onEnterResetCode && (
              <button
                type="button"
                onClick={onEnterResetCode}
                className="w-full py-2.5 px-4 rounded-xl bg-[#212125] hover:bg-[#2c2c32] text-xs font-display font-semibold text-white border border-white/10 transition-colors cursor-pointer"
              >
                Already have a reset code?
              </button>
            )}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF6B4A] hover:bg-[#ff7a5c] text-xs font-display font-bold text-[#101010] transition-colors cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label htmlFor="reset-email" className="block text-xs font-display uppercase tracking-wider text-[#A0A0A3] mb-1.5 font-medium">
              Registered Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8C8E]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@calora.fit"
                className="w-full bg-[#141417] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#F5F3EE] placeholder-white/20 focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display font-bold text-sm tracking-wide shadow-lg shadow-[#FF6B4A]/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div className="text-center pt-3">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="inline-flex items-center gap-1.5 text-xs text-[#8C8C8E] hover:text-[#F5F3EE] transition-colors focus:outline-none cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
