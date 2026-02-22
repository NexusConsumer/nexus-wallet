/**
 * FlowTestPage — דף טסט לבדיקת ה-Auth Flows
 * גש אליו ב: /:lang/auth-flow/test
 *
 * מסמלץ את 3 מצבי הזיהוי בלי להצטרך לעבור דרך Google/Phone Auth.
 */

import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useRegistrationStore } from '../../stores/registrationStore';

export default function FlowTestPage() {
  const { lang = 'he' } = useParams();
  const navigate = useNavigate();

  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const startRegistration = useRegistrationStore((s) => s.startRegistration);
  const resetRegistration = useRegistrationStore((s) => s.resetRegistration);

  const reset = () => {
    logout();
    resetRegistration();
  };

  // ─── Flow 1: Existing User ───────────────────────────────────────────
  const simulateExistingUser = () => {
    reset();
    login({
      token: 'mock-token-existing',
      userId: 'user-existing-123',
      method: 'google',
      isOrgMember: false,
    });
    // Existing user — no registration needed, go straight to welcome-back
    navigate(`/${lang}/auth-flow/welcome-back`);
  };

  const simulateExistingOrgUser = () => {
    reset();
    login({
      token: 'mock-token-existing-org',
      userId: 'user-existing-org-456',
      method: 'google',
      isOrgMember: true,
      organizationName: 'סלקום',
    });
    navigate(`/${lang}/auth-flow/welcome-back`);
  };

  // ─── Flow 2: New User ─────────────────────────────────────────────────
  const simulateNewUser = () => {
    reset();
    login({
      token: 'mock-token-new',
      userId: 'user-new-789',
      method: 'google',
      isOrgMember: false,
    });
    startRegistration({
      path: 'new-user',
      phone: '',
      missingFields: ['firstName', 'lastName', 'email', 'birthday'],
      returnTo: `/${lang}`,
    });
    navigate(`/${lang}/auth-flow/welcome-new`);
  };

  // ─── Flow 3: Pre-provisioned (Org) ────────────────────────────────────
  const simulatePreProvisioned = () => {
    reset();
    login({
      token: 'mock-token-org',
      userId: 'user-org-101',
      method: 'google',
      isOrgMember: true,
      organizationName: 'הפועל תל אביב',
    });
    startRegistration({
      path: 'org-member-incomplete',
      phone: '',
      orgMember: {
        organizationId: 'org-2',
        organizationName: 'הפועל תל אביב',
        firstName: 'יוסי',
        lastName: 'כהן',
      },
      missingFields: ['email', 'birthday'],
      returnTo: `/${lang}`,
    });
    navigate(`/${lang}/auth-flow/welcome-org`);
  };

  return (
    <div
      className="min-h-dvh w-full max-w-md mx-auto bg-surface flex flex-col px-5 py-8"
      dir="rtl"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-warning/10 text-warning px-3 py-1.5 rounded-full text-xs font-bold mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            bug_report
          </span>
          DEV ONLY
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary mb-1">בדיקת Auth Flows</h1>
        <p className="text-sm text-text-muted">
          לחץ על כפתור כדי לסמלץ סוג משתמש ולראות את ה-Flow המתאים
        </p>
      </div>

      {/* Current state */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-6 text-xs font-mono text-text-secondary">
        <p className="font-bold text-text-primary mb-1">מצב נוכחי:</p>
        <p>
          מחובר:{' '}
          <span className={isAuthenticated ? 'text-success' : 'text-error'}>
            {isAuthenticated ? '✅ כן' : '❌ לא'}
          </span>
        </p>
      </div>

      {/* Flow 1 */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center text-success text-xs font-bold">
            1
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary">Flow 1 — משתמש קיים</h2>
            <p className="text-xs text-text-muted">Welcome back + redirect אוטומטי</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={simulateExistingUser}
            className="w-full py-3 rounded-xl bg-success text-white text-sm font-semibold active:scale-[0.98] transition-all"
          >
            👤 משתמש קיים (ללא ארגון)
          </button>
          <button
            onClick={simulateExistingOrgUser}
            className="w-full py-3 rounded-xl bg-success/80 text-white text-sm font-semibold active:scale-[0.98] transition-all"
          >
            🏢 משתמש קיים + ארגון (סלקום)
          </button>
        </div>
      </div>

      {/* Flow 2 */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
            2
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary">Flow 2 — משתמש חדש</h2>
            <p className="text-xs text-text-muted">Welcome → איך הגעת → (ארגון) → השלמת פרטים</p>
          </div>
        </div>
        <button
          onClick={simulateNewUser}
          className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold active:scale-[0.98] transition-all"
        >
          🆕 משתמש חדש לגמרי
        </button>
      </div>

      {/* Flow 3 */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-accent-cyan/20 flex items-center justify-center text-primary text-xs font-bold">
            3
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary">Flow 3 — Pre-provisioned</h2>
            <p className="text-xs text-text-muted">נמצא ברשומות הארגון → Welcome ארגוני → השלמת פרטים</p>
          </div>
        </div>
        <button
          onClick={simulatePreProvisioned}
          className="w-full py-3 rounded-xl bg-text-primary text-white text-sm font-semibold active:scale-[0.98] transition-all"
        >
          🏅 Pre-provisioned (הפועל ת"א)
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={reset}
        className="w-full py-3 rounded-xl border-2 border-border text-text-muted text-sm font-semibold hover:border-error hover:text-error transition-all active:scale-[0.98]"
      >
        🔄 Reset — נקה state
      </button>

      {/* Quick links */}
      <div className="mt-6 pt-5 border-t border-border">
        <p className="text-xs font-bold text-text-muted mb-3">קישורים ישירים לדפים:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Welcome Back', path: 'welcome-back' },
            { label: 'Welcome New', path: 'welcome-new' },
            { label: 'How Did You Arrive', path: 'how-did-you-arrive' },
            { label: 'Select Org', path: 'select-org' },
            { label: 'Welcome Org', path: 'welcome-org' },
            { label: 'Complete Profile', path: `../../register/complete-profile` },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() =>
                navigate(
                  path.startsWith('.')
                    ? `/${lang}/register/complete-profile`
                    : `/${lang}/auth-flow/${path}`
                )
              }
              className="py-2 px-3 rounded-xl bg-surface border border-border text-text-secondary text-right hover:border-primary hover:text-primary transition-colors truncate"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
