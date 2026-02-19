import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useRecentTransactions } from '../../hooks/useTransactions';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelativeDate } from '../../utils/formatDate';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import { cn } from '../../utils/cn';

export default function RecentActivity() {
  const { t, language, isRTL } = useLanguage();
  const { lang = 'he' } = useParams();
  const navigate = useNavigate();
  const { data: transactions, isLoading } = useRecentTransactions(5);
  const locale = language === 'he' ? 'he-IL' : 'en-IL';

  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  if (isLoading) {
    return (
      <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <Skeleton className="h-4 w-32 mb-3" />
        <Card>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton variant="circular" className="w-10 h-10" />
              <div className="flex-1">
                <Skeleton className="h-3 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-text-secondary">{t.home.recentActivity}</h3>
        <button
          onClick={() => navigate(`/${lang}/activity`)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {t.common.seeAll}
          <Arrow size={14} />
        </button>
      </div>

      <Card padding="none">
        {(transactions ?? []).map((tx, index) => (
          <div
            key={tx.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3',
              index < ((transactions?.length ?? 0) - 1) && 'border-b border-border/50'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg flex-shrink-0">
              {tx.merchantLogo || (tx.type === 'bonus' ? '⭐' : tx.type === 'cashback' ? '💰' : '📋')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {language === 'he' ? tx.titleHe : tx.title}
              </p>
              <p className="text-xs text-text-secondary">
                {formatRelativeDate(tx.createdAt, locale)}
              </p>
            </div>
            <p className={cn(
              'text-sm font-semibold flex-shrink-0',
              tx.amount > 0 ? 'text-success' : tx.amount < 0 ? 'text-text-primary' : 'text-text-secondary'
            )}>
              {tx.amount > 0 ? '+' : ''}{tx.amount !== 0 ? formatCurrency(Math.abs(tx.amount), 'ILS', locale) : '—'}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
