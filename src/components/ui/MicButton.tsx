import { useCallback } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useLanguage } from '../../i18n/LanguageContext';

interface MicButtonProps {
  /** Called with the final transcript */
  onTranscript: (text: string) => void;
  /** Called with interim (partial) transcript while user is still speaking */
  onInterim?: (text: string) => void;
  /** 'sm' for search bars, 'md' for chat input */
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export function MicButton({
  onTranscript,
  onInterim,
  size = 'sm',
  disabled = false,
  className = '',
}: MicButtonProps) {
  const { language } = useLanguage();

  const onResult = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (isFinal) {
        onTranscript(transcript);
      } else {
        onInterim?.(transcript);
      }
    },
    [onTranscript, onInterim],
  );

  const { isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition({ language, onResult });

  // Graceful degradation — hide button if browser doesn't support Speech API
  if (!isSupported) return null;

  const toggle = () => {
    if (disabled) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sizeClasses =
    size === 'md'
      ? 'w-10 h-10 text-[22px]'
      : 'w-7 h-7 text-[18px]';

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      className={`flex-none rounded-full flex items-center justify-center transition-all duration-200 ${sizeClasses} ${
        isListening
          ? 'bg-red-500 text-white animate-mic-pulse'
          : 'text-text-muted hover:text-text-secondary'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 'inherit' }}
      >
        mic
      </span>
    </button>
  );
}
