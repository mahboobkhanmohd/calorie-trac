import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNutrition } from '../context/NutritionContext';
import {
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Check,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  LogOut,
  Mail,
  RefreshCw,
  X
} from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const { user, isEmailVerified, changePassword, deleteAccount, logout, sendVerificationEmail, refreshUser } = useAuth();
  const { exportDataJSON, deleteUserData, showToast, setActiveTab } = useNutrition();

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email verification state
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Data Deletion Modal State
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);

  // Account Deletion Modal State
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [reauthPass, setReauthPass] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  if (!user) return null;

  const isPasswordProvider = user.providerData.some((p) => p.providerId === 'password');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPass.length < 8) {
      setPassMessage({ type: 'error', text: 'New password must have at least 8 characters.' });
      return;
    }

    if (newPass !== confirmNewPass) {
      setPassMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(currentPass, newPass);
      setPassMessage({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    try {
      await sendVerificationEmail();
      setVerificationSent(true);
      showToast('Verification email dispatched.');
    } catch (e: any) {
      showToast(e.message || 'Could not send verification email.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleExportData = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calora_personal_vault_${user.uid.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Exported personal metabolic vault.');
  };

  const handleConfirmDeleteData = async () => {
    setIsDeletingData(true);
    try {
      await deleteUserData();
      setShowDeleteDataModal(false);
      showToast('All personal food entries and custom foods purged.');
    } catch (e) {
      showToast('Failed to purge data.');
    } finally {
      setIsDeletingData(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setDeleteAccountError(null);
    if (deleteConfirmationText.trim() !== 'DELETE') {
      setDeleteAccountError('Please type DELETE to confirm.');
      return;
    }

    if (isPasswordProvider && !reauthPass) {
      setDeleteAccountError('Please enter your current password to verify identity.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      // 1. Wipe all user data and profile document in Firestore first to avoid orphaned records
      await deleteUserData(true);
      // 2. Delete Auth User account
      await deleteAccount(reauthPass);
      setShowDeleteAccountModal(false);
      setActiveTab('landing');
      showToast('Account and all associated records permanently removed.');
    } catch (err: any) {
      setDeleteAccountError(err.message || 'Could not delete account. Re-authentication may be required.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-[#FF6B4A]" />
          <div>
            <h3 className="font-display font-bold text-lg text-[#F5F3EE]">Security &amp; Data Governance</h3>
            <p className="text-xs text-[#8C8C8E]">Credentials, session validity, and data sovereignty</p>
          </div>
        </div>
      </div>

      {/* Session & Identity Information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[11px] font-display uppercase tracking-wider text-[#8C8C8E]">Account ID</span>
          <p className="font-mono text-xs text-white truncate" title={user.uid}>
            {user.uid}
          </p>
        </div>

        <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[11px] font-display uppercase tracking-wider text-[#8C8C8E]">Email Status</span>
          <div className="flex items-center gap-2">
            {isEmailVerified ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Pending
                </span>
                <button
                  onClick={handleSendVerification}
                  disabled={isSendingVerification || verificationSent}
                  className="text-[10px] text-[#FF6B4A] hover:underline disabled:opacity-50"
                >
                  {verificationSent ? 'Sent' : 'Verify'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[11px] font-display uppercase tracking-wider text-[#8C8C8E]">Auth Provider</span>
          <p className="text-xs text-white capitalize">
            {user.providerData.map((p) => p.providerId).join(', ') || 'Email / Password'}
          </p>
        </div>
      </div>

      {/* Change Password (if provider is email/password) */}
      {isPasswordProvider && (
        <form onSubmit={handleChangePassword} className="bg-[#141417] p-5 sm:p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-[#FF6B4A]" />
            <h4 className="font-display font-semibold text-sm text-[#F5F3EE]">Change Password</h4>
          </div>

          {passMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {passMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{passMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#8C8C8E] mb-1 font-medium">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B4A]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8C8C8E] hover:text-white"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#8C8C8E] mb-1 font-medium">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B4A]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8C8C8E] hover:text-white"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#8C8C8E] mb-1 font-medium">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B4A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPass || !currentPass || !newPass}
            className="py-2 px-4 rounded-full bg-[#212125] hover:bg-[#2a2a30] text-white border border-white/10 font-display text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isChangingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}

      {/* Data Governance & Export */}
      <div className="bg-[#141417] p-5 sm:p-6 rounded-2xl border border-white/5 space-y-4">
        <div>
          <h4 className="font-display font-semibold text-sm text-[#F5F3EE]">Personal Data Sovereignty</h4>
          <p className="text-xs text-[#8C8C8E] mt-0.5">
            CALORA guarantees data portability and complete user isolation. No other user has access to your records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2 rounded-full bg-[#212125] hover:bg-[#2a2a30] text-[#F5F3EE] font-display text-xs font-semibold border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#4D8DFF]" />
            <span>Export My Data (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteDataModal(true)}
            className="px-4 py-2 rounded-full bg-[#212125] hover:bg-[#2a2a30] text-amber-400 font-display text-xs font-semibold border border-amber-500/20 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Nutrition Records</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="p-5 sm:p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <h4 className="font-display font-bold text-sm">Danger Zone</h4>
        </div>
        <p className="text-xs text-red-300/80 leading-relaxed">
          Deleting your account is permanent. All your biometric profiles, custom foods, and food entries in Cloud Firestore will be irreversibly erased.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteAccountModal(true)}
          className="px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 font-display text-xs font-bold border border-red-500/40 transition-colors cursor-pointer"
        >
          Permanently Delete Account
        </button>
      </div>

      {/* Confirmation Modal: Delete Data Only */}
      {showDeleteDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-[#19191C] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-[#F5F3EE]">Purge Nutrition Logs?</h3>
              <button onClick={() => setShowDeleteDataModal(false)} className="text-[#8C8C8E] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#8C8C8E] leading-relaxed">
              This action will delete all logged meals and custom recipes in your personal database. Your account profile and targets will remain intact.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteDataModal(false)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-display font-semibold text-white/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteData}
                disabled={isDeletingData}
                className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-display font-bold text-xs"
              >
                {isDeletingData ? 'Purging...' : 'Yes, Purge Logs'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Account */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-[#19191C] border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-bold text-base">Confirm Account Deletion</h3>
              </div>
              <button onClick={() => setShowDeleteAccountModal(false)} className="text-[#8C8C8E] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-red-200/90 leading-relaxed">
              This operation cannot be undone. All your personal data across Cloud Firestore and Firebase Authentication will be destroyed immediately.
            </p>

            {deleteAccountError && (
              <div className="p-3 rounded-xl bg-red-500/20 text-red-300 text-xs">
                {deleteAccountError}
              </div>
            )}

            {isPasswordProvider && (
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#A0A0A3] mb-1 font-medium">
                  Current Password (Verification)
                </label>
                <input
                  type="password"
                  value={reauthPass}
                  onChange={(e) => setReauthPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#A0A0A3] mb-1 font-medium">
                Type <strong className="text-white">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-[#121214] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-display font-semibold text-white/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmationText !== 'DELETE'}
                className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-display font-bold text-xs disabled:opacity-40"
              >
                {isDeletingAccount ? 'Deleting Account...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
