import { Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MicButton } from '../ui/MicButton';

interface StoreHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function StoreHeader({ searchQuery, onSearchChange }: StoreHeaderProps) {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-3">{t.store.title}</h1>
      <div className="relative">
        <Search size={18} className="absolute top-1/2 -translate-y-1/2 start-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.store.searchPlaceholder}
          className={`w-full ps-11 ${searchQuery ? 'pe-4' : 'pe-11'} py-3 bg-white rounded-xl border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
        />
        <div className={`absolute top-1/2 -translate-y-1/2 end-3 ${searchQuery ? 'hidden' : ''}`}>
          <MicButton size="sm" onTranscript={onSearchChange} onInterim={onSearchChange} />
        </div>
      </div>
    </div>
  );
}
