import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useTenantStore } from '../stores/tenantStore';
import { useRegistrationStore } from '../stores/registrationStore';
import { useAuthStore } from '../stores/authStore';
import { mockProcessMembershipFee } from '../mock/handlers/registration.handler';

export default function RegisterMembershipPage() {
  const { lang = 'he' } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isHe = language === 'he';
  const tenantConfig = useTenantStore((s) => s.config);
  const userId = useAuthStore((s) => s.userId);
  const setMembershipFeePaid = useRegistrationStore((s) => s.setMembershipFeePaid);

  const [isLoading, setIsLoading] = useState(false);

  if (!tenantConfig?.requiresMembershipFee) {
    // Shouldn't be on this page without a fee requirement
    navigate(`/${lang}/register/complete-profile`, { replace: true });
    return null;
  }

  const benefits = isHe
    ? tenantConfig.membershipBenefitsHe ?? tenantConfig.membershipBenefits ?? []
    : tenantConfig.membershipBenefits ?? [];

  const feeLabel = isHe
    ? tenantConfig.membershipFeeLabelHe ?? tenantConfig.membershipFeeLabel ?? ''
    : tenantConfig.membershipFeeLabel ?? '';

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const result = await mockProcessMembershipFee(
        userId ?? '',
        tenantConfig.membershipFeeAmount ?? 0
      );
      if (result.success) {
        setMembershipFeePaid(true);
        navigate(`/${lang}/register/complete-profile`, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface relative">
      {/* Tenant background image */}
      {tenantConfig.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-8"
          style={{ backgroundImage: `url(${tenantConfig.backgroundImage})` }}
        />
      )}

      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Header */}
        <div className="pt-12 pb-6 px-6 text-center">
          {/* Tenant logo */}
          <img
            src={tenantConfig.logo}
            alt={isHe ? tenantConfig.nameHe : tenantConfig.name}
            className="h-12 mx-auto mb-4 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />

          <h1 className="text-xl font-bold text-text-primary mb-1">
            {t.registration.membershipTitle}
          </h1>
          <p className="text-sm text-text-muted">
            {t.registration.membershipSubtitle}
          </p>
        </div>

        {/* Benefits */}
        <div className="mx-6 mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            {t.registration.membershipBenefitsTitle}
          </h3>
          <div className="space-y-3">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined text-success flex-shrink-0 mt-0.5"
                  style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="text-sm text-text-secondary">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price card */}
        <div className="mx-6 mb-8 p-5 bg-white rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                {t.registration.membershipPriceLabel}
              </p>
              <p className="text-xs text-text-muted">{feeLabel}</p>
            </div>
            <div className="text-2xl font-bold text-text-primary" dir="ltr">
              {tenantConfig.membershipFeeCurrency === 'ILS' ? '₪' : '$'}
              {tenantConfig.membershipFeeAmount?.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pay button */}
        <div className="px-6 pt-4 pb-8">
          <button
            onClick={handlePay}
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
              `${t.registration.membershipPayButton} — ${tenantConfig.membershipFeeCurrency === 'ILS' ? '₪' : '$'}${tenantConfig.membershipFeeAmount?.toFixed(2)}`
            )}
          </button>

          {/* Powered by Nexus */}
          <p className="text-[10px] text-text-muted/50 text-center mt-4">
            Powered by <span className="font-semibold">Nexus</span>
          </p>
        </div>
      </div>
    </div>
  );
}
