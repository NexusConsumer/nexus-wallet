import { useLanguage } from '../../i18n/LanguageContext';
import { useMyVouchers } from '../../hooks/useMyVouchers';
import MyVoucherCard from './MyVoucherCard';
import Skeleton from '../ui/Skeleton';
import { cn } from '../../utils/cn';
import type { UserVoucher } from '../../types/voucher.types';

interface WalletTabsProps {
  activeTab: UserVoucher['status'];
  onTabChange: (tab: UserVoucher['status']) => void;
}

const tabs: { key: UserVoucher['status']; translationKey: 'active' | 'used' | 'expired' }[] = [
  { key: 'active', translationKey: 'active' },
  { key: 'used', translationKey: 'used' },
  { key: 'expired', translationKey: 'expired' },
];

export default function WalletTabs({ activeTab, onTabChange }: WalletTabsProps) {
  const { t } = useLanguage();
  const { data: vouchers, isLoading } = useMyVouchers();

  const filteredVouchers = vouchers?.filter(v => v.status === activeTab) || [];
  const counts = {
    active: vouchers?.filter(v => v.status === 'active').length || 0,
    used: vouchers?.filter(v => v.status === 'used').length || 0,
    expired: vouchers?.filter(v => v.status === 'expired').length || 0,
  };

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-4">
        {tabs.map(({ key, translationKey }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={cn(
              'flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200',
              activeTab === key
                ? 'bg-text-primary text-white shadow-sm'
                : 'bg-white text-text-secondary border border-border hover:bg-border/50'
            )}
          >
            {t.wallet[translationKey]} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <Skeleton key={i} variant="rectangular" className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">👛</p>
          <p className="text-text-secondary">{t.wallet.noVouchers}</p>
        </div>
      ) : (
        <div className="space-y-3 tab-content-enter">
          {filteredVouchers.map((uv) => (
            <MyVoucherCard key={uv.id} userVoucher={uv} />
          ))}
        </div>
      )}
    </div>
  );
}
