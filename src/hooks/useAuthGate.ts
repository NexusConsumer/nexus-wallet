import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useLoginSheetStore } from '../stores/loginSheetStore';

interface AuthGateOptions {
  promptMessage?: string;
}

export function useAuthGate() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOrgMember = useAuthStore((s) => s.isOrgMember);
  const openLoginSheet = useLoginSheetStore((s) => s.open);

  /**
   * Call when user performs a gated action (buy, redeem, view member price).
   * If not authenticated, opens the LoginSheet and waits.
   * Returns true if now authenticated, false if dismissed.
   */
  const requireAuth = useCallback(
    async (opts?: AuthGateOptions): Promise<boolean> => {
      if (isAuthenticated) return true;
      try {
        await openLoginSheet({ promptMessage: opts?.promptMessage });
        return true;
      } catch {
        return false;
      }
    },
    [isAuthenticated, openLoginSheet]
  );

  return { isAuthenticated, isOrgMember, requireAuth };
}
