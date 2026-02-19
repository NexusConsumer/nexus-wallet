import { useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';

/**
 * Keeps the Zustand auth store in sync with Firebase Auth state.
 * - Refreshes the idToken when Firebase detects a token change.
 * - Logs the user out if the Firebase session expires.
 */
export default function FirebaseAuthSync({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const store = useAuthStore.getState();

      if (!user && store.isAuthenticated) {
        // Firebase session ended but Zustand still thinks we're logged in
        store.logout();
      } else if (user && store.isAuthenticated) {
        // Refresh the token (Firebase tokens expire after 1 hour)
        try {
          const token = await user.getIdToken(/* forceRefresh */ false);
          store.setToken(token);
        } catch {
          // Token refresh failed — force logout
          store.logout();
        }
      }
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}
