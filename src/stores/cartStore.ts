import { create } from 'zustand';
import type { Voucher } from '../types/voucher.types';

interface CartItem {
  voucher: Voucher;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (voucher: Voucher) => void;
  removeItem: (voucherId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (voucher) => set((state) => {
    const existing = state.items.find(item => item.voucher.id === voucher.id);
    if (existing) {
      return {
        items: state.items.map(item =>
          item.voucher.id === voucher.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { items: [...state.items, { voucher, quantity: 1 }] };
  }),
  removeItem: (voucherId) => set((state) => ({
    items: state.items.filter(item => item.voucher.id !== voucherId),
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((sum, item) => sum + item.voucher.discountedPrice * item.quantity, 0),
  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
