import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
  updatePassword,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onIdTokenChanged,
  User,
  testConnection
} from '../lib/firebase';
import { sanitizeAuthError } from '../utils/authErrors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseReady: boolean;
  error: string | null;
  isEmailVerified: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  confirmResetPassword: (oobCode: string, newPass: string) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  deleteAccount: (currentPassword?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    // Validate connection to Firestore on boot
    testConnection().then((connected) => {
      setIsFirebaseReady(connected);
    });

    // Listen to token changes and auth state for persistent sessions and expiration
    const unsubscribe = onIdTokenChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        console.error('Session listener error:', err);
        setError(sanitizeAuthError(err));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
      } catch (err) {
        console.error('Failed to reload current user:', err);
      }
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err) {
      const sanitized = sanitizeAuthError(err);
      setError(sanitized);
      throw new Error(sanitized);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      try {
        // Send email verification immediately
        await sendEmailVerification(cred.user);
      } catch (verificationErr) {
        console.warn('Could not send initial email verification:', verificationErr);
      }
      // Force refresh user state to capture updated displayName
      if (auth.currentUser) {
        setUser({ ...auth.currentUser });
      }
    } catch (err) {
      const sanitized = sanitizeAuthError(err);
      setError(sanitized);
      throw new Error(sanitized);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const sanitized = sanitizeAuthError(err);
      setError(sanitized);
      throw new Error(sanitized);
    }
  };

  const sendVerificationEmail = async () => {
    setError(null);
    if (!auth.currentUser) {
      throw new Error('No authenticated user session found.');
    }
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err) {
      const sanitized = sanitizeAuthError(err);
      setError(sanitized);
      throw new Error(sanitized);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      // Security best practice: do not leak whether an account exists or not
      console.warn('Password reset call error:', err);
      // Still resolve cleanly from UI perspective unless network error
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('network') || msg.includes('offline')) {
        throw new Error('Network issue. Please check your internet connection and try again.');
      }
    }
  };

  const confirmResetPassword = async (oobCode: string, newPass: string) => {
    setError(null);
    try {
      await confirmPasswordReset(auth, oobCode, newPass);
    } catch (err) {
      const sanitized = sanitizeAuthError(err);
      setError(sanitized);
      throw new Error(sanitized);
    }
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    setError(null);
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('You must be signed in to change your password.');
    }

    try {
      // Re-authenticate before sensitive password change
      const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPass);
    } catch (err) {
      const sanitized = sanitizeAuthError(err);
      setError(sanitized);
      throw new Error(sanitized);
    }
  };

  const deleteAccount = async (currentPassword?: string) => {
    setError(null);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No active user session to delete.');
    }

    try {
      // If password provided and user has password provider, re-authenticate first
      if (currentPassword && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }
      await deleteUser(currentUser);
      setUser(null);
    } catch (err) {
      const sanitized = sanitizeAuthError(err);
      setError(sanitized);
      throw new Error(sanitized);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Sign Out failed:', err);
      const sanitized = sanitizeAuthError(err);
      setError(sanitized);
      throw new Error(sanitized);
    }
  };

  // Google accounts or verified email accounts
  const isEmailVerified = Boolean(
    user?.emailVerified ||
    user?.providerData.some((p) => p.providerId === 'google.com')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseReady,
        error,
        isEmailVerified,
        loginWithEmail,
        registerWithEmail,
        signInWithGoogle,
        sendVerificationEmail,
        sendPasswordReset,
        confirmResetPassword,
        changePassword,
        deleteAccount,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
