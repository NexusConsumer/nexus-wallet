import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthGate } from '../../hooks/useAuthGate';

// Pastel background per action
const actionStyles: Record<string, { bg: string; iconColor: string }> = {
  buyVoucher: { bg: 'bg-orange-50', iconColor: 'text-orange-500' },
  rewards:    { bg: 'bg-purple-50', iconColor: 'text-purple-500' },
  offers:     { bg: 'bg-pink-50',   iconColor: 'text-pink-500' },
  scan:       { bg: 'bg-sky-50',    iconColor: 'text-sky-500' },
  card:       { bg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
};

const actions = [
  { key: 'buyVoucher', icon: 'local_offer', path: '/store', protected: false },
  { key: 'rewards', icon: 'stars', path: '/wallet', protected: true },
  { key: 'offers', icon: 'percent', path: '/store', protected: false },
  { key: 'scan', icon: 'storefront', path: '/wallet', protected: true },
  { key: 'card', icon: 'credit_card', path: '/activity', protected: true },
] as const;

export default function QuickActions() {
  const { t } = useLanguage();
  const { lang = 'he' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth } = useAuthGate();

  const handleAction = async (path: string, isProtected: boolean) => {
    if (isProtected && !isAuthenticated) {
      const authed = await requireAuth({ promptMessage: t.auth.memberPricePrompt });
      if (!authed) return;
    }
    navigate(`/${lang}${path}`);
  };

  return (
    <nav className="flex overflow-x-auto hide-scrollbar gap-4 px-5 py-4">
      {actions.map(({ key, icon, path, protected: isProtected }) => {
        const style = actionStyles[key] || { bg: 'bg-surface', iconColor: 'text-primary' };
        return (
          <button
            key={key}
            onClick={() => handleAction(path, isProtected)}
            className="flex flex-col items-center gap-2 shrink-0 active:scale-95 transition-transform duration-200"
          >
            <div
              className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center shadow-sm border-2 border-transparent hover:border-primary/40 transition-all ${style.bg}`}
            >
              <span
                className={`material-symbols-outlined ${style.iconColor} drop-shadow-sm`}
                style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-text-primary leading-tight text-center max-w-[72px]">
              {t.home[key as keyof typeof t.home]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
