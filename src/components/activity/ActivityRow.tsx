import { useLanguage } from '../../i18n/LanguageContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelativeDate } from '../../utils/formatDate';
import Badge from '../ui/Badge';
import { cn } from '../../utils/cn';
import type { Transaction } from '../../types/transaction.types';

interface ActivityRowProps {
  transaction: Transaction;
  isLast: boolean;
}

export default function ActivityRow({ transaction: tx, isLast }: ActivityRowProps) {
  const { language, t } = useLanguage();
  const locale = language === 'he' ? 'he-IL' : 'en-IL';

  const statusBadge = {
    completed: null,
    pending: { variant: 'warning' as const, label: t.activity.pending },
    failed: { variant: 'error' as const, label: t.activity.failed },
  }[tx.status];

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', !isLast && 'border-b border-border/50')}>
      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg flex-shrink-0">
        {tx.merchantLogo || (tx.type === 'bonus' ? '⭐' : tx.type === 'cashback' ? '💰' : tx.type === 'refund' ? '↩️' : '📋')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-text-primary truncate">
            {language === 'he' ? tx.titleHe : tx.title}
          </p>
          {statusBadge && <Badge variant={statusBadge.variant} size="sm">{statusBadge.label}</Badge>}
        </div>
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
  );
}
