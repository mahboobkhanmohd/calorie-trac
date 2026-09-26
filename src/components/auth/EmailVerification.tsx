import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, CheckCircle2, RefreshCw, AlertTriangle, Send } from 'lucide-react';

export const EmailVerification: React.FC = () => {
  const { user, isEmailVerified, sendVerificationEmail, refreshUser } = useAuth();
  const [cooldown, setCooldown] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentNotice, setSentNotice] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // If verified or no user, do not render
  if (!user || isEmailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    setSentNotice(false);
    try {
      await sendVerificationEmail();
      setSentNotice(true);
      setCooldown(60);
      setTimeout(() => setSentNotice(false), 5000);
    } catch (e) {
      console.error('Failed to resend verification email', e);
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await refreshUser();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/15 via-[#19191C] to-amber-500/15 border-b border-amber-500/25 px-4 py-2.5 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Please verify your email address (<strong className="font-semibold text-white">{user.email}</strong>) to guarantee uninterrupted database access.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sentNotice && (
            <span className="text-[11px] text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sent link!
            </span>
          )}

          <button
            onClick={handleResend}
            disabled={cooldown > 0 || isSending}
            className="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-display font-semibold text-[11px] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>{cooldown > 0 ? `Resend (${cooldown}s)` : isSending ? 'Sending...' : 'Resend Email'}</span>
          </button>

          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 font-display text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh verification status"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>I've Verified</span>
          </button>
        </div>
      </div>
    </div>
  );
};
