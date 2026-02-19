import { useState } from 'react';
import StoreHeader from '../components/store/StoreHeader';
import CategoryPills from '../components/store/CategoryPills';
import VoucherGrid from '../components/store/VoucherGrid';
import type { VoucherCategory } from '../types/voucher.types';

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<VoucherCategory | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4 animate-fade-in">
      <StoreHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />
      <VoucherGrid category={selectedCategory} searchQuery={searchQuery} />
    </div>
  );
}
