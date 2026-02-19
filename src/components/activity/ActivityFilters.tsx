import { useLanguage } from '../../i18n/LanguageContext';
import { cn } from '../../utils/cn';
import type { Transaction } from '../../types/transaction.types';

interface ActivityFiltersProps {
  selectedType: Transaction['type'] | undefined;
  onTypeChange: (type: Transaction['type'] | undefined) => void;
}

const filters: { key: Transaction['type'] | 'all'; translationKey: string }[] = [
  { key: 'all', translationKey: 'allTransactions' },
  { key: 'purchase', translationKey: 'purchases' },
  { key: 'redemption', translationKey: 'redemptions' },
  { key: 'bonus', translationKey: 'bonuses' },
  { key: 'cashback', translationKey: 'cashbacks' },
  { key: 'refund', translationKey: 'refunds' },
];

export default function ActivityFilters({ selectedType, onTypeChange }: ActivityFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 py-1">
      {filters.map(({ key, translationKey }) => {
        const isActive = key === 'all' ? !selectedType : selectedType === key;
        return (
          <button
            key={key}
            onClick={() => onTypeChange(key === 'all' ? undefined : key as Transaction['type'])}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
              isActive
                ? 'bg-text-primary text-white'
                : 'bg-white text-text-secondary border border-border hover:bg-border/50'
            )}
          >
            {t.activity[translationKey as keyof typeof t.activity]}
          </button>
        );
      })}
    </div>
  );
}
