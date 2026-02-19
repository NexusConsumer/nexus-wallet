import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthGate } from '../../hooks/useAuthGate';
import { formatCurrency } from '../../utils/formatCurrency';
import MaskedPrice from '../ui/MaskedPrice';
import Badge from '../ui/Badge';
import type { Voucher } from '../../types/voucher.types';

interface VoucherCardProps {
  voucher: Voucher;
  onSelect: (voucher: Voucher) => void;
}

export default function VoucherCard({ voucher, onSelect }: VoucherCardProps) {
  const { language, t } = useLanguage();
  const locale = language === 'he' ? 'he-IL' : 'en-IL';
  const { isAuthenticated } = useAuthGate();

  return (
    <button
      onClick={() => onSelect(voucher)}
      disabled={!voucher.inStock}
      className="w-full text-start bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {/* Image / Emoji area */}
      <div className="h-28 bg-surface flex items-center justify-center text-5xl relative">
        <span className="group-hover:scale-110 transition-transform duration-300">{voucher.image}</span>
        {/* Discount badge */}
        <div className="absolute top-2 end-2">
          <Badge variant="pink" size="sm">
            {voucher.discountPercent}% {t.store.discount}
          </Badge>
        </div>
        {/* Popular badge */}
        {voucher.popular && (
          <div className="absolute top-2 start-2">
            <Badge variant="purple" size="sm">🔥 {t.store.popular}</Badge>
          </div>
        )}
        {/* Out of stock overlay */}
        {!voucher.inStock && (
          <div className="absolute inset-0 bg-text-primary/40 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">{t.store.outOfStock}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs text-text-secondary mb-0.5">{voucher.merchantName}</p>
        <h4 className="text-sm font-semibold text-text-primary mb-2 line-clamp-1">
          {language === 'he' ? voucher.titleHe : voucher.title}
        </h4>
        <div className="flex items-center gap-2">
          <MaskedPrice
            amount={voucher.discountedPrice}
            className="text-base font-bold text-primary"
            authPrompt={t.auth.memberPricePrompt}
          />
          {isAuthenticated ? (
            <span className="text-xs text-text-muted line-through">
              {formatCurrency(voucher.originalPrice, 'ILS', locale)}
            </span>
          ) : (
            <span className="text-[9px] text-primary font-medium">
              {t.auth.membersOnly}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
