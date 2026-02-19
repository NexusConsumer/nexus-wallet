import { useLanguage } from '../../i18n/LanguageContext';
import { useTransactions } from '../../hooks/useTransactions';
import ActivityRow from './ActivityRow';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import type { Transaction } from '../../types/transaction.types';

interface ActivityListProps {
  filterType?: Transaction['type'];
}

export default function ActivityList({ filterType }: ActivityListProps) {
  const { t } = useLanguage();
  const { data: transactions, isLoading } = useTransactions(filterType);

  if (isLoading) {
    return (
      <Card padding="none">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="flex-1">
              <Skeleton className="h-3 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </Card>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-text-secondary">{t.activity.noTransactions}</p>
      </div>
    );
  }

  const safeTransactions = transactions ?? [];

  return (
    <Card padding="none">
      {safeTransactions.map((tx, index) => (
        <ActivityRow
          key={tx.id}
          transaction={tx}
          isLast={index === safeTransactions.length - 1}
        />
      ))}
    </Card>
  );
}
