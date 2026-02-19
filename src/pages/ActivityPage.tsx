import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import SpendingSummary from '../components/activity/SpendingSummary';
import ActivityFilters from '../components/activity/ActivityFilters';
import ActivityList from '../components/activity/ActivityList';
import type { Transaction } from '../types/transaction.types';

export default function ActivityPage() {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<Transaction['type'] | undefined>();

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">{t.activity.title}</h1>
      <SpendingSummary />
      <ActivityFilters selectedType={filterType} onTypeChange={setFilterType} />
      <ActivityList filterType={filterType} />
    </div>
  );
}
