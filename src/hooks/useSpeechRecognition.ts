import { useCallback, useSyncExternalStore, useRef, useEffect } from 'react';

// ── Web Speech API type declarations ──

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

// ── Language mapping ──

const localeMap: Record<string, string> = {
  he: 'he-IL',
  en: 'en-US',
};

// ── Hook ──

interface UseSpeechRecognitionOptions {
  language: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

const SpeechRecognitionCtor =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

/**
 * External store for the listening state.
 * Lives outside React's lifecycle so StrictMode double-invoke can't reset it.
 */
function createListeningStore() {
  let listening = false;
  const listeners = new Set<() => void>();

  return {
    get: () => listening,
    set: (value: boolean) => {
      if (listening !== value) {
        listening = value;
        listeners.forEach((l) => l());
      }
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useSpeechRecognition({
  language,
  onResult,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const storeRef = useRef<ReturnType<typeof createListeningStore>>(undefined);
  if (!storeRef.current) {
    storeRef.current = createListeningStore();
  }
  const store = storeRef.current;

  const isListening = useSyncExternalStore(store.subscribe, store.get, () => false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultRef = useRef(onResult);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Timestamp when we set listening=true. Used to enforce minimum display time. */
  const startedAtRef = useRef(0);

  // Keep callback ref up-to-date
  onResultRef.current = onResult;

  /** Safely set store to false, respecting the minimum display duration. */
  const setFalse = useCallback(() => {
    const elapsed = Date.now() - startedAtRef.current;
    const MIN_DISPLAY_MS = 350;
    if (elapsed >= MIN_DISPLAY_MS) {
      store.set(false);
    } else {
      // Defer so the user sees the red indicator for at least 350ms
      setTimeout(() => store.set(false), MIN_DISPLAY_MS - elapsed);
    }
  }, [store]);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setFalse();
  }, [setFalse]);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionCtor) return;

    // Stop any previous session
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = localeMap[language] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (recognitionRef.current !== recognition) return;
      // Clear the safety timeout — recognition is running
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (recognitionRef.current !== recognition) return;
      let transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        if (result.isFinal) isFinal = true;
      }

      onResultRef.current?.(transcript, isFinal);
    };

    recognition.onerror = () => {
      if (recognitionRef.current !== recognition) return;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      recognitionRef.current = null;
      setFalse();
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      recognitionRef.current = null;
      setFalse();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      // Optimistic: show red indicator immediately
      startedAtRef.current = Date.now();
      store.set(true);

      // Safety timeout: if recognition never ends within 5s, reset.
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        }
        store.set(false);
        timeoutRef.current = null;
      }, 5000);
    } catch {
      recognitionRef.current = null;
    }
  }, [language, store, setFalse]);

  // Stop if language changes while listening
  const prevLangRef = useRef(language);
  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;
      if (store.get()) {
        stopListening();
      }
    }
  }, [language, stopListening, store]);

  return {
    isListening,
    isSupported: !!SpeechRecognitionCtor,
    startListening,
    stopListening,
  };
}
