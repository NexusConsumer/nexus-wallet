import { useLanguage } from '../../i18n/LanguageContext';
import { cn } from '../../utils/cn';
import type { VoucherCategory } from '../../types/voucher.types';

const categories: { key: VoucherCategory | 'all'; emoji: string }[] = [
  { key: 'all', emoji: '✨' },
  { key: 'food', emoji: '🍔' },
  { key: 'shopping', emoji: '🛍️' },
  { key: 'entertainment', emoji: '🎬' },
  { key: 'travel', emoji: '✈️' },
  { key: 'health', emoji: '💊' },
  { key: 'education', emoji: '📚' },
  { key: 'tech', emoji: '💻' },
];

interface CategoryPillsProps {
  selected: VoucherCategory | undefined;
  onSelect: (category: VoucherCategory | undefined) => void;
}

export default function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  const { t } = useLanguage();

  const getLabel = (key: string) => {
    if (key === 'all') return t.store.allCategories;
    return t.store[key as keyof typeof t.store] || key;
  };

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 py-1">
      {categories.map(({ key, emoji }) => {
        const isActive = key === 'all' ? !selected : selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key === 'all' ? undefined : key as VoucherCategory)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
              isActive
                ? 'bg-text-primary text-white shadow-sm'
                : 'bg-white text-text-secondary border border-border hover:bg-border/50'
            )}
          >
            <span>{emoji}</span>
            <span>{getLabel(key)}</span>
          </button>
        );
      })}
    </div>
  );
}
