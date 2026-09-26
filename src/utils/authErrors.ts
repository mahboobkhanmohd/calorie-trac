/**
 * Sanitizes Firebase Auth errors into secure, user-friendly, non-leaking messages.
 * Prevents enumeration attacks, hides internal codes, and prevents exposure of stack traces.
 */

export function sanitizeAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const errMessage = error instanceof Error ? error.message : String(error);
  console.error('[CALORA Security] Authenticated error log:', errMessage);

  // Common Firebase Auth error code patterns
  if (errMessage.includes('auth/invalid-credential') ||
      errMessage.includes('auth/user-not-found') ||
      errMessage.includes('auth/wrong-password') ||
      errMessage.includes('auth/invalid-login-credentials')) {
    return 'Invalid email or password. Please verify your credentials.';
  }

  if (errMessage.includes('auth/email-already-in-use')) {
    return 'An account already exists with this email address. Please sign in instead.';
  }

  if (errMessage.includes('auth/weak-password')) {
    return 'Password is too weak. Please ensure it has at least 8 characters with numbers and symbols.';
  }

  if (errMessage.includes('auth/too-many-requests')) {
    return 'Too many unsuccessful attempts. Access has been temporarily restricted for security. Please try again later or reset your password.';
  }

  if (errMessage.includes('auth/popup-closed-by-user') || errMessage.includes('auth/cancelled-popup-request')) {
    return 'Sign-in window was closed before completing.';
  }

  if (errMessage.includes('auth/requires-recent-login')) {
    return 'This sensitive operation requires recent authentication. Please log in again before proceeding.';
  }

  if (errMessage.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }

  if (errMessage.includes('auth/network-request-failed') || errMessage.includes('offline')) {
    return 'Network connection issue. Please check your internet connection.';
  }

  if (errMessage.includes('auth/expired-action-code')) {
    return 'This password reset link or verification code has expired. Please request a new one.';
  }

  if (errMessage.includes('auth/invalid-action-code')) {
    return 'Invalid reset link or code. It may have already been used.';
  }

  return 'Authentication service encountered an issue. Please try again in a moment.';
}
