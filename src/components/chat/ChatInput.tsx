import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { MicButton } from '../ui/MicButton';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { language } = useLanguage();
  const isHe = language === 'he';
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    // Small delay to let the sheet animate in
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="sticky bottom-0 bg-white border-t border-border px-4 py-3 flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isHe ? 'שאל אותי כל דבר...' : 'Ask me anything...'}
        disabled={disabled}
        className="flex-1 bg-surface rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-text-muted disabled:opacity-50 focus:ring-2 focus:ring-primary/30 transition-all"
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        className={`w-10 h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-30 hover:bg-primary-dark active:scale-95 transition-all ${value.trim() ? '' : 'hidden'}`}
      >
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: '20px' }}
        >
          send
        </span>
      </button>
      <div className={value.trim() ? 'hidden' : ''}>
        <MicButton size="md" onTranscript={setValue} onInterim={setValue} disabled={disabled} />
      </div>
    </div>
  );
}
