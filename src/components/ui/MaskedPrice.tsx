import { useAuthGate } from '../../hooks/useAuthGate';
import { formatCurrency } from '../../utils/formatCurrency';
import { useLanguage } from '../../i18n/LanguageContext';

interface MaskedPriceProps {
  amount: number;
  currency?: string;
  className?: string;
  /** Show "Members only" hint below the masked price */
  showHint?: boolean;
  /** If provided, clicking the masked price triggers login with this message */
  authPrompt?: string;
}

export default function MaskedPrice({
  amount,
  currency = 'ILS',
  className = '',
  showHint = false,
  authPrompt,
}: MaskedPriceProps) {
  const { isAuthenticated, requireAuth } = useAuthGate();
  const { language } = useLanguage();
  const locale = language === 'he' ? 'he-IL' : 'en-IL';

  if (isAuthenticated) {
    return (
      <span className={className}>
        {formatCurrency(amount, currency, locale)}
      </span>
    );
  }

  const handleClick = authPrompt
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        requireAuth({ promptMessage: authPrompt });
      }
    : undefined;

  return (
    <span
      className={`${className} ${handleClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      ₪ ***
      {showHint && (
        <span className="text-[9px] text-primary font-medium block mt-0.5">
          {language === 'he' ? 'לחברים בלבד' : 'Members only'}
        </span>
      )}
    </span>
  );
}
