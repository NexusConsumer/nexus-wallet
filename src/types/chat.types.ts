import type { Voucher } from './voucher.types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Voucher[];
  suggestions?: string[];
  timestamp: Date;
}
