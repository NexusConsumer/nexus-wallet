import { Globe } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { cn } from '../../utils/cn';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
        'text-sm font-medium text-text-secondary',
        'hover:bg-border/50 transition-colors'
      )}
    >
      <Globe size={16} />
      <span>{language === 'he' ? 'EN' : 'עב'}</span>
    </button>
  );
}
