import {
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithRedirect,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { AuthSession, OtpVerifyResult } from '../types/auth.types';

// ── Internal state ──

/** Stored between sendOtp → verifyOtp calls */
let confirmationResult: ConfirmationResult | null = null;
/** Lazily created reCAPTCHA verifier */
let recaptchaVerifier: RecaptchaVerifier | null = null;

// ── Helpers ──

/** Convert Israeli phone (050-1234567) to E.164 (+972501234567) */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('972')) return `+${digits}`;
  if (digits.startsWith('0')) return `+972${digits.slice(1)}`;
  return `+972${digits}`;
}

function getOrCreateRecaptcha(): RecaptchaVerifier {
  if (recaptchaVerifier) return recaptchaVerifier;
  recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
  });
  return recaptchaVerifier;
}

// ── Google Sign-In ──

export async function firebaseGoogleSignIn(): Promise<{
  success: boolean;
  session?: AuthSession;
  profile?: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  };
}> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === 'auth/popup-blocked') {
        // Fallback for mobile browsers that block popups
        await signInWithRedirect(auth, provider);
        return { success: false }; // redirect will handle result on return
      }
      throw err;
    }

    const user = result.user;
    const idToken = await user.getIdToken();

    const nameParts = (user.displayName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      success: true,
      session: {
        token: idToken,
        userId: user.uid,
        method: 'google',
        isOrgMember: false,
        marketingConsent: false,
      },
      profile: {
        email: user.email || '',
        firstName,
        lastName,
        picture: user.photoURL || '',
      },
    };
  } catch (error) {
    console.error('Google sign-in failed:', error);
    return { success: false };
  }
}

// ── Apple Sign-In ──

export async function firebaseAppleSignIn(): Promise<{
  success: boolean;
  session?: AuthSession;
  profile?: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  };
  notAvailable?: boolean;
}> {
  try {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === 'auth/operation-not-allowed') {
        // Apple provider not configured yet
        return { success: false, notAvailable: true };
      }
      if (firebaseErr.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
        return { success: false };
      }
      throw err;
    }

    const user = result.user;
    const idToken = await user.getIdToken();

    const nameParts = (user.displayName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      success: true,
      session: {
        token: idToken,
        userId: user.uid,
        method: 'apple',
        isOrgMember: false,
        marketingConsent: false,
      },
      profile: {
        email: user.email || '',
        firstName,
        lastName,
        picture: user.photoURL || '',
      },
    };
  } catch (error) {
    console.error('Apple sign-in failed:', error);
    return { success: false };
  }
}

// ── Phone OTP: Send ──

export async function firebaseSendOtp(
  phone: string
): Promise<{ success: boolean }> {
  try {
    const e164 = toE164(phone);
    const verifier = getOrCreateRecaptcha();
    confirmationResult = await signInWithPhoneNumber(auth, e164, verifier);
    return { success: true };
  } catch (error) {
    console.error('OTP send failed:', error);
    // Reset reCAPTCHA on error so it can be recreated on retry
    recaptchaVerifier = null;
    return { success: false };
  }
}

// ── Phone OTP: Verify ──

export async function firebaseVerifyOtp(
  _phone: string,
  code: string
): Promise<OtpVerifyResult> {
  try {
    if (!confirmationResult) {
      return { success: false };
    }

    const result = await confirmationResult.confirm(code);
    const user = result.user;
    const idToken = await user.getIdToken();

    const session: AuthSession = {
      token: idToken,
      userId: user.uid,
      method: 'phone',
      isOrgMember: false, // TODO: lookup in Firestore
      marketingConsent: false,
    };

    return {
      success: true,
      session,
      registrationContext: {
        orgMember: null,
        profileComplete: false,
        missingFields: ['firstName', 'lastName', 'email'],
      },
    };
  } catch (error) {
    console.error('OTP verification failed:', error);
    return { success: false };
  }
}

// ── Save Consent ──

export async function firebaseSaveConsent(
  userId: string,
  consent: boolean
): Promise<{ success: boolean }> {
  // TODO: Save to Firestore when ready
  console.log(`[Firebase] Marketing consent for ${userId}: ${consent}`);
  return { success: true };
}

// ── Sign Out ──

export async function firebaseSignOut(): Promise<void> {
  await auth.signOut();
}
