import { mockGetTransactions, mockGetRecentTransactions } from '../mock/handlers/transactions.handler';
import type { Transaction } from '../types/transaction.types';

export const transactionsApi = {
  getAll: (type?: Transaction['type']) => mockGetTransactions(type),
  getRecent: (limit?: number) => mockGetRecentTransactions(limit),
};
