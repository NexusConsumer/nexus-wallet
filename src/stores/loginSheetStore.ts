import { create } from 'zustand';

export type LoginSheetStep = 'welcome' | 'phone' | 'otp' | 'consent' | 'success';

interface LoginSheetState {
  isOpen: boolean;
  step: LoginSheetStep;
  promptMessage: string | null;

  /** Internal callbacks for promise-based flow */
  _resolve: (() => void) | null;
  _reject: (() => void) | null;

  open: (opts?: { promptMessage?: string }) => Promise<void>;
  close: () => void;
  setStep: (step: LoginSheetStep) => void;
  completeLogin: () => void;
}

export const useLoginSheetStore = create<LoginSheetState>((set, get) => ({
  isOpen: false,
  step: 'welcome',
  promptMessage: null,
  _resolve: null,
  _reject: null,

  open: (opts) => {
    // If already open, return existing promise
    if (get().isOpen) {
      return new Promise<void>((resolve, reject) => {
        const prev = get();
        // Chain: when the existing flow completes, this one also completes
        const prevResolve = prev._resolve;
        const prevReject = prev._reject;
        set({
          _resolve: () => {
            prevResolve?.();
            resolve();
          },
          _reject: () => {
            prevReject?.();
            reject();
          },
        });
      });
    }

    return new Promise<void>((resolve, reject) => {
      set({
        isOpen: true,
        step: 'welcome',
        promptMessage: opts?.promptMessage ?? null,
        _resolve: resolve,
        _reject: reject,
      });
    });
  },

  close: () => {
    const { _reject } = get();
    _reject?.();
    set({
      isOpen: false,
      step: 'welcome',
      promptMessage: null,
      _resolve: null,
      _reject: null,
    });
  },

  setStep: (step) => set({ step }),

  completeLogin: () => {
    const { _resolve } = get();
    _resolve?.();
    set({
      isOpen: false,
      step: 'welcome',
      promptMessage: null,
      _resolve: null,
      _reject: null,
    });
  },
}));
