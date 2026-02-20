import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useRegistrationStore } from '../stores/registrationStore';
import { useTenantStore } from '../stores/tenantStore';
import { useAuthStore } from '../stores/authStore';
import { completeProfile } from '../services/registration.service';

export default function RegisterProfilePage() {
  const { lang = 'he' } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isHe = language === 'he';
  const tenantConfig = useTenantStore((s) => s.config);
  const userId = useAuthStore((s) => s.userId);
  const authMethod = useAuthStore((s) => s.authMethod);
  const setProfileCompleted = useAuthStore((s) => s.setProfileCompleted);

  const {
    phone,
    orgMember,
    missingFields,
    profileData,
    setProfileData,
    registrationPath,
  } = useRegistrationStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneInput, setPhoneInput] = useState('');

  const showField = (field: string) => missingFields.includes(field);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (showField('firstName') && !profileData.firstName.trim()) {
      errs.firstName = isHe ? 'שדה חובה' : 'Required';
    }
    if (showField('lastName') && !profileData.lastName.trim()) {
      errs.lastName = isHe ? 'שדה חובה' : 'Required';
    }
    if (showField('email')) {
      if (!profileData.email.trim()) {
        errs.email = isHe ? 'שדה חובה' : 'Required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
        errs.email = isHe ? 'אימייל לא תקין' : 'Invalid email';
      }
    }
    if (showField('phone')) {
      const digits = phoneInput.replace(/\D/g, '');
      if (digits.length < 9) {
        errs.phone = isHe ? 'מספר טלפון לא תקין' : 'Invalid phone number';
      }
    }
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      await completeProfile(userId ?? '', profileData);

      // Mark profile as completed so returning users skip registration
      setProfileCompleted(true);

      // Check if questionnaire should be skipped
      const skipQuestionnaire = tenantConfig?.flowOverrides?.skipQuestionnaire;
      if (skipQuestionnaire) {
        // Done — go home
        useRegistrationStore.getState().completeRegistration();
        navigate(`/${lang}`, { replace: true });
      } else {
        navigate(`/${lang}/register/preferences`, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };


  const isOrgFlow =
    registrationPath === 'org-member-incomplete' ||
    registrationPath === 'org-member-complete';

  return (
    <div className="min-h-dvh bg-surface relative">
      {/* Tenant background image */}
      {tenantConfig?.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${tenantConfig.backgroundImage})` }}
        />
      )}

      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Header area */}
        <div className="pt-12 pb-6 px-6 text-center">
          {/* Tenant or Nexus logo */}
          {tenantConfig ? (
            <img
              src={tenantConfig.logo}
              alt={isHe ? tenantConfig.nameHe : tenantConfig.name}
              className="h-10 mx-auto mb-4 object-contain"
              onError={(e) => {
                // Fallback if logo fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
          )}

          <h1 className="text-xl font-bold text-text-primary mb-1">
            {t.registration.profileTitle}
          </h1>
          <p className="text-sm text-text-muted">
            {t.registration.profileSubtitle}
          </p>
        </div>

        {/* Org member badge */}
        {isOrgFlow && orgMember && (
          <div className="mx-6 mb-4 px-4 py-3 bg-primary/5 rounded-2xl border border-primary/20 flex items-center gap-3">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '20px' }}
            >
              verified
            </span>
            <span className="text-sm font-medium text-primary">
              {t.registration.joiningAs}{' '}
              <span className="font-bold">{orgMember.organizationName}</span>
            </span>
          </div>
        )}

        {/* Verified auth method badge */}
        <div className="mx-6 mb-4 px-4 py-3 bg-success/5 rounded-2xl border border-success/20 flex items-center gap-3">
          <span
            className="material-symbols-outlined text-success"
            style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span className="text-sm font-medium text-success">
            {authMethod === 'phone' ? t.registration.phoneConnected : t.registration.googleConnected}
            {authMethod === 'phone' && phone && (
              <span className="font-bold ms-1" dir="ltr">{phone}</span>
            )}
          </span>
        </div>

        {/* Form — only shows fields from missingFields */}
        <div className="flex-1 px-6 space-y-4">
          {/* First name */}
          {showField('firstName') && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t.registration.firstNameLabel}
              </label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => {
                  setProfileData({ firstName: e.target.value });
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                }}
                className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm bg-white outline-none transition-colors ${
                  errors.firstName
                    ? 'border-error'
                    : 'border-border focus:border-primary'
                }`}
                placeholder={t.registration.firstNameLabel}
              />
              {errors.firstName && (
                <p className="text-xs text-error mt-1">{errors.firstName}</p>
              )}
            </div>
          )}

          {/* Last name */}
          {showField('lastName') && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t.registration.lastNameLabel}
              </label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => {
                  setProfileData({ lastName: e.target.value });
                  if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                }}
                className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm bg-white outline-none transition-colors ${
                  errors.lastName
                    ? 'border-error'
                    : 'border-border focus:border-primary'
                }`}
                placeholder={t.registration.lastNameLabel}
              />
              {errors.lastName && (
                <p className="text-xs text-error mt-1">{errors.lastName}</p>
              )}
            </div>
          )}

          {/* Email */}
          {showField('email') && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t.registration.emailLabel}
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => {
                  setProfileData({ email: e.target.value });
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm bg-white outline-none transition-colors ${
                  errors.email
                    ? 'border-error'
                    : 'border-border focus:border-primary'
                }`}
                placeholder={t.registration.emailLabel}
                dir="ltr"
              />
              {errors.email && (
                <p className="text-xs text-error mt-1">{errors.email}</p>
              )}
            </div>
          )}

          {/* Phone input — shown when phone is a missing field (e.g. Google auth) */}
          {showField('phone') && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {t.registration.addPhoneNumber}
              </label>
              <div className={`flex items-center gap-2 border-2 rounded-2xl px-3 py-2.5 transition-colors focus-within:border-primary bg-white ${
                errors.phone ? 'border-error' : 'border-border'
              }`}>
                <span className="text-base flex-shrink-0">🇮🇱</span>
                <span className="text-xs text-text-secondary font-medium flex-shrink-0">
                  +972
                </span>
                <div className="w-px h-4 bg-border flex-shrink-0" />
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(formatPhone(e.target.value));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder={t.auth.phonePlaceholder}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted min-w-0"
                  dir="ltr"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-error mt-1">{errors.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="px-6 pt-6 pb-8">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="material-symbols-outlined animate-spin"
                  style={{ fontSize: '18px' }}
                >
                  progress_activity
                </span>
                {t.common.loading}
              </span>
            ) : (
              t.registration.continueButton
            )}
          </button>

          {/* Powered by Nexus */}
          <a
            href="https://www.nexuswallet.info/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-px mt-6 mb-2"
          >
            <img src={`/nexus-logo-animated-black.gif?t=${Date.now()}`} alt="Nexus" className="h-6" />
            <span className="text-[9px] text-black">Powered by</span>
          </a>
        </div>
      </div>
    </div>
  );
}
