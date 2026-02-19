import type { Voucher } from '../../types/voucher.types';
import { useLanguage } from '../../i18n/LanguageContext';
import MaskedPrice from '../ui/MaskedPrice';

interface ProductCardProps {
  voucher: Voucher;
  onSelect: (voucher: Voucher) => void;
}

export default function ProductCard({ voucher, onSelect }: ProductCardProps) {
  const { language } = useLanguage();
  const isHe = language === 'he';

  return (
    <button
      onClick={() => onSelect(voucher)}
      className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all text-start"
    >
      <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center text-lg flex-shrink-0">
        {voucher.image}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary truncate">
          {isHe ? voucher.titleHe : voucher.title}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">
          {voucher.merchantName}
        </p>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <MaskedPrice
          amount={voucher.discountedPrice}
          className="text-xs font-bold text-text-primary"
        />
        {voucher.discountPercent > 0 && (
          <span className="text-[9px] font-medium text-success mt-0.5">
            -{voucher.discountPercent}%
          </span>
        )}
      </div>
      <span
        className="material-symbols-outlined text-text-muted flex-shrink-0"
        style={{ fontSize: '16px' }}
      >
        chevron_right
      </span>
    </button>
  );
}
