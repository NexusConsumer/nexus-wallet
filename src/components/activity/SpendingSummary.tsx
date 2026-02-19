import { useLanguage } from '../../i18n/LanguageContext';
import { useWallet } from '../../hooks/useWallet';
import { formatCurrency } from '../../utils/formatCurrency';
import Card from '../ui/Card';

export default function SpendingSummary() {
  const { t, language } = useLanguage();
  const locale = language === 'he' ? 'he-IL' : 'en-IL';
  const { data: wallet } = useWallet();

  const stats = [
    { label: t.home.totalSpent, value: wallet?.totalSpent || 0, color: 'text-text-primary' },
    { label: t.home.totalEarned, value: wallet?.totalEarned || 0, color: 'text-success' },
    { label: t.home.totalSaved, value: wallet?.totalSaved || 0, color: 'text-primary' },
  ];

  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-secondary mb-3">{t.activity.monthlySummary}</h3>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className={`text-lg font-bold ${color}`}>
              {formatCurrency(value, 'ILS', locale)}
            </p>
            <p className="text-[11px] text-text-secondary mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
