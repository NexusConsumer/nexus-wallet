import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatDate } from '../../utils/formatDate';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import VoucherRedeemSheet from './VoucherRedeemSheet';
import { cn } from '../../utils/cn';
import type { UserVoucher } from '../../types/voucher.types';

interface MyVoucherCardProps {
  userVoucher: UserVoucher;
}

export default function MyVoucherCard({ userVoucher }: MyVoucherCardProps) {
  const { t, language } = useLanguage();
  const locale = language === 'he' ? 'he-IL' : 'en-IL';
  const [showRedeem, setShowRedeem] = useState(false);

  const { voucher, status, expiresAt } = userVoucher;

  const statusBadge = {
    active: { variant: 'success' as const, label: t.wallet.active },
    used: { variant: 'default' as const, label: t.wallet.voucherUsed },
    expired: { variant: 'error' as const, label: t.wallet.voucherExpired },
  }[status];

  return (
    <>
      <Card
        padding="none"
        className={cn(status !== 'active' && 'opacity-60')}
      >
        <div className="flex gap-4 p-4">
          <div className="w-16 h-16 bg-surface rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
            {voucher.image}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="text-xs text-text-secondary">{voucher.merchantName}</p>
                <h4 className="text-sm font-semibold text-text-primary truncate">
                  {language === 'he' ? voucher.titleHe : voucher.title}
                </h4>
              </div>
              <Badge variant={statusBadge.variant} size="sm">{statusBadge.label}</Badge>
            </div>
            <p className="text-xs text-text-secondary mb-2">
              {t.wallet.expiresOn}: {formatDate(expiresAt, locale)}
            </p>
            {status === 'active' && (
              <Button size="sm" onClick={() => setShowRedeem(true)}>
                {t.wallet.redeem}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {showRedeem && (
        <VoucherRedeemSheet userVoucher={userVoucher} onClose={() => setShowRedeem(false)} />
      )}
    </>
  );
}
