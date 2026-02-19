import type { UserPreferences } from '../types/registration.types';

// TODO: Replace with real Firestore calls when backend is ready

/** Complete user profile */
export async function completeProfile(
  userId: string,
  data: { firstName: string; lastName: string; email: string; birthday?: string }
): Promise<{ success: boolean }> {
  console.log(`[Firebase] Profile completed for ${userId}:`, data);
  return { success: true };
}

/** Save user preferences from questionnaire */
export async function savePreferences(
  userId: string,
  preferences: UserPreferences
): Promise<{ success: boolean }> {
  console.log(`[Firebase] Preferences saved for ${userId}:`, preferences);
  return { success: true };
}

/** Process membership fee payment */
export async function processMembershipFee(
  userId: string,
  amount: number
): Promise<{ success: boolean; transactionId: string }> {
  const transactionId = `txn_${Date.now()}`;
  console.log(`[Firebase] Membership fee ₪${amount} processed for ${userId}: ${transactionId}`);
  return { success: true, transactionId };
}
