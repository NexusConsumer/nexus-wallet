import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthStore } from '../../stores/authStore';
import { useRegistrationStore } from '../../stores/registrationStore';
import { FlowTopBar } from './WelcomeNewPage';

const BULLETS = [
  { emoji: '🎖️', key: 'welcomeOrgBullet1' as const },
  { emoji: '⚡', key: 'welcomeOrgBullet2' as const },
  { emoji: '🔒', key: 'welcomeOrgBullet3' as const },
];

export default function WelcomeOrgPage() {
  const { lang = 'he' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  const organizationName = useAuthStore((s) => s.organizationName);
  const orgMember = useRegistrationStore((s) => s.orgMember);
  const startRegistration = useRegistrationStore((s) => s.startRegistration);
  const registrationPath = useRegistrationStore((s) => s.registrationPath);
  const phone = useRegistrationStore((s) => s.phone);

  const orgName = organizationName ?? orgMember?.organizationName ?? 'הארגון שלך';

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    navigate(`/${lang}/register/complete-profile`);
  };

  const handleSkip = () => {
    // Clear org affiliation and continue as direct user
    startRegistration({
      path: registrationPath ?? 'new-user',
      phone: phone ?? '',
      orgMember: null,
    });
    navigate(`/${lang}/register/complete-profile`);
  };

  const title = t.authFlow.welcomeOrgTitle.replace('{{orgName}}', orgName);
  const subtitle = t.authFlow.welcomeOrgSubtitle.replace('{{orgName}}', orgName);

  return (
    <div className="relative min-h-dvh w-full max-w-md mx-auto flex flex-col bg-white overflow-x-hidden">
      {/* Gradient hero */}
      <div
        className="flex-shrink-0 w-full flex flex-col justify-end pb-8 px-6 pt-0"
        style={{
          minHeight: '38vh',
          background: 'linear-gradient(135deg, #635bff 0%, #9c88ff 60%, #00d4ff 100%)',
        }}
      >
        <FlowTopBar step={1} total={2} />

        <div
          className="mt-2 transition-all duration-600 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <h1 className="text-3xl font-extrabold text-white drop-shadow mb-1">{title}</h1>
          <p className="text-sm text-white/80 leading-relaxed">{subtitle}</p>
        </div>
      </div>

      {/* White content */}
      <div className="flex-1 flex flex-col px-6 pt-6 pb-8">
        {/* Bullets */}
        <ul className="space-y-4 mb-8">
          {BULLETS.map(({ emoji, key }, i) => (
            <li
              key={key}
              className="flex items-start gap-3 transition-all duration-500 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(16px)',
                transitionDelay: `${100 + i * 100}ms`,
              }}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
              <span className="text-text-primary font-medium leading-snug text-sm">
                {t.authFlow[key]}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3">
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary-dark active:scale-[0.98] transition-all"
          >
            {t.authFlow.welcomeOrgCta}
          </button>
          <button
            onClick={handleSkip}
            className="w-full py-3 text-center text-sm text-text-muted hover:text-primary transition-colors"
          >
            {t.authFlow.welcomeOrgSkip}
          </button>
        </div>
      </div>
    </div>
  );
}
