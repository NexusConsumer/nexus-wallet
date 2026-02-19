import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useVouchers } from '../../hooks/useVouchers';
import VoucherCard from './VoucherCard';
import VoucherDetail from './VoucherDetail';
import Skeleton from '../ui/Skeleton';
import type { Voucher, VoucherCategory } from '../../types/voucher.types';

interface VoucherGridProps {
  category?: VoucherCategory;
  searchQuery: string;
}

export default function VoucherGrid({ category, searchQuery }: VoucherGridProps) {
  const { t } = useLanguage();
  const { data: vouchers, isLoading } = useVouchers(category);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const filtered = vouchers?.filter((v) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(query) ||
      v.titleHe.includes(query) ||
      v.merchantName.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant="rectangular" className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!filtered?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-text-secondary">{t.common.noResults}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((voucher) => (
          <VoucherCard key={voucher.id} voucher={voucher} onSelect={setSelectedVoucher} />
        ))}
      </div>

      {selectedVoucher && (
        <VoucherDetail voucher={selectedVoucher} onClose={() => setSelectedVoucher(null)} />
      )}
    </>
  );
}
